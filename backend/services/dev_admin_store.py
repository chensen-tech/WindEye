"""In-memory admin data used only when AUTH_MODE=off and MySQL is disabled."""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock

from db.seed import PERMISSIONS, ROLE_PERMISSION_MAP

_lock = Lock()

_roles = [
    {
        "id": 1,
        "roleCode": "admin",
        "roleName": "管理员",
        "description": "全部系统权限",
        "status": 1,
        "sortOrder": 1,
    },
    {
        "id": 2,
        "roleCode": "analyst",
        "roleName": "分析师",
        "description": "图谱查询、分析、上传与导出",
        "status": 1,
        "sortOrder": 2,
    },
    {
        "id": 3,
        "roleCode": "auditor",
        "roleName": "审核员",
        "description": "只读访问与审计日志查看",
        "status": 1,
        "sortOrder": 3,
    },
    {
        "id": 4,
        "roleCode": "readonly",
        "roleName": "只读用户",
        "description": "图谱与报告只读访问",
        "status": 1,
        "sortOrder": 4,
    },
]

_permissions = [
    {
        "id": index,
        "permCode": code,
        "permName": name,
        "permType": perm_type,
        "parentId": None,
        "resourcePath": path,
        "httpMethod": method,
        "status": 1,
    }
    for index, (code, name, perm_type, path, method, _sort) in enumerate(
        PERMISSIONS,
        start=1,
    )
]

_permission_id_by_code = {
    item["permCode"]: item["id"]
    for item in _permissions
}

_role_permission_ids = {
    role["id"]: [
        _permission_id_by_code[code]
        for code in ROLE_PERMISSION_MAP.get(role["roleCode"], [])
        if code in _permission_id_by_code
    ]
    for role in _roles
}

_users = [
    {
        "id": 1,
        "username": "dev-admin",
        "realName": "开发管理员",
        "email": "dev-admin@windeye.local",
        "phone": None,
        "department": "开发环境",
        "status": 1,
        "lastLoginAt": datetime.now(timezone.utc).isoformat(),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "roles": [
            {"id": 1, "roleCode": "admin", "roleName": "管理员"},
        ],
    },
    {
        "id": 2,
        "username": "analyst-demo",
        "realName": "分析师示例",
        "email": "analyst@windeye.local",
        "phone": None,
        "department": "风险分析部",
        "status": 1,
        "lastLoginAt": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "roles": [
            {"id": 2, "roleCode": "analyst", "roleName": "分析师"},
        ],
    },
]

_operation_logs: list[dict] = []
_api_logs: list[dict] = []


def _role_info(role_id: int) -> dict | None:
    role = next((item for item in _roles if item["id"] == role_id), None)
    if not role:
        return None
    return {
        "id": role["id"],
        "roleCode": role["roleCode"],
        "roleName": role["roleName"],
    }


def list_users(
    *,
    page: int,
    page_size: int,
    keyword: str | None,
    status: int | None,
) -> dict:
    with _lock:
        rows = deepcopy(_users)
    if keyword:
        needle = keyword.lower()
        rows = [
            row for row in rows
            if needle in row["username"].lower()
            or needle in (row.get("realName") or "").lower()
            or needle in (row.get("email") or "").lower()
        ]
    if status is not None:
        rows = [row for row in rows if row["status"] == status]
    total = len(rows)
    offset = (page - 1) * page_size
    return {
        "data": rows[offset:offset + page_size],
        "total": total,
        "page": page,
        "pageSize": page_size,
        "success": True,
        "mode": "development",
    }


def get_user(user_id: int) -> dict | None:
    with _lock:
        row = next((item for item in _users if item["id"] == user_id), None)
        return deepcopy(row) if row else None


