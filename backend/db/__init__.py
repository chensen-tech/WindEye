"""MySQL client — async connection manager for user/auth/audit data.

Follows the same singleton/factory pattern as core/database.py Neo4jClient.
Uses SQLAlchemy 2.0 async engine + asyncmy driver.
"""

from __future__ import annotations

import logging
import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

logger = logging.getLogger(__name__)


def is_mysql_configured() -> bool:
    """Return whether MySQL-backed features are explicitly configured."""
    enabled = os.getenv(
        "MYSQL_ENABLED",
        "true" if os.getenv("MYSQL_PASSWORD", "") else "false",
    ).lower() == "true"
    return enabled and bool(os.getenv("MYSQL_PASSWORD", ""))


class MySQLClient:
    """Async MySQL connection manager with connection pooling."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 3306,
        user: str = "windeye",
        password: str = "",
        database: str = "windeye",
        pool_size: int = 5,
        pool_max: int = 20,
    ) -> None:
        self.host = host
        self.port = port
        self.user = user
        self.database = database
        self.pool_size = pool_size
        self.pool_max = pool_max

        url = f"mysql+asyncmy://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"
        self._engine = create_async_engine(
            url,
            pool_size=pool_size,
            max_overflow=pool_max - pool_size,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
        )
        self._session_factory = async_sessionmaker(
            self._engine, class_=AsyncSession, expire_on_commit=False
        )
        logger.info(
            "MySQLClient connected to %s:%d/%s (pool=%d, max=%d)",
            host, port, database, pool_size, pool_max,
        )

    @classmethod
    def from_env(cls) -> "MySQLClient":
        """Create MySQLClient from environment variables."""
        host = os.getenv("MYSQL_HOST", "localhost")
        port = int(os.getenv("MYSQL_PORT", "3306"))
        user = os.getenv("MYSQL_USER", "windeye")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "windeye")
        pool_size = int(os.getenv("MYSQL_POOL_SIZE", "5"))
        pool_max = int(os.getenv("MYSQL_POOL_MAX", "20"))

        if not is_mysql_configured():
            raise RuntimeError(
                "MySQL features are disabled. Set MYSQL_ENABLED=true and MYSQL_PASSWORD."
            )

        return cls(
            host=host, port=port, user=user, password=password,
            database=database, pool_size=pool_size, pool_max=pool_max,
        )

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Yield an async session for a single operation."""
        async with self._session_factory() as session:
            yield session

    async def verify_connectivity(self) -> bool:
        """Check that MySQL is reachable."""
        try:
            async with self._session_factory() as session:
                await session.execute(
                    __import__("sqlalchemy").text("SELECT 1")
                )
            logger.info("MySQL connectivity verified.")
            return True
        except Exception as exc:
            logger.error("MySQL connectivity check failed: %s", exc)
            return False

    async def close(self) -> None:
        """Gracefully shut down the engine and connection pool."""
        await self._engine.dispose()
        logger.info("MySQLClient connection pool closed.")


# ── Module-level lazy singleton ──────────────────────────────────────

_client: MySQLClient | None = None


def get_db() -> MySQLClient:
    """Return the module-level MySQLClient singleton, creating it on first call."""
    global _client
    if not is_mysql_configured():
        raise RuntimeError(
            "MySQL features are disabled. Set MYSQL_ENABLED=true and MYSQL_PASSWORD."
        )
    if _client is None:
        _client = MySQLClient.from_env()
    return _client
