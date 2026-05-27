"""Query Rewriter — expands and clarifies user queries via LLM."""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class QueryRewriter:
    """Rewrites user queries: pronoun resolution, entity extraction, expansion."""

    async def rewrite(self, query: str, history: list[str] | None = None) -> dict[str, Any]:
        return {
            "originalQuery": query,
            "rewrittenQuery": query,
            "subQueries": [],
            "expansionTerms": [],
        }


async def rewrite_query(query: str, history: list[str] | None = None) -> dict[str, Any]:
    """Convenience function for query rewriting."""
    rewriter = QueryRewriter()
    return await rewriter.rewrite(query, history)
