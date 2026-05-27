"""ConversationContext — multi-turn dialogue support (Phase 2).

Hook: PRE_INTENT — injects conversation history into query understanding.

Status: Phase 2 stub.
"""

from __future__ import annotations

import logging

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook

logger = logging.getLogger(__name__)


class ConversationContext(SkillBase):
    name = "conversation_context"
    version = "1.0.0"
    description = "Multi-turn conversation context injection — Phase 2"
    hook = SkillHook.PRE_INTENT
    priority = 5

    async def execute(self, ctx: SkillContext) -> SkillContext:
        # Phase 2 implementation pending
        return ctx
