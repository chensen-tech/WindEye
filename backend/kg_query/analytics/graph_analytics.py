"""Graph analytics algorithms for community detection and pattern discovery."""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any, Callable

import numpy as np
from scipy.sparse import csr_matrix, lil_matrix

logger = logging.getLogger(__name__)

# Layer label mapping — mirrors graph_routes.py
_LAYER_LABEL_MAP: dict[str, list[str]] = {
    "Subject": ["Subject", "COMPANY", "PERSON", "PFCOMPANY", "PFUND", "SECURITY"],
    "Event": ["Event", "EVENT", "TIME", "REGULATOR"],
    "Feature": ["Feature", "RiskFeature", "RiskFactor"],
    "Regulation": ["Regulation", "Law", "Action"],
}
_ALL_VALID_LABELS = [label for labels in _LAYER_LABEL_MAP.values() for label in labels]


def _layer_filter(layer: str | None) -> list[str]:
    if layer and layer in _LAYER_LABEL_MAP:
        return _LAYER_LABEL_MAP[layer]
    return _ALL_VALID_LABELS


class UnionFind:
    """Disjoint Set Union for connected components."""

    def __init__(self) -> None:
        self._parent: dict[int, int] = {}
        self._rank: dict[int, int] = {}

    def add(self, x: int) -> None:
        if x not in self._parent:
            self._parent[x] = x
            self._rank[x] = 0

    def find(self, x: int) -> int:
        path: list[int] = []
        while self._parent[x] != x:
            path.append(x)
            x = self._parent[x]
        for node in path:
            self._parent[node] = x
        return x

    def union(self, x: int, y: int) -> None:
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return
        if self._rank[rx] < self._rank[ry]:
            self._parent[rx] = ry
        elif self._rank[rx] > self._rank[ry]:
            self._parent[ry] = rx
        else:
            self._parent[ry] = rx
            self._rank[rx] += 1

    def components(self) -> dict[int, list[int]]:
        groups: dict[int, list[int]] = defaultdict(list)
        for node in self._parent:
            groups[self.find(node)].append(node)
        return dict(groups)


