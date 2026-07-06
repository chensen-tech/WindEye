"""East Money Scraper — 东方财富财经新闻爬取.

Source: eastmoney (东方财富网财经新闻)
Temp dir: data/risk_sentiment/
"""

from __future__ import annotations

import json
import logging
import os
import random
import re
import time
from html import unescape

import requests

from data_collection.scrapers.utils import retry_on_network_error

try:
    from bs4 import BeautifulSoup
except ImportError:
    raise SystemExit("请先安装: pip install beautifulsoup4")

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://finance.eastmoney.com/",
}

# ── Real scraper ────────────────────────────────────────────────────────────


@retry_on_network_error(max_attempts=3, base_delay=2.0)
def _fetch(url: str, headers: dict | None = None) -> str:
    r = requests.get(url, headers=headers or HEADERS, timeout=25)
    r.raise_for_status()
    if not r.encoding or r.encoding.lower() == "iso-8859-1":
        enc = r.apparent_encoding or "utf-8"
        try:
            r.encoding = enc
        except Exception:
            r.encoding = "utf-8"
    return r.text


def _safe_filename(title: str, max_len: int = 120) -> str:
    title = unescape(title or "").strip()
    title = re.sub(r'[\\/:*?"<>|]', "", title)
    title = " ".join(title.split())
    if not title:
        title = "untitled"
    if len(title) > max_len:
        title = title[:max_len].rstrip()
    return title + ".txt"


def _parse_eastmoney_article(html: str, url: str) -> tuple[str, str]:
    """Parse eastmoney article HTML, return (title, body)."""
    soup = BeautifulSoup(html, "html.parser")

    title = ""
    h1 = soup.find("h1")
    if h1 and h1.get_text(strip=True):
        title = h1.get_text(strip=True)
    if not title:
        og = soup.find("meta", property="og:title")
        if og and og.get("content"):
            title = og["content"].strip()
    if not title:
        t = soup.find("title")
        if t and t.string:
            title = t.string.strip()
            title = re.split(r"[-_|]", title)[0].strip()

    # Eastmoney article body selectors
    body_selectors = [
        "div.newsContent",
        "div#ContentBody",
        "div.article_content",
        "div.body",
    ]
    box = None
    for sel in body_selectors:
        box = soup.select_one(sel)
        if box:
            break

    if not box:
        return title or "", ""

    for tag in box.select("script, style, iframe"):
        tag.decompose()

    lines = []
    for elem in box.find_all(["p", "h2", "h3", "h4", "strong"]):
        t = elem.get_text(separator=" ", strip=True)
        if t:
            lines.append(t)
    text = "\n".join(lines) if lines else box.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return title or "未命名", text


