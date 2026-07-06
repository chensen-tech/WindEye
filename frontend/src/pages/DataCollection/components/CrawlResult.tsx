import { Card, Col, Descriptions, Row, Statistic, Table, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import React from 'react';
import { useCrawlStore } from '../store/crawlStore';

const CrawlResult: React.FC = () => {
  const result = useCrawlStore((s) => s.result);
  if (!result) return null;

  const columns = [
    { title: '数据源', dataIndex: 'source', key: 'source', width: 120 },
    {
      title: '文件数',
      dataIndex: 'files_downloaded',
      key: 'files',
      width: 80,
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '记录数',
      dataIndex: 'records',
      key: 'records',
      width: 80,
      render: (v: number) => <Tag color="green">{v}</Tag>,
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, r: any) =>
        r.error ? <Tag color="red">失败</Tag> : <Tag color="success">成功</Tag>,
    },
    {
      title: '详情',
      key: 'detail',
      render: (_: any, r: any) =>
        r.error ? <span style={{ color: '#ff4d4f' }}>{r.error}</span> : r.save_dir || '-',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总文件数"
              value={result.total_files_downloaded}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总记录数"
              value={result.total_records}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="质量评分"
              value={(result.quality_score * 100).toFixed(0)}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="ETL触发"
              value={result.etl_triggered}
              prefix={<CloudDownloadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={result.source_results || []}
        columns={columns}
        rowKey="source"
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default CrawlResult;
