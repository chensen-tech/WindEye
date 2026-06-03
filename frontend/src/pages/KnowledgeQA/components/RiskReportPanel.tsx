import {
  ThunderboltOutlined,
  FileTextOutlined,
  ReloadOutlined,
  HistoryOutlined,
  LinkOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileMarkdownOutlined,
  LoadingOutlined,
  TeamOutlined,
  ClusterOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Drawer,
  Empty,
  List,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
  App,
  Tooltip,
} from 'antd';
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { RiskReport, RiskStage, CommunityResult, EntityCommunityMap, ReportHistoryItem, Subgraph, ResolvedEntity, RiskScores, GovernancePlan } from '../types/api';
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS } from './graphStyles'

const { Title, Text, Paragraph } = Typography;

const RISK_LEVEL_COLORS: Record<string, string> = {
  high: '#f5222d',
  medium: '#fa8c16',
  low: '#52c41a',
  insufficient_evidence: '#94a3b8',
};

const RISK_LEVEL_LABELS: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
  insufficient_evidence: '证据不足',
};

const URGENCY_TAGS: Record<string, { color: string; label: string }> = {
  urgent: { color: '#f5222d', label: '紧急' },
  normal: { color: '#fa8c16', label: '一般' },
  low: { color: '#52c41a', label: '低' },
};

const COMMUNITY_PALETTE = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#dc2626', '#0891b2'];

const STAGE_LABELS: Record<string, string> = {
  planning: '任务规划',
  retrieving: '图谱检索',
  entity_stats: '实体统计',
  community: '群体发现',
  analyzing: '协同治理',
  compliance: '合规匹配',
  reporting: '报告生成',
};

function inferClientEntityType(name: string): string {
  if (!name) return 'COMPANY'
  if (/公司|集团|有限|股份|实业|科技|投资|控股|银行|基金|证券|保险|信托|租赁|保理|资本|产业/.test(name)) return 'COMPANY'
  if (/律师|法官|董事长|总经理|法定代表人|股东|监事|董事|经理|主任|行长|总裁/.test(name)) return 'PERSON'
  if (/^[一-鿿]{2,4}$/.test(name) && !/公司|事件|风险|法|条例|规定|集团|有限|银行/.test(name)) return 'PERSON'
  if (/事件|事故|案件|诉讼|处罚|仲裁|纠纷|争议|违约|违规|违法|资金占用|冻结|判决|裁定/.test(name)) return 'EVENT'
  if (/风险|因子|指标|预警|异常|波动/.test(name)) return 'RiskFactor'
  if (/法$|条例$|办法$|规定$|细则$/.test(name)) return 'Regulation'
  return 'COMPANY'
}

function getNodeDisplayName(node: any): string {
  const props = node?.properties || {};
  return String(
    node?.name
    || node?.label
    || props.name
    || props.title
    || props.COMPANY_NM
    || props.PERSON_NM
    || props.SECURITY_NM
    || node?.id
    || ''
  );
}

function getNodeDisplayType(node: any): string {
  return String(node?.type || node?.label || node?.labels?.[0] || node?.properties?.type || inferClientEntityType(getNodeDisplayName(node)));
}

function getGraphCounts(graph: any): { nodes: number; edges: number } {
  return {
    nodes: Array.isArray(graph?.nodes) ? graph.nodes.length : 0,
    edges: Array.isArray(graph?.edges) ? graph.edges.length : 0,
  };
}

function getEdgeEndpoint(edge: any, key: 'source' | 'target'): string {
  const value = edge?.[key] ?? edge?.[`${key}_id`] ?? edge?.[`${key}Id`];
  if (typeof value === 'object' && value !== null) {
    return String(value.id || value.name || '');
  }
  return String(value || '');
}

function formatTimestamp(ts?: string): string {
  if (!ts) return new Date().toISOString().replace('T', ' ').slice(0, 19);
  return ts;
}

function generateReportId(ts?: string): string {
  const d = ts ? new Date(ts) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const seq = String(d.getTime() % 100000).padStart(5, '0');
  return `WIND-RPT-${y}${m}${day}-${seq}`;
}

interface RiskReportPanelProps {
  report: RiskReport | null;
  stages: RiskStage[];
  community: CommunityResult | null;
  entityCommunityMap: EntityCommunityMap | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onJumpToGraph?: (entityId: string, entityName: string, entityType: string) => void;
  queryText?: string;
  currentSubgraph?: Subgraph | null;
  resolvedEntities?: ResolvedEntity[];
  riskScores?: RiskScores | null;
  governancePlan?: GovernancePlan | null;
  complianceScores?: Record<string, number> | null;
}

