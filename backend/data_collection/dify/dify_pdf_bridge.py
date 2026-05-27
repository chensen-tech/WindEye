"""PDF-Dify Bridge — orchestrates PDF → text extraction → Dify entity extraction.

Pipeline:
  1. Extract text from PDF via parse_pdf_hybrid() (PyMuPDF + OCR fallback)
  2. Split text into chunks by Chinese legal article structure (第X章 / 第X条)
  3. Call Dify Workflow API for entity extraction on each chunk
  4. Merge and deduplicate results across chunks

Typical usage:
    from data_collection.dify import process_pdf_with_dify
    results = process_pdf_with_dify("/path/to/regulation.pdf")
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from .dify_client import DifyClient

logger = logging.getLogger(__name__)

# ── Chunking patterns (mirrors Dify workflow node 17585314932320) ──────

_LEADING_NUMBER_RE = re.compile(r"^[\d\-]+\s*")
_CHAPTER_RE = re.compile(r"(第[一二三四五六七八九十百千]+章\s*[^\n]*)")
_SECTION_RE = re.compile(r"(第[一二三四五六七八九十百千]+条\s*[^\n]*)")

MAX_CHUNKS = 100
MAX_CHUNK_CHARS = 15000  # Dify text input limit


def chunk_regulation_text(text: str) -> list[str]:
    """Split a Chinese regulation document into structured chunks by chapter/article.

    Replicates the chunking logic from the Dify workflow's '文本分块' code node.
    Each chunk is formatted as:
        文档：{title}
        章节：{chapter}
        条款：{article}
        内容：{body}
    """
    if not text or not text.strip():
        return []

    text = _LEADING_NUMBER_RE.sub("", text.strip())

    lines = text.split("\n")
    title = lines[0].strip() if lines else "未知文档"
    body_text = "\n".join(lines[1:]) if len(lines) > 1 else text

    # Detect chapter boundaries
    chapter_matches = list(_CHAPTER_RE.finditer(body_text))

    blocks: list[str] = []

    if chapter_matches:
        # Extract per-chapter blocks
        for i, match in enumerate(chapter_matches):
            chapter_title = match.group(1).strip()
            start = match.end()
            end = chapter_matches[i + 1].start() if i + 1 < len(chapter_matches) else len(body_text)
            chapter_body = body_text[start:end].strip()

            # Within each chapter, split by article (第X条)
            section_matches = list(_SECTION_RE.finditer(chapter_body))
            if section_matches:
                for j, sec_match in enumerate(section_matches):
                    section_title = sec_match.group(1).strip()
                    sec_start = sec_match.end()
                    sec_end = (
                        section_matches[j + 1].start()
                        if j + 1 < len(section_matches)
                        else len(chapter_body)
                    )
                    section_body = chapter_body[sec_start:sec_end].strip()
                    if section_body:
                        blocks.append(_format_block(title, chapter_title, section_title, section_body))
            else:
                # No section markers — use entire chapter as one block
                if chapter_body:
                    blocks.append(_format_block(title, chapter_title, "", chapter_body))
    else:
        # No chapter markers — split by article directly
        section_matches = list(_SECTION_RE.finditer(body_text))
        if section_matches:
            for i, match in enumerate(section_matches):
                section_title = match.group(1).strip()
                start = match.end()
                end = section_matches[i + 1].start() if i + 1 < len(section_matches) else len(body_text)
                section_body = body_text[start:end].strip()
                if section_body:
                    blocks.append(_format_block(title, "", section_title, section_body))
        else:
            # No structure at all — use whole text as one block (truncated)
            blocks.append(_format_block(title, "", "", body_text[:MAX_CHUNK_CHARS]))

    if len(blocks) > MAX_CHUNKS:
        logger.warning(
            f"Text chunked into {len(blocks)} blocks, truncating to {MAX_CHUNKS}"
        )
        blocks = blocks[:MAX_CHUNKS]

    logger.info(f"Chunked regulation text into {len(blocks)} blocks")
    return blocks


def _format_block(title: str, chapter: str, section: str, body: str) -> str:
    """Format a text block in the structure expected by the Dify LLM prompt."""
    parts = [f"文档：{title}"]
    if chapter:
        parts.append(f"章节：{chapter}")
    if section:
        parts.append(f"条款：{section}")
    # Truncate body to fit Dify input limits
    max_body = MAX_CHUNK_CHARS - sum(len(p) for p in parts) - 20
    body = body[:max_body] if len(body) > max_body else body
    parts.append(f"内容：{body}")
    return "\n".join(parts)


# ── Result deduplication ─────────────────────────────────────────────────

def _deduplicate_results(results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate nodes and edges across chunks.

    Nodes are deduplicated by (label, name) key.
    Edges are deduplicated by (start_label, start_name, end_label, end_name, label) key.
    """
    seen_nodes: dict[tuple[str, str], dict[str, Any]] = {}
    seen_edges: set[tuple[str, str, str, str, str]] = set()
    deduped: list[dict[str, Any]] = []

    for item in results:
        if item.get("type") == "node":
            labels = item.get("labels", [])
            props = item.get("properties", {})
            label = labels[0] if labels else "Unknown"
            name = props.get("name", "")
            key = (label, name)
            if key not in seen_nodes:
                seen_nodes[key] = item
                deduped.append(item)
        elif item.get("type") == "relationship":
            label = item.get("label", "")
            start = item.get("start", {})
            end = item.get("end", {})
            key = (
                (start.get("labels", [""]) or [""])[0],
                start.get("properties", {}).get("name", start.get("id", "")),
                (end.get("labels", [""]) or [""])[0],
                end.get("properties", {}).get("name", end.get("id", "")),
                label,
            )
            if key not in seen_edges:
                seen_edges.add(key)
                deduped.append(item)

    return deduped


