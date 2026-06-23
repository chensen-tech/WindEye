import type {
  GraphFilterLayer,
  KGEdge,
  KGNode,
} from '@/types/knowledgeGraph';

export interface LayerCurrentTypeCounts {
  nodeTypes: Record<string, number>;
  edgeTypes: Record<string, number>;
}

const FILTER_LAYERS: GraphFilterLayer[] = ['Subject', 'Event', 'Feature', 'Regulation'];

export function computeTypeCountsByLayer(
  nodes: KGNode[],
  edges: KGEdge[],
): Record<GraphFilterLayer, LayerCurrentTypeCounts> {
  const result = Object.fromEntries(FILTER_LAYERS.map(layer => [
    layer,
    { nodeTypes: {}, edgeTypes: {} },
  ])) as Record<GraphFilterLayer, LayerCurrentTypeCounts>;
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  nodes.forEach((node) => {
    if (node.layer === 'Unknown') return;
    result[node.layer].nodeTypes[node.type] = (result[node.layer].nodeTypes[node.type] || 0) + 1;
  });
  edges.forEach((edge) => {
    const sourceLayer = nodeMap.get(edge.source)?.layer;
    const targetLayer = nodeMap.get(edge.target)?.layer;
    const layers = new Set([sourceLayer, targetLayer]);
    FILTER_LAYERS.forEach((layer) => {
      if (layers.has(layer)) {
        result[layer].edgeTypes[edge.type] = (result[layer].edgeTypes[edge.type] || 0) + 1;
      }
    });
  });
  return result;
}
