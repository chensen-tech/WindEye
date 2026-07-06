"""Multi-hop risk path enumeration and scoring engine.

Operates on in-memory subgraph data (nodes + edges) and produces scored,
described, and community-linked risk paths suitable for API responses and
frontend visualization.

Does NOT depend on Neo4j or LLM — pure deterministic algorithms.
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from typing import Any

logger = logging.getLogger(__name__)

# ── Risk relation severity weights ──────────────────────────────────

_HIGH_RISK_RELS = {
    "WARNING", "GUARANTEE", "TRIGGERS", "SUE", "PUNISH", "FRAUD",
    "EXECUTED", "失信", "被执行", "触发", "映射法规", "违规",
}

_MEDIUM_RISK_RELS = {
    "CONTROL", "CONTROLLER", "CONTROLL", "INVEST", "CAUSE",
    "MENTION", "JOINDER", "MANAGER", "TRUSTEE", "CUSTOMER",
    "SUPPLIER", "ISSUE", "BRANCH", "REGULATE", "REFLECTS",
    "SERVE", "WORK", "TRANSACTION", "监管", "执行",
}

# Allowed risky relations (union of HIGH + MEDIUM + LOW)
_DEFAULT_RISKY_RELS = _HIGH_RISK_RELS | _MEDIUM_RISK_RELS | {
    "履行", "包含责任方", "COMPLIES_WITH", "LOCATED_IN",
}

_RELATION_NAME_CN: dict[str, str] = {
    "INVEST": "投资",
    "CONTROL": "控股",
    "CONTROLLER": "实际控制",
    "CONTROLL": "控制",
    "GUARANTEE": "担保",
    "SERVE": "服务",
    "TRANSACTION": "交易",
    "WARNING": "预警",
    "MENTION": "提及",
    "TRIGGERS": "触发",
    "REFLECTS": "反映",
    "CAUSE": "导致",
    "WORK": "任职",
    "SUE": "诉讼",
    "JOINDER": "参与",
    "MANAGER": "管理",
    "TRUSTEE": "受托",
    "CUSTOMER": "客户",
    "SUPPLIER": "供应商",
    "ISSUE": "发行",
    "BRANCH": "分支",
    "REGULATE": "监管",
    "PUNISH": "处罚",
    "FRAUD": "欺诈",
    "EXECUTED": "被执行",
    "COMPLIES_WITH": "遵守",
    "LOCATED_IN": "位于",
    "监管": "监管",
    "触发": "触发",
    "映射法规": "映射法规",
    "执行": "执行",
    "履行": "履行",
    "包含责任方": "包含责任方",
}

_RISK_LEVEL_RANK = {"high": 3, "medium": 2, "low": 1}


def _max_risk(a: str, b: str) -> str:
    return a if _RISK_LEVEL_RANK.get(a, 0) >= _RISK_LEVEL_RANK.get(b, 0) else b


# ── Public API ──────────────────────────────────────────────────────


def enumerate_multi_hop_risk_paths(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
    seed_ids: list[str],
    max_path_length: int = 4,
    max_branch: int = 20,
    relation_whitelist: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Enumerate all risk paths from seed nodes via BFS.

    Args:
        nodes: Subgraph node dicts with at least ``id``, ``type``/``labels``.
        edges: Subgraph edge dicts with ``source``, ``target``, ``relation``/``type``.
        seed_ids: Starting node IDs for path enumeration.
        max_path_length: Max number of NODES in a path (not edges).
        max_branch: Max outgoing branches to explore per node (avoids explosion).
        relation_whitelist: Only follow these relation types (None = use default risky set).

    Returns:
        List of raw paths, each with path_id, node_ids, edge_ids, relations, seed_id, length.
    """
    if not nodes or not edges or not seed_ids:
        return []

    allowed_rels = _normalize_whitelist(relation_whitelist)
    adj, edge_map = _build_adjacency(edges, allowed_rels)

    seed_set = set(str(sid) for sid in seed_ids)
    seen_paths: set[str] = set()
    results: list[dict[str, Any]] = []
    path_counter = 0

    for seed_id in seed_set:
        if seed_id not in adj:
            continue
        # BFS queue: (path_nodes, path_edges, path_relations)
        queue: deque = deque()
        queue.append(([seed_id], [], []))

        while queue:
            path_nodes, path_edges, path_relations = queue.popleft()
            current = path_nodes[-1]

            if len(path_nodes) >= max_path_length:
                continue

            neighbors = adj.get(current, [])
            # Sort by risk priority and limit branches
            neighbors_sorted = sorted(
                neighbors,
                key=lambda x: _relation_risk_weight(x[2]),
                reverse=True,
            )[:max_branch]

            for neighbor_id, edge_id, relation in neighbors_sorted:
                if neighbor_id in path_nodes:
                    continue  # no cycles

                new_nodes = path_nodes + [neighbor_id]
                new_edges = path_edges + [edge_id]
                new_relations = path_relations + [relation]

                # Record path (minimum 2 nodes = 1 edge)
                sig = _path_signature(new_nodes)
                if sig not in seen_paths:
                    seen_paths.add(sig)
                    path_counter += 1
                    results.append({
                        "path_id": f"path-{path_counter}",
                        "node_ids": new_nodes,
                        "edge_ids": new_edges,
                        "relations": new_relations,
                        "seed_id": seed_id,
                        "length": len(new_nodes),
                    })

                # Continue BFS if not at max length
                if len(new_nodes) < max_path_length:
                    queue.append((new_nodes, new_edges, new_relations))

    logger.info(
        "[RiskPathEnum] subgraph_nodes=%d subgraph_edges=%d seed_ids=%d "
        "raw_paths=%d max_path_length=%d max_branch=%d",
        len(nodes), len(edges), len(seed_set), len(results),
        max_path_length, max_branch,
    )
    return results


