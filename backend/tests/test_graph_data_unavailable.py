from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient
from neo4j.exceptions import ServiceUnavailable


def test_graph_data_returns_503_when_neo4j_is_unavailable():
    from config.settings import settings
    from main import app

    previous_mode = settings.AUTH_MODE
    settings.AUTH_MODE = "off"
    try:
        with patch(
            "api.graph_routes._client",
            side_effect=ServiceUnavailable("database offline"),
        ):
            response = TestClient(app).get("/api/v1/graph/data?limit=10")
    finally:
        settings.AUTH_MODE = previous_mode

    assert response.status_code == 503
    payload = response.json()
    assert payload["detail"]["code"] == "GRAPH_503_UNAVAILABLE"
    assert payload["detail"]["traceId"].startswith("trc-")
