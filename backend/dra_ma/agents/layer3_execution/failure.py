"""Failure classification system for the DRA-MA vertical closed-loop collaboration.

Structured failure taxonomy enables tiered recovery:
  Tier 0: difflib auto-correction (cypher_utils.auto_fix_simple_errors)
  Tier 1: SmashAgent Cypher repair (schema errors)
  Tier 2: SmashAgent semantic reconstruction (empty results / timeouts)
  Tier 3: PlannerAgent backtrack re-planning (persistent dead-ends)

Before this module, all failures were undifferentiated strings — the system could not
decide whether to fix a typo, rewrite a query, or backtrack to a prior hop.
"""

import re
import logging
from enum import Enum
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class FailureType(str, Enum):
    SCHEMA_ERROR = "schema_error"        # Cypher syntax / relation name mismatch
    EMPTY_RESULT = "empty_result"        # Syntax valid but no matching graph data
    TIMEOUT = "timeout"                  # Execution exceeded 15s (fan-out explosion)
    CONNECTION_ERROR = "connection_error"  # Neo4j unavailable
    UNKNOWN = "unknown"


class FailureReport(BaseModel):
    failure_type: FailureType = Field(..., description="Classified failure category")
    error_log: str = Field(default="", description="Raw error message from Neo4j or executor")
    failed_cypher: str = Field(default="", description="The Cypher query that triggered the failure")
    failed_relation: str = Field(default="", description="The relation name extracted from the failed path")
    current_path: str = Field(default="", description="The NL path prefix at the time of failure")
    suggestion: str = Field(default="", description="LLM-generated repair suggestion (filled by SmashAgent)")

    def is_retryable(self) -> bool:
        """Whether this failure type warrants a retry (vs immediate backtrack)."""
        return self.failure_type in (FailureType.SCHEMA_ERROR, FailureType.TIMEOUT)

    def is_backtrackable(self) -> bool:
        """Whether this failure type justifies backtracking to a previous hop."""
        return self.failure_type in (FailureType.EMPTY_RESULT, FailureType.SCHEMA_ERROR)


def classify_failure(is_valid: bool, is_empty: bool, error_log: str, cypher: str = "", current_path: str = "") -> FailureReport:
    """Classify a DB execution outcome into a structured FailureReport.

    Args:
        is_valid: Whether the Cypher executed without Neo4j-level errors
        is_empty: Whether the query returned zero results
        error_log: Raw error message from ExecutorAgent
        cypher: The Cypher query that was executed
        current_path: The NL path at the time of failure (for relation extraction)

    Returns:
        FailureReport with classified failure_type and extracted context
    """
    error_lower = error_log.lower()

    # 1. Connection errors
    if any(kw in error_lower for kw in ("connection", "serviceunavailable", "refused", "unreachable")):
        return FailureReport(
            failure_type=FailureType.CONNECTION_ERROR,
            error_log=error_log,
            failed_cypher=cypher,
            failed_relation=_extract_last_relation(current_path),
            current_path=current_path,
        )

    # 2. Timeout / fan-out explosion
    if any(kw in error_lower for kw in ("timeout", "exceeded", "cartesian", "fan-out")):
        return FailureReport(
            failure_type=FailureType.TIMEOUT,
            error_log=error_log,
            failed_cypher=cypher,
            failed_relation=_extract_last_relation(current_path),
            current_path=current_path,
        )

    # 3. Schema / syntax errors (NOT valid, with error)
    if not is_valid and error_log:
        return FailureReport(
            failure_type=FailureType.SCHEMA_ERROR,
            error_log=error_log,
            failed_cypher=cypher,
            failed_relation=_extract_last_relation(current_path),
            current_path=current_path,
        )

    # 4. Empty results (valid syntax but no data matches)
    if is_empty:
        return FailureReport(
            failure_type=FailureType.EMPTY_RESULT,
            error_log=error_log or "Query returned zero results — no matching paths in the graph",
            failed_cypher=cypher,
            failed_relation=_extract_last_relation(current_path),
            current_path=current_path,
        )

    # 5. Unknown
    return FailureReport(
        failure_type=FailureType.UNKNOWN,
        error_log=error_log or "Unknown failure",
        failed_cypher=cypher,
        failed_relation=_extract_last_relation(current_path),
        current_path=current_path,
    )


def _extract_last_relation(path: str) -> str:
    """Extract the last relation name from a path string like 'A - r1 - B - r2 - Target'."""
    if not path:
        return ""
    parts = [p.strip() for p in re.split(r"[-→>|]", path)]
    parts = [p for p in parts if p]
    # Relations are at odd indices: parts[1], parts[3], ...
    # The last relation is the one before "Target" or "Node"
    for i in range(len(parts) - 1, 0, -1):
        if parts[i] in ("Target", "Node") and i >= 1:
            return parts[i - 1]
    # Fallback: return the last odd-index element
    rels = parts[1::2]
    return rels[-1] if rels else ""