def score_risk_paths(
    raw_paths: list[dict[str, Any]],
    node_map: dict[str, dict[str, Any]],
    entity_community_map: dict[str, dict[str, Any]] | None = None,
    max_path_length: int = 4,
) -> list[dict[str, Any]]:
    """Score and enrich raw paths with risk level, confidence, path type, description.

    Args:
        raw_paths: Output from :func:`enumerate_multi_hop_risk_paths`.
        node_map: {node_id: {name, type, labels, ...}} for all nodes in the subgraph.
        entity_community_map: {node_id: {communityId, role, isSeed, riskLevel}}.
        max_path_length: Used to normalize the path-length scoring factor.

    Returns:
        Scored paths sorted by score descending, with fields matching the
        RiskPath API response contract.
    """
    community_map = entity_community_map or {}
    scored: list[dict[str, Any]] = []

    for raw in raw_paths:
        node_ids = raw["node_ids"]
        edge_ids = raw["edge_ids"]
        relations = raw["relations"]

        # ── 1. Relation risk score ──
        rel_score = sum(_relation_risk_weight(r) for r in relations)

        # ── 2. Path length factor ──
        norm_len = min(len(node_ids) / max(1, max_path_length), 1.0)
        length_factor = norm_len * 20.0

        # ── 3. Node type bonus ──
        node_type_bonus = 0.0
        for nid in node_ids:
            node = node_map.get(nid, {})
            ntype = str(node.get("type", "") or node.get("entity_type", "")).upper()
            labels = [str(l).upper() for l in node.get("labels", [])]
            if "EVENT" in labels or "SUB_EVENT" in labels or ntype in ("EVENT", "SUB_EVENT", "RISK_EVENT"):
                node_type_bonus += 15.0
            elif "ADVANTAGEHOLDER" in labels or "INFLUENCE" in labels or "DISADVANTAGEHOLDER" in labels or "ADVANTAGE" in labels or ntype in ("ADVANTAGEHOLDER", "INFLUENCE", "DISADVANTAGEHOLDER", "ADVANTAGE"):
                node_type_bonus += 10.0
            elif "LAW" in labels or "REGULATION" in labels or "ACTION" in labels or "CHAPTER" in labels or ntype in ("LAW", "REGULATION", "ACTION", "CHAPTER"):
                node_type_bonus += 10.0

        # ── 4. Cross-community bonus ──
        community_ids: list[int] = []
        for nid in node_ids:
            entry = community_map.get(str(nid), {})
            cid = entry.get("communityId") if entry.get("communityId") is not None else entry.get("community_id")
            if cid is not None and int(cid) not in community_ids:
                community_ids.append(int(cid))
        community_bonus = max(0, len(community_ids) - 1) * 10.0

        # ── 5. Normalize to 0-100 ──
        raw_score = rel_score + length_factor + node_type_bonus + community_bonus
        score = round(min(raw_score, 100.0))

        # ── Risk level ──
        if score >= 70:
            risk_level = "high"
        elif score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"

        # ── Path type ──
        path_type = _classify_path_type(node_ids, node_map, community_ids)

        # ── Affected entities (display names) ──
        affected = []
        for nid in node_ids:
            node = node_map.get(nid, {})
            name = node.get("name", "") or node.get("title", "") or nid
            affected.append(str(name))

        # ── Evidence from terminal nodes ──
        evidence = _build_evidence(node_ids, node_map)

        scored.append({
            "path_id": raw["path_id"],
            "risk_level": risk_level,
            "score": score,
            "confidence": round(score / 100.0, 2),
            "path_type": path_type,
            "community_path": community_ids,
            "node_ids": node_ids,
            "edge_ids": edge_ids,
            "relations": relations,
            "affected_entities": affected,
            "path_description": _generate_path_description(
                affected, relations, path_type, risk_level,
            ),
            "evidence": evidence,
        })

    scored.sort(key=lambda p: (-p["score"], p["path_id"]))
    high = sum(1 for p in scored if p["risk_level"] == "high")
    med = sum(1 for p in scored if p["risk_level"] == "medium")
    low = sum(1 for p in scored if p["risk_level"] == "low")
    logger.info(
        "[RiskPathScore] scored_paths=%d high=%d medium=%d low=%d",
        len(scored), high, med, low,
    )
    return scored


