"""Admin management API — user CRUD, role management, audit logs."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import delete, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies.permissions import require_permissions
from api.admin_schemas import (
    PasswordReset,
    UserCreate,
    UserListResponse,
    UserResponse,
    UserStatusPatch,
    UserUpdate,
)
from config.settings import settings
from db import get_db, is_mysql_configured
from db.models import (
    SysApiLog,
    SysOperationLog,
    SysPermission,
    SysRole,
    SysRolePermission,
    SysUser,
    SysUserRole,
)
from services.audit_service import write_operation_log
from services.user_service import (
    create_user,
    get_user,
    list_users,
    patch_user_status,
    reset_password,
    soft_delete_user,
    update_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def _use_dev_store() -> bool:
    return settings.AUTH_MODE == "off" and not is_mysql_configured()


def _dev_store():
    from services import dev_admin_store
    return dev_admin_store


# ── Helper ────────────────────────────────────────────────────────────

def _get_user_id(request: Request) -> int | None:
    """Extract authenticated user_id from request state."""
    return getattr(request.state, "user_id", None)


async def _log_admin_action(
    session: AsyncSession,
    request: Request,
    operation_type: str,
    operation_name: str,
    resource_type: str,
    resource_id: str | None = None,
    before_data: dict | None = None,
    after_data: dict | None = None,
    result: str = "SUCCESS",
    error_message: str | None = None,
):
    """Helper to write admin audit logs."""
    operator_id = _get_user_id(request)
    await write_operation_log(
        session,
        operation_type=operation_type,
        user_id=operator_id,
        username=None,  # will be filled from user_id
        operation_name=operation_name,
        resource_type=resource_type,
        resource_id=resource_id,
        request_method=request.method,
        request_path=request.url.path,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", ""),
        before_data=before_data,
        after_data=after_data,
        result=result,
        error_message=error_message,
    )


# ── GET /users ───────────────────────────────────────────────────────

@router.get(
    "/users",
    dependencies=[Depends(require_permissions("admin:user:view"))],
)
async def list_users_handler(
    request: Request,
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    keyword: str | None = Query(default=None),
    status: int | None = Query(default=None, ge=0, le=2),
):
    """Paginated user list."""
    if _use_dev_store():
        return _dev_store().list_users(
            page=page,
            page_size=pageSize,
            keyword=keyword,
            status=status,
        )
    db = get_db()
    async with db._session_factory() as session:
        users, total = await list_users(
            session, page=page, page_size=pageSize,
            keyword=keyword, status=status,
        )
        return {
            "data": users,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "success": True,
        }


# ── POST /users ──────────────────────────────────────────────────────

@router.post(
    "/users",
    dependencies=[Depends(require_permissions("admin:user:create"))],
)
async def create_user_handler(req: UserCreate, request: Request):
    """Create a new user."""
    if _use_dev_store():
        try:
            user = _dev_store().create_user(req.model_dump(by_alias=True))
            return {"success": True, "data": user, "mode": "development"}
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    db = get_db()
    operator_id = _get_user_id(request)
    async with db._session_factory() as session:
        try:
            user = await create_user(
                session,
                username=req.username,
                password=req.password,
                real_name=req.realName,
                email=req.email,
                phone=req.phone,
                department=req.department,
                role_ids=req.roleIds,
                operator_id=operator_id,
                commit=False,
            )
            await _log_admin_action(
                session, request,
                operation_type="CREATE_USER",
                operation_name=f"创建用户: {req.username}",
                resource_type="user",
                resource_id=str(user.id),
                after_data={"username": req.username, "realName": req.realName},
            )
            user_data = await get_user(session, user.id)
            return {"success": True, "data": user_data}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))


# ── GET /users/{user_id} ─────────────────────────────────────────────

@router.get(
    "/users/{user_id}",
    dependencies=[Depends(require_permissions("admin:user:view"))],
)
async def get_user_handler(user_id: int, request: Request):
    """Get a single user by ID."""
    if _use_dev_store():
        user = _dev_store().get_user(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="用户不存在")
        return {"success": True, "data": user, "mode": "development"}
    db = get_db()
    async with db._session_factory() as session:
        user = await get_user(session, user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="用户不存在")
        return {"success": True, "data": user}


# ── PUT /users/{user_id} ─────────────────────────────────────────────

@router.put(
    "/users/{user_id}",
    dependencies=[Depends(require_permissions("admin:user:update"))],
)
async def update_user_handler(user_id: int, req: UserUpdate, request: Request):
    """Update user fields and roles."""
    if _use_dev_store():
        user = _dev_store().update_user(
            user_id,
            req.model_dump(by_alias=True, exclude_unset=True),
        )
        if user is None:
            raise HTTPException(status_code=404, detail="用户不存在")
        return {"success": True, "data": user, "mode": "development"}
    db = get_db()
    operator_id = _get_user_id(request)
    async with db._session_factory() as session:
        # Snapshot before
        before = await get_user(session, user_id)
        if before is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        updated = await update_user(
            session,
            user_id,
            real_name=req.realName,
            email=req.email,
            phone=req.phone,
            department=req.department,
            role_ids=req.roleIds,
            operator_id=operator_id,
            commit=False,
        )
        if updated is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        after = await get_user(session, user_id)

        await _log_admin_action(
            session, request,
            operation_type="UPDATE_USER",
            operation_name=f"修改用户: {before.get('username', '')}",
            resource_type="user",
            resource_id=str(user_id),
            before_data={"roles": [r["roleCode"] for r in before.get("roles", [])]},
            after_data={"roles": [r["roleCode"] for r in after.get("roles", [])]},
        )

        return {"success": True, "data": after}


# ── PATCH /users/{user_id}/status ───────────────────────────────────

@router.patch(
    "/users/{user_id}/status",
    dependencies=[Depends(require_permissions("admin:user:disable"))],
)
async def patch_user_status_handler(user_id: int, req: UserStatusPatch, request: Request):
    """Enable, disable, or unlock a user."""
    if _use_dev_store():
        if user_id == 1 and req.status != 1:
            raise HTTPException(status_code=400, detail="不能禁用开发管理员")
        user = _dev_store().set_user_status(user_id, req.status)
        if user is None:
            raise HTTPException(status_code=404, detail="用户不存在")
        return {"success": True, "data": user, "mode": "development"}
    db = get_db()
    operator_id = _get_user_id(request)
    if operator_id == user_id and req.status != 1:
        raise HTTPException(status_code=400, detail="不能禁用或锁定当前登录账号")
    async with db._session_factory() as session:
        before = await get_user(session, user_id)
        if before is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        status_labels = {1: "启用", 0: "禁用", 2: "锁定"}
        result_user = await patch_user_status(
            session,
            user_id,
            req.status,
            operator_id,
            commit=False,
        )

        await _log_admin_action(
            session, request,
            operation_type="DISABLE_USER" if req.status == 0 else "UPDATE_USER",
            operation_name=f"{status_labels.get(req.status, '修改')}用户: {before.get('username', '')}",
            resource_type="user",
            resource_id=str(user_id),
            before_data={"status": before["status"]},
            after_data={"status": req.status},
        )

        user_data = await get_user(session, user_id)
        return {"success": True, "data": user_data}


# ── POST /users/{user_id}/reset-password ─────────────────────────────

@router.post(
    "/users/{user_id}/reset-password",
    dependencies=[Depends(require_permissions("admin:user:update"))],
)
async def reset_password_handler(user_id: int, req: PasswordReset, request: Request):
    """Admin reset a user's password."""
    if _use_dev_store():
        if _dev_store().get_user(user_id) is None:
            raise HTTPException(status_code=404, detail="用户不存在")
        return {
            "success": True,
            "message": "开发模式已模拟重置密码",
            "mode": "development",
        }
    db = get_db()
    operator_id = _get_user_id(request)
    async with db._session_factory() as session:
        before = await get_user(session, user_id)
        if before is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        result = await reset_password(
            session,
            user_id,
            req.newPassword,
            operator_id,
            commit=False,
        )
        if result is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        await _log_admin_action(
            session, request,
            operation_type="UPDATE_USER",
            operation_name=f"重置密码: {before.get('username', '')}",
            resource_type="user",
            resource_id=str(user_id),
        )

        return {"success": True, "message": "密码已重置"}


