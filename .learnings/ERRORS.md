# Errors

Command failures and integration errors.

---

## [ERR-20260527-001] Community subgraph — edges silently truncated

**Logged**: 2026-05-27T15:00:00Z
**Priority**: critical
**Status**: resolved
**Area**: backend

### Summary
The edges query in `get_community_subgraph` used the same `$limit` parameter as the nodes query, silently dropping edges when a community had more internal edges than the limit.

### Error
- `loadFullGraph` called `getCommunityGraph(id, layer, 100)` 
- Nodes were capped at 100 (from up to 500 member_ids)
- Edges were ALSO capped at 100 by `LIMIT $limit`
- Communities with dense internal connections (e.g., 50 nodes, 200+ edges) lost ~50% of edges
- No warning or error surfaced to the user

### Context
- The `limit` parameter was reused for both nodes and edges queries
- Frontend passed `limit=100` for full graph loading
- `member_ids` stores up to 500 IDs but nodes were capped at the frontend limit

### Fix
1. Removed `LIMIT` from edges query — edges are naturally bounded by `|nodes|²`
2. Increased `loadFullGraph` limit from 100 → 500 to match `member_ids` capacity
3. Removed unnecessary `src`/`tgt` projections from edge query

### Metadata
- Reproducible: yes
- Related Files: backend/kg_query/analytics/graph_analytics.py:612-625, frontend/src/pages/CommunityDiscovery/index.tsx:50-53
- See Also: LRN-20260527-002

### Resolution
- **Resolved**: 2026-05-27T15:00:00Z
- **Notes**: Edge query now has no LIMIT. Node limit raised to 500 to match member_ids size. Frontend passes limit=500.