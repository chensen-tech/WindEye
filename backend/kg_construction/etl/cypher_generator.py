"""Cypher Generator — converts extracted entities/relations to Neo4j CREATE/MERGE statements.

Generates per-layer Cypher statements:
- Subject layer: Company, Person, Institution
- Event layer: Investment, Litigation, Penalty, NewsEvent
- Feature layer: RiskFeature, RiskPattern
- Regulation layer: Regulation, Policy, Action

Uses MERGE to avoid duplicates and ON CREATE SET for initial properties.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# ── Layer-to-label mappings ───────────────────────────────────────────

LAYER_LABEL_MAP: dict[str, list[str]] = {
    "Subject": [
        "Subject", "COMPANY", "BANK", "PERSON", "LEGAL_REP", "DIRECTOR",
        "SUPERVISOR", "EXECUTIVE", "PFCOMPANY", "PFUND", "SECURITY",
        "REGULATOR", "EXCHANGE", "Actor", "Account", "PLATFORM", "AI_PROVIDER",
    ],
    "Event": ["Investment", "Litigation", "Penalty", "NewsEvent", "Event", "Action"],
    "Feature": ["RiskFeature", "RiskPattern"],
    "Regulation": ["Regulation", "Policy", "Action", "Chapter", "Section"],
}

ENTITY_TYPE_TO_LABEL: dict[str, str] = {
    "COMPANY": "COMPANY",
    "BANK": "BANK",
    "PERSON": "PERSON",
    "LEGAL_REP": "LEGAL_REP",
    "DIRECTOR": "DIRECTOR",
    "SUPERVISOR": "SUPERVISOR",
    "EXECUTIVE": "EXECUTIVE",
    "PFCOMPANY": "PFCOMPANY",
    "PFUND": "PFUND",
    "SECURITY": "SECURITY",
    "REGULATOR": "REGULATOR",
    "EXCHANGE": "EXCHANGE",
    "INSTITUTION": "Institution",
    "REGULATION": "Regulation",
    "POLICY": "Policy",
    "EVENT": "Event",
    "NEWS_EVENT": "NewsEvent",
    "LITIGATION": "Litigation",
    "PENALTY": "Penalty",
    "RISK_FEATURE": "RiskFeature",
    "AMOUNT": "Amount",
    "DATE": "Date",
    "CASE_NUMBER": "CaseNumber",
    "LOCATION": "Location",
}

# ── Dify entity/relation type mappings ─────────────────────────────────

DIFY_ENTITY_TO_LABEL: dict[str, str] = {
    "PartyWithResponsibility": "Company",
    "RegulatoryAuthority": "Institution",
    "Action": "Event",
    "Responsibility": "RiskFeature",
    "Restriction": "RiskFeature",
    "Law": "Regulation",
    "Title": "Regulation",
    "Chapter": "Chapter",
    "Section": "Section",
}

DIFY_ENTITY_TO_LAYER: dict[str, str] = {
    "PartyWithResponsibility": "Event",
    "RegulatoryAuthority": "Event",
    "Action": "Event",
    "Responsibility": "Feature",
    "Restriction": "Feature",
    "Law": "Regulation",
    "Title": "Regulation",
    "Chapter": "Regulation",
    "Section": "Regulation",
}

DIFY_RELATION_MAP: dict[str, str] = {
    "包含": "CONTAINS",
    "包含责任方": "HAS_RESPONSIBLE_PARTY",
    "包含监管机构": "HAS_REGULATOR",
    "依据": "BASED_ON",
    "履行": "FULFILLS",
    "执行": "EXECUTES",
    "受限于": "SUBJECT_TO",
    "监管": "REGULATES",
    "依照": "IN_ACCORDANCE_WITH",
    "参与": "PARTICIPATE_IN",
    "任职": "HOLDS_POSITION",
    "发生于": "OCCURRED_AT",
    "触发": "TRIGGERS",
    "构成": "CONSTITUTES",
    "映射法规": "MAPS_TO_REGULATION",
}

# ── Safe property name ────────────────────────────────────────────────

def _safe_prop_name(name: str) -> str:
    """Sanitize a string for use as a Cypher property key."""
    return re.sub(r"[^a-zA-Z0-9_]", "_", name).strip("_") or "prop"


def _escape_cypher_string(value: str) -> str:
    """Escape a string value for safe Cypher embedding."""
    return value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def _safe_label_name(name: str) -> str:
    """Sanitize a label while keeping common KG labels readable."""
    cleaned = re.sub(r"[^0-9A-Za-z_\u4e00-\u9fff]", "_", str(name or "Entity")).strip("_")
    if not cleaned:
        return "Entity"
    if cleaned[0].isdigit():
        cleaned = f"N_{cleaned}"
    return cleaned


def _safe_rel_type(name: str) -> str:
    """Convert a Dify relation label into a Neo4j relationship type."""
    mapped = DIFY_RELATION_MAP.get(str(name or ""), str(name or "RELATED_TO"))
    cleaned = re.sub(r"[^0-9A-Za-z_]", "_", mapped.upper()).strip("_")
    if not cleaned:
        return "RELATED_TO"
    if cleaned[0].isdigit():
        cleaned = f"R_{cleaned}"
    return cleaned


def _cypher_literal(value: Any) -> str:
    """Serialize a Python value into a simple Cypher literal."""
    if value is None:
        return '""'
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        value = json.dumps(value, ensure_ascii=False)
    return f'"{_escape_cypher_string(str(value))}"'


def _first_scalar(props: dict[str, Any], keys: list[str]) -> str:
    for key in keys:
        value = props.get(key)
        if isinstance(value, (str, int, float)) and str(value).strip():
            return str(value)
    return ""


def _node_name_from_props(props: dict[str, Any], fallback_id: str = "") -> str:
    name = _first_scalar(props, [
        "name", "title", "text", "label",
        "COMPANY_NM", "PERSON_NM", "REGULATOR_NM",
        "EVENT_NM", "TIME_NM", "factor_nm", "feature_type",
        "law_name", "article", "content",
    ])
    if name:
        return name
    for key, value in props.items():
        if key.endswith("_NM") and isinstance(value, (str, int, float)) and str(value).strip():
            return str(value)
    return fallback_id


def _node_label(item_or_info: dict[str, Any], default: str = "Entity") -> str:
    labels = item_or_info.get("labels") or []
    if isinstance(labels, str):
        labels = [labels]
    label = labels[0] if labels else default
    return _safe_label_name(DIFY_ENTITY_TO_LABEL.get(label, label))


# ── Individual statement generators ───────────────────────────────────

def generate_cypher_for_entity(
    entity: dict[str, Any],
    layer: str = "Subject",
    id_field: str = "name",
) -> str:
    """Generate a MERGE statement for a single entity node.

    Args:
        entity: Dict with at least 'mention' or 'name' and 'type' keys.
        layer: Target KG layer (Subject, Event, Feature, Regulation).
        id_field: Property to use as the merge key.

    Returns:
        A Cypher MERGE statement string.
    """
    entity_type = entity.get("type", entity.get("entity_type", entity.get("entityType", "Unknown"))).upper()
    label = ENTITY_TYPE_TO_LABEL.get(entity_type, "Entity")
    name = entity.get("mention", entity.get("name", ""))
    if not name:
        return ""

    safe_name = _escape_cypher_string(name)

    # Internal metadata keys (linker/resolver bookkeeping, not entity properties)
    _meta_keys = {
        "mention", "name", "type", "entity_type", "entityType", "source_file",
        "confidence", "source", "aliases", "source_count", "source_entities",
        "properties", "matchedBy", "kgNodeId",
    }

    # Build properties
    props = []
    for key, value in entity.items():
        if key in _meta_keys:
            continue
        if value is not None and value != "":
            pname = _safe_prop_name(key)
            if isinstance(value, str):
                props.append(f'  n.{pname} = "{_escape_cypher_string(value)}"')
            elif isinstance(value, (int, float)):
                props.append(f"  n.{pname} = {value}")

    # Additional metadata
    source_file = entity.get("source_file", entity.get("source", "pipeline"))
    if isinstance(source_file, (list, dict)):
        source_file = "pipeline"
    props.append(f'  n.source = "{_escape_cypher_string(str(source_file))}"')
    confidence = entity.get("confidence", 0.5)
    if isinstance(confidence, (int, float)):
        pass  # use as-is
    else:
        confidence = 0.5
    props.append(f"  n.confidence = {confidence}")

    props_block = ",\n".join(props)  # comma-separated for Neo4j 5.x

    return f"""MERGE (n:{label} {{{id_field}: "{safe_name}"}})