# ── DELETE /users/{user_id} ──────────────────────────────────────────

@router.delete(
    "/users/{user_id}",
    dependencies=[Depends(require_permissions("admin:user:delete"))],
)
async def delete_user_handler(user_id: int, request: Request):
    """Soft-delete a user."""
    if _use_dev_store():
        if user_id == 1:
            raise HTTPException(status_code=400, detail="不能删除开发管理员")
        if not _dev_store().delete_user(user_id):
            raise HTTPException(status_code=404, detail="用户不存在")
        return {
            "success": True,
            "message": "用户已删除",
            "mode": "development",
        }
    db = get_db()
    operator_id = _get_user_id(request)
    if operator_id == user_id:
        raise HTTPException(status_code=400, detail="不能删除当前登录账号")
    async with db._session_factory() as session:
        before = await get_user(session, user_id)
        if before is None:
            raise HTTPException(status_code=404, detail="用户不存在")

        success = await soft_delete_user(
            session,
            user_id,
            operator_id,
            commit=False,
        )

        await _log_admin_action(
            session, request,
            operation_type="DELETE_USER",
            operation_name=f"删除用户: {before.get('username', '')}",
            resource_type="user",
            resource_id=str(user_id),
            before_data={"username": before["username"]},
        )

        return {"success": True, "message": "用户已删除"}


