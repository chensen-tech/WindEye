"""Authentication API routes — replaces mock login/currentUser/logout."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from jose import ExpiredSignatureError, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.admin_schemas import (
    CurrentUserData,
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    RoleInfo,
)
from config.settings import settings
from db import get_db
from db.models import SysRole, SysUser, SysUserRole
from services.auth_service import (
    authenticate,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_token_expiry,
    _blacklist_token,
    _is_blacklisted,
)
from services.audit_service import write_operation_log
from services.permission_service import get_user_permissions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


# ── POST /login ──────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, request: Request):
    """Authenticate with username and password. Returns JWT tokens."""
    if settings.AUTH_MODE == "off":
        return LoginResponse(
            status="ok",
            type="account",
            currentAuthority="admin",
        )

    db = get_db()
    async with db._session_factory() as session:
        user = await authenticate(session, req.username, req.password)

        if user is None:
            # Write failed login audit
            await write_operation_log(
                session,
                operation_type="LOGIN_FAILED",
                username=req.username,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent", ""),
                result="FAILURE",
                error_message="Invalid credentials or account locked/disabled",
            )
            raise HTTPException(status_code=401, detail="用户名或密码错误，或账号已被锁定")

        # Successful login
        access_token = create_access_token(user.id, user.username)
        refresh_token = create_refresh_token(user.id, user.username)

        # Update last login IP
        user.last_login_ip = request.client.host if request.client else None
        await session.commit()

        # Write login audit
        await write_operation_log(
            session,
            operation_type="LOGIN",
            user_id=user.id,
            username=user.username,
            ip_address=user.last_login_ip,
            user_agent=request.headers.get("user-agent", ""),
            result="SUCCESS",
        )

        # Determine primary role
        roles_result = await session.execute(
            select(SysRole)
            .join(SysUserRole, SysUserRole.role_id == SysRole.id)
            .where(SysUserRole.user_id == user.id)
        )
        roles = roles_result.scalars().all()
        primary_role = roles[0].role_code if roles else "guest"

        return LoginResponse(
            status="ok",
            type="account",
            currentAuthority=primary_role,
            accessToken=access_token,
            refreshToken=refresh_token,
            expiresIn=settings.JWT_ACCESS_EXPIRE_MINUTES * 60,
        )


# ── POST /refresh ────────────────────────────────────────────────────

@router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(req: RefreshRequest):
    """Refresh an expired access token using a valid refresh token."""
    try:
        payload = decode_token(req.refreshToken)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token is not a refresh token")

    if _is_blacklisted(req.refreshToken):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    user_id = int(payload["sub"])
    username = payload["username"]

    # Verify user still exists and is active
    db = get_db()
    async with db._session_factory() as session:
        result = await session.execute(
            select(SysUser).where(SysUser.id == user_id, SysUser.deleted == 0, SysUser.status == 1)
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=401, detail="User not found or disabled")

    new_access_token = create_access_token(user_id, username)
    return RefreshResponse(
        accessToken=new_access_token,
        expiresIn=settings.JWT_ACCESS_EXPIRE_MINUTES * 60,
    )


# ── POST /logout ─────────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request):
    """Logout — blacklist the current access token."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()

    if token:
        from services.auth_service import get_token_expiry
        ttl = get_token_expiry(token) or 300
        _blacklist_token(token, ttl)

    return {"success": True, "message": "Logged out"}


# ── GET /me ──────────────────────────────────────────────────────────

@router.get("/me", response_model=CurrentUserResponse)
async def current_user(request: Request):
    """Get current user info (replaces mock /api/currentUser)."""
    if settings.AUTH_MODE == "off":
        return CurrentUserResponse(
            data=CurrentUserData(
                name="开发管理员",
                userid="dev-admin",
                access="admin",
                roles=[],
                permissions=[
                    "graph:search:view",
                    "graph:expand:view",
                    "governance:report:create",
                ],
            )
        )

    db = get_db()

    # Extract user_id from request state (set by auth_middleware)
    user_id = getattr(request.state, "user_id", None)

    if user_id is None:
        # Auth middleware is disabled (AUTH_ENABLED=false) or skipped
        # Fall back to token in header
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.removeprefix("Bearer ").strip()
        if token:
            try:
                payload = decode_token(token)
                user_id = int(payload["sub"])
            except (JWTError, KeyError, ValueError):
                raise HTTPException(status_code=401, detail="Invalid token")

    if user_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    async with db._session_factory() as session:
        result = await session.execute(
            select(SysUser).where(SysUser.id == user_id, SysUser.deleted == 0)
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        # Get roles
        roles_result = await session.execute(
            select(SysRole)
            .join(SysUserRole, SysUserRole.role_id == SysRole.id)
            .where(SysUserRole.user_id == user.id)
        )
        roles = roles_result.scalars().all()

        # Get permissions
        permissions = sorted(await get_user_permissions(session, user.id))

        primary_role = roles[0].role_code if roles else "guest"

        return CurrentUserResponse(
            data=CurrentUserData(
                name=user.real_name or user.username,
                userid=str(user.id),
                email=user.email,
                phone=user.phone,
                avatar=user.avatar,
                department=user.department,
                access=primary_role,
                roles=[RoleInfo(id=r.id, roleCode=r.role_code, roleName=r.role_name) for r in roles],
                permissions=permissions,
            )
        )


# ── GET /permissions ──────────────────────────────────────────────────

@router.get("/permissions")
async def user_permissions(request: Request):
    """Get current user's permission code list."""
    if settings.AUTH_MODE == "off":
        return {
            "success": True,
            "data": {
                "permissions": [
                    "graph:search:view",
                    "graph:expand:view",
                    "governance:report:create",
                ]
            },
        }

    user_id = getattr(request.state, "user_id", None)
    if user_id is None:
        return {"success": True, "data": {"permissions": []}}

    db = get_db()
    async with db._session_factory() as session:
        perms = sorted(await get_user_permissions(session, user_id))
        return {"success": True, "data": {"permissions": perms}}
