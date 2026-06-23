"""Governance API routes — community discovery and risk path analysis.

All endpoints use the unified Neo4jClient for database access and
GraphAnalytics for community detection.
"""

import logging
import time
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.database import Neo4jClient
from kg_query.analytics import risk_path_enumeration as rpe

logger = logging.getLogger("api.governance")

router = APIRouter(prefix="/api/v1/governance", tags=["governance"])

# Lazy-init on first use
_db: Neo4jClient | None = None


def _client() -> Neo4jClient:
    global _db
    if _db is None:
        _db = Neo4jClient.from_env()
    return _db


# ── Pydantic models ─────────────────────────────────────────────────


class RiskConstraints(BaseModel):
    includeSubjectRelations: bool = Field(default=True)
    includeEventRelations: bool = Field(default=True)
    includeFeatureRelations: bool = Field(default=True)
    includeRegulationRelations: bool = Field(default=False)


class CommunityDiscoveryRequest(BaseModel):
    seedNames: list[str] = Field(default_factory=list)
    seedIds: list[str] = Field(default_factory=list)
    autoSelectSeeds: bool = Field(default=False)
    topKSeeds: int = Field(default=5)
    seedSelectionMode: str = Field(default="risk_score")
    riskConstraints: RiskConstraints = Field(default_factory=RiskConstraints)
    maxHop: int = Field(default=3, ge=1, le=5)
    method: str = Field(default="auto")
    communityMode: str = Field(default="expanded")
    minCommunitySize: int = Field(default=2, ge=1)
    pathLimit: int = Field(default=5000, ge=50, le=10000)
    maxNodes: int = Field(default=1000, ge=10, le=5000)
    relationWhitelist: list[str] = Field(default_factory=list)
    responseMode: str = Field(default="full")
    includeRawSubgraph: bool = Field(default=True)
    includeCommunityGraph: bool = Field(default=True)
    includeHgtEmbedding: bool = Field(default=False)


class RiskPathsRequest(BaseModel):
    seedNames: list[str] = Field(default_factory=list)
    seedIds: list[str] = Field(default_factory=list)
    maxHop: int = Field(default=3, ge=1, le=5)
    maxPathLength: int = Field(default=4, ge=2, le=8)
    method: str = Field(default="auto")
    communityMode: str = Field(default="expanded")
    includeCommunityDiscovery: bool = Field(default=True)
    includeCommunityPath: bool = Field(default=True)
    includeNodePath: bool = Field(default=True)
    riskRelationWhitelist: list[str] = Field(default_factory=list)
    subgraphPathLimit: int = Field(default=5000, ge=50, le=10000)
    riskPathLimit: int = Field(default=20, ge=1, le=100)
    maxBranchPerNode: int = Field(default=20, ge=1, le=50)
    minRiskScore: int = Field(default=50, ge=0, le=100)
    responseMode: str = Field(default="full")


# ── Helpers ─────────────────────────────────────────────────────────


def _snake_to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _to_camel(obj: Any) -> Any:
    """Recursively convert dict keys from snake_case to camelCase."""
    if isinstance(obj, dict):
        result: dict[str, Any] = {}
        for key, value in obj.items():
            camel_key = _snake_to_camel(key)
            # Keep special keys that should stay snake_case
            if key in ("by_id",):
                result[key] = _to_camel(value)
            else:
                result[camel_key] = _to_camel(value)
        return result
    if isinstance(obj, list):
        return [_to_camel(item) for item in obj]
    return obj


def _flatten_entity_community_map(entity_map: dict, seed_ids: list[str]) -> dict[str, dict]:
    """Flatten entity_community_map to {node_id: {communityId, role, isSeed, riskLevel}}.

    The existing _build_entity_community_map returns:
        {"entities": [...], "by_id": {node_id: {..., communities: [...]}}}

    We flatten to a format suitable for frontend consumption and risk_path
    community_path mapping.
    """
    seed_set = set(seed_ids)
    by_id: dict[str, dict] = entity_map.get("by_id", {}) if isinstance(entity_map, dict) else {}
    result: dict[str, dict] = {}

    for node_id, entry in by_id.items():
        communities = entry.get("communities", [])
        if not communities:
            continue
        primary = communities[0]
        member_type = entry.get("type", "Unknown")
        result[str(node_id)] = {
            "id": str(node_id),
            "name": entry.get("name", ""),
            "type": member_type,
            "communityId": primary.get("community_id", 0),
            "role": primary.get("role", "member"),
            "isSeed": str(node_id) in seed_set,
            "riskLevel": _derive_risk_level(entry, member_type),
        }

    return result


