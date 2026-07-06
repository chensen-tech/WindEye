"""KG Construction Module — Knowledge Graph building pipeline.

Sub-modules:
- ontology:    Ontology/schema definitions and registry
- extraction:  NER, entity linking, relation extraction
- alignment:   GNN structural-semantic alignment
- fusion:      Entity resolution and knowledge fusion
- etl:         ETL pipelines for data ingestion
- index_manager: Neo4j index creation and management
"""

__all__ = ["ontology", "extraction", "alignment", "fusion", "etl", "index_manager"]
