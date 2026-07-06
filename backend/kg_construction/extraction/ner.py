"""Named Entity Recognition — Regex rules + spaCy + LLM triple-engine extraction.

Entity types: COMPANY, PERSON, INSTITUTION, REGULATION, AMOUNT, DATE,
CASE_NUMBER, LOCATION, EVENT.

Configure via NER_MODEL env var: 'rule' | 'spacy' | 'llm' | 'hybrid'
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ── Entity type constants ─────────────────────────────────────────────

COMPANY = "COMPANY"
PERSON = "PERSON"
INSTITUTION = "INSTITUTION"
REGULATION = "REGULATION"
AMOUNT = "AMOUNT"
DATE_TYPE = "DATE"
CASE_NUMBER = "CASE_NUMBER"
LOCATION = "LOCATION"
EVENT = "EVENT"

ALL_TYPES = [COMPANY, PERSON, INSTITUTION, REGULATION, AMOUNT, DATE_TYPE, CASE_NUMBER, LOCATION, EVENT]


class NERModel:
    RULE = "rule"
    SPACY = "spacy"
    LLM = "llm"
    HYBRID = "hybrid"


# ── Optional spaCy model ─────────────────────────────────────────────

_spacy_nlp = None


def _get_spacy_model():
    global _spacy_nlp
    if _spacy_nlp is not None:
        return _spacy_nlp
    try:
        import spacy
        model_name = os.getenv("SPACY_MODEL", "zh_core_web_sm")
        try:
            _spacy_nlp = spacy.load(model_name)
        except OSError:
            logger.warning(f"spaCy model '{model_name}' not found. Download with: python -m spacy download {model_name}")
            _spacy_nlp = False
        return _spacy_nlp
    except ImportError:
        logger.warning("spaCy not installed. Install with: pip install spacy")
        _spacy_nlp = False
        return False


# ── Rule-based patterns ───────────────────────────────────────────────

_CHINESE_NAME_RE = re.compile(r"[一-鿿]{2,3}")

_COMPANY_RE = re.compile(
    r"(?:[一-鿿A-Za-z0-9]{2,20})"
    r"(?:公司|集团|股份|有限|控股|科技|实业|投资|证券|银行|保险|基金|信托|"
    r"企业|合伙|事务所|中心|研究院|实验室)"
)

_INSTITUTION_RE = re.compile(
    r"(?:中国|国家|省|市|区|县)?"
    r"(?:证监会|银保监|发改委|财政部|工信部|市场监管|法院|检察院|交易所|"
    r"人民银行|国资委|税务局|公安局|海关|知识产权局|统计局|审计署|商务部)"
)

_REGULATION_RE = re.compile(
    r"(?:《[^》]+》)|"
    r"(?:[一-鿿]+法[第条章节]?\s*\d*\s*[条]?)|"
    r"(?:[一-鿿]+规定[第条]?\s*\d*\s*[条]?)|"
    r"(?:[一-鿿]+办法[第条]?\s*\d*\s*[条]?)|"
    r"(?:[一-鿿]+条例)|"
    r"(?:[一-鿿]+规则)"
)

_AMOUNT_RE = re.compile(
    r"([\d,，.]+)\s*(亿|万|千|百)?\s*(元|美元|港元|欧元|日元|英镑)?"
    r"(?:人民币|美金)?"
    r"(?:以上|以下|左右|约)?"
)

_DATE_RE = re.compile(
    r"(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?"
    r"|(\d{4})(\d{2})(\d{2})"
    r"|(\d{1,2})月(\d{1,2})日"
)

_CASE_NUMBER_RE = re.compile(
    r"(?:[一-鿿]{1,4}[字]\s*第\s*\d+\s*号)"
    r"|(?:\(\d{4}\)\s*[一-鿿]{1,4}\d+\s*号)"
    r"|(?:[一-鿿]{2,4}\[\d{4}\]\d+\s*号)"
)


# ── Extraction functions ──────────────────────────────────────────────

def _extract_rule(text: str) -> list[dict[str, Any]]:
    """Regex-rule-based entity extraction."""
    entities: list[dict[str, Any]] = []

    for match in _COMPANY_RE.finditer(text):
        entities.append({"mention": match.group(), "type": COMPANY, "confidence": 0.8})

    for match in _CHINESE_NAME_RE.finditer(text):
        name = match.group()
        if name not in {"公司", "集团", "有限", "股份"}:
            entities.append({"mention": name, "type": PERSON, "confidence": 0.6})

    for match in _INSTITUTION_RE.finditer(text):
        entities.append({"mention": match.group(), "type": INSTITUTION, "confidence": 0.85})

    for match in _REGULATION_RE.finditer(text):
        entities.append({"mention": match.group(), "type": REGULATION, "confidence": 0.75})

    for match in _AMOUNT_RE.finditer(text):
        mention = match.group().strip()
        if len(mention) >= 2:
            entities.append({"mention": mention, "type": AMOUNT, "confidence": 0.7})

    for match in _DATE_RE.finditer(text):
        entities.append({"mention": match.group(), "type": DATE_TYPE, "confidence": 0.9})

    for match in _CASE_NUMBER_RE.finditer(text):
        entities.append({"mention": match.group(), "type": CASE_NUMBER, "confidence": 0.9})

    return entities


def _extract_spacy(text: str) -> list[dict[str, Any]]:
    """spaCy-based entity extraction."""
    nlp = _get_spacy_model()
    if not nlp:
        return []

    type_map = {
        "PERSON": PERSON,
        "ORG": COMPANY,
        "GPE": LOCATION,
        "LOC": LOCATION,
        "DATE": DATE_TYPE,
        "MONEY": AMOUNT,
        "LAW": REGULATION,
    }

    entities: list[dict[str, Any]] = []
    doc = nlp(text)
    for ent in doc.ents:
        mapped = type_map.get(ent.label_, ent.label_.upper())
        entities.append({
            "mention": ent.text,
            "type": mapped,
            "confidence": 0.8,
        })
    return entities


def _extract_llm(text: str) -> list[dict[str, Any]]:
    """LLM-based entity extraction via Dify/DeepSeek API.

    Falls back to rule-based extraction if LLM is unavailable.
    """
    try:
        import requests
        api_key = os.getenv("LLM_API_KEY", "")
        base_url = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
        model = os.getenv("LLM_MODEL", "deepseek-chat")

        if not api_key:
            logger.warning("LLM_API_KEY not set, falling back to rule-based NER.")
            return _extract_rule(text)

        prompt = f"""从以下文本中提取实体，返回JSON列表格式。
