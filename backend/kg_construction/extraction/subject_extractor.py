"""Local subject extraction and Neo4j alignment for KG construction.

This module is intentionally independent from Dify.  The subject stage is a
candidate-discovery and entity-linking problem: extract likely companies,
funds, securities, banks and people from source text, then align them against
the existing Subject layer in Neo4j.
"""

from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Any

logger = logging.getLogger(__name__)


SUBJECT_LABELS = {
    "COMPANY", "BANK", "PFUND", "PFCOMPANY", "SECURITY", "PERSON",
    "LEGAL_REP", "DIRECTOR", "SUPERVISOR", "EXECUTIVE",
    "REGULATOR", "EXCHANGE", "Actor", "Account",
}


@dataclass
class SubjectCandidate:
    mention: str
    entity_type: str
    confidence: float
    role: str = ""
    evidence_text: str = ""
    source_file: str = ""
    source_id: str = ""
    run_id: str = ""
    page: int | None = None
    paragraph_index: int | None = None
    start_offset: int | None = None
    end_offset: int | None = None
    matched_by_rule: str = "rule"


_COMPANY_RE = re.compile(
    r"[\u4e00-\u9fffA-Za-z0-9（）()·]{2,40}"
    r"(?:股份有限公司|有限责任公司|集团有限公司|控股有限公司|有限公司|集团|"
    r"商业银行|银行|证券股份有限公司|证券有限公司|证券公司|保险股份有限公司|"
    r"信托有限责任公司|期货有限公司|资产管理有限公司|投资管理有限公司)"
)
_BANK_RE = re.compile(
    r"[\u4e00-\u9fffA-Za-z0-9（）()·]{2,40}"
    r"(?:银行股份有限公司|股份制商业银行|商业银行|农商银行|农村商业银行|银行|信用社)"
)
_PFUND_RE = re.compile(
    r"[\u4e00-\u9fffA-Za-z0-9（）()·]{2,45}"
    r"(?:私募证券投资基金|私募股权投资基金|私募基金|证券投资基金|股权投资基金|基金)"
)
_PFCOMPANY_RE = re.compile(
    r"[\u4e00-\u9fffA-Za-z0-9（）()·]{2,45}"
    r"(?:私募基金管理有限公司|基金管理有限公司|资产管理有限公司|投资管理有限公司)"
)
_SECURITY_RE = re.compile(
    r"(?:股票|证券|债券|基金)?(?:代码|简称)[:：\s]*([A-Za-z0-9.\-]{2,20}|[\u4e00-\u9fffA-Za-z0-9（）()·]{2,30})"
)
_PERSON_ROLE_RE = re.compile(
    r"(法定代表人|法人代表|法人|实际控制人|控股股东|董事长|董事|总经理|负责人|董秘|董事会秘书|财务负责人|监事|高级管理人员)"
    r"[:：为是\s]*([\u4e00-\u9fff]{2,8})"
)
_REGULATOR_RE = re.compile(r"(?:中国证券监督管理委员会|中国证监会|证监会|[\u4e00-\u9fff]{2,8}证监局|证券业协会|基金业协会)")
_EXCHANGE_RE = re.compile(r"(?:北京证券交易所|上海证券交易所|深圳证券交易所|北交所|上交所|深交所)")