const RiskReportPanel: React.FC<RiskReportPanelProps> = ({
  report,
  stages,
  community,
  entityCommunityMap,
  isLoading,
  error,
  onRetry,
  onJumpToGraph,
  queryText,
  currentSubgraph,
  resolvedEntities,
  governancePlan: governancePlanProp,
}) => {
  const { message } = App.useApp();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReports, setHistoryReports] = useState<ReportHistoryItem[]>([]);
  const [showAllPaths, setShowAllPaths] = useState(false);
  const [riskPathMode, setRiskPathMode] = useState<'community' | 'node'>('community');
  const [communityNodePositions, setCommunityNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingCommunityNodeId, setDraggingCommunityNodeId] = useState<string | null>(null);
  const [hoveredCommunityNodeId, setHoveredCommunityNodeId] = useState<string | null>(null);
  const [highlightSection, setHighlightSection] = useState<string | null>(null);
  const finalReportRef = useRef<HTMLDivElement>(null);

  const reportId = report?.report_id || generateReportId(report?.generated_at);

  const governancePlan = governancePlanProp || (report as any)?.governance_plan as GovernancePlan | null;

  const { highCount, mediumCount, lowCount, sortedEntities } = useMemo(() => {
    if (!report) {
      return { highCount: 0, mediumCount: 0, lowCount: 0, sortedEntities: [] };
    }

    let high = 0, medium = 0, low = 0;
    for (const path of report.risk_paths || []) {
      if (path.risk_level === 'high') high++;
      else if (path.risk_level === 'medium') medium++;
      else low++;
    }

    const entityCounts = new Map<string, { count: number; types: Set<string> }>();
    for (const path of report.risk_paths || []) {
      for (const entity of path.affected_entities || []) {
        const existing = entityCounts.get(entity);
        if (existing) {
          existing.count++;
        } else {
          entityCounts.set(entity, { count: 1, types: new Set() });
        }
      }
    }
    for (const anomaly of report.anomaly_findings || []) {
      for (const entity of anomaly.affected_entities || []) {
        const existing = entityCounts.get(entity);
        if (existing) {
          existing.count++;
        } else {
          entityCounts.set(entity, { count: 1, types: new Set() });
        }
      }
    }

    const sorted = Array.from(entityCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    return { highCount: high, mediumCount: medium, lowCount: low, sortedEntities: sorted };
  }, [report]);

  const stageOrder: RiskStage['stage'][] = ['planning', 'retrieving', 'entity_stats', 'community', 'analyzing', 'compliance', 'reporting'];
  const completedStages = new Set(stages.map((s) => s.stage));
  const currentStageIdx = stageOrder.findIndex((s) => !completedStages.has(s));
  const activeStep = currentStageIdx >= 0 ? currentStageIdx : stageOrder.length;

  const loadHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const resp = await fetch('/api/v1/risk/reports');
      if (resp.ok) {
        const data = await resp.json();
        const items = Array.isArray(data) ? data : (data.data || data.reports || []);
        setHistoryReports(items);
      }
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadHistoryReport = async (id: string) => {
    try {
      const resp = await fetch(`/api/v1/risk/reports/${id}`);
      if (resp.ok) {
        const data = await resp.json();
        message.success('报告已加载');
        setHistoryOpen(false);
        window.dispatchEvent(new CustomEvent('loadRiskReport', { detail: data }));
      }
    } catch {
      message.error('加载报告失败');
    }
  };

  const handleExportMD = () => {
    if (!report?.markdown_report) return;
    const header = `# WindEye 协同治理报告\n\n**报告编号**: ${reportId}\n**生成时间**: ${formatTimestamp(report.generated_at)}\n**查询**: ${queryText || report.query_summary || '-'}\n\n---\n\n`;
    const blob = new Blob([header + report.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = async () => {
    if (!report) return;
    const hide = message.loading('正在生成 Word 文档...', 0);
    try {
      const resp = await fetch('/api/v1/risk/reports/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          reportId,
          queryText: queryText || report.query_summary || '-',
        }),
      });
      if (!resp.ok) {
        throw new Error(`导出失败: ${resp.status}`);
      }
      const blob = await resp.blob();
      if (blob.type.includes('application/json')) {
        const text = await blob.text();
        throw new Error(text || '导出失败');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Word 文档已生成');
    } catch (err: any) {
      message.error(err?.message || 'Word 导出失败');
    } finally {
      hide();
    }
  };

  const scrollToSection = (key: string) => {
    const el = document.getElementById(`risk-section-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Empty state ──
  if (!report && !isLoading && stages.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ color: '#475569', fontSize: 14, display: 'block' }}>
                输入协同治理相关问题，生成协同治理报告
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                任务规划 → 图谱检索 → 实体统计 → 群体发现 → 协同治理 → 合规匹配 → 报告生成
              </Text>
            </div>
          }
        />
      </div>
    );
  }

  const sortedPaths = useMemo(() => {
    if (!report?.risk_paths) return [];
    const order = { high: 0, medium: 1, low: 2 };
    return [...report.risk_paths].sort(
      (a, b) => (order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3)
    );
  }, [report]);

  const displayedPaths = showAllPaths ? sortedPaths : sortedPaths.slice(0, 5);

  // Entity stats: priority → report.entity_stats → currentSubgraph.nodes → resolvedEntities → subgraph_summary
  const entityStats = report?.entity_stats;
  const totalEntities =
    entityStats?.total_entities
    || currentSubgraph?.nodes?.length
    || resolvedEntities?.length
    || report?.subgraph_summary?.node_count
    || 0;
  const topEntities = entityStats?.top_entities || [];

  // Community info from new API (community_info) or fallback from community prop
  const communityInfo = report?.community_info;
  const communities = communityInfo?.communities || community?.communities || [];
  const seededCommunityData: any = {
    ...(community || {}),
    ...(communityInfo || {}),
  };
  const communitySubgraph = seededCommunityData.subgraph || currentSubgraph;
  const connectedCommunitySubgraph = seededCommunityData.connected_subgraph || seededCommunityData.connectedSubgraph || currentSubgraph;
  const seedNodes = seededCommunityData.seed_nodes || seededCommunityData.seedNodes || [];
  const mergedEntityCommunityMap = seededCommunityData.entity_community_map || seededCommunityData.entityCommunityMap || entityCommunityMap || report?.entity_community_map;
  const subgraphCounts = getGraphCounts(communitySubgraph);
  const connectedSubgraphCounts = getGraphCounts(connectedCommunitySubgraph);
  const communityAlgorithm = seededCommunityData.algorithm || seededCommunityData.selected_method || seededCommunityData.method;

  const riskSubjects = useMemo(() => {
    const seen = new Set<string>();
    const subjects: { id: string; name: string; type: string; source: string }[] = [];
    const add = (name?: string, type?: string, id?: string, source = '识别') => {
      const cleanName = String(name || '').trim();
      if (!cleanName || seen.has(cleanName)) return;
      seen.add(cleanName);
      subjects.push({
        id: id || cleanName,
        name: cleanName,
        type: type || inferClientEntityType(cleanName),
        source,
      });
    };

    (resolvedEntities || []).forEach((entity: any) => {
      add(entity.name || entity.raw || entity.canonical_name, entity.type || entity.label, entity.kg_node_id || entity.id, '实体对齐');
    });
    topEntities.forEach((entity: any) => add(entity.name, entity.type, entity.id, '图谱统计'));
    sortedEntities.forEach(([name]) => add(name, inferClientEntityType(name), name, '风险涉及'));
    (currentSubgraph?.nodes || []).forEach((node: any) => {
      add(node.name || node.properties?.name || node.id, node.type || node.label || node.labels?.[0], node.id, '子图');
    });

    return subjects.slice(0, 12);
  }, [resolvedEntities, topEntities, sortedEntities, currentSubgraph]);

  const seedFlowNodes = useMemo(() => {
    const normalized = (Array.isArray(seedNodes) ? seedNodes : []).map((node: any) => ({
      id: String(node.id || node.kg_node_id || getNodeDisplayName(node)),
      name: getNodeDisplayName(node),
      type: getNodeDisplayType(node),
    })).filter((node: any) => node.name);
    if (normalized.length > 0) return normalized.slice(0, 6);
    return riskSubjects.slice(0, 6);
  }, [seedNodes, riskSubjects]);

  const communityIdByNode = useMemo(() => {
    const map = new Map<string, number>();
    const entityEntries = (mergedEntityCommunityMap as any)?.entities || [];
    entityEntries.forEach((entry: any) => {
      const communityId = entry?.communities?.[0]?.community_id;
      if (communityId === undefined || communityId === null) return;
      [entry.id, entry.name].filter(Boolean).forEach((key) => map.set(String(key), Number(communityId)));
    });
    communities.forEach((comm: any) => {
      const communityId = Number(comm.community_id ?? comm.id ?? 0);
      (comm.member_ids || []).forEach((id: any) => map.set(String(id), communityId));
      (comm.members || []).forEach((member: any) => {
        [member.id, member.name].filter(Boolean).forEach((key) => map.set(String(key), communityId));
      });
      (comm.top_entities || comm.core_nodes || []).forEach((member: any) => {
        [member.id, member.name].filter(Boolean).forEach((key) => map.set(String(key), communityId));
      });
    });
    return map;
  }, [mergedEntityCommunityMap, communities]);

  const communityPreviewGraph = useMemo(() => {
    const graphNodes = connectedCommunitySubgraph?.nodes || communitySubgraph?.nodes || currentSubgraph?.nodes || [];
    const graphEdges = connectedCommunitySubgraph?.edges || communitySubgraph?.edges || currentSubgraph?.edges || [];
    const nodes = graphNodes.slice(0, 38).map((node: any, index: number) => {
      const id = String(node.id || getNodeDisplayName(node) || index);
      const name = getNodeDisplayName(node) || id;
      return {
        id,
        name,
        type: getNodeDisplayType(node),
        communityId: communityIdByNode.get(id) ?? communityIdByNode.get(name),
        isSeed: seedFlowNodes.some((seed) => seed.id === id || seed.name === name),
        x: 50,
        y: 50,
      };
    });
    const centers = [
      { x: 28, y: 36 },
      { x: 66, y: 34 },
      { x: 36, y: 68 },
      { x: 72, y: 68 },
      { x: 50, y: 50 },
      { x: 18, y: 58 },
    ];
    const grouped = new Map<string, typeof nodes>();
    nodes.forEach((node) => {
      const key = node.communityId !== undefined ? String(node.communityId) : 'unknown';
      grouped.set(key, [...(grouped.get(key) || []), node]);
    });
    Array.from(grouped.entries()).forEach(([key, group], groupIndex) => {
      const center = centers[groupIndex % centers.length];
      const radius = group.length <= 1 ? 0 : Math.min(17, 8 + group.length * 1.4);
      group.forEach((node, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(group.length, 1) - Math.PI / 2;
        node.x = Math.max(6, Math.min(94, center.x + Math.cos(angle) * radius));
        node.y = Math.max(10, Math.min(90, center.y + Math.sin(angle) * radius));
        if (key === 'unknown') {
          node.x = 14 + ((index * 23) % 72);
          node.y = 18 + ((index * 31) % 62);
        }
      });
    });
    nodes.forEach((node) => {
      const moved = communityNodePositions[node.id];
      if (moved) {
        node.x = moved.x;
        node.y = moved.y;
      }
    });
    const nodeById = new Map<string, any>(nodes.map((node) => [node.id, node]));
    const nodeByName = new Map<string, any>(nodes.map((node) => [node.name, node]));
    const edges = graphEdges
      .map((edge: any) => {
        const sourceKey = getEdgeEndpoint(edge, 'source');
        const targetKey = getEdgeEndpoint(edge, 'target');
        const source = nodeById.get(sourceKey) || nodeByName.get(sourceKey);
        const target = nodeById.get(targetKey) || nodeByName.get(targetKey);
        if (!source || !target || source.id === target.id) return null;
        return {
          id: edge.id || `${source.id}-${target.id}`,
          source,
          target,
          relation: edge.relation || edge.type || edge.label || '',
        };
      })
      .filter(Boolean)
      .slice(0, 90);
    return { nodes, edges, groups: Array.from(grouped.entries()) };
  }, [connectedCommunitySubgraph, communitySubgraph, currentSubgraph, communityIdByNode, seedFlowNodes, communityNodePositions]);

  const getCommunitySvgPoint = useCallback((event: React.PointerEvent<SVGElement>) => {
    const svg = event.currentTarget instanceof SVGSVGElement
      ? event.currentTarget
      : event.currentTarget.ownerSVGElement;
    const rect = svg?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 50, y: 50 };
    return {
      x: Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleCommunityNodePointerDown = useCallback((event: React.PointerEvent<SVGGElement>, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDraggingCommunityNodeId(nodeId);
    const point = getCommunitySvgPoint(event);
    setCommunityNodePositions((prev) => ({ ...prev, [nodeId]: point }));
  }, [getCommunitySvgPoint]);

  const handleCommunityGraphPointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingCommunityNodeId) return;
    const point = getCommunitySvgPoint(event);
    setCommunityNodePositions((prev) => ({ ...prev, [draggingCommunityNodeId]: point }));
  }, [draggingCommunityNodeId, getCommunitySvgPoint]);

  const stopCommunityGraphDrag = useCallback(() => {
    setDraggingCommunityNodeId(null);
  }, []);

  const flowKeys = Array.isArray(seededCommunityData.visualization?.flow)
    ? seededCommunityData.visualization.flow
    : ['seed_nodes', 'subgraph', 'connected_subgraph', 'communities'];
  const flowLabelMap: Record<string, string> = {
    seed_nodes: '种子节点',
    n_hop_network: 'N 跳子图',
    subgraph: 'N 跳子图',
    connected_subgraph: '最大连通子图',
    communities: '群体结果',
  };
  const flowCards = [
    { key: 'seed_nodes', title: flowLabelMap[flowKeys[0]] || '种子节点', value: seedFlowNodes.length, desc: '风险主体输入' },
    { key: 'subgraph', title: flowLabelMap[flowKeys[1]] || 'N 跳子图', value: subgraphCounts.nodes, desc: `${subgraphCounts.edges} 条关系` },
    { key: 'connected_subgraph', title: flowLabelMap[flowKeys[2]] || '最大连通子图', value: connectedSubgraphCounts.nodes, desc: `${connectedSubgraphCounts.edges} 条关系` },
    { key: 'communities', title: flowLabelMap[flowKeys[3]] || '群体结果', value: communities.length, desc: '社区划分' },
  ];
  const compactSeedNames = seedFlowNodes.slice(0, 3).map((node) => node.name);
  const visibleCommunities = communities.slice(0, 6);

  const riskTransmissionGraph = useMemo(() => {
    const levelOrder = { high: 0, medium: 1, low: 2 };
    const communityNodes = new Map<number, {
      id: number;
      size: number;
      label: string;
      pathCount: number;
      highCount: number;
      mediumCount: number;
      sampleEntities: string[];
      x: number;
      y: number;
    }>();
    const communityEdges = new Map<string, {
      source: number;
      target: number;
      count: number;
      level: 'high' | 'medium' | 'low';
      pathIds: string[];
    }>();

    communities.forEach((comm: any) => {
      const cid = Number(comm.community_id ?? comm.id ?? 0);
      const members = comm.members || comm.top_entities || [];
      communityNodes.set(cid, {
        id: cid,
        size: Number(comm.size || members.length || 0),
        label: `群体 #${cid}`,
        pathCount: 0,
        highCount: 0,
        mediumCount: 0,
        sampleEntities: members.slice(0, 3).map((m: any) => m.name || String(m.id || '')),
        x: 50,
        y: 50,
      });
    });

    const pathRows = sortedPaths.map((path) => {
      const entitySteps = (path.affected_entities || []).map((name) => {
        const cid = communityIdByNode.get(name);
        return {
          name,
          type: inferClientEntityType(name),
          communityId: cid,
        };
      });
      const communitySequence = entitySteps
        .map((step) => step.communityId)
        .filter((cid): cid is number => cid !== undefined && cid !== null)
        .filter((cid, index, arr) => index === 0 || cid !== arr[index - 1]);

      communitySequence.forEach((cid) => {
        const node = communityNodes.get(cid) || {
          id: cid,
          size: 0,
          label: `群体 #${cid}`,
          pathCount: 0,
          highCount: 0,
          mediumCount: 0,
          sampleEntities: [],
          x: 50,
          y: 50,
        };
        node.pathCount += 1;
        if (path.risk_level === 'high') node.highCount += 1;
        if (path.risk_level === 'medium') node.mediumCount += 1;
        communityNodes.set(cid, node);
      });

      for (let i = 0; i < communitySequence.length - 1; i += 1) {
        const source = communitySequence[i];
        const target = communitySequence[i + 1];
        const key = `${source}->${target}`;
        const current = communityEdges.get(key) || { source, target, count: 0, level: path.risk_level, pathIds: [] };
        current.count += 1;
        current.pathIds.push(path.path_id);
        if ((levelOrder[path.risk_level] ?? 3) < (levelOrder[current.level] ?? 3)) {
          current.level = path.risk_level;
        }
        communityEdges.set(key, current);
      }

      return {
        path,
        entitySteps,
        communitySequence,
      };
    });

    const nodes = Array.from(communityNodes.values())
      .filter((node) => node.pathCount > 0 || communities.length <= 6)
      .slice(0, 10);
    const centerX = 50;
    const centerY = 48;
    const radius = nodes.length <= 3 ? 26 : 34;
    nodes.forEach((node, index) => {
      const angle = nodes.length === 1 ? -Math.PI / 2 : (Math.PI * 2 * index) / nodes.length - Math.PI / 2;
      node.x = nodes.length === 1 ? centerX : centerX + Math.cos(angle) * radius;
      node.y = nodes.length === 1 ? centerY : centerY + Math.sin(angle) * Math.min(radius, 28);
    });
    const nodeSet = new Set(nodes.map((node) => node.id));
    const edges = Array.from(communityEdges.values()).filter((edge) => nodeSet.has(edge.source) && nodeSet.has(edge.target));
    return { nodes, edges, pathRows };
  }, [sortedPaths, communities, communityIdByNode]);

  return (
    <div className="risk-report-panel" style={{ height: '100%', overflow: 'auto', padding: '12px 16px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .risk-report-panel, .risk-report-panel * { visibility: visible; }
          .risk-report-panel { position: absolute; left: 0; top: 0; width: 100%; padding: 20px 40px !important; }
          .no-print { display: none !important; }
        }
        @keyframes sectionHighlight {
          0%, 100% { border-color: #e2e8f0; }
          50% { border-color: #2855D1; box-shadow: 0 0 12px rgba(40,85,209,0.15); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* ── Progress indicator ── */}
        {isLoading && stages.length > 0 && (
          <Card size="small" style={{ borderRadius: 8 }} className="no-print">
            <Steps
              size="small"
              current={activeStep}
              status={error ? 'error' : 'process'}
              items={stageOrder.map((key) => ({
                title: STAGE_LABELS[key as keyof typeof STAGE_LABELS] || key,
              }))}
            />
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stages[stages.length - 1]?.content || '初始化中...'}
              </Text>
            </div>
          </Card>
        )}

        {/* ── Loading state ── */}
        {isLoading && !report && stages.length === 0 && (
          <Card style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 14 }}>
                正在初始化协同治理流程...
              </div>
            </div>
          </Card>
        )}

        {/* ── Error state ── */}
        {error && !report && (
          <Card style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Text type="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                协同治理分析失败: {error}
              </Text>
              {onRetry && (
                <Button icon={<ReloadOutlined />} onClick={onRetry}>重试</Button>
              )}
            </div>
          </Card>
        )}

        {report && (
          <>
            {/* ═══ Report Header ═══ */}
            <Card size="small" style={{ borderRadius: 8 }} className="no-print">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    W
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                      <ThunderboltOutlined style={{ marginRight: 6, color: '#FFC101' }} />
                      协同治理报告
                    </Title>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {reportId} · {formatTimestamp(report.generated_at)}
                    </Text>
                  </div>
                </div>
                <Space>
                  <Tooltip title="历史报告">
                    <Button size="small" icon={<HistoryOutlined />} onClick={loadHistory} />
                  </Tooltip>
                  <Tooltip title="导出 Markdown">
                    <Button size="small" icon={<FileMarkdownOutlined />} onClick={handleExportMD} />
                  </Tooltip>
                  <Tooltip title="导出 Word">
                    <Button size="small" icon={<FileWordOutlined />} onClick={handleExportWord} />
                  </Tooltip>
                  <Tooltip title="导出 PDF">
                    <Button size="small" icon={<FilePdfOutlined />} onClick={handleExportPDF} />
                  </Tooltip>
                </Space>
              </div>
              {queryText && (
                <div style={{ marginTop: 6, padding: '4px 10px', background: '#f8fafc', borderRadius: 6 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    查询: {queryText}
                  </Text>
                </div>
              )}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { key: 'entity-stats', label: '风险主体', icon: <TeamOutlined />, color: '#2855D1' },
                  { key: 'community', label: '群体发现', icon: <ClusterOutlined />, color: '#722ed1' },
                  { key: 'risk-paths', label: '风险传导路径', icon: <NodeIndexOutlined />, color: '#f5222d' },
                  { key: 'final-report', label: '协同治理社区报告', icon: <FileTextOutlined />, color: '#0f766e' },
                ].map((step, idx, arr) => (
                  <React.Fragment key={step.key}>
                    <Button
                      size="small"
                      type="text"
                      icon={step.icon}
                      onClick={() => scrollToSection(step.key)}
                      style={{ color: step.color, padding: '0 6px', height: 24 }}
                    >
                      {step.label}
                    </Button>
                    {idx < arr.length - 1 && <Text type="secondary" style={{ fontSize: 12 }}>→</Text>}
                  </React.Fragment>
                ))}
              </div>
            </Card>

            {/* ═══ Section 1: 风险主体 ═══ */}
            <div id="risk-section-entity-stats">
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  ...(highlightSection === 'entity-stats' ? { animation: 'sectionHighlight 1s ease-in-out 2' } : {}),
                }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#2855D1' }} />
                    风险主体
                    <Tag style={{ marginLeft: 8, fontSize: 10 }}>{riskSubjects.length || totalEntities} 个主体</Tag>
                  </span>
                }
              >
                {riskSubjects.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {riskSubjects.map((entity) => {
                      const color = (NODE_TYPE_COLORS as Record<string, string>)[entity.type] || '#2855D1';
                      const label = (NODE_TYPE_LABELS as Record<string, string>)[entity.type] || entity.type;
                      return (
                        <Tag
                          key={entity.id}
                          style={{
                            margin: 0,
                            borderRadius: 6,
                            fontSize: 12,
                            padding: '4px 8px',
                            cursor: onJumpToGraph ? 'pointer' : 'default',
                            background: `${color}10`,
                            border: `1px solid ${color}40`,
                            color,
                          }}
                          onClick={() => onJumpToGraph?.(entity.id, entity.name, entity.type)}
                        >
                          {onJumpToGraph ? <LinkOutlined style={{ marginRight: 4, fontSize: 10 }} /> : null}
                          {entity.name}
                          <span style={{ color: '#94a3b8', marginLeft: 6, fontSize: 10 }}>{label}</span>
                        </Tag>
                      );
                    })}
                  </div>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isLoading ? '风险主体识别中...' : '暂无可展示的风险主体'}
                  </Text>
                )}
              </Card>
            </div>

            {/* ═══ Section 2: 群体发现 ═══ */}
            <div id="risk-section-community">
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  ...(highlightSection === 'community' ? { animation: 'sectionHighlight 1s ease-in-out 2' } : {}),
                }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <ClusterOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    群体发现
                    {communities.length > 0 && (
                      <Tag style={{ marginLeft: 8, fontSize: 10 }}>{communities.length} 个群体</Tag>
                    )}
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ overflowX: 'auto', paddingBottom: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(132px, 1fr))', gap: 8, minWidth: 560 }}>
                      {flowCards.map((item, index) => (
                        <div
                          key={item.title}
                          style={{
                            height: 72,
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            background: index === 3 ? '#f5f3ff' : '#f8fafc',
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{item.title}</Text>
                          <Text strong style={{ fontSize: 22, color: index === 3 ? '#722ed1' : '#0f172a', lineHeight: '28px' }}>
                            {item.value}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{item.desc}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
                      <Tag style={{ margin: 0, borderRadius: 6, color: '#b45309', background: '#fffbeb', borderColor: '#fde68a' }}>
                        <ThunderboltOutlined style={{ marginRight: 4 }} />
                        风险主体种子 {seedFlowNodes.length} 个
                      </Tag>
                      {compactSeedNames.length > 0 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {compactSeedNames.join('、')}{seedFlowNodes.length > compactSeedNames.length ? ` 等 ${seedFlowNodes.length} 个` : ''}
                        </Text>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {visibleCommunities.map((comm: any) => {
                        const cid = Number(comm.community_id ?? comm.id ?? 0);
                        const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                        const members = comm.members || comm.top_entities || [];
                        const density = typeof comm.density === 'number' ? ` / 密度 ${comm.density.toFixed(2)}` : '';
                        return (
                          <span key={cid} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}18` }} />
                            群体 #{cid} · {comm.size || members.length} 成员{density}
                          </span>
                        );
                      })}
                      {communities.length > visibleCommunities.length && (
                        <Text type="secondary" style={{ fontSize: 11 }}>+{communities.length - visibleCommunities.length} 个群体</Text>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      minHeight: 430,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      padding: 14,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <Text strong style={{ fontSize: 14, display: 'block' }}>群体发现子图</Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          {connectedSubgraphCounts.nodes || subgraphCounts.nodes} 节点 / {connectedSubgraphCounts.edges || subgraphCounts.edges} 关系
                          {communityPreviewGraph.nodes.length < (connectedSubgraphCounts.nodes || subgraphCounts.nodes) && ` · 当前展示前 ${communityPreviewGraph.nodes.length} 个代表节点`}
                        </Text>
                      </div>
                      <Space size={6}>
                        {communityAlgorithm && <Tag style={{ fontSize: 10, margin: 0 }}>算法: {communityAlgorithm}</Tag>}
                        {Object.keys(communityNodePositions).length > 0 && (
                          <Button
                            size="small"
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                              setCommunityNodePositions({});
                              setDraggingCommunityNodeId(null);
                            }}
                            style={{ fontSize: 11, height: 24, padding: '0 6px' }}
                          >
                            重置布局
                          </Button>
                        )}
                      </Space>
                    </div>
                    <div style={{ position: 'relative', height: 360, borderRadius: 8, background: '#ffffff', border: '1px solid #dbeafe', overflow: 'hidden' }}>
                      {communityPreviewGraph.nodes.length > 0 ? (
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          onPointerMove={handleCommunityGraphPointerMove}
                          onPointerUp={stopCommunityGraphDrag}
                          onPointerLeave={stopCommunityGraphDrag}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            cursor: draggingCommunityNodeId ? 'grabbing' : 'default',
                            touchAction: 'none',
                          }}
                        >
                          <defs>
                            <filter id="communityNodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.18" />
                            </filter>
                          </defs>
                          {communityPreviewGraph.groups.map(([groupKey, groupNodes]: any, groupIndex: number) => {
                            if (groupKey === 'unknown' || !groupNodes.length) return null;
                            const color = COMMUNITY_PALETTE[Number(groupKey) % COMMUNITY_PALETTE.length];
                            const avgX = groupNodes.reduce((sum: number, node: any) => sum + node.x, 0) / groupNodes.length;
                            const avgY = groupNodes.reduce((sum: number, node: any) => sum + node.y, 0) / groupNodes.length;
                            const radius = Math.min(28, Math.max(12, 7 + groupNodes.length * 1.8));
                            return (
                              <circle
                                key={groupKey}
                                cx={avgX}
                                cy={avgY}
                                r={radius}
                                fill={`${color}10`}
                                stroke={`${color}35`}
                                strokeWidth="0.5"
                                strokeDasharray="2 1.5"
                              />
                            );
                          })}
                          {communityPreviewGraph.edges.map((edge: any, index: number) => (
                            <line
                              key={`${edge.id}-${index}`}
                              x1={edge.source.x}
                              y1={edge.source.y}
                              x2={edge.target.x}
                              y2={edge.target.y}
                              stroke="#94a3b8"
                              strokeWidth="0.42"
                              strokeOpacity="0.55"
                              vectorEffect="non-scaling-stroke"
                            >
                              <title>{edge.relation || '关系'}</title>
                            </line>
                          ))}
                          {communityPreviewGraph.nodes.map((node: any, index: number) => {
                            const color = node.communityId !== undefined
                              ? COMMUNITY_PALETTE[node.communityId % COMMUNITY_PALETTE.length]
                              : NODE_TYPE_COLORS[node.type] || '#64748b';
                            const showLabel = hoveredCommunityNodeId === node.id || draggingCommunityNodeId === node.id;
                            const label = node.name.length > 14 ? `${node.name.slice(0, 13)}...` : node.name;
                            const labelWidth = Math.max(18, Math.min(46, label.length * 3.1 + 6));
                            const labelX = Math.min(96 - labelWidth, Math.max(4, node.x + 2.8));
                            const labelY = Math.max(6, node.y - 6.2);
                            return (
                              <g
                                key={`${node.id}-${index}`}
                                onPointerDown={(event) => handleCommunityNodePointerDown(event, node.id)}
                                onPointerUp={stopCommunityGraphDrag}
                                onPointerEnter={() => setHoveredCommunityNodeId(node.id)}
                                onPointerLeave={() => setHoveredCommunityNodeId((current) => current === node.id ? null : current)}
                                style={{ cursor: draggingCommunityNodeId === node.id ? 'grabbing' : 'grab' }}
                              >
                                <title>{`${node.name}${node.communityId !== undefined ? ` / 群体 #${node.communityId}` : ''}`}</title>
                                {node.isSeed && (
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="2.7"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="1"
                                    vectorEffect="non-scaling-stroke"
                                  />
                                )}
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r={node.isSeed ? 1.85 : 1.45}
                                  fill={color}
                                  stroke="#ffffff"
                                  strokeWidth="0.7"
                                  filter="url(#communityNodeShadow)"
                                  vectorEffect="non-scaling-stroke"
                                />
                                {showLabel && (
                                  <g style={{ pointerEvents: 'none' }}>
                                    <rect
                                      x={labelX}
                                      y={labelY}
                                      width={labelWidth}
                                      height="7.2"
                                      rx="1.8"
                                      fill="#ffffff"
                                      stroke={`${color}55`}
                                      strokeWidth="0.45"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                    <text
                                      x={labelX + 3}
                                      y={labelY + 4.9}
                                      fontSize="2.65"
                                      fill="#334155"
                                    >
                                      {label}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>等待子图数据</Text>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
                      {seedFlowNodes.length > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', border: '2px solid #f59e0b' }} />
                          种子节点
                        </span>
                      )}
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        节点可拖拽调整位置，悬浮显示名称；大规模子图默认抽样展示，避免成员列表刷屏。
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ═══ Section 3: 风险传导路径 ═══ */}
            <div id="risk-section-risk-paths">
              {sortedPaths.length > 0 ? (
                <Card
                  size="small"
                  style={{
                    borderRadius: 8,
                    ...(highlightSection === 'risk-paths' ? { animation: 'sectionHighlight 1s ease-in-out 2' } : {}),
                  }}
                  title={
                    <span style={{ fontSize: 13 }}>
                      <NodeIndexOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                      风险传导路径 ({sortedPaths.length})
                    </span>
                  }
                  extra={
                    <Space size={4}>
                      <Tag color="error" style={{ fontSize: 10, borderRadius: 4 }}>高风险 {highCount}</Tag>
                      <Tag color="warning" style={{ fontSize: 10, borderRadius: 4 }}>中风险 {mediumCount}</Tag>
                      <Tag color="success" style={{ fontSize: 10, borderRadius: 4 }}>低风险 {lowCount}</Tag>
                    </Space>
                  }
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    <Space size={0} style={{ padding: 2, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                      <Button
                        size="small"
                        type={riskPathMode === 'community' ? 'primary' : 'text'}
                        icon={<ClusterOutlined />}
                        onClick={() => setRiskPathMode('community')}
                        style={{ borderRadius: 6, fontSize: 12 }}
                      >
                        群体间传导
                      </Button>
                      <Button
                        size="small"
                        type={riskPathMode === 'node' ? 'primary' : 'text'}
                        icon={<NodeIndexOutlined />}
                        onClick={() => setRiskPathMode('node')}
                        style={{ borderRadius: 6, fontSize: 12 }}
                      >
                        具体节点路径
                      </Button>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      群体视图看社区之间的风险扩散，节点视图看每条路径的实体链路
                    </Text>
                  </div>

                  {riskPathMode === 'community' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 12 }}>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <Text strong style={{ fontSize: 13 }}>群体社区之间的关系</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            {riskTransmissionGraph.nodes.length} 个群体 / {riskTransmissionGraph.edges.length} 条传导关系
                          </Text>
                        </div>
                        <div style={{ height: 260, position: 'relative' }}>
                          {riskTransmissionGraph.nodes.length > 0 ? (
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                              <defs>
                                <marker id="riskArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                                  <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
                                </marker>
                              </defs>
                              {riskTransmissionGraph.edges.map((edge: any, index: number) => {
                                const source = riskTransmissionGraph.nodes.find((node) => node.id === edge.source);
                                const target = riskTransmissionGraph.nodes.find((node) => node.id === edge.target);
                                if (!source || !target) return null;
                                return (
                                  <line
                                    key={`${edge.source}-${edge.target}-${index}`}
                                    x1={source.x}
                                    y1={source.y}
                                    x2={target.x}
                                    y2={target.y}
                                    stroke={RISK_LEVEL_COLORS[edge.level] || '#64748b'}
                                    strokeWidth={Math.min(2.8, 0.8 + edge.count * 0.45)}
                                    strokeOpacity="0.72"
                                    markerEnd="url(#riskArrow)"
                                    vectorEffect="non-scaling-stroke"
                                  >
                                    <title>{`${source.label} → ${target.label} / ${edge.count} 条路径`}</title>
                                  </line>
                                );
                              })}
                              {riskTransmissionGraph.nodes.map((node) => {
                                const color = COMMUNITY_PALETTE[node.id % COMMUNITY_PALETTE.length];
                                const nodeRiskColor = node.highCount > 0 ? RISK_LEVEL_COLORS.high : node.mediumCount > 0 ? RISK_LEVEL_COLORS.medium : color;
                                return (
                                  <g key={node.id}>
                                    <title>{`${node.label} / ${node.size} 成员 / ${node.pathCount} 条路径`}</title>
                                    <circle cx={node.x} cy={node.y} r="8.5" fill={`${color}18`} stroke={nodeRiskColor} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                                    <circle cx={node.x} cy={node.y} r="3.2" fill={color} stroke="#ffffff" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                                    <text x={node.x} y={node.y + 13} textAnchor="middle" fontSize="3.1" fill="#334155" stroke="#ffffff" strokeWidth="0.65" paintOrder="stroke">
                                      {node.label}
                                    </text>
                                    <text x={node.x} y={node.y + 17} textAnchor="middle" fontSize="2.4" fill="#64748b" stroke="#ffffff" strokeWidth="0.5" paintOrder="stroke">
                                      {node.size} 成员
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>暂无可映射的群体传导关系</Text>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {riskTransmissionGraph.pathRows.slice(0, showAllPaths ? riskTransmissionGraph.pathRows.length : 5).map(({ path, communitySequence }) => (
                          <div key={path.path_id} style={{ padding: '10px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                              <Tag color={RISK_LEVEL_COLORS[path.risk_level]} style={{ fontSize: 10, borderRadius: 4, margin: 0 }}>
                                {path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'}
                              </Tag>
                              <Text strong style={{ fontSize: 12 }}>{path.path_id}</Text>
                              {path.confidence !== undefined && (
                                <Tag style={{ fontSize: 10, borderRadius: 4, margin: 0 }}>{(path.confidence * 100).toFixed(0)}%</Tag>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                              {communitySequence.length > 0 ? communitySequence.map((cid, idx) => {
                                const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                                return (
                                  <React.Fragment key={`${path.path_id}-${cid}-${idx}`}>
                                    {idx > 0 && <span style={{ color: '#94a3b8', fontSize: 11 }}>→</span>}
                                    <Tag style={{ margin: 0, borderRadius: 6, fontSize: 11, color, background: `${color}10`, border: `1px solid ${color}40` }}>
                                      群体 #{cid}
                                    </Tag>
                                  </React.Fragment>
                                );
                              }) : (
                                <Text type="secondary" style={{ fontSize: 11 }}>该路径暂未映射到群体</Text>
                              )}
                            </div>
                            <Text style={{ fontSize: 12, color: '#475569' }}>{path.path_description}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {displayedPaths.map((path) => (
                        <div
                          key={path.path_id}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: 6,
                            borderLeft: `4px solid ${RISK_LEVEL_COLORS[path.risk_level] || '#fa8c16'}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                            <Tag color={RISK_LEVEL_COLORS[path.risk_level]} style={{ fontSize: 10, borderRadius: 4, lineHeight: '18px', margin: 0 }}>
                              {path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'}
                            </Tag>
                            <Text strong style={{ fontSize: 12 }}>{path.path_id}</Text>
                            {path.confidence !== undefined && (
                              <Tag style={{ fontSize: 10, borderRadius: 4, lineHeight: '18px', margin: 0, background: '#f0f5ff', border: '1px solid #d6e4ff', color: '#2855D1' }}>
                                {(path.confidence * 100).toFixed(0)}%
                              </Tag>
                            )}
                            {onJumpToGraph && path.affected_entities?.length > 0 && (
                              <Button
                                size="small"
                                type="link"
                                icon={<EyeOutlined />}
                                style={{ fontSize: 10, padding: 0, height: 20 }}
                                onClick={() => onJumpToGraph(path.affected_entities[0], path.affected_entities[0], 'Entity')}
                              >
                                查看图谱
                              </Button>
                            )}
                          </div>
                          <Text style={{ fontSize: 12, color: '#475569' }}>{path.path_description}</Text>
                          {path.affected_entities && path.affected_entities.length > 0 && (
                            <div style={{ marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 'max-content' }}>
                                {path.affected_entities.slice(0, 12).map((entity, idx) => {
                                  const etype = inferClientEntityType(entity)
                                  const color = (NODE_TYPE_COLORS as Record<string, string>)[etype] || '#8c8c8c'
                                  const label = (NODE_TYPE_LABELS as Record<string, string>)[etype] || etype
                                  return (
                                    <React.Fragment key={entity}>
                                      {idx > 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>}
                                      <Tooltip title={`${label}: ${entity}`}>
                                        <Tag
                                          style={{
                                            fontSize: 11, borderRadius: 16, cursor: onJumpToGraph ? 'pointer' : 'default',
                                            border: `1px solid ${color}40`, background: `${color}10`, color,
                                            margin: 0, padding: '3px 9px',
                                          }}
                                          onClick={() => onJumpToGraph?.(entity, entity, etype)}
                                        >
                                          {entity.length > 14 ? entity.slice(0, 12) + '...' : entity}
                                        </Tag>
                                      </Tooltip>
                                    </React.Fragment>
                                  )
                                })}
                                {path.affected_entities.length > 12 && (
                                  <Text type="secondary" style={{ fontSize: 10, marginLeft: 4 }}>+{path.affected_entities.length - 12} 更多</Text>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {sortedPaths.length > 5 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowAllPaths(!showAllPaths)}
                      style={{ marginTop: 8, padding: 0 }}
                    >
                      {showAllPaths ? '收起，仅显示前 5 条' : `展开全部 ${sortedPaths.length} 条路径`}
                    </Button>
                  )}
                </Card>
              ) : (
                <Card
                  size="small"
                  style={{ borderRadius: 8 }}
                  title={
                    <span style={{ fontSize: 13 }}>
                      <NodeIndexOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                      风险传导路径
                    </span>
                  }
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isLoading ? '风险路径分析进行中...' : '未检测到风险传导路径'}
                  </Text>
                </Card>
              )}
            </div>

            {/* ═══ Section 4: 协同治理社区报告 ═══ */}
            <div id="risk-section-final-report" ref={finalReportRef}>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  border: highlightSection === 'final-report' ? '2px solid #2855D1' : undefined,
                  transition: 'border-color 0.5s ease',
                  ...(highlightSection === 'final-report' ? { animation: 'sectionHighlight 1s ease-in-out 2' } : {}),
                }}
                title={
                  <span style={{ fontSize: 13 }}>
                    <FileTextOutlined style={{ marginRight: 8, color: '#2855D1' }} />
                    协同治理社区报告
                  </span>
                }
                extra={
                  <Space size={4} className="no-print">
                    <Tooltip title="导出 Markdown">
                      <Button size="small" icon={<FileMarkdownOutlined />} onClick={handleExportMD} />
                    </Tooltip>
                    <Tooltip title="导出 Word">
                      <Button size="small" icon={<FileWordOutlined />} onClick={handleExportWord} />
                    </Tooltip>
                    <Tooltip title="导出 PDF">
                      <Button size="small" icon={<FilePdfOutlined />} onClick={handleExportPDF} />
                    </Tooltip>
                  </Space>
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Title level={5} style={{ margin: '0 0 8px', fontSize: 15 }}>
                      <ThunderboltOutlined style={{ marginRight: 8, color: '#FFC101' }} />
                      社区治理结论
                    </Title>
                    <Paragraph
                      ellipsis={{ rows: 4, expandable: true }}
                      style={{ color: '#475569', fontSize: 13, marginBottom: 0 }}
                    >
                      {report.executive_summary}
                    </Paragraph>
                  </div>
                </div>

                {report.integrated_report || report.markdown_report ? (
                  <div className="markdown-report" style={{ fontSize: 13, lineHeight: 1.75, color: '#334155', marginTop: 12, padding: '14px 16px', background: '#f8fafc', borderRadius: 8 }}>
                    <ReactMarkdown>{report.integrated_report || report.markdown_report}</ReactMarkdown>
                  </div>
                ) : null}

                {governancePlan?.actions && governancePlan.actions.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>协同处置动作</Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {governancePlan.actions.slice(0, 4).map((action, idx) => {
                        const urgency = URGENCY_TAGS[action.priority] || URGENCY_TAGS.normal;
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              padding: '8px 12px',
                              background: action.priority === 'urgent' ? '#fff2f0' : '#f8fafc',
                              borderRadius: 6,
                              border: action.priority === 'urgent' ? '1px solid #ffccc7' : '1px solid #e2e8f0',
                            }}
                          >
                            <span style={{ fontSize: 18, fontWeight: 700, color: urgency.color, minWidth: 24, textAlign: 'center', lineHeight: 1.2 }}>
                              {idx + 1}
                            </span>
                            <div style={{ flex: 1 }}>
                              <Text strong style={{ fontSize: 12 }}>{action.measure}</Text>
                              <Text style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>
                                {action.target} · {action.risk_issue}
                              </Text>
                              <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <Tag color={urgency.color} style={{ borderRadius: 4, fontSize: 10, margin: 0 }}>
                                  {urgency.label}
                                </Tag>
                                <Tag style={{ borderRadius: 4, fontSize: 10, margin: 0 }}>{action.department}</Tag>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* ═══ Error banner ═══ */}
            {error && report && (
              <Card size="small" style={{ borderRadius: 8, border: '1px solid #ffccc7' }} className="no-print">
                <Text type="danger" style={{ fontSize: 12 }}>注意: {error}</Text>
              </Card>
            )}
          </>
        )}

      </div>

      {/* ═══ Report History Drawer ═══ */}
      <Drawer
        title="历史报告"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        width={360}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin indicator={<LoadingOutlined spin />} />
          </div>
        ) : historyReports.length === 0 ? (
          <Empty description="暂无历史报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={historyReports}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: 6 }}
                onClick={() => loadHistoryReport(item.report_id)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 12 }}>{item.report_id}</Text>
                    <Tag
                      color={RISK_LEVEL_COLORS[item.overall_risk_level] || '#fa8c16'}
                      style={{ borderRadius: 4, fontSize: 10 }}
                    >
                      {RISK_LEVEL_LABELS[item.overall_risk_level] || item.overall_risk_level?.toUpperCase()}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    {item.query_summary || '-'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {item.generated_at ? formatTimestamp(item.generated_at) : ''} · {item.subtasks_completed} 个子任务
                  </Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default RiskReportPanel;
