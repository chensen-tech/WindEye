"""Authentication principal and declarative RBAC permission checks."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from fastapi import HTTPException, Request

from config.settings import settings
from db import get_db, is_mysql_configured
from services.permission_service import get_user_permissions, get_user_roles

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class Principal:
    user_id: int | None
    username: str = ""
    roles: set[str] = field(default_factory=set)
    permissions: set[str] = field(default_factory=set)


async def get_current_principal(request: Request) -> Principal:
    user_id = getattr(request.state, "user_id", None)
    username = getattr(request.state, "username", "")

    if user_id is None:
        if settings.AUTH_MODE == "enforce":
            raise HTTPException(status_code=401, detail="Not authenticated")
        return Principal(user_id=None, username=username)

    if not is_mysql_configured():
        if settings.AUTH_MODE == "enforce":
            raise HTTPException(
                status_code=503,
                detail="Authentication database is not configured",
            )
        return Principal(user_id=user_id, username=username)

    db = get_db()
    async with db._session_factory() as session:
        permissions = await get_user_permissions(session, user_id)
        roles = await get_user_roles(session, user_id)

    return Principal(
        user_id=user_id,
        username=username,
        roles=roles,
        permissions=permissions,
    )


def require_permissions(*required: str, mode: str = "all"):
    required_set = set(required)

    async def dependency(request: Request) -> Principal:
        principal = await get_current_principal(request)
        if settings.AUTH_MODE == "off" or not required_set:
            return principal

        matched = required_set & principal.permissions
        allowed = (
            matched == required_set
            if mode == "all"
            else bool(matched)
        )
        if allowed:
            return principal

        request.state.permission_observation = {
            "required": sorted(required_set),
            "granted": sorted(principal.permissions),
        }
        if settings.AUTH_MODE == "observe":
            logger.warning(
                "Permission observation: user=%s required=%s",
                principal.user_id,
                sorted(required_set),
            )
            return principal

        raise HTTPException(
            status_code=403,
            detail={
                "code": "AUTH_403_PERMISSION_DENIED",
                "message": "无权限执行此操作",
                "traceId": getattr(request.state, "trace_id", ""),
            },
        )

    return dependency
