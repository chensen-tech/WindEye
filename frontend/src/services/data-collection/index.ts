import { request } from '@umijs/max';

export async function getCrawlTemplates() {
  return request<API.CrawlTemplatesResult>('/api/v1/pipeline/crawl/templates', {
    method: 'GET',
  });
}

export async function getCrawlSources() {
  return request<API.CrawlSourcesResult>('/api/v1/pipeline/crawl/sources', {
    method: 'GET',
  });
}

export async function parseNLQuery(query: string) {
  return request<API.ParseResult>('/api/v1/pipeline/crawl/parse-nl', {
    method: 'POST',
    params: { query },
  });
}

export async function getCrawlTasks(params: { limit?: number }) {
  return request<API.CrawlTasksResult>('/api/v1/pipeline/crawl/tasks', {
    method: 'GET',
    params,
  });
}
