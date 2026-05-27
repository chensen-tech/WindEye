"""WindEye — Capital Markets Risk Transmission Monitoring Platform.

DRA-MA Architecture: Four-Layer Dynamic Reasoning & Multi-Agent Collaboration.

Usage:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Environment:
    RISK_DEMO_MODE=true   Rule-based demo analysis (default, no LLM required)
    RISK_DEMO_MODE=false  Full 5-agent LLM pipeline
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from api.middleware import setup_logging, setup_middleware
from api.router import create_routes
from dra_ma.orchestrator.engine import DRAEngine
from dra_ma.risk_engine import RiskAnalysisEngine

setup_logging()

app = FastAPI(title="WindEye API", version="0.2.0")
setup_middleware(app)

demo_mode = os.getenv("RISK_DEMO_MODE", "true").lower() == "true"
kg_system = DRAEngine()
risk_engine = RiskAnalysisEngine(demo_mode=demo_mode)
create_routes(app, kg_system, risk_engine)
