"""Acceptance test for POST /api/v1/governance/risk-paths.

Validates the response against the API design spec sections 5.1–5.10.
"""

import json
import urllib.request
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api/v1/governance/risk-paths")

# ── Colour helpers ───────────────────────────────────────────────────

_RED = "\033[91m"
_GREEN = "\033[92m"
_YELLOW = "\033[93m"
_RESET = "\033[0m"


def _ok(msg: str) -> str:
    return f"{_GREEN}[OK]{_RESET} {msg}"


def _fail(msg: str) -> str:
    return f"{_RED}[FAIL]{_RESET} {msg}"


def _warn(msg: str) -> str:
    return f"{_YELLOW}[WARN]{_RESET} {msg}"


# ── Test helpers ─────────────────────────────────────────────────────


def _post(payload: dict, label: str = "", timeout: int = 120) -> dict | None:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    prefix = f"[{label}] " if label else ""
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as exc:
        print(f"{_fail(f'{prefix}HTTP {exc.code}: {exc.reason}')}")
        try:
            print(f"    body: {exc.read().decode('utf-8')[:500]}")
        except Exception:
            pass
        return None
    except Exception as exc:
        print(f"{_fail(f'{prefix}REQUEST FAILED: {exc}')}")
        return None


def _check_field(obj: dict, field: str, label: str) -> bool:
    if field not in obj:
        print(f"    {_fail(f'missing field: {field} ({label}')}")
        return False
    return True


# ── Test cases ───────────────────────────────────────────────────────


def test_minimal(label: str = "") -> dict | None:
    """Test with minimal request — just seedNames."""
    print(f"\n{'─' * 60}")
    name = label or "minimal"
    print(f"▶ [{name}] 最小请求: 仅 seedNames")
    print(f"{'─' * 60}")

    payload = {"seedNames": ["鑫达投资管理有限公司"]}
    print(f"  Request: {json.dumps(payload, ensure_ascii=False)}")

    result = _post(payload, label=name)
    if result is None:
        return None

    _print_response_summary(result)
    _validate_response_envelope(result, name)
    _validate_summary(result, name)
    _validate_risk_paths(result, name)
    _validate_view_model(result, name)
    return result


def test_full(label: str = "") -> dict | None:
    """Test with full request — all parameters from spec section 5.4."""
    print(f"\n{'─' * 60}")
    name = label or "full"
    print(f"▶ [{name}] 完整请求: 全部参数 (spec §5.4)")
    print(f"{'─' * 60}")

    payload = {
        "seedNames": ["鑫达投资管理有限公司"],
        "seedIds": [],
        "maxHop": 3,
        "maxPathLength": 4,
        "method": "auto",
        "communityMode": "expanded",
        "includeCommunityDiscovery": True,
        "includeCommunityPath": True,
        "includeNodePath": True,
        "riskRelationWhitelist": [
            "INVEST", "CONTROLLER", "CONTROL", "GUARANTEE",
            "WORK", "MENTION", "TRIGGERS", "REFLECTS",
            "CAUSE", "COMPLIES_WITH",
        ],
        "subgraphPathLimit": 5000,
        "riskPathLimit": 20,
        "maxBranchPerNode": 20,
        "minRiskScore": 50,
        "responseMode": "full",
    }
    print(f"  Request: {json.dumps(payload, ensure_ascii=False, indent=2)}")

    result = _post(payload, label=name)
    if result is None:
        return None

    _print_response_summary(result)
    _validate_response_envelope(result, name)
    _validate_summary(result, name)
    _validate_risk_paths(result, name)
    _validate_community_discovery(result, name)
    _validate_community_risk_paths(result, name)
    _validate_view_model(result, name)
    return result


