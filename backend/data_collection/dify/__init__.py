"""Dify Integration Module — Dify workflow API client and PDF bridge.

Sub-modules:
- dify_client:    Dify Workflow API client for entity extraction
- dify_pdf_bridge: PDF-to-text-to-Dify pipeline bridge
"""

from .dify_client import (
    DifyClient,
    run_dify_extraction,
    run_dify_extraction_for_stage,
)
from .dify_pdf_bridge import (
    process_pdf_with_dify,
    process_text_with_dify,
    batch_process_with_dify,
    chunk_regulation_text,
)

__all__ = [
    "DifyClient",
    "run_dify_extraction",
    "run_dify_extraction_for_stage",
    "process_pdf_with_dify",
    "process_text_with_dify",
    "batch_process_with_dify",
    "chunk_regulation_text",
]