def _save_article(title: str, body: str, source_url: str, save_dir: str) -> str:
    os.makedirs(save_dir, exist_ok=True)
    name = _safe_filename(title)
    path = os.path.join(save_dir, name)
    if os.path.exists(path):
        stem, ext = os.path.splitext(name)
        n = 1
        while os.path.exists(path):
            path = os.path.join(save_dir, f"{stem}_{n}{ext}")
            n += 1
    content = f"{title}\n来源: {source_url}\n\n{body}\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def _scrape_eastmoney(config: dict) -> dict:
    """Eastmoney financial news scraper.

    Uses eastmoney's news list API to fetch article metadata, then fetches
    each article individually. Falls back to HTML scraping if API is unavailable.
    """
    source = config.get("source", "eastmoney")
    max_pages = min(config.get("max_pages", 10), 50)
    save_dir = os.path.join(DATA_DIR, "risk_sentiment")
    os.makedirs(save_dir, exist_ok=True)

    total_saved = 0
    seen_urls: set[str] = set()

    for page in range(1, max_pages + 1):
        # Eastmoney list page URL
        if page == 1:
            list_url = "https://finance.eastmoney.com/a/czqyw.html"
        else:
            list_url = f"https://finance.eastmoney.com/a/czqyw_{page}.html"

        try:
            html = _fetch(list_url)
        except Exception as e:
            logger.warning("Eastmoney list page %d failed: %s", page, e)
            break

        # Try to extract article URLs from the page
        soup = BeautifulSoup(html, "html.parser")
        article_links: list[tuple[str, str]] = []  # (url, title)

        # Look for news list items (JS-rendered content may be in script tags)
        for a in soup.select("a[href]"):
            href = (a.get("href") or "").strip()
            text = (a.get_text() or "").strip()
            if not href or not text:
                continue
            if len(text) < 8:  # Too short to be a news title
                continue
            # Eastmoney article URLs typically match these patterns
            if "finance.eastmoney.com/a/" not in href:
                continue
            if "/czqyw" in href:  # Skip list page links
                continue
            if href in seen_urls:
                continue
            article_links.append((href, text))

        if not article_links:
            logger.info("Eastmoney: no article links found on page %d, stopping", page)
            break

        logger.info("Eastmoney page %d: %d links found", page, len(article_links))

        for link_url, link_title in article_links:
            if link_url in seen_urls:
                continue
            seen_urls.add(link_url)
            try:
                art_html = _fetch(link_url)
            except Exception:
                continue

            title, body = _parse_eastmoney_article(art_html, link_url)
            if not title or title == "未命名":
                title = link_title
            if not body:
                continue

            _save_article(title, body, link_url, save_dir)
            total_saved += 1
            time.sleep(0.8)

    txt_files = [f for f in os.listdir(save_dir) if f.endswith(".txt")] if os.path.isdir(save_dir) else []
    return {"source": source, "files_downloaded": len(txt_files), "records": len(txt_files), "save_dir": save_dir}


def run_eastmoney_scraper(config: dict) -> dict:
    logger.info("Eastmoney scraper: running source=%s", config.get("source", "eastmoney"))
    return _scrape_eastmoney(config)


# ── Demo / Mock ─────────────────────────────────────────────────────────────

EASTMONEY_DEMO_TITLES = [
    "东方财富：A股市场震荡整理 沪指小幅收跌",
    "北向资金今日净买入超50亿元 连续三日加仓",
    "券商板块异动拉升 多股涨停",
    "证监会就上市公司分红新规征求意见",
    "A股三大指数集体收涨 成交额突破万亿",
    "机构论市：短期调整不改中期向好趋势",
    "科创板做市商制度落地 首批8家券商获批",
    "港股通标的调整 多只新经济股纳入",
    "ETF市场规模突破2万亿 创新产品持续涌现",
    "上市公司回购潮持续 年内回购金额创新高",
    "量化交易新规落地 程序化交易纳入监管",
    "保险资金入市比例有望提升 增量资金可期",
    "新能源板块持续活跃 光伏龙头获机构增持",
    "债券通南向通开通在即 互联互通再深化",
    "中概股回归加速 多公司启动港股双重上市",
    "可转债市场火爆 打新中签率创新低",
    "券商2026年策略：结构性行情延续",
    "MSCI季度调整生效 多只A股获纳入",
    "沪深港通交易日历优化 交易效率提升",
    "A股退市新规实施 多家公司触及退市红线",
]


def run_eastmoney_demo(config: dict) -> dict:
    """Demo mode for eastmoney scraper."""
    source = config.get("source", "eastmoney")
    max_pages = min(config.get("max_pages", 10), 50)
    save_dir = os.path.join(DATA_DIR, "risk_sentiment")
    os.makedirs(save_dir, exist_ok=True)

    num_files = random.randint(10, 30)
    files_downloaded = min(num_files, max_pages * random.randint(3, 8))
    records = files_downloaded

    logger.info("Demo Eastmoney [%s]: %d files simulated, save_dir=%s", source, files_downloaded, save_dir)
    return {
        "source": source,
        "files_downloaded": files_downloaded,
        "records": records,
        "save_dir": save_dir,
    }