def _derive_risk_level(entry: dict, member_type: str) -> str:
    """Derive risk level from entity properties."""
    risk = str(entry.get("risk_level", "") or entry.get("riskLevel", "") or "").lower()
    if risk in ("high", "medium", "low"):
        return risk
    return ""


def _build_response(result: dict, req: CommunityDiscoveryRequest, elapsed_ms: int) -> dict:
    """Transform discover_seeded_communities() output to the API response format."""
    resolved_seed_ids = [
        str(n.get("id", "")) for n in result.get("seed_nodes", []) if n.get("id")
    ]
    entity_map_raw = result.get("entity_community_map", {})

    warnings = []
    fallback_reason = result.get("fallback_reason")
    if fallback_reason:
        warnings.append(fallback_reason)

    response = {
        "success": result.get("success", False),
        "apiVersion": "v1",
        "traceId": f"trc-{int(time.time() * 1000)}",
        "elapsedMs": elapsed_ms,
        "selectedMethod": result.get("selected_method", ""),
        "fallbackReason": fallback_reason,
        "seedNodes": result.get("seed_nodes", []),
        "candidateSeeds": result.get("candidate_seeds", []),
        "selectedSeedIds": result.get("selected_seed_ids", []),
        "seedSelection": result.get("seed_selection", {}),
        "summary": {
            "nodeCount": result.get("node_count", 0),
            "edgeCount": result.get("edge_count", 0),
            "communityCount": result.get("community_count", 0),
            "seedCommunityId": result.get("seed_community_id"),
        },
        "warnings": warnings,
    }

    # If full mode, populate detailed fields
    if req.responseMode == "full":
        response.update({
            "communities": result.get("communities", []),
            "entityCommunityMap": _flatten_entity_community_map(entity_map_raw, resolved_seed_ids),
            "visualization": {
                "defaultView": "community_graph",
                "suggestedLayout": "clustered_force",
                "highlightCommunityId": result.get("seed_community_id"),
            },
            "connectedSubgraph": {
                "nodeCount": result.get("node_count", 0),
                "edgeCount": result.get("edge_count", 0),
                "nodes": result.get("connected_subgraph", {}).get("nodes", []),
                "edges": result.get("connected_subgraph", {}).get("edges", []),
            },
        })

        if req.includeRawSubgraph:
            response["subgraph"] = {
                "nodeCount": len(result.get("subgraph", {}).get("nodes", [])),
                "edgeCount": len(result.get("subgraph", {}).get("edges", [])),
                "nodes": result.get("subgraph", {}).get("nodes", []),
                "edges": result.get("subgraph", {}).get("edges", []),
            }
        else:
            response["subgraph"] = None

        if req.includeCommunityGraph:
            response.update({
                "communityEdges": result.get("community_edges", []),
                "communityGraph": result.get("community_graph", {}),
            })
        else:
            response.update({
                "communityEdges": [],
                "communityGraph": {},
            })

    return _to_camel(response)


# ── Route handlers ───────────────────────────────────────────────────