实体类型: 公司(COMPANY)、人物(PERSON)、机构(INSTITUTION)、法规(REGULATION)、
金额(AMOUNT)、日期(DATE)、案号(CASE_NUMBER)、地点(LOCATION)

文本: {text[:3000]}

请返回格式: [{{"mention": "实体名", "type": "类型", "confidence": 0.0-1.0}}]"""

        resp = requests.post(
            f"{base_url}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "你是一个金融文本NER系统。只返回JSON，不要解释。"},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.1,
            },
            timeout=30,
        )
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0]
            try:
                return __import__("json").loads(content)
            except Exception:
                logger.warning(f"Failed to parse LLM NER response: {content[:200]}")
        return _extract_rule(text)
    except Exception as e:
        logger.warning(f"LLM NER failed: {e}, falling back to rule-based.")
        return _extract_rule(text)


# ── Public API ────────────────────────────────────────────────────────

def extract_entities(text: str, model: Optional[str] = None) -> list[dict[str, Any]]:
    """Extract named entities from text using configured engines.

    Args:
        text: Input text to process.
        model: 'rule', 'spacy', 'llm', or 'hybrid'. Default: NER_MODEL env var or 'rule'.

    Returns:
        List of {mention, type, confidence} dicts.
    """
    if model is None:
        model = os.getenv("NER_MODEL", NERModel.RULE).lower()

    entities: list[dict[str, Any]] = []

    if model in (NERModel.RULE, NERModel.HYBRID):
        entities.extend(_extract_rule(text))

    if model in (NERModel.SPACY, NERModel.HYBRID):
        spacy_ents = _extract_spacy(text)
        if model == NERModel.SPACY:
            return spacy_ents
        _merge_enhance(entities, spacy_ents)

    if model == NERModel.LLM:
        return _extract_llm(text)

    return _deduplicate(entities)


def _merge_enhance(base: list[dict[str, Any]], spacy_ents: list[dict[str, Any]]) -> None:
    """Merge spaCy entities into rule-based results, boosting confidence."""
    seen = {e["mention"] for e in base}
    for ent in spacy_ents:
        if ent["mention"] not in seen:
            base.append(ent)
            seen.add(ent["mention"])
        else:
            for existing in base:
                if existing["mention"] == ent["mention"] and existing["type"] == ent["type"]:
                    existing["confidence"] = max(existing["confidence"], ent["confidence"])
                    break


def _deduplicate(entities: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove duplicate entity mentions, keeping the highest confidence entry."""
    best: dict[str, dict[str, Any]] = {}
    for ent in entities:
        key = (ent["mention"], ent["type"])
        if key not in best or ent["confidence"] > best[key]["confidence"]:
            best[key] = ent
    return list(best.values())