# ── Roles and permissions ────────────────────────────────────────────

@router.get(
    "/roles",
    dependencies=[Depends(require_permissions("admin:role:view"))],
)
async def list_roles_handler():
    if _use_dev_store():
        return {
            "success": True,
            "data": _dev_store().list_roles(),
            "mode": "development",
        }
    db = get_db()
    async with db._session_factory() as session:
        result = await session.execute(
            select(SysRole).order_by(SysRole.sort_order, SysRole.id)
        )
        roles = result.scalars().all()
        data = []
        for role in roles:
            user_count = await session.scalar(
                select(func.count())
                .select_from(SysUserRole)
                .where(SysUserRole.role_id == role.id)
            )
            permission_count = await session.scalar(
                select(func.count())
                .select_from(SysRolePermission)
                .where(SysRolePermission.role_id == role.id)
            )
            data.append({
                "id": role.id,
                "roleCode": role.role_code,
                "roleName": role.role_name,
                "description": role.description,
                "status": role.status,
                "sortOrder": role.sort_order,
                "userCount": user_count or 0,
                "permissionCount": permission_count or 0,
            })
        return {"success": True, "data": data}


@router.put(
    "/roles/{role_id}/permissions",
    dependencies=[Depends(require_permissions("admin:role:assign"))],
)
async def set_role_permissions_handler(
    role_id: int,
    request: Request,
):
    body = await request.json()
    permission_ids = {
        int(value)
        for value in body.get("permissionIds", [])
        if str(value).isdigit()
    }
    if _use_dev_store():
        selected = _dev_store().set_role_permissions(
            role_id,
            sorted(permission_ids),
        )
        if selected is None:
            raise HTTPException(status_code=404, detail="角色不存在")
        return {
            "success": True,
            "data": {"permissionIds": selected},
            "mode": "development",
        }
    db = get_db()
    async with db._session_factory() as session:
        role = await session.get(SysRole, role_id)
        if role is None:
            raise HTTPException(status_code=404, detail="角色不存在")

        existing_result = await session.execute(
            select(SysRolePermission.permission_id)
            .where(SysRolePermission.role_id == role_id)
        )
        before_ids = sorted(row[0] for row in existing_result.all())

        valid_ids = set()
        if permission_ids:
            valid_result = await session.execute(
                select(SysPermission.id).where(
                    SysPermission.id.in_(permission_ids),
                    SysPermission.status == 1,
                )
            )
            valid_ids = {row[0] for row in valid_result.all()}
        if valid_ids != permission_ids:
            raise HTTPException(status_code=400, detail="包含无效或已禁用的权限")

        await session.execute(
            delete(SysRolePermission).where(SysRolePermission.role_id == role_id)
        )
        session.add_all([
            SysRolePermission(role_id=role_id, permission_id=permission_id)
            for permission_id in sorted(valid_ids)
        ])
        await write_operation_log(
            session,
            operation_type="PERMISSION_CHANGE",
            user_id=_get_user_id(request),
            username=getattr(request.state, "username", None),
            operation_name=f"修改角色权限: {role.role_name}",
            resource_type="role",
            resource_id=str(role_id),
            request_method=request.method,
            request_path=request.url.path,
            before_data={"permissionIds": before_ids},
            after_data={"permissionIds": sorted(valid_ids)},
            trace_id=getattr(request.state, "trace_id", None),
        )
        return {"success": True, "data": {"permissionIds": sorted(valid_ids)}}