@router.post("/community-discovery")
def community_discovery(req: CommunityDiscoveryRequest):
    """Discover communities from seed entities via k-hop ego network expansion.

    Accepts entity names or Neo4j elementIds, extracts the connected
    subgraph, detects communities (WCC / Louvain / HGT-GKMeans with
    fallback chain), and returns a community graph suitable for
    two-level zoom visualization.
    """
    from kg_query.analytics.graph_analytics import GraphAnalytics

    t0 = time.perf_counter()

    seed_names = [s.strip() for s in req.seedNames if s and s.strip()]
    seed_ids = [s.strip() for s in req.seedIds if s and s.strip()]

    logger.info(
        "[CommunityAPI] seedNames=%s seedIds=%s method=%s maxHop=%s mode=%s",
        seed_names, seed_ids, req.method, req.maxHop, req.communityMode,
    )

    analytics = GraphAnalytics(db_client=_client())
    result = analytics.discover_seeded_communities(
        seed_names=seed_names,
        seed_ids=seed_ids,
        auto_select_seeds=req.autoSelectSeeds,
        top_k_seeds=req.topKSeeds,
        seed_selection_mode=req.seedSelectionMode,
        risk_constraints=req.riskConstraints.dict() if req.riskConstraints else None,
        max_hop=req.maxHop,
        method=req.method,
        min_community_size=req.minCommunitySize,
        path_limit=req.pathLimit,
        max_nodes=req.maxNodes,
        relation_whitelist=req.relationWhitelist,
        community_mode=req.communityMode,
    )

    # Log key metrics
    logger.info(
        "[CommunityExpanded] nodes=%s edges=%s mode=%s",
        result.get("node_count"), result.get("edge_count"), req.communityMode,
    )
    logger.info(
        "[CommunityDetection] selected_method=%s community_count=%s fallback_reason=%s",
        result.get("selected_method"),
        result.get("community_count"),
        result.get("fallback_reason"),
    )
    seed_cid = result.get("seed_community_id")
    if seed_cid is not None:
        seed_members = [
            str(n.get("id", ""))
            for n in result.get("seed_nodes", [])
            if n.get("id")
        ]
        logger.info(
            "[CommunitySeed] seedCommunityId=%s seedNodeIds=%s",
            seed_cid, seed_members[:10],
        )
    cg = result.get("community_graph", {})
    logger.info(
        "[CommunityGraph] nodes=%s edges=%s",
        len(cg.get("nodes", [])), len(cg.get("edges", [])),
    )

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    return _build_response(result, req, elapsed_ms)


