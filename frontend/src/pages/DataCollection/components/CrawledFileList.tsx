import {
  FilePdfOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
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

// ─── Types ───────────────────────────────────────────────────────────

interface CrawledFile {
  name: string;
  size: number;
  size_display: string;
  source: string;
  source_name: string;
  category: string;
  modified: string;
}

interface SourceSummary {
  key: string;
  name: string;
  file_count: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const FILE_ICON: Record<string, React.ReactNode> = {
  '.pdf': <FilePdfOutlined style={{ color: '#f5222d' }} />,
  '.txt': <FileTextOutlined style={{ color: '#1890ff' }} />,
};

function getFileIcon(name: string): React.ReactNode {
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  return FILE_ICON[ext] || <FileTextOutlined style={{ color: '#888' }} />;
}

const SOURCE_COLORS: Record<string, string> = {
  risk_event_sse: '#f5222d',
  risk_event_szse: '#1890ff',
  risk_event_bse: '#52c41a',
  risk_sentiment: '#faad14',
  regulation_docs: '#722ed1',
};

// ─── Component ───────────────────────────────────────────────────────

const CrawledFileList: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { message: msg } = App.useApp();

  const [files, setFiles] = useState<CrawledFile[]>([]);
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/pipeline/files');
      const data = await res.json();
      setFiles(data.files || []);
      setSources(data.sources || []);
    } catch {
      msg.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [msg]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filtered = sourceFilter
    ? files.filter((f) => f.source === sourceFilter)
    : files;

  const totalSize = filtered.reduce((sum, f) => sum + f.size, 0);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => (
        <Tooltip title={name}>
          <Space size={4}>
            {getFileIcon(name)}
            <span style={{ fontSize: 13 }}>{name}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '数据源',
      dataIndex: 'source_name',
      key: 'source',
      width: compact ? 100 : 140,
      render: (name: string, record: CrawledFile) => (
        <Tag color={SOURCE_COLORS[record.source] || '#888'}>{name}</Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      responsive: ['md' as const],
      render: (cat: string) => (
        <Tag>{cat}</Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size_display',
      key: 'size',
      width: 80,
      sorter: (a: CrawledFile, b: CrawledFile) => a.size - b.size,
    },
    {
      title: '日期',
      dataIndex: 'modified',
      key: 'modified',
      width: compact ? 120 : 150,
      responsive: compact ? undefined : ['sm' as const],
      sorter: (a: CrawledFile, b: CrawledFile) =>
        a.modified.localeCompare(b.modified),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <Space>
          <FolderOpenOutlined />
          <span>已爬取文件列表</span>
          {!loading && (
            <Tag color="blue">{filtered.length} 个文件</Tag>
          )}
        </Space>
      }
      extra={
        <Space size={4}>
          <Select
            size="small"
            allowClear
            placeholder="按数据源筛选"
            value={sourceFilter}
            onChange={(val) => setSourceFilter(val)}
            style={{ width: 140 }}
            options={sources.map((s) => ({
              value: s.key,
              label: `${s.name} (${s.file_count})`,
            }))}
          />
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={fetchFiles}
            loading={loading}
          />
        </Space>
      }
    >
      {loading && files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="加载中..." />
        </div>
      ) : files.length === 0 ? (
        <Empty
          description="暂无爬取文件"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          {!compact && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                共 <strong>{filtered.length}</strong> 个文件，
                总大小 <strong>{(totalSize / 1024 / 1024).toFixed(1)} MB</strong>
              </span>
              {sourceFilter && (
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  筛选: <Tag>{sources.find((s) => s.key === sourceFilter)?.name || sourceFilter}</Tag>
                </span>
              )}
            </div>
          )}
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey={(r) => `${r.source}/${r.name}`}
            size="small"
            pagination={compact ? false : { pageSize: 20, showSizeChanger: true, showTotal: (t) => `共 ${t} 个文件` }}
            scroll={compact ? { y: 300 } : undefined}
          />
        </>
      )}
    </Card>
  );
};

export default CrawledFileList;
