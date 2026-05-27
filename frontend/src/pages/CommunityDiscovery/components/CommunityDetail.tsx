import {
  CloseOutlined,
  ExportOutlined,
  FileTextOutlined,
  MonitorOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, List, Row, Col, Statistic, Tag, Typography, Space, App } from 'antd';
import React from 'react';
import type { Community, GraphData, GraphNode } from '../service';
import RiskAssessment from './RiskAssessment';

const { Text } = Typography;

const LAYER_COLORS: Record<string, string> = {
  Subject: '#1890ff',
  Event: '#ff4d4f',
  Feature: '#52c41a',
  Regulation: '#722ed1',
};

function computeDegreeCentrality(graphData: GraphData): Map<string, { node: GraphNode; degree: number }> {
  const degreeMap = new Map<string, { node: GraphNode; degree: number }>();

  for (const node of graphData.nodes) {
    degreeMap.set(String(node.id), { node, degree: 0 });
  }
  for (const edge of graphData.edges) {
    const srcKey = String(edge.source);
    const tgtKey = String(edge.target);
    const srcEntry = degreeMap.get(srcKey);
    const tgtEntry = degreeMap.get(tgtKey);
    if (srcEntry) srcEntry.degree += 1;
    if (tgtEntry) tgtEntry.degree += 1;
  }
  return degreeMap;
}

interface CommunityDetailProps {
  community: Community | null;
  graphData: GraphData;
  graphLoading: boolean;
  onClear: () => void;
  onNodeClick: (node: any) => void;
  onExportCSV: () => void;
  onExportPNG: () => void;
  onViewFullGraph: () => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({
  community,
  graphData,
  graphLoading,
  onClear,
  onNodeClick,
  onExportCSV,
  onExportPNG,
  onViewFullGraph,
}) => {
  const { message } = App.useApp();

  if (!community) {
    return (
      <Card size="small" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              选择左侧群体<br />查看详细信息
            </span>
          }
        />
      </Card>
    );
  }

  const topNodes = graphData.nodes.length > 0
    ? Array.from(computeDegreeCentrality(graphData).values())
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 8)
    : [];

  const getNodeName = (n: GraphNode) =>
    n.properties?.name || n.properties?.title || n.properties?.COMPANY_NM || '(unnamed)';

  const getNodeLabel = (n: GraphNode) => {
    const labels = n.labels || [];
    return labels.length > 0 ? labels[0] : 'Unknown';
  };

  const getNodeColor = (n: GraphNode) => {
    const labels = n.labels || [];
    for (const lbl of labels) {
      if (LAYER_COLORS[lbl]) return LAYER_COLORS[lbl];
    }
    return '#BFBFBF';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto' }}>
      {/* Community overview */}
      <Card
        size="small"
        title={
          <span>
            <NodeIndexOutlined style={{ marginRight: 6 }} />
            群体 #{community.community_id + 1}
          </span>
        }
        extra={<Button type="text" size="small" icon={<CloseOutlined />} onClick={onClear} />}
      >
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Statistic title="节点数" value={community.size} loading={graphLoading} valueStyle={{ fontSize: 20 }} />
          </Col>
          <Col span={12}>
            <Statistic title="内部边" value={community.internal_edges} loading={graphLoading} valueStyle={{ fontSize: 20 }} />
          </Col>
          <Col span={12}>
            <Statistic
              title="密度"
              value={community.density.toFixed(3)}
              loading={graphLoading}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="实体类型"
              value={Object.keys(community.label_distribution).length}
              suffix="种"
              loading={graphLoading}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
        </Row>

        {/* Label distribution tags */}
        <div style={{ marginTop: 10 }}>
          {Object.entries(community.label_distribution || {}).map(([lbl, cnt]) => (
            <Tag key={lbl} color={LAYER_COLORS[lbl] || '#888'}>
              {lbl}: {cnt}
            </Tag>
          ))}
        </div>

        {/* Top entities */}
        {community.top_entities?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              代表实体：
            </Text>
            {community.top_entities.slice(0, 5).map((e, i) => (
              <Tag key={i} style={{ marginLeft: 4, marginBottom: 2 }}>{e.name}</Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Core nodes */}
      {topNodes.length > 0 && (
        <Card size="small" title="核心节点">
          <List
            size="small"
            dataSource={topNodes}
            renderItem={({ node, degree }) => {
              const name = getNodeName(node);
              return (
                <List.Item
                  style={{ cursor: 'pointer', padding: '6px 0' }}
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
                  <Space>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getNodeColor(node),
                      }}
                    />
                    <Text style={{ fontSize: 12, maxWidth: 140 }} ellipsis>
                      {name}
                    </Text>
                    <Tag style={{ fontSize: 10, lineHeight: '16px' }}>{getNodeLabel(node)}</Tag>
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      d={degree}
                    </Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      {/* Risk assessment */}
      <RiskAssessment community={community} />

      {/* Actions */}
      <Card size="small" title="操作">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block icon={<ExportOutlined />} onClick={onExportPNG}>
            导出子图 (PNG)
          </Button>
          <Button block icon={<FileTextOutlined />} onClick={onExportCSV}>
            导出数据 (CSV)
          </Button>
          <Button block icon={<MonitorOutlined />} onClick={onViewFullGraph}>
            查看全图
          </Button>
          <Button
            block
            icon={<MonitorOutlined />}
            onClick={() => message.info('监控功能开发中')}
          >
            设置监控
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CommunityDetail;