@router.post("/risk-paths")
def risk_paths(req: RiskPathsRequest):
    """Discover risk transmission paths from seed entities.

    Extracts the k-hop connected subgraph, optionally detects communities,
    enumerates multi-hop risk paths via BFS, scores and ranks them, and
    returns node-level paths, community-level paths, and a frontend
    view model for highlighting.
    """
    from kg_query.analytics.graph_analytics import GraphAnalytics

    t0 = time.perf_counter()

    seed_names = [s.strip() for s in req.seedNames if s and s.strip()]
    seed_ids = [s.strip() for s in req.seedIds if s and s.strip()]

    if not seed_names and not seed_ids:
        return {
            "success": False,
            "traceId": f"trc-{int(time.time() * 1000)}",
            "error": "seedNames or seedIds is required",
        }

    logger.info(
        "[RiskPathAPI] seedNames=%s seedIds=%s maxHop=%s maxPathLength=%s "
        "includeCommDisc=%s method=%s",
        seed_names, seed_ids, req.maxHop, req.maxPathLength,
        req.includeCommunityDiscovery, req.method,
    )

    analytics = GraphAnalytics(db_client=_client())

    # ── 1. Subgraph extraction + optional community discovery ──
    comm_result = analytics.discover_seeded_communities(
        seed_names=seed_names,
        seed_ids=seed_ids,
        max_hop=req.maxHop,
        method=req.method,
        min_community_size=2,
        path_limit=req.subgraphPathLimit,
        max_nodes=500,  # generous cap for path enumeration
        relation_whitelist=req.riskRelationWhitelist,
        community_mode=req.communityMode,
    )

    if not comm_result.get("success"):
        return {
            "success": False,
            "traceId": f"trc-{int(time.time() * 1000)}",
            "error": comm_result.get("error", "Subgraph extraction failed"),
        }

    connected = comm_result.get("connected_subgraph", {})
    subgraph_nodes = connected.get("nodes", [])
    subgraph_edges = connected.get("edges", [])
    seed_nodes = comm_result.get("seed_nodes", [])

    if not subgraph_nodes:
        elapsed_ms = int((time.perf_counter() - t0) * 1000)
        return {
            "success": True,
            "traceId": f"trc-{int(time.time() * 1000)}",
            "elapsedMs": elapsed_ms,
            "summary": {
                "seedNodeCount": len(seed_nodes),
                "nodeCount": 0,
                "edgeCount": 0,
                "communityCount": comm_result.get("community_count", 0),
                "candidatePathCount": 0,
                "riskPathCount": 0,
                "highRiskCount": 0,
                "mediumRiskCount": 0,
                "lowRiskCount": 0,
            },
            "seedNodes": seed_nodes,
            "communityDiscovery": None,
            "riskPaths": [],
            "communityRiskPaths": [],
            "viewModel": {},
            "warnings": ["No connected subgraph found for seed nodes"],
        }

    # ── 2. Resolve seed IDs ──
    resolved_seed_ids = [
        str(n.get("id", "")) for n in seed_nodes if n.get("id")
    ]
    if not resolved_seed_ids:
        # Fallback: use connected subgraph node IDs that match seed names
        resolved_seed_ids = [
            str(n.get("id", ""))
            for n in subgraph_nodes
            if n.get("id")
        ][:10]

    # ── 3. Build node_map for path description ──
    node_map = rpe.build_node_map(subgraph_nodes)

    # ── 4. Build entity_community_map ──
    entity_map_raw = comm_result.get("entity_community_map", {})
    entity_community_map = _flatten_entity_community_map(entity_map_raw, resolved_seed_ids)

    # ── 5. Enumerate multi-hop risk paths ──
    raw_paths = rpe.enumerate_multi_hop_risk_paths(
        nodes=subgraph_nodes,
        edges=subgraph_edges,
        seed_ids=resolved_seed_ids,
        max_path_length=req.maxPathLength,
        max_branch=req.maxBranchPerNode,
        relation_whitelist=req.riskRelationWhitelist if req.riskRelationWhitelist else None,
    )

    # ── 6. Score and enrich paths ──
    scored_paths = rpe.score_risk_paths(
        raw_paths=raw_paths,
        node_map=node_map,
        entity_community_map=entity_community_map,
        max_path_length=req.maxPathLength,
    )

    # ── 7. Filter and limit ──
    filtered = [p for p in scored_paths if p["score"] >= req.minRiskScore]
    limited = filtered[:req.riskPathLimit]

    # ── 8. Build community risk paths ──
    community_risk_paths: list[dict] = []
    if req.includeCommunityPath:
        community_risk_paths = rpe.build_community_risk_paths(limited)

    # ── 9. Build view model ──
    view_model = rpe.build_view_model(limited)

    # ── 10. Build summary ──
    high_count = sum(1 for p in limited if p["risk_level"] == "high")
    med_count = sum(1 for p in limited if p["risk_level"] == "medium")
    low_count = sum(1 for p in limited if p["risk_level"] == "low")

    summary = {
        "seedNodeCount": len(seed_nodes),
        "nodeCount": len(subgraph_nodes),
        "edgeCount": len(subgraph_edges),
        "communityCount": comm_result.get("community_count", 0),
        "candidatePathCount": len(raw_paths),
        "riskPathCount": len(limited),
        "highRiskCount": high_count,
        "mediumRiskCount": med_count,
        "lowRiskCount": low_count,
    }

    # ── 11. Build community discovery summary ──
    community_discovery: dict | None = None
    if req.includeCommunityDiscovery:
        community_discovery = {
            "seedCommunityId": comm_result.get("seed_community_id"),
            "selectedMethod": comm_result.get("selected_method", ""),
            "communityCount": comm_result.get("community_count", 0),
            "communityGraph": _to_camel(comm_result.get("community_graph", {})),
            "entityCommunityMap": entity_community_map,
        }

    # ── 12. Build warnings ──
    warnings: list[str] = []
    fallback = comm_result.get("fallback_reason")
    if fallback:
        warnings.append(fallback)
    if len(raw_paths) == 0:
        warnings.append("未找到任何风险传导路径，可能是子图节点过少或关系类型不在风险白名单中。")
    if len(filtered) < len(scored_paths):
        warnings.append(
            f"已过滤 {len(scored_paths) - len(filtered)} 条低分路径 (minRiskScore={req.minRiskScore})"
        )

    elapsed_ms = int((time.perf_counter() - t0) * 1000)

    response_data = {
        "success": True,
        "traceId": f"trc-{int(time.time() * 1000)}",
        "elapsedMs": elapsed_ms,
        "summary": summary,
        "seedNodes": seed_nodes,
        "communityDiscovery": community_discovery,
        "riskPaths": _to_camel(limited) if req.includeNodePath else [],
        "communityRiskPaths": _to_camel(community_risk_paths),
        "viewModel": _to_camel(view_model),
        "warnings": warnings,
    }

    logger.info(
        "[RiskPathAPI] response_paths=%d community_paths=%d elapsed_ms=%d",
        len(limited), len(community_risk_paths), elapsed_ms,
    )

    return response_data
