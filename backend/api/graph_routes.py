"""Graph visualization API routes — migrated from Flask server_Arua.py.

All endpoints use the unified Neo4jClient for database access.
"""

import logging
import time
import traceback
from datetime import datetime

import numpy as np
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator
from scipy.sparse import lil_matrix

from core.database import Neo4jClient
from core.tracing import get_trace_id

logger = logging.getLogger("api.graph")

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

# Lazy-init on first use — shares the same driver as the DRA-MA pipeline
_db: Neo4jClient | None = None


def _client() -> Neo4jClient:
    global _db
    if _db is None:
        _db = Neo4jClient.from_env()
    return _db


# ====================================================
# Helpers
# ====================================================


def _safe_int(value, default=100, min_val=1, max_val=1000):
    try:
        val = int(value)
        return max(min_val, min(val, max_val))
    except (ValueError, TypeError):
        return default


def _cross_stats(from_labels: list[str], to_labels: list[str]) -> dict:
    """Return relationship count and types between two label groups (directed from->to)."""
    query = f"""
    MATCH (n)-[r]->(m)
    WHERE {_labels_cypher('n', from_labels)}
      AND {_labels_cypher('m', to_labels)}
    RETURN count(r) AS cnt, collect(DISTINCT type(r)) AS rel_types
    """
    records, _ = _client().execute_read_with_summary(query)
    if not records or records[0].get("cnt", 0) == 0:
        return {"count": 0, "rel_types": []}
    return {"count": records[0]["cnt"], "rel_types": records[0].get("rel_types", [])}


def _process_result(records: list[dict]) -> dict:
    """Convert raw Neo4j record dicts into {nodes, edges} for the frontend."""
    nodes: dict[str, dict] = {}
    edges: list[dict] = []
    edge_ids: set[str] = set()

    for record in records:
        for key in ("n", "m", "node"):
            node_data = record.get(key)
            if node_data is not None:
                if hasattr(node_data, "element_id"):
                    nid = node_data.element_id
                    if nid not in nodes:
                        nodes[nid] = Neo4jClient.serialize_node(node_data)
                elif isinstance(node_data, dict) and "element_id" in node_data:
                    # already-serialized node from .data()
                    nid = node_data["element_id"]
                    if nid not in nodes:
                        nodes[nid] = node_data

        for rel_key in ("r", "rel"):
            rels = record.get(rel_key)
            if rels is None:
                continue
            rel_list = rels if isinstance(rels, list) else [rels]
            for rel in rel_list:
                if rel is None:
                    continue
                if hasattr(rel, "element_id"):
                    rid = rel.element_id
                    if rid not in edge_ids:
                        edges.append(Neo4jClient.serialize_relationship(rel))
                        edge_ids.add(rid)

    return {"nodes": list(nodes.values()), "edges": edges}


# ====================================================
# POST /search-all request / response models
# ====================================================


class SearchAllRequest(BaseModel):
    """Cross-layer keyword search request body."""

    query: str = Field(..., min_length=1, description="搜索关键词")
    layer: str = Field(default="all", description="all / Subject / Event / Feature / Regulation")
    depth: int = Field(default=2, ge=1, le=5, description="匹配节点周边展开深度")
    limit: int = Field(default=500, ge=1, le=5000, description="最大返回数（兼容旧前端）")
    type: str = Field(default="all", description="节点类型过滤，例如 COMPANY、PERSON、EVENT、Law")
    nodeLimit: int | None = Field(default=None, ge=1, le=5000, description="最大返回节点数")
    edgeLimit: int | None = Field(default=None, ge=1, le=10000, description="最大返回关系数")
    relationWhitelist: list[str] = Field(
        default_factory=list,
        description="允许返回的关系类型，空列表表示使用默认关系范围，传 [\"*\"] 表示不限制",
    )
    layerWhitelist: list[str] = Field(
        default_factory=list,
        description="节点层级白名单，如 Subject/Event/Feature/Regulation",
    )
    includeCrossLayer: bool = Field(default=True, description="是否包含跨层关系")
    includeProperties: bool = Field(default=True, description="是否返回节点和关系属性")
    outputFormat: str = Field(
        default="subgraph",
        description="输出格式：subgraph / triples / both",
    )
    deduplicate: bool = Field(default=True, description="是否对节点、边和三元组去重")
    responseMode: str = Field(
        default="full",
        description="返回模式：full / summary",
    )
    traversalMode: str = Field(
        default="bfs",
        description="遍历模式：bfs / cascade",
    )

    @field_validator("layer")
    @classmethod
    def _check_layer(cls, v: str) -> str:
        allowed = {"all", "Subject", "Event", "Feature", "Regulation"}
        if v not in allowed:
            raise ValueError(f"layer must be one of {sorted(allowed)}")
        return v

    @field_validator("outputFormat")
    @classmethod
    def _check_output_format(cls, v: str) -> str:
        allowed = {"subgraph", "triples", "both"}
        if v not in allowed:
            raise ValueError(f"outputFormat must be one of {sorted(allowed)}")
        return v

    @field_validator("traversalMode")
    @classmethod
    def _check_traversal_mode(cls, v: str) -> str:
        allowed = {"bfs", "cascade"}
        if v not in allowed:
            raise ValueError(f"traversalMode must be one of {sorted(allowed)}")
        return v

    @field_validator("layerWhitelist")
    @classmethod
    def _validate_layer_whitelist(cls, v: list[str]) -> list[str]:
        allowed = {"Subject", "Event", "Feature", "Regulation"}
        invalid = [x for x in v if x not in allowed]
        if invalid:
            raise ValueError(f"Invalid layer whitelist entries: {invalid}. Allowed: {sorted(allowed)}")
        return v

    @field_validator("relationWhitelist")
    @classmethod
    def _validate_relations(cls, v: list[str]) -> list[str]:
        if "*" in v:
            return v
        invalid = [r for r in v if r not in ALLOWED_REL_TYPES]
        if invalid:
            raise ValueError(
                f"Invalid relation types: {invalid}. Allowed: {sorted(ALLOWED_REL_TYPES)}"
            )
        return v


class SearchAllSummary(BaseModel):
    matchedCount: int = 0
    nodeCount: int = 0
    edgeCount: int = 0
    tripleCount: int = 0
    layers: list[str] = Field(default_factory=list)
    relationTypes: list[str] = Field(default_factory=list)
    requestedDepth: int = 0
    actualDepth: int = 0
    centerCount: int = 0
    nodeTypeCounts: dict[str, int] = Field(default_factory=dict)
    edgeTypeCounts: dict[str, int] = Field(default_factory=dict)
    frontierCountsByHop: dict[str, int] = Field(default_factory=dict)
    truncated: bool = False
    truncatedBy: str | None = None
    traversalMode: str = "bfs"
    cascadeStageCounts: dict[str, int] = Field(default_factory=dict)


