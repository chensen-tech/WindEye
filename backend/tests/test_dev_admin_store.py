from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient


def test_dev_admin_endpoints_work_without_mysql():
    from config.settings import settings
    from main import app

    previous_mode = settings.AUTH_MODE
    settings.AUTH_MODE = "off"
    client = TestClient(app)
    try:
        with patch("api.admin_routes.is_mysql_configured", return_value=False):
            users = client.get("/api/v1/admin/users?page=1&pageSize=20")
            roles = client.get("/api/v1/admin/roles")
            permissions = client.get("/api/v1/admin/permissions")
            dashboard = client.get("/api/v1/admin/dashboard")
            health = client.get("/api/v1/admin/health")
    finally:
        settings.AUTH_MODE = previous_mode

    assert users.status_code == 200
    assert users.json()["total"] >= 2
    assert roles.status_code == 200
    assert len(roles.json()["data"]) == 4
    assert permissions.status_code == 200
    assert permissions.json()["data"]
    assert dashboard.status_code == 200
    assert dashboard.json()["data"]["mode"] == "development"
    assert health.status_code == 200
    assert health.json()["data"]["services"]["mysql"]["status"] == "disabled"


def test_dev_admin_user_can_be_created_and_disabled():
    from config.settings import settings
    from main import app

    previous_mode = settings.AUTH_MODE
    settings.AUTH_MODE = "off"
    client = TestClient(app)
    try:
        with patch("api.admin_routes.is_mysql_configured", return_value=False):
            created = client.post(
                "/api/v1/admin/users",
                json={
                    "username": "test-dev-user",
                    "password": "TestPassword123!",
                    "realName": "测试用户",
                    "department": "测试部",
                    "roleIds": [4],
                },
            )
            assert created.status_code == 200
            user_id = created.json()["data"]["id"]

            disabled = client.patch(
                f"/api/v1/admin/users/{user_id}/status",
                json={"status": 0},
            )
    finally:
        settings.AUTH_MODE = previous_mode

    assert disabled.status_code == 200
    assert disabled.json()["data"]["status"] == 0
