"""Structured Data Parser — parses LLM-extracted JSONL results from Dify workflows.

Handles the output files in 巨潮资讯网/高价超募_结果/*.jsonl, which contain
LLM-extracted structured fields from company announcements.

Typical usage:
    from data_collection.file_import import parse_jsonl_results
    records = parse_jsonl_results("/path/to/results.jsonl")
"""

from __future__ import annotations

import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ── Normalization helpers ────────────────────────────────────────────

def normalize_company_name(name: str) -> str:
    """Normalize a Chinese company name by removing common suffixes and whitespace."""
    if not name:
        return ""
    name = name.strip()
    name = re.sub(r"\s+", "", name)
    # Remove common legal-form suffixes for fuzzy matching
    suffixes = [
        "股份有限公司", "有限责任公司", "有限公司", "集团",
        "（", "）", "(", ")", "有限公司", "股份公司",
    ]
    for suffix in suffixes:
        name = name.replace(suffix, "")
    return name.strip()


def _normalize_date(date_str: str) -> Optional[str]:
    """Normalize various date formats to YYYY-MM-DD."""
    if not date_str:
        return None
    date_str = date_str.strip()
    formats = [
        "%Y-%m-%d", "%Y/%m/%d", "%Y%m%d",
        "%Y年%m月%d日", "%Y.%m.%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str


def _normalize_amount(amount_str: str) -> Optional[float]:
    """Parse Chinese monetary amount strings to float (unit: 万元)."""
    if not amount_str:
        return None
    amount_str = amount_str.strip().replace(",", "").replace("，", "")
    # Handle "X万元", "X亿元", "X元"
    multipliers = {"亿": 10000, "万": 1, "元": 0.0001}
    match = re.match(r"([\d.]+)\s*(亿|万|元)?", amount_str)
    if match:
        value = float(match.group(1))
        unit = match.group(2) or "万"
        return value * multipliers.get(unit, 1)
    try:
        return float(amount_str)
    except ValueError:
        return None


# ── JSONL parsing ────────────────────────────────────────────────────

def parse_jsonl_results(file_path: str) -> list[dict[str, Any]]:
    """Parse a JSONL file from Dify workflow output.

    Each line is a JSON object with LLM-extracted structured fields.
    Returns a list of normalized record dicts.
    """
    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return []

    records: list[dict[str, Any]] = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON at line {line_num} in {file_path}")
                    continue

                record = _normalize_record(obj, file_path)
                records.append(record)
    except Exception as e:
        logger.error(f"Failed to parse {file_path}: {e}")

    return records


def _normalize_record(obj: dict[str, Any], source: str) -> dict[str, Any]:
    """Normalize a single Dify extraction record to the standard schema."""
    company = obj.get("company_name") or obj.get("公司名称") or obj.get("company") or ""
    company_norm = normalize_company_name(company)

    return {
        "source_file": os.path.basename(source),
        "company_name": company,
        "company_name_normalized": company_norm,
        "stock_code": obj.get("stock_code") or obj.get("股票代码") or "",
        "announcement_title": obj.get("title") or obj.get("公告标题") or "",
        "announcement_date": _normalize_date(
            obj.get("date") or obj.get("公告日期") or obj.get("announcement_date") or ""
        ),
        "announcement_type": obj.get("type") or obj.get("公告类型") or "",
        "amount": _normalize_amount(
            obj.get("amount") or obj.get("金额") or obj.get("超募金额") or ""
        ),
        "project_name": obj.get("project_name") or obj.get("项目名称") or "",
        "usage": obj.get("usage") or obj.get("用途") or obj.get("资金用途") or "",
        "raw_data": obj,
    }


def batch_parse_directory(directory: str) -> list[dict[str, Any]]:
    """Parse all JSONL files in a directory and return merged records."""
    if not os.path.isdir(directory):
        logger.error(f"Directory not found: {directory}")
        return []

    all_records: list[dict[str, Any]] = []
    for filename in os.listdir(directory):
        if filename.endswith(".jsonl"):
            file_path = os.path.join(directory, filename)
            records = parse_jsonl_results(file_path)
            all_records.extend(records)
            logger.info(f"Parsed {len(records)} records from {filename}")

    return all_records
