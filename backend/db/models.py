"""SQLAlchemy ORM models for user, role, permission, and audit log tables.

All 8 tables defined as declarative Base models.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    BigInteger, Column, DateTime, ForeignKey, Index, Integer,
    JSON, SmallInteger, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# ── sys_user ─────────────────────────────────────────────────────────

class SysUser(Base):
    __tablename__ = "sys_user"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(64), nullable=False, unique=True, comment="用户名")
    password_hash = Column(String(256), nullable=False, comment="bcrypt 哈希")
    real_name = Column(String(64), nullable=True, comment="真实姓名")
    email = Column(String(128), nullable=True)
    phone = Column(String(32), nullable=True)
    avatar = Column(String(512), nullable=True)
    department = Column(String(128), nullable=True, comment="部门")
    status = Column(SmallInteger, nullable=False, default=1, comment="1=active 0=disabled 2=locked")
    failed_login_count = Column(SmallInteger, nullable=False, default=0, comment="连续登录失败次数")
    locked_until = Column(DateTime, nullable=True, comment="锁定到期时间")
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(64), nullable=True)
    password_updated_at = Column(DateTime, nullable=True, comment="最近修改密码时间")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True, comment="创建者 user_id")
    updated_by = Column(BigInteger, nullable=True, comment="修改者 user_id")
    deleted = Column(SmallInteger, nullable=False, default=0, comment="0=正常 1=已删除")


# ── sys_role ─────────────────────────────────────────────────────────

class SysRole(Base):
    __tablename__ = "sys_role"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_code = Column(String(64), nullable=False, unique=True, comment="admin/analyst/auditor/readonly")
    role_name = Column(String(128), nullable=False, comment="管理员/分析师/审核员/只读用户")
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    status = Column(SmallInteger, nullable=False, default=1, comment="1=active 0=disabled")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── sys_permission ────────────────────────────────────────────────────

class SysPermission(Base):
    __tablename__ = "sys_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    perm_code = Column(String(128), nullable=False, unique=True, comment="module:resource:action")
    perm_name = Column(String(256), nullable=False, comment="权限中文名称")
    perm_type = Column(String(16), nullable=False, comment="page/button/api/data")
    parent_id = Column(BigInteger, nullable=True, comment="父权限ID，用于树形结构")
    resource_path = Column(String(512), nullable=True, comment="API路径或前端路由")
    http_method = Column(String(32), nullable=True, comment="GET/POST/PUT/PATCH/DELETE/*")
    sort_order = Column(Integer, nullable=False, default=0)
    status = Column(SmallInteger, nullable=False, default=1, comment="1=active 0=disabled")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── sys_role_permission ───────────────────────────────────────────────

class SysRolePermission(Base):
    __tablename__ = "sys_role_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_id = Column(BigInteger, ForeignKey("sys_role.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(BigInteger, ForeignKey("sys_permission.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="idx_role_perm"),
        Index("idx_rp_role_id", "role_id"),
        Index("idx_rp_perm_id", "permission_id"),
    )


# ── sys_user_role ─────────────────────────────────────────────────────

class SysUserRole(Base):
    __tablename__ = "sys_user_role"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("sys_user.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(BigInteger, ForeignKey("sys_role.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="idx_user_role"),
        Index("idx_ur_user_id", "user_id"),
        Index("idx_ur_role_id", "role_id"),
    )


# ── sys_operation_log ─────────────────────────────────────────────────

class SysOperationLog(Base):
    __tablename__ = "sys_operation_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    trace_id = Column(String(64), nullable=True, comment="关联 API 调用日志")
    user_id = Column(BigInteger, nullable=True, comment="操作人 user_id")
    username = Column(String(64), nullable=True, comment="冗余字段，保留历史用户名")
    operation_type = Column(String(64), nullable=False, comment="LOGIN/LOGOUT/CREATE_USER/...")
    operation_name = Column(String(128), nullable=True, comment="操作中文描述")
    resource_type = Column(String(64), nullable=True, comment="user/role/permission/report/config/data")
    resource_id = Column(String(128), nullable=True, comment="操作对象标识")
    request_method = Column(String(16), nullable=True)
    request_path = Column(String(512), nullable=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    before_data = Column(JSON, nullable=True, comment="变更前快照（脱敏后）")
    after_data = Column(JSON, nullable=True, comment="变更后快照（脱敏后）")
    result = Column(String(16), nullable=False, default="SUCCESS", comment="SUCCESS/FAILURE")
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True, comment="操作耗时")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_ol_user_id", "user_id"),
        Index("idx_ol_operation_type", "operation_type"),
        Index("idx_ol_created_at", "created_at"),
        Index("idx_ol_trace_id", "trace_id"),
        Index("idx_ol_result", "result"),
    )


# ── sys_api_log ───────────────────────────────────────────────────────

class SysApiLog(Base):
    __tablename__ = "sys_api_log"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    trace_id = Column(String(64), nullable=True)
    user_id = Column(BigInteger, nullable=True)
    username = Column(String(64), nullable=True)
    method = Column(String(16), nullable=False, comment="GET/POST/PUT/PATCH/DELETE")
    path = Column(String(512), nullable=False, comment="请求路径")
    query_string = Column(String(1024), nullable=True)
    status_code = Column(Integer, nullable=False)
    success = Column(SmallInteger, nullable=False, default=1, comment="0=错误 1=成功")
    latency_ms = Column(Integer, nullable=False, comment="请求耗时（毫秒）")
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    request_summary = Column(JSON, nullable=True, comment="请求摘要（脱敏后）")
    response_summary = Column(JSON, nullable=True, comment="响应摘要")
    error_code = Column(String(64), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_al_trace_id", "trace_id"),
        Index("idx_al_user_id", "user_id"),
        Index("idx_al_path", "path"),
        Index("idx_al_status_code", "status_code"),
        Index("idx_al_created_at", "created_at"),
        Index("idx_al_latency_ms", "latency_ms"),
        Index("idx_al_success", "success"),
    )


# ── sys_config ────────────────────────────────────────────────────────

class SysConfig(Base):
    __tablename__ = "sys_config"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    config_key = Column(String(128), nullable=False, unique=True, comment="配置键")
    config_value = Column(Text, nullable=False, comment="配置值")
    description = Column(String(512), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
