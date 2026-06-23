export type GraphLayer = 'Subject' | 'Event' | 'Feature' | 'Regulation' | 'Unknown';
export type GraphFilterLayer = Exclude<GraphLayer, 'Unknown'>;
export type GraphLayoutMode = 'aggregate' | 'cascade' | 'radial' | 'semantic-force' | 'community' | 'path-focus';
export type GraphLayoutSelection = 'auto' | GraphLayoutMode;
export type GraphViewMode = 'aggregate' | 'core' | 'full' | 'path';
export type GraphFilterMode = 'highlight' | 'filter';

export interface GraphFilterState {
  selectedLayers: GraphFilterLayer[];
  selectedNodeTypesByLayer: Record<GraphFilterLayer, string[]>;
  selectedEdgeTypesByLayer: Record<GraphFilterLayer, string[]>;
  selectedEdgeTypes: string[];
  filterMode: GraphFilterMode;
}

export interface KGNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
  layer: GraphLayer;
  type: string;
  name: string;
  isMatched?: boolean;
  isCenter?: boolean;
  degree?: number;
  communityId?: string | number;
  isAggregate?: boolean;
  aggregateKey?: string;
  count?: number;
  relationCount?: number;
  childrenIds?: string[];
  x?: number;
  y?: number;
}

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  relation?: string;
  rawType?: string;
  count?: number;
  isAggregate?: boolean;
  properties?: Record<string, any>;
}

export interface KGTriple {
  headId?: string;
  head: string;
  headLabels?: string[];
  relation: string;
  tailId?: string;
  tail: string;
  tailLabels?: string[];
  properties?: Record<string, any>;
}

export interface KGSummary {
  matchedCount?: number;
  centerNodeId?: string;
  depth?: number;
  requestedDepth?: number;
  actualDepth?: number;
  centerCount?: number;
  nodeCount: number;
  edgeCount: number;
  tripleCount?: number;
  layers?: string[];
  relationTypes?: string[];
  nodeTypeCounts?: Record<string, number>;
  edgeTypeCounts?: Record<string, number>;
  frontierCountsByHop?: Record<string, number>;
  truncated?: boolean;
  truncatedBy?: string | null;
  traversalMode?: 'bfs' | 'cascade';
  cascadeStageCounts?: Partial<Record<Exclude<GraphLayer, 'Unknown'>, number>>;
}

export interface SearchAllPayload {
  query: string;
  layer?: 'all' | Exclude<GraphLayer, 'Unknown'>;
  depth?: number;
  limit?: number;
  nodeLimit?: number;
  edgeLimit?: number;
  type?: string;
  relationWhitelist?: string[];
  layerWhitelist?: Exclude<GraphLayer, 'Unknown'>[];
  includeCrossLayer?: boolean;
  includeProperties?: boolean;
  outputFormat?: 'subgraph' | 'triples' | 'both';
  deduplicate?: boolean;
  responseMode?: 'full' | 'summary';
  traversalMode?: 'bfs' | 'cascade';
}

export interface SearchAllResponse {
  success: boolean;
  traceId: string;
  matchedNodes: any[];
  nodes: any[];
  edges: any[];
  triples: KGTriple[];
  summary: KGSummary;
  warnings: string[];
  message?: string;
  error?: string;
}

export interface ExpandNodePayload {
  depth?: number;
  limit?: number;
  nodeLimit?: number;
  edgeLimit?: number;
  relationWhitelist?: string[];
  layerWhitelist?: Exclude<GraphLayer, 'Unknown'>[];
  includeCrossLayer?: boolean;
  includeProperties?: boolean;
  responseMode?: 'full' | 'summary';
}

export interface ExpandNodeResponse {
  success: boolean;
  traceId: string;
  centerNode?: any;
  nodes: any[];
  edges: any[];
  subgraph?: {
    nodeCount: number;
    edgeCount: number;
    nodes: any[];
    edges: any[];
    relationTypes?: string[];
    nodeTypeCounts?: Record<string, number>;
    edgeTypeCounts?: Record<string, number>;
  };
  summary: KGSummary;
  warnings: string[];
  message?: string;
  error?: string;
}

export interface CurrentSubgraphStats {
  currentNodeCount: number;
  currentEdgeCount: number;
  currentLayerNodeCounts: Record<GraphLayer, number>;
  currentLayerEdgeCounts: Record<string, number>;
  currentNodeTypeCounts: Record<string, number>;
  currentEdgeTypeCounts: Record<string, number>;
}
