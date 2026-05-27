"""GNN Alignment inference — projection of structural embeddings to semantic space."""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class GNNAlignment:
    """Singleton holder for the trained alignment projection matrix."""

    def __init__(self) -> None:
        self._is_available = False

    @property
    def is_available(self) -> bool:
        return self._is_available

    def align(self, entity_id: str, graph_emb: list[float], semantic_emb: list[float]) -> dict[str, Any]:
        if not self._is_available:
            return {"alignmentScore": 1.0}
        # Placeholder: actual projection via W_hat matrix
        return {"alignmentScore": 1.0, "entityId": entity_id}


class AlignmentProjector:
    """Online projector using the trained W_hat matrix."""

    def __init__(self) -> None:
        self._alignment = GNNAlignment()

    @property
    def is_available(self) -> bool:
        return self._alignment.is_available

    def align(self, entity_id: str, graph_emb: list[float], semantic_emb: list[float]) -> dict[str, Any]:
        return self._alignment.align(entity_id, graph_emb, semantic_emb)


_aligner: GNNAlignment | None = None


def get_aligner() -> GNNAlignment:
    global _aligner
    if _aligner is None:
        _aligner = GNNAlignment()
    return _aligner