@router.get(
    "/roles/{role_id}/permissions",
    dependencies=[Depends(require_permissions("admin:role:view"))],
)
async def get_role_permissions_handler(role_id: int):
    if _use_dev_store():
        permission_ids = _dev_store().get_role_permissions(role_id)
        if permission_ids is None:
            raise HTTPException(status_code=404, detail="角色不存在")
        return {
            "success": True,
            "data": {"permissionIds": permission_ids},
            "mode": "development",
        }
    db = get_db()
    async with db._session_factory() as session:
        role = await session.get(SysRole, role_id)
        if role is None:
            raise HTTPException(status_code=404, detail="角色不存在")
        result = await session.execute(
            select(SysRolePermission.permission_id)
            .where(SysRolePermission.role_id == role_id)
        )
        return {
            "success": True,
            "data": {"permissionIds": sorted(row[0] for row in result.all())},
        }


@router.get(
    "/permissions",
    dependencies=[Depends(require_permissions("admin:role:view"))],
)
async def list_permissions_handler():
    if _use_dev_store():
        return {
            "success": True,
            "data": _dev_store().list_permissions(),
            "mode": "development",
        }
    db = get_db()
    async with db._session_factory() as session:
        result = await session.execute(
            select(SysPermission).order_by(
                SysPermission.sort_order,
                SysPermission.id,
            )
        )
        permissions = result.scalars().all()
        return {
            "success": True,
            "data": [{
                "id": item.id,
                "permCode": item.perm_code,
                "permName": item.perm_name,
                "permType": item.perm_type,
                "parentId": item.parent_id,
                "resourcePath": item.resource_path,
                "httpMethod": item.http_method,
                "status": item.status,
            } for item in permissions],
        }


# ── Audit log queries ────────────────────────────────────────────────

@router.get(
    "/audit-logs",
    dependencies=[Depends(require_permissions("audit:operation-log:view"))],
)
async def list_audit_logs_handler(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    operationType: str | None = None,
    result: str | None = None,
    traceId: str | None = None,
):
    if _use_dev_store():
        return _dev_store().list_operation_logs(page, pageSize)
    db = get_db()
    async with db._session_factory() as session:
        query = select(SysOperationLog)
        if operationType:
            query = query.where(SysOperationLog.operation_type == operationType)
        if result:
            query = query.where(SysOperationLog.result == result)
        if traceId:
            query = query.where(SysOperationLog.trace_id == traceId)
        total = await session.scalar(
            select(func.count()).select_from(query.subquery())
        )
        rows = (
            await session.execute(
                query.order_by(SysOperationLog.created_at.desc())
                .offset((page - 1) * pageSize)
                .limit(pageSize)
            )
        ).scalars().all()
        return {
            "success": True,
            "data": [{
                "id": row.id,
                "traceId": row.trace_id,
                "userId": row.user_id,
                "username": row.username,
                "operationType": row.operation_type,
                "operationName": row.operation_name,
                "resourceType": row.resource_type,
                "resourceId": row.resource_id,
                "result": row.result,
                "beforeData": row.before_data,
                "afterData": row.after_data,
                "errorMessage": row.error_message,
                "createdAt": row.created_at.isoformat() if row.created_at else None,
            } for row in rows],
            "total": total or 0,
            "page": page,
            "pageSize": pageSize,
        }


# ── System overview ──────────────────────────────────────────────────

