"""Custom exception hierarchy for BiDA-KG backend.

Error codes are extracted from module requirements:
- Dialogue: DLG_400_INVALID_INPUT, DLG_422_LINK_FAILED, DLG_500_INTERNAL
- Retrieval: RET_408_TIMEOUT, RET_422_BAD_QUERY, RET_503_GRAPH_UNAVAILABLE
- Agent: AGT_429_RATE_LIMIT, AGT_500_REASONING_FAILED, AGT_502_TOOL_ERROR
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class BiDAError(Exception):
    """Base exception with normalized error contract fields."""

    code: str
    message: str
    retryable: bool = False

    def __str__(self) -> str:
        return f"{self.code}: {self.message}"

    def to_dict(self, trace_id: str | None = None) -> dict[str, str | bool]:
        """Return serializable error payload for API responses."""
        payload: dict[str, str | bool] = {
            "code": self.code,
            "message": self.message,
            "retryable": self.retryable,
        }
        if trace_id:
            payload["traceId"] = trace_id
        return payload


class DialogueInvalidInputError(BiDAError):
    """Raised when Dialogue Layer receives invalid or empty input."""

    def __init__(self, message: str = "Invalid dialogue input.") -> None:
        super().__init__(code="DLG_400_INVALID_INPUT", message=message, retryable=False)


class DialogueLinkFailedError(BiDAError):
    """Raised when entity linking cannot map mention to KG node."""

    def __init__(self, message: str = "Entity linking failed.") -> None:
        super().__init__(code="DLG_422_LINK_FAILED", message=message, retryable=True)


class DialogueInternalError(BiDAError):
    """Raised for unexpected internal errors in Dialogue module."""

    def __init__(self, message: str = "Dialogue internal error.") -> None:
        super().__init__(code="DLG_500_INTERNAL", message=message, retryable=True)


class RetrievalTimeoutError(BiDAError):
    """Raised when GraphRAG retrieval exceeds timeout budget."""

    def __init__(self, message: str = "Retrieval request timed out.") -> None:
        super().__init__(code="RET_408_TIMEOUT", message=message, retryable=True)


class RetrievalBadQueryError(BiDAError):
    """Raised when Text2Cypher/graph query is malformed."""

    def __init__(self, message: str = "Retrieval query is invalid.") -> None:
        super().__init__(code="RET_422_BAD_QUERY", message=message, retryable=False)


class RetrievalGraphUnavailableError(BiDAError):
    """Raised when graph database is unavailable."""

    def __init__(self, message: str = "Graph service unavailable.") -> None:
        super().__init__(code="RET_503_GRAPH_UNAVAILABLE", message=message, retryable=True)


class AgentRateLimitError(BiDAError):
    """Raised when LLM Agent calls exceed provider limits."""

    def __init__(self, message: str = "Agent rate limit exceeded.") -> None:
        super().__init__(code="AGT_429_RATE_LIMIT", message=message, retryable=True)


class AgentReasoningFailedError(BiDAError):
    """Raised when LLM Agent reasoning pipeline fails."""

    def __init__(self, message: str = "Agent reasoning failed.") -> None:
        super().__init__(code="AGT_500_REASONING_FAILED", message=message, retryable=True)


class AgentToolError(BiDAError):
    """Raised when downstream tool invocation fails during reasoning."""

    def __init__(self, message: str = "Agent tool invocation failed.") -> None:
        super().__init__(code="AGT_502_TOOL_ERROR", message=message, retryable=True)


# ---------------------------------------------------------------------------
# QueryRewrite exceptions
# ---------------------------------------------------------------------------


class QueryRewriteError(BiDAError):
    """Base exception for QueryRewrite module failures."""

    def __init__(self, message: str = "QueryRewrite failed.") -> None:
        super().__init__(code="QRW_500_INTERNAL", message=message, retryable=True)


class QueryRewriteLLMError(BiDAError):
    """Raised when LLM call in QueryRewrite fails."""

    def __init__(self, message: str = "LLM call failed during query rewrite.") -> None:
        super().__init__(code="QRW_503_LLM_UNAVAILABLE", message=message, retryable=True)


# ---------------------------------------------------------------------------
# GNN Alignment exceptions
# ---------------------------------------------------------------------------


class AlignmentDimMismatchError(BiDAError):
    """Raised when structural and semantic embedding dimensions don't match."""

    def __init__(self, message: str = "Embedding dimension mismatch.") -> None:
        super().__init__(code="ALG_422_DIM_MISMATCH", message=message, retryable=False)


class AlignmentModelUnavailableError(BiDAError):
    """Raised when alignment projection matrix (W_hat) cannot be loaded."""

    def __init__(self, message: str = "Alignment model unavailable.") -> None:
        super().__init__(code="ALG_503_MODEL_UNAVAILABLE", message=message, retryable=True)


class AlignmentTrainingError(BiDAError):
    """Raised when GNN alignment training fails."""

    def __init__(self, message: str = "Alignment training failed.") -> None:
        super().__init__(code="ALG_500_TRAINING_FAILED", message=message, retryable=False)


# ---------------------------------------------------------------------------
# Cypher / Graph exceptions
# ---------------------------------------------------------------------------


class CypherSyntaxError(BiDAError):
    """Raised when a Neo4j Cypher query has syntax errors."""

    def __init__(self, message: str = "Cypher query syntax error.") -> None:
        super().__init__(code="RET_422_CYPHER_SYNTAX", message=message, retryable=False)