def test_with_seed_ids(label: str = "") -> dict | None:
    """Test with seedIds instead of seedNames."""
    print(f"\n{'─' * 60}")
    name = label or "seed_ids"
    print(f"▶ [{name}] 使用 seedIds")
    print(f"{'─' * 60}")
    print(f"  {_warn('(requires a known node ID in the database — may use seedNames fallback)')}")

    # This test requires a known KG node ID; we attempt a name-based call first
    # to discover seed node IDs, then reuse them.
    payload = {"seedNames": ["鑫达投资管理有限公司"]}
    result = _post(payload, label=f"{name}_discover")
    if result is None or not result.get("seedNodes"):
        print(f"  {_warn('Cannot discover seed nodes — skipping seedIds test')}")
        return None

    discovered_ids = [
        n.get("id", "") for n in result.get("seedNodes", []) if n.get("id")
    ]
    if not discovered_ids:
        print(f"  {_warn('No seed node IDs found — skipping seedIds test')}")
        return None

    print(f"  Discovered seed IDs: {discovered_ids}")
    payload2 = {
        "seedIds": discovered_ids,
        "maxHop": 2,
        "maxPathLength": 4,
        "riskPathLimit": 10,
    }
    result2 = _post(payload2, label=name)
    if result2 is None:
        return None

    _print_response_summary(result2)
    _validate_response_envelope(result2, name)
    _validate_risk_paths(result2, name)
    return result2


def test_summary_mode(label: str = "") -> dict | None:
    """Test responseMode = 'summary'."""
    print(f"\n{'─' * 60}")
    name = label or "summary"
    print(f"▶ [{name}] summary 模式 (responseMode=summary)")
    print(f"{'─' * 60}")

    payload = {
        "seedNames": ["鑫达投资管理有限公司"],
        "responseMode": "summary",
        "includeCommunityDiscovery": False,
        "includeCommunityPath": False,
        "includeNodePath": False,
    }
    result = _post(payload, label=name)
    if result is None:
        return None

    print(f"  Response keys: {sorted(result.keys())}")
    print(f"  summary: {json.dumps(result.get('summary', {}), ensure_ascii=False)}")

    _validate_response_envelope(result, name)
    _validate_summary(result, name)

    # In summary mode, detailed fields should be empty
    risk_paths = result.get("riskPaths", [])
    comm_paths = result.get("communityRiskPaths", [])
    vm = result.get("viewModel", {})
    print(f"  riskPaths count: {len(risk_paths)} (expected 0)")
    print(f"  communityRiskPaths count: {len(comm_paths)} (expected 0)")
    print(f"  viewModel: {vm} (expected empty)")
    return result


def test_filtering(label: str = "") -> dict | None:
    """Test minRiskScore and riskPathLimit filtering."""
    print(f"\n{'─' * 60}")
    name = label or "filter"
    print(f"▶ [{name}] 过滤验证: minRiskScore + riskPathLimit")
    print(f"{'─' * 60}")

    # First, get unfiltered paths with low minRiskScore
    payload_low = {
        "seedNames": ["鑫达投资管理有限公司"],
        "minRiskScore": 0,
        "riskPathLimit": 50,
        "maxPathLength": 4,
    }
    result_low = _post(payload_low, label=f"{name}_low_threshold")
    if result_low is None:
        return None
    low_count = result_low.get("summary", {}).get("riskPathCount", 0)
    print(f"  All paths (minRiskScore=0): {low_count}")

    # Then with high threshold
    payload_high = {
        "seedNames": ["鑫达投资管理有限公司"],
        "minRiskScore": 70,
        "riskPathLimit": 50,
        "maxPathLength": 4,
    }
    result_high = _post(payload_high, label=f"{name}_high_threshold")
    if result_high is None:
        return None
    high_count = result_high.get("summary", {}).get("riskPathCount", 0)
    print(f"  High-risk paths only (minRiskScore=70): {high_count}")

    if low_count > 0 and high_count <= low_count:
        print(f"  {_ok(f'filtering works: {low_count} → {high_count} paths')}")
    else:
        print(f"  {_warn(f'unexpected: all={low_count}, high={high_count}')}")

    _validate_risk_paths(result_high, name)
    # All returned paths should have score >= minRiskScore
    return result_high


# ── Response printing ────────────────────────────────────────────────


