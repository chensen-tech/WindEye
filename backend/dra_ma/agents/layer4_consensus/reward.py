"""Layer 4: RewardCalculator — multi-dimensional reward scoring for beam search ranking.

R_base = V_ast * P_scale(n)     — base execution reward
R_collab = Healed_Flag + GNN_score — collaboration bonus
R_div = 1 - max_jaccard           — diversity reward (penalizes homogeneous paths)
"""

import math
import logging
import re
from typing import List, Set

logger = logging.getLogger(__name__)


def parse_relations_from_path(path: str) -> Set[str]:
    """Extract relation tokens from a path string like 'Tension - starred_actors - Actor - directed_by - Director'."""
    if not path:
        return set()
    parts = re.split(r"[-→>|]", path)
    parts = [p.strip() for p in parts if p.strip()]
    relations = parts[1::2]
    return set(relations)


def calculate_jaccard_similarity(path1: str, path2: str) -> float:
    """Calculate the Jaccard similarity between the relations of two paths."""
    rels1 = parse_relations_from_path(path1)
    rels2 = parse_relations_from_path(path2)

    if not rels1 and not rels2:
        return 1.0
    if not rels1 or not rels2:
        return 0.0

    intersection = rels1.intersection(rels2)
    union = rels1.union(rels2)
    return len(intersection) / len(union)


def calculate_r_div(candidate_path: str, existing_paths: List[str]) -> float:
    """R_div (Diversity Reward): 1 - max_jaccard_sim"""
    if not existing_paths:
        return 1.0

    max_sim = 0.0
    for p in existing_paths:
        sim = calculate_jaccard_similarity(candidate_path, p)
        if sim > max_sim:
            max_sim = sim

    r_div = 1.0 - max_sim
    logger.info(f"[RewardCalculator] Path '{candidate_path}' max Jaccard={max_sim:.4f}, R_div={r_div:.4f}")
    return r_div


def calculate_p_scale(n: int) -> float:
    """P_scale scaling factor: n==0 → 0.1, 0<n≤100 → exp(-n/100)+1.0, n>100 → 0.5"""
    if n == 0:
        return 0.1
    elif n <= 100:
        return math.exp(-n / 100.0) + 1.0
    else:
        return 0.5


def calculate_r_base(v_ast: int, n: int) -> float:
    """R_base (Base Reward): V_ast * P_scale(n)"""
    p_scale = calculate_p_scale(n)
    r_base = v_ast * p_scale
    logger.info(f"[RewardCalculator] R_base: V_ast={v_ast}, n={n}, P_scale={p_scale:.4f}, R_base={r_base:.4f}")
    return r_base


def calculate_r_collab(healed_flag: int, gnn_score: float) -> float:
    """R_collab (Collaboration Reward): Healed_Flag + GNN_score"""
    r_collab = float(healed_flag) + gnn_score
    logger.info(f"[RewardCalculator] R_collab: Healed={healed_flag}, GNN={gnn_score:.4f}, R_collab={r_collab:.4f}")
    return r_collab


def calculate_total_reward(
    v_ast: int,
    n: int,
    healed_flag: int,
    gnn_score: float,
    candidate_path: str,
    existing_paths: List[str]
) -> float:
    """Total Reward: R = R_base + R_collab + R_div"""
    r_base = calculate_r_base(v_ast, n)
    r_collab = calculate_r_collab(healed_flag, gnn_score)
    r_div = calculate_r_div(candidate_path, existing_paths)
    total = r_base + r_collab + r_div
    logger.info(f"[RewardCalculator] Total for '{candidate_path}': {total:.4f} (Base={r_base:.4f}, Collab={r_collab:.4f}, Div={r_div:.4f})")
    return total