def extract_subject_candidates(text: str, source_file: str = "") -> list[SubjectCandidate]:
    """Extract local subject candidates from one source document."""
    candidates: list[SubjectCandidate] = []
    source_id = ""
    run_id = ""
    page: int | None = None
    paragraph_index: int | None = None

    def add(
        mention: str,
        entity_type: str,
        confidence: float,
        rule: str,
        role: str = "",
        start: int | None = None,
        end: int | None = None,
    ) -> None:
        cleaned = _clean_mention(mention)
        if entity_type in {"PERSON", "LEGAL_REP", "DIRECTOR", "SUPERVISOR", "EXECUTIVE"}:
            cleaned = _trim_person_name(cleaned)
        else:
            cleaned = _trim_subject_name(cleaned, entity_type)
        if not _valid_mention(cleaned):
            return
        evidence = _evidence_for_span(text, start, end, cleaned)
        candidates.append(
            SubjectCandidate(
                mention=cleaned,
                entity_type=entity_type,
                role=role or _infer_role(text, cleaned, entity_type),
                confidence=confidence,
                evidence_text=evidence["text"],
                source_file=source_file,
                source_id=source_id,
                run_id=run_id,
                page=page,
                paragraph_index=paragraph_index,
                start_offset=evidence["start"],
                end_offset=evidence["end"],
                matched_by_rule=rule,
            )
        )

    for m in _EXCHANGE_RE.finditer(text):
        add(m.group(), "EXCHANGE", 0.9, "exchange_dict", "交易所", m.start(), m.end())
    for m in _REGULATOR_RE.finditer(text):
        add(m.group(), "REGULATOR", 0.9, "regulator_dict", "监管机构", m.start(), m.end())
    for m in _PFCOMPANY_RE.finditer(text):
        add(m.group(), "PFCOMPANY", 0.88, "pfcompany_suffix", start=m.start(), end=m.end())
    for m in _PFUND_RE.finditer(text):
        add(m.group(), "PFUND", 0.86, "fund_suffix", start=m.start(), end=m.end())
    for m in _BANK_RE.finditer(text):
        add(m.group(), "BANK", 0.88, "bank_suffix", start=m.start(), end=m.end())
    for m in _COMPANY_RE.finditer(text):
        mention = m.group()
        if "基金" in mention and "管理" in mention:
            add(mention, "PFCOMPANY", 0.86, "fund_manager_suffix", start=m.start(), end=m.end())
        elif "基金" in mention:
            add(mention, "PFUND", 0.84, "fund_suffix", start=m.start(), end=m.end())
        elif "银行" in mention or "信用社" in mention:
            add(mention, "BANK", 0.88, "bank_suffix", start=m.start(), end=m.end())
        else:
            add(mention, "COMPANY", 0.82, "company_suffix", start=m.start(), end=m.end())
    for m in _SECURITY_RE.finditer(text):
        add(m.group(1), "SECURITY", 0.78, "security_code_or_name", start=m.start(1), end=m.end(1))
    for m in _PERSON_ROLE_RE.finditer(text):
        role_text = m.group(1)
        add(m.group(2), _person_type_for_role(role_text), 0.82, "person_role", role_text, m.start(2), m.end(2))

    return _dedupe_candidates(candidates)


def extract_and_align_subjects(
    texts: list[dict[str, str]],
    db_client: Any | None = None,
    max_candidates: int = 200,
) -> dict[str, Any]:
    """Extract subject candidates from text items and align them to Neo4j."""
    candidates: list[SubjectCandidate] = []
    for item in texts:
        item_candidates = extract_subject_candidates(item.get("text", ""), item.get("file", ""))
        for candidate in item_candidates:
            candidate.source_id = item.get("sourceId", item.get("source_id", ""))
            candidate.run_id = item.get("runId", item.get("run_id", ""))
            candidate.page = item.get("page")
            candidate.paragraph_index = item.get("paragraphIndex", item.get("paragraph_index"))
        candidates.extend(item_candidates)

    candidates = sorted(
        _dedupe_candidates(candidates),
        key=lambda c: (c.confidence, len(c.mention)),
        reverse=True,
    )[:max_candidates]

    aligner = Neo4jSubjectAligner(db_client)
    aligned = [_keep_effective_subject(aligner.align(candidate)) for candidate in candidates]
    aligned = [item for item in aligned if item]

    resolved = [x for x in aligned if x["matchStatus"] in {"EXACT_MATCH", "ALIAS_MATCH", "FUZZY_MATCH"}]
    low_confidence = [x for x in aligned if x["matchStatus"] == "LOW_CONFIDENCE"]
    new_entities = [x for x in aligned if x["matchStatus"] == "NEW_ENTITY"]
    conflicts = [x for x in aligned if x["matchStatus"] == "CONFLICT"]

    return {
        "subjects": aligned,
        "stats": {
            "total": len(aligned),
            "resolved": len(resolved),
            "low_confidence": len(low_confidence),
            "new": len(new_entities),
            "conflict": len(conflicts),
            "by_type": _count_by_type(aligned),
        },
    }


