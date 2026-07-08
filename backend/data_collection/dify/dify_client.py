"""Dify Workflow API Client — calls Dify extraction workflows via REST API.

Each KG construction stage maps to a dedicated Dify workflow identified by its
API key (each Dify App has its own API key in the Authorization header):
  - subject_extraction    → DIFY_SUBJECT_API_KEY
  - event_extraction      → DIFY_EVENT_API_KEY
  - feature_extraction    → DIFY_FEATURE_API_KEY
  - regulation_linking    → DIFY_REGULATION_API_KEY

All stages fall back to DIFY_API_KEY if a per-stage key is not set.

Each workflow accepts a text string input and returns a JSONL string of extracted
nodes and relationships via the 'output_triples' output.

Typical usage:
    from data_collection.dify import DifyClient
    client = DifyClient()
    results = client.run_workflow_for_stage(text, stage="subject_extraction")
"""

from __future__ import annotations

import json
import logging
import os
import time
import tempfile
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

logger = logging.getLogger(__name__)

# ── Defaults ──────────────────────────────────────────────────────────────

DEFAULT_BASE_URL = "https://api.dify.ai"
DEFAULT_TIMEOUT = 120.0
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2.0  # seconds

# Stage → per-stage API key env var mapping.
# Each Dify App/workflow has its own API key; falls back to DIFY_API_KEY.
_STAGE_API_KEY_ENV_MAP: dict[str, str] = {
    "subject_extraction": "DIFY_SUBJECT_API_KEY",
    "event_extraction": "DIFY_EVENT_API_KEY",
    "feature_extraction": "DIFY_FEATURE_API_KEY",
    "regulation_linking": "DIFY_REGULATION_API_KEY",
}


