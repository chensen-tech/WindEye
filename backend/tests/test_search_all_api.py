"""Standalone acceptance test for POST /api/v1/graph/search-all.

Usage::

    # default company + both layers
    python tests/test_search_all_api.py

    # specify company name
    python tests/test_search_all_api.py 徐工集团工程机械股份有限公司

    # specify company + custom API URL
    python tests/test_search_all_api.py 华创控股集团 http://127.0.0.1:8000

Output::
    output/search_all_{layer}_{company}_{timestamp}.json
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.request
from datetime import datetime

API_URL = os.getenv("SEARCH_ALL_API_URL", "http://127.0.0.1:8000/api/v1/graph/search-all")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")


def search(
    company: str,
    *,
    layer: str = "all",
    depth: int = 2,
    limit: int = 0,
    output_format: str = "triples",
    api_url: str = API_URL,
) -> dict | None:
    """Call POST /api/v1/graph/search-all and return the JSON response."""

    request_body = {
        "query": company,
        "layer": layer,
        "depth": depth,
        "limit": limit,
        "type": "all",
        "relationWhitelist": [],
        "includeProperties": True,
        "outputFormat": output_format,
        "deduplicate": True,
    }

    data = json.dumps(request_body, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        print(f"  REQUEST FAILED: {exc}")
        return None

    return result


def save_triples(result: dict | list, company: str, layer: str, output_dir: str = OUTPUT_DIR) -> str | None:
    """Save the triples array to a JSON file.  Returns the file path."""
    if isinstance(result, list):
        triples = result
        summary = {}
        matched = []
        warnings = []
    else:
        triples = result.get("triples", [])
        summary = result.get("summary", {})
        matched = result.get("matchedNodes", [])
        warnings = result.get("warnings", [])

    if not triples:
        print("  No triples returned — skipping file save.")
        return None

    os.makedirs(output_dir, exist_ok=True)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = company.replace("/", "_").replace("\\", "_")[:30]
    filename = f"search_all_{layer}_{safe_name}_{ts}.json"
    filepath = os.path.join(output_dir, filename)

    if isinstance(result, list):
        payload = result
    else:
        payload = {
            "query": company,
            "layer": layer,
            "depth": result.get("requestDepth", 2),
            "generatedAt": datetime.now().isoformat(),
            "summary": summary,
            "matchedNodes": matched,
            "warnings": warnings,
            "triples": triples,
        }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return filepath


def print_summary(result: dict | list, layer: str, elapsed: float) -> None:
    """Print a human-readable summary of the response."""
    if isinstance(result, list):
        success = True
        trace_id = "N/A"
        summary = {}
        triples = result
        matched = []
        warnings = []
    else:
        success = result.get("success", False)
        trace_id = result.get("traceId", "?")
        summary = result.get("summary", {})
        triples = result.get("triples", [])
        matched = result.get("matchedNodes", [])
        warnings = result.get("warnings", [])

    print(f"  [{layer}]  success={success}  traceId={trace_id}  time={elapsed:.1f}s")
    print(f"           matchedNodes={len(matched)}  "
          f"nodeCount={summary.get('nodeCount', 0)}  "
          f"edgeCount={summary.get('edgeCount', 0)}  "
          f"tripleCount={summary.get('tripleCount', len(triples))}")
    print(f"           layers={summary.get('layers', [])}")
    print(f"           relationTypes={summary.get('relationTypes', [])}")

    if matched:
        names = [m.get("properties", {}).get("name", m.get("id", "?")) for m in matched[:5]]
        print(f"           top matched: {names}")

    if triples:
        # show first 3 triples as samples
        for t in triples[:3]:
            print(f"           ({t['head']}) -[{t['relation']}]-> ({t['tail']})")

    if warnings:
        for w in warnings:
            print(f"           WARNING: {w}")


def main() -> None:
    company = sys.argv[1] if len(sys.argv) > 1 else "徐工集团工程机械股份有限公司"
    api_url = sys.argv[2] if len(sys.argv) > 2 else API_URL

    print("=" * 70)
    print(f"  SEARCH-ALL ACCEPTANCE TEST")
    print(f"  Company : {company}")
    print(f"  API URL : {api_url}")
    print(f"  Mode    : 2-hop full + 3-hop preview  |  Format : triples")
    print("=" * 70)

    cases = (
        ("all", 2, 500, "2-hop full"),
        ("Subject", 2, 500, "2-hop full"),
        ("all", 3, 1000, "3-hop preview"),
    )

    for layer, depth, limit, label in cases:
        print(f"\n--- {label} | layer={layer} | depth={depth} | limit={limit} ---")
        t0 = time.monotonic()
        result = search(company, layer=layer, depth=depth, limit=limit, api_url=api_url)
        elapsed = time.monotonic() - t0

        if result is None:
            continue
        if isinstance(result, dict):
            result["requestDepth"] = depth

        print_summary(result, layer, elapsed)

        filepath = save_triples(result, company, layer)
        if filepath:
            triples_count = len(result) if isinstance(result, list) else len(result.get("triples", []))
            print(f"  Saved {triples_count} triples → {filepath}")

    print("\nDone.")


if __name__ == "__main__":
    main()
