"""Risk Sentiment Scraper — 风险舆情爬取 (financial news / market sentiment).

Sources: stockstar (证券之星财经新闻), eastmoney (东方财富), sina (新浪财经)
Temp dir: data/risk_sentiment/
"""

from __future__ import annotations

import logging
import os
import random
import re
import time
from html import unescape
from urllib.parse import urljoin, urlparse

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
}

# ── Real scraper ────────────────────────────────────────────────────────────


def _ensure_encoding(resp: requests.Response) -> None:
    if not resp.encoding or resp.encoding.lower() == "iso-8859-1":
        enc = resp.apparent_encoding or "utf-8"
        try:
            resp.encoding = enc
        except Exception:
            resp.encoding = "utf-8"


def _safe_filename(title: str, max_len: int = 120) -> str:
    title = unescape(title or "").strip()
    title = re.sub(r'[\\/:*?"<>|]', "", title)
    title = " ".join(title.split())
    if not title:
        title = "untitled"
    if len(title) > max_len:
        title = title[:max_len].rstrip()
    return title + ".txt"


def _list_page_url(page_index: int) -> str:
    base = "https://finance.stockstar.com/list/1221"
    if page_index <= 1:
        return base + ".shtml"
    return f"{base}_{page_index}.shtml"


def _is_article_url(url: str, base_netloc: str) -> bool:
    if not url or url.startswith("#") or "javascript:" in url.lower():
        return False
    try:
        p = urlparse(url)
    except Exception:
        return False
    if p.netloc and p.netloc != base_netloc and "stockstar.com" not in p.netloc:
        return False
    path = (p.path or "").lower()
    if "/list/" in path:
        return False
    if path.endswith((".shtml", ".html", ".htm")):
        return "list/" not in path
    return False


def _extract_links(html: str, list_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    base = urlparse(list_url)
    base_netloc = base.netloc or "finance.stockstar.com"
    seen: set[str] = set()
    out: list[str] = []
    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        full = urljoin(list_url, href).split("#")[0]
        if not _is_article_url(full, base_netloc):
            continue
        if full in seen:
            continue
        seen.add(full)
        out.append(full)
    return out


@retry_on_network_error(max_attempts=3, base_delay=2.0)
def _fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=25)
    r.raise_for_status()
    _ensure_encoding(r)
    return r.text


def _parse_article(html: str) -> tuple[str, str]:
    """Return (title, body_text)."""
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

    box = soup.select_one("div.article_content")
    if not box:
        box = soup.select_one("#Detail .article_content")
    if not box:
        box = soup.select_one(".article .article_content")

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


def _scrape_stockstar(config: dict) -> dict:
    """Stockstar financial news scraper — 证券之星财经新闻."""
    source = config.get("source", "stockstar")
    max_pages = min(config.get("max_pages", 10), 50)
    save_dir = os.path.join(DATA_DIR, "risk_sentiment")
    os.makedirs(save_dir, exist_ok=True)

    total_saved = 0
    seen_urls: set[str] = set()

    for page in range(1, max_pages + 1):
        url = _list_page_url(page)
        try:
            html = _fetch(url)
        except Exception as e:
            logger.warning("Sentiment stockstar list page %d failed: %s", page, e)
            break

        links = _extract_links(html, url)
        if not links:
            logger.info("Sentiment stockstar: no links on page %d, stopping pagination", page)
            break

        logger.info("Sentiment stockstar page %d: %d links", page, len(links))

        for link in links:
            if link in seen_urls:
                continue
            seen_urls.add(link)
            try:
                art_html = _fetch(link)
            except Exception:
                continue

            title, body = _parse_article(art_html)
            if not body:
                continue

            _save_article(title, body, link, save_dir)
            total_saved += 1
            time.sleep(0.6)

    txt_files = [f for f in os.listdir(save_dir) if f.endswith(".txt")] if os.path.isdir(save_dir) else []
    return {"source": source, "files_downloaded": len(txt_files), "records": len(txt_files), "save_dir": save_dir}


def run_risk_sentiment_scraper(config: dict) -> dict:
    """Entry point: dispatch to source-specific sentiment scraper."""
    source = config.get("source", "stockstar")
    scraper_fns = {
        "stockstar": _scrape_stockstar,
    }
    # Lazy-import eastmoney to avoid circular dependency
    try:
        from data_collection.scrapers.eastmoney_scraper import run_eastmoney_scraper
        scraper_fns["eastmoney"] = run_eastmoney_scraper
    except ImportError:
        pass
    fn = scraper_fns.get(source, _scrape_stockstar)
    logger.info("RiskSentiment scraper: running source=%s", source)
    return fn(config)


