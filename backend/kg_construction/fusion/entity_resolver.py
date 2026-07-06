"""Entity Resolver — multi-source entity alignment, deduplication, and conflict resolution.

Strategies:
1. Exact match: Unique keys (USCID, ID hash)
2. Fuzzy match: Name similarity via TfIdf + cosine (threshold >= 0.85)
3. Graph structural match: Neighbor similarity for ambiguous entities

Conflict resolution priority: most recent timestamp > highest authority source > confidence.
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from collections import defaultdict

logger = logging.getLogger(__name__)


class EntityResolver:
    """Resolves duplicate entities across data sources."""

    def __init__(self, db_client: Any = None) -> None:
        self._db = db_client

    # ── Main resolve ───────────────────────────────────────────────

    def resolve(self, entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Resolve and merge a list of candidate entities.

        Groups entities by normalized name, then merges within each group.
        """
        if not entities:
            return []

        groups = self._group_by_name(entities)
        resolved = []
        for name, group in groups.items():
            if len(group) == 1:
                resolved.append(group[0])
            else:
                merged = self._merge_group(name, group)
                resolved.append(merged)

        return resolved

    # ── Grouping ───────────────────────────────────────────────────

    def _group_by_name(self, entities: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        """Group entities by normalized name."""
        groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for ent in entities:
            name = self._normalize(ent.get("name", ent.get("mention", "")))
            if name:
                groups[name].append(ent)
            else:
                # Entities without names stay separate
                groups[f"__anon_{id(ent)}"].append(ent)
        return dict(groups)

    @staticmethod
    def _normalize(name: str) -> str:
        """Normalize entity name for grouping."""
        if not name:
            return ""
        import re
        name = name.strip()
        # Remove common suffixes
        suffixes = ["股份有限公司", "有限责任公司", "有限公司", "集团", "（", "）", "(", ")"]
        for s in suffixes:
            name = name.replace(s, "")
        # Collapse whitespace
        name = re.sub(r"\s+", "", name)
        return name.lower()

    # ── Merge ──────────────────────────────────────────────────────

    def _merge_group(self, name: str, group: list[dict[str, Any]]) -> dict[str, Any]:
        """Merge a group of entities representing the same real-world entity."""
        # Use the entity with the most properties as base
        base = max(group, key=lambda e: len(e))

        merged: dict[str, Any] = {
            "name": name,
            "aliases": [],
            "entity_type": self._vote_type(group),
            "confidence": sum(e.get("confidence", 0.5) for e in group) / len(group),
            "source_count": len(group),
            "properties": {},
            "source_entities": [e.get("source", "unknown") for e in group],
        }

        # Collect all properties
        all_props: dict[str, list[tuple[Any, float, str]]] = defaultdict(list)
        for ent in group:
            conf = ent.get("confidence", 0.5)
            source = ent.get("source", "unknown")
            for key, value in ent.get("properties", ent).items():
                if key in ("name", "mention", "confidence", "source", "type", "entityType", "matchedBy", "kgNodeId"):
                    continue
                if value is not None:
                    all_props[key].append((value, conf, source))

            # Track aliases
            orig_name = ent.get("name", ent.get("mention", ""))
            if orig_name and orig_name != name:
                merged["aliases"].append(orig_name)

        # Resolve each property
        for key, values in all_props.items():
            merged["properties"][key] = self.conflict_resolve(
                values=[v[0] for v in values],
                confidences=[v[1] for v in values],
                sources=[v[2] for v in values],
            )

        return merged

    @staticmethod
    def _vote_type(group: list[dict[str, Any]]) -> str:
        """Pick the most common entity type in the group."""
        types = [e.get("entity_type", e.get("type", e.get("entityType", "Unknown"))) for e in group]
        return max(set(types), key=types.count)

    # ── Conflict resolution ────────────────────────────────────────

    def conflict_resolve(
        self,
        values: list[Any],
        confidences: Optional[list[float]] = None,
        sources: Optional[list[str]] = None,
        timestamps: Optional[list[str]] = None,
    ) -> Any:
        """Resolve conflicting property values.

        Priority:
        1. Most recent timestamp
        2. Highest authority source (官方 > 第三方 > 网络采集)
        3. Highest confidence

        If conflict cannot be resolved, returns the value with highest confidence.
        """
        if not values:
            return None
        if len(values) == 1:
            return values[0]

        # Check if all values agree
        unique = list(set(str(v) for v in values))
        if len(unique) == 1:
            return values[0]

        # Priority 1: Timestamp
        if timestamps:
            try:
                best_idx = max(range(len(timestamps)), key=lambda i: timestamps[i] or "")
                return values[best_idx]
            except (ValueError, TypeError):
                pass

        # Priority 2: Source authority
        if sources:
            authority = {"官方": 3, "政府": 3, "交易所": 3, "API": 2, "第三方": 1, "网络": 0, "未知": 0}
            best_idx = max(range(len(sources)), key=lambda i: authority.get(sources[i] or "未知", 0))
            return values[best_idx]

        # Priority 3: Confidence
        if confidences:
            best_idx = max(range(len(confidences)), key=lambda i: confidences[i])
            return values[best_idx]

        return values[0]

    # ── Fuzzy matching for candidate pairs ─────────────────────────

    def find_duplicates(
        self,
        entities: list[dict[str, Any]],
        threshold: float = 0.85,
    ) -> list[tuple[int, int, float]]:
        """Find duplicate pairs via TfIdf + cosine similarity.

        Returns list of (idx_a, idx_b, similarity_score) tuples.
        """
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
        except ImportError:
            logger.warning("scikit-learn not installed, falling back to difflib.")
            return self._find_duplicates_difflib(entities, threshold)

        names = [self._normalize(e.get("name", e.get("mention", ""))) for e in entities]
        if not names or all(n == "" for n in names):
            return []

        try:
            vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(2, 3))
            tfidf = vectorizer.fit_transform(names)
            sim = cosine_similarity(tfidf)
        except Exception:
            return self._find_duplicates_difflib(entities, threshold)

        pairs = []
        n = len(entities)
        for i in range(n):
            for j in range(i + 1, n):
                score = float(sim[i][j])
                if score >= threshold:
                    pairs.append((i, j, score))
        return sorted(pairs, key=lambda x: x[2], reverse=True)

    def _find_duplicates_difflib(
        self,
        entities: list[dict[str, Any]],
        threshold: float = 0.85,
    ) -> list[tuple[int, int, float]]:
        """Fallback duplicate detection using difflib."""
        from difflib import SequenceMatcher
        names = [self._normalize(e.get("name", e.get("mention", ""))) for e in entities]
        pairs = []
        n = len(entities)
        for i in range(n):
            for j in range(i + 1, n):
                score = SequenceMatcher(None, names[i], names[j]).ratio()
                if score >= threshold:
                    pairs.append((i, j, score))
        return sorted(pairs, key=lambda x: x[2], reverse=True)
