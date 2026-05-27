"""Ontology registry — loads and serves KG schema definitions.

The active ontology is selected via the KG_DATASET environment variable.
Supported datasets: finance (FinancialRegulatoryKG), metaqa, webqsp.
"""

from kg_construction.ontology.ontology_registry import OntologyRegistry

__all__ = ["OntologyRegistry"]
