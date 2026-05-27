"""Layer 1: GatingRouter — classifies query complexity for routing."""

import logging
from dra_ma.agents.layer1_perception.intent_agent import IntentObject

logger = logging.getLogger(__name__)


class GatingRouter:
    """Gating Router that dynamically classifies query complexity."""

    @staticmethod
    def route(intent: IntentObject) -> str:
        if intent.Expected_Hop == 1:
            logger.info("[GatingRouter] Routing query to SIMPLE template branch.")
            return "simple"
        else:
            logger.info(f"[GatingRouter] Routing query to COMPLEX parallel branch (Hops={intent.Expected_Hop}).")
            return "complex"
