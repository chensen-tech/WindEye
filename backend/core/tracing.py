"""Tracing helpers for request-scoped trace IDs in logs."""

from __future__ import annotations

from contextvars import ContextVar


_trace_id_ctx: ContextVar[str] = ContextVar("trace_id", default="-")


def set_trace_id(trace_id: str) -> None:
    """Set trace ID for current request context."""
    _trace_id_ctx.set(trace_id or "-")


def get_trace_id() -> str:
    """Get current request trace ID."""
    return _trace_id_ctx.get()

