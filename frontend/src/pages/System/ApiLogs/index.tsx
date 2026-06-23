import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React from 'react';
import { systemApi } from '@/services/system';

export default function ApiLogs() {
  const columns: ProColumns<any>[] = [
    { title: '时间', dataIndex: 'createdAt', valueType: 'dateTime', search: false },
    {
      title: '方法',
      dataIndex: 'method',
      valueType: 'select',
      valueEnum: {
        GET: { text: 'GET' },
        POST: { text: 'POST' },
        PUT: { text: 'PUT' },
        PATCH: { text: 'PATCH' },
        DELETE: { text: 'DELETE' },
      },
      width: 90,
    },
    { title: '路径', dataIndex: 'path', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'statusCode',
      render: (_, row) => <Tag color={row.statusCode < 400 ? 'success' : 'error'}>{row.statusCode}</Tag>,
      width: 90,
    },
    { title: '耗时(ms)', dataIndex: 'latencyMs', sorter: true, search: false },
    { title: '最小耗时', dataIndex: 'minLatencyMs', hideInTable: true, valueType: 'digit' },
    { title: 'Trace ID', dataIndex: 'traceId', copyable: true, search: false },
  ];
  return (
    <PageContainer title="API 日志">
      <ProTable
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await systemApi.apiLogs({
            page: params.current,
            pageSize: params.pageSize,
            method: params.method,
            path: params.path,
            statusCode: params.statusCode,
            minLatencyMs: params.minLatencyMs,
          });
          return { data: res.data, total: res.total, success: res.success };
        }}
      />
    </PageContainer>
  );
}
