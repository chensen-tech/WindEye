"""Domain models for BiDA-KG cross-module data contracts.

These models are consolidated from the requirements documents:
- docs/requirements/00-overview-and-boundaries.md
- docs/requirements/01-dialogue-layer-requirements.md
- docs/requirements/02-graphrag-retrieval-requirements.md
- docs/requirements/03-llm-agent-requirements.md
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class ContractModel(BaseModel):
    """Base model for versioned API/data contracts."""

    schema_version: str = Field(default="v1.0", alias="schemaVersion")
    model_config = ConfigDict(populate_by_name=True)


class TraceContext(ContractModel):
    """Cross-module trace metadata."""

    session_id: str = Field(..., alias="sessionId")
    round_id: int = Field(..., alias="roundId", ge=1)
    trace_id: str = Field(..., alias="traceId")


class DisambiguationCandidate(ContractModel):
    """Single candidate returned during entity disambiguation."""

    kg_node_id: str = Field(..., alias="kgNodeId", description="Candidate node ID.")
    display_name: str | None = Field(None, alias="displayName", description="Human-readable node name.")
    score: float = Field(..., description="Match score from index.")

    model_config = ConfigDict(populate_by_name=True)


class Entity(ContractModel):
    """E_t entity object produced by Dialogue Layer entity linking."""

    mention: str = Field(..., description="Original mention text from query/history.")
    kg_node_id: str = Field(..., alias="kgNodeId", description="Selected KG node ID.")
    entity_type: str = Field(..., alias="entityType", description="Entity type label.")
    confidence: float = Field(..., ge=0.0, description="Entity link confidence.")
    disambiguation_candidates: list[DisambiguationCandidate] = Field(
        default_factory=list,
        alias="disambiguationCandidates",
        description="Ambiguous candidates pending LLM disambiguation.",
    )

    model_config = ConfigDict(populate_by_name=True)

class ContextData(ContractModel):
    """C_t structured context passed from dialogue module to downstream modules."""

    context_id: str = Field(..., alias="contextId", description="Unique context ID.")
    query: str = Field(..., description="Current user query q_t.")
    history: list[str] = Field(default_factory=list, description="Conversation history H_t.")
    intent: str = Field(..., description="Detected user intent.")
    constraints: dict[str, Any] = Field(
        default_factory=dict,
        description="Structured constraints extracted from context.",
    )
    session_goal: str = Field(..., alias="sessionGoal", description="Current session goal.")
    session_id: str = Field(..., alias="sessionId", description="Session identifier.")
    round_id: int = Field(..., alias="roundId", ge=1, description="Round number in one session.")
    trace_id: str = Field(..., alias="traceId", description="Global request trace identifier.")
    entities: list[Entity] = Field(
        default_factory=list,
        description="Linked entities E_t for retrieval anchors.",
    )
    requested_count: int = Field(
        default=5,
        description="Number of items the user wants recommended (from query rewrite).",
    )


class RetrievalStrategy(ContractModel):
    """Strategy controls for GraphRAG retrieval.

    Source: GraphRAG interface definition (mode/maxHop/relationFilter).
    """

    mode: Literal["multi_hop", "text2cypher", "hybrid"] = Field(
        ...,
        description="Retrieval mode selected by planner.",
    )
    max_hop: int = Field(..., alias="maxHop", ge=1, description="Maximum graph hop.")
    relation_filter: list[str] = Field(
        default_factory=list,
        alias="relationFilter",
        description="Allowed relation labels.",
    )


class SubgraphNode(ContractModel):
    """Node entry in S_t subgraph payload."""

    id: str
    type: str
    score: float = Field(..., description="Node relevance score.")
    title: str | None = Field(None, description="Display title (Movie title, or Person/Genre/Keyword name)")
    zh_title: str | None = Field(None, description="Chinese movie title")
    name: str | None = Field(None, description="Person node name (English)")
    zh_name: str | None = Field(None, description="Person node Chinese name")
    rating: float | None = Field(None, description="Movie rating (for Movie nodes)")
    year: int | None = Field(None, description="Release year (for Movie nodes)")
    poster: str | None = Field(None, description="Poster URL (for Movie nodes)")
    overview: str | None = Field(None, description="Movie plot/overview")
    genres: list[str] = Field(default_factory=list, description="Movie genres")
    directors: list[str] = Field(default_factory=list, description="Movie directors")
    actors: list[str] = Field(default_factory=list, description="Movie top actors")
    keywords: list[str] = Field(default_factory=list, description="Movie keywords")


class SubgraphEdge(ContractModel):
    """Edge entry in S_t subgraph payload."""

    source: str
    target: str
    relation: str


class SubgraphPath(ContractModel):
    """Path entry in S_t for explainability and ranking."""

    path_id: str = Field(..., alias="pathId")
    node_ids: list[str] = Field(default_factory=list, alias="nodeIds")
    score: float = Field(..., description="Path relevance score.")


class Subgraph(ContractModel):
    """S_t retrieval output consumed by Agent and explainability modules."""

    nodes: list[SubgraphNode] = Field(default_factory=list)
    edges: list[SubgraphEdge] = Field(default_factory=list)
    paths: list[SubgraphPath] = Field(default_factory=list)


class RetrievalData(ContractModel):
    """GraphRAG retrieval envelope including anchors and strategy metadata."""

    retrieval_id: str = Field(..., alias="retrievalId")
    anchors: list[str] = Field(default_factory=list, description="KG anchor node IDs.")
    strategy: RetrievalStrategy
    subgraph: Subgraph


class AgentInput(ContractModel):
    """Input object used by LLM Agent layer."""

    context: ContextData
    subgraph: Subgraph
    alignment_features: list[dict[str, Any]] = Field(
        default_factory=list,
        alias="alignmentFeatures",
        description="Optional GNN alignment features v_i for entity nodes.",
    )
    rewrite_result: QueryRewriteResult | None = Field(
        default=None,
        alias="rewriteResult",
        description="QueryRewrite result for context enrichment.",
    )


class AgentDecision(ContractModel):
    """Agent decision on whether retrieval evidence is sufficient."""

    need_more_evidence: bool = Field(..., alias="needMoreEvidence")
    next_action: Literal["finalize", "retrieve_again"] = Field(..., alias="nextAction")


class RecommendationItem(ContractModel):
    """Single recommended item in output y."""

    item_id: str = Field(..., alias="itemId")
    score: float = Field(..., description="Recommendation score.")
    # Extended properties from knowledge graph
    title: str | None = Field(None, description="Movie title")
    zh_title: str | None = Field(None, alias="zhTitle", description="Chinese movie title")
    rating: float | None = Field(None, description="Movie rating (vote_average)")
    year: int | None = Field(None, description="Release year")
    poster: str | None = Field(None, description="Poster URL")
    overview: str | None = Field(None, description="Movie plot/overview")
    genres: list[str] = Field(default_factory=list, description="Movie genres")
    directors: list[str] = Field(default_factory=list, description="Movie directors")


class ExplanationItem(ContractModel):
    """Per-movie highlight/explanation entry."""

    item_id: str = Field(..., alias="itemId")
    highlight: str = Field(..., description="Short personalized highlight for this movie (not repeating user's query intent)")
    path_ids: list[str] = Field(default_factory=list, alias="pathIds")


class AgentOutput(ContractModel):
    """Structured agent output containing recommendation y and explanation p."""

    # Summary reasoning for all recommendations (e.g., "为您找到以下3部该导演的作品")
    overall_reasoning: str = Field(
        default="",
        alias="overallReasoning",
        description="Overall summary reasoning for all recommendations",
    )
    recommendations: list[RecommendationItem] = Field(default_factory=list)
    explanations: list[ExplanationItem] = Field(default_factory=list)


class AgentPayload(ContractModel):
    """Top-level Agent request/response contract from requirements."""

    agent_round: int = Field(..., alias="agentRound", ge=1)
    input: AgentInput
    decision: AgentDecision
    output: AgentOutput

    model_config = ConfigDict(populate_by_name=True)


class ApiSuccessResponse(ContractModel):
    """Top-level API success response."""

    success: bool = True
    message: str | None = None
    trace: TraceContext
    data: dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# QueryRewrite models
# ---------------------------------------------------------------------------


class SubQuery(ContractModel):
    """Single decomposed sub-query produced by QueryRewrite."""

    sub_query_id: str = Field(..., alias="subQueryId")
    text: str = Field(..., description="Rewritten sub-query text.")
    focus_entities: list[str] = Field(
        default_factory=list,
        alias="focusEntities",
        description="Entity mentions this sub-query focuses on.",
    )
    focus_intent: str = Field(
        default="question",
        alias="focusIntent",
        description="Intent of this sub-query (recommendation/explanation/comparison/question).",
    )
    priority: int = Field(
        default=1,
        ge=1,
        le=5,
        description="Priority weight for merging sub-query results (1=highest).",
    )


class QueryRewriteResult(ContractModel):
    """Result of the QueryRewrite module."""

    original_query: str = Field(..., alias="originalQuery", description="The original user query.")
    rewritten_query: str = Field(..., alias="rewrittenQuery", description="Canonical query after expansion.")
    sub_queries: list[SubQuery] = Field(
        default_factory=list,
        alias="subQueries",
        description="Decomposed sub-queries in execution order.",
    )
    strategy_suggestion: Literal["multi_hop", "text2cypher", "hybrid"] = Field(
        default="hybrid",
        alias="strategySuggestion",
        description="Recommended retrieval strategy based on query complexity.",
    )
    suggested_max_hop: int = Field(
        default=2,
        ge=1,
        alias="suggestedMaxHop",
        description="Recommended max hop count.",
    )
    expansion_terms: list[str] = Field(
        default_factory=list,
        alias="expansionTerms",
        description="Additional query terms added during expansion (synonyms, related concepts).",
    )
    is_complex: bool = Field(
        default=False,
        alias="isComplex",
        description="Whether the query was flagged as complex (multi-aspect).",
    )
    requested_count: int = Field(
        default=5,
        alias="requestedCount",
        description=(
            "Number of items the user wants recommended. "
            "Parse from Chinese numerals (一部/两部/三部) or Arabic digits (5部/10部). "
            "Default to 5 if unspecified."
        ),
    )


# ---------------------------------------------------------------------------
# GNN Alignment models
# ---------------------------------------------------------------------------


class AlignmentPair(ContractModel):
    """Paired training sample for GNN alignment: structural + semantic embedding."""

    entity_id: str = Field(..., alias="entityId", description="KG node identifier.")
    graph_embedding: list[float] = Field(
        ...,
        alias="graphEmbedding",
        description="Structural embedding z_i from KG (e.g., KGAT/KGCN output).",
    )
    semantic_embedding: list[float] = Field(
        ...,
        alias="semanticEmbedding",
        description="Semantic embedding e_i from text encoder (e.g., sentence-transformer).",
    )


class AlignmentResult(ContractModel):
    """Output of GNN alignment inference for a single entity."""

    entity_id: str = Field(..., alias="entityId")
    graph_embedding: list[float] = Field(default_factory=list, alias="graphEmbedding")
    semantic_embedding: list[float] = Field(default_factory=list, alias="semanticEmbedding")
    aligned_embedding: list[float] = Field(
        ...,
        alias="alignedEmbedding",
        description="Projected graph embedding v_i = W_hat @ z_i.",
    )
    alignment_score: float = Field(
        ...,
        alias="alignmentScore",
        description="Cosine similarity between projected graph embedding and semantic embedding.",
    )
    model_version: str = Field(
        default="v1.0",
        alias="modelVersion",
        description="Version tag of the alignment projection matrix.",
    )


class AlignmentTrainingConfig(ContractModel):
    """Configuration for GNN alignment offline training."""

    graph_embed_dim: int = Field(
        default=256,
        alias="graphEmbedDim",
        description="Dimensionality of structural (graph) embeddings.",
    )
    semantic_embed_dim: int = Field(
        default=384,
        alias="semanticEmbedDim",
        description="Dimensionality of semantic (text) embeddings.",
    )
    projection_dim: int = Field(
        default=256,
        alias="projectionDim",
        description="Dimensionality of projected space (d').",
    )
    similarity_fn: Literal["cosine", "dot"] = Field(
        default="cosine",
        alias="similarityFn",
        description="Similarity function used in InfoNCE loss.",
    )
    learning_rate: float = Field(default=1e-3, alias="learningRate")
    batch_size: int = Field(default=128, alias="batchSize", ge=1)
    epochs: int = Field(default=100, ge=1)
    warmup_epochs: int = Field(default=10, alias="warmupEpochs", ge=0)
    margin: float = Field(default=0.5, description="InfoNCE margin hyperparameter.")
    random_seed: int = Field(default=42, alias="randomSeed")
    model_save_path: str = Field(
        default="models/alignment_w_hat_v1.pt",
        alias="modelSavePath",
    )
    log_dir: str = Field(default="logs/alignment", alias="logDir")


class AlignmentTrainingMetrics(ContractModel):
    """Metrics captured during alignment training."""

    epoch: int
    loss: float = Field(..., description="InfoNCE loss for the epoch.")
    alignment_accuracy: float = Field(
        ...,
        alias="alignmentAccuracy",
        description="Top-1 accuracy on alignment validation set.",
    )
    cosine_similarity_mean: float = Field(alias="cosineSimMean")
    cosine_similarity_std: float = Field(alias="cosineSimStd")
    learning_rate: float = Field(alias="learningRate")


