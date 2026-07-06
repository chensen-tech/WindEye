"""ExplanationGenerator — reasoning path explainability (Phase 3).

Hook: POST_NLG — enriches the final response with reasoning trace.

Status: Phase 3 stub.
"""

from __future__ import annotations

import logging

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook

logger = logging.getLogger(__name__)


class ExplanationGenerator(SkillBase):
    name = "explanation_generator"
    version = "1.0.0"
    description = "Reasoning path explainability generation — Phase 3"
    hook = SkillHook.POST_NLG
    priority = 30

    async def execute(self, ctx: SkillContext) -> SkillContext:
        # Phase 3 implementation pending
        return ctx
