import {
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  InputNumber,
  Radio,
  Select,
  Statistic,
  Space,
} from 'antd';
import React from 'react';
import type { DiscoverParams, DiscoveryResult } from '../service';

const LAYER_OPTIONS = [
  { value: 'all', label: '全部层级' },
  { value: 'Subject', label: '主体层' },
  { value: 'Event', label: '事件层' },
  { value: 'Feature', label: '特征层' },
  { value: 'Regulation', label: '法规层' },
];

const ALGORITHM_OPTIONS = [
  { value: 'wcc', label: '连通分量 (WCC)' },
  { value: 'louvain', label: 'Louvain 模块度' },
  { value: 'label_propagation', label: '标签传播' },
];

interface DiscoveryConfigProps {
  loading: boolean;
  onDiscover: (params: DiscoverParams) => void;
  onReset: () => void;
  result: DiscoveryResult | null;
}

const DiscoveryConfig: React.FC<DiscoveryConfigProps> = ({
  loading,
  onDiscover,
  onReset,
  result,
}) => {
  const [form] = Form.useForm();

  const handleDiscover = () => {
    const values = form.getFieldsValue();
    onDiscover({
      layer: values.layer || 'all',
      method: values.method || 'wcc',
      minSize: values.minSize ?? 3,
      maxNodes: values.maxNodes ?? 5000,
    });
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const avgSize = result && result.communities.length > 0
    ? Math.round(
        result.communities.reduce((s, c) => s + c.size, 0) /
          result.communities.length,
      )
    : 0;

  const maxSize = result && result.communities.length > 0
    ? result.communities[0].size
    : 0;

  return (
    <Card size="small" styles={{ body: { padding: '8px 16px' } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Form
          form={form}
          layout="inline"
          size="small"
          initialValues={{ layer: 'all', method: 'wcc', minSize: 3, maxNodes: 5000 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
        >
          <Form.Item label="检索层级" name="layer" style={{ marginBottom: 0 }}>
            <Select options={LAYER_OPTIONS} style={{ width: 100 }} />
          </Form.Item>

          <Form.Item label="发现算法" name="method" style={{ marginBottom: 0 }}>
            <Radio.Group
              options={ALGORITHM_OPTIONS}
              optionType="button"
              buttonStyle="solid"
              size="small"
            />
          </Form.Item>

          <Form.Item label="最小规模" name="minSize" style={{ marginBottom: 0 }}>
            <InputNumber min={1} max={50} style={{ width: 64 }} />
          </Form.Item>

          <Form.Item label="最大节点" name="maxNodes" style={{ marginBottom: 0 }}>
            <InputNumber min={100} max={10000} step={100} style={{ width: 80 }} />
          </Form.Item>

          <Space size={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleDiscover}
            >
              开始发现
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
          </Space>
        </Form>

        {result && (
          <>
            <div style={{ height: 24, borderLeft: '1px solid #e8e8e8', margin: '0 4px' }} />
            <Statistic title="群体总数" value={result.communities_count} loading={loading} />
            <Statistic
              title="模块度"
              value={result.modularity !== undefined ? result.modularity.toFixed(3) : '-'}
              loading={loading}
            />
            <Statistic title="平均规模" value={avgSize} loading={loading} />
            <Statistic title="最大规模" value={maxSize} loading={loading} />
          </>
        )}
      </div>
    </Card>
  );
};

export default DiscoveryConfig;
