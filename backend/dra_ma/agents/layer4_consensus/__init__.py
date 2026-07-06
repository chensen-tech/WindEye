"""Layer 4: Logical Consensus & Ultimate Aggregation.

VerifierAgent:     Fact-consistency verification + GNN alignment scoring.
RewardCalculator:  Multi-dimensional beam scoring (R_base + R_collab + R_div).
AggregatorAgent:   Best-path-first consensus + LLM post-filtering + NLG generation.
"""

from dra_ma.agents.layer4_consensus.verifier import VerifierAgent
from dra_ma.agents.layer4_consensus.reward import (
    calculate_total_reward, calculate_r_base, calculate_r_collab, calculate_r_div,
    calculate_jaccard_similarity, calculate_p_scale,
)
from dra_ma.agents.layer4_consensus.aggregator import AggregatorAgent

__all__ = [
    "VerifierAgent", "AggregatorAgent",
    "calculate_total_reward", "calculate_r_base", "calculate_r_collab",
    "calculate_r_div", "calculate_jaccard_similarity", "calculate_p_scale",
]
