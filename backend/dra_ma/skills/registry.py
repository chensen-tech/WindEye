"""Skill Registry & Manager — central orchestration for pluggable skills.

SkillRegistry: stores skill metadata for discovery.
SkillManager: orchestrates skill execution at pipeline hook points.
"""

from __future__ import annotations

import logging
import time
from collections import defaultdict
from typing import Any, Dict, List, Optional

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook
from dra_ma.skills.config import get_skill_config

logger = logging.getLogger(__name__)


class SkillRegistry:
    """Central registry for skill discovery and metadata.

    Skills are registered by name and indexed by hook point for fast lookup.
    """

    def __init__(self) -> None:
        self._skills: Dict[str, SkillBase] = {}
        self._by_hook: Dict[SkillHook, List[SkillBase]] = defaultdict(list)

    def register(self, skill: SkillBase) -> None:
        """Register a skill instance. Replaces any existing skill with the same name."""
        if skill.name in self._skills:
            old = self._skills[skill.name]
            self._by_hook[old.hook].remove(old)
            logger.info(f"[SkillRegistry] Replaced: {old.name}")

        self._skills[skill.name] = skill
        self._by_hook[skill.hook].append(skill)
        self._by_hook[skill.hook].sort(key=lambda s: s.priority)
        logger.info(f"[SkillRegistry] Registered: {skill}")

    def unregister(self, skill_name: str) -> Optional[SkillBase]:
        """Remove a skill by name. Returns the removed skill or None."""
        skill = self._skills.pop(skill_name, None)
        if skill and skill in self._by_hook[skill.hook]:
            self._by_hook[skill.hook].remove(skill)
            logger.info(f"[SkillRegistry] Unregistered: {skill_name}")
        return skill

    def get(self, name: str) -> Optional[SkillBase]:
        return self._skills.get(name)

    def get_for_hook(self, hook: SkillHook) -> List[SkillBase]:
        """Return all skills registered for a hook point, sorted by priority."""
        return list(self._by_hook.get(hook, []))

    def list_all(self) -> List[SkillBase]:
        return list(self._skills.values())

    def clear(self) -> None:
        self._skills.clear()
        self._by_hook.clear()

    def __len__(self) -> int:
        return len(self._skills)

    def __contains__(self, name: str) -> bool:
        return name in self._skills


class SkillManager:
    """Orchestrates skill execution at pipeline hook points.

    Usage:
        mgr = SkillManager()
        mgr.register(EntityResolver())
        mgr.register(FailurePatternDB())

        ctx = SkillContext(query="...")
        ctx = await mgr.execute_hook(SkillHook.PRE_INTENT, ctx)
    """

    def __init__(self, feature_flags: Optional[Dict[str, Any]] = None) -> None:
        self.registry = SkillRegistry()
        self._ablation = feature_flags or {}
        self._stats: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {"calls": 0, "total_ms": 0.0, "errors": 0}
        )

    # ── Registration ─────────────────────────────────────────────────────

    def register(self, skill: SkillBase) -> None:
        """Register a skill and apply config overrides."""
        cfg = get_skill_config(skill.name)
        if cfg:
            if "enabled" in cfg:
                skill.enabled = cfg["enabled"]
            if "priority" in cfg:
                skill.priority = cfg["priority"]

        # Ablation flags can force-disable skills
        ablation_key = f"no_{skill.name}"
        if self._ablation.get(ablation_key, False):
            skill.enabled = False
            logger.info(f"[SkillManager] Ablation: {skill.name} DISABLED by feature flag")

        self.registry.register(skill)

    def register_all(self, skills: List[SkillBase]) -> None:
        for s in skills:
            self.register(s)

    def unregister(self, name: str) -> Optional[SkillBase]:
        return self.registry.unregister(name)

    def enable_skill(self, name: str) -> None:
        skill = self.registry.get(name)
        if skill:
            skill.enabled = True

    def disable_skill(self, name: str) -> None:
        skill = self.registry.get(name)
        if skill:
            skill.enabled = False

    # ── Execution ────────────────────────────────────────────────────────

    async def execute_hook(self, hook: SkillHook, ctx: SkillContext) -> SkillContext:
        """Execute all enabled skills registered for `hook` in priority order.

        Each skill receives the context from the previous skill, forming a
        processing chain. If a skill raises an exception, it is logged and
        the chain continues with the next skill.
        """
        skills = self.registry.get_for_hook(hook)
        if not skills:
            return ctx

        for skill in skills:
            if not skill.can_execute(ctx):
                continue

            t0 = time.perf_counter()
            try:
                ctx = await skill.execute(ctx)
                elapsed_ms = (time.perf_counter() - t0) * 1000
                self._stats[skill.name]["calls"] += 1
                self._stats[skill.name]["total_ms"] += elapsed_ms
                logger.debug(
                    f"[SkillManager] {skill.name} @ {hook.value} "
                    f"completed in {elapsed_ms:.1f}ms"
                )
            except Exception as exc:
                elapsed_ms = (time.perf_counter() - t0) * 1000
                self._stats[skill.name]["errors"] += 1
                logger.error(
                    f"[SkillManager] {skill.name} @ {hook.value} "
                    f"FAILED after {elapsed_ms:.1f}ms: {exc}",
                    exc_info=True,
                )

        return ctx

    # ── Introspection ────────────────────────────────────────────────────

    def get_skills_for_hook(self, hook: SkillHook) -> List[SkillBase]:
        return self.registry.get_for_hook(hook)

    def list_skills(self) -> List[SkillBase]:
        return self.registry.list_all()

    def get_stats(self) -> Dict[str, Any]:
        """Return per-skill execution statistics."""
        result = {}
        for name, stats in self._stats.items():
            skill = self.registry.get(name)
            calls = stats["calls"]
            avg_ms = stats["total_ms"] / calls if calls > 0 else 0
            result[name] = {
                "calls": calls,
                "avg_ms": round(avg_ms, 1),
                "errors": stats["errors"],
                "enabled": skill.enabled if skill else False,
                "hook": skill.hook.value if skill else "unknown",
            }
        return result

    def summary(self) -> str:
        """Return a human-readable summary of registered skills."""
        lines = [f"SkillManager: {len(self.registry)} skills registered"]
        for hook in SkillHook:
            skills = self.registry.get_for_hook(hook)
            if skills:
                lines.append(f"  [{hook.value}]")
                for s in skills:
                    status = "+" if s.enabled else "-"
                    lines.append(f"    {status} {s.name} (pri={s.priority}) — {s.description[:60]}")
        return "\n".join(lines)