class Neo4jSubjectAligner:
    """Align extracted subject mentions with existing Subject-layer nodes."""

    def __init__(self, db_client: Any | None = None) -> None:
        self._db = db_client

    def _client(self) -> Any | None:
        if self._db is not None:
            return self._db
        try:
            from core.database import Neo4jClient

            self._db = Neo4jClient.from_env()
            return self._db
        except Exception as exc:
            logger.warning("Neo4j unavailable for subject alignment: %s", exc)
            self._db = False
            return None

    def align(self, candidate: SubjectCandidate) -> dict[str, Any]:
        base = _candidate_dict(candidate)
        client = self._client()
        if not client:
            return _with_linking(base, "NEW_ENTITY", None)

        match = (
            self._match_exact(client, candidate)
            or self._match_alias(client, candidate)
            or self._match_normalized(client, candidate)
            or self._match_contains(client, candidate)
        )
        if not match:
            return _with_linking(base, "NEW_ENTITY", None)

        match_status = match.pop("matchStatus", "LOW_CONFIDENCE")
        if match.get("score", 0) < 0.7:
            match_status = "LOW_CONFIDENCE"
        return _with_linking({**base, **match}, match_status, match)

    def _match_exact(self, client: Any, candidate: SubjectCandidate) -> dict[str, Any] | None:
        labels = _labels_for_type(candidate.entity_type)
        props = _props_for_type(candidate.entity_type)
        query = f"""
            MATCH (n)
            WHERE any(label IN labels(n) WHERE label IN $labels)
              AND any(prop IN $props WHERE toString(n[prop]) = $mention)
            RETURN elementId(n) AS kgNodeId,
                   labels(n) AS neo4jLabels,
                   coalesce(n.name, n.COMPANY_NM, n.PERSON_NM, n.SECURITY_NAME,
                            n.FUND_NM, n.title, n.ALIAS, $mention) AS canonicalName
            LIMIT 1
        """
        try:
            rows = client.execute_read(
                query,
                {"labels": labels, "props": props, "mention": candidate.mention},
                timeout_seconds=4.0,
            )
        except Exception as exc:
            logger.debug("Subject exact alignment failed for %s: %s", candidate.mention, exc)
            return None
        if not rows:
            return None
        row = rows[0]
        return {
            "kgNodeId": row.get("kgNodeId"),
            "canonicalName": row.get("canonicalName") or candidate.mention,
            "neo4jLabels": row.get("neo4jLabels", []),
            "matchedBy": "exact",
            "matchStatus": "EXACT_MATCH",
            "score": 0.96,
            "confidence": max(candidate.confidence, 0.95),
        }

    def _match_alias(self, client: Any, candidate: SubjectCandidate) -> dict[str, Any] | None:
        labels = _labels_for_type(candidate.entity_type)
        query = """
            MATCH (n)
            WHERE any(label IN labels(n) WHERE label IN $labels)
              AND (
                toString(n.ALIAS) CONTAINS $mention
                OR toString(n.alias) CONTAINS $mention
                OR toString(n.aliases) CONTAINS $mention
                OR toString(n.short_name) = $mention
              )
            RETURN elementId(n) AS kgNodeId,
                   labels(n) AS neo4jLabels,
                   coalesce(n.name, n.COMPANY_NM, n.PERSON_NM, n.SECURITY_NAME,
                            n.FUND_NM, n.title, n.ALIAS, $mention) AS canonicalName
            LIMIT 2
        """
        try:
            rows = client.execute_read(query, {"labels": labels, "mention": candidate.mention}, timeout_seconds=4.0)
        except Exception as exc:
            logger.debug("Subject alias alignment failed for %s: %s", candidate.mention, exc)
            return None
        if not rows:
            return None
        if len(rows) > 1:
            return _conflict_match(candidate, rows)
        row = rows[0]
        return {
            "kgNodeId": row.get("kgNodeId"),
            "canonicalName": row.get("canonicalName") or candidate.mention,
            "neo4jLabels": row.get("neo4jLabels", []),
            "matchedBy": "alias",
            "matchStatus": "ALIAS_MATCH",
            "score": 0.9,
            "confidence": max(candidate.confidence, 0.9),
        }

    def _match_normalized(self, client: Any, candidate: SubjectCandidate) -> dict[str, Any] | None:
        normalized = _normalize_name(candidate.mention)
        if len(normalized) < 2 or normalized == candidate.mention:
            return None
        labels = _labels_for_type(candidate.entity_type)
        query = """
            MATCH (n)
            WHERE any(label IN labels(n) WHERE label IN $labels)
            WITH n,
                 coalesce(n.name, n.COMPANY_NM, n.PERSON_NM, n.SECURITY_NAME,
                          n.FUND_NM, n.title, n.ALIAS, '') AS nm
            WHERE replace(replace(replace(replace(replace(nm, '股份有限公司', ''),
                  '有限责任公司', ''), '有限公司', ''), '集团', ''), '基金', '') = $normalized
            RETURN elementId(n) AS kgNodeId,
                   labels(n) AS neo4jLabels,
                   nm AS canonicalName
            LIMIT 1
        """
        try:
            rows = client.execute_read(
                query,
                {"labels": labels, "normalized": normalized},
                timeout_seconds=5.0,
            )
        except Exception as exc:
            logger.debug("Subject normalized alignment failed for %s: %s", candidate.mention, exc)
            return None
        if not rows:
            return None
        row = rows[0]
        return {
            "kgNodeId": row.get("kgNodeId"),
            "canonicalName": row.get("canonicalName") or candidate.mention,
            "neo4jLabels": row.get("neo4jLabels", []),
            "matchedBy": "normalized_name",
            "matchStatus": "FUZZY_MATCH",
            "score": 0.86,
            "confidence": max(candidate.confidence, 0.86),
        }

    def _match_contains(self, client: Any, candidate: SubjectCandidate) -> dict[str, Any] | None:
        if len(candidate.mention) < 3:
            return None
        labels = _labels_for_type(candidate.entity_type)
        query = """
            MATCH (n)
            WHERE any(label IN labels(n) WHERE label IN $labels)
            WITH n,
                 coalesce(n.name, n.COMPANY_NM, n.PERSON_NM, n.SECURITY_NAME,
                          n.FUND_NM, n.title, n.ALIAS, '') AS nm
            WHERE nm CONTAINS $mention OR $mention CONTAINS nm
            RETURN elementId(n) AS kgNodeId,
                   labels(n) AS neo4jLabels,
                   nm AS canonicalName
            LIMIT 20
        """
        try:
            rows = client.execute_read(
                query,
                {"labels": labels, "mention": candidate.mention},
                timeout_seconds=5.0,
            )
        except Exception as exc:
            logger.debug("Subject contains alignment failed for %s: %s", candidate.mention, exc)
            return None
        best: dict[str, Any] | None = None
        best_score = 0.0
        for row in rows:
            name = row.get("canonicalName") or ""
            score = SequenceMatcher(None, candidate.mention, name).ratio()
            if score > best_score:
                best_score = score
                best = row
        if len(rows) > 1:
            close = [
                row for row in rows
                if SequenceMatcher(None, candidate.mention, row.get("canonicalName") or "").ratio() >= 0.82
            ]
            if len(close) > 1:
                return _conflict_match(candidate, close)
        if not best or best_score < 0.65:
            return None
        return {
            "kgNodeId": best.get("kgNodeId"),
            "canonicalName": best.get("canonicalName") or candidate.mention,
            "neo4jLabels": best.get("neo4jLabels", []),
            "matchedBy": "fuzzy",
            "matchStatus": "FUZZY_MATCH",
            "score": round(best_score, 4),
            "confidence": round(min(0.9, best_score * candidate.confidence), 4),
        }


