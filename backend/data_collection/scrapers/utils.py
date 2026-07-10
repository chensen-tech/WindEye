"""Shared browser and download utilities for scrapers.

Supports Edge (default, built into Windows Server) and Chrome.
"""

from __future__ import annotations

import functools
import logging
import os
import re
import shutil
import time
from html import unescape
from typing import Optional, Set

import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logger = logging.getLogger(__name__)

BROWSER_ORDER = os.getenv("SCRAPER_BROWSER", "edge,chrome").split(",")


# ── Driver locating ────────────────────────────────────────────────────

def _find_edge_driver() -> Optional[str]:
    """Find msedgedriver: env var > project dir > PATH."""
    explicit = os.getenv("EDGEDRIVER_PATH", "")
    if explicit and os.path.isfile(explicit):
        return explicit
    # Project-bundled
    project = os.path.join(
        os.path.dirname(__file__),
        "edgedriver-win64", "msedgedriver.exe",
    )
    if os.path.isfile(project):
        return project
    return shutil.which("msedgedriver")


def _find_chrome_driver() -> Optional[str]:
    """Find chromedriver: env var > project dir > PATH."""
    explicit = os.getenv("CHROMEDRIVER_PATH", "")
    if explicit and os.path.isfile(explicit):
        return explicit
    project = os.path.join(
        os.path.dirname(__file__),
        "chromedriver-win64", "chromedriver-win64", "chromedriver.exe",
    )
    if os.path.isfile(project):
        return project
    return shutil.which("chromedriver")


# ── Anti-detection ────────────────────────────────────────────────────

def _add_anti_detection(driver: webdriver.Chrome | webdriver.Edge) -> None:
    """Hide webdriver-specific JS properties to work around bot detection."""
    script = """
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """
    try:
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": script})
    except Exception:
        pass


def _build_download_prefs(download_dir: str) -> dict:
    """Return Edge-compatible download prefs dict."""
    os.makedirs(download_dir, exist_ok=True)
    return {
        "download.default_directory": os.path.abspath(download_dir),
        "download.prompt_for_download": False,
        "plugins.always_open_pdf_externally": True,
        "profile.default_content_setting_values.automatic_downloads": 1,
    }


# ── Unified driver creation (Edge-first) ──────────────────────────────

def create_driver(
    download_dir: Optional[str] = None,
    headless: bool = False,
    page_load_timeout: float = 60.0,
) -> webdriver.Chrome | webdriver.Edge:
    """Auto-select browser: Edge > Chrome.  Use SCRAPER_BROWSER env to override.

    Edge is built into Windows Server — no extra install needed.
    """
    errors = []

    for browser in BROWSER_ORDER:
        browser = browser.strip().lower()
        try:
            if browser == "edge":
                return _create_edge_driver(download_dir, headless, page_load_timeout)
            elif browser == "chrome":
                return _create_chrome_driver(download_dir, headless, page_load_timeout)
        except Exception as e:
            errors.append(f"{browser}: {e}")
            logger.warning("Driver creation failed for %s: %s", browser, e)

    raise RuntimeError(
        f"无法创建任何浏览器 WebDriver。已尝试: {', '.join(b.strip() for b in BROWSER_ORDER)}\n"
        f"错误详情: {'; '.join(errors)}\n"
        f"Edge 为 Windows Server 默认浏览器，无需额外安装。"
    )


def _create_edge_driver(
    download_dir: Optional[str] = None,
    headless: bool = False,
    page_load_timeout: float = 60.0,
) -> webdriver.Edge:
    """Create Edge WebDriver with consistent options and anti-detection."""
    options = webdriver.EdgeOptions()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")

    if headless:
        options.add_argument("--headless")

    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    if download_dir:
        options.add_experimental_option("prefs", _build_download_prefs(download_dir))

    driver_path = _find_edge_driver()
    if driver_path:
        logger.info("Using msedgedriver at: %s", driver_path)
        driver = webdriver.Edge(service=EdgeService(driver_path), options=options)
    else:
        logger.info("msedgedriver not found, trying selenium auto-discovery...")
        driver = webdriver.Edge(options=options)

    _add_anti_detection(driver)
    driver.set_page_load_timeout(page_load_timeout)
    _patch_navigator_webdriver(driver)
    return driver


def _create_chrome_driver(
    download_dir: Optional[str] = None,
    headless: bool = False,
    page_load_timeout: float = 60.0,
) -> webdriver.Chrome:
    """Create Chrome WebDriver with consistent options and anti-detection."""
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")

    if headless:
        options.add_argument("--headless")

    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    if download_dir:
        options.add_experimental_option("prefs", _build_download_prefs(download_dir))

    driver_path = _find_chrome_driver()
    if driver_path:
        logger.info("Using chromedriver at: %s", driver_path)
        driver = webdriver.Chrome(service=ChromeService(driver_path), options=options)
    else:
        logger.info("chromedriver not found, trying selenium auto-discovery...")
        driver = webdriver.Chrome(options=options)

    _add_anti_detection(driver)
    driver.set_page_load_timeout(page_load_timeout)
    return driver


