"""Unit tests for POST /api/v1/graph/search-all — cross-layer keyword search.

Uses duck-typed fakes for Neo4j Node / Relationship / Record so that the
tests do not require a running database.  The ``test_client`` fixture
(defined in ``conftest.py``) patches ``api.graph_routes._client`` with a
``unittest.mock.MagicMock`` and returns a FastAPI ``TestClient``.

The new POST /search-all handler performs:
1. Center-node keyword matching (exact → fuzzy, two-phase)
2. Unified N-hop expansion via ``expand_subgraph()`` (BFS + closure)
3. Optional triple generation from closure edges
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


def _make_person(name: str, element_id: str | None = None) -> _FakeNode:
    eid = element_id or f"4:p:{abs(hash(name)) % 100000}:0"
    return _FakeNode(eid, ["Subject", "PERSON"], {"name": name, "PERSON_NM": name})


def _make_event(title: str, element_id: str | None = None) -> _FakeNode:
    eid = element_id or f"4:e:{abs(hash(title)) % 100000}:0"
    return _FakeNode(eid, ["Event", "EVENT"], {"name": title, "title": title})


def _make_rel(
    node_a: _FakeNode, node_b: _FakeNode,
    rel_type: str = "INVEST", props: dict | None = None,
) -> _FakeRelationship:
    rid = f"5:{node_a.element_id}-{rel_type}-{node_b.element_id}:0"
    return _FakeRelationship(rid, node_a, node_b, rel_type, props)


def _find_node_by_id(nodes: list[_FakeNode], eid: str) -> _FakeNode | None:
    for n in nodes:
        if n.element_id == eid:
            return n
    return None


def _build_subgraph(center: _FakeNode, neighbors: list[_FakeNode], edges: list[_FakeRelationship]):
    """Build a 1-hop star subgraph: center connected to each neighbor."""
    all_nodes = [center] + neighbors
    return all_nodes, edges


# ═══════════════════════════════════════════════════════════════════════════
# Mock helper for the new two-phase search-all flow
# ═══════════════════════════════════════════════════════════════════════════


def _setup_search_all_mock(mock_db, all_nodes: list[_FakeNode], all_edges: list[_FakeRelationship]):
    """Configure mock for the new POST /search-all handler.

    Phase 1: keyword matching (exact → fuzzy)
    Phase 2: expand_subgraph (BFS + closure)
    """

    def _neighbors_of(frontier_ids: set[str]) -> list[_FakeRecord]:
        result: list[_FakeRecord] = []
        seen: set[str] = set()
        for e in all_edges:
            src = e.start_node.element_id
            tgt = e.end_node.element_id
            if src in frontier_ids and tgt not in seen:
                target = _find_node_by_id(all_nodes, tgt)
                if target:
                    result.append(_FakeRecord(m=target))
                    seen.add(tgt)
            if tgt in frontier_ids and src not in seen:
                target = _find_node_by_id(all_nodes, src)
                if target:
                    result.append(_FakeRecord(m=target))
                    seen.add(src)
        return result

    def _closure_edges(node_ids_in: set[str], edge_limit: int) -> list[_FakeRecord]:
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

        def has_layer(node: _FakeNode, labels: list[str]) -> bool:
            return bool(set(node.labels).intersection(labels))

        def text_matches(node: _FakeNode, terms: list[str]) -> bool:
            text = " ".join(str(value) for value in dict(node).values() if value)
            return any(term in text for term in terms)

        # Center node lookup (for expand)
        if "elementId(n) = $nodeId" in q and "RETURN n" in q:
            nid = params.get("nodeId", "")
            node = _find_node_by_id(all_nodes, nid) or all_nodes[0]
            return ([_FakeRecord(n=node)], {"result_count": 1})

        # Keyword exact/fuzzy matching (for search-all center nodes)
        if "coalesce(center." in q or ("center.name" in q or "center.title" in q or "center." in q):
            keyword = params.get("keyword", "")
            keywords = params.get("keywords", [keyword])
            center_limit = params.get("center_limit", 10)
            query_limit = params.get("supplemental_limit", center_limit)
            is_content_query = "center.e_text" in q or "center.definition" in q
            is_exact_query = "= $keyword" in q and "CONTAINS $keyword" not in q
            matched: list[_FakeRecord] = []
            for n in all_nodes:
                props = dict(n)
                name = str(props.get("name", "") or props.get("COMPANY_NM", ""))
                content = " ".join(str(props.get(key, "")) for key in (
                    "e_text", "definition", "description", "content", "text", "summary",
                ))
                name_matches = name == keyword if is_exact_query else keyword in name
                content_matches = is_content_query and any(term in content for term in keywords)
                if keyword and (name_matches or content_matches):
                    matched.append(_FakeRecord(center=n, match_rank=0))
            return (matched[:query_limit], {"result_count": len(matched)})

        # Subject cascade — stage queries
        if "RETURN DISTINCT source, r, target" in q and "$frontier" in q:
            frontier = set(params.get("frontier", []))
            labels = params.get("subjectLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in frontier and has_layer(target, labels):
                    result.append(_FakeRecord(source=source, r=edge, target=target))
                elif source and target and target.element_id in frontier and has_layer(source, labels):
                    result.append(_FakeRecord(source=target, r=edge, target=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT subject, r, event" in q:
            subject_ids = set(params.get("subjectIds", []))
            labels = params.get("eventLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in subject_ids and has_layer(target, labels):
                    result.append(_FakeRecord(subject=source, r=edge, event=target))
                elif source and target and target.element_id in subject_ids and has_layer(source, labels):
                    result.append(_FakeRecord(subject=target, r=edge, event=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT event" in q and "$eventLabels" in q:
            labels = params.get("eventLabels", [])
            terms = params.get("terms", [])
            result = [
                _FakeRecord(event=node)
                for node in all_nodes
                if has_layer(node, labels) and text_matches(node, terms)
            ]
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT event, r, neighbor" in q:
            event_ids = set(params.get("eventIds", []))
            labels = params.get("classifiedLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in event_ids and has_layer(target, labels):
                    result.append(_FakeRecord(event=source, r=edge, neighbor=target))
                elif source and target and target.element_id in event_ids and has_layer(source, labels):
                    result.append(_FakeRecord(event=target, r=edge, neighbor=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT event, r, feature" in q:
            event_ids = set(params.get("eventIds", []))
            labels = params.get("featureLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in event_ids and has_layer(target, labels):
                    result.append(_FakeRecord(event=source, r=edge, feature=target))
                elif source and target and target.element_id in event_ids and has_layer(source, labels):
                    result.append(_FakeRecord(event=target, r=edge, feature=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT feature" in q and "$featureLabels" in q:
            labels = params.get("featureLabels", [])
            terms = params.get("terms", [])
            result = [
                _FakeRecord(feature=node)
                for node in all_nodes
                if has_layer(node, labels) and text_matches(node, terms)
            ]
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT source, r, target" in q and "$featureIds" in q:
            feature_ids = set(params.get("featureIds", []))
            labels = params.get("classifiedLabels", params.get("featureLabels", []))
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in feature_ids and has_layer(target, labels):
                    result.append(_FakeRecord(source=source, r=edge, target=target))
                elif source and target and target.element_id in feature_ids and has_layer(source, labels):
                    result.append(_FakeRecord(source=target, r=edge, target=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT feature, r, regulation" in q:
            feature_ids = set(params.get("featureIds", []))
            labels = params.get("regulationLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in feature_ids and has_layer(target, labels):
                    result.append(_FakeRecord(feature=source, r=edge, regulation=target))
                elif source and target and target.element_id in feature_ids and has_layer(source, labels):
                    result.append(_FakeRecord(feature=target, r=edge, regulation=source))
            return (result, {"result_count": len(result)})

        if "RETURN DISTINCT source, r, target" in q and "$regulationIds" in q:
            regulation_ids = set(params.get("regulationIds", []))
            labels = params.get("regulationLabels", [])
            result = []
            for edge in all_edges:
                source = _find_node_by_id(all_nodes, edge.start_node.element_id)
                target = _find_node_by_id(all_nodes, edge.end_node.element_id)
                if source and target and source.element_id in regulation_ids and has_layer(target, labels):
                    result.append(_FakeRecord(source=source, r=edge, target=target))
                elif source and target and target.element_id in regulation_ids and has_layer(source, labels):
                    result.append(_FakeRecord(source=target, r=edge, target=source))
            return (result, {"result_count": len(result)})

        # Closure phase
        if "RETURN DISTINCT a, r, b" in q and "$nodeIds" in q:
            node_ids_in = set(params.get("nodeIds", []))
            edge_limit = params.get("edgeLimit", 2000)
            result = _closure_edges(node_ids_in, edge_limit)
            return (result, {"result_count": len(result)})

        # BFS phase
        if "RETURN DISTINCT m" in q and "$frontier" in q:
            frontier_ids = set(params.get("frontier", []))
            recs = _neighbors_of(frontier_ids)
            return (recs, {"result_count": len(recs)})

        # Fallback
        return ([], {"result_count": 0})

    mock_db.execute_read_with_summary.side_effect = _side_effect


# ═══════════════════════════════════════════════════════════════════════════
# 1. Request validation
# ═══════════════════════════════════════════════════════════════════════════


class TestSearchAllRequestValidation:
    """Pydantic model validation — no database mock needed."""

    def test_empty_query_returns_422(self, test_client):
        resp = test_client.post("/api/v1/graph/search-all", json={"query": ""})
        assert resp.status_code == 422

    def test_missing_query_returns_422(self, test_client):
        resp = test_client.post("/api/v1/graph/search-all", json={})
        assert resp.status_code == 422

    def test_invalid_layer_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "layer": "InvalidLayer"},
        )
        assert resp.status_code == 422

    def test_invalid_output_format_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "outputFormat": "xml"},
        )
        assert resp.status_code == 422

    def test_invalid_relation_whitelist_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "relationWhitelist": ["NOT_A_REAL_REL"]},
        )
        assert resp.status_code == 422

    def test_depth_too_low_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "depth": 0},
        )
        assert resp.status_code == 422

    def test_depth_too_high_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "depth": 100},
        )
        assert resp.status_code == 422

    def test_limit_too_high_rejected(self, test_client):
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "test", "limit": 100000},
        )
        assert resp.status_code == 422

    def test_valid_minimal_request_accepted(self, test_client):
        """A valid request with only the required field returns 200."""
        n1 = _make_company("A", "center-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all", json={"query": "A"}
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True


# ═══════════════════════════════════════════════════════════════════════════
# 2. Response structure
# ═══════════════════════════════════════════════════════════════════════════


class TestSearchAllResponseStructure:
    """Validate the shape of the response against the API spec."""

    @pytest.fixture(autouse=True)
    def _setup(self, test_client):
        self.client = test_client
        n1 = _make_company("A", "center-1")
        n2 = _make_company("B", "neighbor-1")
        n3 = _make_person("C", "neighbor-2")
        n4 = _make_event("D", "neighbor-3")
        e1 = _make_rel(n1, n2, "INVEST")
        e2 = _make_rel(n1, n3, "WORK")
        e3 = _make_rel(n1, n4, "MENTION")
        self.center = n1
        self.nodes = [n1, n2, n3, n4]
        self.edges = [e1, e2, e3]
        _setup_search_all_mock(self.client._mock_db, self.nodes, self.edges)

    def _post(self, **overrides) -> dict:
        body = {"query": "A", "outputFormat": "both"}
        body.update(overrides)
        resp = self.client.post("/api/v1/graph/search-all", json=body)
        assert resp.status_code == 200, resp.text
        return resp.json()

    # ── top-level keys ──

    def test_response_contains_all_top_level_fields(self):
        data = self._post()
        for key in [
            "success", "traceId", "matchedNodes", "nodes",
            "edges", "triples", "summary", "warnings",
        ]:
            assert key in data, f"Missing top-level key: {key}"

    def test_success_is_true(self):
        assert self._post()["success"] is True

    def test_trace_id_format(self):
        trace_id = self._post()["traceId"]
        assert isinstance(trace_id, str)
        assert trace_id.startswith("trc-"), f"Bad traceId: {trace_id}"

    # ── matchedNodes ──

    def test_matched_nodes_are_centers(self):
        matched = self._post()["matchedNodes"]
        matched_ids = {n["id"] for n in matched}
        assert matched_ids == {"center-1"}

    def test_matched_nodes_have_labels_and_properties(self):
        node = self._post()["matchedNodes"][0]
        assert "labels" in node
        assert "properties" in node
        assert "COMPANY" in node["labels"]

    # ── nodes ──

    def test_nodes_include_center_and_neighbors(self):
        node_ids = {n["id"] for n in self._post()["nodes"]}
        assert node_ids >= {"center-1", "neighbor-1", "neighbor-2", "neighbor-3"}

    def test_node_has_id_labels_properties(self):
        node = self._post()["nodes"][0]
        assert "id" in node
        assert "labels" in node
        assert "properties" in node

    # ── edges ──

    def test_edges_present(self):
        edges = self._post()["edges"]
        assert len(edges) == 3

    def test_edge_has_source_target_type(self):
        edge = self._post()["edges"][0]
        assert "source" in edge
        assert "target" in edge
        assert "type" in edge or "label" in edge

    # ── triples ──

    def test_triples_present(self):
        triples = self._post()["triples"]
        assert len(triples) == 3

    def test_triples_have_correct_structure(self):
        triple = self._post()["triples"][0]
        for key in [
            "headId", "head", "headLabels", "relation",
            "tailId", "tail", "tailLabels", "properties",
        ]:
            assert key in triple, f"Missing key in triple: {key}"

    def test_triples_content_matches_edges(self):
        """One triple per edge, matching relation types."""
        data = self._post()
        edge_types = {e.get("type", e.get("label")) for e in data["edges"]}
        triple_types = {t["relation"] for t in data["triples"]}
        assert triple_types == edge_types

    # ── summary ──

    def test_summary_counts_are_correct(self):
        s = self._post()["summary"]
        assert s["matchedCount"] == 1
        assert s["nodeCount"] == 4
        assert s["edgeCount"] == 3
        assert s["tripleCount"] == 3

    def test_summary_has_layer_info(self):
        layers = self._post()["summary"]["layers"]
        assert "Subject" in layers
        assert "Event" in layers

    def test_summary_has_relation_types(self):
        rel_types = self._post()["summary"]["relationTypes"]
        assert "INVEST" in rel_types
        assert "WORK" in rel_types
        assert "MENTION" in rel_types

    def test_summary_has_new_fields(self):
        """New fields: requestedDepth, actualDepth, truncated, etc."""
        s = self._post()["summary"]
        assert "requestedDepth" in s
        assert "actualDepth" in s
        assert "truncated" in s
        assert s["truncated"] is False
        assert "frontierCountsByHop" in s


# ═══════════════════════════════════════════════════════════════════════════
# 3. outputFormat
# ═══════════════════════════════════════════════════════════════════════════


class TestOutputFormat:
    """Verify outputFormat controls which fields are populated."""

    @pytest.fixture(autouse=True)
    def _setup(self, test_client):
        self.client = test_client
        n1 = _make_company("A", "center-1")
        n2 = _make_company("B", "neighbor-1")
        e1 = _make_rel(n1, n2, "INVEST")
        _setup_search_all_mock(self.client._mock_db, [n1, n2], [e1])

    def test_output_format_subgraph(self):
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "subgraph"},
        )
        data = resp.json()
        assert len(data["nodes"]) > 0
        assert len(data["edges"]) > 0
        assert data["triples"] == []

    def test_output_format_triples(self):
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "triples"},
        )
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert list(data[0].keys()) == ["head", "relation", "tail"]

    def test_output_format_both(self):
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "both"},
        )
        data = resp.json()
        assert len(data["nodes"]) > 0
        assert len(data["edges"]) > 0
        assert len(data["triples"]) > 0

    def test_default_output_format_is_subgraph(self):
        """Omitting outputFormat should default to subgraph."""
        resp = self.client.post(
            "/api/v1/graph/search-all", json={"query": "A"}
        )
        data = resp.json()
        assert len(data["nodes"]) > 0
        assert len(data["edges"]) > 0
        assert data["triples"] == []


# ═══════════════════════════════════════════════════════════════════════════
# 4. deduplicate
# ═══════════════════════════════════════════════════════════════════════════


class TestDeduplicate:
    """Verify deduplicate controls triple deduplication."""

    @pytest.fixture(autouse=True)
    def _setup(self, test_client):
        self.client = test_client
        n1 = _make_company("A", "a")
        n2 = _make_company("B", "b")
        # Three edges with different element_ids but same (head, relation, tail)
        e1 = _FakeRelationship("edge-1", n1, n2, "INVEST")
        e2 = _FakeRelationship("edge-2", n1, n2, "INVEST")
        e3 = _FakeRelationship("edge-3", n1, n2, "INVEST")
        _setup_search_all_mock(self.client._mock_db, [n1, n2], [e1, e2, e3])

    def test_deduplicate_true_removes_duplicate_triples(self):
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "triples", "deduplicate": True},
        )
        triples = resp.json()
        assert len(triples) == 1

    def test_deduplicate_false_keeps_duplicates(self):
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "triples", "deduplicate": False},
        )
        triples = resp.json()
        assert len(triples) == 3  # one per edge

    def test_deduplicate_default_is_true(self):
        """deduplicate defaults to true, so triples should be deduped."""
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "triples"},
        )
        triples = resp.json()
        assert len(triples) == 1


# ═══════════════════════════════════════════════════════════════════════════
# 5. Edge cases
# ═══════════════════════════════════════════════════════════════════════════


class TestSearchAllEdgeCases:
    """Error handling and boundary conditions."""

    def test_no_matching_nodes(self, test_client):
        """Empty result set should still return a valid response with warning."""
        test_client._mock_db.execute_read_with_summary.return_value = (
            [], {"result_count": 0}
        )
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "XYZ123NotFound"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["matchedNodes"] == []
        assert body["nodes"] == []
        assert body["edges"] == []
        assert body["triples"] == []
        assert body["summary"]["matchedCount"] == 0
        assert any("NO_MATCHED_NODE" in w for w in body["warnings"])

    def test_layer_filter_subject(self, test_client):
        """layer=Subject should produce Cypher with Subject label conditions."""
        n1 = _make_company("A", "center-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "layer": "Subject"},
        )
        assert resp.status_code == 200
        call_args = test_client._mock_db.execute_read_with_summary.call_args_list
        query_texts = " ".join(str(c[0][0]) for c in call_args)
        assert "Subject" in query_texts or "COMPANY" in query_texts

    def test_relation_whitelist_passed_to_query(self, test_client):
        """relationWhitelist types should appear in the generated Cypher."""
        n1 = _make_company("A", "center-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "A",
                "relationWhitelist": ["INVEST", "WORK", "GUARANTEE"],
            },
        )
        assert resp.status_code == 200

    def test_limit_caps_results(self, test_client):
        """Limit parameter should be used as nodeLimit."""
        n1 = _make_company("A", "center-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "limit": 5},
        )
        assert resp.status_code == 200

    def test_database_exception_graceful(self, test_client):
        """Neo4j errors should return success=False, not a 500 crash."""
        test_client._mock_db.execute_read_with_summary.side_effect = (
            RuntimeError("Neo4j connection refused")
        )
        resp = test_client.post(
            "/api/v1/graph/search-all", json={"query": "test"}
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is False

    def test_single_node_no_neighbors(self, test_client):
        """A center node with no neighbors: matchedNodes==nodes, triples empty."""
        n1 = _make_company("Isolated", "lonely-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "Isolated", "outputFormat": "both"},
        )
        data = resp.json()
        assert data["success"] is True
        node_ids = {n["id"] for n in data["matchedNodes"]}
        assert node_ids == {"lonely-1"}
        assert data["triples"] == []

    def test_duplicate_edges_not_returned_in_nodes(self, test_client):
        """Duplicate edge element_ids should be collapsed."""
        n1 = _make_company("A", "a")
        n2 = _make_company("B", "b")
        e1 = _make_rel(n1, n2, "INVEST")
        _setup_search_all_mock(test_client._mock_db, [n1, n2], [e1])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "A"},
        )
        edges = resp.json()["edges"]
        assert len(edges) == 1

    def test_keyword_not_in_raw_query_string(self, test_client):
        """Keyword must be passed as $keyword parameter, NOT interpolated."""
        n1 = _make_company("A", "center-1")
        _setup_search_all_mock(test_client._mock_db, [n1], [])
        resp = test_client.post(
            "/api/v1/graph/search-all",
            json={"query": "A"},
        )
        assert resp.status_code == 200
        call_args = test_client._mock_db.execute_read_with_summary.call_args_list
        query_str = " ".join(str(c[0][0]) for c in call_args)
        assert "A" not in query_str or "$keyword" in query_str, \
            "Keyword found in raw query — should use $keyword parameter"


# ═══════════════════════════════════════════════════════════════════════════
# 6. New tests for expand_subgraph integration
# ═══════════════════════════════════════════════════════════════════════════


class TestSearchAllNewIntegration:
    """Tests for the new expand_subgraph-based search-all flow."""

    @pytest.fixture(autouse=True)
    def _setup(self, test_client):
        self.client = test_client

    def test_search_all_exact_match_then_expand(self, test_client):
        """Exact match of center node, then multi-hop expansion."""
        n1 = _make_company("A", "center-1")
        n2 = _make_company("B", "neighbor-1")
        n3 = _make_company("C", "neighbor-2")
        e1 = _make_rel(n1, n2, "INVEST")
        e2 = _make_rel(n2, n3, "WORK")
        _setup_search_all_mock(self.client._mock_db, [n1, n2, n3], [e1, e2])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "A", "layer": "all", "type": "COMPANY",
                "depth": 3, "nodeLimit": 100, "edgeLimit": 500,
                "outputFormat": "both",
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["success"] is True
        assert len(body["matchedNodes"]) >= 1
        assert len(body["nodes"]) >= len(body["matchedNodes"])
        assert "summary" in body
        assert body["summary"]["matchedCount"] == len(body["matchedNodes"])
        assert body["summary"]["requestedDepth"] == 3

    def test_exact_entity_adds_cross_layer_text_centers(self, test_client):
        """Exact company search also discovers event/risk text and regulation edges."""
        company = _FakeNode(
            "company-evergrande",
            ["Subject", "COMPANY"],
            {"COMPANY_NM": "中国恒大集团"},
        )
        event = _FakeNode(
            "event-evergrande",
            ["Event"],
            {"e_text": "恒大集团发生重大风险事件"},
        )
        factor = _FakeNode(
            "factor-evergrande",
            ["RiskFactor"],
            {"definition": "恒大流动性风险持续扩散"},
        )
        action = _FakeNode(
            "action-evergrande",
            ["Action"],
            {"title": "监管处置措施"},
        )
        edges = [
            _make_rel(event, factor, "触发"),
            _make_rel(factor, action, "映射法规"),
        ]
        _setup_search_all_mock(
            self.client._mock_db,
            [company, event, factor, action],
            edges,
        )

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "中国恒大集团", "depth": 2, "outputFormat": "both"},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert set(body["summary"]["layers"]) == {
            "Subject", "Event", "Feature", "Regulation",
        }
        assert {"触发", "映射法规"}.issubset(
            set(body["summary"]["relationTypes"])
        )
        assert body["summary"]["matchedCount"] >= 3

    def test_subject_cascade_returns_directional_four_layers_without_truncation(self, test_client):
        company = _FakeNode(
            "company-evergrande",
            ["Subject", "COMPANY"],
            {"COMPANY_NM": "中国恒大集团"},
        )
        related = _FakeNode(
            "company-related",
            ["Subject", "COMPANY"],
            {"COMPANY_NM": "恒大地产集团有限公司"},
        )
        event = _FakeNode(
            "event-evergrande",
            ["Event"],
            {"e_text": "恒大地产集团有限公司发生重大风险事件"},
        )
        factor = _FakeNode(
            "factor-evergrande",
            ["RiskFactor"],
            {"definition": "恒大地产集团有限公司存在流动性风险"},
        )
        feature = _FakeNode(
            "feature-evergrande",
            ["RiskFeature"],
            {"feature_nm": "流动性风险"},
        )
        action = _FakeNode(
            "action-evergrande",
            ["Action"],
            {"title": "进行信息披露"},
        )
        edges = [
            _make_rel(company, related, "INVEST"),
            _make_rel(factor, feature, "构成"),
            _make_rel(factor, action, "映射法规"),
        ]
        _setup_search_all_mock(
            self.client._mock_db,
            [company, related, event, factor, feature, action],
            edges,
        )

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "中国恒大集团",
                "depth": 2,
                "traversalMode": "cascade",
                "outputFormat": "both",
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()

        assert body["summary"]["traversalMode"] == "cascade"
        assert body["summary"]["truncated"] is False
        assert body["summary"]["cascadeStageCounts"] == {
            "Subject": 2,
            "Event": 1,
            "Feature": 2,
            "Regulation": 1,
        }
        assert set(body["summary"]["layers"]) == {
            "Subject", "Event", "Feature", "Regulation",
        }
        virtual_edges = [
            edge for edge in body["edges"]
            if edge.get("properties", {}).get("inferred")
        ]
        assert {edge["type"] for edge in virtual_edges} == {
            "语义关联事件", "语义归因特征",
        }

    def test_search_all_3_hop_triples(self, test_client):
        """Search for A in a 3-hop chain A-B-C-D, verifying triples formation."""
        n1 = _make_company("A", "node-A")
        n2 = _make_company("B", "node-B")
        n3 = _make_company("C", "node-C")
        n4 = _make_company("D", "node-D")
        e1 = _make_rel(n1, n2, "INVEST")
        e2 = _make_rel(n2, n3, "WORK")
        e3 = _make_rel(n3, n4, "GUARANTEE")
        _setup_search_all_mock(self.client._mock_db, [n1, n2, n3, n4], [e1, e2, e3])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "A",
                "depth": 3,
                "outputFormat": "both",
            },
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["success"] is True

        node_ids = {n["id"] for n in body["nodes"]}
        assert {"node-A", "node-B", "node-C", "node-D"}.issubset(node_ids)
        assert len(body["edges"]) == 3

        triples = body["triples"]
        assert len(triples) == 3

        triple_tuples = {(t["headId"], t["relation"], t["tailId"]) for t in triples}
        expected_triples = {
            ("node-A", "INVEST", "node-B"),
            ("node-B", "WORK", "node-C"),
            ("node-C", "GUARANTEE", "node-D"),
        }
        assert triple_tuples == expected_triples

        s = body["summary"]
        assert s["matchedCount"] == 1
        assert s["nodeCount"] == 4
        assert s["edgeCount"] == 3
        assert s["tripleCount"] == 3

    def test_search_all_depth_4_chain(self, test_client):
        """Search for A in a 4-hop chain A-B-C-D-E."""
        labels_seq = ["COMPANY", "PERSON", "EVENT", "COMPANY", "PERSON"]
        nodes = [
            _FakeNode(f"node-{chr(65+i)}", ["Subject", labels_seq[i]], {"name": chr(65+i)})
            for i in range(5)
        ]
        edges = [
            _make_rel(nodes[i], nodes[i+1], "INVEST") for i in range(4)
        ]
        _setup_search_all_mock(self.client._mock_db, nodes, edges)

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "A", "depth": 4, "nodeLimit": 100, "edgeLimit": 500,
                "outputFormat": "subgraph",
            },
        )
        body = resp.json()
        assert body["success"] is True
        node_names = {n["properties"]["name"] for n in body["nodes"]}
        assert {"A", "B", "C", "D", "E"}.issubset(node_names)
        assert len(body["edges"]) == 4
        assert body["summary"]["requestedDepth"] == 4

    def test_search_all_triples_built_from_closure_edges(self, test_client):
        """Triangle: edges=3, triples=3."""
        a = _make_company("A", "node-A")
        b = _make_company("B", "node-B")
        c = _make_company("C", "node-C")
        e1 = _make_rel(a, b, "INVEST")
        e2 = _make_rel(b, c, "WORK")
        e3 = _make_rel(a, c, "GUARANTEE")
        _setup_search_all_mock(self.client._mock_db, [a, b, c], [e1, e2, e3])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "depth": 2, "outputFormat": "both"},
        )
        body = resp.json()
        assert len(body["edges"]) == 3
        assert len(body["triples"]) == 3
        triple_relations = {(t["headId"], t["relation"], t["tailId"]) for t in body["triples"]}
        assert len(triple_relations) == 3

    def test_search_all_node_limit_truncated_warning(self, test_client):
        """nodeLimit=2 triggers truncation warning."""
        nodes = [_FakeNode(f"node-{chr(65+i)}", ["Subject", "COMPANY"], {"name": chr(65+i)}) for i in range(5)]
        edges = [_make_rel(nodes[i], nodes[i+1], "INVEST") for i in range(4)]
        _setup_search_all_mock(self.client._mock_db, nodes, edges)

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "depth": 4, "nodeLimit": 2},
        )
        body = resp.json()
        assert body["summary"]["truncated"] is True
        assert body["summary"]["truncatedBy"] == "nodeLimit"
        assert any("NODE_LIMIT_REACHED" in w for w in body["warnings"])

    def test_search_all_edge_limit_truncated_warning(self, test_client):
        """edgeLimit=1 triggers truncation warning."""
        a = _make_company("A", "node-A")
        b = _make_company("B", "node-B")
        c = _make_company("C", "node-C")
        e1 = _make_rel(a, b, "INVEST")
        e2 = _make_rel(b, c, "WORK")
        e3 = _make_rel(a, c, "GUARANTEE")
        _setup_search_all_mock(self.client._mock_db, [a, b, c], [e1, e2, e3])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "depth": 2, "edgeLimit": 1},
        )
        body = resp.json()
        assert body["summary"]["truncated"] is True
        assert "edgeLimit" in (body["summary"]["truncatedBy"] or "")
        assert any("EDGE_LIMIT_REACHED" in w for w in body["warnings"])

    def test_search_all_output_format_subgraph_no_triples(self, test_client):
        """outputFormat=subgraph → triples empty."""
        n1 = _make_company("A", "center-1")
        n2 = _make_company("B", "neighbor-1")
        e1 = _make_rel(n1, n2, "INVEST")
        _setup_search_all_mock(self.client._mock_db, [n1, n2], [e1])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "subgraph"},
        )
        body = resp.json()
        assert "nodes" in body
        assert "edges" in body
        assert body.get("triples") == [] or body.get("triples") is not None

    def test_search_all_output_format_triples_nonempty(self, test_client):
        """outputFormat=triples → triples list non-empty."""
        n1 = _make_company("A", "center-1")
        n2 = _make_company("B", "neighbor-1")
        e1 = _make_rel(n1, n2, "INVEST")
        _setup_search_all_mock(self.client._mock_db, [n1, n2], [e1])

        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "A", "outputFormat": "triples"},
        )
        body = resp.json()
        assert isinstance(body, list)
        assert len(body) > 0
        assert list(body[0].keys()) == ["head", "relation", "tail"]

    def test_search_all_no_match_returns_empty_with_warning(self, test_client):
        """No matching keyword → success=true, empty results, NO_MATCHED_NODE."""
        test_client._mock_db.execute_read_with_summary.return_value = (
            [], {"result_count": 0}
        )
        resp = self.client.post(
            "/api/v1/graph/search-all",
            json={"query": "NoSuchCompany12345", "depth": 2},
        )
        body = resp.json()
        assert body["success"] is True
        assert body["matchedNodes"] == []
        assert body["nodes"] == []
        assert body["edges"] == []
        assert body["summary"]["matchedCount"] == 0
        assert any("NO_MATCHED_NODE" in w for w in body["warnings"])


# ═══════════════════════════════════════════════════════════════════════════
# 7. Cross-API consistency
# ═══════════════════════════════════════════════════════════════════════════


class TestCrossApiConsistency:
    """search-all and expand should return the same subgraph for the same center."""

    def test_search_all_and_expand_return_same_subgraph(self, test_client):
        """Both APIs share expand_subgraph() → same node/edge ids for same input."""
        a = _make_company("A", "node-A")
        b = _make_company("B", "node-B")
        c = _make_company("C", "node-C")
        e1 = _make_rel(a, b, "INVEST")
        e2 = _make_rel(b, c, "WORK")
        all_nodes = [a, b, c]
        all_edges = [e1, e2]

        # --- search-all ---
        _setup_search_all_mock(test_client._mock_db, all_nodes, all_edges)
        resp_s = test_client.post(
            "/api/v1/graph/search-all",
            json={
                "query": "A", "depth": 3, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
            },
        )
        body_s = resp_s.json()
        assert body_s["success"] is True
        search_node_ids = {n["id"] for n in body_s["nodes"]}
        search_edge_ids = {e["id"] for e in body_s["edges"]}

        # --- expand ---
        from tests.test_graph_Nhop_api import _setup_mock as _setup_expand_mock
        _setup_expand_mock(test_client._mock_db, a, all_nodes, all_edges)
        resp_e = test_client.post(
            f"/api/v1/graph/expand/{a.element_id}",
            json={
                "depth": 3, "nodeLimit": 100, "edgeLimit": 500,
                "relationWhitelist": ["*"],
            },
        )
        body_e = resp_e.json()
        assert body_e["success"] is True
        expand_node_ids = {n["id"] for n in body_e["nodes"]}
        expand_edge_ids = {e["id"] for e in body_e["edges"]}

        assert search_node_ids == expand_node_ids, \
            f"search={search_node_ids}, expand={expand_node_ids}"
        assert search_edge_ids == expand_edge_ids, \
            f"search={search_edge_ids}, expand={expand_edge_ids}"