def create_user(data: dict) -> dict:
    with _lock:
        if any(item["username"] == data["username"] for item in _users):
            raise ValueError(f"用户名 '{data['username']}' 已存在")
        user_id = max((item["id"] for item in _users), default=0) + 1
        roles = [
            role
            for role_id in data.get("roleIds", [])
            if (role := _role_info(role_id)) is not None
        ]
        row = {
            "id": user_id,
            "username": data["username"],
            "realName": data.get("realName"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "department": data.get("department"),
            "status": 1,
            "lastLoginAt": None,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "roles": roles,
        }
        _users.append(row)
        _add_operation_log("CREATE_USER", f"创建用户: {row['username']}", "user", str(user_id))
        return deepcopy(row)


def update_user(user_id: int, data: dict) -> dict | None:
    with _lock:
        row = next((item for item in _users if item["id"] == user_id), None)
        if not row:
            return None
        for source, target in (
            ("realName", "realName"),
            ("email", "email"),
            ("phone", "phone"),
            ("department", "department"),
        ):
            if source in data and data[source] is not None:
                row[target] = data[source]
        if data.get("roleIds") is not None:
            row["roles"] = [
                role
                for role_id in data["roleIds"]
                if (role := _role_info(role_id)) is not None
            ]
        _add_operation_log("UPDATE_USER", f"修改用户: {row['username']}", "user", str(user_id))
        return deepcopy(row)


def set_user_status(user_id: int, status: int) -> dict | None:
    with _lock:
        row = next((item for item in _users if item["id"] == user_id), None)
        if not row:
            return None
        row["status"] = status
        _add_operation_log("UPDATE_USER", f"修改用户状态: {row['username']}", "user", str(user_id))
        return deepcopy(row)


def delete_user(user_id: int) -> bool:
    with _lock:
        index = next((i for i, item in enumerate(_users) if item["id"] == user_id), None)
        if index is None:
            return False
        row = _users.pop(index)
        _add_operation_log("DELETE_USER", f"删除用户: {row['username']}", "user", str(user_id))
        return True


def list_roles() -> list[dict]:
    with _lock:
        rows = deepcopy(_roles)
        users = deepcopy(_users)
        role_permissions = deepcopy(_role_permission_ids)
    for role in rows:
        role["userCount"] = sum(
            any(item["id"] == role["id"] for item in user["roles"])
            for user in users
        )
        role["permissionCount"] = len(role_permissions.get(role["id"], []))
    return rows


def list_permissions() -> list[dict]:
    return deepcopy(_permissions)


def get_role_permissions(role_id: int) -> list[int] | None:
    if not any(role["id"] == role_id for role in _roles):
        return None
    return deepcopy(_role_permission_ids.get(role_id, []))


def set_role_permissions(role_id: int, permission_ids: list[int]) -> list[int] | None:
    if not any(role["id"] == role_id for role in _roles):
        return None
    valid_ids = {item["id"] for item in _permissions}
    selected = sorted(set(permission_ids) & valid_ids)
    _role_permission_ids[role_id] = selected
    _add_operation_log("PERMISSION_CHANGE", "修改角色权限", "role", str(role_id))
    return deepcopy(selected)


def list_operation_logs(page: int, page_size: int) -> dict:
    with _lock:
        rows = list(reversed(deepcopy(_operation_logs)))
    offset = (page - 1) * page_size
    return {
        "success": True,
        "data": rows[offset:offset + page_size],
        "total": len(rows),
        "page": page,
        "pageSize": page_size,
        "mode": "development",
    }


def list_api_logs(page: int, page_size: int) -> dict:
    with _lock:
        rows = list(reversed(deepcopy(_api_logs)))
    offset = (page - 1) * page_size
    return {
        "success": True,
        "data": rows[offset:offset + page_size],
        "total": len(rows),
        "page": page,
        "pageSize": page_size,
        "mode": "development",
    }


def dashboard() -> dict:
    return {
        "users": {"total": len(_users)},
        "roles": len(_roles),
        "permissions": len(_permissions),
        "api": {
            "total": len(_api_logs),
            "errors": sum(not item.get("success", True) for item in _api_logs),
            "averageLatencyMs": 0,
        },
        "mode": "development",
    }


def _add_operation_log(
    operation_type: str,
    operation_name: str,
    resource_type: str,
    resource_id: str,
) -> None:
    _operation_logs.append({
        "id": len(_operation_logs) + 1,
        "traceId": None,
        "userId": 1,
        "username": "dev-admin",
        "operationType": operation_type,
        "operationName": operation_name,
        "resourceType": resource_type,
        "resourceId": resource_id,
        "result": "SUCCESS",
        "beforeData": None,
        "afterData": None,
        "errorMessage": None,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
