import {
  ExportOutlined,
  FileTextOutlined,
  MonitorOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Empty,
  List,
  Progress,
  Row,
  Col,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React from 'react';
import type { Community, DiscoveryResult, GraphData, GraphNode } from '../service';
import RiskAssessment from './RiskAssessment';

const { Text } = Typography;

const LAYER_COLORS: Record<string, string> = {
  Subject: '#1890ff',
  Event: '#ff4d4f',
  Feature: '#52c41a',
  Regulation: '#722ed1',
};

const COMMUNITY_COLORS = [
  '#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#9270CA',
  '#6DC8EC', '#FF9D4D', '#269A99', '#FF99C3', '#5D7092',
];

function computeDegreeCentrality(graphData: GraphData): Map<string, { node: GraphNode; degree: number }> {
  const degreeMap = new Map<string, { node: GraphNode; degree: number }>();
  for (const node of graphData.nodes) {
    degreeMap.set(String(node.id), { node, degree: 0 });
  }
  for (const edge of graphData.edges) {
    const srcEntry = degreeMap.get(String(edge.source));
    const tgtEntry = degreeMap.get(String(edge.target));
    if (srcEntry) srcEntry.degree += 1;
    if (tgtEntry) tgtEntry.degree += 1;
  }
  return degreeMap;
}

function getNodeName(n: GraphNode) {
  return n.properties?.name || n.properties?.title || n.properties?.COMPANY_NM || '(unnamed)';
}

function getNodeLabel(n: GraphNode) {
  const labels = n.labels || [];
  return labels.length > 0 ? labels[0] : 'Unknown';
}

function getNodeColor(n: GraphNode) {
  for (const lbl of n.labels || []) {
    if (LAYER_COLORS[lbl]) return LAYER_COLORS[lbl];
  }
  return '#BFBFBF';
}

interface RightPanelProps {
  result: DiscoveryResult | null;
  selectedCommunity: Community | null;
  graphData: GraphData;
  graphLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectCommunity: (c: Community) => void;
  onClearSelection: () => void;
  onNodeClick: (node: any) => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  onViewFullGraph: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  result,
  selectedCommunity,
  graphData,
  graphLoading,
  activeTab,
  onTabChange,
  onSelectCommunity,
  onClearSelection,
  onNodeClick,
  onExportCSV,
  onExportPNG,
  onViewFullGraph,
}) => {
  const { message } = App.useApp();

  const avgSize = result && result.communities.length > 0
    ? Math.round(result.communities.reduce((s, c) => s + c.size, 0) / result.communities.length)
    : 0;

  const maxSize = result && result.communities.length > 0 ? result.communities[0].size : 0;

  // ── Tab 1: Community List ──
  const listTab = (
    <div style={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
      {result && result.communities.length > 0 ? (
        <List
          size="small"
          dataSource={result.communities}
          renderItem={(c, idx) => (
            <List.Item
              key={c.community_id}
              onClick={() => onSelectCommunity(c)}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                background:
                  selectedCommunity?.community_id === c.community_id ? '#e6f7ff' : undefined,
                borderLeft:
                  selectedCommunity?.community_id === c.community_id
                    ? `3px solid ${COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}`
                    : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={4}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length],
                      }}
                    />
                    <Text strong style={{ fontSize: 13 }}>
                      #{idx + 1}
                    </Text>
                    <Tag style={{ fontSize: 10, lineHeight: '16px' }}>
                      {c.size} 节点
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ρ={c.density.toFixed(2)}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  {Object.entries(c.label_distribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([lbl, cnt]) => (
                      <Tag key={lbl} color={LAYER_COLORS[lbl] || '#888'} style={{ fontSize: 10, lineHeight: '16px' }}>
                        {lbl} {cnt}
                      </Tag>
                    ))}
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="配置参数后点击 ▶ 开始发现"
          style={{ padding: 40 }}
        />
      )}
    </div>
  );

  // ── Tab 2: Community Detail ──
  const topNodes = graphData.nodes.length > 0
    ? Array.from(computeDegreeCentrality(graphData).values())
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 8)
    : [];

  const detailTab = !selectedCommunity ? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="在列表中点击一个群体查看详情"
      style={{ padding: 40 }}
    />
  ) : (
    <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Overview stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          <NodeIndexOutlined style={{ marginRight: 6 }} />
          群体 #{selectedCommunity.community_id + 1}
        </Text>
        <Button type="text" size="small" onClick={onClearSelection}>
          清除
        </Button>
      </div>

      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Statistic title="节点数" value={selectedCommunity.size} loading={graphLoading} valueStyle={{ fontSize: 18 }} />
        </Col>
        <Col span={12}>
          <Statistic title="内部边" value={selectedCommunity.internal_edges} loading={graphLoading} valueStyle={{ fontSize: 18 }} />
        </Col>
        <Col span={12}>
          <Statistic
            title="密度"
            value={selectedCommunity.density.toFixed(3)}
            loading={graphLoading}
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="类型数"
            value={Object.keys(selectedCommunity.label_distribution).length}
            suffix="种"
            loading={graphLoading}
            valueStyle={{ fontSize: 18 }}
          />
        </Col>
      </Row>

      <div>
        {Object.entries(selectedCommunity.label_distribution || {}).map(([lbl, cnt]) => (
          <Tag key={lbl} color={LAYER_COLORS[lbl] || '#888'}>
            {lbl}: {cnt}
          </Tag>
        ))}
      </div>

      {/* Core nodes */}
      {topNodes.length > 0 && (
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>核心节点</Text>
          <List
            size="small"
            dataSource={topNodes}
            renderItem={({ node, degree }) => {
              const name = getNodeName(node);
              return (
                <List.Item
                  style={{ cursor: 'pointer', padding: '4px 0' }}
                  onClick={() => {
                    const label = getNodeLabel(node);
                    onNodeClick({
                      id: String(node.id),
                      label: name.length > 8 ? name.substring(0, 8) + '...' : name,
                      fullLabel: name,
                      typeKey: label,
                      properties: node.properties || {},
                      style: { fill: getNodeColor(node) },
                    });
                  }}
                >
                  <Space size={4}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: getNodeColor(node),
                      }}
                    />
                    <Text style={{ fontSize: 12, maxWidth: 120 }} ellipsis>{name}</Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>d={degree}</Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>
      )}

      {/* Risk */}
      <RiskAssessment community={selectedCommunity} />

      {/* Actions */}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button block size="small" icon={<ExportOutlined />} onClick={onExportPNG}>
          导出子图 (PNG)
        </Button>
        <Button block size="small" icon={<FileTextOutlined />} onClick={onExportCSV}>
          导出数据 (CSV)
        </Button>
        <Button block size="small" icon={<MonitorOutlined />} onClick={onViewFullGraph}>
          查看全图
        </Button>
      </Space>
    </div>
  );

  // ── Tab 3: Statistics ──
  const statsTab = !result ? (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="运行群体发现后查看统计"
      style={{ padding: 40 }}
    />
  ) : (
    <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
      <Row gutter={[12, 16]}>
        <Col span={12}>
          <Statistic title="群体总数" value={result.communities_count} />
        </Col>
        <Col span={12}>
          <Statistic title="模块度" value={result.modularity?.toFixed(3) || '-'} />
        </Col>
        <Col span={12}>
          <Statistic title="平均规模" value={avgSize} />
        </Col>
        <Col span={12}>
          <Statistic title="最大规模" value={maxSize} />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>规模分布</Text>
        {result.communities.slice(0, 10).map((c, idx) => {
          const pct = maxSize > 0 ? (c.size / maxSize) * 100 : 0;
          return (
            <div key={c.community_id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>#{idx + 1}</span>
                <span>{c.size}</span>
              </div>
              <Progress
                percent={pct}
                showInfo={false}
                size="small"
                strokeColor={COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}
                trailColor="#f5f5f5"
              />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>密度分布</Text>
        {[...result.communities]
          .sort((a, b) => b.density - a.density)
          .slice(0, 10)
          .map((c, idx) => (
            <div key={c.community_id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span>#{c.community_id + 1}</span>
                <span>{c.density.toFixed(2)}</span>
              </div>
              <Progress
                percent={Math.round(c.density * 100)}
                showInfo={false}
                size="small"
                strokeColor={c.density > 0.3 ? '#52c41a' : c.density > 0.1 ? '#faad14' : '#ff4d4f'}
              />
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
      }}
    >
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={onTabChange}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        tabBarStyle={{ margin: '0 12px', paddingTop: 4 }}
        items={[
          {
            key: 'list',
            label: '群体列表',
            children: listTab,
          },
          {
            key: 'detail',
            label: '群体详情',
            children: detailTab,
          },
          {
            key: 'stats',
            label: '统计',
            children: statsTab,
          },
        ]}
      />
    </div>
  );
};

export { COMMUNITY_COLORS };
export default RightPanel;
