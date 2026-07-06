import type { GraphLayer, KGEdge, KGNode } from '@/types/knowledgeGraph';
import { getNodeDegreeMap } from './graphTransform';

export interface AggregateGraphResult {
  nodes: KGNode[];
  edges: KGEdge[];
  foldedNodeCount: number;
}

const IMPORTANT_LAYERS: GraphLayer[] = ['Event', 'Feature', 'Regulation', 'Subject', 'Unknown'];

function importanceComparator(degrees: Map<string, number>) {
  return (left: KGNode, right: KGNode) =>
    Number(Boolean(right.isCenter)) - Number(Boolean(left.isCenter))
    || Number(Boolean(right.isMatched)) - Number(Boolean(left.isMatched))
    || (degrees.get(right.id) || 0) - (degrees.get(left.id) || 0)
    || IMPORTANT_LAYERS.indexOf(left.layer) - IMPORTANT_LAYERS.indexOf(right.layer)
    || left.name.localeCompare(right.name);
}

function aggregateId(layer: GraphLayer, type: string): string {
  return `aggregate:${layer}:${encodeURIComponent(type)}`;
}

export function buildAggregateGraph(
  nodes: KGNode[],
  edges: KGEdge[],
  expandedGroups: Set<string>,
  topN = 20,
): AggregateGraphResult {
  const degrees = getNodeDegreeMap(nodes, edges);
  const groups = new Map<string, KGNode[]>();
  nodes.forEach((node) => {
    const key = `${node.layer}|${node.type || 'Unknown'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(node);
  });

  const resultNodes: KGNode[] = [];
  const originalToDisplay = new Map<string, string>();
  let foldedNodeCount = 0;

  groups.forEach((members, key) => {
    const [layer, ...typeParts] = key.split('|');
    const type = typeParts.join('|') || 'Unknown';
    const ranked = [...members].sort(importanceComparator(degrees));
    const expanded = expandedGroups.has(key);
    const visibleMembers = expanded ? ranked.slice(0, topN) : [];
    visibleMembers.forEach((node) => {
      resultNodes.push({ ...node, degree: degrees.get(node.id) || 0 });
      originalToDisplay.set(node.id, node.id);
    });

    const remaining = expanded ? ranked.slice(topN) : ranked;
    if (remaining.length === 0) return;
    const id = aggregateId(layer as GraphLayer, type);
    const memberIds = new Set(members.map(node => node.id));
    const relationCount = edges.filter(edge =>
      memberIds.has(edge.source) || memberIds.has(edge.target)).length;
    resultNodes.push({
      id,
      labels: [layer, type, 'Aggregate'],
      properties: {
        aggregateKey: key,
        nodeType: type,
        count: remaining.length,
        totalCount: members.length,
        relationCount,
      },
      layer: layer as GraphLayer,
      type,
      name: `${type}\n${remaining.length.toLocaleString()} 个`,
      isAggregate: true,
      aggregateKey: key,
      count: remaining.length,
      relationCount,
      childrenIds: remaining.map(node => node.id),
      degree: relationCount,
    });
    remaining.forEach(node => originalToDisplay.set(node.id, id));
    foldedNodeCount += remaining.length;
  });

  const edgeGroups = new Map<string, KGEdge>();
  edges.forEach((edge) => {
    const source = originalToDisplay.get(edge.source);
    const target = originalToDisplay.get(edge.target);
    if (!source || !target || source === target) return;
    const relationType = edge.type || edge.relation || edge.label || '关联';
    const key = `${source}|${target}|${relationType}`;
    const existing = edgeGroups.get(key);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.properties = {
        ...(existing.properties || {}),
        aggregateCount: existing.count,
      };
      return;
    }
    edgeGroups.set(key, {
      ...edge,
      id: `aggregate-edge:${key}`,
      source,
      target,
      count: 1,
      isAggregate: source.startsWith('aggregate:') || target.startsWith('aggregate:'),
      properties: {
        ...(edge.properties || {}),
        aggregateCount: 1,
      },
    });
  });
  return {
    nodes: resultNodes,
    edges: [...edgeGroups.values()],
    foldedNodeCount,
  };
}

export function buildCoreGraph(
  nodes: KGNode[],
  edges: KGEdge[],
  centerNodeId?: string,
  maxNodes = 150,
): { nodes: KGNode[]; edges: KGEdge[] } {
  const degrees = getNodeDegreeMap(nodes, edges);
  const selected = new Set<string>();
  const centerIds = nodes
    .filter(node => node.id === centerNodeId || node.isCenter || node.isMatched)
    .map(node => node.id);
  centerIds.forEach(id => selected.add(id));
  edges.forEach((edge) => {
    if (centerIds.includes(edge.source)) selected.add(edge.target);
    if (centerIds.includes(edge.target)) selected.add(edge.source);
  });

  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (source && target && source.layer !== target.layer) {
      selected.add(source.id);
      selected.add(target.id);
    }
  });
  nodes
    .filter(node => node.layer === 'Event' || node.layer === 'Regulation')
    .sort(importanceComparator(degrees))
    .slice(0, 30)
    .forEach(node => selected.add(node.id));
  [...nodes]
    .sort(importanceComparator(degrees))
    .slice(0, 50)
    .forEach(node => selected.add(node.id));

  const rankedSelected = nodes
    .filter(node => selected.has(node.id))
    .sort(importanceComparator(degrees))
    .slice(0, maxNodes);
  const ids = new Set(rankedSelected.map(node => node.id));
  return {
    nodes: rankedSelected.map(node => ({ ...node, degree: degrees.get(node.id) || 0 })),
    edges: edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)),
  };
}