def _patch_navigator_webdriver(driver) -> None:
    """Patch navigator.webdriver to avoid detection (Edge-specific)."""
    script = "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
    try:
        driver.execute_script(script)
    except Exception:
        pass


# Backward-compatible alias — scrapers should migrate to create_driver()
create_chrome_driver = _create_chrome_driver


# ── Download helpers ──────────────────────────────────────────────────────

def wait_for_downloads(
    directory: str,
    timeout: int = 60,
    poll_interval: float = 1.0,
) -> bool:
    """Wait until no .crdownload or .tmp files exist in *directory*."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        downloading = any(
            name.lower().endswith((".crdownload", ".tmp"))
            for name in os.listdir(directory)
        )
        if not downloading:
            return True
        time.sleep(poll_interval)
    return False


def wait_for_new_file(
    directory: str,
    before_files: Set[str],
    timeout: int = 45,
    poll_interval: float = 1.0,
) -> Optional[str]:
    """Wait for a new, fully-downloaded file (>1KB) to appear.

    Returns the absolute path of the newest file, or None on timeout.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            current = set(os.listdir(directory))
        except FileNotFoundError:
            time.sleep(poll_interval)
            continue

        new_files = current - before_files
        done = []
        for name in new_files:
            low = name.lower()
            if low.endswith((".crdownload", ".tmp")):
                continue
            full = os.path.join(directory, name)
            if os.path.isfile(full) and os.path.getsize(full) > 1024:
                done.append(full)

        if done:
            done.sort(key=lambda p: os.path.getmtime(p), reverse=True)
            return done[0]

        time.sleep(poll_interval)
    return None


def safe_filename(title: str, max_len: int = 120) -> str:
    """Sanitize a string into a safe filename."""
    title = unescape(title or "").strip()
    title = re.sub(r'[\\/:*?"<>|]', "", title)
    title = " ".join(title.split())
    if not title:
        title = "untitled"
    if len(title) > max_len:
        title = title[:max_len].rstrip()
    return title


def safe_pdf_name(title: str, max_len: int = 120) -> str:
    """Sanitize a title into a safe .pdf filename."""
    name = safe_filename(title, max_len)
    if not name.lower().endswith(".pdf"):
        name += ".pdf"
    return name


def is_valid_pdf(path: str, min_size: int = 1024) -> bool:
    """Check if a file exists, has minimum size, and starts with PDF magic bytes."""
    if not os.path.isfile(path) or os.path.getsize(path) < min_size:
        return False
    try:
        with open(path, "rb") as f:
            magic = f.read(4)
        return magic == b"%PDF"
    except OSError:
        return False


def load_existing_pdf_names(*directories: str) -> Set[str]:
    """Collect lowercase .pdf basenames (>1KB) from one or more directories."""
    names: Set[str] = set()
    for d in directories:
        if not d or not os.path.isdir(d):
            continue
        try:
            for name in os.listdir(d):
                if name.lower().endswith(".pdf") and os.path.getsize(os.path.join(d, name)) > 1024:
                    names.add(name.lower())
        except OSError:
            pass
    return names


def ensure_dir(*paths: str) -> None:
    """Create directories if they don't exist."""
    for p in paths:
        os.makedirs(p, exist_ok=True)


# ── Scraper robustness helpers ──────────────────────────────────────────────

def find_with_fallback(
    driver: webdriver.Chrome,
    xpath_candidates: list[tuple[str, str]],
    timeout: float = 5.0,
):
    """Try multiple XPath selectors, returning (element, matched_description, xpath).

    Returns (None, None, None) if none matched.
    """
    for desc, xpath in xpath_candidates:
        try:
            elem = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )
            logger.info("Structure check: matched '%s' -> %s", desc, xpath)
            return elem, desc, xpath
        except Exception:
            continue
    logger.error(
        "Structure change detected: none of %d selectors matched. Candidates: %s",
        len(xpath_candidates),
        [x[1] for x in xpath_candidates],
    )
    return None, None, None


def log_element_failure(
    scraper_logger,
    page_label: str,
    element_desc: str,
    xpath: str = "",
    exception: Exception | None = None,
    page_url: str = "",
) -> None:
    """Structured logging for element-not-found or interaction failures."""
    scraper_logger.error(
        "Scraper element failure: page=%s element=%s xpath=%s url=%s error=%s",
        page_label,
        element_desc,
        xpath,
        page_url,
        str(exception) if exception else "unknown",
    )


def retry_on_network_error(max_attempts: int = 3, base_delay: float = 2.0):
    """Decorator: retry function on network-related exceptions with exponential backoff."""
    NETWORK_ERRORS = (
        requests.ConnectionError,
        requests.Timeout,
        requests.HTTPError,
        ConnectionError,
        TimeoutError,
        OSError,
    )

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except NETWORK_ERRORS as e:
                    last_err = e
                    if attempt < max_attempts:
                        delay = base_delay * (2 ** (attempt - 1))
                        logger.warning(
                            "Retry %d/%d after %.1fs: %s - %s",
                            attempt, max_attempts, delay, func.__name__, e,
                        )
                        time.sleep(delay)
                except Exception:
                    raise
            raise last_err  # type: ignore[misc]

        return wrapper

    return decorator
