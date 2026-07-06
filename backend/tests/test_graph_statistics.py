"""Tests for the unified four-layer graph statistics aggregation."""

from api import graph_routes


class _FakeStatsClient:
    def execute_read_with_summary(self, query, parameters=None, timeout_seconds=10.0):
        if "RETURN layer, count(*) AS node_count" in query:
            return (
                [
                    {"layer": "Subject", "node_count": 5},
                    {"layer": "Event", "node_count": 4},
                    {"layer": "Feature", "node_count": 3},
                    {"layer": "Regulation", "node_count": 2},
                    {"layer": None, "node_count": 1},
                ],
                {},
            )
        if "RETURN layer, node_type, type_count" in query:
            return (
                [
                    {"layer": "Subject", "node_type": "COMPANY", "type_count": 5},
                    {"layer": "Event", "node_type": "EVENT", "type_count": 4},
                    {"layer": "Feature", "node_type": "RiskFeature", "type_count": 3},
                    {
                        "layer": "Regulation",
                        "node_type": "PartyWithResponsibility",
                        "type_count": 2,
                    },
                ],
                {},
            )
        return (
            [
                {
                    "source_layer": "Subject",
                    "target_layer": "Subject",
                    "rel_type": "INVEST",
                    "rel_count": 6,
                },
                {
                    "source_layer": "Subject",
                    "target_layer": "Event",
                    "rel_type": "PARTICIPATE_IN",
                    "rel_count": 3,
                },
                {
                    "source_layer": "Regulation",
                    "target_layer": "Feature",
                    "rel_type": "REFLECTS",
                    "rel_count": 2,
                },
                {
                    "source_layer": None,
                    "target_layer": None,
                    "rel_type": "UNMAPPED",
                    "rel_count": 1,
                },
            ],
            {},
        )


def test_statistics_use_business_labels_and_global_totals(monkeypatch):
    graph_routes._statistics_cache["data"] = None
    graph_routes._statistics_cache["expires_at"] = 0.0
    monkeypatch.setattr(graph_routes, "_client", lambda: _FakeStatsClient())

    stats = graph_routes._collect_graph_statistics(force=True)

    assert stats["total_nodes"] == 15
    assert stats["classified_nodes"] == 14
    assert stats["unclassified_nodes"] == 1
    assert stats["total_relationships"] == 12
    assert stats["classified_relationships"] == 11
    assert stats["unclassified_relationships"] == 1

    layers = {item["layer_code"]: item for item in stats["layers"]}
    assert layers["Subject"]["node_count"] == 5
    assert layers["Subject"]["rel_count"] == 6
    assert layers["Regulation"]["node_type_counts"]["PartyWithResponsibility"] == 2
    assert stats["cross_layer_rels"]["Subject_to_Event"]["count"] == 3


def test_party_with_responsibility_belongs_to_regulation_layer():
    assert "PartyWithResponsibility" in graph_routes.LAYER_LABEL_MAP["Regulation"]
    assert "PartyWithResponsibility" not in graph_routes.LAYER_LABEL_MAP["Subject"]