# ── Public API ───────────────────────────────────────────────────────────

def process_pdf_with_dify(file_path: str) -> list[dict[str, Any]]:
    """Extract entities from a regulation PDF via Dify.

    Steps:
      1. Extract text via parse_pdf_hybrid() (handles OCR fallback).
      2. Chunk text by chapter/article structure.
      3. Run Dify extraction on each chunk.
      4. Merge and deduplicate results.

    Returns:
        List of node/relationship dicts in Dify JSONL format.
    """
    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return []

    from data_collection.file_import.pdf_parser import parse_pdf_hybrid

    text = parse_pdf_hybrid(file_path)
    if not text:
        logger.warning(f"No text extracted from {file_path}")
        return []

    source_name = os.path.basename(file_path)
    return process_text_with_dify(text, source_name)


def process_text_with_dify(text: str, source_name: str = "pipeline") -> list[dict[str, Any]]:
    """Extract entities from regulation text via Dify.

    Chunks the text by chapter/article structure before sending to Dify
    to stay within input size limits and improve extraction quality.
    """
    chunks = chunk_regulation_text(text)
    if not chunks:
        return []

    client = DifyClient()
    all_results: list[dict[str, Any]] = []

    for i, chunk in enumerate(chunks):
        logger.info(f"Processing chunk {i + 1}/{len(chunks)} for '{source_name}'")
        chunk_results = client.run_workflow_sync(chunk, f"{source_name}_chunk{i}")
        if chunk_results:
            all_results.extend(chunk_results)

    deduped = _deduplicate_results(all_results)
    node_count = sum(1 for r in deduped if r.get("type") == "node")
    edge_count = sum(1 for r in deduped if r.get("type") == "relationship")
    logger.info(
        f"Dify bridge complete for '{source_name}': "
        f"{node_count} nodes, {edge_count} edges (deduplicated from {len(all_results)} total)"
    )
    return deduped


def batch_process_with_dify(
    directory: str, glob_pattern: str = "*.pdf"
) -> list[dict[str, Any]]:
    """Process all matching files in a directory through the Dify pipeline.

    Args:
        directory: Path to directory containing PDF files.
        glob_pattern: File pattern to match (default: *.pdf).

    Returns:
        Merged and deduplicated results from all files.
    """
    import fnmatch

    if not os.path.isdir(directory):
        logger.error(f"Directory not found: {directory}")
        return []

    all_results: list[dict[str, Any]] = []
    files = sorted(
        f for f in os.listdir(directory)
        if fnmatch.fnmatch(f.lower(), glob_pattern.lower()) and os.path.isfile(os.path.join(directory, f))
    )

    for filename in files:
        file_path = os.path.join(directory, filename)
        logger.info(f"Processing {file_path}")
        results = process_pdf_with_dify(file_path)
        all_results.extend(results)

    deduped = _deduplicate_results(all_results)
    logger.info(
        f"Batch Dify processing complete: {len(files)} files, "
        f"{len(deduped)} unique results"
    )
    return deduped


def dify_results_to_jsonl(results: list[dict[str, Any]]) -> str:
    """Convert Dify extraction results to a JSONL string for storage or import."""
    return "\n".join(json.dumps(r, ensure_ascii=False) for r in results)
