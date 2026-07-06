"""PersonaSelector — dataset-aware persona selection for agents.

Hook: PRE_VERIFY, PRE_NLG, PRE_AGGREGATE

Problem: VerifierAgent's system prompt is hardcoded to "电影知识事实校验智能体"
(movie domain), and AggregatorAgent's to "电影推荐与问答助手" — regardless of
the actual dataset. This breaks when running on FinancialRegulatoryKG.

Solution:
  1. Detect the active dataset from OntologyRegistry.
  2. Select the appropriate persona configuration (prompt prefix, domain
     vocabulary, verification criteria).
  3. Inject the persona into ctx.metadata so downstream agents can use it.
  4. Support extension via config for new datasets.
"""

from __future__ import annotations

import logging
from typing import Dict

from dra_ma.skills.base import SkillBase, SkillContext, SkillHook
from dra_ma.skills.config import get_skill_config
from kg_construction.ontology.ontology_registry import OntologyRegistry

logger = logging.getLogger(__name__)

# ── Persona definitions ─────────────────────────────────────────────────────

PERSONAS: Dict[str, Dict[str, str]] = {
    "movie_qa": {
        "dataset_match": "MetaQA",
        "domain_name": "电影知识图谱",
        "verifier_persona": "你是一个电影知识事实校验智能体。",
        "aggregator_persona": "你是一个专业的电影推荐与问答助手。",
        "entity_types": "film, actor, director, country, language, genre, person",
        "example_entities": "电影、演员、导演、国家、语言、类型",
    },
    "financial_risk": {
        "dataset_match": "FinancialRegulatoryKG",
        "domain_name": "金融风控知识图谱",
        "verifier_persona": "你是一个金融风控事实校验智能体。你的任务是验证从图谱中检索出的风险传导路径、企业关联和合规信息在事实逻辑上是否正确。",
        "aggregator_persona": "你是一个专业的金融风险分析助手。你的任务是基于知识图谱的风险传导推理结果，向用户提供准确的风险分析回答。",
        "entity_types": "Company, Person, Event, RiskFeature, Regulation, Action, PFCOMPANY, PFUND, SECURITY",
        "example_entities": "企业、自然人、风险事件、风险特征、法规、处置措施",
    },
    "general_knowledge": {
        "dataset_match": "WebQSP",
        "domain_name": "通用知识图谱",
        "verifier_persona": "你是一个通用知识事实校验智能体。",
        "aggregator_persona": "你是一个知识问答助手，基于知识图谱推理结果回答用户问题。",
        "entity_types": "any",
        "example_entities": "任意实体类型",
    },
}

# Maps dataset_name (from OntologyRegistry) to persona key
DATASET_PERSONA_MAP: Dict[str, str] = {
    "MetaQA": "movie_qa",
    "FinancialRegulatoryKG": "financial_risk",
    "WebQSP": "general_knowledge",
}


class PersonaSelector(SkillBase):
    name = "persona_selector"
    version = "1.0.0"
    description = "Selects dataset-appropriate agent personas for Verifier and Aggregator agents"
    hook = SkillHook.PRE_VERIFY
    priority = 5

    async def execute(self, ctx: SkillContext) -> SkillContext:
        """Detect dataset and inject appropriate persona into context metadata.

        Idempotent: if persona is already set, skip.
        """
        if ctx.metadata.get("persona"):
            return ctx

        dataset_name = self._detect_dataset()
        persona_key = DATASET_PERSONA_MAP.get(dataset_name, "general_knowledge")
        persona = PERSONAS.get(persona_key, PERSONAS["general_knowledge"])

        # Allow config override
        cfg = get_skill_config("persona_selector")
        custom_personas = cfg.get("personas", {})
        if dataset_name in custom_personas:
            override_key = custom_personas[dataset_name]
            if override_key in PERSONAS:
                persona = PERSONAS[override_key]
                persona_key = override_key

        logger.info(
            f"[PersonaSelector] Dataset='{dataset_name}' -> persona='{persona_key}' "
            f"({persona['domain_name']})"
        )

        ctx.dataset_name = dataset_name
        ctx.metadata["persona"] = {
            "key": persona_key,
            "domain_name": persona["domain_name"],
            "verifier_persona": persona["verifier_persona"],
            "aggregator_persona": persona["aggregator_persona"],
            "entity_types": persona["entity_types"],
        }

        return ctx

    @staticmethod
    def get_persona_for_dataset(dataset_name: str) -> Dict[str, str]:
        """Public API: get persona dict for a given dataset name."""
        persona_key = DATASET_PERSONA_MAP.get(dataset_name, "general_knowledge")
        return PERSONAS.get(persona_key, PERSONAS["general_knowledge"])

    @staticmethod
    def _detect_dataset() -> str:
        try:
            return OntologyRegistry.get_config().get("dataset_name", "Unknown")
        except Exception:
            return "Unknown"