def build_community_risk_paths(
    node_paths: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Aggregate node-level risk paths into community-level risk paths.

    Groups paths by (source_community, target_community) pairs derived from
    each path's community_path field.
    """
    groups: dict[tuple[int, int], list[dict[str, Any]]] = defaultdict(list)

    for path in node_paths:
        cp = path.get("community_path", [])
        if len(cp) < 2:
            continue
        src = cp[0]
        tgt = cp[-1]
        if src == tgt:
            continue
        groups[(src, tgt)].append(path)

    result: list[dict[str, Any]] = []
    for (src, tgt), paths in groups.items():
        max_score = max(p["score"] for p in paths)
        worst_risk = "low"
        for p in paths:
            worst_risk = _max_risk(worst_risk, p["risk_level"])
        all_rels: set[str] = set()
        for p in paths:
            all_rels.update(p.get("relations", []))
        main_relations = list(all_rels)[:5]
        result.append({
            "source_community": src,
            "target_community": tgt,
            "risk_level": worst_risk,
            "score": max_score,
            "path_ids": [p["path_id"] for p in paths],
            "main_relations": main_relations,
            "description": (
                f"群体 #{src} 与群体 #{tgt} 之间存在 "
                f"{'、'.join(_cn_rel_name(r) for r in main_relations)} 关系，"
                f"形成跨社区风险传导。"
            ),
        })

    # Sort by score desc
    result.sort(key=lambda x: -x["score"])
    return result


def build_view_model(
    risk_paths: list[dict[str, Any]],
) -> dict[str, Any]:
    """Build frontend highlight model from risk paths.

    Returns:
        {highlightNodeIds, highlightEdgeIds, highlightCommunityIds, defaultSelectedPathId}
    """
    node_ids: set[str] = set()
    edge_ids: set[str] = set()
    community_ids: set[int] = set()

    for path in risk_paths:
        for nid in path.get("node_ids", []):
            node_ids.add(str(nid))
        for eid in path.get("edge_ids", []):
            edge_ids.add(str(eid))
        for cid in path.get("community_path", []):
            community_ids.add(int(cid))

    default_id = risk_paths[0]["path_id"] if risk_paths else ""

    return {
        "highlight_node_ids": sorted(node_ids),
        "highlight_edge_ids": sorted(edge_ids),
        "highlight_community_ids": sorted(community_ids),
        "default_selected_path_id": default_id,
    }


def build_node_map(nodes: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Build a lookup map from node_id to node dict."""
    result: dict[str, dict[str, Any]] = {}
    for n in nodes:
        if not isinstance(n, dict):
            continue
        nid = str(n.get("id", "") or n.get("element_id", ""))
        if not nid:
            continue
        # Extract display name
        props = n.get("properties", {}) if isinstance(n.get("properties"), dict) else {}
        name = (
            n.get("name") or props.get("name")
            or props.get("COMPANY_NM") or props.get("zh_name")
            or props.get("title") or props.get("PERSON_NM")
            or n.get("label") or nid
        )
        labels = n.get("labels", []) or []
        entity_type = n.get("type") or n.get("entity_type") or ""
        result[nid] = {
            "id": nid,
            "name": str(name),
            "type": str(entity_type),
            "labels": [str(l) for l in labels],
        }
    return result


# ── Helpers ─────────────────────────────────────────────────────────


def _normalize_whitelist(whitelist: list[str] | None) -> set[str] | None:
    """Normalize relation whitelist. Returns None if empty (use default risky set)."""
    if not whitelist:
        return None
    normalized = {str(r).strip().upper() for r in whitelist if str(r).strip()}
    return normalized if normalized else None


def _build_adjacency(
    edges: list[dict[str, Any]],
    allowed_rels: set[str] | None,
) -> tuple[dict[str, list[tuple[str, str, str]]], dict[str, dict[str, Any]]]:
    """Build adjacency list from edges.

    Returns:
        (adjacency, edge_map) where adjacency is {node_id: [(neighbor, edge_id, relation), ...]}
        and edge_map is {edge_id: edge_dict}.
    """
    adj: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    edge_map: dict[str, dict[str, Any]] = {}

    for e in edges:
        if not isinstance(e, dict):
            continue
        src = str(e.get("source", ""))
        tgt = str(e.get("target", ""))
        rel = str(e.get("relation") or e.get("type") or e.get("label", "")).upper()
        eid = str(e.get("id") or e.get("element_id") or f"{src}-{tgt}")

        if not src or not tgt or not rel:
            continue
        if allowed_rels is not None and rel not in allowed_rels:
            continue

        adj[src].append((tgt, eid, rel))
        adj[tgt].append((src, eid, rel))  # undirected
        if eid not in edge_map:
            edge_map[eid] = e

    return dict(adj), edge_map


def _relation_risk_weight(relation: str) -> float:
    """Map relation type to risk weight."""
    rel = relation.upper()
    if rel in _HIGH_RISK_RELS:
        return 25.0
    if rel in _MEDIUM_RISK_RELS:
        return 15.0
    return 8.0


def _path_signature(node_ids: list[str]) -> str:
    """Create a canonical signature for deduplication."""
    return "|".join(sorted(node_ids))


def _classify_path_type(
    node_ids: list[str],
    node_map: dict[str, dict[str, Any]],
    community_ids: list[int],
) -> str:
    """Classify the path type based on terminal node and community crossing."""
    if len(community_ids) >= 2:
        return "cross_community"

    if len(node_ids) < 2:
        return "company_to_company"

    last_nid = node_ids[-1]
    last_node = node_map.get(last_nid, {})
    ntype = str(last_node.get("type", "")).upper()
    labels = [str(l).upper() for l in last_node.get("labels", [])]

    if "EVENT" in labels or "SUB_EVENT" in labels or ntype in ("EVENT", "SUB_EVENT", "RISK_EVENT"):
        return "company_event"
    if "PERSON" in labels or ntype == "PERSON":
        return "company_to_person"
    if "LAW" in labels or "REGULATION" in labels or "ACTION" in labels or ntype in ("LAW", "REGULATION", "ACTION"):
        return "company_to_regulation"
    return "company_to_company"


def _cn_rel_name(relation: str) -> str:
    """Get Chinese display name for a relation type."""
    return _RELATION_NAME_CN.get(relation.upper(), relation)


def _generate_path_description(
    affected: list[str],
    relations: list[str],
    path_type: str,
    risk_level: str,
) -> str:
    """Generate a Chinese path description from template."""
    if not affected or len(affected) < 2:
        return "风险传导路径"

    parts: list[str] = []
    for i in range(len(affected) - 1):
        rel_cn = _cn_rel_name(relations[i]) if i < len(relations) else "关联"
        parts.append(f"{affected[i]} 通过{rel_cn}关系关联至 {affected[i+1]}")

    body = "，随后 ".join(parts)

    if path_type == "company_event":
        tail = f"，表明风险可能沿上述关系链条向关联主体扩散，触发{affected[-1]}事件。"
    elif path_type == "company_to_regulation":
        tail = f"，该传导路径涉及法规 {affected[-1]}，需重点关注合规影响。"
    elif path_type == "cross_community":
        tail = "，该路径跨越不同风险群体，表明存在跨社区风险传导。"
    else:
        tail = "，表明存在潜在风险传导链路。"

    risk_prefix = {"high": "高风险传导路径：", "medium": "中风险传导路径：", "low": "低风险传导路径："}
    return risk_prefix.get(risk_level, "风险传导路径：") + body + tail


def _build_evidence(
    node_ids: list[str],
    node_map: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    """Build evidence items from terminal nodes that are events, regulations, or risk features."""
    evidence: list[dict[str, Any]] = []
    for nid in node_ids:
        node = node_map.get(nid, {})
        labels = [str(l).upper() for l in node.get("labels", [])]
        ntype = str(node.get("type", "")).upper()
        if "EVENT" in labels or "SUB_EVENT" in labels or ntype in ("EVENT", "SUB_EVENT"):
            evidence.append({
                "node_id": nid,
                "evidence_type": "risk_event",
                "content": str(node.get("name", nid)),
                "confidence": 0.9,
            })
        elif "LAW" in labels or "REGULATION" in labels or ntype in ("LAW", "REGULATION"):
            evidence.append({
                "node_id": nid,
                "evidence_type": "regulation",
                "content": str(node.get("name", nid)),
                "confidence": 0.85,
            })
        elif "ADVANTAGEHOLDER" in labels or "INFLUENCE" in labels or "DISADVANTAGEHOLDER" in labels or "ADVANTAGE" in labels:
            evidence.append({
                "node_id": nid,
                "evidence_type": "risk_feature",
                "content": str(node.get("name", nid)),
                "confidence": 0.8,
            })
    return evidence
