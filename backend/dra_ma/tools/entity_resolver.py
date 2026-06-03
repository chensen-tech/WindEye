"""Entity Resolution — resolve raw entity mentions to canonical KG node IDs.

Lightweight tool module (NOT an agent). Runs after IntentAgent, before DRAEngine.
Strategies tried in order, stopping on first match >= threshold:
  1. EXACT    — name = raw_entity
  2. ALIAS    — name_list / alias property contains raw_entity
  3. CONTAINS — canonical_name CONTAINS raw_entity or vice versa
  4. FUZZY    — multi-property OR search (name / COMPANY_NM / PERSON_NM / zh_name)
  5. LLM_FALLBACK — LLM inference (optional, disabled by default)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from dra_ma.agents.layer3_execution.cypher_utils import db_client, call_llm
from dra_ma.utils.agent_trace import agent_trace

logger = logging.getLogger(__name__)

EXACT_THRESHOLD = 0.95
CONTAINS_THRESHOLD = 0.80
FUZZY_THRESHOLD = 0.60


@dataclass
class ResolvedEntity:
    raw: str
    canonical_name: str | None = None
    kg_node_id: str | None = None
    match_type: str = "unresolved"  # exact | alias | contains | fuzzy | llm_fallback | unresolved
    match_score: float = 0.0
    confidence: float = 0.0


class EntityResolver:
    """Resolve raw entity mentions to canonical KG node IDs.

    Usage:
        resolver = EntityResolver()
        results = await resolver.resolve(["鑫达投资", "张明远"])
    """

    def __init__(self, enable_llm_fallback: bool = False):
        self.enable_llm_fallback = enable_llm_fallback

    async def resolve(self, raw_entities: list[str]) -> list[ResolvedEntity]:
        """Resolve a list of raw entity strings to canonical KG nodes."""
        agent_trace("EntityResolver", "START", raw_entities=raw_entities)
        results: list[ResolvedEntity] = []
        for raw in raw_entities:
            if not raw or not raw.strip():
                results.append(ResolvedEntity(raw=raw))
                continue
            resolved = await self._resolve_one(raw.strip())
            results.append(resolved)
        resolved_count = sum(1 for r in results if r.kg_node_id)
        logger.info(
            "[EntityResolver] Resolved %d/%d entities", resolved_count, len(results)
        )
        agent_trace("EntityResolver", "DONE",
                    resolved=resolved_count,
                    total=len(results),
                    unresolved=[r.raw for r in results if not r.kg_node_id])
        return results

    async def _resolve_one(self, raw: str) -> ResolvedEntity:
        """Try resolution strategies in order for a single entity."""
        # Strategy 1: EXACT match
        agent_trace("EntityResolver", "TRY", entity=raw, strategy="exact")
        result = await self._try_exact(raw)
        if result.kg_node_id and result.match_score >= EXACT_THRESHOLD:
            agent_trace("EntityResolver", "HIT", entity=raw, strategy="exact",
                        canonical=result.canonical_name, kg_node_id=result.kg_node_id, confidence=result.confidence)
            return result

        # Strategy 2: ALIAS match
        agent_trace("EntityResolver", "TRY", entity=raw, strategy="alias")
        result = await self._try_alias(raw)
        if result.kg_node_id and result.match_score >= EXACT_THRESHOLD:
            agent_trace("EntityResolver", "HIT", entity=raw, strategy="alias",
                        canonical=result.canonical_name, kg_node_id=result.kg_node_id, confidence=result.confidence)
            return result

        # Strategy 3: CONTAINS match
        agent_trace("EntityResolver", "TRY", entity=raw, strategy="contains")
        result = await self._try_contains(raw)
        if result.kg_node_id and result.match_score >= CONTAINS_THRESHOLD:
            agent_trace("EntityResolver", "HIT", entity=raw, strategy="contains",
                        canonical=result.canonical_name, kg_node_id=result.kg_node_id, confidence=result.confidence)
            return result

        # Strategy 4: FUZZY multi-property OR search
        agent_trace("EntityResolver", "TRY", entity=raw, strategy="fuzzy")
        result = await self._try_fuzzy(raw)
        if result.kg_node_id and result.match_score >= FUZZY_THRESHOLD:
            agent_trace("EntityResolver", "HIT", entity=raw, strategy="fuzzy",
                        canonical=result.canonical_name, kg_node_id=result.kg_node_id, confidence=result.confidence)
            return result

        # Strategy 5: LLM fallback (optional)
        if self.enable_llm_fallback:
            agent_trace("EntityResolver", "TRY", entity=raw, strategy="llm_fallback")
            result = await self._try_llm(raw)
            if result.kg_node_id:
                agent_trace("EntityResolver", "HIT", entity=raw, strategy="llm_fallback",
                            canonical=result.canonical_name, kg_node_id=result.kg_node_id, confidence=result.confidence)
                return result

        return ResolvedEntity(raw=raw)

    # ── Strategy implementations ───────────────────────────────────

    async def _try_exact(self, raw: str) -> ResolvedEntity:
        """Exact match on name property."""
        escaped = raw.replace("'", "\\'")
        cypher = f"""
        MATCH (n)
        WHERE n.name = '{escaped}' OR n.COMPANY_NM = '{escaped}'
           OR n.PERSON_NM = '{escaped}' OR n.title = '{escaped}'
        RETURN n, labels(n) AS labels, elementId(n) AS elem_id LIMIT 1
        """
        try:
            rows = db_client.execute_read(cypher)
            if rows:
                return self._build_result(raw, rows[0], "exact", 1.0, 0.99)
        except Exception as exc:
            logger.debug("[EntityResolver] EXACT query failed: %s", exc)
        return ResolvedEntity(raw=raw)

    async def _try_alias(self, raw: str) -> ResolvedEntity:
        """Search name_list or alias properties."""
        escaped = raw.replace("'", "\\'")
        cypher = f"""
        MATCH (n)
        WHERE '{escaped}' IN n.name_list OR '{escaped}' IN n.aliases
           OR n.alias = '{escaped}'
        RETURN n, labels(n) AS labels, elementId(n) AS elem_id LIMIT 1
        """
        try:
            rows = db_client.execute_read(cypher)
            if rows:
                return self._build_result(raw, rows[0], "alias", 0.95, 0.93)
        except Exception as exc:
            logger.debug("[EntityResolver] ALIAS query failed: %s", exc)
        return ResolvedEntity(raw=raw)

    async def _try_contains(self, raw: str) -> ResolvedEntity:
        """Substring matching: canonical CONTAINS raw or raw CONTAINS canonical."""
        escaped = raw.replace("'", "\\'")
        cypher = f"""
        MATCH (n)
        WHERE n.name CONTAINS '{escaped}' OR n.COMPANY_NM CONTAINS '{escaped}'
           OR n.PERSON_NM CONTAINS '{escaped}' OR n.title CONTAINS '{escaped}'
           OR '{escaped}' CONTAINS n.name
        RETURN n, labels(n) AS labels, elementId(n) AS elem_id LIMIT 5
        """
        try:
            rows = db_client.execute_read(cypher)
            if rows:
                best = self._pick_best_contains(raw, rows)
                if best:
                    return best
        except Exception as exc:
            logger.debug("[EntityResolver] CONTAINS query failed: %s", exc)
        return ResolvedEntity(raw=raw)

    async def _try_fuzzy(self, raw: str) -> ResolvedEntity:
        """Multi-property OR search returning top candidates for scoring."""
        escaped = raw.replace("'", "\\'")
        # Use CONTAINS as a broad pre-filter, then score locally
        cypher = f"""
        MATCH (n)
        WHERE n.name CONTAINS '{escaped}' OR n.COMPANY_NM CONTAINS '{escaped}'
           OR n.PERSON_NM CONTAINS '{escaped}' OR n.zh_name CONTAINS '{escaped}'
           OR n.title CONTAINS '{escaped}'
        RETURN n, labels(n) AS labels, elementId(n) AS elem_id LIMIT 10
        """
        try:
            rows = db_client.execute_read(cypher)
            if rows:
                best = self._pick_best_fuzzy(raw, rows)
                if best and best.match_score >= FUZZY_THRESHOLD:
                    return best
        except Exception as exc:
            logger.debug("[EntityResolver] FUZZY query failed: %s", exc)
        return ResolvedEntity(raw=raw)

    async def _try_llm(self, raw: str) -> ResolvedEntity:
        """LLM fallback for entity disambiguation."""
        try:
            prompt = (
                "你是一个知识图谱实体解析专家。给定一个原始实体名称，"
                "请推断它在金融监管知识图谱中最可能对应的规范实体名称。"
                "如果无法确定，返回 null。\n"
                "输出 JSON: {\"canonical_name\": \"规范名称\" or null, \"confidence\": 0.0-1.0}"
            )
            import json
            raw_text = await call_llm(
                system=prompt,
                user=f"原始实体: {raw}",
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            data = json.loads(raw_text)
            canonical = data.get("canonical_name")
            if canonical:
                # Verify the LLM-suggested name actually exists in KG
                escaped = str(canonical).replace("'", "\\'")
                cypher = f"""
                MATCH (n) WHERE n.name = '{escaped}' OR n.COMPANY_NM = '{escaped}'
                RETURN n, labels(n) AS labels, elementId(n) AS elem_id LIMIT 1
                """
                rows = db_client.execute_read(cypher)
                if rows:
                    llm_conf = float(data.get("confidence", 0.5))
                    return self._build_result(
                        raw, rows[0], "llm_fallback", llm_conf, llm_conf * 0.8
                    )
        except Exception as exc:
            logger.debug("[EntityResolver] LLM fallback failed: %s", exc)
        return ResolvedEntity(raw=raw)

    # ── Scoring helpers ────────────────────────────────────────────

    @staticmethod
    def _build_result(
        raw: str, row: dict, match_type: str, match_score: float, confidence: float,
    ) -> ResolvedEntity:
        """Build a ResolvedEntity from a Neo4j result row."""
        node = row.get("n", {})
        props = node.get("properties", node) if isinstance(node, dict) else {}
        # record.data() strips element_id, so we extract it from the dedicated RETURN field
        node_id = str(row.get("elem_id") or props.get("id") or props.get("element_id") or "")
        canonical = (
            props.get("name")
            or props.get("COMPANY_NM")
            or props.get("PERSON_NM")
            or props.get("title")
            or raw
        )
        return ResolvedEntity(
            raw=raw,
            canonical_name=str(canonical),
            kg_node_id=str(node_id),
            match_type=match_type,
            match_score=match_score,
            confidence=confidence,
        )

    @staticmethod
    def _extract_name(props: dict) -> str:
        return str(
            props.get("name")
            or props.get("COMPANY_NM")
            or props.get("PERSON_NM")
            or props.get("zh_name")
            or props.get("title")
            or ""
        )

    @classmethod
    def _pick_best_contains(cls, raw: str, rows: list[dict]) -> ResolvedEntity | None:
        """Pick the best CONTAINS match — shortest name that contains raw is best."""
        best = None
        best_len = float("inf")
        for row in rows:
            node = row.get("n", {})
            props = node.get("properties", node) if isinstance(node, dict) else {}
            name = cls._extract_name(props)
            if not name:
                continue
            if raw in name or name in raw:
                score = len(raw) / max(len(name), 1)
                if len(name) < best_len and score >= CONTAINS_THRESHOLD:
                    best_len = len(name)
                    best = cls._build_result(raw, row, "contains", score, score * 0.95)
        return best

    @classmethod
    def _pick_best_fuzzy(cls, raw: str, rows: list[dict]) -> ResolvedEntity | None:
        """Score candidates by edit-distance-like character overlap."""
        best = None
        best_score = 0.0
        raw_chars = set(raw)
        for row in rows:
            node = row.get("n", {})
            props = node.get("properties", node) if isinstance(node, dict) else {}
            name = cls._extract_name(props)
            if not name:
                continue
            name_chars = set(name)
            overlap = len(raw_chars & name_chars)
            score = overlap / max(len(raw_chars | name_chars), 1)
            if score > best_score:
                best_score = score
                conf = score * 0.85
                best = cls._build_result(raw, row, "fuzzy", score, conf)
        return best
