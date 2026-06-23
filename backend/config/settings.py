"""Centralized environment configuration for BiDA-KG backend."""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Unified settings loaded from environment variables.

    Module ownership markers:
      [C] = 风险问答 (Developer C)
      [A] = 知识图谱构建 (Developer A)
      [B] = 知识图谱展示 (Developer B)
      [ALL] = Shared — coordinate changes across all modules
    """

    # ── [C] LLM ──────────────────────────────────────────────────
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "deepseek-chat")

    # ── [ALL] Neo4j ──────────────────────────────────────────────
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "") or os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "")
    NEO4J_DATABASE: str = os.getenv("NEO4J_DATABASE", "neo4j")

    # ── [A] Knowledge Graph Dataset ──────────────────────────────
    KG_DATASET: str = os.getenv("KG_DATASET", "metaqa").lower()

    # ── [A] Data Collection ──────────────────────────────────────
    KG_DATA_DIR: str = os.getenv("KG_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))

    # ── [A] NER ──────────────────────────────────────────────────
    NER_MODEL: str = os.getenv("NER_MODEL", "spacy")

    # ── [A] Dify Workflow API ────────────────────────────────────
    DIFY_API_KEY: str = os.getenv("DIFY_API_KEY", "")
    DIFY_BASE_URL: str = os.getenv("DIFY_BASE_URL", "https://api.dify.ai")
    # Per-stage API keys (each Dify App has its own API key).
    DIFY_SUBJECT_API_KEY: str = os.getenv("DIFY_SUBJECT_API_KEY", "")
    DIFY_EVENT_API_KEY: str = os.getenv("DIFY_EVENT_API_KEY", "")
    DIFY_FEATURE_API_KEY: str = os.getenv("DIFY_FEATURE_API_KEY", "")
    DIFY_REGULATION_API_KEY: str = os.getenv("DIFY_REGULATION_API_KEY", "")

    # ── [C] Embedding / Vector ───────────────────────────────────
    VECTOR_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "768"))
    VECTOR_SIMILARITY_FUNCTION: str = os.getenv("VECTOR_SIMILARITY_FUNCTION", "cosine")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    EMBED_DIM: int = int(os.getenv("EMBED_DIM", "384"))

    # ── [C] GNN Alignment ────────────────────────────────────────
    ALIGNMENT_DIR: str = os.getenv("ALIGNMENT_DIR", "models/alignment")
    ALIGNMENT_MODEL_VERSION: str = os.getenv("ALIGNMENT_MODEL_VERSION", "v1.0")
    ALIGNMENT_SIMILARITY_FN: str = os.getenv("ALIGNMENT_SIMILARITY_FN", "cosine")

    # ── [ALL] MySQL（用户/权限/审计日志）──────────────────────────
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "windeye")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "windeye")
    MYSQL_POOL_SIZE: int = int(os.getenv("MYSQL_POOL_SIZE", "5"))
    MYSQL_POOL_MAX: int = int(os.getenv("MYSQL_POOL_MAX", "20"))
    MYSQL_ENABLED: bool = os.getenv(
        "MYSQL_ENABLED",
        "true" if os.getenv("MYSQL_PASSWORD", "") else "false",
    ).lower() == "true"

    # ── [ALL] JWT 认证 ────────────────────────────────────────────
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "120"))
    JWT_REFRESH_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_EXPIRE_DAYS", "7"))

    # ── [ALL] 认证开关 ────────────────────────────────────────────
    AUTH_ENABLED: bool = os.getenv("AUTH_ENABLED", "false").lower() == "true"
    AUTH_MODE: str = os.getenv(
        "AUTH_MODE",
        "enforce" if AUTH_ENABLED else "off",
    ).lower()

    # ── [ALL] Redis（Token 黑名单 + 权限缓存）─────────────────────
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"

    # ── [ALL] 审计日志 ────────────────────────────────────────────
    LOG_RETENTION_DAYS: int = int(os.getenv("LOG_RETENTION_DAYS", "180"))
    LOG_SLOW_REQUEST_MS: int = int(os.getenv("LOG_SLOW_REQUEST_MS", "3000"))
    AUDIT_API_LOG_ENABLED: bool = os.getenv(
        "AUDIT_API_LOG_ENABLED",
        "true" if MYSQL_ENABLED else "false",
    ).lower() == "true"
    AUDIT_OPERATION_LOG_ENABLED: bool = os.getenv(
        "AUDIT_OPERATION_LOG_ENABLED",
        "true" if MYSQL_ENABLED else "false",
    ).lower() == "true"


settings = Settings()