def subjects_to_frontend_nodes(subjects: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert aligned subjects to KnowledgeBuild-compatible frontend nodes."""
    nodes: list[dict[str, Any]] = []
    for subject in subjects:
        node_id = subject.get("kgNodeId") or _stable_id(subject.get("mention", "subject"))
        label = subject.get("canonicalName") or subject.get("mention", "")
        nodes.append(
            {
                "id": node_id,
                "label": label,
                "type": subject.get("entityType", "Unknown"),
                "properties": {
                    "name": label,
                    "normalizedName": subject.get("normalizedName", label),
                    "aliases": subject.get("aliases", []),
                    "mention": subject.get("mention", ""),
                    "entity_type": subject.get("entityType", "Unknown"),
                    "labels": subject.get("labels", []),
                    "role": subject.get("role", ""),
                    "confidence": subject.get("confidence", 0),
                    "status": _legacy_status(subject.get("matchStatus", "NEW_ENTITY")),
                    "match_status": subject.get("matchStatus", "NEW_ENTITY"),
                    "matched_by": subject.get("matchedBy", "none"),
                    "match_score": subject.get("score", 0),
                    "kgNodeId": subject.get("kgNodeId"),
                    "linking": subject.get("linking", {}),
                    "neo4jLabels": subject.get("neo4jLabels", []),
                    "source_doc": subject.get("sourceFile", ""),
                    "sourceId": subject.get("sourceId", ""),
                    "runId": subject.get("runId", ""),
                    "evidence": subject.get("evidenceText", ""),
                    "page": subject.get("page"),
                    "paragraphIndex": subject.get("paragraphIndex"),
                    "startOffset": subject.get("startOffset"),
                    "endOffset": subject.get("endOffset"),
                    "local_rule": subject.get("matchedByRule", ""),
                },
            }
        )
    return nodes


def _candidate_dict(candidate: SubjectCandidate) -> dict[str, Any]:
    return {
        "mention": candidate.mention,
        "entityType": candidate.entity_type,
        "type": candidate.entity_type,
        "canonicalName": candidate.mention,
        "normalizedName": _normalize_name(candidate.mention),
        "aliases": _aliases_for(candidate.mention, candidate.entity_type),
        "labels": _labels_for_type(candidate.entity_type),
        "role": candidate.role,
        "confidence": candidate.confidence,
        "sourceFile": candidate.source_file,
        "sourceId": candidate.source_id,
        "runId": candidate.run_id,
        "page": candidate.page,
        "paragraphIndex": candidate.paragraph_index,
        "evidenceText": candidate.evidence_text,
        "startOffset": candidate.start_offset,
        "endOffset": candidate.end_offset,
        "matchedByRule": candidate.matched_by_rule,
    }


def _labels_for_type(entity_type: str) -> list[str]:
    mapping = {
        "COMPANY": ["COMPANY", "Subject"],
        "BANK": ["BANK", "COMPANY", "Subject"],
        "PFUND": ["PFUND", "Subject"],
        "PFCOMPANY": ["PFCOMPANY", "COMPANY", "Subject"],
        "SECURITY": ["SECURITY", "COMPANY", "Subject"],
        "PERSON": ["PERSON", "Subject"],
        "LEGAL_REP": ["LEGAL_REP", "PERSON", "Subject"],
        "DIRECTOR": ["DIRECTOR", "PERSON", "Subject"],
        "SUPERVISOR": ["SUPERVISOR", "PERSON", "Subject"],
        "EXECUTIVE": ["EXECUTIVE", "PERSON", "Subject"],
        "REGULATOR": ["REGULATOR", "Subject"],
        "EXCHANGE": ["EXCHANGE", "REGULATOR", "Subject"],
    }
    return mapping.get(entity_type.upper(), ["Subject"])


def _props_for_type(entity_type: str) -> list[str]:
    common = ["name", "title", "ALIAS", "id"]
    mapping = {
        "COMPANY": ["COMPANY_ID", "COMPANY_NM", "short_name", "uscid", "code", *common],
        "BANK": ["COMPANY_ID", "COMPANY_NM", "short_name", "uscid", "code", *common],
        "PFUND": ["FUND_ID", "FUND_NM", "fund_name", "code", *common],
        "PFCOMPANY": ["COMPANY_ID", "COMPANY_NM", "manager_name", "uscid", *common],
        "SECURITY": ["SECURITY_ID", "SECURITY_NAME", "SECURITY_CODE", "stock_code", "bond_code", "code", *common],
        "PERSON": ["PERSON_NM", "ID", *common],
        "LEGAL_REP": ["PERSON_NM", "ID", *common],
        "DIRECTOR": ["PERSON_NM", "ID", *common],
        "SUPERVISOR": ["PERSON_NM", "ID", *common],
        "EXECUTIVE": ["PERSON_NM", "ID", *common],
        "REGULATOR": common,
        "EXCHANGE": common,
    }
    return mapping.get(entity_type.upper(), common)


def _dedupe_candidates(candidates: list[SubjectCandidate]) -> list[SubjectCandidate]:
    best: dict[tuple[str, str], SubjectCandidate] = {}
    for item in candidates:
        key = (item.mention, item.entity_type)
        current = best.get(key)
        if current is None or item.confidence > current.confidence:
            best[key] = item
    items = list(best.values())
    filtered: list[SubjectCandidate] = []
    for item in items:
        if item.entity_type == "COMPANY" and any(
            other.entity_type in {"PFUND", "PFCOMPANY"}
            and item.mention != other.mention
            and item.mention in other.mention
            for other in items
        ):
            continue
        filtered.append(item)
    return filtered


def _clean_mention(value: str) -> str:
    cleaned = value.strip(" \t\r\n，。；、:：()（）[]【】\"'")
    cleaned = re.split(r"[，。；、\s]+", cleaned)[-1]
    cleaned = re.sub(
        r"^(?:关于|涉及|显示|认为|发现|收到|管理|持有|投资|处罚|监管|公告|披露|其|该|由|对|与|及|其他|其它|同时|后|前)+",
        "",
        cleaned,
    )
    return cleaned.strip(" \t\r\n，。；、:：()（）[]【】\"'")


def _valid_mention(value: str) -> bool:
    if len(value) < 2 or len(value) > 80:
        return False
    stop_words = {
        "股份有限公司", "有限责任公司", "集团有限公司", "证券投资基金",
        "证券公司", "股东的投资", "他的投资",
    }
    if value in stop_words:
        return False
    if value.startswith(("他", "其", "该", "和", "及", "与", "同时", "股东的")):
        return False
    if value.endswith("证券") and len(value) <= 4:
        return False
    if value.endswith("投资") and not value.endswith(("投资管理有限公司", "投资基金")):
        return False
    return True


def _evidence_window(text: str, mention: str, radius: int = 80) -> str:
    idx = text.find(mention)
    if idx < 0:
        return ""
    start = max(0, idx - radius)
    end = min(len(text), idx + len(mention) + radius)
    return text[start:end].replace("\n", " ").strip()


def _normalize_name(value: str) -> str:
    normalized = value
    for token in ("股份有限公司", "有限责任公司", "集团有限公司", "有限公司", "集团", "基金"):
        normalized = normalized.replace(token, "")
    return normalized.strip()


def _aliases_for(value: str, entity_type: str) -> list[str]:
    aliases: list[str] = []
    if entity_type == "EXCHANGE":
        mapping = {"北京证券交易所": "北交所", "上海证券交易所": "上交所", "深圳证券交易所": "深交所"}
        if value in mapping:
            aliases.append(mapping[value])
    short = _normalize_name(value)
    if short and short != value and len(short) >= 2:
        aliases.append(short)
    return list(dict.fromkeys(aliases))


def _stable_id(value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]
    return f"subject_{digest}"


def _count_by_type(subjects: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in subjects:
        key = item.get("entityType", "Unknown")
        counts[key] = counts.get(key, 0) + 1
    return counts


def _person_type_for_role(role: str) -> str:
    if role in {"法定代表人", "法人代表", "法人"}:
        return "LEGAL_REP"
    if role in {"董事", "董事长"}:
        return "DIRECTOR"
    if role == "监事":
        return "SUPERVISOR"
    if role in {"总经理", "负责人", "董秘", "董事会秘书", "财务负责人", "高级管理人员"}:
        return "EXECUTIVE"
    return "PERSON"


def _infer_role(text: str, mention: str, entity_type: str) -> str:
    window = _evidence_window(text, mention, radius=40)
    role_patterns = [
        ("被处罚主体", r"处罚|纪律处分"),
        ("被监管对象", r"监管措施|监管关注|警示函|问询"),
        ("发行人", r"发行人"),
        ("上市公司", r"上市公司"),
        ("申请人", r"申请人"),
        ("控股股东", r"控股股东"),
        ("实际控制人", r"实际控制人"),
        ("保荐机构", r"保荐机构|保荐人"),
        ("承销商", r"承销商|主承销"),
        ("会计师事务所", r"会计师事务所|审计机构"),
        ("律师事务所", r"律师事务所|法律顾问"),
        ("投资者", r"投资者"),
        ("债权人", r"债权人"),
        ("担保方", r"担保方|提供担保"),
        ("被担保方", r"被担保"),
        ("资金占用方", r"资金占用"),
        ("关联方", r"关联方"),
    ]
    if entity_type == "EXCHANGE":
        return "交易所"
    if entity_type == "REGULATOR":
        return "监管机构"
    for role, pattern in role_patterns:
        if re.search(pattern, window):
            return role
    if entity_type in {"BANK", "COMPANY", "PFCOMPANY", "PFUND", "SECURITY"}:
        return "主体"
    return ""


def _trim_person_name(value: str) -> str:
    if len(value) <= 4:
        return value
    for marker in ("同时", "先生", "女士", "担任", "任", "为", "，", "。", "、"):
        if marker in value:
            value = value.split(marker, 1)[0]
    return value[:4]


def _trim_subject_name(value: str, entity_type: str) -> str:
    suffixes = {
        "COMPANY": (
            "股份有限公司", "有限责任公司", "集团有限公司", "控股有限公司",
            "有限公司", "商业银行", "银行", "证券股份有限公司", "证券有限公司",
            "证券公司", "保险股份有限公司", "信托有限责任公司", "期货有限公司",
            "资产管理有限公司", "投资管理有限公司",
        ),
        "BANK": ("银行股份有限公司", "股份制商业银行", "商业银行", "农村商业银行", "农商银行", "银行", "信用社"),
        "PFUND": ("私募证券投资基金", "私募股权投资基金", "私募基金", "证券投资基金", "股权投资基金", "基金"),
        "PFCOMPANY": ("私募基金管理有限公司", "基金管理有限公司", "资产管理有限公司", "投资管理有限公司"),
    }
    for suffix in sorted(suffixes.get(entity_type, ()), key=len, reverse=True):
        idx = value.find(suffix)
        if idx >= 0:
            return _strip_context_prefix(value[: idx + len(suffix)])
    return value


def _strip_context_prefix(value: str) -> str:
    for marker in ("对", "向", "与", "及", "和", "由", "为", "给", "把", "将"):
        if marker in value:
            tail = value.rsplit(marker, 1)[-1]
            if len(tail) >= 2:
                value = tail
    return value.strip()


def _evidence_for_span(text: str, start: int | None, end: int | None, mention: str) -> dict[str, Any]:
    if start is None or end is None:
        idx = text.find(mention)
        if idx >= 0:
            start, end = idx, idx + len(mention)
        else:
            return {"text": "", "start": None, "end": None}
    radius = 80
    left = max(0, start - radius)
    right = min(len(text), end + radius)
    return {"text": text[left:right].replace("\n", " ").strip(), "start": start, "end": end}


def _conflict_match(candidate: SubjectCandidate, rows: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "kgNodeId": rows[0].get("kgNodeId") if rows else None,
        "canonicalName": rows[0].get("canonicalName") if rows else candidate.mention,
        "neo4jLabels": rows[0].get("neo4jLabels", []) if rows else [],
        "matchedBy": "conflict",
        "matchStatus": "CONFLICT",
        "score": 0.6,
        "confidence": min(candidate.confidence, 0.6),
        "candidates": rows[:5],
    }


def _with_linking(base: dict[str, Any], match_status: str, match: dict[str, Any] | None) -> dict[str, Any]:
    kg_id = base.get("kgNodeId") if match else None
    score = base.get("score", 0) if match else 0
    matched_by = base.get("matchedBy", "none") if match else "none"
    matched_name = base.get("canonicalName", base.get("mention", ""))
    result = {
        **base,
        "matchStatus": match_status,
        "status": _legacy_status(match_status),
        "matchedBy": matched_by,
        "score": score,
        "kgNodeId": kg_id,
        "linking": {
            "matched": match_status in {"EXACT_MATCH", "ALIAS_MATCH", "FUZZY_MATCH"},
            "kgNodeId": kg_id,
            "matchType": matched_by,
            "score": score,
            "matchedName": matched_name,
            "status": match_status,
        },
    }
    return result


def _legacy_status(match_status: str) -> str:
    if match_status in {"EXACT_MATCH", "ALIAS_MATCH", "FUZZY_MATCH"}:
        return "resolved"
    if match_status == "LOW_CONFIDENCE":
        return "low_confidence"
    if match_status == "CONFLICT":
        return "conflict"
    return "new_entity"


def _keep_effective_subject(item: dict[str, Any]) -> dict[str, Any] | None:
    """Drop noisy unresolved phrases; keep only usable subject candidates."""
    entity_type = item.get("entityType", "")
    mention = item.get("mention", "")
    match_status = item.get("matchStatus", "NEW_ENTITY")

    if entity_type not in SUBJECT_LABELS:
        return None
    if not _valid_mention(mention):
        return None
    if entity_type in {"PERSON", "LEGAL_REP", "DIRECTOR", "SUPERVISOR", "EXECUTIVE"} and match_status == "NEW_ENTITY" and len(mention) not in {2, 3, 4}:
        return None
    if entity_type in {"COMPANY", "BANK", "PFUND", "PFCOMPANY", "SECURITY", "REGULATOR", "EXCHANGE"}:
        has_strong_suffix = mention.endswith((
            "股份有限公司", "有限责任公司", "有限公司", "银行", "证券公司",
            "投资基金", "私募基金", "证券投资基金", "股权投资基金", "基金",
            "证券交易所", "证监会", "监管局", "证券业协会", "基金业协会",
        ))
        is_code = entity_type == "SECURITY" and bool(re.fullmatch(r"[A-Za-z0-9.\-]{2,20}", mention))
        if match_status == "NEW_ENTITY" and not has_strong_suffix and not is_code:
            return None
    return item
