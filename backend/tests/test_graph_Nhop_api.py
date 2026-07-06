"""Unit tests for POST /api/v1/graph/expand/{node_id} — N-hop star expansion.

Uses duck-typed fakes for Neo4j Node / Relationship / Record so that the
tests do not require a running database.  The ``test_client`` fixture
(defined in ``conftest.py``) patches ``api.graph_routes._client`` with a
``unittest.mock.MagicMock`` and returns a FastAPI ``TestClient``.
"""

from __future__ import annotations

import pytest


# ═══════════════════════════════════════════════════════════════════════════
# Duck-typed Neo4j fakes
# ═══════════════════════════════════════════════════════════════════════════


class _FakeNode:
    """Mimics a neo4j.graph.Node sufficiently for ``serialize_node()``."""

    def __init__(self, element_id: str, labels: list[str], props: dict) -> None:
        self.element_id = element_id
        self.labels = frozenset(labels)
        self._props = props

    def __getitem__(self, key: str):
        return self._props[key]

    def get(self, key: str, default=None):
        return self._props.get(key, default)

    def keys(self):
        return self._props.keys()

    def __iter__(self):
        return iter(self._props)


class _FakeRelationship:
    """Mimics a neo4j.graph.Relationship for ``serialize_relationship()``."""

    def __init__(
        self,
        element_id: str,
        start_node: _FakeNode,
        end_node: _FakeNode,
        rel_type: str,
        props: dict | None = None,
    ) -> None:
        self.element_id = element_id
        self.start_node = start_node
        self.end_node = end_node
        self.type = rel_type
        self._props = props or {}

    def __getitem__(self, key: str):
        return self._props[key]

    def get(self, key: str, default=None):
        return self._props.get(key, default)

    def keys(self):
        return self._props.keys()

    def __iter__(self):
        return iter(self._props)


class _FakeRecord:
    """Mimics a neo4j.Record with .get() access."""

    def __init__(self, **kwargs) -> None:
        self._data = kwargs

    def get(self, key: str, default=None):
        return self._data.get(key, default)


# ═══════════════════════════════════════════════════════════════════════════
# Test-data factories
# ═══════════════════════════════════════════════════════════════════════════


def _make_company(name: str, element_id: str | None = None) -> _FakeNode:
    eid = element_id or f"4:c:{abs(hash(name)) % 100000}:0"
    return _FakeNode(eid, ["Subject", "COMPANY"], {"name": name, "COMPANY_NM": name})


def _make_rel(
    node_a: _FakeNode, node_b: _FakeNode,
    rel_type: str = "INVEST", props: dict | None = None,
) -> _FakeRelationship:
    rid = f"5:{node_a.element_id}-{rel_type}-{node_b.element_id}:0"
    return _FakeRelationship(rid, node_a, node_b, rel_type, props)


_VALID_RELS = ["INVEST", "WORK", "GUARANTEE", "CONTROLLER", "CONTROL",
               "MENTION", "TRIGGERS", "REFLECTS", "CAUSE", "COMPLIES_WITH"]


def _build_chain(n: int) -> tuple[list[_FakeNode], list[_FakeRelationship]]:
    """Build an N-node chain using ALLOWED_REL_TYPES values."""
    nodes: list[_FakeNode] = []
    edges: list[_FakeRelationship] = []
    labels_seq = ["COMPANY", "PERSON", "EVENT", "COMPANY", "PERSON", "EVENT"]
    for i in range(n):
        name = chr(ord("A") + i)
        nodes.append(_FakeNode(
            f"node-{name}",
            ["Subject", labels_seq[i % len(labels_seq)]],
            {"name": name},
        ))
    for i in range(n - 1):
        rt = _VALID_RELS[i % len(_VALID_RELS)]
        edges.append(_make_rel(nodes[i], nodes[i + 1], rt))
    return nodes, edges


def _build_triangle() -> tuple[list[_FakeNode], list[_FakeRelationship]]:
    """Build triangle: A -INVEST- B -WORK- C, A -GUARANTEE- C."""
    a = _make_company("A", "node-A")
    b = _make_company("B", "node-B")
    c = _make_company("C", "node-C")
    e1 = _make_rel(a, b, "INVEST")
    e2 = _make_rel(b, c, "WORK")
    e3 = _make_rel(a, c, "GUARANTEE")
    return [a, b, c], [e1, e2, e3]


def _find_node_by_id(nodes: list[_FakeNode], eid: str) -> _FakeNode | None:
    for n in nodes:
        if n.element_id == eid:
            return n
    return None


# ═══════════════════════════════════════════════════════════════════════════
# Smart mock — routes queries based on recognizable patterns
# ═══════════════════════════════════════════════════════════════════════════