class GraphAnalytics:
    """Graph algorithms for the knowledge graph.

    Supported analyses:
    - Community detection (WCC, Louvain, Label Propagation)
    - Centrality metrics (PageRank, Betweenness)
    - Cycle detection (fund circular flows)
    """

    def __init__(self, db_client: Any = None) -> None:
        self._db = db_client

    # ── Community Detection ──────────────────────────────────────────

    def detect_communities(
        self,
        layer: str | None = None,
        method: str = "wcc",
        max_nodes: int = 5000,
        min_community_size: int = 3,
    ) -> dict[str, Any]:
        """Detect communities in the graph.

        Args:
            layer: Filter to layer (all/Subject/Event/Feature/Regulation).
            method: Algorithm — "wcc", "louvain", or "label_propagation".
            max_nodes: Max nodes to analyze.
            min_community_size: Filter out communities smaller than this.

        Returns:
            Dict with communities list and metadata.
        """
        methods: dict[str, Callable] = {
            "wcc": self._wcc_communities,
            "louvain": self._louvain_communities,
            "label_propagation": self._label_propagation_communities,
        }
        if method not in methods:
            return {"success": False, "error": f"Unknown method: {method}"}

        labels = _layer_filter(layer)
        communities, modularity = methods[method](labels, max_nodes, min_community_size)

        return {
            "success": True,
            "method": method,
            "modularity": round(modularity, 4),
            "communities_count": len(communities),
            "communities": communities,
        }

    # ── WCC via Union-Find ───────────────────────────────────────────

    def _wcc_communities(
        self, labels: list[str], max_nodes: int, min_size: int
    ) -> tuple[list[dict], float]:
        if self._db is None:
            return [], 0.0

        label_conditions = " OR ".join([f"n:{lbl}" for lbl in labels])

        query = f"""
        MATCH (n)
        WHERE {label_conditions}
        WITH n LIMIT $max_nodes
        MATCH (n)-[r]-(m)
        WHERE {label_conditions} AND elementId(n) < elementId(m)
        RETURN elementId(n) AS src, elementId(m) AS tgt, labels(m) AS m_labels
        LIMIT $max_nodes * 3
        """
        try:
            records, _ = self._db.execute_read_with_summary(
                query, {"max_nodes": max_nodes}
            )
        except Exception:
            logger.exception("WCC edge extraction failed")
            return [], 0.0

        # Union-Find on edges
        uf = UnionFind()
        edge_set: set[tuple[str, str]] = set()
        for record in records:
            src, tgt = record.get("src"), record.get("tgt")
            if src and tgt:
                uf.add(hash(src))
                uf.add(hash(tgt))
                uf.union(hash(src), hash(tgt))
                edge_set.add((str(src), str(tgt)))

        # Also add isolated nodes (single-node components)
        try:
            node_query = f"""
            MATCH (n) WHERE {label_conditions}
            WITH n LIMIT $max_nodes
            RETURN elementId(n) AS nid, labels(n) AS lbls
            """
            node_records, _ = self._db.execute_read_with_summary(
                node_query, {"max_nodes": max_nodes}
            )
        except Exception:
            logger.exception("Node extraction failed")
            node_records = []

        node_info: dict[str, dict] = {}
        for record in node_records:
            nid = str(record.get("nid", ""))
            lbls = record.get("lbls", [])
            if nid:
                node_info[hash(nid)] = {"id": nid, "labels": lbls, "name": ""}
                uf.add(hash(nid))

        # Resolve node names in a batch
        if node_info:
            try:
                nids = list(node_info.values())[:500]
                nid_list = [ni["id"] for ni in nids]
                name_query = """
                UNWIND $ids AS nid
                MATCH (n) WHERE elementId(n) = nid
                RETURN elementId(n) AS nid,
                       coalesce(n.name, n.title, n.COMPANY_NM, n.factor_nm, n.feature_nm, n.regulation_name, '(unnamed)') AS name,
                       labels(n) AS lbls
                """
                name_records, _ = self._db.execute_read_with_summary(
                    name_query, {"ids": nid_list}
                )
                for rec in name_records:
                    hid = hash(str(rec.get("nid", "")))
                    if hid in node_info:
                        node_info[hid]["name"] = str(rec.get("name", ""))
            except Exception:
                logger.exception("Name resolution failed")

        components = uf.components()
        return self._build_community_list(
            components, node_info, edge_set, min_size
        )

    # ── Louvain-inspired ─────────────────────────────────────────────

    def _louvain_communities(
        self, labels: list[str], max_nodes: int, min_size: int
    ) -> tuple[list[dict], float]:
        if self._db is None:
            return [], 0.0

        label_conditions = " OR ".join([f"n:{lbl}" for lbl in labels])

        edges_query = f"""
        MATCH (n)-[r]->(m)
        WHERE ({label_conditions}) AND ({label_conditions.replace('n:', 'm:')})
        WITH n, m LIMIT $max_nodes * 2
        RETURN elementId(n) AS src, elementId(m) AS tgt
        """
        try:
            records, _ = self._db.execute_read_with_summary(
                edges_query, {"max_nodes": max_nodes}
            )
        except Exception:
            logger.exception("Louvain edge extraction failed")
            return [], 0.0

        if not records:
            return [], 0.0

        # Build node-to-index mapping
        node_ids: list[str] = []
        node_to_idx: dict[str, int] = {}
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src and src not in node_to_idx:
                node_to_idx[src] = len(node_ids)
                node_ids.append(src)
            if tgt and tgt not in node_to_idx:
                node_to_idx[tgt] = len(node_ids)
                node_ids.append(tgt)

        n = len(node_ids)
        if n < 2:
            return [], 0.0

        # Build sparse adjacency matrix
        adj = lil_matrix((n, n), dtype=np.float64)
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src in node_to_idx and tgt in node_to_idx:
                i, j = node_to_idx[src], node_to_idx[tgt]
                adj[i, j] = 1
                adj[j, i] = 1

        adj = adj.tocsr()
        degrees = np.array(adj.sum(axis=1)).flatten()
        m = degrees.sum() / 2.0
        if m == 0:
            return [], 0.0

        # Greedy modularity optimization (single-level Louvain)
        communities = np.arange(n, dtype=np.int64)
        improved = True
        for _ in range(50):
            if not improved:
                break
            improved = False
            order = np.random.permutation(n)
            for node in order:
                node_comm = communities[node]
                neigh_indices = adj[node].indices
                if len(neigh_indices) == 0:
                    continue

                # Compute modularity gain for joining each neighbor community
                comm_gains: dict[int, float] = {}
                k_i = degrees[node]
                for nb in neigh_indices:
                    nb_comm = communities[nb]
                    if nb_comm == node_comm:
                        continue
                    # Modularity gain: ΔQ = [Σ_in + 2k_i,in] / 2m - [(Σ_tot + k_i) / 2m]²
                    # Simplified: gain ≈ weight_to_comm / m - k_i * comm_degree / (2 * m²)
                    if nb_comm not in comm_gains:
                        comm_nodes = np.where(communities == nb_comm)[0]
                        comm_total = degrees[comm_nodes].sum()
                        comm_gains[nb_comm] = -k_i * comm_total / (2.0 * m * m)

                # Add actual edge contributions
                for nb in neigh_indices:
                    nb_comm = communities[nb]
                    if nb_comm != node_comm and nb_comm in comm_gains:
                        comm_gains[nb_comm] += 1.0 / m

                if comm_gains:
                    best_comm = max(comm_gains, key=comm_gains.get)
                    if comm_gains[best_comm] > 0:
                        communities[node] = best_comm
                        improved = True

        # Map communities back
        comm_groups: dict[int, list[int]] = defaultdict(list)
        for idx, comm in enumerate(communities):
            comm_groups[comm].append(idx)

        # Build node_info dict for the community list
        node_info: dict[int, dict] = {}
        for idx, nid in enumerate(node_ids):
            node_info[hash(nid)] = {"id": nid, "labels": [], "name": ""}

        # Query node labels
        try:
            batch_size = 200
            all_nids = list(node_ids)
            for start in range(0, len(all_nids), batch_size):
                batch = all_nids[start : start + batch_size]
                lbl_query = """
                UNWIND $ids AS nid
                MATCH (n) WHERE elementId(n) = nid
                RETURN elementId(n) AS nid, labels(n) AS lbls,
                       coalesce(n.name, n.title, n.COMPANY_NM, n.factor_nm, n.feature_nm, n.regulation_name, '(unnamed)') AS name
                """
                lbl_records, _ = self._db.execute_read_with_summary(
                    lbl_query, {"ids": batch}
                )
                for rec in lbl_records:
                    hid = hash(str(rec.get("nid", "")))
                    if hid in node_info:
                        node_info[hid]["labels"] = [
                            l for l in (rec.get("lbls") or []) if l in _ALL_VALID_LABELS
                        ]
                        node_info[hid]["name"] = str(rec.get("name", ""))
        except Exception:
            logger.exception("Label resolution failed")

        # Build edge_set from adjacency
        edge_set: set[tuple[str, str]] = set()
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src and tgt:
                edge_set.add(
                    (src, tgt) if src < tgt else (tgt, src)
                )

        modularity = self._compute_modularity(adj, communities, degrees, m)
        return self._build_community_list(
            comm_groups, node_info, edge_set, min_size, node_to_idx, node_ids
        ), modularity

    # ── Label Propagation ────────────────────────────────────────────

    def _label_propagation_communities(
        self, labels: list[str], max_nodes: int, min_size: int
    ) -> tuple[list[dict], float]:
        """Simple label propagation using adjacency."""
        if self._db is None:
            return [], 0.0

        label_conditions = " OR ".join([f"n:{lbl}" for lbl in labels])

        edges_query = f"""
        MATCH (n)-[r]-(m)
        WHERE ({label_conditions}) AND ({label_conditions.replace('n:', 'm:')})
        WITH n, m LIMIT $max_nodes * 2
        RETURN elementId(n) AS src, elementId(m) AS tgt
        """
        try:
            records, _ = self._db.execute_read_with_summary(
                edges_query, {"max_nodes": max_nodes}
            )
        except Exception:
            logger.exception("Label propagation edge extraction failed")
            return [], 0.0

        if not records:
            return [], 0.0

        node_set: set[str] = set()
        adjacency: dict[str, set[str]] = defaultdict(set)
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src and tgt:
                node_set.add(src)
                node_set.add(tgt)
                adjacency[src].add(tgt)
                adjacency[tgt].add(src)

        node_list = list(node_set)
        if not node_list:
            return [], 0.0

        nid_to_hash: dict[str, int] = {n: hash(n) for n in node_list}

        # Initialize each node with its own label
        node_labels = {node: i for i, node in enumerate(node_list)}

        for _ in range(20):
            changed = False
            order = np.random.permutation(node_list)
            for node in order:
                neighbors = adjacency[node]
                if not neighbors:
                    continue
                # Count labels among neighbors
                label_counts: dict[int, int] = defaultdict(int)
                for nb in neighbors:
                    label_counts[node_labels[nb]] += 1
                most_common = max(label_counts, key=label_counts.get)
                if most_common != node_labels[node]:
                    node_labels[node] = most_common
                    changed = True
            if not changed:
                break

        # Group by label
        comm_groups: dict[int, list[int]] = defaultdict(list)
        for node, label in node_labels.items():
            comm_groups[label].append(nid_to_hash[node])

        # Build node_info
        node_info: dict[int, dict] = {}
        try:
            all_nids = list(node_set)
            for start in range(0, len(all_nids), 200):
                batch = all_nids[start : start + 200]
                lbl_query = """
                UNWIND $ids AS nid
                MATCH (n) WHERE elementId(n) = nid
                RETURN elementId(n) AS nid, labels(n) AS lbls,
                       coalesce(n.name, n.title, n.COMPANY_NM, n.factor_nm, n.feature_nm, n.regulation_name, '(unnamed)') AS name
                """
                lbl_records, _ = self._db.execute_read_with_summary(
                    lbl_query, {"ids": batch}
                )
                for rec in lbl_records:
                    hid = hash(str(rec.get("nid", "")))
                    node_info[hid] = {
                        "id": str(rec.get("nid", "")),
                        "labels": [
                            l for l in (rec.get("lbls") or []) if l in _ALL_VALID_LABELS
                        ],
                        "name": str(rec.get("name", "")),
                    }
        except Exception:
            logger.exception("Label resolution failed")

        edge_set: set[tuple[str, str]] = set()
        for src, tgt_set in adjacency.items():
            for tgt in tgt_set:
                if src < tgt:
                    edge_set.add((src, tgt))

        return self._build_community_list(comm_groups, node_info, edge_set, min_size), 0.0

    # ── Helpers ──────────────────────────────────────────────────────

    def _build_community_list(
        self,
        components: dict[int, list[int]],
        node_info: dict[int, dict],
        edge_set: set[tuple[str, str]],
        min_size: int,
        idx_to_nid: dict[int, str] | None = None,
        node_ids: list[str] | None = None,
    ) -> tuple[list[dict], float]:
        """Convert component groups into the standard community dict format."""
        communities = []
        for cid, members in sorted(components.items(), key=lambda x: -len(x[1])):
            if len(members) < min_size:
                continue

            members_set = set(members)
            member_nids: set[str] = set()
            for m in members:
                info = node_info.get(m)
                if info:
                    member_nids.add(info["id"])
                elif idx_to_nid and node_ids:
                    # Try to resolve by numeric index
                    for i, nid_val in enumerate(node_ids):
                        if hash(nid_val) == m:
                            member_nids.add(nid_val)
                            break

            # Count internal edges
            internal_edges = 0
            for src, tgt in edge_set:
                if (
                    (hash(src) in members_set or src in member_nids)
                    and (hash(tgt) in members_set or tgt in member_nids)
                ):
                    internal_edges += 1

            size = len(members)
            max_possible = size * (size - 1) / 2.0
            density = internal_edges / max_possible if max_possible > 0 else 0.0

            # Label distribution
            label_dist: dict[str, int] = defaultdict(int)
            for m in members:
                info = node_info.get(m)
                lbls = info.get("labels", []) if info else []
                for lbl in lbls:
                    label_dist[lbl] += 1

            # Top entities (by name)
            top_entities = []
            for m in members[:10]:
                info = node_info.get(m)
                if info:
                    top_entities.append({
                        "id": info["id"],
                        "name": info.get("name", "(unnamed)"),
                        "label": (info.get("labels") or ["Unknown"])[0],
                    })

            # All member IDs for subgraph retrieval (up to 500)
            member_ids: list[str] = []
            for m in members[:500]:
                info = node_info.get(m)
                if info and info.get("id"):
                    member_ids.append(info["id"])

            communities.append({
                "community_id": len(communities),
                "size": size,
                "density": round(density, 4),
                "internal_edges": internal_edges,
                "label_distribution": dict(label_dist),
                "top_entities": top_entities,
                "member_ids": member_ids,
            })

        return communities, 0.0

    def _compute_modularity(
        self,
        adj: csr_matrix,
        communities: np.ndarray,
        degrees: np.ndarray,
        m: float,
    ) -> float:
        """Compute Newman-Girvan modularity Q."""
        if m == 0:
            return 0.0
        q = 0.0
        for i in range(adj.shape[0]):
            for j in adj[i].indices:
                if communities[i] == communities[j]:
                    q += 1.0 - (degrees[i] * degrees[j]) / (2.0 * m)
        return q / (2.0 * m)

    # ── Community Subgraph ───────────────────────────────────────────

    def get_community_subgraph(
        self,
        community_id: int,
        layer: str | None = None,
        limit: int = 200,
    ) -> dict[str, Any]:
        """Return the subgraph for a specific community.

        Re-runs community detection once to get the member_ids list,
        then fetches nodes/edges in standard {nodes, edges} format.
        """
        result = self.detect_communities(layer=layer, method="wcc", min_community_size=1)
        communities = result.get("communities", [])
        if community_id >= len(communities):
            return {"nodes": [], "edges": []}

        comm = communities[community_id]

        # Use stored member_ids (up to 500) from detection result
        entity_ids = comm.get("member_ids", [])
        if not entity_ids:
            # Fallback to top_entities for backward compatibility
            entity_ids = [e["id"] for e in comm.get("top_entities", [])]

        if not entity_ids or self._db is None:
            return {"nodes": [], "edges": []}

        # Fetch nodes by elementId
        try:
            nodes_query = """
            UNWIND $ids AS nid
            MATCH (n) WHERE elementId(n) = nid
            RETURN n
            LIMIT $limit
            """
            from core.database import Neo4jClient

            records, _ = self._db.execute_read_with_summary(
                nodes_query, {"ids": entity_ids, "limit": limit}
            )
            nodes_map: dict[str, dict] = {}
            for record in records:
                node = record.get("n")
                if node:
                    nid = node.element_id
                    if nid not in nodes_map:
                        nodes_map[nid] = Neo4jClient.serialize_node(node)

            # Fetch edges between these nodes — no LIMIT since bounded by |nodes|²
            if len(nodes_map) > 1:
                nid_list = list(nodes_map.keys())
                edges_query = """
                UNWIND $ids AS a_id
                MATCH (a) WHERE elementId(a) = a_id
                MATCH (a)-[r]-(b)
                WHERE elementId(b) IN $ids AND elementId(a) < elementId(b)
                RETURN DISTINCT r
                """
                edge_records, _ = self._db.execute_read_with_summary(
                    edges_query, {"ids": nid_list}
                )
                edges: list[dict] = []
                edge_ids: set[str] = set()
                for record in edge_records:
                    rel = record.get("r")
                    if rel and rel.element_id not in edge_ids:
                        edges.append(Neo4jClient.serialize_relationship(rel))
                        edge_ids.add(rel.element_id)
            else:
                edges = []

            return {"nodes": list(nodes_map.values()), "edges": edges}

        except Exception:
            logger.exception("Community subgraph extraction failed")
            return {"nodes": [], "edges": []}

    # ── Centrality ───────────────────────────────────────────────────

    def compute_centrality(
        self,
        centrality_type: str = "pagerank",
        layer: str | None = None,
        top_n: int = 100,
    ) -> list[dict[str, Any]]:
        """Compute centrality scores.

        Args:
            centrality_type: "pagerank" or "betweenness".
            layer: Layer filter.
            top_n: Return top N nodes.

        Returns:
            List of {node_id, name, labels, score} sorted by score descending.
        """
        if self._db is None:
            return []

        labels = _layer_filter(layer)
        label_conditions = " OR ".join([f"n:{lbl}" for lbl in labels])

        edges_query = f"""
        MATCH (n)-[r]->(m)
        WHERE ({label_conditions}) AND ({label_conditions.replace('n:', 'm:')})
        RETURN elementId(n) AS src, elementId(m) AS tgt
        LIMIT 10000
        """
        try:
            records, _ = self._db.execute_read_with_summary(edges_query, {})
        except Exception:
            logger.exception("Centrality edge extraction failed")
            return []

        if not records:
            return []

        node_set: set[str] = set()
        edges: list[tuple[str, str]] = []
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src and tgt:
                node_set.add(src)
                node_set.add(tgt)
                edges.append((src, tgt))

        node_ids = list(node_set)
        node_to_idx = {n: i for i, n in enumerate(node_ids)}
        n = len(node_ids)

        if centrality_type == "pagerank":
            scores = self._pagerank(n, node_to_idx, edges)
        elif centrality_type == "betweenness":
            scores = self._betweenness(n, node_to_idx, edges)
        else:
            return []

        # Sort by score descending
        sorted_indices = np.argsort(scores)[::-1][:top_n]

        # Resolve names
        top_ids = [node_ids[i] for i in sorted_indices]
        name_map: dict[str, tuple[str, list[str]]] = {}
        try:
            for start in range(0, len(top_ids), 200):
                batch = top_ids[start : start + 200]
                name_query = """
                UNWIND $ids AS nid
                MATCH (n) WHERE elementId(n) = nid
                RETURN elementId(n) AS nid,
                       coalesce(n.name, n.title, n.COMPANY_NM, n.factor_nm, n.regulation_name, '(unnamed)') AS name,
                       labels(n) AS lbls
                """
                name_records, _ = self._db.execute_read_with_summary(
                    name_query, {"ids": batch}
                )
                for rec in name_records:
                    name_map[str(rec.get("nid", ""))] = (
                        str(rec.get("name", "")),
                        [l for l in (rec.get("lbls") or []) if l in _ALL_VALID_LABELS],
                    )
        except Exception:
            logger.exception("Name resolution failed")

        result = []
        for i in sorted_indices:
            nid = node_ids[i]
            name, lbls = name_map.get(nid, ("(unnamed)", []))
            result.append({
                "node_id": nid,
                "name": name,
                "labels": lbls,
                "score": round(float(scores[i]), 6),
            })

        return result

    def _pagerank(
        self,
        n: int,
        node_to_idx: dict[str, int],
        edges: list[tuple[str, str]],
        damping: float = 0.85,
        max_iter: int = 100,
    ) -> np.ndarray:
        """Simple PageRank implementation."""
        adj = lil_matrix((n, n), dtype=np.float64)
        out_degree = np.zeros(n)
        for src, tgt in edges:
            i, j = node_to_idx[src], node_to_idx[tgt]
            adj[i, j] = 1
            out_degree[i] += 1

        # Handle dangling nodes
        for i in range(n):
            if out_degree[i] == 0:
                adj[i, :] = 1
                out_degree[i] = n

        # Row-normalize
        for i in range(n):
            adj[i, :] /= out_degree[i]

        adj = adj.tocsr()
        pr = np.ones(n) / n
        teleport = np.ones(n) / n

        for _ in range(max_iter):
            new_pr = (1 - damping) * teleport + damping * (adj.T.dot(pr))
            if np.abs(new_pr - pr).sum() < 1e-8:
                break
            pr = new_pr

        return pr

    def _betweenness(
        self,
        n: int,
        node_to_idx: dict[str, int],
        edges: list[tuple[str, str]],
    ) -> np.ndarray:
        """Approximate betweenness centrality using BFS from sample nodes."""
        adj_list: dict[int, list[int]] = defaultdict(list)
        for src, tgt in edges:
            i, j = node_to_idx[src], node_to_idx[tgt]
            adj_list[i].append(j)
            adj_list[j].append(i)

        betweenness = np.zeros(n)
        sample_size = min(n, 50)

        for source in np.random.choice(n, sample_size, replace=False):
            source = int(source)  # type narrowing
            # BFS
            stack: list[int] = []
            predecessors: dict[int, list[int]] = defaultdict(list)
            sigma = np.zeros(n)
            sigma[source] = 1
            dist = np.full(n, -1)
            dist[source] = 0
            queue = [source]

            while queue:
                v = queue.pop(0)
                stack.append(v)
                for w in adj_list[v]:
                    if dist[w] < 0:
                        dist[w] = dist[v] + 1
                        queue.append(w)
                    if dist[w] == dist[v] + 1:
                        sigma[w] += sigma[v]
                        predecessors[w].append(v)

            # Back-propagation
            delta = np.zeros(n)
            while stack:
                w = stack.pop()
                for pred in predecessors[w]:
                    delta[pred] += (sigma[pred] / sigma[w]) * (1 + delta[w])
                if w != source:
                    betweenness[w] += delta[w]

        return betweenness

    # ── Cycle Detection ──────────────────────────────────────────────

    def detect_cycles(
        self, layer: str | None = None, max_cycles: int = 50
    ) -> list[list[str]]:
        """Find directed cycles indicating circular fund flows.

        Uses DFS-based cycle detection on the extracted directed graph.
        """
        if self._db is None:
            return []

        labels = _layer_filter(layer)
        label_conditions = " OR ".join([f"n:{lbl}" for lbl in labels])

        edges_query = f"""
        MATCH (n)-[r]->(m)
        WHERE ({label_conditions}) AND ({label_conditions.replace('n:', 'm:')})
        RETURN elementId(n) AS src, elementId(m) AS tgt
        LIMIT 5000
        """
        try:
            records, _ = self._db.execute_read_with_summary(edges_query, {})
        except Exception:
            logger.exception("Cycle detection edge extraction failed")
            return []

        adj_list: dict[str, list[str]] = defaultdict(list)
        node_set: set[str] = set()
        for rec in records:
            src = str(rec.get("src", ""))
            tgt = str(rec.get("tgt", ""))
            if src and tgt:
                adj_list[src].append(tgt)
                node_set.add(src)
                node_set.add(tgt)

        cycles: list[list[str]] = []
        visited: set[str] = set()
        rec_stack: set[str] = set()
        path: list[str] = []

        def dfs(node: str) -> None:
            if len(cycles) >= max_cycles:
                return
            visited.add(node)
            rec_stack.add(node)
            path.append(node)

            for neighbor in adj_list.get(node, []):
                if neighbor in rec_stack:
                    cycle_start = path.index(neighbor)
                    cycles.append(path[cycle_start:] + [neighbor])
                    if len(cycles) >= max_cycles:
                        return
                elif neighbor not in visited:
                    dfs(neighbor)

            path.pop()
            rec_stack.discard(node)

        for start_node in list(node_set):
            if len(cycles) >= max_cycles:
                break
            if start_node not in visited:
                dfs(start_node)

        return cycles[:max_cycles]
