"""ETL Pipeline — orchestration from raw data to Neo4j knowledge graph.

Sub-modules:
- pipeline_config:   Pipeline stages, data source definitions
- pipeline_runner:   Stage-by-stage execution with error handling
- cypher_generator:  Entity/relation → Cypher CREATE/MERGE statements
"""

from .pipeline_config import (
    PIPELINE_STAGES,
    DATA_SOURCE_CONFIGS,
    get_pipeline_config,
)
from .pipeline_runner import PipelineRunner, PipelineRun
from .cypher_generator import (
    generate_cypher_for_entity,
    generate_cypher_for_relation,
    batch_generate_cypher,
    validate_cypher,
)

__all__ = [
    "PIPELINE_STAGES",
    "DATA_SOURCE_CONFIGS",
    "get_pipeline_config",
    "PipelineRunner",
    "PipelineRun",
    "generate_cypher_for_entity",
    "generate_cypher_for_relation",
    "batch_generate_cypher",
    "validate_cypher",
]