def _setup_mock(mock_db, center_node: _FakeNode, all_nodes: list[_FakeNode], all_edges: list[_FakeRelationship]):
    """Configure ``mock_db.execute_read_with_summary`` to route queries.

    Uses a call-sequence list: each element is a (check_fn, result_fn) pair.
    The first matching check_fn wins.
    """

    def _neighbors_of(frontier_ids: set[str]) -> list[_FakeRecord]:
        """Return DISTINCT neighbor nodes reachable from frontier."""
        result: list[_FakeRecord] = []
        seen: set[str] = set()
        for e in all_edges:
            src = e.start_node.element_id
            tgt = e.end_node.element_id
            if src in frontier_ids and tgt not in seen:
                target_node = _find_node_by_id(all_nodes, tgt)
                if target_node:
                    result.append(_FakeRecord(m=target_node))
                    seen.add(tgt)
            if tgt in frontier_ids and src not in seen:
                target_node = _find_node_by_id(all_nodes, src)
                if target_node:
                    result.append(_FakeRecord(m=target_node))
                    seen.add(src)
        return result

    def _closure_edges(node_ids_in: set[str], edge_limit: int) -> list[_FakeRecord]:
        """Return all edges whose both endpoints are in node_ids_in."""
        result: list[_FakeRecord] = []
        for e in all_edges:
            if e.start_node.element_id in node_ids_in and e.end_node.element_id in node_ids_in:
                a_node = _find_node_by_id(all_nodes, e.start_node.element_id)
                b_node = _find_node_by_id(all_nodes, e.end_node.element_id)
                if a_node and b_node:
                    result.append(_FakeRecord(a=a_node, r=e, b=b_node))
        return result[:edge_limit]

    def _side_effect(query: str, params: dict | None = None, timeout_seconds: float = 10.0):
        params = params or {}
        q = query.replace("\n", " ").replace("  ", " ")

        # Center lookup: MATCH (n) WHERE elementId(n) = $nodeId RETURN n
        if "elementId(n) = $nodeId" in q and "RETURN n" in q and "MATCH (n)" in q:
            return ([_FakeRecord(n=center_node)], {"result_count": 1})

        # Keyword center matching: coalesce(center.
        if "coalesce(center." in q:
            keyword = params.get("keyword", "")
            matched: list[_FakeRecord] = []
            for n in all_nodes:
                props = dict(n)
                name = str(props.get("name", "") or props.get("COMPANY_NM", ""))
                if keyword and keyword in name:
                    matched.append(_FakeRecord(center=n, match_rank=0))
            return (matched, {"result_count": len(matched)})

        # Closure: RETURN DISTINCT a, r, b
        if "RETURN DISTINCT a, r, b" in q and "$nodeIds" in q:
            node_ids_in = set(params.get("nodeIds", []))
            edge_limit = params.get("edgeLimit", 2000)
            return (_closure_edges(node_ids_in, edge_limit), {"result_count": len(_closure_edges(node_ids_in, edge_limit))})

        # BFS: RETURN DISTINCT m
        if "RETURN DISTINCT m" in q and "$frontier" in q:
            frontier_ids = set(params.get("frontier", []))
            recs = _neighbors_of(frontier_ids)
            return (recs, {"result_count": len(recs)})

        # Fallback
        return ([], {"result_count": 0})

    mock_db.execute_read_with_summary.side_effect = _side_effect


# ═══════════════════════════════════════════════════════════════════════════
# Test cases — POST /api/v1/graph/expand/{node_id}
# ═══════════════════════════════════════════════════════════════════════════


