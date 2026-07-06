"""Skill configuration management.

Loads and manages skill-level configuration from JSON files and environment.
Supports per-skill feature flags, priority overrides, and parameter tuning.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

DEFAULT_SKILL_CONFIG: Dict[str, Any] = {
    "entity_resolver": {
        "enabled": True,
        "priority": 10,
        "fuzzy_match_threshold": 0.8,
        "max_candidates": 5,
    },
    "failure_pattern_db": {
        "enabled": True,
        "priority": 10,
        "db_path": "dra_ma/skills/.cache/failure_patterns.json",
        "min_success_rate": 0.5,
        "max_patterns": 500,
    },
    "persona_selector": {
        "enabled": True,
        "priority": 5,
        "personas": {
            "MetaQA": "movie_qa",
            "FinancialRegulatoryKG": "financial_risk",
            "WebQSP": "general_knowledge",
        },
    },
    "entity_cleaner": {
        "enabled": True,
        "priority": 20,
        "min_entity_length": 2,
        "max_entity_length": 200,
        "enable_llm_fallback": True,
    },
    "complexity_classifier": {
        "enabled": False,  # Phase 2 — off by default
        "priority": 15,
        "llm_fallback_threshold": 0.7,
    },
    "relation_relevance": {
        "enabled": False,
        "priority": 10,
        "sample_size": 3,
        "cache_ttl_seconds": 300,
    },
    "feedback_loop": {
        "enabled": False,
        "priority": 20,
        "max_retries": 1,
        "score_threshold": 0.5,
    },
    "conversation_context": {
        "enabled": False,
        "priority": 5,
        "max_history_turns": 3,
    },
}


def load_skill_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Load skill configuration, merging defaults with file-based overrides.

    Resolution order (later wins):
      1. DEFAULT_SKILL_CONFIG (hardcoded defaults)
      2. skills_config.json (project-level overrides)
      3. SKILL_<NAME>_ENABLED env vars (runtime toggles)
    """
    config = dict(DEFAULT_SKILL_CONFIG)

    if config_path is None:
        config_path = os.environ.get(
            "SKILL_CONFIG_PATH",
            str(Path(__file__).parent / "skills_config.json"),
        )

    if os.path.isfile(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                file_config = json.load(f)
            for skill_name, skill_cfg in file_config.items():
                if skill_name in config:
                    config[skill_name].update(skill_cfg)
                else:
                    config[skill_name] = skill_cfg
            logger.info(f"[SkillConfig] Loaded overrides from {config_path}")
        except Exception as exc:
            logger.warning(f"[SkillConfig] Failed to load {config_path}: {exc}")

    # Env-var overrides: SKILL_<NAME>_ENABLED=true/false
    for skill_name in list(config.keys()):
        env_key = f"SKILL_{skill_name.upper()}_ENABLED"
        env_val = os.environ.get(env_key, "").lower()
        if env_val in ("true", "1", "yes"):
            config[skill_name]["enabled"] = True
            logger.info(f"[SkillConfig] {skill_name} ENABLED via {env_key}")
        elif env_val in ("false", "0", "no"):
            config[skill_name]["enabled"] = False
            logger.info(f"[SkillConfig] {skill_name} DISABLED via {env_key}")

    return config


def get_skill_config(skill_name: str) -> Dict[str, Any]:
    """Get configuration for a specific skill (on-demand lazy load)."""
    config = load_skill_config()
    return config.get(skill_name, {})
