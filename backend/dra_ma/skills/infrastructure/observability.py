"""Observability — agent performance monitoring and tracing (Phase 3).

Infrastructure skill. Collects per-agent latency, success rates, and
token usage. Not hooked — provides monitoring utilities.

Status: Phase 3 stub.
"""

from __future__ import annotations

import logging

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook

logger = logging.getLogger(__name__)


class Observability(SkillBase):
    name = "observability"
    version = "1.0.0"
    description = "Per-agent latency, success rate, and token usage monitoring — Phase 3"
    hook = SkillHook.ON_COMPLETE
    priority = 100

    async def execute(self, ctx: SkillContext) -> SkillContext:
        return ctx
