"""Exception Handling Agent — retry logic and fallback strategies."""

from __future__ import annotations

import asyncio
import logging

logger = logging.getLogger(__name__)


class ExceptionHandlingAgent:
    """Handle crawl failures with retry and fallback."""

    MAX_RETRIES = 3
    RETRY_DELAY = 5

    async def execute_with_retry(self, scraper_fn, config: dict) -> dict:
        """Execute scraper with exponential backoff retry.

        Args:
            scraper_fn: The scraper function to call (accepts config dict).
            config: Configuration dict to pass to the scraper.

        Returns:
            Result dict from the scraper, or an error dict on all failures.
        """
        last_error = None

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                logger.info(f"[Attempt {attempt}/{self.MAX_RETRIES}] Running scraper: {config.get('source')}")
                result = await asyncio.to_thread(scraper_fn, config)

                if result and (result.get("files_downloaded", 0) > 0 or result.get("records", 0) > 0):
                    result["attempts"] = attempt
                    return result

                logger.warning(f"[Attempt {attempt}] Scraper returned empty results, retrying...")
                last_error = Exception("Empty results from scraper")

            except Exception as e:
                logger.error(f"[Attempt {attempt}] Scraper failed: {e}")
                last_error = e

            if attempt < self.MAX_RETRIES:
                delay = self.RETRY_DELAY * (2 ** (attempt - 1))
                await asyncio.sleep(delay)

        return {
            "source": config.get("source", "unknown"),
            "files_downloaded": 0,
            "records": 0,
            "save_dir": "",
            "error": str(last_error),
            "attempts": self.MAX_RETRIES,
        }