@router.get(
    "/health",
    dependencies=[Depends(require_permissions("system:monitor:view"))],
)
async def admin_health_handler():
    services = {
        "mysql": {"status": "down", "latencyMs": None},
        "neo4j": {"status": "down", "latencyMs": None},
        "redis": {"status": "disabled", "latencyMs": None},
    }

    if is_mysql_configured():
        try:
            import time
            db = get_db()
            started = time.perf_counter()
            async with db._session_factory() as session:
                await session.execute(text("SELECT 1"))
            services["mysql"] = {
                "status": "up",
                "latencyMs": int((time.perf_counter() - started) * 1000),
            }
        except Exception:
            pass
    else:
        services["mysql"] = {"status": "disabled", "latencyMs": None}

    try:
        import time
        from api.graph_routes import _client
        started = time.perf_counter()
        _client().verify_connectivity()
        services["neo4j"] = {
            "status": "up",
            "latencyMs": int((time.perf_counter() - started) * 1000),
        }
    except Exception:
        pass

    try:
        from services.auth_service import _get_redis
        redis_client = _get_redis()
        if redis_client:
            services["redis"] = {"status": "up", "latencyMs": 0}
    except Exception:
        pass

    return {"success": True, "data": {"services": services}}


@router.get(
    "/dashboard",
    dependencies=[Depends(require_permissions("system:monitor:view"))],
)
async def admin_dashboard_handler():
    if _use_dev_store():
        return {
            "success": True,
            "data": _dev_store().dashboard(),
            "mode": "development",
        }
    db = get_db()
    async with db._session_factory() as session:
        user_total = await session.scalar(
            select(func.count()).select_from(SysUser).where(SysUser.deleted == 0)
        )
        role_total = await session.scalar(
            select(func.count()).select_from(SysRole)
        )
        permission_total = await session.scalar(
            select(func.count()).select_from(SysPermission)
        )
        api_today = await session.scalar(
            select(func.count()).select_from(SysApiLog)
        )
        api_errors = await session.scalar(
            select(func.count()).select_from(SysApiLog).where(SysApiLog.success == 0)
        )
        avg_latency = await session.scalar(select(func.avg(SysApiLog.latency_ms)))
        return {
            "success": True,
            "data": {
                "users": {"total": user_total or 0},
                "roles": role_total or 0,
                "permissions": permission_total or 0,
                "api": {
                    "total": api_today or 0,
                    "errors": api_errors or 0,
                    "averageLatencyMs": round(float(avg_latency or 0), 1),
                },
            },
        }


@router.get(
    "/api-logs",
    dependencies=[Depends(require_permissions("audit:api-log:view"))],
)
async def list_api_logs_handler(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    method: str | None = None,
    path: str | None = None,
    statusCode: int | None = None,
    minLatencyMs: int | None = Query(None, ge=0),
):
    if _use_dev_store():
        return _dev_store().list_api_logs(page, pageSize)
    db = get_db()
    async with db._session_factory() as session:
        query = select(SysApiLog)
        if method:
            query = query.where(SysApiLog.method == method.upper())
        if path:
            query = query.where(SysApiLog.path.contains(path))
        if statusCode is not None:
            query = query.where(SysApiLog.status_code == statusCode)
        if minLatencyMs is not None:
            query = query.where(SysApiLog.latency_ms >= minLatencyMs)
        total = await session.scalar(
            select(func.count()).select_from(query.subquery())
        )
        rows = (
            await session.execute(
                query.order_by(SysApiLog.created_at.desc())
                .offset((page - 1) * pageSize)
                .limit(pageSize)
            )
        ).scalars().all()
        return {
            "success": True,
            "data": [{
                "id": row.id,
                "traceId": row.trace_id,
                "userId": row.user_id,
                "username": row.username,
                "method": row.method,
                "path": row.path,
                "statusCode": row.status_code,
                "success": bool(row.success),
                "latencyMs": row.latency_ms,
                "errorCode": row.error_code,
                "errorMessage": row.error_message,
                "createdAt": row.created_at.isoformat() if row.created_at else None,
            } for row in rows],
            "total": total or 0,
            "page": page,
            "pageSize": pageSize,
        }
