import type {
  GraphFilterLayer,
  GraphFilterMode,
  KGEdge,
  KGNode,
} from '@/types/knowledgeGraph';

export interface MultiLayerGraphFilterResult {
  visibleNodes: KGNode[];
  visibleEdges: KGEdge[];
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
}

export function nodeMatchesSelectedTypes(
  node: KGNode,
  selectedNodeTypesByLayer: Record<GraphFilterLayer, string[]>,
): boolean {
  if (node.layer === 'Unknown') return false;
  const selectedTypes = selectedNodeTypesByLayer[node.layer] || [];
  if (selectedTypes.length === 0) return false;
  return selectedTypes.some(type => node.type === type || node.labels.includes(type));
}

export function edgeMatchesSelectedTypes(edge: KGEdge, selectedEdgeTypes: string[]): boolean {
  if (selectedEdgeTypes.length === 0) return false;
  return selectedEdgeTypes.includes(edge.type || edge.relation || edge.label || '');
}

export function filterGraphByMultiLayerTypes(
  nodes: KGNode[],
  edges: KGEdge[],
  selectedNodeTypesByLayer: Record<GraphFilterLayer, string[]>,
  selectedEdgeTypes: string[],
  mode: GraphFilterMode,
  selectedLayers: GraphFilterLayer[] = [],
): MultiLayerGraphFilterResult {
  const hasNodeTypeSelection = Object.values(selectedNodeTypesByLayer)
    .some(types => types.length > 0);
  const hasEdgeSelection = selectedEdgeTypes.length > 0;
  const hasLayerSelection = selectedLayers.length > 0;

  if (!hasNodeTypeSelection && !hasEdgeSelection && !hasLayerSelection) {
    return {
      visibleNodes: nodes,
      visibleEdges: edges,
      highlightedNodeIds: new Set(),
      highlightedEdgeIds: new Set(),
    };
  }

  const matchedNodeIds = new Set(nodes
    .filter(node =>
      nodeMatchesSelectedTypes(node, selectedNodeTypesByLayer)
      || (hasLayerSelection && node.layer !== 'Unknown' && selectedLayers.includes(node.layer)))
    .map(node => node.id));
  const matchedEdgeIds = new Set(edges
    .filter(edge => edgeMatchesSelectedTypes(edge, selectedEdgeTypes))
    .map(edge => edge.id));

  if (hasEdgeSelection) {
    edges.forEach((edge) => {
      if (matchedEdgeIds.has(edge.id)) {
        matchedNodeIds.add(edge.source);
        matchedNodeIds.add(edge.target);
      }
    });
  }

  const highlightedEdgeIds = new Set<string>();
  edges.forEach((edge) => {
    const touchesMatchedNode = matchedNodeIds.has(edge.source) || matchedNodeIds.has(edge.target);
    if (
      (hasEdgeSelection && matchedEdgeIds.has(edge.id))
      || (!hasEdgeSelection && touchesMatchedNode)
      || (hasEdgeSelection && hasNodeTypeSelection && matchedEdgeIds.has(edge.id) && touchesMatchedNode)
    ) {
      highlightedEdgeIds.add(edge.id);
    }
  });

  if (mode === 'highlight') {
    return {
      visibleNodes: nodes,
      visibleEdges: edges,
      highlightedNodeIds: matchedNodeIds,
      highlightedEdgeIds,
    };
  }

  const visibleNodeIds = new Set(matchedNodeIds);
  edges.forEach((edge) => {
    if (matchedNodeIds.has(edge.source) || matchedNodeIds.has(edge.target)) {
      visibleNodeIds.add(edge.source);
      visibleNodeIds.add(edge.target);
    }
  });

  let visibleEdges = edges.filter(edge =>
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  if (hasEdgeSelection) {
    visibleEdges = visibleEdges.filter(edge => matchedEdgeIds.has(edge.id));
    const endpointIds = new Set<string>();
    visibleEdges.forEach((edge) => {
      endpointIds.add(edge.source);
      endpointIds.add(edge.target);
    });
    matchedNodeIds.forEach(id => endpointIds.add(id));
    endpointIds.forEach(id => visibleNodeIds.add(id));
  }

  return {
    visibleNodes: nodes.filter(node => visibleNodeIds.has(node.id)),
    visibleEdges,
    highlightedNodeIds: matchedNodeIds,
    highlightedEdgeIds,
  };
}
