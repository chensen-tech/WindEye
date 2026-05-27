export interface Community {
  community_id: number;
  size: number;
  density: number;
  internal_edges: number;
  label_distribution: Record<string, number>;
  top_entities: Array<{ id: string; name: string; label: string }>;
}

export interface DiscoveryResult {
  success: boolean;
  method: string;
  modularity?: number;
  communities_count: number;
  communities: Community[];
}

export interface GraphNode {
  id: number;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: number;
  target: number;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DiscoverParams {
  layer: string;
  method: string;
  minSize: number;
  maxNodes: number;
}

export async function discoverCommunities(params: DiscoverParams): Promise<DiscoveryResult> {
  const searchParams = new URLSearchParams();
  if (params.layer && params.layer !== 'all') searchParams.append('layer', params.layer);
  if (params.method) searchParams.append('method', params.method);
  if (params.minSize) searchParams.append('min_community_size', String(params.minSize));
  searchParams.append('max_nodes', String(params.maxNodes));

  const response = await fetch(`/api/v1/graph/communities?${searchParams.toString()}`);
  return response.json();
}

export async function getCommunityGraph(
  communityId: number,
  layer: string,
  limit: number = 200,
): Promise<GraphData> {
  const searchParams = new URLSearchParams();
  if (layer && layer !== 'all') searchParams.append('layer', layer);
  searchParams.append('limit', String(limit));

  const response = await fetch(
    `/api/v1/graph/communities/${communityId}?${searchParams.toString()}`,
  );
  return response.json();
}