class TestExpandNodeApi:
    """Tests for POST /api/v1/graph/expand/{node_id}."""

    # ── 1. depth=4 returns all intermediate nodes ────────────────────────

    def test_post_expand_depth_4_returns_all_intermediate_nodes(self, test_client):
        """Chain A-B-C-D-E with depth=4 — must return 5 nodes + 4 edges."""
        nodes, edges = _build_chain(5)
        center = nodes[0]  # A
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 4, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
                "includeProperties": True,
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert body["centerNode"]["id"] == center.element_id

        node_names = {n["properties"]["name"] for n in body["nodes"]}
        assert {"A", "B", "C", "D", "E"}.issubset(node_names), f"Got nodes: {node_names}"

        assert len(body["edges"]) == 4, f"Expected 4 edges, got {len(body['edges'])}"
        assert body["subgraph"]["nodeCount"] == len(body["nodes"])
        assert body["subgraph"]["edgeCount"] == len(body["edges"])
        assert body["summary"]["requestedDepth"] == 4
        assert "4" in body["summary"]["frontierCountsByHop"]

    # ── 2. closure edges are completed ───────────────────────────────────

    def test_post_expand_closure_edges_are_completed(self, test_client):
        """Triangle A-B-C with A-C: depth=2 from A must return all 3 edges."""
        nodes, edges = _build_triangle()
        center = nodes[0]  # A
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 2, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
                "includeProperties": True,
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert len(body["edges"]) == 3, f"Expected 3 edges, got {len(body['edges'])}"

        edge_pairs: set[tuple[str, str]] = set()
        for e in body["edges"]:
            edge_pairs.add((e["source"], e["target"]))
            edge_pairs.add((e["target"], e["source"]))

        def _has_edge(src: str, tgt: str) -> bool:
            return (src, tgt) in edge_pairs

        assert _has_edge("node-A", "node-B"), "Missing A-B"
        assert _has_edge("node-B", "node-C"), "Missing B-C"
        assert _has_edge("node-A", "node-C"), "Missing A-C (closure edge)"

    # ── 3. nodeLimit truncation ──────────────────────────────────────────

    def test_post_expand_node_limit_truncated_warning(self, test_client):
        """Chain A-B-C-D-E with nodeLimit=2 → truncated by nodeLimit."""
        nodes, edges = _build_chain(5)
        center = nodes[0]  # A
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 4, "nodeLimit": 2, "edgeLimit": 500,
                "relationWhitelist": ["*"],
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert body["summary"]["truncated"] is True
        assert body["summary"]["truncatedBy"] == "nodeLimit"
        assert any("NODE_LIMIT_REACHED" in w for w in body["warnings"])

    # ── 4. edgeLimit truncation ──────────────────────────────────────────

    def test_post_expand_edge_limit_truncated_warning(self, test_client):
        """Triangle A-B-C with edgeLimit=1 → truncated by edgeLimit."""
        nodes, edges = _build_triangle()
        center = nodes[0]  # A
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 2, "nodeLimit": 100, "edgeLimit": 1,
                "relationWhitelist": ["*"],
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert body["summary"]["truncated"] is True
        assert "edgeLimit" in (body["summary"]["truncatedBy"] or "")
        assert any("EDGE_LIMIT_REACHED" in w for w in body["warnings"])

    # ── 5. node not found ────────────────────────────────────────────────

    def test_post_expand_node_not_found(self, test_client):
        """Non-existent node_id returns success=False with NODE_NOT_FOUND."""
        test_client._mock_db.execute_read_with_summary.return_value = (
            [], {"result_count": 0}
        )

        resp = test_client.post(
            "/api/v1/graph/expand/not-exists",
            json={"depth": 2, "nodeLimit": 100, "edgeLimit": 500},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is False
        assert body["errorCode"] == "NODE_NOT_FOUND"
        assert "未找到节点" in body["message"]

    # ── 6. GET compatibility wrapper ─────────────────────────────────────

    def test_get_expand_compatibility_wrapper(self, test_client):
        """GET /expand/{node_id}?depth=2&limit=100 should delegate to POST."""
        nodes, edges = _build_chain(3)
        center = nodes[0]
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.get(
            f"/api/v1/graph/expand/{center.element_id}?depth=2&limit=100"
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert body["centerNode"]["id"] == center.element_id
        assert body["summary"]["requestedDepth"] == 2


# ═══════════════════════════════════════════════════════════════════════════
# Edge cases
# ═══════════════════════════════════════════════════════════════════════════


class TestExpandNodeEdgeCases:
    """Additional edge cases for POST /expand."""

    def test_expand_depth_1_returns_immediate_neighbors_only(self, test_client):
        """Chain A-B-C-D-E with depth=1: includes A and B."""
        nodes, edges = _build_chain(5)
        center = nodes[0]
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 1, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["success"] is True
        node_names = {n["properties"]["name"] for n in body["nodes"]}
        assert "A" in node_names
        assert "B" in node_names

    def test_expand_default_relation_whitelist_used(self, test_client):
        """Empty relationWhitelist → DEFAULT_RELATION_WHITELIST is applied."""
        nodes = [
            _make_company("A", "node-A"),
            _make_company("B", "node-B"),
            _make_company("C", "node-C"),
        ]
        edges = [
            _make_rel(nodes[0], nodes[1], "INVEST"),
            _make_rel(nodes[1], nodes[2], "WORK"),
        ]
        center = nodes[0]
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 2, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": [],
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["success"] is True
        assert len(body["edges"]) >= 1

    def test_expand_star_all_relations(self, test_client):
        """relationWhitelist=["*"] → no filtering."""
        nodes = [
            _make_company("A", "node-A"),
            _make_company("B", "node-B"),
            _make_company("C", "node-C"),
        ]
        edges = [
            _make_rel(nodes[0], nodes[1], "INVEST"),
            _make_rel(nodes[1], nodes[2], "WORK"),
        ]
        center = nodes[0]
        _setup_mock(test_client._mock_db, center, nodes, edges)

        resp = test_client.post(
            f"/api/v1/graph/expand/{center.element_id}",
            json={
                "depth": 2, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["success"] is True
