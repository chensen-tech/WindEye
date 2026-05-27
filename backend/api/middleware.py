"""API middleware: trace-ID propagation, error handlers, and logging configuration."""

import logging
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from core.exceptions import BiDAError
from core.tracing import get_trace_id, set_trace_id


def setup_logging():
    """Configure structured logging with trace-ID injection."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | trace_id=%(trace_id)s | %(name)s | %(message)s",
    )
    _old_factory = logging.getLogRecordFactory()

    def _record_factory(*args, **kwargs):
        record = _old_factory(*args, **kwargs)
        if not hasattr(record, "trace_id"):
            record.trace_id = get_trace_id()
        return record

    logging.setLogRecordFactory(_record_factory)


def setup_middleware(app: FastAPI):
    """Register trace middleware, CORS, and error handlers on the FastAPI app."""

    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8001", "http://localhost:8000", "http://127.0.0.1:8000", "http://127.0.0.1:8001"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def trace_middleware(request: Request, call_next):
        incoming_trace_id = request.headers.get("X-Trace-Id")
        trace_id = incoming_trace_id.strip() if incoming_trace_id else f"trc-{uuid4().hex}"
        request.state.trace_id = trace_id
        set_trace_id(trace_id)
        response = await call_next(request)
        response.headers["X-Trace-Id"] = trace_id
        return response

    @app.exception_handler(BiDAError)
    async def bida_error_handler(request: Request, exc: BiDAError):
        trace_id = getattr(request.state, "trace_id", get_trace_id())
        error = exc.to_dict(trace_id=trace_id)
        payload = {"schemaVersion": "v1.0", "error": error}
        if exc.code.startswith(("DLG_4", "RET_4")):
            status_code = 400
        elif exc.code == "RET_503_GRAPH_UNAVAILABLE":
            status_code = 503
        elif exc.code == "AGT_429_RATE_LIMIT":
            status_code = 429
        else:
            status_code = 500
        return JSONResponse(status_code=status_code, content=payload)

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        trace_id = getattr(request.state, "trace_id", get_trace_id())
        logging.getLogger(__name__).exception("Unhandled exception: %s", exc)
        payload = {
            "schemaVersion": "v1.0",
            "error": {
                "code": "SYS_500_INTERNAL",
                "message": "系统内部异常，请稍后重试。",
                "traceId": trace_id,
            },
        }
        return JSONResponse(status_code=500, content=payload)

    # Suppress health-check noise in access logs
    class EndpointFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return record.getMessage().find("GET /health") == -1

    logging.getLogger("uvicorn.access").addFilter(EndpointFilter())
