import {
  ThunderboltOutlined,
  AlertOutlined,
  BulbOutlined,
  SafetyOutlined,
  ExportOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Collapse,
  Descriptions,
  Empty,
  List,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  App,
} from 'antd';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import RiskPieChart from './charts/RiskPieChart';
import EventBarChart from './charts/EventBarChart';
import type { RiskReport, RiskStage, CommunityInfo } from '../types/api';

const { Title, Text, Paragraph } = Typography;

const RISK_LEVEL_COLORS: Record<string, string> = {
  high: '#f5222d',
  medium: '#fa8c16',
  low: '#52c41a',
};

const URGENCY_TAGS: Record<string, { color: string; label: string }> = {
  urgent: { color: '#f5222d', label: '紧急' },
  normal: { color: '#fa8c16', label: '一般' },
  low: { color: '#52c41a', label: '低' },
};

const STAGE_LABELS: Record<string, string> = {
  planning: '任务规划',
  retrieving: '图谱检索',
  analyzing: '风险分析',
  compliance: '合规匹配',
  reporting: '报告生成',
};

interface RiskReportPanelProps {
  report: RiskReport | null;
  stages: RiskStage[];
  community: CommunityInfo | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const RiskReportPanel: React.FC<RiskReportPanelProps> = ({
  report,
  stages,
  community,
  isLoading,
  error,
  onRetry,
}) => {
  const { message } = App.useApp();

  // Derived chart data
  const { highCount, mediumCount, lowCount, entityData, sortedEntities } = useMemo(() => {
    if (!report) {
      return { highCount: 0, mediumCount: 0, lowCount: 0, entityData: [], sortedEntities: [] };
    }

    let high = 0, medium = 0, low = 0;
    for (const path of report.risk_paths || []) {
      if (path.risk_level === 'high') high++;
      else if (path.risk_level === 'medium') medium++;
      else low++;
    }

    const entityCounts = new Map<string, { count: number }>();
    for (const path of report.risk_paths || []) {
      for (const entity of path.affected_entities || []) {
        const existing = entityCounts.get(entity);
        if (existing) existing.count++;
        else entityCounts.set(entity, { count: 1 });
      }
    }

    const sorted = Array.from(entityCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const typeData = Array.from(
      entityCounts.entries().reduce((acc, [, val]) => {
        acc.set('Entity', (acc.get('Entity') || 0) + val.count);
        return acc;
      }, new Map<string, number>()),
    ).map(([name, count]) => ({ name, count, color: '#1890ff' }));

    return { highCount: high, mediumCount: medium, lowCount: low, entityData: typeData, sortedEntities: sorted };
  }, [report]);

  // Determine current stage for Steps
  const stageOrder = ['planning', 'retrieving', 'analyzing', 'compliance', 'reporting'];
  const completedStages = new Set(stages.map((s) => s.stage));
  const currentStageIdx = stageOrder.findIndex((s) => !completedStages.has(s));
  const activeStep = currentStageIdx >= 0 ? currentStageIdx : stageOrder.length;

  // Export handlers
  const handleExportMD = () => {
    if (!report?.markdown_report) return;
    const blob = new Blob([report.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!report?.markdown_report) return;
    const html = `<html><body>${report.markdown_report.replace(/\n/g, '<br/>')}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-report-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Empty state
  if (!report && !isLoading && stages.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ color: '#475569', fontSize: 14, display: 'block' }}>
                Ask a risk-related question to generate a community report
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                Task Planning → Graph Retrieval → Risk Analysis → Compliance Matching → Report Generation
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '12px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Progress indicator */}
        {isLoading && stages.length > 0 && (
          <Card size="small" style={{ borderRadius: 8 }}>
            <Steps
              size="small"
              current={activeStep}
              status={error ? 'error' : 'process'}
              items={stageOrder.map((key) => ({
                title: STAGE_LABELS[key],
              }))}
            />
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stages[stages.length - 1]?.content || 'Initializing...'}
              </Text>
            </div>
          </Card>
        )}

        {/* Community info */}
        {community && (
          <Card size="small" style={{ borderRadius: 8, background: '#f0f5ff' }}>
            <Text strong style={{ fontSize: 13 }}>Community #{community.community_id}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {community.size} nodes
            </Text>
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {community.top_entities.slice(0, 5).map((e) => (
                <Tag key={e.id} style={{ fontSize: 11, borderRadius: 6 }}>{e.name}</Tag>
              ))}
            </div>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && !report && stages.length === 0 && (
          <Card style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 14 }}>
                Initializing risk analysis pipeline...
              </div>
            </div>
          </Card>
        )}

        {/* Error state */}
        {error && !report && (
          <Card style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Text type="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                Risk analysis failed: {error}
              </Text>
              {onRetry && (
                <Button icon={<ReloadOutlined />} onClick={onRetry}>Retry</Button>
              )}
            </div>
          </Card>
        )}

        {report && (
          <>
            {/* Executive Summary */}
            <Card size="small" style={{ borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                  <ThunderboltOutlined style={{ marginRight: 8, color: '#FFC101' }} />
                  Executive Summary
                </Title>
                <Tag
                  color={RISK_LEVEL_COLORS[report.overall_risk_level] || '#fa8c16'}
                  style={{ borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                >
                  {report.overall_risk_level === 'high' ? 'High Risk' : report.overall_risk_level === 'medium' ? 'Medium Risk' : 'Low Risk'}
                </Tag>
              </div>
              <Paragraph ellipsis={{ rows: 3, expandable: true }} style={{ color: '#475569', fontSize: 13, marginBottom: 8 }}>
                {report.executive_summary}
              </Paragraph>
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="Nodes">{report.subgraph_summary?.node_count || '-'}</Descriptions.Item>
                <Descriptions.Item label="Edges">{report.subgraph_summary?.edge_count || '-'}</Descriptions.Item>
                <Descriptions.Item label="Tasks">{report.subtasks_completed || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Charts + Entity list in a Collapse */}
            <Collapse
              defaultActiveKey={['charts']}
              size="small"
              items={[{
                key: 'charts',
                label: <Text strong style={{ fontSize: 13 }}>Charts & Entities</Text>,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {highCount + mediumCount + lowCount > 0 && (
                      <>
                        <Text type="secondary" style={{ fontSize: 11 }}>Risk Path Distribution</Text>
                        <RiskPieChart highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />
                      </>
                    )}
                    {entityData.length > 0 && (
                      <>
                        <Text type="secondary" style={{ fontSize: 11 }}>Entity Type Distribution</Text>
                        <EventBarChart data={entityData} />
                      </>
                    )}
                    {sortedEntities.length > 0 && (
                      <List
                        size="small"
                        header={<Text type="secondary" style={{ fontSize: 11 }}>Related Entities (Top 10)</Text>}
                        dataSource={sortedEntities}
                        renderItem={([name, { count }]) => (
                          <List.Item style={{ padding: '2px 0' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Text style={{ fontSize: 12 }} ellipsis>{name}</Text>
                              <Text type="secondary" style={{ fontSize: 10 }}>{count}x</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                ),
              }]}
            />

            {/* Risk Paths */}
            {report.risk_paths && report.risk_paths.length > 0 && (
              <Card
                size="small"
                style={{ borderRadius: 8 }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <AlertOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                    Risk Paths ({report.risk_paths.length})
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.risk_paths.slice(0, 5).map((path) => (
                    <div
                      key={path.path_id}
                      style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 6,
                        borderLeft: `3px solid ${RISK_LEVEL_COLORS[path.risk_level] || '#fa8c16'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Tag color={RISK_LEVEL_COLORS[path.risk_level]} style={{ fontSize: 10, borderRadius: 4, lineHeight: '18px' }}>
                          {path.risk_level === 'high' ? 'High' : path.risk_level === 'medium' ? 'Medium' : 'Low'}
                        </Tag>
                        <Text strong style={{ fontSize: 12 }}>{path.path_id}</Text>
                      </div>
                      <Text style={{ fontSize: 12, color: '#475569' }}>{path.path_description}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Anomaly Findings */}
            {report.anomaly_findings && report.anomaly_findings.length > 0 && (
              <Card
                size="small"
                style={{ borderRadius: 8 }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <BulbOutlined style={{ marginRight: 8, color: '#FF8C00' }} />
                    Anomaly Findings ({report.anomaly_findings.length})
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.anomaly_findings.map((anomaly, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fef3c7' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text strong style={{ fontSize: 12 }}>{anomaly.anomaly_type}</Text>
                        <Tag style={{ fontSize: 10, borderRadius: 4 }}>{(anomaly.confidence * 100).toFixed(0)}%</Tag>
                      </div>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>{anomaly.evidence}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Compliance Matches */}
            {report.compliance_matches && report.compliance_matches.length > 0 && (
              <Card
                size="small"
                style={{ borderRadius: 8 }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <SafetyOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    Compliance Matches ({report.compliance_matches.length})
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.compliance_matches.map((match, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#faf5ff', borderRadius: 6, border: '1px solid #f3e8ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text strong style={{ fontSize: 12 }}>{match.regulation}</Text>
                        <Tag color="#722ed1" style={{ fontSize: 10, borderRadius: 4 }}>{match.suggested_action}</Tag>
                      </div>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>{match.violation}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <Card size="small" style={{ borderRadius: 8 }} title={<span style={{ fontSize: 13 }}>Recommendations</span>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {report.recommendations.map((rec, idx) => {
                    const urgency = URGENCY_TAGS[rec.urgency] || URGENCY_TAGS.normal;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: urgency.color, minWidth: 20, textAlign: 'center' }}>{idx + 1}</span>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 12 }}>{rec.action}</Text>
                          <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>{rec.reasoning}</Text>
                        </div>
                        <Tag color={urgency.color} style={{ borderRadius: 4, fontSize: 10 }}>{urgency.label}</Tag>
                        <Tag style={{ borderRadius: 4, fontSize: 10 }}>{rec.department}</Tag>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Full Markdown Report */}
            {report.markdown_report && (
              <Collapse
                size="small"
                items={[{
                  key: 'full-report',
                  label: <Text strong style={{ fontSize: 13 }}>Full Report (Markdown)</Text>,
                  children: (
                    <div className="markdown-report" style={{ fontSize: 13, lineHeight: 1.7, color: '#334155' }}>
                      <ReactMarkdown>{report.markdown_report}</ReactMarkdown>
                    </div>
                  ),
                }]}
              />
            )}

            {/* Export buttons */}
            <Card size="small" style={{ borderRadius: 8 }}>
              <Space wrap>
                <Button size="small" icon={<FileTextOutlined />} onClick={handleExportMD}>Export MD</Button>
                <Button size="small" icon={<ExportOutlined />} onClick={handleExportPDF}>Export PDF</Button>
                <Button size="small" icon={<ExportOutlined />} onClick={handleExportWord}>Export Word</Button>
              </Space>
            </Card>
          </>
        )}

        {/* Error banner (when report exists but there's also an error) */}
        {error && report && (
          <Card size="small" style={{ borderRadius: 8, border: '1px solid #ffccc7' }}>
            <Text type="danger" style={{ fontSize: 12 }}>Note: {error}</Text>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskReportPanel;
