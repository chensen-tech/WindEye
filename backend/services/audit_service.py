"""Audit service — operation log writing and sensitive data masking."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from db.models import SysApiLog, SysOperationLog

logger = logging.getLogger(__name__)

# ── Sensitive field masking ──────────────────────────────────────────

_SENSITIVE_KEYS: set[str] = {
    "password", "token", "accesstoken", "refreshtoken",
    "authorization", "phone", "email", "idcard", "id_card",
    "newpassword", "oldpassword", "confirmpassword", "secret", "apikey",
}


def mask_sensitive_data(data: dict | list | None) -> dict | list | None:
    """Recursively mask sensitive fields in a dict/list."""
    if data is None:
        return None
    if isinstance(data, list):
        return [mask_sensitive_data(item) for item in data]
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            key_lower = key.lower().replace("_", "").replace("-", "")
            if key_lower in _SENSITIVE_KEYS:
                result[key] = "***MASKED***"
            elif isinstance(value, (dict, list)):
                result[key] = mask_sensitive_data(value)
            else:
                result[key] = value
        return result
    return data


def summarize_response(data: Any, max_size: int = 500) -> dict:
    """Create a summary of response data without storing the full body."""
    if data is None:
        return {"type": "null"}
    if isinstance(data, dict):
        keys = list(data.keys())
        summary = {"type": "dict", "keys": keys[:20]}
        # Record counts for known large fields
        for key in ["nodes", "edges", "data", "results"]:
            if key in data and isinstance(data[key], list):
                summary[f"{key}_count"] = len(data[key])
        return summary
    if isinstance(data, list):
        return {"type": "list", "length": len(data)}
    if isinstance(data, str):
        return {"type": "string", "length": len(data)}
    return {"type": type(data).__name__}


# ── Operation log writer ─────────────────────────────────────────────

async def write_operation_log(
    session: AsyncSession,
    *,
    operation_type: str,
    user_id: int | None = None,
    username: str | None = None,
    operation_name: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    request_method: str | None = None,
    request_path: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    before_data: dict | None = None,
    after_data: dict | None = None,
    result: str = "SUCCESS",
    error_message: str | None = None,
    duration_ms: int | None = None,
    trace_id: str | None = None,
) -> SysOperationLog:
    """Write an operation audit log entry."""
    log_entry = SysOperationLog(
        trace_id=trace_id,
        user_id=user_id,
        username=username,
        operation_type=operation_type,
        operation_name=operation_name,
        resource_type=resource_type,
        resource_id=resource_id,
        request_method=request_method,
        request_path=request_path,
        ip_address=ip_address,
        user_agent=user_agent,
        before_data=mask_sensitive_data(before_data),
        after_data=mask_sensitive_data(after_data),
        result=result,
        error_message=error_message[:500] if error_message else None,
        duration_ms=duration_ms,
    )
    session.add(log_entry)
    await session.commit()
    return log_entry


# ── API log writer (fire-and-forget) ──────────────────────────────────

async def write_api_log(
    session: AsyncSession,
    *,
    trace_id: str | None = None,
    user_id: int | None = None,
    username: str | None = None,
    method: str = "GET",
    path: str = "/",
    query_string: str | None = None,
    status_code: int = 200,
    success: bool = True,
    latency_ms: int = 0,
    ip_address: str | None = None,
    user_agent: str | None = None,
    request_summary: dict | None = None,
    response_summary: dict | None = None,
    error_code: str | None = None,
    error_message: str | None = None,
) -> None:
    """Write an API call log entry (fire-and-forget, exceptions swallowed)."""
    try:
        log_entry = SysApiLog(
            trace_id=trace_id,
            user_id=user_id,
            username=username,
            method=method,
            path=path,
            query_string=query_string[:1024] if query_string else None,
            status_code=status_code,
            success=1 if success else 0,
            latency_ms=latency_ms,
            ip_address=ip_address,
            user_agent=user_agent[:512] if user_agent else None,
            request_summary=mask_sensitive_data(request_summary),
            response_summary=response_summary,
            error_code=error_code,
            error_message=error_message[:500] if error_message else None,
        )
        session.add(log_entry)
        await session.commit()
    except Exception as exc:
        logger.debug("Failed to write API log: %s", exc)
