"""DRA-MA Agents — four-layer collaborative reasoning architecture."""

from dra_ma.agents.layer1_perception import IntentAgent, IntentObject, GatingRouter, generate_prompt
from dra_ma.agents.layer2_beam_search import get_adjacent_relations, IntentPlannerAgent, PlannerAgent
from dra_ma.agents.layer3_execution import (
    ExecutorAgent, DBResponse, SmashAgent,
    call_llm, path_to_cypher, execute_cypher_and_extract,
    auto_fix_simple_errors, extract_cypher_from_text,
    template_cypher, detemplate_cypher, db_client,
    FailureReport, FailureType, classify_failure,
)
from dra_ma.agents.layer4_consensus import (
    VerifierAgent, AggregatorAgent,
    calculate_total_reward, calculate_r_base, calculate_r_collab,
    calculate_r_div, calculate_jaccard_similarity, calculate_p_scale,
)

__all__ = [
    "IntentAgent", "IntentObject", "GatingRouter", "generate_prompt",
    "get_adjacent_relations", "IntentPlannerAgent", "PlannerAgent",
    "ExecutorAgent", "DBResponse", "SmashAgent",
    "call_llm", "path_to_cypher", "execute_cypher_and_extract",
    "auto_fix_simple_errors", "extract_cypher_from_text",
    "template_cypher", "detemplate_cypher", "db_client",
    "FailureReport", "FailureType", "classify_failure",
    "VerifierAgent", "AggregatorAgent",
    "calculate_total_reward", "calculate_r_base", "calculate_r_collab",
    "calculate_r_div", "calculate_jaccard_similarity", "calculate_p_scale",
]
