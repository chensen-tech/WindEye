"""Layer 1: Dynamic Ontology Perception & Intent Routing.

IntentAgent:  Extracts start entities, expected hop count, and Expected Answer Type (semantic anchor).
GatingRouter: Classifies query complexity — simple (1-hop) vs complex (multi-agent beam search).
"""

from dra_ma.agents.layer1_perception.intent_agent import IntentAgent, IntentObject, generate_prompt
from dra_ma.agents.layer1_perception.gating_router import GatingRouter

__all__ = ["IntentAgent", "IntentObject", "GatingRouter", "generate_prompt"]