class DifyClient:
    """HTTP client for the Dify Workflow API.

    Can be instantiated with a specific api_key, or use
    run_workflow_for_stage() to auto-select the API key by stage name.
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        self.api_key = api_key or os.getenv("DIFY_API_KEY", "")
        self.base_url = (base_url or os.getenv("DIFY_BASE_URL", DEFAULT_BASE_URL)).rstrip("/")
        self.timeout = timeout
        self.last_error = ""

    # ── Stage-aware API ─────────────────────────────────────────────────

    def run_workflow_for_stage(
        self, text: str, stage: str, source_name: str = "pipeline"
    ) -> list[dict[str, Any]]:
        """Run the Dify workflow for a specific KG construction stage.

        Args:
            text: Input text to extract entities from.
            stage: One of subject_extraction, event_extraction,
                   feature_extraction, regulation_linking.
            source_name: Identifier for the source (e.g. filename).

        Returns:
            List of parsed node/relationship dicts.
        """
        env_var = _STAGE_API_KEY_ENV_MAP.get(stage)
        if not env_var:
            self.last_error = f"Unknown stage '{stage}' — no API key mapping."
            logger.warning(self.last_error)
            return []

        # Per-stage API key, fall back to default DIFY_API_KEY
        stage_api_key = os.getenv(env_var, "") or self.api_key
        if not stage_api_key:
            self.last_error = f"No API key for stage '{stage}' — set {env_var} or DIFY_API_KEY."
            logger.warning(self.last_error)
            return []

        return self._run_workflow(text, stage_api_key, source_name, stage)

    # ── Public API ──────────────────────────────────────────────────────

    def run_workflow_sync(self, text: str, source_name: str = "pipeline") -> list[dict[str, Any]]:
        """Run the regulation extraction workflow (backward-compatible).

        Delegates to _run_workflow with the instance's default api_key.
        """
        return self._run_workflow(text, self.api_key, source_name)

    # ── Internal ───────────────────────────────────────────────────────

    def _run_workflow(
        self, text: str, api_key: str, source_name: str = "pipeline", stage: str | None = None
    ) -> list[dict[str, Any]]:
        """Run a Dify workflow synchronously with retry logic.

        Args:
            text: The input text to extract entities from.
            api_key: The Dify App API key (identifies which workflow to run).
            source_name: Identifier for the source (e.g. filename), used in logs.

        Returns:
            List of parsed dicts — each a node {"type":"node", ...} or
            relationship {"type":"relationship", ...}.
        """
        if not api_key:
            self.last_error = "No Dify API key provided — skipping extraction."
            logger.warning(self.last_error)
            return []

        if not text or not text.strip():
            self.last_error = f"Empty text for source '{source_name}' — skipping."
            logger.warning(self.last_error)
            return []

        url = f"{self.base_url}/v1/workflows/run"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        uploaded_file_id = None
        file_input = None
        if stage != "feature_extraction":
            uploaded_file_id = self._upload_text_as_file(text, api_key, source_name)
            file_input = {
                "type": "document",
                "transfer_method": "local_file",
                "upload_file_id": uploaded_file_id,
            } if uploaded_file_id else None
        workflow_inputs = {"risk_event": text[:15000]} if stage == "feature_extraction" else {
            "text": text[:15000],
            **({"file_list": file_input} if file_input else {}),
        }
        payload = {
            "inputs": workflow_inputs,
            "response_mode": "streaming",
            "user": f"windeye-{source_name[:30]}",
        }

        last_error: str | None = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                results = self._run_workflow_stream(url, headers, payload)
                if results:
                    self.last_error = ""
                    return results
                last_error = "Workflow returned no parseable node/relationship output"
                logger.warning(
                    f"Dify API attempt {attempt}/{MAX_RETRIES} for '{source_name}': {last_error}"
                )
            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code
                response_text = e.response.text[:300]
                last_error = f"HTTP {status_code}: {response_text}"
                if status_code == 400 and file_input:
                    logger.warning(
                        "Dify workflow rejected file_list for '%s'; retrying this attempt with text-only input.",
                        source_name,
                    )
                    payload["inputs"].pop("file_list", None)
                    try:
                        results = self._run_workflow_stream(url, headers, payload)
                        if results:
                            self.last_error = ""
                            return results
                        last_error = "Text-only workflow returned no parseable node/relationship output"
                    except Exception as fallback_error:
                        last_error = str(fallback_error)
                logger.warning(
                    f"Dify API attempt {attempt}/{MAX_RETRIES} for '{source_name}': {last_error}"
                )
            except httpx.TimeoutException:
                last_error = f"Timeout after {self.timeout}s"
                logger.warning(
                    f"Dify API attempt {attempt}/{MAX_RETRIES} for '{source_name}': timeout"
                )
            except Exception as e:
                last_error = str(e)
                logger.warning(
                    f"Dify API attempt {attempt}/{MAX_RETRIES} for '{source_name}': {e}"
                )

            if attempt < MAX_RETRIES:
                delay = RETRY_BACKOFF_BASE ** attempt
                time.sleep(delay)

        self.last_error = last_error or "Dify extraction returned no result"
        logger.error(f"Dify extraction failed for '{source_name}': {self.last_error}")
        return []

    def _upload_text_as_file(self, text: str, api_key: str, source_name: str) -> str | None:
        """Upload text to Dify's file API and return the upload_file_id."""
        upload_url = f"{self.base_url}/v1/files/upload"
        safe_name = "".join(ch if ch.isalnum() or ch in "._-" else "_" for ch in source_name) or "input"
        if not safe_name.lower().endswith(".txt"):
            safe_name = f"{safe_name}.txt"

        temp_path = Path(tempfile.gettempdir()) / f"windeye_dify_{os.getpid()}_{safe_name}"
        temp_path.write_text(text, encoding="utf-8")
        try:
            with temp_path.open("rb") as fh:
                resp = httpx.post(
                    upload_url,
                    headers={"Authorization": f"Bearer {api_key}"},
                    files={"file": (safe_name, fh, "text/plain")},
                    data={"user": f"windeye-{source_name[:30]}"},
                    timeout=self.timeout,
                )
            if resp.status_code not in {200, 201}:
                logger.warning(
                    "Dify file upload failed for '%s': HTTP %s %s",
                    source_name,
                    resp.status_code,
                    resp.text[:300],
                )
                return None
            upload_id = resp.json().get("id")
            if not upload_id:
                logger.warning("Dify file upload response has no id for '%s'.", source_name)
                return None
            return upload_id
        except Exception as e:
            logger.warning("Dify file upload failed for '%s': %s", source_name, e)
            return None
        finally:
            try:
                temp_path.unlink(missing_ok=True)
            except OSError:
                pass

    def _run_workflow_stream(
        self,
        url: str,
        headers: dict[str, str],
        payload: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Run workflow in streaming mode and parse the final outputs."""
        final_response: dict[str, Any] | None = None
        with httpx.stream("POST", url, headers=headers, json=payload, timeout=self.timeout) as resp:
            if resp.status_code != 200:
                resp.read()
                raise httpx.HTTPStatusError(
                    f"HTTP {resp.status_code}: {resp.text[:300]}",
                    request=resp.request,
                    response=resp,
                )
            for line in resp.iter_lines():
                if not line or not line.startswith("data:"):
                    continue
                payload_text = line[5:].strip()
                if not payload_text:
                    continue
                try:
                    event = json.loads(payload_text)
                except json.JSONDecodeError:
                    continue
                if event.get("event") == "workflow_finished":
                    final_response = event

        if not final_response:
            return []
        return self._parse_response(final_response)

    # ── Response parsing ─────────────────────────────────────────────────

    def _parse_response(self, resp: dict[str, Any]) -> list[dict[str, Any]]:
        """Parse the Dify workflow response into a list of node/relationship dicts.

        The workflow's End node outputs 'output_triples' — a JSONL string where
        each line is a JSON object with type "node" or "relationship".
        """
        data = resp.get("data") or {}
        if data.get("status") == "failed":
            self.last_error = f"Dify workflow failed: {data.get('error') or data}"
            logger.warning(self.last_error)
            return []
        outputs = data.get("outputs") or {}
        results: list[dict[str, Any]] = []

        def append_item(item: Any) -> None:
            if isinstance(item, dict) and item.get("type") in {"node", "relationship"}:
                results.append(item)

        def parse_text(text: str) -> None:
            text = text.strip()
            if not text:
                return
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    for item in parsed:
                        append_item(item)
                    return
                if isinstance(parsed, dict):
                    append_item(parsed)
                    for key in ("items", "results", "triples", "output_triples", "final_triples"):
                        nested = parsed.get(key)
                        if isinstance(nested, list):
                            for item in nested:
                                append_item(item)
                        elif isinstance(nested, str):
                            parse_text(nested)
                    return
            except json.JSONDecodeError:
                pass

            for line in text.split("\n"):
                line = line.strip().strip(",")
                if not line:
                    continue
                if "{" in line and not line.startswith("{"):
                    line = line[line.find("{"):]
                try:
                    obj = json.loads(line)
                    append_item(obj)
                except json.JSONDecodeError:
                    logger.debug(f"Skipping non-JSON line in Dify output: {line[:100]}")

        preferred = outputs.get("output_triples", outputs.get("final_triples", ""))
        if isinstance(preferred, str):
            parse_text(preferred)
        elif isinstance(preferred, list):
            for item in preferred:
                append_item(item)

        if not results:
            for key, value in outputs.items():
                if key in {"output_triples", "final_triples"}:
                    continue
                if isinstance(value, str):
                    parse_text(value)
                elif isinstance(value, list):
                    for item in value:
                        append_item(item)
                elif isinstance(value, dict):
                    append_item(value)

        if not results:
            self.last_error = f"Dify response contained no parseable triples. Output keys: {list(outputs.keys())}"
            logger.warning(self.last_error)
            return []

        node_count = sum(1 for r in results if r.get("type") == "node")
        edge_count = sum(1 for r in results if r.get("type") == "relationship")
        logger.info(
            f"Dify extraction complete: {node_count} nodes, {edge_count} relationships"
        )
        return results


# ── Convenience functions ───────────────────────────────────────────────

def run_dify_extraction(text: str, source_name: str = "pipeline") -> list[dict[str, Any]]:
    """Run Dify regulation extraction with default client configuration."""
    client = DifyClient()
    return client.run_workflow_sync(text, source_name)


def run_dify_extraction_for_stage(
    text: str, stage: str, source_name: str = "pipeline"
) -> list[dict[str, Any]]:
    """Run Dify extraction for a specific KG construction stage.

    Args:
        text: Input text to extract entities from.
        stage: One of subject_extraction, event_extraction,
               feature_extraction, regulation_linking.
        source_name: Source identifier for logging.

    Returns:
        List of parsed node/relationship dicts (Dify JSONL format).
    """
    client = DifyClient()
    return client.run_workflow_for_stage(text, stage, source_name)
