# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice


---

## [LRN-20260527-002] best_practice

**Logged**: 2026-05-27T14:00:00Z
**Priority**: high
**Status**: resolved
**Area**: backend

### Summary
`_build_community_list` only stored 10 `top_entities` IDs, making `get_community_subgraph` return incomplete subgraphs for communities > 10 nodes.

### Details
The `_build_community_list` method capped entity storage at 10 (`for m in members[:10]`), stored as `top_entities`. The `get_community_subgraph` endpoint used only `top_entities` IDs to fetch nodes, and when a community had more members, it re-ran WCC detection (expensive!) but still only got 10 IDs because `top_entities` was always limited. Communities with more than 10 members would always show incomplete subgraphs.

### Fix
Added a `member_ids` field to the community dict storing up to 500 member element IDs. Updated `get_community_subgraph` to use `member_ids` first, with `top_entities` as fallback. No longer re-runs WCC for the second attempt.

### Metadata
- Source: code_review
- Related Files: backend/kg_query/analytics/graph_analytics.py:516-534,556-637
- Tags: community-detection, subgraph, data-loss

### Resolution
- **Resolved**: 2026-05-27T14:00:00Z
- **Notes**: Added `member_ids` list (up to 500) to community output. `get_community_subgraph` now reads `member_ids` directly instead of re-running detection.

---

## [LRN-20260527-003] correction

**Logged**: 2026-05-27T14:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
RightPanel did not auto-switch to detail tab when a community was selected, requiring manual tab navigation.

### Details
After clicking a community in the list or graph, the right panel stayed on the "群体列表" tab instead of auto-switching to "群体详情" to show the selected community's information. The user had to manually click the detail tab to see stats, core nodes, and risk assessment.

### Fix
Added controlled `activeTab` / `onTabChange` props to RightPanel. The parent component now tracks `rightPanelTab` state. `handleSelectCommunity` sets tab to 'detail', `handleClearSelection` and `handleReset` reset to 'list'.

### Metadata
- Source: code_review
- Related Files: frontend/src/pages/CommunityDiscovery/components/RightPanel.tsx, frontend/src/pages/CommunityDiscovery/index.tsx
- Tags: ux, tab-navigation, community-detail

### Resolution
- **Resolved**: 2026-05-27T14:00:00Z
- **Notes**: RightPanel now accepts `activeTab` and `onTabChange` props. Selection auto-navigates to detail tab.

---

## [LRN-20260527-004] best_practice

**Logged**: 2026-05-27T14:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
`loadFullGraph` loaded community subgraphs sequentially, causing slow load times for the immersive graph view.

### Details
The function looped through up to 10 communities with `await getCommunityGraph(...)` one at a time (`for...of` + `await`). Each call is independent, so this serialized what could be parallel I/O. If each call took 200ms, the total load time was ~2s. With `Promise.all`, the total time is ~200ms (slowest call).

### Fix
Changed to `Promise.all(topCommunities.map(c => getCommunityGraph(...).catch(() => null)))` with per-community error handling. A single failing community no longer blocks the entire graph load.

### Metadata
- Source: code_review
- Related Files: frontend/src/pages/CommunityDiscovery/index.tsx:44-71
- Tags: performance, parallel-loading, graph-data

### Resolution
- **Resolved**: 2026-05-27T14:00:00Z
- **Notes**: Parallelized with Promise.all + per-request catch. Failed communities return null and are skipped.

## [LRN-20260527-001] correction

**Logged**: 2026-05-27T12:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: backend

### Summary
EntityCleaner Layer 2 (`_clean_by_type`) removed all valid entities because IntentAgent's natural-language type names don't match Neo4j's concrete labels.

### Details
IntentAgent outputs `Expected_Answer_Type` values like "organization", "person", "event" — natural language types. The original `_clean_by_type` checked `expected_lower in lbl` (e.g., `"organization" in "company"`), which always failed because Neo4j labels use technical names like "COMPANY", "Subject", "PFUND". This caused all valid entities to be removed (3→0 in the user's test case for "鑫达投资管理有限公司").

### Fix
Added a two-level mapping:
1. `INTENT_TYPE_TO_LAYER`: maps natural-language types (e.g. "organization") to ontology layer keys (e.g. "Subject")
2. `layer_labels` from `ontology_finance.json`: maps layer keys to concrete Neo4j labels (e.g. "Subject" → ["COMPANY", "PERSON", "PFCOMPANY", ...])
3. Type check uses set intersection: `if labels & allowed_labels` — any overlap passes

### Metadata
- Source: user_feedback
- Related Files: backend/dra_ma/skills/consensus/entity_cleaner.py
- Tags: entity-cleaning, type-mapping, ontology

### Resolution
- **Resolved**: 2026-05-27T12:00:00Z
- **Notes**: Changed from substring matching to semantic type mapping with set intersection. Unknown types are now skipped gracefully (keep all) instead of removing all.

---

## [LRN-20260527-005] best_practice

**Logged**: 2026-05-27T15:00:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
Force layout without pre-positioning caused all communities to collapse into a single undifferentiated mass, making it impossible to visually distinguish communities.

### Details
The G6 force layout was initialized with all nodes at (0,0), causing the force simulation to pull everything into one central cluster before slowly separating. This resulted in:
- Communities visually indistinguishable from each other
- Convex hulls overlapping heavily
- Poor visual communication of community structure
- Users couldn't tell which nodes belonged to which community

### Fix
Added community-aware pre-layout before force simulation:
1. Compute community centers arranged in a circle (radius = 32% of viewport)
2. Place each community's nodes in a local circle around their center (radius proportional to community size)
3. Add subtle random jitter to prevent perfect grid alignment
4. Force layout refines from these good initial positions rather than starting from scratch
5. Tuned force parameters: higher gravity (12), lower linkDistance (55), slower alphaDecay (0.006) for gentler convergence

### Metadata
- Source: user_feedback
- Related Files: frontend/src/pages/CommunityDiscovery/hooks/useCommunityGraph.ts:129-143
- Tags: force-layout, community-visualization, pre-layout, g6

### Resolution
- **Resolved**: 2026-05-27T15:00:00Z
- **Notes**: Pre-layout arranges communities in a circle with local node distribution. Force layout gently refines rather than fighting against random initialization.
