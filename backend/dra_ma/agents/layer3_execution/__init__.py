"""Layer 3: Generalized Physical Execution & Self-Healing.

ExecutorAgent:  Symbol compiler — translates GQ-IR to Cypher with placeholder crushing and smart return anchors.
SmashAgent:     Generalized healer — difflib typo fixes + semantic retry loop with error logs and real schema.
"""

from dra_ma.agents.layer3_execution.compiler import ExecutorAgent, DBResponse
from dra_ma.agents.layer3_execution.healer import SmashAgent
from dra_ma.agents.layer3_execution.cypher_utils import (
    call_llm, path_to_cypher, execute_cypher_and_extract,
    auto_fix_simple_errors, extract_cypher_from_text,
    template_cypher, detemplate_cypher, db_client,
)
from dra_ma.agents.layer3_execution.failure import FailureReport, FailureType, classify_failure

__all__ = [
    "ExecutorAgent", "DBResponse", "SmashAgent",
    "call_llm", "path_to_cypher", "execute_cypher_and_extract",
    "auto_fix_simple_errors", "extract_cypher_from_text",
    "template_cypher", "detemplate_cypher", "db_client",
    "FailureReport", "FailureType", "classify_failure",
]
