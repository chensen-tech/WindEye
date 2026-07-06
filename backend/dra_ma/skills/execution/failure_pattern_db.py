"""FailurePatternDB — persistent failure pattern database for SmashAgent.

Hook: PRE_HEAL, POST_HEAL

Problem: SmashAgent._cache is in-memory and process-lifetime only. Restarting
the server loses all learned healing patterns. Also, the cache only does exact
template matching — it can't recognize structurally similar failures.

Solution:
  1. Persist failure patterns to a JSON file on disk.
  2. Upgrade matching to semantic-level: extract structural features from
     failed Cypher (relation types, direction, label constraints) and match
     against known patterns using similarity scoring.
  3. For known patterns with high success rate, skip the LLM call entirely
     and apply the stored fix strategy directly.
  4. Track success/failure counts per pattern and auto-retire patterns
     that fall below a minimum success rate.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook
from dra_ma.skills.config import get_skill_config

logger = logging.getLogger(__name__)

# ── Cypher feature extraction ───────────────────────────────────────────────


def extract_cypher_features(cypher: str) -> Dict[str, Any]:
    """Extract structural features from a Cypher query for pattern matching.

    Returns a dict of features that can be compared for similarity:
      - labels: set of node labels used
      - rel_types: set of relationship types used
      - is_directed: whether the query uses directed matching (-->)
      - has_where: whether a WHERE clause is present
      - has_limit: whether LIMIT is specified
      - node_count: number of node variables
      - rel_count: number of relationship variables
    """
    features: Dict[str, Any] = {}

    # Node labels: MATCH (n:Label) or MATCH (n:Label1:Label2)
    label_matches = re.findall(r"\([^)]*?:(\w+(?::\w+)*)\)", cypher)
    features["labels"] = sorted(set(
        lbl for group in label_matches for lbl in group.split(":")
    ))

    # Relationship types: -[:TYPE]- or -[:TYPE]->
    rel_matches = re.findall(r"\[:([A-Za-z_]+)\]", cypher)
    features["rel_types"] = sorted(set(rel_matches))

    # Direction
    features["is_directed"] = "->" in cypher or "<-" in cypher

    # Clauses
    features["has_where"] = bool(re.search(r"\bWHERE\b", cypher, re.IGNORECASE))
    features["has_limit"] = bool(re.search(r"\bLIMIT\b", cypher, re.IGNORECASE))
    features["has_distinct"] = bool(re.search(r"\bDISTINCT\b", cypher, re.IGNORECASE))

    # Counts
    features["node_count"] = len(re.findall(r"\(\w*", cypher))
    features["rel_count"] = len(rel_matches)

    return features


def compute_feature_hash(features: Dict[str, Any]) -> str:
    """Compute a stable hash from Cypher features for pattern lookup."""
    canonical = json.dumps(features, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]


# ── Pattern store ───────────────────────────────────────────────────────────


class PatternStore:
    """Persistent JSON-backed store for failure→fix patterns."""

    def __init__(self, db_path: str = "") -> None:
        if not db_path:
            cfg = get_skill_config("failure_pattern_db")
            db_path = cfg.get("db_path", "dra_ma/skills/.cache/failure_patterns.json")

        # Resolve relative to project root
        if not os.path.isabs(db_path):
            db_path = str(Path(__file__).parent.parent.parent / ".cache" / "failure_patterns.json")

        self._path = Path(db_path)
        self._patterns: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if self._path.exists():
            try:
                with open(self._path, "r", encoding="utf-8") as f:
                    self._patterns = json.load(f)
                logger.info(f"[PatternStore] Loaded {len(self._patterns)} patterns from {self._path}")
            except Exception as exc:
                logger.warning(f"[PatternStore] Failed to load: {exc}")
                self._patterns = {}

    def _save(self) -> None:
        try:
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(self._patterns, f, ensure_ascii=False, indent=2)
        except Exception as exc:
            logger.error(f"[PatternStore] Failed to save: {exc}")

    def find(self, cypher: str, error_type: str) -> Optional[Dict[str, Any]]:
        """Find a matching pattern for the given failed Cypher.

        Uses feature-based similarity: exact label/rel-type match first,
        then falls back to partial overlap scoring.
        """
        features = extract_cypher_features(cypher)
        feature_hash = compute_feature_hash(features)

        # Exact feature hash match
        if feature_hash in self._patterns:
            pattern = self._patterns[feature_hash]
            if pattern.get("error_type") == error_type or error_type == "any":
                return pattern

        # Partial overlap match (same rel types, similar structure)
        best_score = 0.0
        best_pattern: Optional[Dict[str, Any]] = None
        for phash, pattern in self._patterns.items():
            if pattern.get("error_type") != error_type and error_type != "any":
                continue
            pf = pattern.get("features", {})
            score = self._similarity(features, pf)
            if score > best_score and score >= 0.7:
                best_score = score
                best_pattern = pattern

        if best_pattern:
            logger.info(
                f"[PatternStore] Partial match: score={best_score:.2f}, "
                f"pattern_hash={best_pattern.get('feature_hash', '?')}"
            )

        return best_pattern

    def save(self, cypher: str, error_type: str, fix_strategy: str,
             error_log: str = "") -> None:
        """Save a new failure→fix pattern."""
        features = extract_cypher_features(cypher)
        feature_hash = compute_feature_hash(features)

        existing = self._patterns.get(feature_hash, {})
        success_count = existing.get("success_count", 0) + 1

        self._patterns[feature_hash] = {
            "feature_hash": feature_hash,
            "features": features,
            "error_type": error_type,
            "fix_strategy": fix_strategy,
            "cypher_template": self._template_cypher(cypher),
            "error_log_sample": error_log[:200],
            "success_count": success_count,
            "fail_count": existing.get("fail_count", 0),
            "last_used": time.time(),
            "created_at": existing.get("created_at", time.time()),
        }

        # Prune old patterns if over limit
        cfg = get_skill_config("failure_pattern_db")
        max_patterns = cfg.get("max_patterns", 500)
        if len(self._patterns) > max_patterns:
            sorted_patterns = sorted(
                self._patterns.items(),
                key=lambda kv: (kv[1].get("success_count", 0), kv[1].get("last_used", 0)),
            )
            self._patterns = dict(sorted_patterns[-max_patterns:])

        self._save()
        logger.info(f"[PatternStore] Saved pattern {feature_hash} (total: {len(self._patterns)})")

    def record_result(self, cypher: str, success: bool) -> None:
        """Update success/fail counters for an existing pattern."""
        features = extract_cypher_features(cypher)
        feature_hash = compute_feature_hash(features)
        if feature_hash in self._patterns:
            if success:
                self._patterns[feature_hash]["success_count"] += 1
                self._patterns[feature_hash]["last_used"] = time.time()
            else:
                self._patterns[feature_hash]["fail_count"] += 1
            self._save()

    @staticmethod
    def _similarity(f1: Dict[str, Any], f2: Dict[str, Any]) -> float:
        """Compute Jaccard-like similarity between two Cypher feature sets."""
        score = 0.0
        weights = {"rel_types": 0.35, "labels": 0.25, "is_directed": 0.15,
                    "has_where": 0.10, "node_count": 0.05, "rel_count": 0.05,
                    "has_limit": 0.05}

        for key, weight in weights.items():
            v1 = f1.get(key)
            v2 = f2.get(key)
            if v1 is None or v2 is None:
                continue
            if isinstance(v1, list) and isinstance(v2, list):
                if not v1 and not v2:
                    score += weight
                elif v1 and v2:
                    overlap = len(set(v1) & set(v2))
                    total = len(set(v1) | set(v2))
                    score += weight * (overlap / total if total > 0 else 0)
            elif isinstance(v1, bool) and isinstance(v2, bool):
                score += weight * (1.0 if v1 == v2 else 0.0)
            elif isinstance(v1, (int, float)) and isinstance(v2, (int, float)):
                max_val = max(abs(v1), abs(v2))
                score += weight * (1.0 - min(abs(v1 - v2) / max_val, 1.0) if max_val > 0 else 1.0)

        return score

    @staticmethod
    def _template_cypher(cypher: str) -> str:
        """Create a parameterized template from a Cypher query."""
        # Replace quoted strings with placeholders
        templated = re.sub(r"'[^']*'", "'[VALUE]'", cypher)
        templated = re.sub(r'"([^"]*)"', '"[VALUE]"', templated)
        return templated


# ── Skill ────────────────────────────────────────────────────────────────────


class FailurePatternDB(SkillBase):
    name = "failure_pattern_db"
    version = "1.0.0"
    description = "Persistent failure pattern database for SmashAgent — skips LLM calls for known failure modes"
    hook = SkillHook.PRE_HEAL
    priority = 10

    def __init__(self, db_path: str = "") -> None:
        super().__init__()
        self._store = PatternStore(db_path)

    async def execute(self, ctx: SkillContext) -> SkillContext:
        """Check for a known failure pattern before invoking SmashAgent.

        If a matching pattern with high success rate is found, inject the
        known fix into ctx.metadata so the engine can skip the LLM call.
        """
        cypher = ctx.cypher
        error_log = ctx.error_log

        if not cypher:
            return ctx

        # Classify error type from error_log
        error_type = self._classify_error(error_log)

        # Look up known pattern
        pattern = self._store.find(cypher, error_type)
        if pattern:
            success_rate = self._success_rate(pattern)
            logger.info(
                f"[FailurePatternDB] Found pattern for error_type='{error_type}' "
                f"(success_rate={success_rate:.0%}, "
                f"success={pattern.get('success_count', 0)}, "
                f"fail={pattern.get('fail_count', 0)})"
            )

            if success_rate >= 0.5:
                ctx.metadata["failure_pattern"] = {
                    "matched": True,
                    "fix_strategy": pattern["fix_strategy"],
                    "success_rate": success_rate,
                    "skip_llm": True,
                }
                logger.info("[FailurePatternDB] Recommending skip-LLM fix")
            else:
                ctx.metadata["failure_pattern"] = {
                    "matched": True,
                    "fix_strategy": pattern["fix_strategy"],
                    "success_rate": success_rate,
                    "skip_llm": False,
                }

        return ctx

    # ── Helpers ─────────────────────────────────────────────────────────

    @staticmethod
    def _classify_error(error_log: str) -> str:
        """Classify error type from error log string."""
        if not error_log:
            return "empty_result"
        log_lower = error_log.lower()
        if "timeout" in log_lower or "time out" in log_lower:
            return "timeout"
        if "schema" in log_lower or "syntax" in log_lower or "not found" in log_lower:
            return "schema_error"
        if "connection" in log_lower or "refused" in log_lower:
            return "connection_error"
        if "empty" in log_lower or "no results" in log_lower:
            return "empty_result"
        return "unknown"

    @staticmethod
    def _success_rate(pattern: Dict[str, Any]) -> float:
        total = pattern.get("success_count", 0) + pattern.get("fail_count", 0)
        if total == 0:
            return 0.0
        return pattern.get("success_count", 0) / total

    @property
    def store(self) -> PatternStore:
        """Expose the pattern store for direct access by SmashAgent integration."""
        return self._store