# ── Demo / Mock ─────────────────────────────────────────────────────────────

DEMO_SENTIMENT_TITLES = [
    "A股三大指数集体收跌 市场避险情绪升温",
    "监管层重拳出击 多家上市公司遭立案调查",
    "年报披露季来临 退市风险警示密集发布",
    "证监会发布新规 强化上市公司信息披露要求",
    "沪指跌破3000点 两市成交额持续萎缩",
    "北向资金大幅净流出 市场风险偏好下降",
    "上市公司违规担保风险持续暴露",
    "债券违约风险上升 信用分层加剧",
    "科创板公司业绩分化明显 退市风险隐现",
    "大宗商品价格波动加剧 产业链风险传导",
    "多家上市公司业绩预告大幅下修",
    "监管层就财务造假问题密集发声",
    "新三板改革深化 转板机制优化",
    "险资入市步伐加快 权益投资占比提升",
    "上市公司股权质押风险局部暴露",
    "房地产行业债务风险持续化解",
    "银行理财净值波动加大 投资者风险偏好下行",
    "地方债务化解方案加速出台",
    "券商密集发布风险提示 关注市场回调压力",
    "量化交易监管趋严 程序化交易规则落地",
]


def run_risk_sentiment_demo(config: dict) -> dict:
    """Demo mode — generate realistic mock sentiment text files without web scraping.

    Creates actual .txt files so they flow through the ETL pipeline identically
    to real scraped files.
    """
    source = config.get("source", "stockstar")
    # Dispatch to eastmoney demo if source is eastmoney
    if source == "eastmoney":
        try:
            from data_collection.scrapers.eastmoney_scraper import run_eastmoney_demo
            return run_eastmoney_demo(config)
        except ImportError:
            pass

    max_pages = min(config.get("max_pages", 10), 50)
    save_dir = os.path.join(DATA_DIR, "risk_sentiment")
    os.makedirs(save_dir, exist_ok=True)

    # Clean up previous demo files
    for old_name in os.listdir(save_dir):
        old_path = os.path.join(save_dir, old_name)
        if os.path.isfile(old_path) and old_name.startswith("DEMO_"):
            try:
                os.remove(old_path)
            except OSError:
                pass

    num_files = min(random.randint(10, 20), max_pages * 8)
    demo_sources = ["证券之星", "东方财富", "新浪财经", "华尔街见闻", "第一财经"]
    demo_tags = ["市场风险", "政策解读", "上市公司", "行业分析", "监管动态"]

    files_created = 0
    for i in range(num_files):
        title = random.choice(DEMO_SENTIMENT_TITLES)
        news_source = random.choice(demo_sources)
        tag = random.choice(demo_tags)
        date_str = f"2026-{(i % 5) + 1:02d}-{(i % 28) + 1:02d}"
        safe_title = title.replace("/", "-").replace(":", "-").replace("*", "").replace("?", "").replace('"', "").replace("<", "").replace(">", "").replace("|", "")
        filename = f"DEMO_{source}_{date_str}_{safe_title[:40]}.txt"

        filepath = os.path.join(save_dir, filename)
        content = (
            f"{title}\n"
            f"来源: {news_source} | 日期: {date_str} | 标签: {tag}\n"
            f"\n"
            f"【{tag}】{title}。近日，资本市场风险偏好持续走低，投资者情绪趋于谨慎。"
            f"分析人士指出，当前市场面临多重不确定性因素，包括宏观经济下行压力、"
            f"地缘政治风险以及部分行业政策调整等。监管层表示将继续加强市场风险监测，"
            f"维护资本市场平稳运行。\n"
            f"\n"
            f"（本文为 WindEye Demo 模式生成的模拟舆情数据，用于 ETL 流水线测试）\n"
        )
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        files_created += 1

    logger.info("Demo RiskSentiment [%s]: %d mock txt files created in %s", source, files_created, save_dir)
    return {
        "source": source,
        "files_downloaded": files_created,
        "records": files_created,
        "save_dir": save_dir,
    }