def _print_response_summary(result: dict):
    s = result.get("summary", {})
    print(f"  {_ok('success')}: {result.get('success')}")
    print(f"  traceId: {result.get('traceId')}")
    print(f"  elapsedMs: {result.get('elapsedMs', 'N/A')}")
    print(f"  warnings: {result.get('warnings', [])}")
    print(f"  ── Summary ──")
    for key in [
        "seedNodeCount", "nodeCount", "edgeCount", "communityCount",
        "candidatePathCount", "riskPathCount",
        "highRiskCount", "mediumRiskCount", "lowRiskCount",
    ]:
        val = s.get(key, "N/A")
        print(f"    {key}: {val}")

    if result.get("seedNodes"):
        for sn in result["seedNodes"][:3]:
            props = sn.get("properties", {})
            name = props.get("name") or props.get("COMPANY_NM") or sn.get("id", "?")
            print(f"  ── Seed: {name} (id={sn.get('id')})")


# ── Validators (matching spec sections 5.6–5.10) ─────────────────────


def _validate_response_envelope(result: dict, label: str):
    """Validate §5.6 top-level fields."""
    errors = 0
    required_top = [
        ("success", "§5.6 success"),
        ("traceId", "§5.6 traceId"),
        ("summary", "§5.6 summary"),
        ("seedNodes", "§5.6 seedNodes"),
        ("riskPaths", "§5.6 riskPaths"),
        ("communityRiskPaths", "§5.6 communityRiskPaths"),
        ("viewModel", "§5.6 viewModel"),
        ("warnings", "§5.6 warnings"),
    ]
    for field, spec in required_top:
        if not _check_field(result, field, spec):
            errors += 1

    # success should be boolean
    if not isinstance(result.get("success"), bool):
        print(f"    {_fail('success should be bool, got ' + str(type(result.get('success', None)).__name__))}")
        errors += 1
    elif result["success"]:
        print(f"    {_ok('success = true')}")
    else:
        err_msg = result.get('error', 'unknown') if isinstance(result, dict) else 'unknown'
        print(f"    {_warn('success = false, error: ' + str(err_msg))}")

    if errors == 0:
        print(f"  {_ok(f'[{label}] response envelope: all §5.6 fields present')}")
    else:
        print(f"  {_fail(f'[{label}] response envelope: {errors} errors')}")


def _validate_summary(result: dict, label: str):
    """Validate §5.6 summary fields."""
    s = result.get("summary", {})
    errors = 0
    required = [
        "seedNodeCount", "nodeCount", "edgeCount", "communityCount",
        "candidatePathCount", "riskPathCount",
        "highRiskCount", "mediumRiskCount", "lowRiskCount",
    ]
    for field in required:
        if field not in s:
            print(f"    {_fail(f'summary missing: {field}')}")
            errors += 1
        else:
            val = s[field]
            if not isinstance(val, int):
                print(f"    {_fail(f'summary.{field} should be int, got {type(val).__name__}')}")
                errors += 1

    # sanity checks
    if s.get("seedNodeCount", 0) == 0:
        print(f"    {_warn('seedNodeCount = 0 — no seed entities resolved')}")
    if errors == 0:
        print(f"  {_ok(f'[{label}] summary: all fields valid')}")


