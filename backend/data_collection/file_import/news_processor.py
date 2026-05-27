"""News Text Processor — cleans and extracts entities from financial news articles.

Handles the ~1000+ txt files downloaded by the 证券之星 scraper.
Cleans HTML artifacts, extracts publish dates, and performs basic
entity extraction (companies, persons) via regex keyword matching.

Typical usage:
    from data_collection.file_import import process_news_file, batch_process_news
    article = process_news_file("/path/to/news.txt")
"""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────

# Common Chinese company name patterns for regex matching
COMPANY_PATTERNS = [
    r"(?:[一-鿿]{2,10})(?:公司|集团|股份|有限|控股|科技|实业|投资|证券|银行|保险|基金|信托)",
    r"(?:[一-鿿]{2,10})(?:股份|控股|集团)(?:有限公司)?",
]

# Common person name patterns (Chinese names: 2-3 characters)
PERSON_PATTERN = re.compile(r"(?:[一-鿿]){2,3}(?:表示|认为|指出|称|说|透露)")

# Date extraction patterns
DATE_PATTERNS = [
    re.compile(r"(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?"),
    re.compile(r"(\d{4})(\d{2})(\d{2})"),
]

# HTML artifact cleanup
HTML_CLEANUP = re.compile(r"<[^>]+>")


def _extract_date(text: str, filename: str = "") -> Optional[str]:
    """Try to extract a publish date from text or filename."""
    # Try text first
    for pattern in DATE_PATTERNS:
        match = pattern.search(text[:500])
        if match:
            y, m, d = int(match.group(1)), int(match.group(2)), int(match.group(3))
            try:
                return datetime(y, m, d).strftime("%Y-%m-%d")
            except ValueError:
                continue

    # Fall back to filename patterns like "2024-05-15_..."
    name_match = re.match(r"(\d{4}-\d{2}-\d{2})", os.path.basename(filename))
    if name_match:
        return name_match.group(1)

    return None


def _extract_companies(text: str) -> list[dict[str, str]]:
    """Extract company mentions from text using regex patterns."""
    companies = []
    seen = set()
    for pattern in COMPANY_PATTERNS:
        for match in re.finditer(pattern, text):
            name = match.group()
            if name not in seen:
                seen.add(name)
                companies.append({"name": name, "type": "COMPANY"})
    return companies


def _extract_keywords(text: str, top_n: int = 10) -> list[str]:
    """Simple keyword extraction based on financial-domain keyword list."""
    keywords = [
        "风险", "违规", "处罚", "诉讼", "仲裁", "退市", "ST",
        "重组", "并购", "上市", "IPO", "融资", "增发", "回购",
        "减持", "增持", "分红", "业绩", "亏损", "盈利", "营收",
        "股价", "涨跌", "暴跌", "暴涨", "停牌", "复牌",
        "监管", "问询", "调查", "立案", "冻结", "担保",
    ]
    found = []
    text_lower = text
    for kw in keywords:
        if kw in text_lower:
            found.append(kw)
        if len(found) >= top_n:
            break
    return found


def _clean_html(text: str) -> str:
    """Remove HTML tags and common artifacts from scraped news text."""
    text = HTML_CLEANUP.sub("", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&quot;", '"')
    # Collapse multiple newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove excessive spaces
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def _classify_sentiment(text: str) -> str:
    """Simple sentiment classification based on positive/negative keyword counts.

    Returns 'positive', 'negative', or 'neutral'.
    """
    positive_words = [
        "增长", "上涨", "利好", "盈利", "突破", "创新", "领先",
        "增长", "提升", "改善", "回暖", "复苏", "分红",
    ]
    negative_words = [
        "下跌", "亏损", "风险", "违规", "处罚", "诉讼", "退市",
        "暴跌", "下滑", "恶化", "危机", "爆雷", "违约", "破产",
        "调查", "冻结", "问询", "警示",
    ]

    pos = sum(1 for w in positive_words if w in text)
    neg = sum(1 for w in negative_words if w in text)

    if pos > neg * 1.5:
        return "positive"
    elif neg > pos * 1.5:
        return "negative"
    return "neutral"


def process_news_file(file_path: str) -> Optional[dict[str, Any]]:
    """Process a single news txt file.

    Returns a dict with cleaned text, extracted entities, and metadata,
    or None if the file is invalid/empty.
    """
    if not os.path.isfile(file_path):
        logger.error(f"File not found: {file_path}")
        return None

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            raw_text = f.read()
    except (UnicodeDecodeError, OSError) as e:
        logger.error(f"Failed to read {file_path}: {e}")
        return None

    if not raw_text.strip():
        return None

    # Parse title and body
    lines = raw_text.split("\n")
    title = lines[0].strip() if lines else ""
    source_url = ""
    if len(lines) > 1 and lines[1].startswith("来源:"):
        source_url = lines[1].replace("来源:", "").strip()
        body_start = 3
    else:
        body_start = 1

    body = "\n".join(lines[body_start:])
    cleaned_body = _clean_html(body)

    return {
        "file_path": file_path,
        "file_name": os.path.basename(file_path),
        "title": title,
        "source_url": source_url,
        "body": cleaned_body,
        "publish_date": _extract_date(raw_text, file_path),
        "companies": _extract_companies(cleaned_body),
        "keywords": _extract_keywords(cleaned_body),
        "sentiment": _classify_sentiment(cleaned_body),
        "char_count": len(cleaned_body),
    }


def batch_process_news(directory: str) -> list[dict[str, Any]]:
    """Process all txt files in a directory.

    Returns a list of processed article dicts, skipping empty/invalid files.
    """
    if not os.path.isdir(directory):
        logger.error(f"Directory not found: {directory}")
        return []

    articles: list[dict[str, Any]] = []
    for filename in sorted(os.listdir(directory)):
        if not filename.endswith(".txt"):
            continue
        file_path = os.path.join(directory, filename)
        article = process_news_file(file_path)
        if article:
            articles.append(article)

    logger.info(f"Processed {len(articles)} news articles from {directory}")
    return articles
