"""Entity & Relation Extraction — NER, entity linking, and query rewriting.

Dual-engine extraction:
- Rule-based: spaCy models + regex patterns
- LLM-based: DeepSeek / OpenAI compatible API
"""

from kg_construction.extraction.ner import extract_entities, NERModel
from kg_construction.extraction.kg_linker import link_entities, EntityLinker
from kg_construction.extraction.query_rewriter import rewrite_query, QueryRewriter
from kg_construction.extraction.subject_extractor import (
    extract_and_align_subjects,
    extract_subject_candidates,
    subjects_to_frontend_nodes,
)

__all__ = [
    "extract_entities", "NERModel",
    "link_entities", "EntityLinker",
    "rewrite_query", "QueryRewriter",
    "extract_and_align_subjects", "extract_subject_candidates", "subjects_to_frontend_nodes",
]
