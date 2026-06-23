"""Phase 1 acceptance test for POST /api/v1/governance/community-discovery."""
import json
import urllib.request

API_URL = "http://127.0.0.1:8000/api/v1/governance/community-discovery"


def test(method, max_hop=3, seed="鑫达投资管理有限公司", label="", response_mode="full", include_raw_subgraph=True, include_community_graph=True, auto_select_seeds=False):
    request_body = {
        "seedNames": [seed],
        "seedIds": [],
        "autoSelectSeeds": auto_select_seeds,
        "topKSeeds": 5,
        "seedSelectionMode": "risk_score",
        "riskConstraints": {
            "includeSubjectRelations": True,
            "includeEventRelations": True,
            "includeFeatureRelations": True,
            "includeRegulationRelations": False
        },
        "maxHop": max_hop,
        "method": method,
        "communityMode": "expanded",
        "minCommunitySize": 2,
        "pathLimit": 5000,
        "maxNodes": 1000,
        "relationWhitelist": [],
        "responseMode": response_mode,
        "includeRawSubgraph": include_raw_subgraph,
        "includeCommunityGraph": include_community_graph,
        "includeHgtEmbedding": False,
    }

    data = json.dumps(request_body, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        print(f"[{label}] REQUEST FAILED: {exc}")
        return None

    csg = result.get("connectedSubgraph") or {}
    csg_nc = csg.get("nodeCount", 0)
    communities = result.get("communities") or []
    cg = result.get("communityGraph") or {}
    scid = result.get("seedCommunityId")
    seed_nodes = result.get("seedNodes") or []
    subgraph = result.get("subgraph") or {}

    name = label or f"{method}_h{max_hop}"

    cand_seeds = result.get("candidateSeeds", [])
    print(f"[{name}] selectedMethod={result.get('selectedMethod')} "
          f"subgraph={subgraph.get('nodeCount',0)}n/{subgraph.get('edgeCount',0)}e "
          f"connected={csg_nc}n/{csg.get('edgeCount',0)}e "
          f"communities={len(communities)} "
          f"cgNodes={len(cg.get('nodes',[]))} "
          f"cgEdges={len(cg.get('edges',[]))} "
          f"seedCid={scid} "
          f"seedNode={seed_nodes[0].get('name','?') if seed_nodes else 'NONE'} "
          f"candidates={len(cand_seeds)} "
          f"fallback={result.get('fallbackReason')}")

    if cand_seeds and request_body.get("autoSelectSeeds"):
        print(f"  Candidate Seeds (Top 3):")
        for c in cand_seeds[:3]:
            print(f"    - {c.get('name')} (Score: {c.get('riskScore')}) Reason: {c.get('reason')}")
        print(f"  Seed Selection Info: {result.get('seedSelection')}")

    for c in communities:
        members_sample = [m.get('name', '?') for m in c.get('members', [])[:5]]
        print(f"  Community {c.get('communityId')}: size={c.get('size')} "
              f"density={c.get('density')} labels={c.get('labelDistribution')}")
        print(f"    top members: {members_sample}")

    if cg.get('edges'):
        for e in cg['edges']:
            print(f"  CG Edge: {e.get('source')} -> {e.get('target')} "
                  f"rels={e.get('relationCount')} [{e.get('riskLevel')}] "
                  f"types={e.get('mainRelations')}")

    # Verify entityCommunityMap uses node_id as key
    ecm = result.get("entityCommunityMap", {})
    if ecm:
        sample_key = next(iter(ecm.keys()))
        print(f"  entityCommunityMap key sample: {sample_key[:50]}... (type={type(sample_key).__name__})")
        sample_val = ecm[sample_key]
        print(f"    -> communityId={sample_val.get('communityId')} role={sample_val.get('role')} isSeed={sample_val.get('isSeed')} riskLevel={sample_val.get('riskLevel')}")

    return result


if __name__ == "__main__":
    print("=" * 60)
    print("PHASE 1 ACCEPTANCE TEST")
    print("=" * 60)

    # 1. Standard tests with different hop counts
    print("--- Standard full response (auto, 3 hops) ---")
    test("auto", max_hop=3, label="auto_h3")
    print()

    # 2. Test responseMode = "summary"
    print("--- Test responseMode = 'summary' ---")
    res_summary = test("auto", max_hop=3, label="summary_mode", response_mode="summary")
    if res_summary:
        print("Keys returned in summary mode:", sorted(res_summary.keys()))
    print()

    # 3. Test includeRawSubgraph = False
    print("--- Test includeRawSubgraph = False ---")
    res_no_raw = test("auto", max_hop=3, label="no_raw_subgraph", include_raw_subgraph=False)
    if res_no_raw:
        print("subgraph key value:", res_no_raw.get("subgraph"))
    print()

    # 4. Test includeCommunityGraph = False
    print("--- Test includeCommunityGraph = False ---")
    res_no_cg = test("auto", max_hop=3, label="no_community_graph", include_community_graph=False)
    if res_no_cg:
        print("communityGraph key value:", res_no_cg.get("communityGraph"))
        print("communityEdges key value:", res_no_cg.get("communityEdges"))
    print()

    # 5. Test Auto Select Seeds
    print("--- Test Auto Select Seeds ---")
    # Using an event seed or abstract company to trigger multi-hop candidate finding
    res_auto = test("auto", max_hop=2, seed="徐工集团", label="auto_seeds", auto_select_seeds=True)
    if res_auto:
        print("Successfully tested auto-select seeds feature.")
    print()
