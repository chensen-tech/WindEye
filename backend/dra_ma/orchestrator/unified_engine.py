"""Unified Engine — single pipeline orchestrating DRAEngine + Graph Analytics + Risk Plugins.

Replaces the split DRAEngine / RiskAnalysisEngine dual-pipeline architecture.
All SSE events use a unified envelope format:
  {event_id, session_id, stage, type, status, data, error, timestamp}

 Pipeline stages:
  1. Input Parser      — file content → unified text
  2. IntentAgent       — intent_type, raw_entities, task_config
  2.5. Entity Resolution — raw_entities → canonical KG node IDs
  3. DRAEngine         — retrieve_evidence_subgraph()
  4. Graph Analytics   — entity_stats, community, centrality, candidate_risk_paths
  5. Task Plugins      — risk_analysis → analyst → compliance → scoring → governance → reporter
                         graph_qa → Answer Agent
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator

from dra_ma.agents.layer1_perception.intent_agent import IntentAgent
from dra_ma.agents.layer3_execution.cypher_utils import call_llm, db_client
from dra_ma.prompts import PromptLoader
from dra_ma.tools.entity_resolver import EntityResolver, ResolvedEntity
from dra_ma.tools.graph_analytics_tools import GraphAnalyticsTool, GraphAnalyticsResult
from dra_ma.tools.community_discovery_tools import CommunityDiscoveryTool, CommunityMatcher
from dra_ma.tools.evidence_builder import EvidenceBuilder, EvidenceChains
from dra_ma.tools.compliance_scorer import ComplianceScorer
from dra_ma.tools.compliance_indicator_engine import ComplianceIndicatorEngine
from dra_ma.risk_engine.plugins.risk_analyst import RiskAnalystPlugin
from dra_ma.risk_engine.plugins.compliance import CompliancePlugin
from dra_ma.risk_engine.plugins.risk_scoring import RiskScoringPlugin
from dra_ma.risk_engine.plugins.governance import GovernancePlugin
from dra_ma.risk_engine.plugins.reporter import ReporterPlugin
from dra_ma.skills.base import SkillContext, SkillHook
from dra_ma.skills.registry import SkillManager
from dra_ma.risk_engine.risk_engine import RiskAnalysisEngine

logger = logging.getLogger(__name__)

# ── Envelope builder ──────────────────────────────────────────────────────────


def _envelope(
    session_id: str,
    round_id: int,
    stage: str,
    event_type: str,
    status: str,
    data: Any,
    error: str | None = None,
) -> str:
    """Build a unified SSE envelope JSON string."""
    return json.dumps({
        "event_id": uuid.uuid4().hex[:12],
        "session_id": session_id,
        "round_id": round_id,
        "stage": stage,
        "type": event_type,
        "status": status,
        "data": data,
        "error": error,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }, ensure_ascii=False)


def _trace_event(sid: str, round_id: int, agent: str, step: str, data: dict) -> str:
    """构建 SSE agent_trace 摘要事件（仅发摘要，不发完整 payload）。

    详细日志留在后端 agent_trace()，SSE 只发摘要避免前端 reasoningLog 过大。
    """
    compact = {
        "agent": agent,
        "step": step,
        "summary": data.get("summary") or data.get("reason") or "",
        "metrics": data.get("metrics") or {},
        "timestamp": time.time(),
    }
    return _envelope(sid, round_id, "agent_trace", "agent_trace", "success", compact)


# ── EvidenceSubgraph ──────────────────────────────────────────────────────────


@dataclass
class EvidenceSubgraph:
    nodes: list[dict] = field(default_factory=list)
    edges: list[dict] = field(default_factory=list)
    evidence_paths: list[dict] = field(default_factory=list)
    cypher_records: list[dict] = field(default_factory=list)
    verified_claims: list[dict] = field(default_factory=list)
    failed_queries: list[dict] = field(default_factory=list)
    graph_summary: dict = field(default_factory=dict)
    confidence: float = 0.0
    insufficient_entities: bool = False


def _coerce_evidence_subgraph(raw: Any) -> EvidenceSubgraph:
    """将 DRAEngine 返回的 dict 或 dataclass 统一转为 EvidenceSubgraph。"""
    if isinstance(raw, EvidenceSubgraph):
        return raw
    if isinstance(raw, dict):
        return EvidenceSubgraph(
            nodes=raw.get("nodes", []) or [],
            edges=raw.get("edges", []) or [],
            evidence_paths=raw.get("evidence_paths", []) or [],
            cypher_records=raw.get("cypher_records", []) or [],
            verified_claims=raw.get("verified_claims", []) or [],
            failed_queries=raw.get("failed_queries", []) or [],
            graph_summary=raw.get("graph_summary", {}) or {},
            confidence=float(raw.get("confidence", 0.0) or 0.0),
            insufficient_entities=bool(raw.get("insufficient_entities", False)),
        )
    return EvidenceSubgraph(insufficient_entities=True)


def _evidence_subgraph_to_dict(subgraph: EvidenceSubgraph) -> dict:
    """将 EvidenceSubgraph 转回 dict，用于 SSE JSON 序列化。"""
    return {
        "nodes": subgraph.nodes,
        "edges": subgraph.edges,
        "evidence_paths": subgraph.evidence_paths,
        "cypher_records": subgraph.cypher_records,
        "verified_claims": subgraph.verified_claims,
        "failed_queries": subgraph.failed_queries,
        "graph_summary": subgraph.graph_summary,
        "confidence": subgraph.confidence,
        "insufficient_entities": subgraph.insufficient_entities,
    }


# ── UnifiedEngine ─────────────────────────────────────────────────────────────


class UnifiedEngine:
    """Unified pipeline orchestrator for both graph_qa and risk_analysis.

    Usage:
        engine = UnifiedEngine(dra_engine, demo=False)
        async for sse_line in engine.stream(query, session_id="s1"):
            yield sse_line
    """

    def __init__(self, dra_engine: Any = None, demo: bool = False):
        self.dra = dra_engine
        self.demo = demo
        self.entity_resolver = EntityResolver(enable_llm_fallback=not demo)
        self.graph_tool = GraphAnalyticsTool()
        self.community_tool = CommunityDiscoveryTool()
        self.evidence_builder = EvidenceBuilder()
        self.risk_analyst = RiskAnalystPlugin(demo=demo)
        self.compliance = CompliancePlugin(demo=demo)
        self.scoring = RiskScoringPlugin(demo=demo)
        self.governance = GovernancePlugin(demo=demo)
        self.reporter = ReporterPlugin(demo=demo)
        self.compliance_indicator_engine = ComplianceIndicatorEngine()

    # ── Main stream entry ──────────────────────────────────────────

    async def stream(
        self,
        query: str,
        session_id: str = "",
        round_id: int = 1,
        max_hop: int = 3,
        intent_hint: str | None = None,
        file_content: str | None = None,
    ) -> AsyncGenerator[str, None]:
        """Run the full unified pipeline and yield SSE envelope lines.

        Args:
            query: User query text.
            session_id: Session identifier.
            round_id: Conversation round counter.
            max_hop: Maximum graph traversal hops.
            intent_hint: Optional intent_type hint to skip classification LLM.
            file_content: Optional uploaded file text for entity extraction.
        """
        sid = session_id or f"sess-{uuid.uuid4().hex[:10]}"
        stage_start = time.time()

        logger.warning(
            "[UnifiedEngine] ENTER unified pipeline query=%s intent_hint=%s max_hop=%s",
            query[:200], intent_hint, max_hop,
        )

        try:
            # ── Stage 1: IntentAgent ────────────────────────────────
            logger.warning("[UnifiedEngine] Stage: intent_classification")
            yield _envelope(sid, round_id, "intent", "stage", "running",
                            {"stage_name": "意图解析", "agent_action": "识别查询意图与实体..."})

            if intent_hint and not self.demo:
                raw_entities, task_config, parsed_intent = await self._intent_light(query, intent_hint, file_content)
            else:
                raw_entities, task_config, parsed_intent = await self._intent_full(query, file_content)

            intent_type = intent_hint or task_config.get("intent_type", "graph_qa")
            yield _envelope(sid, round_id, "intent", "stage", "success",
                            {"stage_name": "意图解析",
                             "agent_action": f"意图: {intent_type}, 原始实体: {raw_entities}",
                             "intent_type": intent_type,
                             "raw_entities": raw_entities})

            # ── Stage 2.5: Entity Resolution ─────────────────────────
            logger.warning("[UnifiedEngine] Stage: entity_resolution")
            yield _envelope(sid, round_id, "entity_resolution", "stage", "running",
                            {"stage_name": "实体对齐", "agent_action": "标准化实体名称..."})

            resolved = await self.entity_resolver.resolve(raw_entities)
            resolved_entities = [r for r in resolved if r.kg_node_id]
            unresolved_entities = [r for r in resolved if not r.kg_node_id]
            entity_status = "warning" if unresolved_entities else "success"

            yield _envelope(sid, round_id, "entity_resolution", "entities", entity_status,
                            {"resolved": [self._serialize_resolved(r) for r in resolved_entities],
                             "unresolved": [{"raw": r.raw} for r in unresolved_entities],
                             "resolved_count": len(resolved_entities),
                             "unresolved_count": len(unresolved_entities)})

            # ── Stage 3: DRAEngine Evidence Subgraph ─────────────────
            logger.warning("[UnifiedEngine] Stage: retrieve_evidence_subgraph")
            yield _envelope(sid, round_id, "subgraph", "stage", "running",
                            {"stage_name": "图谱推理", "agent_action": "DRAEngine 检索证据子图..."})

            subgraph = await self._retrieve_subgraph(
                query, resolved_entities, max_hop, intent_type, parsed_intent,
            )

            if subgraph.insufficient_entities:
                yield _envelope(sid, round_id, "subgraph", "stage", "warning",
                                {"stage_name": "图谱推理",
                                 "agent_action": "未检索到足够实体，证据不足"})
                yield _envelope(sid, round_id, "done", "done", "success",
                                {"level": "insufficient_evidence",
                                 "message": "未检索到足够关系证据，无法形成稳定风险评级"})
                return

            relation_types = sorted(set(
                str(e.get("relation") or e.get("type") or e.get("label") or "?")
                for e in subgraph.edges
            ))
            logger.warning(
                "[UnifiedEngine][SSE_SUBGRAPH] nodes=%s edges=%s relation_types=%s",
                len(subgraph.nodes), len(subgraph.edges),
                json.dumps(relation_types, ensure_ascii=False),
            )
            yield _envelope(sid, round_id, "subgraph", "subgraph", "success",
                            {"nodes": subgraph.nodes, "edges": subgraph.edges,
                             "node_count": len(subgraph.nodes),
                             "edge_count": len(subgraph.edges),
                             "relation_types": relation_types,
                             "confidence": subgraph.confidence})

            # ── Stage 4: Graph Analytics ─────────────────────────────
            logger.warning("[UnifiedEngine] Stage: graph_analytics")
            yield _envelope(sid, round_id, "graph_analytics", "stage", "running",
                            {"stage_name": "图计算分析", "agent_action": "计算图谱统计指标..."})

            analytics = await self._run_graph_analytics(subgraph)

            yield _envelope(sid, round_id, "graph_analytics", "entity_stats", "success",
                            analytics.entity_stats)
            yield _envelope(sid, round_id, "graph_analytics", "community", "success",
                            analytics.communities)
            yield _envelope(sid, round_id, "graph_analytics", "entity_community_map", "success",
                            analytics.entity_community_map)

            if analytics.candidate_risk_paths:
                yield _envelope(sid, round_id, "graph_analytics", "candidate_risk_paths", "success",
                                analytics.candidate_risk_paths)

            # ── Stage 5: Task Plugins ────────────────────────────────
            if intent_type == "risk_analysis":
                logger.warning("[UnifiedEngine] Stage: risk_plugins")
                async for line in self._run_risk_plugins(
                    sid, round_id, query, subgraph, analytics,
                    resolved_entities, unresolved_entities,
                ):
                    yield line
            else:
                # graph_qa: DRAEngine subgraph + analytics is sufficient
                yield _envelope(sid, round_id, "done", "done", "success",
                                {"intent_type": "graph_qa",
                                 "node_count": len(subgraph.nodes),
                                 "edge_count": len(subgraph.edges),
                                 "duration_ms": int((time.time() - stage_start) * 1000)})

        except Exception as exc:
            logger.exception("[UnifiedEngine] Pipeline failed: %s", exc)
            yield _envelope(sid, round_id, "error", "error", "error", {}, str(exc))
            # 输出可展示的 skeleton report，前端不会空白
            yield _envelope(sid, round_id, "reporting", "report", "error", {
                "overall_risk_level": "insufficient_evidence",
                "risk_scores": {
                    "overall": None,
                    "level": "insufficient_evidence",
                    "level_label": "证据不足",
                    "reason": str(exc),
                },
                "executive_summary": f"风险分析失败：{str(exc)}",
                "risk_paths": [],
                "anomaly_findings": [],
                "compliance_matches": [],
                "recommendations": [],
            }, error=str(exc))
            yield _envelope(sid, round_id, "done", "done", "success", {})

    # ── Intent ──────────────────────────────────────────────────────

    async def _intent_full(self, query: str, file_content: str | None) -> tuple[list[str], dict]:
        """Full LLM intent classification + entity extraction."""
        try:
            system = PromptLoader.render_intent_system()
            user = PromptLoader.render_intent_user(query)
            raw = await call_llm(
                system=system, user=user,
                temperature=0.1, response_format={"type": "json_object"},
            )
            data = json.loads(raw) if raw else {}
            entities = data.get("raw_entities", [])
            task_config = {
                "intent_type": data.get("intent_type", "graph_qa"),
                "reasoning": data.get("reasoning", ""),
                "confidence": data.get("confidence", 0.5),
            }
            return entities, task_config, None
        except Exception as exc:
            logger.warning("[UnifiedEngine] Intent classification failed: %s", exc)
            return [], {"intent_type": "graph_qa"}, None

    async def _intent_light(
        self, query: str, intent_hint: str, file_content: str | None,
    ) -> tuple[list[str], dict]:
        """Light intent: skip classification LLM but still extract entities."""
        try:
            bracket_match = __import__("re").search(r"\[(.*?)\]", query)
            bracket_entity = bracket_match.group(1) if bracket_match else ""

            # Use IntentAgent for entity extraction only
            intent = await IntentAgent.parse(query, intent_hint=intent_hint)
            entity = (
                bracket_entity
                if bracket_entity
                else (intent.Start_Entities[0] if intent.Start_Entities else "")
            )
            entities = [entity] if entity else []

            # If file content is provided, also extract entities from it
            if file_content and not entities:
                extraction = await RiskAnalysisEngine._extract_from_file_content_llm(file_content)
                entities = extraction.get("entities", [])

            return entities, {"intent_type": intent_hint}, intent
        except Exception as exc:
            logger.warning("[UnifiedEngine] Light intent failed: %s", exc)
            return [], {"intent_type": intent_hint}, None

    # ── Subgraph retrieval ──────────────────────────────────────────

    async def _retrieve_subgraph(
        self,
        query: str,
        resolved_entities: list[ResolvedEntity],
        max_hop: int,
        intent_type: str,
        parsed_intent=None,
    ) -> EvidenceSubgraph:
        """Retrieve evidence subgraph via DRAEngine or fallback Neo4j queries."""
        entity_names = [r.canonical_name for r in resolved_entities if r.canonical_name]

        # Try DRAEngine if available
        if self.dra and hasattr(self.dra, "retrieve_evidence_subgraph"):
            try:
                relation_focus = (
                    ["INVEST", "CONTROL", "GUARANTEE", "SERVE", "TRANSACTION",
                     "WARNING", "MENTION", "WORK", "REFLECTS"]
                    if intent_type == "risk_analysis" else None
                )
                raw = await self.dra.retrieve_evidence_subgraph(
                    query=query,
                    entities=entity_names or None,
                    max_hops=max_hop,
                    intent_type=intent_type,
                    relation_focus=relation_focus,
                    intent_obj=parsed_intent,
                )
                subgraph = _coerce_evidence_subgraph(raw)

                logger.warning(
                    "[UnifiedEngine][DRA] subgraph nodes=%s edges=%s insufficient=%s",
                    len(subgraph.nodes), len(subgraph.edges), subgraph.insufficient_entities,
                )
                return subgraph
            except Exception as exc:
                logger.exception("[UnifiedEngine] DRAEngine retrieve failed: %s, using fallback", exc)

        # Fallback: direct Neo4j queries
        return await self._fallback_subgraph(entity_names, max_hop)

    async def _fallback_subgraph(
        self, entity_names: list[str], max_hop: int,
    ) -> EvidenceSubgraph:
        """Fallback subgraph retrieval when DRAEngine is unavailable."""
        if not entity_names:
            return EvidenceSubgraph(insufficient_entities=True)

        all_nodes: dict[str, dict] = {}
        all_edges: dict[str, dict] = {}

        for name in entity_names[:3]:
            escaped = name.replace("'", "\\'")
            cypher = f"""
            MATCH (n)
            WHERE coalesce(n.name, n.COMPANY_NM, n.PERSON_NM, n.title) = '{escaped}'
            WITH n LIMIT 3
            MATCH (n)-[r*1..{max_hop}]-(m)
            RETURN n, r, m LIMIT 200
            """
            try:
                rows = await asyncio.to_thread(db_client.execute_read, cypher, None, 15.0)
                n, e = RiskAnalysisEngine._collect_subgraph(rows)
                all_nodes.update(n)
                all_edges.update(e)
            except Exception as exc:
                logger.warning("[UnifiedEngine] Fallback query failed for '%s': %s", name, exc)

        node_list = list(all_nodes.values())
        edge_list = list(all_edges.values())

        if not node_list:
            return EvidenceSubgraph(insufficient_entities=True)

        return EvidenceSubgraph(
            nodes=node_list,
            edges=edge_list,
            graph_summary={"node_count": len(node_list), "edge_count": len(edge_list)},
            confidence=0.6 if node_list else 0.0,
        )

    # ── Graph Analytics ─────────────────────────────────────────────

    async def _run_graph_analytics(self, subgraph: EvidenceSubgraph) -> GraphAnalyticsResult:
        """Run all graph analytics computations on the evidence subgraph.

        Each step is isolated — a failure in one step does not crash the pipeline.
        """
        nodes = subgraph.nodes
        edges = subgraph.edges

        def _safe_call(name, fn, *args):
            try:
                return fn(*args)
            except Exception as exc:
                logger.warning("[GraphAnalytics] %s failed: %s", name, exc)
                return {} if name != "centrality" else []

        entity_stats = _safe_call("entity_stats", self.graph_tool.compute_entity_stats, nodes)
        relation_stats = _safe_call("relation_stats", self.graph_tool.compute_relation_stats, edges)
        central_nodes = _safe_call("centrality", self.graph_tool.compute_centrality, nodes, edges)
        candidate_risk_paths = _safe_call(
            "risk_paths", self.graph_tool.enumerate_candidate_risk_paths, nodes, edges,
        )
        graph_metrics = _safe_call("graph_metrics", self.graph_tool.compute_graph_metrics, nodes, edges)

        community_info = _safe_call("community", self.community_tool.detect_communities, nodes, edges)
        entity_comm_map = _safe_call(
            "entity_comm_map",
            self.community_tool.map_entities_to_communities,
            entity_stats, community_info, nodes, edges,
        )

        indicators = _safe_call(
            "scoring_indicators",
            self.graph_tool.compute_scoring_indicators,
            nodes, edges, community_info.get("communities", []),
        )

        return GraphAnalyticsResult(
            entity_stats=entity_stats,
            relation_stats=relation_stats,
            communities=community_info,
            entity_community_map=entity_comm_map,
            central_nodes=central_nodes,
            candidate_risk_paths=candidate_risk_paths,
            graph_metrics={**graph_metrics, **indicators},
        )

    # ── Risk plugins pipeline ───────────────────────────────────────

    async def _run_risk_plugins(
        self,
        sid: str,
        round_id: int,
        query: str,
        subgraph: EvidenceSubgraph,
        analytics: GraphAnalyticsResult,
        resolved_entities: list[ResolvedEntity],
        unresolved_entities: list[ResolvedEntity],
    ) -> AsyncGenerator[str, None]:
        """Run the full risk analysis plugin chain."""
        nodes = subgraph.nodes
        edges = subgraph.edges

        # ── Risk Analyst ────────────────────────────────────────────
        logger.warning("[UnifiedEngine] Stage: risk_analyst")
        yield _envelope(sid, round_id, "risk_analysis", "stage", "running",
                        {"stage_name": "风险分析", "agent_action": "解释风险路径与异常..."})

        analyst_result = await self.risk_analyst.analyze(
            nodes, edges, analytics.candidate_risk_paths, {"confidence": subgraph.confidence},
        )
        interpreted_paths = analyst_result.get("interpreted_risk_paths", [])
        anomalies = analyst_result.get("anomalies", [])

        # Merge candidate + interpreted paths (dedup by path_id), preferring
        # interpreted when both exist for the same path
        merged_path_ids: set[str] = set()
        merged_paths: list[dict] = []
        for p in interpreted_paths:
            pid = p.get("path_id", "")
            if pid and pid not in merged_path_ids:
                merged_path_ids.add(pid)
                merged_paths.append(p)
        for p in analytics.candidate_risk_paths:
            pid = p.get("path_id", "")
            if pid and pid not in merged_path_ids:
                merged_path_ids.add(pid)
                merged_paths.append(p)

        yield _envelope(sid, round_id, "risk_analysis", "risk_paths", "success", {
            "candidate_paths": analytics.candidate_risk_paths,
            "interpreted_paths": interpreted_paths,
            "merged_paths": merged_paths,
        })
        yield _envelope(sid, round_id, "risk_analysis", "anomaly_findings", "success", anomalies)

        # ── Compliance ──────────────────────────────────────────────
        logger.warning("[UnifiedEngine] Stage: compliance")
        yield _envelope(sid, round_id, "compliance", "stage", "running",
                        {"stage_name": "合规匹配", "agent_action": "匹配法规与违规评估..."})

        compliance_matches = await self.compliance.match(interpreted_paths, anomalies, nodes)

        yield _envelope(sid, round_id, "compliance", "compliance", "success", compliance_matches)

        # ── Compliance Scores (per-node) ──────────────────────────────
        compliance_scores = ComplianceScorer.score_nodes(nodes, compliance_matches)
        yield _envelope(sid, round_id, "compliance", "compliance_scores", "success", compliance_scores)

        # ── Risk Scoring ────────────────────────────────────────────
        logger.warning("[UnifiedEngine] Stage: risk_scoring")
        yield _envelope(sid, round_id, "scoring", "stage", "running",
                        {"stage_name": "风险评分", "agent_action": "多维度风险评分..."})

        indicators = analytics.graph_metrics
        scoring_result = self.scoring.score(
            indicators, interpreted_paths, anomalies, compliance_matches,
            subgraph_confidence=subgraph.confidence,
            resolved_entity_count=len(resolved_entities),
            total_entity_count=len(resolved_entities) + len(unresolved_entities),
        )

        if scoring_result["level"] == "insufficient_evidence":
            yield _envelope(sid, round_id, "scoring", "scoring", "warning", scoring_result)
            yield _envelope(sid, round_id, "done", "done", "success",
                            {"level": "insufficient_evidence",
                             "message": "未检索到足够关系证据，无法形成稳定风险评级"})
            return

        # LLM explanation (non-blocking — continue with base scores if fails)
        scoring_result = await self.scoring.explain_and_adjust(scoring_result)
        yield _envelope(sid, round_id, "scoring", "scoring", "success", scoring_result)

        # ── Governance ──────────────────────────────────────────────
        logger.warning("[UnifiedEngine] Stage: governance")
        yield _envelope(sid, round_id, "governance", "stage", "running",
                        {"stage_name": "治理方案", "agent_action": "生成协同治理方案..."})

        governance_plan = await self.governance.plan(
            scoring_result, compliance_matches, interpreted_paths, anomalies,
            analytics.communities,
        )
        yield _envelope(sid, round_id, "governance", "governance", "success", governance_plan)

        # ── Evidence Builder ────────────────────────────────────────
        evidence_chains = self.evidence_builder.build(
            {"nodes": nodes, "edges": edges,
             "evidence_paths": subgraph.evidence_paths,
             "cypher_records": subgraph.cypher_records,
             "verified_claims": subgraph.verified_claims,
             "confidence": subgraph.confidence},
            analytics,
        )

        # ── Compliance Indicators (34-indicator hierarchy) ────────────
        indicator_scores = self.compliance_indicator_engine.compute(
            nodes, edges, interpreted_paths, compliance_matches,
            evidence_chains={
                "chains": [{"claim_id": c.claim_id, "claim": c.claim,
                            "confidence": c.confidence, "verifier_score": c.verifier_score}
                           for c in evidence_chains.chains],
                "overall_confidence": evidence_chains.overall_confidence,
            },
            risk_scores=scoring_result,
        )
        yield _envelope(sid, round_id, "compliance", "compliance_indicators", "success",
                        {"indicators": indicator_scores})

        # ── Reporter ────────────────────────────────────────────────
        logger.warning("[UnifiedEngine] Stage: report")
        yield _envelope(sid, round_id, "reporting", "stage", "running",
                        {"stage_name": "报告生成", "agent_action": "生成结构化风险报告..."})

        report = await self.reporter.generate(
            query=query,
            trigger_event=None,
            node_count=len(nodes),
            edge_count=len(edges),
            risk_paths=interpreted_paths,
            anomalies=anomalies,
            compliance_matches=compliance_matches,
            scoring_result=scoring_result,
            governance_plan=governance_plan,
            evidence_chains={
                "chains": [{"claim_id": c.claim_id, "claim": c.claim,
                            "confidence": c.confidence}
                           for c in evidence_chains.chains],
                "overall_confidence": evidence_chains.overall_confidence,
            },
            resolved_entities=[self._serialize_resolved(r) for r in resolved_entities],
        )

        # Build comprehensive output
        output = {
            "executive_summary": report.get("executive_summary", ""),
            "entity_stats": analytics.entity_stats,
            "community_info": analytics.communities,
            "entity_community_map": analytics.entity_community_map,
            "risk_paths": interpreted_paths,
            "anomaly_findings": anomalies,
            "compliance_matches": compliance_matches,
            "risk_scores": scoring_result,
            "governance_plan": governance_plan,
            "overall_risk_level": scoring_result.get("level", "medium"),
            "recommendations": report.get("recommendations", []),
            "integrated_report": report.get("markdown_report", ""),
            "markdown_report": report.get("markdown_report", ""),
            "subtasks_completed": 6,
            "subgraph_summary": {
                "node_count": len(nodes),
                "edge_count": len(edges),
            },
            "resolved_entities": [self._serialize_resolved(r) for r in resolved_entities],
            "evidence_chains": {
                "chains": [{"claim_id": c.claim_id, "claim": c.claim,
                            "confidence": c.confidence}
                           for c in evidence_chains.chains],
                "overall_confidence": evidence_chains.overall_confidence,
            },
        }

        yield _envelope(sid, round_id, "reporting", "report", "success", output)
        yield _envelope(sid, round_id, "done", "done", "success",
                        {"intent_type": "risk_analysis",
                         "risk_level": scoring_result.get("level"),
                         "node_count": len(nodes),
                         "edge_count": len(edges)})

    # ── Helpers ─────────────────────────────────────────────────────

    @staticmethod
    def _serialize_resolved(r: ResolvedEntity) -> dict:
        return {
            "raw": r.raw,
            "canonical_name": r.canonical_name,
            "kg_node_id": r.kg_node_id,
            "match_type": r.match_type,
            "match_score": r.match_score,
            "confidence": r.confidence,
        }
