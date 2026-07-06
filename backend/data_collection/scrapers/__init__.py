"""Web scrapers for multi-source data acquisition.

Two scrapers: risk_event (风险事件) and risk_sentiment (风险舆情).
Temp directories: KG_DATA_DIR/temp/risk_events/{source}/ and KG_DATA_DIR/temp/risk_sentiment/
"""

from data_collection.scrapers.risk_event_scraper import (
    run_risk_event_demo,
    run_risk_event_scraper,
)
from data_collection.scrapers.risk_sentiment_scraper import (
    run_risk_sentiment_demo,
    run_risk_sentiment_scraper,
)

__all__ = [
    "run_risk_event_scraper",
    "run_risk_sentiment_scraper",
    "SCRAPER_REGISTRY",
    "DEMO_SCRAPER_REGISTRY",
]

SCRAPER_REGISTRY = {
    "risk_event": run_risk_event_scraper,
    "risk_sentiment": run_risk_sentiment_scraper,
}

DEMO_SCRAPER_REGISTRY = {
    "risk_event": run_risk_event_demo,
    "risk_sentiment": run_risk_sentiment_demo,
}