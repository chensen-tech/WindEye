"""DRA-MA Pluggable Skill System.

Skills are lightweight, self-contained modules that hook into the DRA-MA
pipeline at defined interception points to enhance reasoning accuracy and
efficiency.

Usage:
    from dra_ma.skills import SkillManager, SkillContext, SkillHook
    from dra_ma.skills.perception import EntityResolver
    from dra_ma.skills.execution import FailurePatternDB
    from dra_ma.skills.consensus import PersonaSelector, EntityCleaner

    mgr = SkillManager()
    mgr.register(EntityResolver())
    mgr.register(FailurePatternDB())
    mgr.register(PersonaSelector())
    mgr.register(EntityCleaner())

    ctx = SkillContext(query="...")
    ctx = await mgr.execute_hook(SkillHook.PRE_INTENT, ctx)
"""

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook
from dra_ma.skills.registry import SkillManager, SkillRegistry
from dra_ma.skills.config import load_skill_config, get_skill_config

__all__ = [
    "SkillBase",
    "SkillContext",
    "SkillHook",
    "SkillManager",
    "SkillRegistry",
    "load_skill_config",
    "get_skill_config",
]
