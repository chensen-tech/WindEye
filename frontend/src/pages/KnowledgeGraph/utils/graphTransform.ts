import type { KGEdge, KGNode } from '@/types/knowledgeGraph';

export function getNodeDegreeMap(nodes: KGNode[], edges: KGEdge[]): Map<string, number> {
  const ids = new Set(nodes.map(node => node.id));
  const degrees = new Map(nodes.map(node => [node.id, 0]));
  edges.forEach((edge) => {
    if (ids.has(edge.source)) degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
    if (ids.has(edge.target)) degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
  });
  return degrees;
}

export function limitGraphForDisplay(
  nodes: KGNode[],
  edges: KGEdge[],
  limit = 150,
): { nodes: KGNode[]; edges: KGEdge[]; limited: boolean } {
  if (nodes.length <= limit) return { nodes, edges, limited: false };
  const degrees = getNodeDegreeMap(nodes, edges);
  const compareImportance = (left: KGNode, right: KGNode) => {
    const leftPriority = left.isCenter ? 3 : left.isMatched ? 2 : 0;
    const rightPriority = right.isCenter ? 3 : right.isMatched ? 2 : 0;
    return rightPriority - leftPriority
      || (degrees.get(right.id) || 0) - (degrees.get(left.id) || 0)
      || left.id.localeCompare(right.id);
  };
  const ranked = [...nodes].sort(compareImportance);
  const selectedIds = new Set<string>();
  const selectedNodes: KGNode[] = [];
  const addNode = (node: KGNode) => {
    if (selectedNodes.length >= limit || selectedIds.has(node.id)) return;
    selectedIds.add(node.id);
    selectedNodes.push(node);
  };

  // Always retain matched/center nodes, then reserve a small quota for every
  // semantic layer present. Otherwise a dense subject network can consume the
  // entire 150-node canvas budget and hide sparse event/risk/regulation nodes.
  ranked.filter(node => node.isCenter || node.isMatched).forEach(addNode);
  const presentLayers = ['Subject', 'Event', 'Feature', 'Regulation', 'Unknown']
    .filter(layer => ranked.some(node => node.layer === layer));
  const perLayerQuota = Math.max(4, Math.min(16, Math.floor(limit / Math.max(1, presentLayers.length * 4))));
  presentLayers.forEach((layer) => {
    ranked
      .filter(node => node.layer === layer)
      .slice(0, perLayerQuota)
      .forEach(addNode);
  });
  ranked.forEach(addNode);

  const selected = selectedNodes.map(node => ({
    ...node,
    degree: degrees.get(node.id) || 0,
  }));
  const ids = new Set(selected.map(node => node.id));
  return {
    nodes: selected,
    edges: edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)),
    limited: true,
  };
}

export function filterToCenterNeighbors(
  nodes: KGNode[],
  edges: KGEdge[],
  centerNodeId?: string,
): { nodes: KGNode[]; edges: KGEdge[] } {
  if (!centerNodeId) return { nodes, edges };
  const ids = new Set([centerNodeId]);
  edges.forEach((edge) => {
    if (edge.source === centerNodeId) ids.add(edge.target);
    if (edge.target === centerNodeId) ids.add(edge.source);
  });
  return {
    nodes: nodes.filter(node => ids.has(node.id)),
    edges: edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)),
  };
}

export function hideLowDegreeNodes(
  nodes: KGNode[],
  edges: KGEdge[],
  minimumDegree = 1,
): { nodes: KGNode[]; edges: KGEdge[] } {
  const degrees = getNodeDegreeMap(nodes, edges);
  const ids = new Set(nodes
    .filter(node => node.isCenter || node.isMatched || (degrees.get(node.id) || 0) >= minimumDegree)
    .map(node => node.id));
  return {
    nodes: nodes.filter(node => ids.has(node.id)),
    edges: edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)),
  };
}

export function resolveCommunityId(node: KGNode): string {
  const value = node.communityId
    ?? node.properties?.communityId
    ?? node.properties?.community_id
    ?? node.properties?._communityId;
  return value === undefined || value === null ? '' : String(value);
}