ON CREATE SET
  {props_block},
  n.created_at = datetime()
ON MATCH SET
  n.last_seen = datetime(),
  n.confidence = CASE WHEN n.confidence < {confidence} THEN {confidence} ELSE n.confidence END;"""


def generate_cypher_for_relation(
    source: dict[str, Any],
    target: dict[str, Any],
    rel_type: str,
    layer: str = "Subject",
) -> str:
    """Generate a MERGE statement for a relationship between two entities.

    Args:
        source: Source entity dict (at least 'mention'/'name' and 'type').
        target: Target entity dict (at least 'mention'/'name' and 'type').
        rel_type: Relationship type (e.g. 'CONTROLS', 'INVESTS_IN').
        layer: Target KG layer.

    Returns:
        A Cypher MERGE statement string.
    """
    src_label = ENTITY_TYPE_TO_LABEL.get(source.get("type", "").upper(), "Entity")
    tgt_label = ENTITY_TYPE_TO_LABEL.get(target.get("type", "").upper(), "Entity")
    src_name = _escape_cypher_string(source.get("mention", source.get("name", "")))
    tgt_name = _escape_cypher_string(target.get("mention", target.get("name", "")))

    if not src_name or not tgt_name:
        return ""

    return f"""MATCH (a:{src_label} {{name: "{src_name}"}})