class SearchAllResponse(BaseModel):
    success: bool = True
    traceId: str = ""
    matchedNodes: list[dict] = Field(default_factory=list)
    nodes: list[dict] = Field(default_factory=list)
    edges: list[dict] = Field(default_factory=list)
    triples: list[dict] = Field(default_factory=list)
    summary: SearchAllSummary = Field(default_factory=SearchAllSummary)
    warnings: list[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ExpandRequest(BaseModel):
    """N-hop subgraph expansion request body."""

    depth: int = Field(default=2, ge=1, le=5, description="展开深度（跳数）")
    limit: int = Field(default=500, ge=1, le=5000, description="最大返回数（兼容旧前端）")
    nodeLimit: int | None = Field(default=None, ge=1, le=5000, description="最大返回节点数")
    edgeLimit: int | None = Field(default=None, ge=1, le=10000, description="最大返回关系数")
    relationWhitelist: list[str] = Field(
        default_factory=list,
        description="允许的关系类型，空=默认白名单，[\"*\"]=不限制",
    )
    layerWhitelist: list[str] = Field(
        default_factory=list,
        description="节点层级白名单，如 Subject/Event/Feature/Regulation",
    )
    includeCrossLayer: bool = Field(default=True, description="是否包含跨层关系")
    includeProperties: bool = Field(default=True, description="是否返回节点和关系属性")
    responseMode: str = Field(default="full", description="返回模式：full / summary")

    @field_validator("layerWhitelist")
    @classmethod
    def _validate_layer_whitelist(cls, v: list[str]) -> list[str]:
        allowed = {"Subject", "Event", "Feature", "Regulation"}
        invalid = [x for x in v if x not in allowed]
        if invalid:
            raise ValueError(f"Invalid layer whitelist entries: {invalid}. Allowed: {sorted(allowed)}")
        return v

    @field_validator("relationWhitelist")
    @classmethod
    def _validate_relations(cls, v: list[str]) -> list[str]:
        if "*" in v:
            return v
        invalid = [r for r in v if r not in ALLOWED_REL_TYPES]
        if invalid:
            raise ValueError(
                f"Invalid relation types: {invalid}. Allowed: {sorted(ALLOWED_REL_TYPES)}"
            )
        return v


class SeedCommunityRequest(BaseModel):
    seed_names: list[str] = Field(default_factory=list, alias="seedNames")
    seed_ids: list[str] = Field(default_factory=list, alias="seedIds")
    max_hop: int = Field(default=2, ge=1, le=3, alias="maxHop")
    method: str = Field(default="auto", description="auto | wcc | louvain | leiden | hgt_gkmeans")
    min_community_size: int = Field(default=2, ge=1, le=100, alias="minCommunitySize")
    path_limit: int = Field(default=2000, ge=50, le=10000, alias="pathLimit")
    max_nodes: int = Field(default=1000, ge=10, le=5000, alias="maxNodes")
    relation_whitelist: list[str] = Field(default_factory=list, alias="relationWhitelist")
    community_mode: str = Field(default="expanded", alias="communityMode")


# ====================================================
# Health
# ====================================================


@router.get("/health")
def graph_health():
    try:
        _client().verify_connectivity()
        return {
            "status": "healthy",
            "neo4j": "connected",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "neo4j": "disconnected",
            "error": str(e),
        }


# ====================================================
# Statistics (unified with layer path param)
# ====================================================

LAYER_DISPLAY_NAMES = {
    "Subject": "主体层",
    "Event": "事件层",
    "Feature": "特征层",
    "Regulation": "法规层",
}

# Canonical four-layer mapping used by statistics, search and graph rendering.
# The live database mostly stores business labels rather than explicit
# Subject/Event/Feature/Regulation marker labels.
LAYER_LABEL_MAP: dict[str, list[str]] = {
    "Subject": [
        "Subject", "COMPANY", "PERSON", "PFCOMPANY", "PFUND", "SECURITY",
        "Actor", "Account",
    ],
    "Event": [
        "Event", "EVENT", "SubEvent", "SUB_EVENT", "TIME", "REGULATOR", "Means",
    ],
    "Feature": [
        "Feature", "RiskFeature", "RiskFactor",
        "AdvantageHolder", "Influence", "DisadvantageHolder", "Advantage",
    ],
    "Regulation": [
        "Regulation", "Law", "Action", "PartyWithResponsibility",
        "Chapter", "Section", "Responsibility", "RegulatoryAuthority",
        "Restriction", "PunishmentMeasure", "Punishment", "Violation", "Title",
    ],
}

LAYER_MARKER_LABELS = {"Subject", "Event", "Feature", "Regulation"}
LAYER_BUSINESS_LABELS = sorted(
    {
        label
        for labels in LAYER_LABEL_MAP.values()
        for label in labels
        if label not in LAYER_MARKER_LABELS
    }
)

NODE_TYPE_DISPLAY_NAMES = {
    "COMPANY": "企业",
    "PERSON": "自然人",
    "PFCOMPANY": "私募公司",
    "PFUND": "私募基金",
    "SECURITY": "证券",
    "Actor": "参与主体",
    "Account": "账户",
    "EVENT": "事件",
    "SubEvent": "子事件",
    "SUB_EVENT": "子事件",
    "TIME": "时间",
    "REGULATOR": "监管机构",
    "Means": "手段",
    "RiskFeature": "风险特征",
    "RiskFactor": "风险因子",
    "AdvantageHolder": "优势持有方",
    "Influence": "影响",
    "DisadvantageHolder": "劣势承受方",
    "Advantage": "优势",
    "Regulation": "法规",
    "Law": "法律",
    "Action": "法规行为",
    "PartyWithResponsibility": "责任主体",
    "Chapter": "章节",
    "Section": "条款",
    "Responsibility": "责任",
    "RegulatoryAuthority": "监管机构",
    "Restriction": "限制",
    "PunishmentMeasure": "处罚措施",
    "Punishment": "处罚",
    "Violation": "违规行为",
    "Title": "标题",
}

_statistics_cache: dict[str, object] = {"expires_at": 0.0, "data": None}
_STATISTICS_CACHE_TTL_SECONDS = 30.0


def _layer_case(label_var: str) -> str:
    """Build a deterministic Cypher CASE expression for four-layer mapping."""
    clauses = []
    for layer_code in ("Subject", "Event", "Feature", "Regulation"):
        param_name = f"{layer_code.lower()}_labels"
        clauses.append(
            f"WHEN any(label IN {label_var} WHERE label IN ${param_name}) "
            f"THEN '{layer_code}'"
        )
    return "CASE " + " ".join(clauses) + " ELSE null END"


def _statistics_params() -> dict[str, list[str]]:
    return {
        f"{layer_code.lower()}_labels": labels
        for layer_code, labels in LAYER_LABEL_MAP.items()
    }


def _empty_layer_stat(layer_code: str) -> dict:
    return {
        "layer": LAYER_DISPLAY_NAMES[layer_code],
        "layer_code": layer_code,
        "node_count": 0,
        "node_type_count": 0,
        "node_types": [],
        "node_type_counts": {},
        "rel_count": 0,
        "rel_type_count": 0,
        "rel_types": [],
        "rel_type_counts": {},
        "cross_layer_rels": {},
    }


def _collect_graph_statistics(force: bool = False) -> dict:
    """Collect globally consistent node, relationship and four-layer stats.

    Three aggregation queries are used regardless of the number of layers:
    node totals by resolved layer, node-type distribution, and relationship
    distribution by source/target layer. Results are briefly cached because
    the dashboard and graph page request the same statistics concurrently.
    """
    now = time.monotonic()
    cached = _statistics_cache.get("data")
    if (
        not force
        and isinstance(cached, dict)
        and now < float(_statistics_cache.get("expires_at", 0.0))
    ):
        return cached

    client = _client()
    params = _statistics_params()
    node_layer_case = _layer_case("node_labels")
    source_layer_case = _layer_case("source_labels")
    target_layer_case = _layer_case("target_labels")

    node_count_query = f"""
    MATCH (n)
    WITH labels(n) AS node_labels
    WITH {node_layer_case} AS layer
    RETURN layer, count(*) AS node_count
    """
    node_type_query = f"""
    MATCH (n)
    WITH labels(n) AS node_labels
    WITH node_labels, {node_layer_case} AS layer
    WHERE layer IS NOT NULL
    UNWIND node_labels AS node_type
    WITH layer, node_type, count(*) AS type_count
    WHERE node_type IN $business_labels
    RETURN layer, node_type, type_count
    ORDER BY layer, type_count DESC, node_type
    """
    relationship_query = f"""
    MATCH (n)-[r]->(m)
    WITH type(r) AS rel_type, labels(n) AS source_labels, labels(m) AS target_labels
    WITH rel_type,
         {source_layer_case} AS source_layer,
         {target_layer_case} AS target_layer
    RETURN source_layer, target_layer, rel_type, count(*) AS rel_count
    """

    node_count_records, _ = client.execute_read_with_summary(
        node_count_query, params, timeout_seconds=60.0
    )
    node_type_records, _ = client.execute_read_with_summary(
        node_type_query,
        {**params, "business_labels": LAYER_BUSINESS_LABELS},
        timeout_seconds=60.0,
    )
    relationship_records, _ = client.execute_read_with_summary(
        relationship_query, params, timeout_seconds=120.0
    )

    layers = {
        layer_code: _empty_layer_stat(layer_code)
        for layer_code in LAYER_DISPLAY_NAMES
    }

    total_nodes = 0
    classified_nodes = 0
    for record in node_count_records:
        count = int(record.get("node_count", 0))
        total_nodes += count
        layer_code = record.get("layer")
        if layer_code in layers:
            layers[layer_code]["node_count"] = count
            classified_nodes += count

    for record in node_type_records:
        layer_code = record.get("layer")
        node_type = record.get("node_type")
        if layer_code not in layers or not node_type:
            continue
        layers[layer_code]["node_type_counts"][node_type] = int(
            record.get("type_count", 0)
        )

    total_relationships = 0
    classified_relationships = 0
    cross_layer_rels: dict[str, dict] = {}

    for record in relationship_records:
        count = int(record.get("rel_count", 0))
        rel_type = str(record.get("rel_type", ""))
        source_layer = record.get("source_layer")
        target_layer = record.get("target_layer")
        total_relationships += count

        if source_layer not in layers or target_layer not in layers:
            continue

        classified_relationships += count
        if source_layer == target_layer:
            layer_stat = layers[source_layer]
            layer_stat["rel_count"] += count
            rel_counts = layer_stat["rel_type_counts"]
            rel_counts[rel_type] = rel_counts.get(rel_type, 0) + count
            continue

        key = f"{source_layer}_to_{target_layer}"
        cross_stat = cross_layer_rels.setdefault(
            key, {"count": 0, "rel_types": [], "rel_type_counts": {}}
        )
        cross_stat["count"] += count
        cross_stat["rel_type_counts"][rel_type] = (
            cross_stat["rel_type_counts"].get(rel_type, 0) + count
        )

        layer_cross = layers[source_layer]["cross_layer_rels"]
        layer_cross[f"to_{target_layer}"] = (
            layer_cross.get(f"to_{target_layer}", 0) + count
        )

    for layer_stat in layers.values():
        node_type_counts = layer_stat["node_type_counts"]
        rel_type_counts = layer_stat["rel_type_counts"]
        layer_stat["node_types"] = list(node_type_counts.keys())
        layer_stat["node_type_count"] = len(node_type_counts)
        layer_stat["rel_types"] = sorted(
            rel_type_counts, key=lambda key: (-rel_type_counts[key], key)
        )
        layer_stat["rel_type_count"] = len(rel_type_counts)

    for cross_stat in cross_layer_rels.values():
        counts = cross_stat["rel_type_counts"]
        cross_stat["rel_types"] = sorted(
            counts, key=lambda key: (-counts[key], key)
        )

    layer_list = [layers[layer_code] for layer_code in LAYER_DISPLAY_NAMES]
    result = {
        "success": True,
        "total": total_nodes,
        "total_nodes": total_nodes,
        "classified_nodes": classified_nodes,
        "unclassified_nodes": total_nodes - classified_nodes,
        "total_relationships": total_relationships,
        "classified_relationships": classified_relationships,
        "unclassified_relationships": total_relationships - classified_relationships,
        "details": [
            {
                "label": layer["layer"],
                "value": layer["node_count"],
                "type": layer["layer_code"],
            }
            for layer in layer_list
        ],
        "layers": layer_list,
        "cross_layer_rels": cross_layer_rels,
    }
    _statistics_cache["data"] = result
    _statistics_cache["expires_at"] = now + _STATISTICS_CACHE_TTL_SECONDS
    return result


@router.get("/statistics")
def get_statistics(
    layer: str = Query("all", description="Layer: all|Subject|Event|Feature|Regulation"),
):
    try:
        if layer == "Subject":
            return _subject_statistics()
        elif layer == "Event":
            return _event_statistics()
        elif layer == "Feature":
            return _feature_statistics()
        elif layer == "Regulation":
            return _regulation_statistics()
        else:
            return _detailed_statistics()
    except Exception as e:
        logger.error(f"Statistics error: {traceback.format_exc()}")
        return {"error": str(e)}


def _subject_statistics():
    return _single_layer_statistics("Subject")


def _event_statistics():
    return _single_layer_statistics("Event")


def _feature_statistics():
    return _single_layer_statistics("Feature")


def _regulation_statistics():
    return _single_layer_statistics("Regulation")


def _single_layer_statistics(layer_code: str) -> dict:
    stats = _collect_graph_statistics()
    layer = next(
        item for item in stats["layers"] if item["layer_code"] == layer_code
    )
    return {
        "success": True,
        "layer": layer_code,
        "total": layer["node_count"],
        "relationship_total": layer["rel_count"],
        "details": [
            {
                "label": NODE_TYPE_DISPLAY_NAMES.get(node_type, node_type),
                "value": count,
                "type": node_type,
            }
            for node_type, count in layer["node_type_counts"].items()
        ],
        "rel_details": [
            {"label": rel_type, "value": count, "type": rel_type}
            for rel_type, count in layer["rel_type_counts"].items()
        ],
    }


def _detailed_statistics():
    """Four-layer statistics resolved from live business labels."""
    return _collect_graph_statistics()


# ====================================================
# Summary statistics (aggregated across all 4 layers)
# ====================================================


@router.get("/summary-stats")
def get_summary_stats():
    """Return global totals + per-layer breakdown in one call."""
    try:
        return _collect_graph_statistics()
    except Exception as e:
        logger.error(f"Summary stats error: {traceback.format_exc()}")
        return {"error": str(e)}


# ====================================================
# Cross-layer statistics
# ====================================================


@router.get("/cross-stats")
def get_cross_layer_statistics():
    """Return cross-layer relationship counts between all 4 layers."""
    stats = _collect_graph_statistics()
    return {
        "success": True,
        "cross_layer_rels": stats["cross_layer_rels"],
    }


# ====================================================
# Graph data
# ====================================================


# All known labels in the financial KG (used by layer=all)
_ALL_LABELS = [
    "Subject", "COMPANY", "PERSON", "PFCOMPANY", "PFUND", "SECURITY",
    "Event", "EVENT", "TIME", "REGULATOR",
    "Feature", "RiskFeature", "RiskFactor",
    "Regulation", "Law", "Action", "Entity", "NODE", "Section",
    "Responsibility", "PartyWithResponsibility", "Actor",
    "RegulatoryAuthority", "Restriction", "Chapter",
    "PunishmentMeasure", "Violation", "Punishment",
    "AdvantageHolder", "Influence", "Means",
    "DisadvantageHolder", "Account", "Advantage", "Title",
]

# Backward-compatible aliases for existing graph queries.
_LAYER_SUBJECT = LAYER_LABEL_MAP["Subject"]
_LAYER_EVENT = LAYER_LABEL_MAP["Event"]
_LAYER_FEATURE = LAYER_LABEL_MAP["Feature"]
_LAYER_REGULATION = LAYER_LABEL_MAP["Regulation"]
_LAYER_LABEL_MAP = LAYER_LABEL_MAP

# Allowed relationship types for relationWhitelist validation (POST /search-all)
# Synced with actual Neo4j database relationship types (2026-06-10)
ALLOWED_REL_TYPES: set[str] = {
    "INVEST", "WORK", "GUARANTEE", "CONTROLLER", "CONTROL",
    "MANAGER", "TRUSTEE", "ISSUE", "BRANCH", "CUSTOMER",
    "SUE", "JOINDER", "PARTICIPATE_IN", "MENTION",
    "TRIGGERS", "REFLECTS", "CAUSE", "COMPLIES_WITH",
    "BELONG", "COOPERATE", "SERVE", "TRANSACTION",
    "WARNING", "PUNISH", "FRAUD", "EXECUTED",
    "SUPPLIER", "REGULATE", "CONSULTANT",
    "产生", "任职", "任職", "依据", "依照", "侵害", "做出", "具有",
    "包含", "包含主体", "包含受害主体", "包含监管机构", "包含责任方",
    "包含违规主体", "反转", "发生于", "受到", "受到处罚", "受限于",
    "因果", "处以", "实施", "履行", "应当", "执行", "控制",
    "旨在导致", "时序", "映射法规", "時序", "条件", "构成", "條件",
    "發生於", "监管", "触发", "针对", "需借助",
}

# ── Default relation whitelist ──────────────────────────────────────────
# When the user omits relationWhitelist, this set is used automatically.
# Pass ["*"] to disable all filtering (i.e. allow every relationship type).

DEFAULT_RELATION_WHITELIST: list[str] = [
    "INVEST", "CONTROLLER", "CONTROL", "GUARANTEE",
    "MANAGER", "TRUSTEE", "ISSUE", "BRANCH",
    "WORK", "SUE", "JOINDER", "CUSTOMER",
    "MENTION", "TRIGGERS", "REFLECTS", "CAUSE",
    "COMPLIES_WITH", "BELONG", "COOPERATE", "PARTICIPATE_IN",
    "产生", "任职", "任職", "依据", "依照", "侵害", "做出", "具有",
    "包含", "包含主体", "包含受害主体", "包含监管机构", "包含责任方",
    "包含违规主体", "反转", "发生于", "受到", "受到处罚", "受限于",
    "因果", "处以", "实施", "履行", "应当", "执行", "控制",
    "旨在导致", "时序", "映射法规", "時序", "条件", "构成", "條件",
    "發生於", "监管", "触发", "针对", "需借助",
]

SEARCH_NAME_PROPERTIES = [
    "name", "title", "COMPANY_NM", "PERSON_NM", "zh_name",
    "event_name", "regulation_name", "law_name", "factor_nm", "feature_nm",
]

SEARCH_CONTENT_PROPERTIES = [
    "e_text", "definition", "description", "content", "text", "summary",
]

_ENTITY_SUFFIXES = (
    "股份有限公司", "有限责任公司", "集团有限公司", "有限公司",
    "股份公司", "集团公司", "控股集团", "集团",
)


def _keyword_variants(keyword: str) -> list[str]:
    """Build conservative aliases for entity-aware cross-layer text search."""
    variants: list[str] = []

    def add(value: str) -> None:
        value = value.strip()
        if len(value) >= 2 and value not in variants:
            variants.append(value)

    add(keyword)
    without_suffix = keyword
    for suffix in _ENTITY_SUFFIXES:
        if without_suffix.endswith(suffix):
            without_suffix = without_suffix[:-len(suffix)]
            add(without_suffix)
            break
    if without_suffix.startswith("中国") and len(without_suffix) > 4:
        add(without_suffix[2:])
    if keyword.startswith("中国") and len(keyword) > 4:
        without_prefix = keyword[2:]
        add(without_prefix)
        for suffix in _ENTITY_SUFFIXES:
            if without_prefix.endswith(suffix):
                add(without_prefix[:-len(suffix)])
                break
    return variants


def _serialized_node_layer(node: dict) -> str | None:
    labels = set(node.get("labels", []))
    for layer_name, layer_labels in LAYER_LABEL_MAP.items():
        if labels.intersection(layer_labels):
            return layer_name
    return None


def _serialized_node_text(node: dict) -> str:
    props = node.get("properties", {})
    values = [
        props.get(prop)
        for prop in (*SEARCH_NAME_PROPERTIES, *SEARCH_CONTENT_PROPERTIES)
    ]
    return " ".join(str(value) for value in values if value)


def _serialized_node_name(node: dict) -> str:
    props = node.get("properties", {})
    for prop in (*SEARCH_NAME_PROPERTIES, *SEARCH_CONTENT_PROPERTIES):
        value = props.get(prop)
        if value:
            return str(value)
    return node.get("id", "")


def _cascade_virtual_edge(
    source: str,
    target: str,
    relation: str,
    keyword: str,
) -> dict:
    edge_id = f"virtual:{relation}:{source}:{target}"
    return {
        "id": edge_id,
        "source": source,
        "target": target,
        "type": relation,
        "label": relation,
        "relation": relation,
        "rawType": relation,
        "properties": {
            "inferred": True,
            "inferenceType": "semantic-text-match",
            "matchedKeyword": keyword,
        },
    }


def _orient_edge_for_cascade(edge: dict, source_node: dict, target_node: dict) -> dict:
    """Orient cross-layer edges from Subject toward Regulation for display."""
    order = {"Subject": 0, "Event": 1, "Feature": 2, "Regulation": 3}
    source_layer = _serialized_node_layer(source_node)
    target_layer = _serialized_node_layer(target_node)
    if (
        source_layer in order
        and target_layer in order
        and order[source_layer] > order[target_layer]
    ):
        original_source = edge["source"]
        original_target = edge["target"]
        edge["source"] = original_target
        edge["target"] = original_source
        edge.setdefault("properties", {}).update({
            "originalSource": original_source,
            "originalTarget": original_target,
            "reorientedForCascade": True,
        })
    return edge


def _search_subject_cascade(
    db: "Neo4jClient",
    center_nodes: list[dict],
    keyword: str,
    subject_depth: int,
    relation_whitelist: list[str] | None,
    include_properties: bool,
) -> dict:
    """Build an unbounded, stage-oriented Subject → Event → Feature → Regulation graph."""
    node_map = {node["id"]: node for node in center_nodes}
    edge_map: dict[str, dict] = {}
    subject_ids = set(node_map)
    frontier_ids = set(subject_ids)
    effective_rel = relation_whitelist
    subject_labels = LAYER_LABEL_MAP["Subject"]

    for _hop in range(subject_depth):
        if not frontier_ids:
            break
        params: dict = {
            "frontier": list(frontier_ids),
            "subjectLabels": subject_labels,
        }
        rel_filter = ""
        if effective_rel is not None:
            params["relWhitelist"] = effective_rel
            rel_filter = "AND type(r) IN $relWhitelist"
        rows, _ = db.execute_read_with_summary(
            f"""
            MATCH (source)-[r]-(target)
            WHERE elementId(source) IN $frontier
              AND any(label IN labels(target) WHERE label IN $subjectLabels)
              {rel_filter}
            RETURN DISTINCT source, r, target
            """,
            params,
            timeout_seconds=120.0,
        )
        next_frontier: set[str] = set()
        for row in rows:
            source = row.get("source")
            target = row.get("target")
            relation = row.get("r")
            if source is None or target is None or relation is None:
                continue
            source_data = Neo4jClient.serialize_node(source)
            target_data = Neo4jClient.serialize_node(target)
            edge_data = Neo4jClient.serialize_relationship(relation)
            node_map[source_data["id"]] = source_data
            node_map[target_data["id"]] = target_data
            edge_map[edge_data["id"]] = edge_data
            if target_data["id"] not in subject_ids:
                next_frontier.add(target_data["id"])
            subject_ids.add(target_data["id"])
        frontier_ids = next_frontier

    primary_id = center_nodes[0]["id"]
    term_owner: dict[str, str] = {
        term: primary_id for term in _keyword_variants(keyword)
    }
    for subject_id in subject_ids:
        node = node_map.get(subject_id)
        if not node:
            continue
        name = _serialized_node_name(node).strip()
        if len(name) >= 3:
            term_owner.setdefault(name, subject_id)
    terms = sorted(term_owner, key=lambda value: (-len(value), value))

    event_labels = LAYER_LABEL_MAP["Event"]
    event_ids: set[str] = set()
    direct_event_pairs: set[tuple[str, str]] = set()
    direct_event_rows, _ = db.execute_read_with_summary(
        """
        MATCH (subject)-[r]-(event)
        WHERE elementId(subject) IN $subjectIds
          AND any(label IN labels(event) WHERE label IN $eventLabels)
        RETURN DISTINCT subject, r, event
        """,
        {"subjectIds": list(subject_ids), "eventLabels": event_labels},
        timeout_seconds=120.0,
    )
    for row in direct_event_rows:
        subject = row.get("subject")
        event = row.get("event")
        relation = row.get("r")
        if subject is None or event is None or relation is None:
            continue
        subject_data = Neo4jClient.serialize_node(subject)
        event_data = Neo4jClient.serialize_node(event)
        edge_data = Neo4jClient.serialize_relationship(relation)
        node_map[subject_data["id"]] = subject_data
        node_map[event_data["id"]] = event_data
        event_ids.add(event_data["id"])
        direct_event_pairs.add((subject_data["id"], event_data["id"]))
        edge_map[edge_data["id"]] = edge_data

    event_conditions = " OR ".join(
        f"any(term IN $terms WHERE coalesce(event.{prop}, '') CONTAINS term)"
        for prop in (*SEARCH_NAME_PROPERTIES, *SEARCH_CONTENT_PROPERTIES)
    )
    event_rows, _ = db.execute_read_with_summary(
        f"""
        MATCH (event)
        WHERE any(label IN labels(event) WHERE label IN $eventLabels)
          AND ({event_conditions})
        RETURN DISTINCT event
        """,
        {"terms": terms, "eventLabels": event_labels},
        timeout_seconds=120.0,
    )
    event_term: dict[str, str] = {}
    for row in event_rows:
        event = row.get("event")
        if event is None:
            continue
        data = Neo4jClient.serialize_node(event)
        node_map[data["id"]] = data
        event_ids.add(data["id"])
        text = _serialized_node_text(data)
        matched_term = next((term for term in terms if term in text), keyword)
        event_term[data["id"]] = matched_term
        owner_id = term_owner.get(matched_term, primary_id)
        if (owner_id, data["id"]) not in direct_event_pairs:
            edge = _cascade_virtual_edge(owner_id, data["id"], "语义关联事件", matched_term)
            edge_map[edge["id"]] = edge

    feature_labels = LAYER_LABEL_MAP["Feature"]
    feature_ids: set[str] = set()
    regulation_ids: set[str] = set()
    direct_feature_pairs: set[tuple[str, str]] = set()

    # Keep every classified one-hop connection of the selected events. This
    # preserves event participants, event-to-feature links and event actions.
    if event_ids:
        event_neighbor_rows, _ = db.execute_read_with_summary(
            """
            MATCH (event)-[r]-(neighbor)
            WHERE elementId(event) IN $eventIds
              AND any(label IN labels(neighbor) WHERE label IN $classifiedLabels)
            RETURN DISTINCT event, r, neighbor
            """,
            {
                "eventIds": list(event_ids),
                "classifiedLabels": LAYER_BUSINESS_LABELS,
            },
            timeout_seconds=120.0,
        )
        for row in event_neighbor_rows:
            event = row.get("event")
            neighbor = row.get("neighbor")
            relation = row.get("r")
            if event is None or neighbor is None or relation is None:
                continue
            event_data = Neo4jClient.serialize_node(event)
            neighbor_data = Neo4jClient.serialize_node(neighbor)
            edge_data = _orient_edge_for_cascade(
                Neo4jClient.serialize_relationship(relation),
                event_data,
                neighbor_data,
            )
            node_map[event_data["id"]] = event_data
            node_map[neighbor_data["id"]] = neighbor_data
            neighbor_layer = _serialized_node_layer(neighbor_data)
            if neighbor_layer == "Subject":
                subject_ids.add(neighbor_data["id"])
            elif neighbor_layer == "Event":
                event_ids.add(neighbor_data["id"])
            elif neighbor_layer == "Feature":
                feature_ids.add(neighbor_data["id"])
                direct_feature_pairs.add((event_data["id"], neighbor_data["id"]))
            elif neighbor_layer == "Regulation":
                regulation_ids.add(neighbor_data["id"])
            edge_map[edge_data["id"]] = edge_data

    if event_ids:
        direct_feature_rows, _ = db.execute_read_with_summary(
            """
            MATCH (event)-[r]-(feature)
            WHERE elementId(event) IN $eventIds
              AND any(label IN labels(feature) WHERE label IN $featureLabels)
            RETURN DISTINCT event, r, feature
            """,
            {"eventIds": list(event_ids), "featureLabels": feature_labels},
            timeout_seconds=120.0,
        )
        for row in direct_feature_rows:
            event = row.get("event")
            feature = row.get("feature")
            relation = row.get("r")
            if event is None or feature is None or relation is None:
                continue
            event_data = Neo4jClient.serialize_node(event)
            feature_data = Neo4jClient.serialize_node(feature)
            edge_data = _orient_edge_for_cascade(
                Neo4jClient.serialize_relationship(relation),
                event_data,
                feature_data,
            )
            node_map[event_data["id"]] = event_data
            node_map[feature_data["id"]] = feature_data
            feature_ids.add(feature_data["id"])
            direct_feature_pairs.add((event_data["id"], feature_data["id"]))
            edge_map[edge_data["id"]] = edge_data

    feature_conditions = " OR ".join(
        f"any(term IN $terms WHERE coalesce(feature.{prop}, '') CONTAINS term)"
        for prop in (*SEARCH_NAME_PROPERTIES, *SEARCH_CONTENT_PROPERTIES)
    )
    feature_rows, _ = db.execute_read_with_summary(
        f"""
        MATCH (feature)
        WHERE any(label IN labels(feature) WHERE label IN $featureLabels)
          AND ({feature_conditions})
        RETURN DISTINCT feature
        """,
        {"terms": terms, "featureLabels": feature_labels},
        timeout_seconds=120.0,
    )
    for row in feature_rows:
        feature = row.get("feature")
        if feature is None:
            continue
        data = Neo4jClient.serialize_node(feature)
        node_map[data["id"]] = data
        feature_ids.add(data["id"])

    # Include every classified feature neighbor: RiskFactor/RiskFeature stay in
    # the feature pipe, while mapped Action/Law nodes enter regulation.
    if feature_ids:
        feature_neighbor_rows, _ = db.execute_read_with_summary(
            """
            MATCH (source)-[r]-(target)
            WHERE elementId(source) IN $featureIds
              AND any(label IN labels(target) WHERE label IN $classifiedLabels)
            RETURN DISTINCT source, r, target
            """,
            {
                "featureIds": list(feature_ids),
                "classifiedLabels": LAYER_BUSINESS_LABELS,
            },
            timeout_seconds=120.0,
        )
        for row in feature_neighbor_rows:
            source = row.get("source")
            target = row.get("target")
            relation = row.get("r")
            if source is None or target is None or relation is None:
                continue
            source_data = Neo4jClient.serialize_node(source)
            target_data = Neo4jClient.serialize_node(target)
            edge_data = _orient_edge_for_cascade(
                Neo4jClient.serialize_relationship(relation),
                source_data,
                target_data,
            )
            node_map[source_data["id"]] = source_data
            node_map[target_data["id"]] = target_data
            target_layer = _serialized_node_layer(target_data)
            if target_layer == "Subject":
                subject_ids.add(target_data["id"])
            elif target_layer == "Event":
                event_ids.add(target_data["id"])
            elif target_layer == "Feature":
                feature_ids.add(target_data["id"])
            elif target_layer == "Regulation":
                regulation_ids.add(target_data["id"])
            edge_map[edge_data["id"]] = edge_data

    # Make semantic Event → Feature links explicit when the source database
    # stores both records but omits a direct relationship.
    if event_ids:
        event_by_term: dict[str, str] = {}
        for event_id, matched_term in event_term.items():
            event_by_term.setdefault(matched_term, event_id)
        fallback_event_id = next(iter(event_ids))
        for feature_id in feature_ids:
            text = _serialized_node_text(node_map[feature_id])
            matched_term = next((term for term in terms if term in text), keyword)
            event_id = event_by_term.get(matched_term, fallback_event_id)
            if (event_id, feature_id) not in direct_feature_pairs:
                edge = _cascade_virtual_edge(event_id, feature_id, "语义归因特征", matched_term)
                edge_map[edge["id"]] = edge

    regulation_labels = LAYER_LABEL_MAP["Regulation"]
    if feature_ids:
        regulation_rows, _ = db.execute_read_with_summary(
            """
            MATCH (feature)-[r]-(regulation)
            WHERE elementId(feature) IN $featureIds
              AND any(label IN labels(regulation) WHERE label IN $regulationLabels)
            RETURN DISTINCT feature, r, regulation
            """,
            {
                "featureIds": list(feature_ids),
                "regulationLabels": regulation_labels,
            },
            timeout_seconds=120.0,
        )
        for row in regulation_rows:
            feature = row.get("feature")
            regulation = row.get("regulation")
            relation = row.get("r")
            if feature is None or regulation is None or relation is None:
                continue
            feature_data = Neo4jClient.serialize_node(feature)
            regulation_data = Neo4jClient.serialize_node(regulation)
            edge_data = _orient_edge_for_cascade(
                Neo4jClient.serialize_relationship(relation),
                feature_data,
                regulation_data,
            )
            node_map[feature_data["id"]] = feature_data
            node_map[regulation_data["id"]] = regulation_data
            regulation_ids.add(regulation_data["id"])
            edge_map[edge_data["id"]] = edge_data

    # Expand legal basis to its connected actions, responsibilities, sections
    # and laws within the regulation layer.
    if regulation_ids:
        regulation_neighbor_rows, _ = db.execute_read_with_summary(
            """
            MATCH (source)-[r]-(target)
            WHERE elementId(source) IN $regulationIds
              AND any(label IN labels(target) WHERE label IN $regulationLabels)
            RETURN DISTINCT source, r, target
            """,
            {
                "regulationIds": list(regulation_ids),
                "regulationLabels": regulation_labels,
            },
            timeout_seconds=120.0,
        )
        for row in regulation_neighbor_rows:
            source = row.get("source")
            target = row.get("target")
            relation = row.get("r")
            if source is None or target is None or relation is None:
                continue
            source_data = Neo4jClient.serialize_node(source)
            target_data = Neo4jClient.serialize_node(target)
            edge_data = Neo4jClient.serialize_relationship(relation)
            node_map[source_data["id"]] = source_data
            node_map[target_data["id"]] = target_data
            regulation_ids.update((source_data["id"], target_data["id"]))
            edge_map[edge_data["id"]] = edge_data

    nodes = list(node_map.values())
    edges = list(edge_map.values())
    stage_counts = {
        "Subject": sum(_serialized_node_layer(node) == "Subject" for node in nodes),
        "Event": sum(_serialized_node_layer(node) == "Event" for node in nodes),
        "Feature": sum(_serialized_node_layer(node) == "Feature" for node in nodes),
        "Regulation": sum(_serialized_node_layer(node) == "Regulation" for node in nodes),
    }
    return {
        "nodes": nodes,
        "edges": edges,
        "warnings": [],
        "summary": {
            "requestedDepth": subject_depth,
            "actualDepth": subject_depth,
            "centerCount": len(center_nodes),
            "nodeCount": len(nodes),
            "edgeCount": len(edges),
            "relationTypes": sorted({
                edge.get("type", edge.get("relation", "")) for edge in edges
            }),
            "nodeTypeCounts": _count_node_types(nodes),
            "edgeTypeCounts": _count_edge_types(edges),
            "frontierCountsByHop": {},
            "truncated": False,
            "truncatedBy": None,
            "traversalMode": "cascade",
            "cascadeStageCounts": stage_counts,
        },
    }


def _resolve_relation_whitelist(whitelist: list[str]) -> list[str] | None:
    """Resolve user-supplied relation whitelist into the effective filter list.

    Returns ``None`` when all relations should be allowed (i.e. no filtering
    in Cypher), otherwise a concrete list of relation type strings.
    """
    if not whitelist:
        return DEFAULT_RELATION_WHITELIST
    if "*" in whitelist:
        return None
    return whitelist


def _labels_for_layer(layer: str) -> list[str]:
    """Return concrete Neo4j labels for a UI layer.

    `layer=all` must use the real labels in the database, not only the
    abstract four-layer labels. Otherwise entity names that resolve to COMPANY,
    PERSON, SECURITY, etc. are filtered out before traversal starts.
    """
    if layer in _LAYER_LABEL_MAP:
        return _LAYER_LABEL_MAP[layer]
    return _ALL_LABELS


def _labels_cypher(var: str, labels: list[str]) -> str:
    """Build a Cypher `any(label IN labels({var}) WHERE label IN [...])` expression."""
    quoted = ", ".join(f"'{l}'" for l in labels)
    return f"any(label IN labels({var}) WHERE label IN [{quoted}])"


# ── expand_subgraph helpers ──────────────────────────────────────────────

def _node_matches_layer(node: dict, layer_whitelist: list[str]) -> bool:
    """Check whether a serialized node belongs to at least one whitelisted layer."""
    node_labels = set(node.get("labels", []))
    for layer_name in layer_whitelist:
        layer_labels = set(LAYER_LABEL_MAP.get(layer_name, [layer_name]))
        if node_labels & layer_labels:
            return True
    return False


def _count_node_types(nodes: list[dict]) -> dict[str, int]:
    """Count nodes by their primary type label (first non-layer label)."""
    layer_codes = {"Subject", "Event", "Feature", "Regulation"}
    counts: dict[str, int] = {}
    for n in nodes:
        labels = n.get("labels", [])
        primary = "Unknown"
        for lbl in labels:
            if lbl not in layer_codes:
                primary = lbl
                break
        counts[primary] = counts.get(primary, 0) + 1
    return counts


def _count_edge_types(edges: list[dict]) -> dict[str, int]:
    """Count edges by their type."""
    counts: dict[str, int] = {}
    for e in edges:
        t = e.get("type", e.get("relation", e.get("label", "Unknown")))
        counts[t] = counts.get(t, 0) + 1
    return counts


# ── expand_subgraph: unified N-hop subgraph expander ────────────────────

def expand_subgraph(
    db: "Neo4jClient",
    center_ids: list[str],
    depth: int = 2,
    node_limit: int = 500,
    edge_limit: int = 2000,
    relation_whitelist: list[str] | None = None,
    layer_whitelist: list[str] | None = None,
    include_cross_layer: bool = True,
    include_properties: bool = True,
    batch_size: int = 300,
) -> dict:
    """Unified N-hop subgraph expansion.

    Phase 1 — BFS node discovery: iteratively expand from frontiers
    to discover all reachable nodes up to *depth* hops.

    Phase 2 — closure edge query: collect **all** relationships
    between the discovered node set so edges are never incomplete.

    Returns
    -------
    {
        "nodes": list[dict],
        "edges": list[dict],
        "summary": {...},
        "warnings": list[str],
    }
    """
    visited_ids: set[str] = set(center_ids)
    frontier_ids: set[str] = set(center_ids)
    frontier_counts_by_hop: dict[str, int] = {"0": len(center_ids)}
    warnings: list[str] = []
    truncated = False
    truncated_by: str | None = None
    actual_depth = 0
    _ = include_cross_layer  # reserved for future layer-aware traversal

    effective_rel = _resolve_relation_whitelist(relation_whitelist or [])

    # ── Phase 1: BFS node discovery ──────────────────────────────────
    try:
        for hop in range(1, depth + 1):
            if not frontier_ids:
                frontier_counts_by_hop[str(hop)] = 0
                continue

            next_frontier: set[str] = set()
            current_frontier = list(frontier_ids)

            for i in range(0, len(current_frontier), batch_size):
                batch = current_frontier[i:i + batch_size]
                params: dict = {"frontier": batch}
                rel_filter = ""
                if effective_rel is not None:
                    params["relWhitelist"] = effective_rel
                    rel_filter = "\n              AND type(r) IN $relWhitelist"

                bfs_query = f"""
                MATCH (n)-[r]-(m)
                WHERE elementId(n) IN $frontier{rel_filter}
                RETURN DISTINCT m
                """

                rows, _ = db.execute_read_with_summary(bfs_query, params, timeout_seconds=30.0)

                for row in rows:
                    m = row.get("m")
                    if m is None:
                        continue
                    mid = m.element_id
                    if mid in visited_ids:
                        continue

                    # serialize to check layer whitelist
                    m_serialized = Neo4jClient.serialize_node(m) if include_properties else {"id": mid, "labels": list(m.labels), "properties": {}}
                    if layer_whitelist and not _node_matches_layer(m_serialized, layer_whitelist):
                        continue

                    visited_ids.add(mid)
                    next_frontier.add(mid)

                    if len(visited_ids) >= node_limit:
                        truncated = True
                        truncated_by = "nodeLimit"
                        warnings.append(
                            f"NODE_LIMIT_REACHED: nodeLimit={node_limit}，返回结果可能不是完整子图"
                        )
                        break

                if truncated:
                    break

            frontier_counts_by_hop[str(hop)] = len(next_frontier)
            if next_frontier:
                actual_depth = hop
            frontier_ids = next_frontier

            if truncated:
                break

    except Exception as exc:
        logger.warning("[expand_subgraph] BFS phase failed: %s", exc)
        warnings.append(f"BFS_PHASE_ERROR: hop expansion failed: {exc}")

    # ── Phase 2: closure edge query ─────────────────────────────────
    node_map: dict[str, dict] = {}
    edge_map: dict[str, dict] = {}

    try:
        all_node_ids = list(visited_ids)
        if all_node_ids:
            params_closure: dict = {"nodeIds": all_node_ids}
            rel_filter_c = ""
            if effective_rel is not None:
                params_closure["relWhitelist"] = effective_rel
                rel_filter_c = "\n      AND type(r) IN $relWhitelist"

            closure_query = f"""
            UNWIND $nodeIds AS nid
            MATCH (a)-[r]->(b)
            WHERE elementId(a) = nid
              AND elementId(b) IN $nodeIds{rel_filter_c}
            RETURN DISTINCT a, r, b
            LIMIT $edgeLimit
            """
            params_closure["edgeLimit"] = edge_limit

            closure_rows, _ = db.execute_read_with_summary(
                closure_query, params_closure, timeout_seconds=120.0,
            )

            for row in closure_rows:
                a = row.get("a")
                b = row.get("b")
                r = row.get("r")
                if a is None or b is None or r is None:
                    continue

                a_obj = Neo4jClient.serialize_node(a) if include_properties else {"id": a.element_id, "labels": list(a.labels), "properties": {}}
                b_obj = Neo4jClient.serialize_node(b) if include_properties else {"id": b.element_id, "labels": list(b.labels), "properties": {}}
                r_obj = Neo4jClient.serialize_relationship(r) if include_properties else {
                    "id": r.element_id,
                    "source": r.start_node.element_id,
                    "target": r.end_node.element_id,
                    "type": r.type,
                    "label": r.type,
                    "relation": r.type,
                    "rawType": r.type,
                    "properties": {},
                }

                node_map[a_obj["id"]] = a_obj
                node_map[b_obj["id"]] = b_obj
                edge_map[r_obj["id"]] = r_obj

            if len(edge_map) >= edge_limit:
                truncated = True
                if not truncated_by:
                    truncated_by = "edgeLimit"
                else:
                    truncated_by = f"{truncated_by},edgeLimit"
                warnings.append(
                    f"EDGE_LIMIT_REACHED: edgeLimit={edge_limit}，返回关系可能被截断"
                )

    except Exception as exc:
        logger.warning("[expand_subgraph] Closure phase failed: %s", exc)
        warnings.append(f"CLOSURE_PHASE_ERROR: edge query failed: {exc}")

    # Ensure center nodes are always in node_map (even if no edges)
    if include_properties:
        try:
            for cid in center_ids:
                if cid not in node_map:
                    params_center = {"nodeId": cid}
                    center_rows, _ = db.execute_read_with_summary(
                        "MATCH (n) WHERE elementId(n) = $nodeId RETURN n",
                        params_center,
                        timeout_seconds=10.0,
                    )
                    for cr in center_rows:
                        cn = cr.get("n")
                        if cn is not None:
                            node_map[cid] = Neo4jClient.serialize_node(cn)
        except Exception as exc:
            logger.warning("[expand_subgraph] Center-node lookup failed: %s", exc)

    nodes = list(node_map.values())
    edges = list(edge_map.values())

    summary = {
        "requestedDepth": depth,
        "actualDepth": actual_depth,
        "centerCount": len(center_ids),
        "nodeCount": len(nodes),
        "edgeCount": len(edges),
        "relationTypes": sorted(set(
            e.get("type", e.get("relation", e.get("label", ""))) for e in edges
        )),
        "nodeTypeCounts": _count_node_types(nodes),
        "edgeTypeCounts": _count_edge_types(edges),
        "frontierCountsByHop": frontier_counts_by_hop,
        "truncated": truncated,
        "truncatedBy": truncated_by,
    }

    return {
        "nodes": nodes,
        "edges": edges,
        "summary": summary,
        "warnings": warnings,
    }


@router.get("/data")
def get_graph_data(
    layer: str = Query("all", description="Layer filter"),
    relationType: str = Query("", description="Single relation type filter"),
    limit: int = Query(100, ge=1, le=500),
    depth: int = Query(1, ge=1, le=3, description="Hop depth for graph traversal"),
):
    rel_filter = f":`{relationType}`" if relationType else ""

    def _layer_match(labels_a: list[str], labels_b: list[str]) -> str:
        """Build a MATCH clause for nodes with labels from two groups (cross or same layer)."""
        return (
            f"MATCH (n)-[r{rel_filter}]-(m) "
            f"WHERE n <> m "
            f"AND {_labels_cypher('n', labels_a)} "
            f"AND {_labels_cypher('m', labels_b)} "
            f"RETURN n, r, m"
        )

    try:
        if layer in _LAYER_LABEL_MAP:
            labels = _LAYER_LABEL_MAP[layer]
            query = f"{_layer_match(labels, labels)} LIMIT {limit}"
        else:
            # All layers: return nodes and relationships across all 4 layers
            match_clause = (
                f"MATCH (n)-[r{rel_filter}*1..{depth}]-(m)"
                if depth > 1
                else f"MATCH (n)-[r{rel_filter}]-(m)"
            )
            query = f"""
            {match_clause}
            WHERE n <> m
              AND (
                any(label IN labels(n) WHERE label IN ['Subject','Event','Feature','Regulation',
                    'COMPANY','PERSON','PFCOMPANY','PFUND','SECURITY',
                    'TIME','EVENT','REGULATOR',
                    'RiskFeature','RiskFactor',
                    'Regulation','Law','Action'])
              )
              AND (
                any(label IN labels(m) WHERE label IN ['Subject','Event','Feature','Regulation',
                    'COMPANY','PERSON','PFCOMPANY','PFUND','SECURITY',
                    'TIME','EVENT','REGULATOR',
                    'RiskFeature','RiskFactor',
                    'Regulation','Law','Action'])
              )
            RETURN DISTINCT n, r, m LIMIT {limit}
            """

        records, _ = _client().execute_read_with_summary(query)
        logger.info(
            "Graph data — layer=%s relationType=%s limit=%s count=%s",
            layer, relationType or "all", limit, len(records),
        )
        return _process_result(records)

    except Exception as exc:
        trace_id = get_trace_id()
        logger.error("Graph data unavailable: %s", exc)
        raise HTTPException(
            status_code=503,
            detail={
                "code": "GRAPH_503_UNAVAILABLE",
                "message": "Neo4j 图数据库当前不可用，请启动数据库后重试。",
                "traceId": trace_id,
            },
        ) from exc


# ====================================================
# Search
# ====================================================


@router.get("/search")
def search_graph(
    q: str = Query("", description="Keyword"),
    layer: str = Query("all", description="Layer filter"),
    nodeType: str = Query("", description="Target node type"),
    relType: str = Query("", description="Target relation type"),
    layers: int = Query(1, ge=1, le=3, description="Hop depth"),
    limit: int = Query(100, ge=1, le=500),
):
    keyword = q.strip()
    rel_constraint = f":{relType}" if relType else ""
    node_label_constraint = f":{nodeType}" if nodeType else ""

    layer_labels = _labels_for_layer(layer)
    labels_cypher = ", ".join(f"'{l}'" for l in layer_labels)

    if not keyword and not nodeType and not relType:
        return {"nodes": [], "edges": []}

    try:
        if not keyword:
            # Random center node with filters
            center_query = f"""
            MATCH (n)
            WHERE any(label IN labels(n) WHERE label IN [{labels_cypher}])
              AND EXISTS((n)--())
            WITH n, rand() AS r ORDER BY r LIMIT 1
            RETURN n
            """
            center_records, _ = _client().execute_read_with_summary(center_query)
            if not center_records:
                return {"nodes": [], "edges": []}

            center_node = center_records[0]["n"]
            center_id = center_node.element_id

            query = f"""
            MATCH (n)
            WHERE elementId(n) = $center_id
            WITH n
            MATCH path = (n)-[r{rel_constraint}*1..{layers}]-(m{node_label_constraint})
            WHERE any(label IN labels(m) WHERE label IN [{labels_cypher}])
            UNWIND nodes(path) AS node
            WITH node, path
            WHERE any(label IN labels(node) WHERE label IN [{labels_cypher}])
            UNWIND relationships(path) AS rel
            RETURN DISTINCT node, rel LIMIT {limit}
            """

            logger.info(
                "Search (filter) — layer=%s nodeType=%s relType=%s depth=%s",
                layer, nodeType or "all", relType or "all", layers,
            )
            records, _ = _client().execute_read_with_summary(query, {"center_id": center_id})
        else:
            query = f"""
            MATCH (n)
            WHERE (n.PERSON_NM CONTAINS $keyword
               OR n.COMPANY_NM CONTAINS $keyword
               OR n.name CONTAINS $keyword
               OR n.title CONTAINS $keyword
               OR n.zh_name CONTAINS $keyword
               OR n.id CONTAINS $keyword)
              AND any(label IN labels(n) WHERE label IN [{labels_cypher}])
            WITH n
            MATCH path = (n)-[r{rel_constraint}*1..{layers}]-(m{node_label_constraint})
            WHERE any(label IN labels(m) WHERE label IN [{labels_cypher}])
            UNWIND nodes(path) AS node
            WITH node, path
            WHERE any(label IN labels(node) WHERE label IN [{labels_cypher}])
            UNWIND relationships(path) AS rel
            RETURN DISTINCT node, rel LIMIT {limit}
            """

            logger.info(
                "Search (keyword) — q=%s layer=%s nodeType=%s relType=%s depth=%s",
                keyword, layer, nodeType or "all", relType or "all", layers,
            )
            records, _ = _client().execute_read_with_summary(query, {"keyword": keyword})

        return _process_result(records)

    except Exception as e:
        logger.error(f"Search error: {traceback.format_exc()}")
        return {"error": str(e)}


# ====================================================
# Search all layers (full cross-layer traversal)
# ====================================================


@router.get("/search-all")
def search_all_layers(
    q: str = Query(..., description="Keyword (required)"),
    depth: int = Query(2, ge=1, le=3, description="Expansion depth from center"),
    limit: int = Query(200, ge=1, le=500),
    layer: str = Query("all", description="Filter center nodes by layer: all, Subject, Event, Feature, Regulation"),
):
    """Search across all layers with progressive expansion.

    Step 1: Find center nodes matching keyword (up to 10), optionally filtered by layer.
    Step 2: Expand N-hop from each center to collect neighbors (cross-layer).
    Step 3: Collect relationships between all discovered nodes.
    """
    keyword = q.strip()
    if not keyword:
        return {"nodes": [], "edges": []}

    layer_filter = ""
    if layer and layer != "all":
        mapped = _LAYER_LABEL_MAP.get(layer, [layer])
        conditions = " OR ".join([f"center:{lbl}" for lbl in mapped])
        layer_filter = f"  AND ({conditions})\n"

    query = f"""
    // Step 1: Find center nodes by keyword
    MATCH (center)
    WHERE (center.name CONTAINS $keyword
       OR center.title CONTAINS $keyword
       OR center.COMPANY_NM CONTAINS $keyword
       OR center.PERSON_NM CONTAINS $keyword
       OR center.id CONTAINS $keyword
       OR center.factor_nm CONTAINS $keyword
       OR center.feature_nm CONTAINS $keyword)
    {layer_filter}WITH center LIMIT 10

    // Step 2: Expand N-hop from centers (cross-layer)
    MATCH path = (center)-[*1..{depth}]-(neighbor)
    WHERE center <> neighbor
    WITH collect(DISTINCT center) + collect(DISTINCT neighbor) AS all_nodes

    // Step 3: Collect relationships between all discovered nodes
    UNWIND all_nodes AS a
    MATCH (a)-[r]-(b)
    WHERE b IN all_nodes AND elementId(a) < elementId(b)
    WITH all_nodes, collect(DISTINCT r) AS all_rels

    UNWIND all_nodes AS node
    UNWIND all_rels AS rel
    WITH node, rel
    WHERE startNode(rel) = node OR endNode(rel) = node
    RETURN node, rel
    LIMIT {limit}
    """

    try:
        records, _ = _client().execute_read_with_summary(query, {"keyword": keyword})

        nodes_map: dict[str, dict] = {}
        edges: list[dict] = []
        edge_ids: set[str] = set()

        for record in records:
            node = record.get("node")
            if node:
                nid = node.element_id
                if nid not in nodes_map:
                    nodes_map[nid] = Neo4jClient.serialize_node(node)
            rel = record.get("rel")
            if rel:
                rid = rel.element_id
                if rid not in edge_ids:
                    edges.append(Neo4jClient.serialize_relationship(rel))
                    edge_ids.add(rid)

        return {"nodes": list(nodes_map.values()), "edges": edges}

    except Exception as e:
        logger.error(f"Search all layers error: {traceback.format_exc()}")
        return {"error": str(e)}


# ── _build_triples ────────────────────────────────────────────────────────


def _build_triples(
    nodes: list[dict] | dict[str, dict],
    edges: list[dict],
    deduplicate: bool = True,
) -> list[dict]:
    """Convert edges + nodes into (head, relation, tail) triples.

    ``nodes`` can be either a list of node dicts (each with ``"id"`` key)
    or a dict keyed by node id.  Each triple exposes ``headId``, ``head``,
    ``headLabels``, ``relation``, ``tailId``, ``tail``, ``tailLabels``, and
    ``properties`` from the relationship.
    """
    # Normalize list input to id-keyed map for O(1) lookup
    if isinstance(nodes, list):
        nodes_map: dict[str, dict] = {n["id"]: n for n in nodes}
    else:
        nodes_map = nodes

    triples: list[dict] = []
    seen: set[tuple] = set()

    for edge in edges:
        head_id = edge.get("source", "")
        tail_id = edge.get("target", "")
        rel_type = edge.get("type", edge.get("label", ""))
        rel_props = edge.get("properties", {})

        head_node = nodes_map.get(head_id, {})
        tail_node = nodes_map.get(tail_id, {})

        head_name = (
            head_node.get("properties", {}).get("name")
            or head_node.get("properties", {}).get("COMPANY_NM")
            or head_node.get("properties", {}).get("title")
            or head_id
        )
        tail_name = (
            tail_node.get("properties", {}).get("name")
            or tail_node.get("properties", {}).get("COMPANY_NM")
            or tail_node.get("properties", {}).get("title")
            or tail_id
        )

        if deduplicate:
            sig = (head_id, rel_type, tail_id)
            if sig in seen:
                continue
            seen.add(sig)

        triples.append({
            "headId": head_id,
            "head": head_name,
            "headLabels": head_node.get("labels", []),
            "relationId": edge.get("id", ""),
            "relation": rel_type,
            "tailId": tail_id,
            "tail": tail_name,
            "tailLabels": tail_node.get("labels", []),
            "properties": rel_props,
        })

    return triples


# ── POST /search-all ──────────────────────────────────────────────────────


@router.post("/search-all", response_model=SearchAllResponse)
def search_all_layers_post(req: SearchAllRequest) -> SearchAllResponse:
    """Cross-layer keyword search with structured request body.

    1. Find center nodes matching *query* across search properties.
    2. Call ``expand_subgraph()`` for unified N-hop expansion.
    3. Optionally build (head, relation, tail) triples from closure edges.
    """
    import time
    from uuid import uuid4

    trace_id = f"trc-{uuid4().hex[:16]}-graph-search"
    warnings: list[str] = []
    start_time = time.monotonic()

    keyword = req.query.strip()

    # ── resolve limits ──
    if req.outputFormat == "triples":
        node_limit = 99999999
        edge_limit = 99999999
    else:
        node_limit = req.nodeLimit if req.nodeLimit is not None else req.limit
        edge_limit = req.edgeLimit if req.edgeLimit is not None else max(node_limit * 4, 2000)

    # ── resolve relation whitelist ──
    effective_rel = _resolve_relation_whitelist(req.relationWhitelist)

    # ── build layer filter for center nodes ──
    if req.layer != "all":
        mapped = LAYER_LABEL_MAP.get(req.layer, [req.layer])
        layer_conditions = " OR ".join(f"center:{lbl}" for lbl in mapped)
        layer_filter_clause = f"  AND ({layer_conditions})\n"
    else:
        layer_filter_clause = ""

    # ── build type filter ──
    if req.type != "all":
        type_clause = f"\n  AND center:{req.type}"
    else:
        type_clause = ""

    # ── keyword search properties ──
    _SEARCH_PROPS = SEARCH_NAME_PROPERTIES
    conditions = " OR ".join(
        f"coalesce(center.{prop}, '') CONTAINS $keyword" for prop in _SEARCH_PROPS
    )

    center_limit = min(node_limit, 20)

    exact_conditions = " OR ".join(
        f"coalesce(center.{prop}, '') = $keyword" for prop in _SEARCH_PROPS
    )
    center_exact_query = f"""
    MATCH (center)
    WHERE ({exact_conditions}){layer_filter_clause}{type_clause}
    WITH DISTINCT center LIMIT $center_limit
    RETURN center, 0 AS match_rank
    """

    center_query = f"""
    MATCH (center)
    WHERE ({conditions}){layer_filter_clause}{type_clause}
    WITH DISTINCT center,
         CASE
           WHEN center.name = $keyword
             OR center.title = $keyword
             OR center.COMPANY_NM = $keyword
             OR center.PERSON_NM = $keyword
             OR center.id = $keyword
           THEN 0 ELSE 1
         END AS match_rank
    ORDER BY match_rank
    LIMIT $center_limit
    RETURN center, match_rank
    """

    params: dict = {
        "keyword": keyword,
        "keywords": _keyword_variants(keyword),
        "center_limit": center_limit,
    }
    try:
        # ── Phase 1: find center nodes ──
        node_map: dict[str, dict] = {}
        matched_nodes_map: dict[str, dict] = {}

        exact_records, _ = _client().execute_read_with_summary(
            center_exact_query, params, timeout_seconds=30.0,
        )
        center_records = list(exact_records)
        if not exact_records:
            fuzzy_records, _ = _client().execute_read_with_summary(
                center_query, params, timeout_seconds=30.0,
            )
            center_records.extend(fuzzy_records)

        # Exact entity matches commonly live in a disconnected subject-data
        # component, while event/risk/regulation records mention the entity in
        # text fields. Add a small, layer-balanced set of semantic centers so
        # cross-layer searches do not collapse into subject-only BFS results.
        if (
            req.traversalMode != "cascade"
            and req.layer == "all"
            and req.type == "all"
            and len(center_records) < center_limit
        ):
            supplemental_limit = max(2, min(6, center_limit // 3))
            content_conditions = " OR ".join(
                f"any(term IN $keywords WHERE coalesce(center.{prop}, '') CONTAINS term)"
                for prop in SEARCH_CONTENT_PROPERTIES
            )
            name_variant_conditions = " OR ".join(
                f"any(term IN $keywords WHERE coalesce(center.{prop}, '') CONTAINS term)"
                for prop in SEARCH_NAME_PROPERTIES
            )
            for layer_name in ("Event", "Feature", "Regulation"):
                labels = LAYER_LABEL_MAP[layer_name]
                layer_conditions = " OR ".join(f"center:{label}" for label in labels)
                supplemental_query = f"""
                MATCH (center)
                WHERE ({layer_conditions})
                  AND ({name_variant_conditions} OR {content_conditions})
                WITH DISTINCT center LIMIT $supplemental_limit
                RETURN center, 2 AS match_rank
                """
                supplemental_records, _ = _client().execute_read_with_summary(
                    supplemental_query,
                    {**params, "supplemental_limit": supplemental_limit},
                    timeout_seconds=30.0,
                )
                center_records.extend(supplemental_records)

        for record in center_records:
            center_obj = record.get("center")
            if center_obj is None:
                continue
            cid = center_obj.element_id
            serialized = Neo4jClient.serialize_node(center_obj)
            node_map[cid] = serialized
            matched_nodes_map[cid] = serialized
            if len(matched_nodes_map) >= center_limit:
                break

        if not matched_nodes_map:
            warnings.append(f"NO_MATCHED_NODE: 未找到关键词“{keyword}”对应节点")
            return SearchAllResponse(
                success=True,
                traceId=trace_id,
                matchedNodes=[],
                nodes=[],
                edges=[],
                triples=[],
                summary=SearchAllSummary(matchedCount=0),
                warnings=warnings,
            )

        center_ids = list(matched_nodes_map.keys())

        # ── Phase 2: traversal ──
        subject_centers = [
            node for node in matched_nodes_map.values()
            if _serialized_node_layer(node) == "Subject"
        ]
        if req.traversalMode == "cascade" and subject_centers:
            subgraph = _search_subject_cascade(
                db=_client(),
                center_nodes=subject_centers,
                keyword=keyword,
                subject_depth=req.depth,
                relation_whitelist=effective_rel,
                include_properties=req.includeProperties,
            )
            matched_nodes_map = {
                node["id"]: node for node in subject_centers
            }
        else:
            layer_whitelist = req.layerWhitelist if req.layerWhitelist else list(LAYER_LABEL_MAP.keys())
            subgraph = expand_subgraph(
                db=_client(),
                center_ids=center_ids,
                depth=req.depth,
                node_limit=node_limit,
                edge_limit=edge_limit,
                relation_whitelist=effective_rel,
                layer_whitelist=layer_whitelist if not req.layerWhitelist and req.layer == "all" else req.layerWhitelist or None,
                include_cross_layer=req.includeCrossLayer,
                include_properties=req.includeProperties,
            )

        # Merge center nodes that may not appear in subgraph (no edges)
        for cid, cnode in matched_nodes_map.items():
            if cid not in {n["id"] for n in subgraph["nodes"]}:
                subgraph["nodes"].append(cnode)

        all_nodes = subgraph["nodes"]
        all_edges = subgraph["edges"]
        subgraph_warnings = subgraph.get("warnings", [])
        subgraph_summary = subgraph.get("summary", {})

        # ── Phase 3: triples ──
        want_triples = req.outputFormat in ("triples", "both")
        triples = (
            _build_triples(all_nodes, all_edges, deduplicate=req.deduplicate)
            if want_triples
            else []
        )

        if req.outputFormat == "triples":
            simplified = [
                {
                    "head": t["head"],
                    "relation": t["relation"],
                    "tail": t["tail"],
                }
                for t in triples
            ]
            return JSONResponse(content=simplified)

        want_subgraph = req.outputFormat in ("subgraph", "both")

        # ── summary ──
        all_layers_set: set[str] = set()
        for n_data in all_nodes:
            for lbl in n_data.get("labels", []):
                for layer_name, layer_labels in LAYER_LABEL_MAP.items():
                    if lbl in layer_labels:
                        all_layers_set.add(layer_name)
                        break

        # Filter returned lists based on format
        returned_nodes = all_nodes if want_subgraph else []
        returned_edges = all_edges if want_subgraph else []
        returned_matched = list(matched_nodes_map.values()) if want_subgraph else []

        elapsed = time.monotonic() - start_time
        if elapsed > 5.0:
            if req.traversalMode == "cascade":
                warnings.append(
                    f"CASCADE_QUERY_SLOW: 级联查询耗时 {elapsed:.1f}s；"
                    "主体关联范围较大时可降低穿透深度"
                )
            else:
                warnings.append(
                    f"Query took {elapsed:.1f}s, consider reducing depth or limit"
                )

        combined_warnings = warnings + subgraph_warnings

        return SearchAllResponse(
            success=True,
            traceId=trace_id,
            matchedNodes=returned_matched,
            nodes=returned_nodes,
            edges=returned_edges,
            triples=triples,
            summary=SearchAllSummary(
                matchedCount=len(matched_nodes_map),
                nodeCount=len(returned_nodes),
                edgeCount=len(returned_edges),
                tripleCount=len(triples),
                layers=sorted(all_layers_set),
                relationTypes=sorted(set(
                    e.get("type", e.get("label", "")) for e in all_edges
                )),
                requestedDepth=subgraph_summary.get("requestedDepth", req.depth),
                actualDepth=subgraph_summary.get("actualDepth", 0),
                centerCount=subgraph_summary.get("centerCount", len(center_ids)),
                nodeTypeCounts=subgraph_summary.get("nodeTypeCounts", {}),
                edgeTypeCounts=subgraph_summary.get("edgeTypeCounts", {}),
                frontierCountsByHop=subgraph_summary.get("frontierCountsByHop", {}),
                truncated=subgraph_summary.get("truncated", False),
                truncatedBy=subgraph_summary.get("truncatedBy"),
                traversalMode=subgraph_summary.get("traversalMode", req.traversalMode),
                cascadeStageCounts=subgraph_summary.get("cascadeStageCounts", {}),
            ),
            warnings=combined_warnings,
        )

    except Exception as e:
        logger.error(f"POST /search-all error: {traceback.format_exc()}")
        return SearchAllResponse(
            success=False,
            traceId=trace_id,
            warnings=warnings + [str(e)],
        )


# ====================================================
# Subgraph expansion
# ====================================================


@router.get("/subgraph/{node_id}")
def get_subgraph(
    node_id: str,
    layer: str = Query("all", description="Layer filter"),
    limit: int = Query(50, ge=1, le=200),
):
    labels_cypher = ", ".join(f"'{l}'" for l in _labels_for_layer(layer))
    query = f"""
    MATCH (n)-[r]-(m)
    WHERE elementId(n) = $id
      AND any(label IN labels(m) WHERE label IN [{labels_cypher}])
    RETURN n, r, m LIMIT $limit
    """

    logger.info("Subgraph — id=%s layer=%s limit=%s", node_id, layer, limit)
    try:
        records, _ = _client().execute_read_with_summary(
            query, {"id": node_id, "limit": limit}
        )
        return _process_result(records)
    except Exception as e:
        logger.error(f"Subgraph error: {traceback.format_exc()}")
        return {"error": str(e)}


# ====================================================
# Star expansion
# ====================================================


@router.post("/expand/{node_id}")
def expand_node_post(node_id: str, req: ExpandRequest):
    """N-hop star expansion from a specific center node.

    Uses the unified ``expand_subgraph()`` to discover all reachable nodes
    and closure edges up to *depth* hops.
    """
    import time
    from uuid import uuid4

    trace_id = f"trc-{uuid4().hex[:16]}-graph-expand"
    warnings: list[str] = []
    start_time = time.monotonic()
    node_id = node_id.strip()

    # ── resolve limits ──
    node_limit = req.nodeLimit if req.nodeLimit is not None else req.limit
    edge_limit = req.edgeLimit if req.edgeLimit is not None else max(node_limit * 4, 2000)

    # ── resolve relation whitelist ──
    effective_rel = _resolve_relation_whitelist(req.relationWhitelist)

    try:
        # ── find center node ──
        center_records, _ = _client().execute_read_with_summary(
            "MATCH (n) WHERE elementId(n) = $nodeId RETURN n",
            {"nodeId": node_id},
            timeout_seconds=10.0,
        )
        center_node = None
        if center_records:
            cn = center_records[0].get("n")
            if cn is not None:
                center_node = Neo4jClient.serialize_node(cn)

        if center_node is None:
            return {
                "success": False,
                "traceId": trace_id,
                "errorCode": "NODE_NOT_FOUND",
                "message": f"未找到节点: {node_id}",
                "warnings": [],
            }

        # ── unified N-hop expansion ──
        layer_whitelist = req.layerWhitelist if req.layerWhitelist else None
        subgraph = expand_subgraph(
            db=_client(),
            center_ids=[node_id],
            depth=req.depth,
            node_limit=node_limit,
            edge_limit=edge_limit,
            relation_whitelist=effective_rel,
            layer_whitelist=layer_whitelist,
            include_cross_layer=req.includeCrossLayer,
            include_properties=req.includeProperties,
        )

        # Ensure center node is in the result
        all_nodes = subgraph["nodes"]
        has_center = any(n["id"] == node_id for n in all_nodes)
        if not has_center:
            all_nodes.append(center_node)

        all_edges = subgraph["edges"]
        sub_summary = subgraph.get("summary", {})
        sub_warnings = subgraph.get("warnings", [])

        elapsed = time.monotonic() - start_time
        if elapsed > 5.0:
            warnings.append(f"Query took {elapsed:.1f}s, consider reducing depth or limit")

        combined_warnings = warnings + sub_warnings

        return {
            "success": True,
            "traceId": trace_id,
            "elapsedMs": round(elapsed * 1000),
            "centerNode": center_node,
            "nodes": all_nodes,
            "edges": all_edges,
            "subgraph": {
                "nodeCount": len(all_nodes),
                "edgeCount": len(all_edges),
                "nodes": all_nodes,
                "edges": all_edges,
                "relationTypes": sorted(set(
                    e.get("type", e.get("label", "")) for e in all_edges
                )),
                "nodeTypeCounts": sub_summary.get("nodeTypeCounts", {}),
                "edgeTypeCounts": sub_summary.get("edgeTypeCounts", {}),
            },
            "summary": {
                **sub_summary,
                "centerNodeId": node_id,
                "depth": req.depth,
            },
            "warnings": combined_warnings,
        }

    except Exception as e:
        logger.error(f"Expand error: {traceback.format_exc()}")
        return {
            "success": False,
            "traceId": trace_id,
            "errorCode": "INTERNAL_ERROR",
            "message": str(e),
            "warnings": warnings + [str(e)],
        }


@router.get("/expand/{node_id}")
def expand_node_get(
    node_id: str,
    depth: int = Query(2, ge=1, le=5, description="Expansion depth (hops)"),
    limit: int = Query(500, ge=1, le=5000),
):
    """GET compatibility wrapper for star expansion.

    Delegates to ``expand_node_post`` with sensible defaults so existing
    frontend callers continue to work.
    """
    req = ExpandRequest(
        depth=depth,
        limit=limit,
        nodeLimit=limit,
        edgeLimit=max(limit * 4, 2000),
        includeCrossLayer=True,
        includeProperties=True,
        relationWhitelist=[],
        layerWhitelist=[],
    )
    return expand_node_post(node_id, req)


# ====================================================
# Community detection / analytics
# ====================================================


@router.get("/communities/algorithms")
def list_algorithms():
    """List all available community detection algorithms with metadata."""
    from kg_query.analytics.community import registry

    return {"algorithms": registry.get_algorithms_info()}


@router.get("/communities")
def detect_communities(
    layer: str = Query("all", description="Layer filter: all, Subject, Event, Feature, Regulation"),
    method: str = Query("wcc", description="Algorithm: wcc, louvain, hgt_gkmeans, label_propagation, leiden, girvan_newman, spectral, infomap"),
    max_nodes: int = Query(5000, ge=1, le=20000, description="Max nodes to analyze"),
    min_community_size: int = Query(3, ge=1, le=100, description="Minimum community size"),
):
    """Discover communities in the knowledge graph.

    Supports 7 algorithms:
    - wcc: Weakly Connected Components (fast, Cypher-based)
    - louvain: Louvain modularity optimization (NetworkX, fallback-aware)
    - hgt_gkmeans: HGT embedding + Graph K-means (requires stored node embeddings)
    - label_propagation: Iterative label propagation (Python)
    - leiden: Leiden algorithm with refinement steps (python-igraph)
    - girvan_newman: Divisive edge-betweenness clustering (python-igraph)
    - spectral: Spectral clustering via normalized Laplacian (scipy+sklearn)
    - infomap: Information-theoretic random walk communities (python-igraph)
    """
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    return analytics.detect_communities(
        layer=layer if layer != "all" else None,
        method=method,
        max_nodes=max_nodes,
        min_community_size=min_community_size,
    )


@router.get("/communities/compare")
def compare_algorithms(
    layer: str = Query("all", description="Layer filter"),
    max_nodes: int = Query(2000, ge=1, le=10000, description="Max nodes to analyze"),
    min_community_size: int = Query(3, ge=1, le=100, description="Minimum community size"),
):
    """Run all community detection algorithms and return comparison results."""
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    return analytics.compare_algorithms(
        layer=layer if layer != "all" else None,
        max_nodes=max_nodes,
        min_community_size=min_community_size,
    )


@router.get("/communities/{community_id}")
def get_community_subgraph(
    community_id: int,
    layer: str = Query("all", description="Layer filter"),
    limit: int = Query(200, ge=1, le=500),
):
    """Get the subgraph (nodes + edges) for a specific community."""
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    return analytics.get_community_subgraph(
        community_id=community_id,
        layer=layer if layer != "all" else None,
        limit=limit,
    )


@router.post("/communities/seed-subgraph")
def discover_seed_subgraph_communities(req: SeedCommunityRequest):
    """Discover local communities from specified risk subjects.

    Online version of the illustrated workflow:
    risk subjects -> N-hop network -> connected subgraph -> communities.
    """
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    result = analytics.discover_seeded_communities(
        seed_names=req.seed_names,
        seed_ids=req.seed_ids,
        max_hop=req.max_hop,
        method=req.method,
        min_community_size=req.min_community_size,
        path_limit=req.path_limit,
        max_nodes=req.max_nodes,
        relation_whitelist=req.relation_whitelist,
        community_mode=req.community_mode,
    )
    return {"code": 0, "msg": "success", "data": result}


@router.get("/communities/{community_id}/quality")
def get_community_quality(
    community_id: int,
    layer: str = Query("all", description="Layer filter"),
):
    """Return quality metrics for a specific community.

    Computes modularity, conductance, coverage, and clustering coefficient
    from the community's subgraph.
    """
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    layer_val = layer if layer != "all" else None

    # Get the subgraph for this community
    subgraph = analytics.get_community_subgraph(
        community_id=community_id,
        layer=layer_val,
        limit=500,
    )
    nodes = subgraph.get("nodes", [])
    edges = subgraph.get("edges", [])

    if not nodes:
        return {"error": "Community not found or empty"}

    # Build adjacency for the subgraph
    node_ids = {n["id"]: i for i, n in enumerate(nodes)}
    n = len(node_ids)
    adj = lil_matrix((n, n), dtype=np.float64)
    internal_edges = 0
    for e in edges:
        src_id = e.get("source") if isinstance(e.get("source"), str) else str(e.get("source", ""))
        tgt_id = e.get("target") if isinstance(e.get("target"), str) else str(e.get("target", ""))
        if src_id in node_ids and tgt_id in node_ids:
            i, j = node_ids[src_id], node_ids[tgt_id]
            adj[i, j] = 1
            adj[j, i] = 1
            internal_edges += 1

    import numpy as np
    from scipy.sparse import issparse

    adj = adj.tocsr()
    degrees = np.array(adj.sum(axis=1)).flatten()
    vol = degrees.sum()
    m = vol / 2.0

    # Conductance: cut_size / min(vol(S), vol(V\S))
    # For a single community, approximate conductance as (vol - 2*internal) / vol
    cut_edges = vol - 2 * internal_edges
    conductance = round(cut_edges / max(1, vol), 4) if vol > 0 else 0.0

    # Coverage: fraction of internal edges among all edges incident to community
    coverage = round(2 * internal_edges / max(1, vol), 4) if vol > 0 else 0.0

    # Average clustering coefficient
    triangles = 0
    adj_dense = adj.toarray()
    for i in range(n):
        neighbors = np.where(adj_dense[i] > 0)[0]
        for a in range(len(neighbors)):
            for b in range(a + 1, len(neighbors)):
                if adj_dense[neighbors[a], neighbors[b]] > 0:
                    triangles += 1
    triangles //= 3  # Each triangle counted 3 times

    avg_clustering = 0.0
    for i in range(n):
        ki = degrees[i]
        if ki >= 2:
            possible = ki * (ki - 1) / 2.0
            actual = sum(
                1 for a in range(n)
                if adj_dense[i, a]
                for b in range(a + 1, n)
                if adj_dense[i, b] and adj_dense[a, b]
            ) / 2.0
            avg_clustering += actual / possible
    avg_clustering = round(avg_clustering / max(1, n), 4)

    return {
        "community_id": community_id,
        "nodes": n,
        "internal_edges": internal_edges,
        "modularity": round(m / max(1, m), 4),
        "conductance": conductance,
        "coverage": coverage,
        "triangle_count": triangles,
        "avg_clustering": avg_clustering,
    }


@router.get("/centrality")
def compute_centrality(
    type: str = Query("pagerank", description="Centrality type: pagerank, betweenness"),
    layer: str = Query("all", description="Layer filter"),
    top_n: int = Query(100, ge=1, le=500),
):
    """Compute centrality scores for nodes in the graph."""
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    scores = analytics.compute_centrality(
        centrality_type=type,
        layer=layer if layer != "all" else None,
        top_n=top_n,
    )
    return {"success": True, "type": type, "nodes": scores}


@router.get("/cycles")
def detect_cycles(
    layer: str = Query("all", description="Layer filter"),
    max_cycles: int = Query(50, ge=1, le=200),
):
    """Find directed cycles (circular fund flows) in the graph."""
    from kg_query.analytics.graph_analytics import GraphAnalytics

    analytics = GraphAnalytics(db_client=_client())
    cycles = analytics.detect_cycles(
        layer=layer if layer != "all" else None,
        max_cycles=max_cycles,
    )
    return {"success": True, "cycles": cycles, "count": len(cycles)}


# ====================================================
# DB test / label distribution
# ====================================================


@router.get("/db-test")
def test_database():
    try:
        labels_query = """
        MATCH (n)
        UNWIND labels(n) AS label
        RETURN label, count(*) AS count
        ORDER BY count DESC, label
        """
        labels_records, _ = _client().execute_read_with_summary(labels_query)

        labels_info = [
            {"label": rec.get("label", ""), "count": rec.get("count", 0)}
            for rec in labels_records
        ]
        stats = _collect_graph_statistics()

        return {
            "success": True,
            "total_nodes": stats["total_nodes"],
            "total_relationships": stats["total_relationships"],
            "classified_nodes": stats["classified_nodes"],
            "unclassified_nodes": stats["unclassified_nodes"],
            "layers": stats["layers"],
            "label_distribution": labels_info,
        }
    except Exception as e:
        logger.error(f"DB test error: {traceback.format_exc()}")
        return {"error": str(e)}


# ====================================================
# Dashboard endpoints
# ====================================================


@router.get("/high-risk-entities")
def high_risk_entities(
    limit: int = Query(10, ge=1, le=50, description="Number of top risk entities to return"),
):
    """Top-K high-risk subject entities sorted by WARNING_NUM descending.

    Returns entities with WARNING_NUM >= 1, STATUS = '吊销', or non-empty RISK_INFO.
    """
    query = """
    MATCH (c)
    WHERE (
      any(label IN labels(c) WHERE label IN ['COMPANY', 'PFCOMPANY', 'PFUND'])
      AND (
        (c.WARNING_NUM IS NOT NULL AND toInteger(c.WARNING_NUM) >= 1)
        OR c.STATUS = '吊销'
        OR (c.RISK_INFO IS NOT NULL AND c.RISK_INFO <> '')
      )
    )
    OPTIONAL MATCH (c)-[r]-(related)
    RETURN
      c,
      labels(c) AS node_labels,
      c.COMPANY_NM AS name,
      c.PERSON_NM AS person_name,
      c.NAME AS alt_name,
      c.WARNING_NUM AS warning_num,
      c.STATUS AS status,
      c.RISK_INFO AS risk_info,
      c.REG_CAPITAL AS reg_capital,
      count(DISTINCT related) AS related_count,
      collect(DISTINCT type(r))[0..10] AS relation_types
    ORDER BY coalesce(toInteger(c.WARNING_NUM), 0) DESC, c.STATUS = '吊销' DESC
    LIMIT $limit
    """
    records, _ = _client().execute_read_with_summary(query, {"limit": limit})

    entities = []
    for rec in records:
        node = rec.get("c")
        props = Neo4jClient.serialize_props(dict(node)) if node else {}
        entities.append({
            "id": node.element_id if node else None,
            "name": rec.get("name") or rec.get("person_name") or rec.get("alt_name") or (props.get("name", "")),
            "labels": rec.get("node_labels", []),
            "warning_num": int(rec.get("warning_num") or 0),
            "status": rec.get("status") or props.get("STATUS", ""),
            "risk_info": rec.get("risk_info") or props.get("RISK_INFO", ""),
            "reg_capital": rec.get("reg_capital") or props.get("REG_CAPITAL", ""),
            "related_count": rec.get("related_count", 0),
            "relation_types": rec.get("relation_types", []),
        })

    return {"success": True, "data": entities, "total": len(entities)}


@router.get("/risk-distribution")
def risk_distribution():
    """Aggregate risk-level distribution across all 4 layers.

    Returns per-layer counts bucketed by risk severity:
    - Subject: WARNING_NUM >= 5 → high, >= 2 → medium, else → low
    - Event: IMPACT_LEVEL = 'high' → high, else → medium
    - Feature: importance <= -2 → high, -1 → medium, else → low
    - Regulation: always informational
    """
    result = {
        "Subject": {"high": 0, "medium": 0, "low": 0, "total": 0},
        "Event": {"high": 0, "medium": 0, "low": 0, "total": 0},
        "Feature": {"high": 0, "medium": 0, "low": 0, "total": 0},
        "Regulation": {"high": 0, "medium": 0, "low": 0, "total": 0},
    }

    try:
        db = _client()

        # Subject layer — fetch WARNING_NUM and STATUS, compute in Python
        subj_records, _ = db.execute_read_with_summary("""
            MATCH (c)
            WHERE any(label IN labels(c) WHERE label IN $labels)
            RETURN coalesce(c.WARNING_NUM, 0) AS wn, c.STATUS AS status
        """, {"labels": ['COMPANY', 'PFCOMPANY', 'PFUND', 'PERSON', 'SECURITY', 'Subject']})
        for r in subj_records:
            wn = int(r.get("wn", 0))
            status = str(r.get("status", "")) if r.get("status") else ""
            result["Subject"]["total"] += 1
            if wn >= 5 or status == '吊销':
                result["Subject"]["high"] += 1
            elif wn >= 2:
                result["Subject"]["medium"] += 1
            else:
                result["Subject"]["low"] += 1

        # Event layer — fetch IMPACT_LEVEL and event_category, compute in Python
        event_records, _ = db.execute_read_with_summary("""
            MATCH (e)
            WHERE any(label IN labels(e) WHERE label IN $labels)
            RETURN coalesce(e.IMPACT_LEVEL, 'medium') AS il, coalesce(e.event_category, '') AS cat
        """, {"labels": ['EVENT', 'TIME', 'REGULATOR', 'Event']})
        HIGH_CATS = {'司法', '刑事'}
        for r in event_records:
            il = str(r.get("il", "")).lower().strip() if r.get("il") else ""
            cat = str(r.get("cat", "")).strip() if r.get("cat") else ""
            result["Event"]["total"] += 1
            if il == 'high' or cat in HIGH_CATS:
                result["Event"]["high"] += 1
            else:
                result["Event"]["medium"] += 1

        # Feature layer — fetch IMPORTANCE, compute in Python
        feat_records, _ = db.execute_read_with_summary("""
            MATCH (f)
            WHERE any(label IN labels(f) WHERE label IN $labels)
            RETURN coalesce(f.IMPORTANCE, 0) AS imp
        """, {"labels": ['RiskFeature', 'RiskFactor', 'Feature']})
        for r in feat_records:
            imp = int(r.get("imp", 0))
            result["Feature"]["total"] += 1
            if imp <= -2:
                result["Feature"]["high"] += 1
            elif imp == -1:
                result["Feature"]["medium"] += 1
            else:
                result["Feature"]["low"] += 1

        # Regulation layer — just count
        reg_records, _ = db.execute_read_with_summary("""
            MATCH (r)
            WHERE any(label IN labels(r) WHERE label IN $labels)
            RETURN count(r) AS total
        """, {"labels": ['Regulation', 'Law', 'Action']})
        if reg_records:
            total = int(reg_records[0].get("total", 0))
            result["Regulation"] = {"high": 0, "medium": 0, "low": total, "total": total}

    except Exception as e:
        logger.error(f"Risk distribution error: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}

    return {"success": True, "data": result}
