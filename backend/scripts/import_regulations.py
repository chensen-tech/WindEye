"""Standalone Regulation Document Import Script.

Imports regulation PDFs into the Neo4j knowledge graph via the Dify entity extraction
workflow. Supports three input modes:
  - Directory: batch-process all PDFs in a source directory
  - Single file: process one PDF
  - JSONL: import pre-extracted Dify JSONL output directly

Usage:
    python -m scripts.import_regulations --source regulation_docs
    python -m scripts.import_regulations --file D:/pdfs/regulation.pdf
    python -m scripts.import_regulations --jsonl output.jsonl
    python -m scripts.import_regulations --source regulation_docs --dry-run
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("import_regulations")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import regulation PDFs into Neo4j via Dify entity extraction"
    )
    parser.add_argument(
        "--source",
        default=None,
        help="Data source key from pipeline_config (e.g. 'regulation_docs')",
    )
    parser.add_argument(
        "--file",
        default=None,
        help="Single PDF file path to import",
    )
    parser.add_argument(
        "--jsonl",
        default=None,
        help="Pre-extracted Dify JSONL file to import directly (skip Dify call)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Write Cypher to file instead of importing into Neo4j",
    )
    parser.add_argument(
        "--output",
        default="./output",
        help="Output directory for Cypher files (with --dry-run)",
    )
    args = parser.parse_args()

    if not args.source and not args.file and not args.jsonl:
        parser.error("One of --source, --file, or --jsonl is required")

    # ── Resolve input ──────────────────────────────────────────────────
    results: list[dict] = []
    source_name = "import"

    if args.jsonl:
        logger.info(f"Loading pre-extracted JSONL from {args.jsonl}")
        import json
        with open(args.jsonl, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        results.append(json.loads(line))
                    except json.JSONDecodeError:
                        logger.warning(f"Skipping invalid JSONL line: {line[:80]}")
        source_name = os.path.basename(args.jsonl)

    elif args.file:
        from data_collection.dify.dify_pdf_bridge import process_pdf_with_dify
        logger.info(f"Processing single file: {args.file}")
        results = process_pdf_with_dify(args.file)
        source_name = os.path.basename(args.file)

    elif args.source:
        from kg_construction.etl.pipeline_config import DATA_SOURCE_CONFIGS, get_source_dir
        if args.source not in DATA_SOURCE_CONFIGS:
            available = list(DATA_SOURCE_CONFIGS.keys())
            logger.error(f"Unknown source '{args.source}'. Available: {available}")
            sys.exit(1)

        cfg = DATA_SOURCE_CONFIGS[args.source]
        source_dir = get_source_dir(args.source)
        logger.info(f"Processing source '{args.source}' from {source_dir}")

        if not os.path.isdir(source_dir):
            os.makedirs(source_dir, exist_ok=True)
            logger.warning(f"Source directory created (was empty): {source_dir}")
            sys.exit(0)

        from data_collection.dify.dify_pdf_bridge import batch_process_with_dify
        results = batch_process_with_dify(source_dir, cfg.get("input_glob", "*.pdf"))
        source_name = args.source

    if not results:
        logger.info("No entities extracted — nothing to import.")
        return

    node_count = sum(1 for r in results if r.get("type") == "node")
    edge_count = sum(1 for r in results if r.get("type") == "relationship")
    logger.info(f"Extracted {node_count} nodes and {edge_count} relationships")

    # ── Generate Cypher ────────────────────────────────────────────────
    from data_collection.dify.dify_pdf_bridge import dify_results_to_jsonl
    from kg_construction.etl.cypher_generator import generate_cypher_from_dify_jsonl

    jsonl_str = dify_results_to_jsonl(results)
    layer = "Regulation"
    if args.source:
        from kg_construction.etl.pipeline_config import DATA_SOURCE_CONFIGS
        layer = DATA_SOURCE_CONFIGS.get(args.source, {}).get("layer", "Regulation")

    statements = generate_cypher_from_dify_jsonl(jsonl_str, source_name, layer)
    logger.info(f"Generated {len(statements)} Cypher statements")

    if args.dry_run:
        os.makedirs(args.output, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        out_path = os.path.join(args.output, f"dify_import_{source_name}_{ts}.cypher")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("// Generated by import_regulations.py\n")
            f.write(f"// Source: {source_name}\n")
            f.write(f"// Date: {datetime.now(timezone.utc).isoformat()}\n")
            f.write(f"// Nodes: {node_count}, Edges: {edge_count}\n")
            f.write("// Statements: {len(statements)}\n\n")
            f.write("\n".join(statements))
        logger.info(f"Cypher written to {out_path}")
        return

    # ── Import into Neo4j ──────────────────────────────────────────────
    try:
        from core.database import Neo4jClient
        client = Neo4jClient.from_env()
    except Exception as e:
        logger.error(f"Failed to connect to Neo4j: {e}")
        logger.info("Falling back to file output...")
        os.makedirs(args.output, exist_ok=True)
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        out_path = os.path.join(args.output, f"dify_import_{source_name}_{ts}.cypher")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(statements))
        logger.info(f"Cypher written to {out_path} (Neo4j was unavailable)")
        sys.exit(1)

    executed = 0
    errors = []
    for i, stmt in enumerate(statements):
        if not stmt or not stmt.strip():
            continue
        try:
            client.execute_read(stmt, timeout_seconds=15.0)
            executed += 1
        except Exception as e:
            errors.append(str(e)[:200])
            if len(errors) <= 3:
                logger.warning(f"Statement {i + 1} failed: {e}")

        if (i + 1) % 50 == 0:
            logger.info(f"Progress: {i + 1}/{len(statements)} statements executed")

    logger.info(
        f"Import complete: {executed}/{len(statements)} statements executed, "
        f"{len(errors)} errors, {node_count} nodes, {edge_count} edges"
    )

    if errors:
        logger.warning(f"First 5 errors: {errors[:5]}")


if __name__ == "__main__":
    main()
