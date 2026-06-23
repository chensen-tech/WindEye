"""RBAC permission lookup shared by auth and authorization dependencies."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import (
    SysPermission,
    SysRole,
    SysRolePermission,
    SysUserRole,
)


async def get_user_permissions(
    session: AsyncSession,
    user_id: int,
) -> set[str]:
    result = await session.execute(
        select(SysPermission.perm_code)
        .join(
            SysRolePermission,
            SysRolePermission.permission_id == SysPermission.id,
        )
        .join(SysRole, SysRole.id == SysRolePermission.role_id)
        .join(SysUserRole, SysUserRole.role_id == SysRole.id)
        .where(
            SysUserRole.user_id == user_id,
            SysRole.status == 1,
            SysPermission.status == 1,
        )
        .distinct()
    )
    return {row[0] for row in result.all()}


async def get_user_roles(
    session: AsyncSession,
    user_id: int,
) -> set[str]:
    result = await session.execute(
        select(SysRole.role_code)
        .join(SysUserRole, SysUserRole.role_id == SysRole.id)
        .where(SysUserRole.user_id == user_id, SysRole.status == 1)
        .distinct()
    )
    return {row[0] for row in result.all()}