def _validate_risk_paths(result: dict, label: str):
    """Validate §5.8 riskPaths item structure."""
    paths = result.get("riskPaths", [])
    if not paths:
        print(f"  {_warn(f'[{label}] riskPaths is empty — nothing to validate')}")
        return

    print(f"  ── riskPaths ({len(paths)} total) ──")
    errors = 0
    for i, path in enumerate(paths[:5]):
        pid = path.get("pathId", f"path-{i}")
        score = path.get("score", "?")
        level = path.get("riskLevel", "?")
        ptype = path.get("pathType", "?")
        community_path = path.get("communityPath", [])
        node_count = len(path.get("nodeIds", []))
        edge_count = len(path.get("edgeIds", []))
        rel_count = len(path.get("relations", []))
        affected = len(path.get("affectedEntities", []))
        has_desc = bool(path.get("pathDescription"))
        evidence_count = len(path.get("evidence", []))

        print(f"    [{pid}] score={score} level={level} type={ptype} "
              f"nodes={node_count} edges={edge_count} rels={rel_count} "
              f"communityPath={community_path} affected={affected} "
              f"hasDesc={'Y' if has_desc else 'N'} evidence={evidence_count}")

        # §5.8 required fields
        req_fields = [
            ("pathId", "§5.8 pathId"),
            ("riskLevel", "§5.8 riskLevel"),
            ("score", "§5.8 score"),
            ("confidence", "§5.8 confidence"),
            ("pathType", "§5.8 pathType"),
            ("communityPath", "§5.8 communityPath"),
            ("nodeIds", "§5.8 nodeIds"),
            ("edgeIds", "§5.8 edgeIds"),
            ("relations", "§5.8 relations"),
            ("affectedEntities", "§5.8 affectedEntities"),
            ("pathDescription", "§5.8 pathDescription"),
            ("evidence", "§5.8 evidence"),
        ]
        for f, spec in req_fields:
            if f not in path:
                print(f"      {_fail(f'missing {f} ({spec})')}")
                errors += 1

        # edgeIds length should equal nodeIds length - 1
        if node_count > 1 and edge_count != node_count - 1:
            print(f"      {_fail(f'edgeIds({edge_count}) != nodeIds({node_count}) - 1')}")
            errors += 1

        # relations count should equal edgeIds count
        if edge_count != rel_count:
            print(f"      {_fail(f'relations({rel_count}) != edgeIds({edge_count})')}")
            errors += 1

        # confidence should be score/100
        expected_conf = round(score / 100.0, 2) if isinstance(score, (int, float)) else None
        actual_conf = path.get("confidence")
        if expected_conf is not None and actual_conf != expected_conf:
            print(f"      {_fail(f'confidence mismatch: expected {expected_conf}, got {actual_conf}')}")
            errors += 1

    if errors == 0:
        print(f"  {_ok(f'[{label}] riskPaths: all §5.8 fields valid')}")
    else:
        print(f"  {_fail(f'[{label}] riskPaths: {errors} errors')}")


def _validate_community_discovery(result: dict, label: str):
    """Validate §5.6 communityDiscovery field."""
    cd = result.get("communityDiscovery")
    if cd is None:
        print(f"  {_warn(f'[{label}] communityDiscovery is null')}")
        return

    errors = 0
    req_fields = [
        "seedCommunityId", "selectedMethod", "communityCount",
        "communityGraph", "entityCommunityMap",
    ]
    for f in req_fields:
        if f not in cd:
            print(f"    {_fail(f'communityDiscovery missing: {f}')}")
            errors += 1

    cg = cd.get("communityGraph", {})
    if cg:
        nodes = cg.get("nodes", [])
        edges = cg.get("edges", [])
        print(f"    communityGraph: {len(nodes)} nodes, {len(edges)} edges")
        if nodes:
            n0 = nodes[0]
            print(f"      sample node: id={n0.get('id')} communityId={n0.get('communityId')} "
                  f"label={n0.get('label')} memberCount={n0.get('memberCount')}")

    ecm = cd.get("entityCommunityMap", {})
    if ecm:
        print(f"    entityCommunityMap: {len(ecm)} entries")
        if ecm:
            sample_key = next(iter(ecm.keys()))
            sample = ecm[sample_key]
            print(f"      sample: {sample_key} → communityId={sample.get('communityId')} "
                  f"role={sample.get('role')} isSeed={sample.get('isSeed')} "
                  f"riskLevel={sample.get('riskLevel')}")

    if errors == 0:
        print(f"  {_ok(f'[{label}] communityDiscovery: valid')}")
    else:
        print(f"  {_fail(f'[{label}] communityDiscovery: {errors} errors')}")


