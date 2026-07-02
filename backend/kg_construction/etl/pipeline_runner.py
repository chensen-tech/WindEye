"""Pipeline Runner — executes ETL stages sequentially with error handling."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)


@dataclass
class PipelineRun:
    """Tracks the state of a single pipeline execution."""
    run_id: str
    source: str
    stage: str = ""
    status: str = "pending"  # pending | running | completed | failed | skipped
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    records_processed: int = 0
    records_created: int = 0
    errors: list[str] = field(default_factory=list)
    stats: dict[str, Any] = field(default_factory=dict)


class PipelineRunner:
    """Executes ETL stages for a given data source."""

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self._handlers: dict[str, Callable] = {}
        self._runs: list[PipelineRun] = []

    # ── Stage registration ─────────────────────────────────────────

    def register_handler(self, stage: str, handler: Callable) -> None:
        """Register a handler function for a pipeline stage.

        Handler signature: handler(source: str, run: PipelineRun) -> PipelineRun
        """
        self._handlers[stage] = handler

    # ── Execution ──────────────────────────────────────────────────

    def run(
        self,
        source: str,
        start_stage: Optional[str] = None,
        end_stage: Optional[str] = None,
    ) -> list[PipelineRun]:
        """Execute pipeline stages for a data source.

        Args:
            source: Data source key (e.g. 'cninfo_announcements').
            start_stage: Stage to start from (default: first stage).
            end_stage: Stage to end at (default: last stage).

        Returns:
            List of PipelineRun objects, one per stage executed.
        """
        stages = self.config.get("stages", [])
        max_retries = self.config.get("max_retries_per_stage", 3)

        if start_stage and start_stage in stages:
            stages = stages[stages.index(start_stage):]
        if end_stage and end_stage in stages:
            stages = stages[:stages.index(end_stage) + 1]

        runs: list[PipelineRun] = []
        run_id = f"run_{source}_{int(time.time() * 1000)}"
        # Carry forward state between stages
        _carry: dict[str, Any] = {}

        for stage in stages:
            run = PipelineRun(run_id=run_id, source=source, stage=stage)
            # Carry forward _records and _entities from the previous stage
            for key in ("_records", "_entities"):
                if key in _carry:
                    run.stats[key] = _carry[key]
            runs.append(run)

            if stage not in self._handlers:
                run.status = "skipped"
                run.errors.append(f"No handler registered for stage '{stage}'")
                continue

            logger.info(f"[{source}] Starting stage: {stage}")
            run.status = "running"
            run.started_at = datetime.now(timezone.utc).isoformat()

            for attempt in range(1, max_retries + 1):
                try:
                    result = self._handlers[stage](source, run)
                    run.status = "completed"
                    run.records_processed = result.records_processed
                    run.records_created = result.records_created
                    run.stats = result.stats
                    # Carry forward _records and _entities to the next stage
                    for key in ("_records", "_entities"):
                        if key in result.stats:
                            _carry[key] = result.stats[key]
                    break
                except Exception as e:
                    logger.warning(f"[{source}:{stage}] Attempt {attempt}/{max_retries} failed: {e}")
                    run.errors.append(str(e))
                    if attempt >= max_retries:
                        run.status = "failed"
                        logger.error(f"[{source}:{stage}] All {max_retries} attempts failed.")
                        break
                    # Exponential backoff
                    time.sleep(min(2 ** (attempt - 1), 30))

            run.completed_at = datetime.now(timezone.utc).isoformat()
            logger.info(f"[{source}] Stage {stage}: {run.status} ({run.records_processed} records)")

            if run.status == "failed":
                break

        self._runs.extend(runs)
        return runs

    # ── Pre-built stage handlers ───────────────────────────────────

    def make_crawl_handler(self) -> Callable:
        """Create a handler for the 'crawl' stage."""
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            source_config = self.config.get("sources", {}).get(source, {})
            scraper_name = source_config.get("scraper", "")
            if not scraper_name:
                raise ValueError(f"No scraper configured for source '{source}'")

            module_path = f"backend.data_collection.scrapers.{scraper_name}"
            try:
                import importlib
                mod = importlib.import_module(module_path)
                if hasattr(mod, "main"):
                    mod.main()
                run.records_processed = 0
                run.stats["scraper"] = scraper_name
            except Exception as e:
                raise RuntimeError(f"Crawl failed for {source}: {e}") from e
            return run
        return handler

    def make_parse_handler(self) -> Callable:
        """Create a handler for the 'parse' stage.

        Reads files from the scraper data directory (data_collection/scrapers/data/...).
        Raw files are kept until the import stage successfully writes to Neo4j.
        """
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            import os
            from kg_construction.etl.pipeline_config import get_source_dir, DATA_SOURCE_CONFIGS

            source_config = DATA_SOURCE_CONFIGS.get(source, {})
            source_dir = get_source_dir(source)
            glob_pattern = source_config.get("input_glob", "*.*")
            category = source_config.get("category", "")

            if not os.path.isdir(source_dir):
                raise FileNotFoundError(f"Source directory not found: {source_dir}")

            records = []
            processed_files = []

            if "pdf" in glob_pattern.lower():
                from data_collection.file_import.pdf_parser import parse_pdf_hybrid
                for f in sorted(os.listdir(source_dir)):
                    fpath = os.path.join(source_dir, f)
                    if f.lower().endswith(".pdf") and os.path.isfile(fpath):
                        text = parse_pdf_hybrid(fpath)
                        if text:
                            records.append({"file": f, "text": text})
                        processed_files.append(fpath)
            elif "txt" in glob_pattern.lower():
                if category == "风险舆情":
                    from data_collection.file_import.news_processor import process_news_file
                    for f in sorted(os.listdir(source_dir)):
                        fpath = os.path.join(source_dir, f)
                        if f.endswith(".txt") and os.path.isfile(fpath):
                            article = process_news_file(fpath)
                            if article:
                                records.append(article)
                            processed_files.append(fpath)
                else:
                    for f in sorted(os.listdir(source_dir)):
                        fpath = os.path.join(source_dir, f)
                        if f.endswith(".txt") and os.path.isfile(fpath):
                            with open(fpath, "r", encoding="utf-8") as fh:
                                text = fh.read()
                            if text:
                                records.append({"file": f, "text": text})
                            processed_files.append(fpath)
            elif "jsonl" in glob_pattern.lower():
                from data_collection.file_import.structured_parser import parse_jsonl_results
                for f in sorted(os.listdir(source_dir)):
                    fpath = os.path.join(source_dir, f)
                    if f.endswith(".jsonl") and os.path.isfile(fpath):
                        records.extend(parse_jsonl_results(fpath))
                        processed_files.append(fpath)

            run.records_processed = len(records)
            run.stats["parsed_files"] = len(records)
            run.stats["processed_files"] = processed_files
            # Store parsed records for next stage
            run.stats["_records"] = records

            if not records:
                run.stats["warning"] = "No text extracted from files — check PDF parser dependencies (PyMuPDF, pytesseract)"

            return run
        return handler

    def make_extract_handler(self) -> Callable:
        """Create a handler for the 'extract' stage — local subject extraction."""
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            records = run.stats.pop("_records", [])
            if not records:
                raise ValueError("No parsed records available. Run 'parse' stage first.")

            from kg_construction.extraction.subject_extractor import extract_and_align_subjects

            texts = [
                {"file": rec.get("file", ""), "text": rec.get("text", "")}
                for rec in records
                if rec.get("text")
            ]
            logger.info("Local subject extraction from %s parsed records", len(texts))
            result = extract_and_align_subjects(texts)
            all_entities = result["subjects"]

            run.records_processed = len(records)
            run.records_created = len(all_entities)
            run.stats["_entities"] = all_entities
            run.stats["entities"] = all_entities
            run.stats["subject_stats"] = result["stats"]
            run.stats["extraction_method"] = "local_subject"
            run.stats["extraction_stage"] = "subject_extraction"
            return run
        return handler

    def make_import_handler(self) -> Callable:
        """Create a handler for the 'import' stage — writes entities to Neo4j."""
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            entities = run.stats.pop("_entities", [])
            if not entities:
                raise ValueError("No entities available. Run 'extract' stage first.")

            from kg_construction.etl.cypher_generator import (
                batch_generate_cypher,
                generate_cypher_from_dify_jsonl,
            )
            from data_collection.dify.dify_pdf_bridge import dify_results_to_jsonl

            source_config = self.config.get("sources", {}).get(source, {})
            layer = source_config.get("layer", "Subject")
            extraction_method = run.stats.get("extraction_method", "ner")

            if extraction_method == "dify":
                # Dify output format: batches of {source_file, dify_output: [...]}
                all_statements: list[str] = []
                for batch in entities:
                    dify_output = batch.get("dify_output", [])
                    source_file = batch.get("source_file", "")
                    if not dify_output:
                        continue
                    jsonl_str = dify_results_to_jsonl(dify_output)
                    statements = generate_cypher_from_dify_jsonl(jsonl_str, source_file, layer)
                    all_statements.extend(statements)
                statements = all_statements
            else:
                statements = batch_generate_cypher(entities, layer=layer)

            if not statements:
                run.records_created = 0
                return run

            # Write to Neo4j
            try:
                from core.database import Neo4jClient
                client = Neo4jClient.from_env()
                total_created = 0
                total_errors = 0
                for stmt in statements:
                    if not stmt or not stmt.strip():
                        continue
                    try:
                        client.execute_read(stmt, timeout_seconds=10.0)
                        total_created += 1
                    except Exception as e:
                        total_errors += 1
                        if total_errors <= 3:
                            logger.warning(f"Statement failed: {e}")
                            run.errors.append(str(e)[:200])
                run.records_created = total_created
                if total_errors:
                    run.stats["import_errors"] = total_errors
            except Exception as e:
                import os as _os
                output_dir = self.config.get("data_dir", ".")
                cypher_file = _os.path.join(output_dir, f"import_{source}.cypher")
                with open(cypher_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(statements))
                run.stats["cypher_file"] = cypher_file
                run.errors.append(f"Neo4j not available, wrote Cypher to {cypher_file}")
            return run
        return handler

    def make_index_handler(self) -> Callable:
        """Create a handler for the 'index' stage."""
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            try:
                from kg_construction.index_manager.index_manager import IndexManager
                manager = IndexManager()
                manager.ensure_indexes()
                run.records_processed = 1
                run.stats["indexes"] = "rebuilt"
            except Exception as e:
                raise RuntimeError(f"Index rebuild failed: {e}") from e
            return run
        return handler

    # ── Dify-based handlers (stage-aware) ─────────────────────────────

    def make_dify_extract_handler(self, stage: str = "regulation_linking") -> Callable:
        """Create a handler for Dify-based extraction for a specific stage.

        Args:
            stage: One of subject_extraction, event_extraction,
                   feature_extraction, regulation_linking.

        Calls the Dify workflow API for the given stage instead of local NER.
        Expects _records from the parse stage containing {file, text} dicts.
        """
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            records = run.stats.pop("_records", [])
            if not records:
                raise ValueError("No parsed records available. Run 'parse' stage first.")

            from data_collection.dify.dify_client import DifyClient

            client = DifyClient()
            all_entities: list[dict[str, Any]] = []
            for rec in records:
                text = rec.get("text", "")
                filename = rec.get("file", "")
                if not text:
                    continue
                logger.info(
                    "Dify stage=%s extracting from '%s' (%s chars)",
                    stage, filename, len(text),
                )
                dify_result = client.run_workflow_for_stage(text, stage, filename)
                all_entities.append({
                    "source_file": filename,
                    "dify_output": dify_result,
                })

            run.records_processed = len(records)
            run.records_created = len(all_entities)
            run.stats["_entities"] = all_entities
            run.stats["extraction_method"] = "dify"
            run.stats["extraction_stage"] = stage
            return run
        return handler

    def make_dify_import_handler(self) -> Callable:
        """Create a handler for the 'import' stage using Dify JSONL output.

        Calls generate_cypher_from_dify_jsonl() to convert Dify workflow output
        to Cypher MERGE statements, then writes to Neo4j.
        """
        def handler(source: str, run: PipelineRun) -> PipelineRun:
            entities = run.stats.pop("_entities", [])
            if not entities:
                raise ValueError("No Dify-extracted entities. Run 'extract' stage first.")

            from kg_construction.etl.cypher_generator import generate_cypher_from_dify_jsonl
            from data_collection.dify.dify_pdf_bridge import dify_results_to_jsonl

            source_config = self.config.get("sources", {}).get(source, {})
            layer = source_config.get("layer", "Regulation")

            all_statements: list[str] = []
            for batch in entities:
                dify_output = batch.get("dify_output", [])
                source_file = batch.get("source_file", "")
                if not dify_output:
                    continue
                jsonl_str = dify_results_to_jsonl(dify_output)
                statements = generate_cypher_from_dify_jsonl(jsonl_str, source_file, layer)
                all_statements.extend(statements)

            if not all_statements:
                run.records_created = 0
                run.stats["warning"] = "No Cypher statements generated from Dify output"
                return run

            try:
                from core.database import Neo4jClient
                client = Neo4jClient.from_env()
                total_created = 0
                total_errors = 0
                for stmt in all_statements:
                    if not stmt or not stmt.strip():
                        continue
                    try:
                        client.execute_read(stmt, timeout_seconds=10.0)
                        total_created += 1
                    except Exception as e:
                        total_errors += 1
                        if total_errors <= 3:
                            logger.warning(f"Dify import statement failed: {e}")
                            run.errors.append(str(e)[:200])
                run.records_created = total_created
                run.stats["total_statements"] = len(all_statements)
                if total_errors:
                    run.stats["import_errors"] = total_errors
            except Exception as e:
                import os as _os
                output_dir = self.config.get("data_dir", ".")
                cypher_file = _os.path.join(output_dir, f"dify_import_{source}.cypher")
                with open(cypher_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(all_statements))
                run.stats["cypher_file"] = cypher_file
                run.errors.append(f"Neo4j not available, wrote Cypher to {cypher_file}")
            return run
        return handler
