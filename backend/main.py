"""WindEye — Capital Markets Risk Transmission Monitoring Platform.

DRA-MA Architecture: Four-Layer Dynamic Reasoning & Multi-Agent Collaboration.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Environment:
    RISK_DEMO_MODE=true   Rule-based demo analysis (default, no LLM required)
    RISK_DEMO_MODE=false  Full 5-agent LLM pipeline
"""

import logging
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()

from fastapi import FastAPI

from api.middleware import setup_logging, setup_middleware
from api.router import create_routes
from dra_ma.orchestrator.engine import DRAEngine
from dra_ma.risk_engine import RiskAnalysisEngine

logger = logging.getLogger(__name__)

setup_logging()

app = FastAPI(title="WindEye API", version="0.3.0")
setup_middleware(app)

# ── Initialize optional MySQL connection pool ────────────────────────
from db import get_db, is_mysql_configured

if is_mysql_configured():
    try:
        _mysql = get_db()
        logger.info("MySQL client initialized (connection pool ready on first use).")
    except Exception as exc:
        _mysql = None
        logger.warning("MySQL initialization failed; auth/audit are unavailable: %s", exc)
else:
    _mysql = None
    logger.info(
        "MySQL features disabled (set MYSQL_ENABLED=true and MYSQL_PASSWORD to enable auth/audit)."
    )

demo_mode = os.getenv("RISK_DEMO_MODE", "true").lower() == "true"
kg_system = DRAEngine()
risk_engine = RiskAnalysisEngine(demo_mode=demo_mode)
create_routes(app, kg_system, risk_engine)
