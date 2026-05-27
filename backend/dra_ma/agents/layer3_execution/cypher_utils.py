"""Cypher generation helpers, LLM client, and Neo4j execution utilities.

Shared by layer2 (compiler), layer3 (healer), and layer4 (aggregator/verifier).
"""
import json
import logging
import re
import os
import httpx
import difflib
from collections import OrderedDict
from datetime import datetime, timedelta
from typing import List, Dict, Any

from core.database import Neo4jClient
from kg_construction.ontology.ontology_registry import OntologyRegistry

logger = logging.getLogger(__name__)

db_client = Neo4jClient.from_env()

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-chat")

# ── Cypher execution result cache (Opt 2) ──
_cypher_cache: OrderedDict = OrderedDict()
_CACHE_MAX_SIZE = 512
_CACHE_TTL_SECONDS = 300  # 5-minute TTL, safe for read-only eval KGs

async def call_llm(system: str, user: str, temperature: float = 0.1, response_format: dict = None) -> str:
    """Async wrapper for LLM completions."""
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        "temperature": temperature
    }
    if response_format:
        payload["response_format"] = response_format

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{LLM_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {LLM_API_KEY}"},
                json=payload
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        return ""


def auto_fix_simple_errors(cypher: str) -> str:
    """Fix common syntax errors in Cypher and apply high-confidence lexical spelling correction."""
    cypher = cypher.replace("->", "-").replace("<-", "-")

    node_label = OntologyRegistry.get_node_label()
    if node_label:
        cypher = re.sub(r":Movie|:Person", f":{node_label}", cypher)
    match_strategy = OntologyRegistry.get_entity_matching_strategy()
    prop_key = match_strategy.get("property_key", "name")
    cypher = re.sub(r"\.title", f".{prop_key}", cypher)

    valid_rels = OntologyRegistry.get_valid_relations()
    excluded_labels = {"Movie", "Person", "Director", "Actor", "Genre", "Year", "Language", "Target"}
    if node_label:
        excluded_labels.add(node_label)

    if valid_rels:
        def replace_rel(match):
            rel = match.group(1)
            if rel in excluded_labels or rel in valid_rels:
                return f":{rel}"
            parts = rel.split('|')
            corrected_parts = []
            for p in parts:
                if p and p not in valid_rels:
                    close_matches = difflib.get_close_matches(p, valid_rels, n=1, cutoff=0.8)
                    if close_matches:
                        corrected_parts.append(close_matches[0])
                        logger.info(f"[cypher_utils] difflib auto-correction: '{p}' -> '{close_matches[0]}'")
                    else:
                        corrected_parts.append(p)
                else:
                    corrected_parts.append(p)
            return f":{'|'.join(corrected_parts)}"

        cypher = re.sub(r':([a-zA-Z_0-9|]+)', replace_rel, cypher)

    return cypher


def extract_cypher_from_text(text: str) -> str:
    """Extract Cypher queries enclosed in markdown code blocks or plain text."""
    code_match = re.search(r"```(?:cypher)?\s*\n?(.*?)```", text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    match_return = re.search(r"(MATCH\s.*?RETURN\s.*?)(?:\n\n|$)", text, re.DOTALL | re.IGNORECASE)
    if match_return:
        return match_return.group(1).strip()
    return text.strip()


def path_to_cypher(path: str, expected_type: str = "") -> str:
    """Convert natural language path string to distinct Cypher with MetaQA backtracking constraints."""
    parts = re.split(r"[-→>|]", path)
    parts = [p.strip() for p in parts if p.strip()]

    node_label = OntologyRegistry.get_node_label()
    label_str = f":{node_label}" if node_label else ""
    match_strategy = OntologyRegistry.get_entity_matching_strategy()
    prop_key = match_strategy.get("property_key", "name")

    if len(parts) < 3:
        if len(parts) >= 1:
            start_entity = parts[0].replace("'", "\\'")
            return f"MATCH (n0{label_str} {{{prop_key}: '{start_entity}'}}) RETURN DISTINCT n0.{prop_key}"
        return ""

    entities = parts[::2]
    raw_relations = parts[1::2]
    relations = [r for r in raw_relations if r.lower() not in ["target", "node"]]

    start_entity = entities[0].replace("'", "\\'")

    is_directed = OntologyRegistry.get_config().get("directed_query_mode", False)

    match_clause = f"(n0{label_str} {{{prop_key}: '{start_entity}'}})"
    node_idx = 0
    for rel in relations:
        if " .. " in rel:
            sub_rels = rel.split(" .. ")
            for sub_rel in sub_rels:
                safe_rel = f"`{sub_rel}`"
                direction = "->" if is_directed else "-"
                node_idx += 1
                match_clause += f"-[:{safe_rel}]{direction}(n{node_idx})"
        else:
            safe_rel = f"`{rel}`"
            direction = "->" if is_directed else "-"
            node_idx += 1
            match_clause += f"-[:{safe_rel}]{direction}(n{node_idx})"

    where_clause = ""
    for i in range(2, node_idx + 1):
        if i == 2:
            where_clause = " WHERE n2 <> n0"
        else:
            where_clause += f" AND n{i} <> n{i-2}"

    # NOTE: type.object.type does NOT exist in WebQSP/MetaQA Neo4j databases.
    # Type filtering is handled post-hoc by AggregatorAgent.llm_post_filter with
    # the Semantic Anchor (Expected_Answer_Type) from Layer 1.
    # Keeping this block disabled to avoid wasted queries and DB warnings.
    # if dataset_name == "WebQSP" and expected_type and expected_type.lower() not in ["none", "unknown", "any", ""]:
    #     match_clause += f", (n{node_idx})-[:`type.object.type`]-(t_type:Entity)"
    #     if where_clause:
    #         where_clause += f" AND toLower(t_type.{prop_key}) CONTAINS '{expected_type.lower()}'"
    #     else:
    #         where_clause = f" WHERE toLower(t_type.{prop_key}) CONTAINS '{expected_type.lower()}'"

    return f"MATCH {match_clause}{where_clause} RETURN DISTINCT n{node_idx}.{prop_key}"


def execute_cypher_and_extract(cypher: str) -> List[str]:
    """Execute Cypher on Neo4j database and extract list of string names.

    Results are cached with LRU eviction and TTL expiry to avoid repeated
    Neo4j queries for identical Cypher during beam search.
    """
    normalized = cypher.strip()

    # Check cache
    if normalized in _cypher_cache:
        cached_results, timestamp = _cypher_cache[normalized]
        if (datetime.now() - timestamp).total_seconds() < _CACHE_TTL_SECONDS:
            _cypher_cache.move_to_end(normalized)
            return cached_results
        else:
            del _cypher_cache[normalized]

    # Execute
    cypher_fixed = auto_fix_simple_errors(normalized)
    try:
        results = db_client.execute_read(cypher_fixed)
        names = set()
        if results:
            for row in results:
                for val in row.values():
                    if val:
                        if isinstance(val, list):
                            for v in val:
                                names.add(str(v))
                        else:
                            names.add(str(val))
        sorted_names = sorted(list(names))

        # Store in cache with LRU eviction
        if len(_cypher_cache) >= _CACHE_MAX_SIZE:
            _cypher_cache.popitem(last=False)
        _cypher_cache[normalized] = (sorted_names, datetime.now())

        return sorted_names
    except Exception as e:
        logger.error(f"Execution failed for Cypher {cypher}: {e}")
        raise e


def template_cypher(cypher: str, entity: str) -> str:
    """Mask the starting entity name in a Cypher query with '[ENTITY]' for pattern caching."""
    if not entity:
        return cypher
    templated = cypher.replace(f"'{entity}'", "'[ENTITY]'").replace(f'"{entity}"', '"[ENTITY]"')
    escaped_entity = entity.replace("'", "\\'")
    templated = templated.replace(f"'{escaped_entity}'", "'[ENTITY]'")
    return templated


def detemplate_cypher(template: str, entity: str) -> str:
    """Restore the starting entity name from '[ENTITY]' in a Cypher query template."""
    if not entity:
        return template
    return template.replace("[ENTITY]", entity)


def has_schema_relation_spelling_error(cypher: str) -> bool:
    """Check if the Cypher statement contains any misspelled relation types."""
    valid_rels = OntologyRegistry.get_valid_relations()
    if not valid_rels:
        return False

    node_label = OntologyRegistry.get_node_label()
    excluded_labels = {"Movie", "Person", "Director", "Actor", "Genre", "Year", "Language", "Target"}
    if node_label:
        excluded_labels.add(node_label)

    matches = re.findall(r':([a-zA-Z_0-9]+)', cypher)
    for m in matches:
        if m in excluded_labels:
            continue
        parts = m.split('|')
        for p in parts:
            if p and p not in valid_rels:
                logger.info(f"[cypher_utils] Schema relation spelling error detected: '{p}' not in schema.")
                return True
    return False
