/**
 * Barycenter heuristic for crossing minimization in layered graphs.
 * Sorts nodes in one layer by the average X position of their connected
 * neighbors in an adjacent layer. Nodes connected to similar neighbors
 * cluster together, reducing edge crossings.
 */

export interface BarycenterNode {
  id: string;
  x?: number;
  y?: number;
}

export interface BarycenterEdge {
  source: string;
  target: string;
}

export function barycenterSort(
  layerNodes: BarycenterNode[],
  adjacentNodes: BarycenterNode[],
  edges: BarycenterEdge[]
): BarycenterNode[] {
  const adjacentMap = new Map<string, BarycenterNode>();
  adjacentNodes.forEach(function (n) { adjacentMap.set(n.id, n); });

  const layerNodeIds = new Set(layerNodes.map(function (n) { return n.id; }));

  const adjacency = new Map<string, string[]>();
  layerNodes.forEach(function (n) { adjacency.set(n.id, []); });

  edges.forEach(function (e) {
    if (layerNodeIds.has(e.source) && adjacentMap.has(e.target)) {
      adjacency.get(e.source)!.push(e.target);
    }
    if (layerNodeIds.has(e.target) && adjacentMap.has(e.source)) {
      adjacency.get(e.target)!.push(e.source);
    }
  });

  var scored = layerNodes.map(function (node) {
    var neighbors = adjacency.get(node.id) || [];
    if (neighbors.length === 0) {
      return { node: node, barycenter: null as number | null };
    }
    var sumX = neighbors.reduce(function (s, nid) {
      var neighbor = adjacentMap.get(nid);
      return s + (neighbor && neighbor.x !== undefined ? neighbor.x : 0);
    }, 0);
    return { node: node, barycenter: sumX / neighbors.length };
  });

  scored.sort(function (a, b) {
    if (a.barycenter === null && b.barycenter === null) return 0;
    if (a.barycenter === null) return 1;
    if (b.barycenter === null) return -1;
    return a.barycenter - b.barycenter;
  });

  return scored.map(function (s) { return s.node; });
}