MATCH (b:{tgt_label} {{name: "{tgt_name}"}})
MERGE (a)-[r:{rel_type}]->(b)
ON CREATE SET r.created_at = datetime(), r.source = "pipeline"
ON MATCH SET r.last_seen = datetime();"""


# ── Batch generation ─────────────────────────────────────────────────

def batch_generate_cypher(
    entities: list[dict[str, Any]],
    relations: list[dict[str, Any]] | None = None,
    layer: str = "Subject",
) -> list[str]:
    """Generate a batch of Cypher statements from extracted entities and relations.

    Args:
        entities: List of entity dicts from NER.
        relations: Optional list of {source, target, type} relation dicts.
        layer: Target KG layer.

    Returns:
        List of Cypher statement strings.
    """
    statements: list[str] = []

    for entity in entities:
        stmt = generate_cypher_for_entity(entity, layer=layer)
        if stmt:
            statements.append(stmt)

    if relations:
        for rel in relations:
            stmt = generate_cypher_for_relation(
                rel.get("source", {}),
                rel.get("target", {}),
                rel.get("type", "RELATED_TO"),
                layer=layer,
            )
            if stmt:
                statements.append(stmt)

    return statements


# ── Dify JSONL to Cypher ──────────────────────────────────────────────

def generate_cypher_from_dify_jsonl(
    jsonl_str: str,
    source_file: str = "",
    layer: str = "Regulation",
) -> list[str]:
    """Generate Cypher statements from Dify workflow JSONL output.

    Parses the Dify workflow's 'output_triples' JSONL format — where each line is
    a JSON object with type "node" or "relationship" — and converts to MERGE
    statements for Neo4j import.

    Args:
        jsonl_str: The JSONL string output from the Dify workflow.
        source_file: Source filename for metadata tracking.
        layer: Default KG layer for nodes without explicit mapping.

    Returns:
        List of Cypher MERGE statement strings.
    """
    results: list[dict[str, Any]] = []
    for line in jsonl_str.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            if isinstance(obj, dict) and "type" in obj:
                results.append(obj)
        except json.JSONDecodeError:
            continue

    statements: list[str] = []
    node_ids: dict[str, dict[str, str]] = {}  # dify_id -> {label, name}

    # First pass: generate node statements
    for item in results:
        if item.get("type") != "node":
            continue

        props = item.get("properties", {}) or {}
        item_id = str(item.get("id", "") or "")
        neo4j_label = _node_label(item, "Entity")
        raw_label = (item.get("labels") or [neo4j_label])[0] if isinstance(item.get("labels") or [], list) else item.get("labels")
        name = _node_name_from_props(props, item_id)

        if not name:
            continue

        node_layer = DIFY_ENTITY_TO_LAYER.get(str(raw_label), layer)
        safe_name = _escape_cypher_string(name)
        safe_id = _escape_cypher_string(item_id or name)
        safe_source = _escape_cypher_string(str(source_file))

        # Build additional properties.
        extra_props = []
        for key, value in props.items():
            if value is None or value == "":
                continue
            pname = _safe_prop_name(key)
            extra_props.append(f"  n.{pname} = {_cypher_literal(value)}")

        props_block = ",\n".join(extra_props) if extra_props else ""
        if props_block:
            props_block = ",\n" + props_block

        stmt = (
            f"MERGE (n:{neo4j_label} {{kg_id: \"{safe_id}\"}})\n"
            f"ON CREATE SET\n"
            f"  n.name = \"{safe_name}\",\n"
            f"  n.source = \"{safe_source}\",\n"
            f"  n.extraction_method = \"dify\",\n"
            f"  n.layer = \"{node_layer}\",\n"
            f"  n.created_at = datetime(){props_block}\n"
            f"ON MATCH SET\n"
            f"  n.last_seen = datetime(),\n"
            f"  n.name = coalesce(n.name, \"{safe_name}\"),\n"
            f"  n.extraction_method = \"dify\",\n"
            f"  n.layer = coalesce(n.layer, \"{node_layer}\");\n"
        )
        statements.append(stmt)

        # Store for relationship resolution
        if item_id:
            node_ids[item_id] = {"label": neo4j_label, "name": name, "kg_id": item_id}

    # Second pass: generate relationship statements
    for item in results:
        if item.get("type") != "relationship":
            continue

        rel_label = item.get("label", "")
        neo4j_rel_type = _safe_rel_type(rel_label)

        start_info = item.get("start", {})
        end_info = item.get("end", {})

        # Resolve start/end nodes by ID, then by label+name
        start_id = str(start_info.get("id", "") or item.get("source", "") or item.get("source_id", ""))
        end_id = str(end_info.get("id", "") or item.get("target", "") or item.get("target_id", ""))

        if start_id in node_ids and end_id in node_ids:
            src_label = node_ids[start_id]["label"]
            src_name = _escape_cypher_string(node_ids[start_id]["name"])
            src_kg_id = _escape_cypher_string(node_ids[start_id]["kg_id"])
            tgt_label = node_ids[end_id]["label"]
            tgt_name = _escape_cypher_string(node_ids[end_id]["name"])
            tgt_kg_id = _escape_cypher_string(node_ids[end_id]["kg_id"])
        else:
            # Fall back to inline label/name from the relationship
            src_label = _node_label(start_info, "Entity")
            src_props = start_info.get("properties", {}) or {}
            src_name = _escape_cypher_string(_node_name_from_props(src_props, start_id))
            src_kg_id = _escape_cypher_string(start_id or src_name)
            tgt_label = _node_label(end_info, "Entity")
            tgt_props = end_info.get("properties", {}) or {}
            tgt_name = _escape_cypher_string(_node_name_from_props(tgt_props, end_id))
            tgt_kg_id = _escape_cypher_string(end_id or tgt_name)

        if not src_kg_id or not tgt_kg_id:
            continue

        safe_source = _escape_cypher_string(str(source_file))
        rel_props = []
        for key, value in (item.get("properties") or {}).items():
            if value is None or value == "":
                continue
            rel_props.append(f"  r.{_safe_prop_name(key)} = {_cypher_literal(value)}")
        rel_props_block = ",\n" + ",\n".join(rel_props) if rel_props else ""
        stmt = (
            f"MERGE (a:{src_label} {{kg_id: \"{src_kg_id}\"}})\n"
            f"ON CREATE SET a.name = \"{src_name}\", a.source = \"{safe_source}\", a.extraction_method = \"dify\", a.created_at = datetime()\n"
            f"MERGE (b:{tgt_label} {{kg_id: \"{tgt_kg_id}\"}})\n"
            f"ON CREATE SET b.name = \"{tgt_name}\", b.source = \"{safe_source}\", b.extraction_method = \"dify\", b.created_at = datetime()\n"
            f"MERGE (a)-[r:{neo4j_rel_type}]->(b)\n"
            f"ON CREATE SET r.created_at = datetime(), r.source = \"{safe_source}\", "
            f"r.extraction_method = \"dify\"{rel_props_block}\n"
            f"ON MATCH SET r.last_seen = datetime();\n"
        )
        statements.append(stmt)

    logger.info(
        f"Generated {len(statements)} Cypher statements from Dify JSONL "
        f"({len(node_ids)} unique nodes)"
    )
    return statements


# ── Validation ───────────────────────────────────────────────────────

def validate_cypher(statement: str) -> bool:
    """Basic validation of Cypher statement syntax.

    Checks:
    - Contains MERGE, CREATE, or MATCH keyword
    - Parentheses balanced
    - No empty property values
    """
    if not statement or not statement.strip():
        return False

    upper = statement.strip().upper()
    if not any(kw in upper for kw in ("MERGE", "CREATE", "MATCH", "SET", "RETURN")):
        return False

    # Check balanced parentheses
    if statement.count("(") != statement.count(")"):
        return False

    if statement.count("{") != statement.count("}"):
        return False

    # Check no obviously empty string values
    if '""' in statement:
        return False

    return True