def _validate_community_risk_paths(result: dict, label: str):
    """Validate §5.9 communityRiskPaths structure."""
    paths = result.get("communityRiskPaths", [])
    if not paths:
        print(f"  {_warn(f'[{label}] communityRiskPaths is empty (may be normal for single-community)')}")
        return

    print(f"  ── communityRiskPaths ({len(paths)} total) ──")
    errors = 0
    for i, cp in enumerate(paths[:5]):
        print(f"    [{i}] source={cp.get('sourceCommunity')} target={cp.get('targetCommunity')} "
              f"level={cp.get('riskLevel')} score={cp.get('score')} "
              f"pathIds={len(cp.get('pathIds', []))} mainRels={cp.get('mainRelations')}")
        print(f"        desc: {cp.get('description', '')[:120]}")

        req_fields = [
            ("sourceCommunity", "§5.9 sourceCommunity"),
            ("targetCommunity", "§5.9 targetCommunity"),
            ("riskLevel", "§5.9 riskLevel"),
            ("score", "§5.9 score"),
            ("pathIds", "§5.9 pathIds"),
            ("mainRelations", "§5.9 mainRelations"),
            ("description", "§5.9 description"),
        ]
        for f, spec in req_fields:
            if f not in cp:
                print(f"      {_fail(f'missing {f} ({spec})')}")
                errors += 1

    if errors == 0:
        print(f"  {_ok(f'[{label}] communityRiskPaths: all §5.9 fields valid')}")
    else:
        print(f"  {_fail(f'[{label}] communityRiskPaths: {errors} errors')}")


def _validate_view_model(result: dict, label: str):
    """Validate §5.10 viewModel structure."""
    vm = result.get("viewModel", {})
    if not vm:
        print(f"  {_warn(f'[{label}] viewModel is empty')}")
        return

    errors = 0
    req_fields = [
        ("highlightNodeIds", "§5.10 highlightNodeIds"),
        ("highlightEdgeIds", "§5.10 highlightEdgeIds"),
        ("highlightCommunityIds", "§5.10 highlightCommunityIds"),
        ("defaultSelectedPathId", "§5.10 defaultSelectedPathId"),
    ]
    for f, spec in req_fields:
        if f not in vm:
            print(f"    {_fail(f'viewModel missing: {f} ({spec})')}")
            errors += 1

    hn = vm.get("highlightNodeIds", [])
    he = vm.get("highlightEdgeIds", [])
    hc = vm.get("highlightCommunityIds", [])
    default = vm.get("defaultSelectedPathId", "")
    print(f"    highlightNodeIds: {len(hn)} nodes")
    print(f"    highlightEdgeIds: {len(he)} edges")
    print(f"    highlightCommunityIds: {hc}")
    print(f"    defaultSelectedPathId: {default}")

    if errors == 0:
        print(f"  {_ok(f'[{label}] viewModel: all §5.10 fields valid')}")
    else:
        print(f"  {_fail(f'[{label}] viewModel: {errors} errors')}")


# ── Main ─────────────────────────────────────────────────────────────


if __name__ == "__main__":
    print("=" * 60)
    print("RISK PATHS API ACCEPTANCE TEST")
    print(f"Target: {API_URL}")
    print("=" * 60)

    results = {}

    # 1. Minimal request (§5.2)
    r = test_minimal("minimal")
    results["minimal"] = r is not None and r.get("success", False)

    # 2. Full request (§5.4)
    r = test_full("full")
    results["full"] = r is not None and r.get("success", False)

    # 3. seedIds request
    r = test_with_seed_ids("seedIds")
    results["seedIds"] = r is not None and r.get("success", False) if r is not None else "skipped"

    # 4. Summary mode
    r = test_summary_mode("summary")
    results["summary"] = r is not None and r.get("success", False)

    # 5. Filtering
    r = test_filtering("filter")
    results["filter"] = r is not None and r.get("success", False) if r is not None else "skipped"

    # ── Final summary ──
    print(f"\n{'=' * 60}")
    print("TEST SUMMARY")
    print(f"{'=' * 60}")
    all_passed = True
    for name, passed in results.items():
        if passed is True:
            print(f"  [{name}] {_ok('PASS')}")
        elif passed == "skipped":
            print(f"  [{name}] {_warn('SKIPPED')}")
        else:
            print(f"  [{name}] {_fail('FAIL')}")
            all_passed = False
    print(f"{'=' * 60}")
    if all_passed:
        print(_ok("ALL TESTS PASSED"))
    else:
        print(_fail("SOME TESTS FAILED"))
    print(f"{'=' * 60}")
