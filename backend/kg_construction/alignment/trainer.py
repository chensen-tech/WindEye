"""Offline InfoNCE training for GNN structural-semantic alignment projection matrix W_hat."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def train_alignment(config: dict | None = None) -> None:
    """Train the alignment projection matrix using InfoNCE loss.

    This is an offline training process that produces a W_hat matrix
    mapping structural (graph) embeddings to semantic (text) embeddings.
    """
    logger.info("Alignment training is not yet implemented.")
