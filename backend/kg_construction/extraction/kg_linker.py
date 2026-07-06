"""Entity Linker — maps extracted mentions to Neo4j KG node IDs.

Strategies (tried in order):
1. USCID exact match (for Company nodes)
2. Full-text index search (CALL db.index.fulltext.queryNodes)
3. Fuzzy name matching (edit distance / trigram similarity)
4. Property-based lookup (name, short_name, code)

Typical usage:
    from kg_construction.extraction.kg_linker import link_entities
    linked = link_entities([{"mention": "万科A", "type": "COMPANY"}])
"""

from __future__ import annotations

import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)


class EntityLinker:
    """Links text mentions to KG entities."""

    def __init__(self, db_client: Any = None) -> None:
        self._db = db_client

    def _get_client(self) -> Any:
        if self._db:
            return self._db
        try:
            from backend.core.database import Neo4jClient
            return Neo4jClient.from_env()
        except Exception as e:
            logger.error(f"Failed to create Neo4j client: {e}")
            return None

    # ── Single link ────────────────────────────────────────────────

    def link(self, mention: str, entity_type: str | None = None) -> dict[str, Any]:
        """Link a single mention to a KG entity.

        Returns {mention, kgNodeId, entityType, confidence, matchedBy}.
        """
        client = self._get_client()
        if not client:
            return {
                "mention": mention,
                "kgNodeId": "",
                "entityType": entity_type or "Unknown",
                "confidence": 0.0,
                "matchedBy": "none",
            }

        # Strategy 1: Full-text index search
        result = self._link_by_fulltext(client, mention, entity_type)
        if result and result["confidence"] >= 0.8:
            return result

        # Strategy 2: Property exact match (name or code)
        result = self._link_by_property(client, mention, entity_type)
        if result and result["confidence"] >= 0.8:
            return result

        # Strategy 3: Fuzzy match
        result = self._link_fuzzy(mention, entity_type)
        if result and result["confidence"] >= 0.6:
            return result

        return {
            "mention": mention,
            "kgNodeId": "",
            "entityType": entity_type or "Unknown",
            "confidence": 0.0,
            "matchedBy": "none",
        }

    # ── Strategy implementations ───────────────────────────────────

    def _link_by_fulltext(self, client: Any, mention: str, entity_type: str | None) -> Optional[dict[str, Any]]:
        """Search via Neo4j full-text index."""
        try:
            labels = self._labels_for_type(entity_type)
            query = """
                CALL db.index.fulltext.queryNodes($indexName, $searchString)
                YIELD node, score
                WHERE score > 0.5
            """
            for label in labels:
                index_name = f"fulltext_{label.lower()}"
                try:
                    records = client.execute_read(query, {
                        "indexName": index_name,
                        "searchString": mention,
                    }, timeout_seconds=5.0)
                    if records:
                        best = records[0]
                        return {
                            "mention": mention,
                            "kgNodeId": best.get("node", {}).get("element_id", ""),
                            "entityType": entity_type or "Unknown",
                            "confidence": min(1.0, float(best.get("score", 0)) * 1.2),
                            "matchedBy": "fulltext",
                        }
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"Full-text search failed for '{mention}': {e}")
        return None

    def _link_by_property(self, client: Any, mention: str, entity_type: str | None) -> Optional[dict[str, Any]]:
        """Exact match on name, short_name, or code properties."""
        labels = self._labels_for_type(entity_type)
        props = ["name", "short_name", "uscid", "code", "stock_code"]
        for label in labels:
            for prop in props:
                try:
                    query = f"MATCH (n:{label} {{{prop}: $name}}) RETURN elementId(n) as id, labels(n) as labels LIMIT 1"
                    records = client.execute_read(query, {"name": mention}, timeout_seconds=3.0)
                    if records:
                        return {
                            "mention": mention,
                            "kgNodeId": records[0].get("id", ""),
                            "entityType": entity_type or "Unknown",
                            "confidence": 0.95,
                            "matchedBy": f"property:{prop}",
                        }
                except Exception:
                    pass
        return None

    def _link_fuzzy(self, mention: str, entity_type: str | None) -> Optional[dict[str, Any]]:
        """Fuzzy name matching using string similarity."""
        try:
            from difflib import SequenceMatcher
            client = self._get_client()
            if not client:
                return None
            labels = self._labels_for_type(entity_type)
            for label in labels:
                query = f"MATCH (n:{label}) RETURN elementId(n) as id, n.name as name LIMIT 500"
                records = client.execute_read(query, {}, timeout_seconds=10.0)
                best_score = 0.0
                best_id = ""
                for rec in records:
                    candidate = rec.get("name", "")
                    score = SequenceMatcher(None, mention, candidate).ratio()
                    if score > best_score:
                        best_score = score
                        best_id = rec.get("id", "")
                if best_score >= 0.7:
                    return {
                        "mention": mention,
                        "kgNodeId": best_id,
                        "entityType": entity_type or "Unknown",
                        "confidence": best_score * 0.9,
                        "matchedBy": "fuzzy",
                    }
        except Exception as e:
            logger.debug(f"Fuzzy matching failed for '{mention}': {e}")
        return None

    # ── Helpers ────────────────────────────────────────────────────

    @staticmethod
    def _labels_for_type(entity_type: str | None) -> list[str]:
        """Map entity type to Neo4j node labels."""
        if not entity_type:
            return ["Subject", "Company", "Person", "Event", "Regulation", "Feature"]
        mapping = {
            "COMPANY": ["Company", "Subject"],
            "PERSON": ["Person", "Subject"],
            "INSTITUTION": ["Institution", "Subject"],
            "REGULATION": ["Regulation"],
            "EVENT": ["Event"],
            "CASE_NUMBER": ["Event", "Litigation"],
        }
        return mapping.get(entity_type.upper() if entity_type else "", ["Subject"])

    # ── Batch link ─────────────────────────────────────────────────

    def batch_link(self, mentions: list[str], entity_type: str | None = None) -> list[dict[str, Any]]:
        """Link multiple mentions in batch."""
        return [self.link(m, entity_type) for m in mentions]


# ── Public API ────────────────────────────────────────────────────────

def link_entities(
    mentions: list[str],
    entity_type: str | None = None,
) -> list[dict[str, Any]]:
    """Convenience function for entity linking.

    Args:
        mentions: List of entity mention strings to link.
        entity_type: Optional entity type filter.

    Returns:
        List of {mention, kgNodeId, entityType, confidence, matchedBy} dicts.
    """
    linker = EntityLinker()
    return linker.batch_link(mentions, entity_type)
