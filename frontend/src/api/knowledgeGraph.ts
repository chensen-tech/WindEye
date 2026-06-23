import type {
  ExpandNodePayload,
  ExpandNodeResponse,
  SearchAllPayload,
  SearchAllResponse,
} from '@/types/knowledgeGraph';

export class KnowledgeGraphApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'KnowledgeGraphApiError';
    this.status = status;
    this.details = details;
  }
}

async function postJson<T>(url: string, payload: Record<string, any>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new KnowledgeGraphApiError(
      error instanceof Error ? error.message : '知识图谱服务连接失败',
      0,
      error,
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    throw new KnowledgeGraphApiError(
      `知识图谱接口返回了无法解析的数据（HTTP ${response.status}）`,
      response.status,
      error,
    );
  }

  if (!response.ok || data?.success === false) {
    throw new KnowledgeGraphApiError(
      data?.message || data?.error || `知识图谱请求失败（HTTP ${response.status}）`,
      response.status,
      data,
    );
  }
  return data as T;
}

export async function searchAllGraph(
  payload: SearchAllPayload,
): Promise<SearchAllResponse> {
  return postJson<SearchAllResponse>('/api/v1/graph/search-all', {
    layer: 'all',
    depth: 2,
    limit: 500,
    type: 'all',
    relationWhitelist: [],
    layerWhitelist: [],
    includeCrossLayer: true,
    includeProperties: true,
    outputFormat: 'both',
    deduplicate: true,
    responseMode: 'full',
    traversalMode: 'cascade',
    ...payload,
  });
}

export async function expandGraphNode(
  nodeId: string,
  payload: ExpandNodePayload = {},
): Promise<ExpandNodeResponse> {
  return postJson<ExpandNodeResponse>(
    `/api/v1/graph/expand/${encodeURIComponent(nodeId)}`,
    {
      depth: 2,
      limit: 500,
      relationWhitelist: [],
      layerWhitelist: [],
      includeCrossLayer: true,
      includeProperties: true,
      responseMode: 'full',
      ...payload,
    },
  );
}
