"""DRA-MA — Dynamic Reasoning & Multi-Agent Collaboration Engine.

Four-layer agent architecture:
- Layer 1 (Perception):   IntentAgent + GatingRouter
- Layer 2 (Beam Search):  PlannerAgent ensemble + Probe
- Layer 3 (Execution):    ExecutorAgent + SmashAgent (self-healing)
- Layer 4 (Consensus):    VerifierAgent + AggregatorAgent + Reward

Orchestrator: DRAEngine — 7-stage pipeline with 4 collaboration dimensions.
Risk Engine: 5-Agent pipeline (Planner→Retriever→Analyst→Compliance→Reporter).
"""

from dra_ma.orchestrator.engine import DRAEngine

__all__ = ["DRAEngine"]
