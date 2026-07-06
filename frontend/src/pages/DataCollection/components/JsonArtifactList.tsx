import {
  CodeOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Empty,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

interface JsonArtifact {
  stage: string;
  fileName: string;
  jsonPath: string;
  size: number;
  createdAt: string;
}

const STAGE_OPTIONS = [
  { value: 'event_extraction', label: '风险事件' },
  { value: 'feature_extraction', label: '特征层' },
  { value: 'regulation_linking', label: '法规层' },
];

const STAGE_META: Record<string, { label: string; color: string }> = {
  event_extraction: { label: '风险事件', color: 'orange' },
  feature_extraction: { label: '特征层', color: 'green' },
  regulation_linking: { label: '法规层', color: 'purple' },
};

function formatSize(size: number) {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

const JsonArtifactList: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { message: msg } = App.useApp();
  const [artifacts, setArtifacts] = useState<JsonArtifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);

  const fetchArtifacts = useCallback(async () => {
    setLoading(true);
    try {
      const query = stageFilter ? `?stage=${encodeURIComponent(stageFilter)}&limit=100` : '?limit=100';
      const res = await fetch(`/api/v1/pipeline/json-artifacts${query}`);
      const data = await res.json();
      setArtifacts(data.artifacts || []);
    } catch {
      msg.error('获取 JSON 文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [msg, stageFilter]);

  useEffect(() => {
    fetchArtifacts();
  }, [fetchArtifacts]);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      render: (name: string) => (
        <Tooltip title={name}>
          <Space size={4}>
            <CodeOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontSize: 13 }}>{name}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage: string) => {
        const meta = STAGE_META[stage] || { label: stage, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 90,
      render: (size: number) => formatSize(size),
    },
    {
      title: '生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: compact ? 130 : 180,
      responsive: compact ? undefined : ['sm' as const],
      render: (value: string) => value ? new Date(value).toLocaleString() : '-',
    },
    {
      title: '保存位置',
      dataIndex: 'jsonPath',
      key: 'jsonPath',
      ellipsis: true,
      responsive: compact ? ['lg' as const] : undefined,
      render: (path: string) => (
        <Tooltip title={path}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{path}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <Space>
          <FileTextOutlined />
          <span>Dify JSON 文件列表</span>
          {!loading && <Tag color="blue">{artifacts.length} 个文件</Tag>}
        </Space>
      }
      extra={
        <Space size={4}>
          <Select
            size="small"
            allowClear
            placeholder="按层筛选"
            value={stageFilter}
            onChange={(value) => setStageFilter(value)}
            style={{ width: 120 }}
            options={STAGE_OPTIONS}
          />
          <Button size="small" icon={<ReloadOutlined />} onClick={fetchArtifacts} loading={loading} />
        </Space>
      }
    >
      {loading && artifacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="加载中..." />
        </div>
      ) : artifacts.length === 0 ? (
        <Empty description="暂无 Dify JSON 文件" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          dataSource={artifacts}
          columns={columns}
          rowKey={(record) => record.jsonPath}
          size="small"
          pagination={compact ? false : { pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 个文件` }}
          scroll={compact ? { y: 260 } : undefined}
        />
      )}
    </Card>
  );
};

export default JsonArtifactList;
