import {
  CaretRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tooltip,
} from 'antd';
import React from 'react';
import type { DiscoverParams } from '../service';

const LAYER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'Subject', label: '主体' },
  { value: 'Event', label: '事件' },
  { value: 'Feature', label: '特征' },
  { value: 'Regulation', label: '法规' },
];

interface TopControlBarProps {
  loading: boolean;
  onDiscover: (params: DiscoverParams) => void;
  onReset: () => void;
}

const TopControlBar: React.FC<TopControlBarProps> = ({ loading, onDiscover, onReset }) => {
  const [method, setMethod] = React.useState<string>('wcc');
  const [layer, setLayer] = React.useState<string>('all');
  const [minSize, setMinSize] = React.useState<number>(3);
  const [maxNodes, setMaxNodes] = React.useState<number>(5000);

  const handleDiscover = () => {
    onDiscover({ layer, method, minSize, maxNodes });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 16px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Segmented
        size="small"
        value={method}
        onChange={(v) => setMethod(String(v))}
        options={[
          { value: 'wcc', label: 'WCC' },
          { value: 'louvain', label: 'Louvain' },
          { value: 'label_propagation', label: 'LPA' },
        ]}
      />

      <Select
        size="small"
        value={layer}
        onChange={setLayer}
        options={LAYER_OPTIONS}
        style={{ width: 80 }}
        variant="borderless"
      />

      <Tooltip title="最小群体规模">
        <InputNumber
          size="small"
          min={1}
          max={50}
          value={minSize}
          onChange={(v) => setMinSize(v ?? 3)}
          style={{ width: 56 }}
          variant="borderless"
          prefix={<span style={{ color: '#999', fontSize: 11 }}>≥</span>}
        />
      </Tooltip>

      <Tooltip title="最大节点数">
        <InputNumber
          size="small"
          min={100}
          max={10000}
          step={500}
          value={maxNodes}
          onChange={(v) => setMaxNodes(v ?? 5000)}
          style={{ width: 76 }}
          variant="borderless"
          prefix={<span style={{ color: '#999', fontSize: 11 }}>≤</span>}
        />
      </Tooltip>

      <Space size={2}>
        <Tooltip title="开始发现">
          <Button
            type="primary"
            size="small"
            icon={<CaretRightOutlined />}
            loading={loading}
            onClick={handleDiscover}
          />
        </Tooltip>
        <Tooltip title="重置">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={loading}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default TopControlBar;
