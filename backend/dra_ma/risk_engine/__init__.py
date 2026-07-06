"""Risk Analysis Engine — 5-Agent pipeline for financial risk governance.

Pipeline: Planner → Retriever → Analyst → Compliance → Reporter
"""

from dra_ma.risk_engine.risk_engine import RiskAnalysisEngine

__all__ = ["RiskAnalysisEngine"]
