import { ReloadOutlined, SearchOutlined, DownOutlined, NodeIndexOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { App, Button, Card, Col, Drawer, Empty, Form, Input, Modal, Row, Select, Space, Spin, Table, Tag, Descriptions, Popover, Tooltip } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import G6 from '@antv/g6';
import { GENERAL_CONFIG, IMPORTANCE_MAP, FACTOR_TYPE_MAP, RISK_TYPE_MAP, EDGE_STYLE_MAP } from './graphConfig';
import { barycenterSort, constrainedForceLayout } from './KnowledgeGraph/layouts';

// 画布配置
const CANVAS_HEIGHT = 900; // 增加总高度
const LAYER_GAP = 50;

// 为不同层分配不同的高度
const LAYER_HEIGHTS = {
  0: 120,  // 主体层：较小
  1: 300,  // 事件层：最大（需要容纳三个子层）
  2: 240,  // 特征层：较大（需要容纳两个子层）
  3: 120,  // 法规层：较小
};

const LAYER_CONFIG = [
  { name: '主体层', color: '#e6f7ff', labelColor: '#1890ff', index: 0, tag: 'Subject', height: LAYER_HEIGHTS[0] },
  { name: '事件层', color: '#fff1f0', labelColor: '#ff4d4f', index: 1, tag: 'Event', height: LAYER_HEIGHTS[1] },
  { name: '特征层', color: '#f6ffed', labelColor: '#52c41a', index: 2, tag: 'Feature', height: LAYER_HEIGHTS[2] },
  { name: '法规层', color: '#f9f0ff', labelColor: '#722ed1', index: 3, tag: 'Regulation', height: LAYER_HEIGHTS[3] },
];

const NODE_STYLE_CONFIG = GENERAL_CONFIG.nodeStyles;
const RELATION_LABEL_MAP = GENERAL_CONFIG.relationLabels;
const PROPERTY_MAP = GENERAL_CONFIG.propertyMap;

const NODE_TYPE_OPTIONS = Object.keys(NODE_STYLE_CONFIG)
  .filter(k => k !== 'Unknown')
  .map(k => ({ value: k, label: NODE_STYLE_CONFIG[k].label }));

// 辅助函数
const parseRiskJson = (jsonStr: string) => {
  try {
    let fixedStr = jsonStr.trim();
    if (!fixedStr.startsWith('[')) fixedStr = '[' + fixedStr.replace(/\}\s*\{/g, '},{') + ']';
    const parsed = JSON.parse(fixedStr);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    const matches = jsonStr.match(/\{[^{}]+\}/g);
    return matches ? matches.map(m => { try { return JSON.parse(m) } catch { return null } }).filter(Boolean) : [];
  }
};

const safeParseCount = (jsonStr: string) => {
  try { return parseRiskJson(jsonStr).length; } catch { return 0; }
};

const getYByLayer = (layerIndex: number) => {
  let y = 0;
  for (let i = 0; i < layerIndex; i++) {
    y += LAYER_HEIGHTS[i as keyof typeof LAYER_HEIGHTS] + LAYER_GAP;
  }
  return y + LAYER_HEIGHTS[layerIndex as keyof typeof LAYER_HEIGHTS] / 2;
};

const drawSwimlanes = (graph: any, width: number) => {
  const group = graph.get('group');
  let currentY = 0;
  
  LAYER_CONFIG.forEach((cfg) => {
    const layerHeight = cfg.height;
    
    group.addShape('rect', {
      attrs: { x: 0, y: currentY, width: width, height: layerHeight, fill: cfg.color, opacity: 0.5 },
      name: 'lane-background', zIndex: -10,
    });
    
    if (cfg.index < 3) {
      group.addShape('path', {
        attrs: {
          path: [['M', 0, currentY + layerHeight + LAYER_GAP / 2], ['L', width, currentY + layerHeight + LAYER_GAP / 2]],
          stroke: '#e8e8e8', lineDash: [5, 5], lineWidth: 1,
        },
        name: 'lane-divider', zIndex: -9,
      });
    }
    
    currentY += layerHeight + LAYER_GAP;
  });
  group.sort();
};

const CustomStatistic = ({ title, value }: { title: string; value: number }) => (
  <div style={{ padding: '2px 0', textAlign: 'center' }}>
    <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', marginBottom: 4, fontWeight: 500 }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: '600', color: '#000', lineHeight: 1.2 }}>{value.toLocaleString()}</div>
  </div>
);

const GeneralPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges?: any[]; links?: any[] }>({ nodes: [], edges: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [layerStats, setLayerStats] = useState<{ total: number, total_relationships?: number, details: Array<{label: string, value: number, type: string}> }>({ total: 0, total_relationships: 0, details: [] });
  const [detailedStats, setDetailedStats] = useState<Array<{
    layer: string;
    layer_code: string;
    node_count: number;
    node_type_count: number;
    node_types: string[];
    rel_count: number;
    rel_type_count: number;
    rel_types: string[];
  }>>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState("");
  const [expanding, setExpanding] = useState<boolean>(false);
  const [filterLayer, setFilterLayer] = useState<string | null>(null);
  const [showDetailedStats, setShowDetailedStats] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  const loadData = async (url: string, isSearch: boolean) => {
    setLoading(true);
    setGraphError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.error) {
        setGraphError(result.error);
        setGraphData({ nodes: [], edges: [], links: [] });
        return;
      }
      if (!result.nodes || !Array.isArray(result.nodes)) {
        setGraphError('后端返回数据格式异常，缺少 nodes 字段');
        setGraphData({ nodes: [], edges: [], links: [] });
        return;
      }
      if (isSearch && result.nodes.length === 0) {
        message.warning("未找到相关的关联主体");
        setGraphData({ nodes: [], edges: [], links: [] });
      } else {
        const rawEdges = result.edges || result.links || [];
        const dataWithLinks = { ...result, links: Array.isArray(rawEdges) ? rawEdges : [] };
        setGraphData(dataWithLinks);
        console.log('Graph data loaded:', { nodes: dataWithLinks.nodes?.length, links: dataWithLinks.links?.length });
        if (isSearch) message.success(`找到 ${result.nodes.length} 个关联节点`);
      }
    } catch (err) {
      setGraphError('后端服务连接失败，请检查服务是否启动');
      setGraphData({ nodes: [], edges: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadFullGraph = () => {
    setLoading(true);
    setFilterLayer(null);
    loadData('/api/v1/graph/data?limit=100', false).finally(() => setLoading(false));
  };

  const loadLayerFilter = (layer: string) => {
    if (filterLayer === layer) {
      loadFullGraph();
      return;
    }
    setLoading(true);
    setFilterLayer(layer);
    loadData(`/api/v1/graph/data?limit=100&layer=${layer}`, false).finally(() => setLoading(false));
  };

  const loadLayerStatistics = async () => {
    try {
      // Use unified summary-stats endpoint (B1) for total counts
      const response = await fetch('/api/v1/graph/summary-stats');
      const data = await response.json();
      if (data && data.total_nodes !== undefined) {
        setLayerStats({
          total: data.total_nodes,
          total_relationships: data.total_relationships,
          details: data.layers ? data.layers.map((l: any) => ({
            label: l.layer,
            value: l.node_count,
            type: l.layer_code,
          })) : [],
        });
      }
    } catch {
      // Fallback: use the enhanced /statistics?layer=all (B3)
      try {
        const response = await fetch('/api/v1/graph/statistics');
        const data = await response.json();
        if (data && data.total !== undefined && Array.isArray(data.details)) {
          setLayerStats({ total: data.total, total_relationships: data.total_relationships || 0, details: data.details });
        }
      } catch (err) { console.error('加载层级统计失败:', err); }
    }
  };

  const loadDetailedStatistics = async () => {
    try {
      const response = await fetch('/api/v1/graph/statistics');
      const result = await response.json();
      if (result.success && result.layers) {
        setDetailedStats(result.layers);
      }
    } catch (err) { console.error('加载详细统计失败:', err); }
  };

  var handleExportPNG = function () {
    if (graphRef.current) {
      graphRef.current.downloadFullImage('knowledge-graph-' + Date.now(), 'image/png', {
        backgroundColor: '#fff',
        padding: 20,
      });
      message.success('图谱已导出为 PNG');
    }
  };

  var handleExportCSV = function () {
    var headers = '层级,节点数,节点类型数,关系数,关系类型数\r\n';
    var rows = detailedStats
      .map(function (l) {
        return l.layer + ',' + l.node_count + ',' + l.node_type_count + ',' + l.rel_count + ',' + l.rel_type_count;
      })
      .join('\r\n');
    var csv = '﻿' + headers + rows;
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph-stats-' + Date.now() + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    message.success('统计数据已导出为 CSV');
  };

  const handleSearch = (values: any) => {
    const { keyword, layers, searchLayer } = values;
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword.trim());
    if (layers) params.append('depth', layers.toString());
    if (searchLayer && searchLayer !== 'all') params.append('layer', searchLayer);
    params.append('limit', '200');

    if (!keyword) {
      loadFullGraph();
    } else {
      loadData(`/api/v1/graph/search-all?${params.toString()}`, true);
    }
  };

  const processedData = useMemo(() => {
    if (!graphData || !graphData.nodes || !Array.isArray(graphData.nodes) || !graphData.nodes.length) {
      return { nodes: [], links: [] };
    }

    const nodes = graphData.nodes.map((node: any) => {
        let typeKey = 'Unknown';
        let layerIdx = 0;
        const labels = node.labels || [];
        const props = node.properties || {};
        
        if (labels.includes('Subject')) {
          layerIdx = 0;
          typeKey = labels.includes('COMPANY') ? 'COMPANY' : 'PERSON';
        } else if (labels.includes('Event')) {
          layerIdx = 1;
          
          // 判断是否为TIME节点
          if (labels.includes('TIME')) {
            typeKey = 'TIME';
          } else {
            // 区分主事件和子事件
            const nodeName = props.name || props.title || '';
            const nodeType = props.node_type || '';
            const eventType = props.event_type || '';
            
            // 通过多种方式判断是否为子事件
            if (
              props.parent_event ||  // 有父事件属性
              nodeName.includes('子事件') ||  // 名称包含"子事件"
              nodeType.includes('子') ||  // 节点类型包含"子"
              eventType.includes('子') ||  // 事件类型包含"子"
              props.is_sub_event === true ||  // 明确标记为子事件
              props.level === 'sub'  // 层级标记为sub
            ) {
              typeKey = 'SUB_EVENT';
            } else {
              typeKey = 'EVENT';
            }
          }
        } else if (labels.includes('Feature')) {
          layerIdx = 2;
          typeKey = labels.includes('RiskFeature') ? 'RiskFeature' : 'RiskFactor';
        } else if (labels.includes('Regulation')) {
          layerIdx = 3;
          typeKey = 'Action';
        }
        
        const finalTypeKey = node.typeKey || typeKey;
        const nodeStyle = NODE_STYLE_CONFIG[finalTypeKey] || NODE_STYLE_CONFIG['Unknown'];
        
        // 根据节点类型选择显示的属性
        let nodeName = '未知';
        if (finalTypeKey === 'TIME') {
          // TIME节点显示id属性
          nodeName = props.id || props.time || props.name || '未知时间';
        } else if (finalTypeKey === 'RiskFactor') {
          // 风险因子显示e_id属性
          nodeName = props.e_id || props.factor_nm || props.name || '未知因子';
        } else if (finalTypeKey === 'RiskFeature') {
          // 风险特征显示id属性
          nodeName = props.id || props.feature_nm || props.name || '未知特征';
        } else {
          // 其他节点显示常规属性
          nodeName = props.name || props.COMPANY_NM || props.title || '未知';
        }

        return {
          ...node,
          id: String(node.id),
          name: nodeName,
          label: nodeName.length > 6 ? `${nodeName.substring(0, 6)}...` : nodeName,
          fullLabel: nodeName,
          typeKey: finalTypeKey,
          layer: layerIdx,
          color: nodeStyle.color,
          levelName: nodeStyle.label,
          y: getYByLayer(layerIdx),
          style: { fill: nodeStyle.color, stroke: '#fff', lineWidth: 2, r: 30, cursor: 'pointer' },
          labelCfg: { 
            position: 'center', 
            style: { 
              fill: '#fff', 
              fontSize: 12, 
              fontWeight: 'bold',
              textAlign: 'center',
              textBaseline: 'middle'
            } 
          },
        };
      }).filter(Boolean);

    var processed = { nodes: nodes, links: [] as any[] };

    var rawLinks = graphData.links || graphData.edges || [];
    var linksArr = Array.isArray(rawLinks) ? rawLinks : [];
    processed.links = linksArr.map(function(link: any) {
      var sourceId = String(link.source || link.sourceId || '');
      var targetId = String(link.target || link.targetId || '');
      var sourceNode = nodes.find(function(n) { return n.id === sourceId; });
      var targetNode = nodes.find(function(n) { return n.id === targetId; });
      var edgeColor = '#d9d9d9';
      var edgeWidth = 1.5;
      if (sourceNode && targetNode) {
        var key = sourceNode.layer + '-' + targetNode.layer;
        var styleConfig = EDGE_STYLE_MAP[key];
        if (styleConfig) {
          edgeColor = styleConfig.stroke;
          edgeWidth = styleConfig.lineWidth;
        }
      }
      return {
        ...link,
        id: sourceId + '-' + targetId + '-' + (link.label || 'default'),
        source: sourceId,
        target: targetId,
        label: RELATION_LABEL_MAP[link.label] || link.label || '关联',
        type: 'line',
        style: { endArrow: true, stroke: edgeColor, lineWidth: edgeWidth },
        labelCfg: { autoRotate: true, refY: -8, style: { fill: edgeColor, fontSize: 10 } },
      };
    }).filter(function(link: any) { return link !== null; });

    return processed;
  }, [graphData]);

  useEffect(() => {
    loadFullGraph();
    loadLayerStatistics();
    loadDetailedStatistics();
    return () => {
      if (graphRef.current) graphRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !processedData.nodes.length) return;
    if (graphRef.current) graphRef.current.destroy();

    var nodeCount = processedData.nodes.length;
    var width = containerRef.current.scrollWidth || window.innerWidth;
    var graph = new G6.Graph({
      container: containerRef.current,
      width: width,
      height: CANVAS_HEIGHT,
      fitView: true,
      fitViewPadding: 50,
      renderer: 'canvas',
      animate: nodeCount < 200,
      layout: null as any,
      defaultNode: { type: 'circle', size: 60, labelCfg: { position: 'center' } },
      defaultEdge: { type: 'line', style: { endArrow: true, stroke: '#e2e2e2' }, labelCfg: { autoRotate: true, refY: 10 } },
      modes: {
        default: [
          {
            type: 'drag-canvas',
            enableOptimize: true,  // 开启性能优化
            scalableRange: 0.1,    // 缩放范围
          },
          {
            type: 'zoom-canvas',
            sensitivity: 2,         // 缩放灵敏度
            minZoom: 0.5,          // 最小缩放比例
            maxZoom: 3,            // 最大缩放比例
          },
          'drag-node',
          'click-select'
        ]
      },
      plugins: [
        new G6.Tooltip({
          offsetX: 10,
          offsetY: 10,
          itemTypes: ['node'],
          getContent: (e) => {
            const model = e?.item?.getModel();
            if (!model) return '';
            
            const labels = model.labels || [];
            const hasEventLabels = labels.includes('EVENT') && labels.includes('Event');
            
            if (hasEventLabels) {
              const textContent = model.properties?.text || '';
              if (textContent) {
                return `<div style="padding: 12px; background: rgba(0, 0, 0, 0.85); color: #fff; border-radius: 4px; max-width: 300px; word-wrap: break-word; font-size: 13px; line-height: 1.5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">${textContent}</div>`;
              }
            }
            return '';
          },
          shouldBegin: (e) => {
            const model = e?.item?.getModel();
            if (!model) return false;
            const labels = model.labels || [];
            const hasEventLabels = labels.includes('EVENT') && labels.includes('Event');
            return hasEventLabels && !!model.properties?.text;
          },
        }),
      ],
    });

    // 按层级分组节点
    const layerNodesMap: Record<number, any[]> = {};

    processedData.nodes.forEach(node => {
      const layer = node.layer || 0;
      if (!layerNodesMap[layer]) layerNodesMap[layer] = [];
      layerNodesMap[layer].push(node);
    });

    // ─── 位置计算：三阶段统一管线 ──────────────────────────────
    const leftMargin = 150;
    const availableWidth = width - leftMargin * 2;
    const layerCenterX = leftMargin + availableWidth / 2;
    var nodePositions = new Map<string, { x: number; y: number }>();

    // 根据 typeKey 返回 sub-layer Y
    var getAssignedY = function (node: any): number {
      var baseY = 0;
      for (var li = 0; li < (node.layer || 0); li++) {
        baseY += LAYER_HEIGHTS[li as keyof typeof LAYER_HEIGHTS] + LAYER_GAP;
      }
      var h = LAYER_HEIGHTS[(node.layer || 0) as keyof typeof LAYER_HEIGHTS];
      switch (node.typeKey) {
        case 'EVENT':       return baseY + h * 0.17;
        case 'SUB_EVENT':   return baseY + h * 0.50;
        case 'TIME':        return baseY + h * 0.83;
        case 'RiskFactor':  return baseY + h * 0.25;
        case 'RiskFeature': return baseY + h * 0.75;
        default:            return baseY + h / 2;
      }
    };

    // --- Phase 1: 统一分配 Y（typeKey → sub-layer）+ even-spacing X 作为预热起点 ---
    [0, 1, 2, 3].forEach(function (layer) {
      var nodes = layerNodesMap[layer] || [];
      nodes.forEach(function (node, i) {
        var total = nodes.length;
        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
        nodePositions.set(node.id, {
          x: total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX,
          y: getAssignedY(node),
        });
      });
    });

    // --- Phase 2: 逐层质心排序，减少跨层边交叉 ---
    // 从 Layer 1（事件层，连接最密集）开始，向上下扩散
    var allIdNodes = processedData.nodes.map(function (n) { return { id: n.id }; });
    var linkObjs = processedData.links.map(function (l) { return { source: String(l.source), target: String(l.target) }; });

    [1, 0, 2, 3].forEach(function (layer) {
      var layerNodes = (layerNodesMap[layer] || []).slice();
      if (layerNodes.length === 0) return;
      var layerIds = new Set(layerNodes.map(function (n) { return n.id; }));
      var adjacentNodes = allIdNodes.filter(function (n) { return !layerIds.has(n.id); });

      var sorted = barycenterSort(
        layerNodes.map(function (n) { return { id: n.id }; }),
        adjacentNodes,
        linkObjs
      );

      sorted.forEach(function (sortedNode, i) {
        var total = sorted.length;
        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
        var pos = nodePositions.get(sortedNode.id);
        if (pos) pos.x = total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX;
      });
    });

    // --- Phase 3: 约束力导向精炼（Y 锁定，X 自由）---
    var forceNodes = processedData.nodes.map(function (n) {
      var pos = nodePositions.get(n.id) || { x: layerCenterX, y: getAssignedY(n) };
      return { id: n.id, x: pos.x, y: pos.y, assignedY: pos.y };
    });
    var forceEdges = processedData.links.map(function (l) {
      return { source: String(l.source), target: String(l.target) };
    });

    constrainedForceLayout(forceNodes, forceEdges, layerCenterX, {
      repulsionStrength: 5000,
      attractionStrength: 0.01,
      gravity: 0.03,
      maxIterations: 80,
    });

    // 构建最终 nodesWithPosition
    var forcePosMap = new Map<string, { x: number; y: number }>();
    forceNodes.forEach(function (n) { forcePosMap.set(n.id, { x: n.x, y: n.y }); });

    var nodesWithPosition = processedData.nodes.map(function (node) {
      var pos = forcePosMap.get(node.id);
      if (pos) return Object.assign({}, node, { x: pos.x, y: pos.y });
      var fb = nodePositions.get(node.id);
      return Object.assign({}, node, { x: fb ? fb.x : layerCenterX, y: fb ? fb.y : getAssignedY(node) });
    });

    graph.data({ nodes: nodesWithPosition, edges: processedData.links });
    graph.render();
    drawSwimlanes(graph, width);

    graph.on('node:click', (evt) => {
      const item = evt.item;
      const model = item?.getModel();
      if (!model) return;
      setSelectedNode(model);
      setDrawerVisible(true);
    });

    // Double-click to expand neighbor nodes
    graph.on('node:dblclick', async (evt) => {
      const item = evt.item;
      const model = item?.getModel();
      if (!model || expanding) return;

      setExpanding(true);
      try {
        const nodeId = model.id;
        const response = await fetch(`/api/v1/graph/expand/${nodeId}?depth=1&limit=100`);
        const result = await response.json();

        if (result.nodes && result.nodes.length > 0) {
          // Merge new nodes and edges with existing graph data
          const existingNodeIds = new Set(processedData.nodes.map((n: any) => n.id));
          const existingEdgeIds = new Set(processedData.links.map((l: any) => l.id));

          const newNodes = result.nodes.filter((n: any) => !existingNodeIds.has(n.id));
          const newEdges = (result.edges || []).filter((e: any) => {
            const eid = `${e.source || e.sourceId}-${e.target || e.targetId}-${e.label || 'default'}`;
            return !existingEdgeIds.has(eid);
          });

          if (newNodes.length > 0 || newEdges.length > 0) {
            setGraphData((prev: any) => ({
              nodes: [...prev.nodes, ...newNodes],
              edges: [...(prev.edges || []), ...newEdges],
              links: [...(prev.links || prev.edges || []), ...newEdges],
            }));
            message.success(`展开 ${newNodes.length} 个新节点，${newEdges.length} 条新关系`);
          } else {
            message.info('未发现新的关联节点');
          }
        }
      } catch (err) {
        message.error('展开子图失败');
      } finally {
        setExpanding(false);
      }
    });

    graphRef.current = graph;
    return () => { graph.destroy(); };
  }, [processedData]);

  return (
    <PageContainer title="四层知识图谱检索">
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 0]} align="middle" style={{ padding: '6px 0', marginBottom: 16 }}>
          <Col flex="1" style={{ cursor: 'pointer' }} onClick={() => loadFullGraph()}>
            <CustomStatistic title={filterLayer ? "总节点数（点击取消筛选）" : "总节点数"} value={layerStats.total} />
          </Col>
          <Col flex="0 0 1px"><div style={{ borderLeft: '1px solid #e8e8e8', height: '40px' }} /></Col>
          <Col flex="1"><CustomStatistic title="总关系数" value={layerStats.total_relationships || 0} /></Col>
          <Col flex="0 0 1px"><div style={{ borderLeft: '1px solid #e8e8e8', height: '40px' }} /></Col>
          <Col flex="1"><CustomStatistic title="当前节点数" value={processedData.nodes.length} /></Col>
          <Col flex="0 0 1px"><div style={{ borderLeft: '1px solid #e8e8e8', height: '40px' }} /></Col>
          <Col flex="1"><CustomStatistic title="当前关系数" value={processedData.links.length} /></Col>
          <Col flex="0 0 1px"><div style={{ borderLeft: '1px solid #e8e8e8', height: '40px' }} /></Col>
          {layerStats.details.map((layer, index) => {
            const config = NODE_STYLE_CONFIG[layer.type] || { color: '#BFBFBF', label: layer.label };
            const isActive = filterLayer === layer.type;
            return (
              <React.Fragment key={layer.type}>
                <Col flex="1" style={{ cursor: 'pointer' }} onClick={() => loadLayerFilter(layer.type)}>
                  <div style={{
                    padding: '2px 0',
                    textAlign: 'center',
                    borderRadius: 8,
                    border: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                    background: isActive ? `${config.color}15` : 'transparent',
                    margin: '-2px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: config.color, marginRight: 6, display: 'inline-block' }} />
                      <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)', fontWeight: 500 }}>{layer.label}</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#000' }}>{layer.value.toLocaleString()}</div>
                  </div>
                </Col>
                {index < layerStats.details.length - 1 && <Col flex="0 0 1px"><div style={{ borderLeft: '1px solid #e8e8e8', height: '40px' }} /></Col>}
              </React.Fragment>
            );
          })}
        </Row>
        
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <div
            style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowDetailedStats(!showDetailedStats)}
          >
            <DownOutlined style={{ fontSize: 11, transition: 'transform 0.2s', transform: showDetailedStats ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            层级详细统计
          </div>
          {showDetailedStats && <Row gutter={12}>
            {detailedStats.map((layer) => {
              const layerColors: Record<string, string> = {
                'Subject': '#f0f8ff',
                'Event': '#fff5f5',
                'Feature': '#f6fff6',
                'Regulation': '#faf5ff'
              };
              const layerBorderColors: Record<string, string> = {
                'Subject': '#1890ff',
                'Event': '#ff4d4f',
                'Feature': '#52c41a',
                'Regulation': '#722ed1'
              };
              
              const nodeTypesContent = (
                <div style={{ maxHeight: 150, overflowY: 'auto', minWidth: 120, maxWidth: 200 }}>
                  {layer.node_types.length > 0 ? (
                    layer.node_types.map((type, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: 12, 
                          color: '#333',
                          borderBottom: idx < layer.node_types.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background 0.2s',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        • {type}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '8px 12px', fontSize: 12, color: '#999', textAlign: 'center' }}>暂无类型</div>
                  )}
                </div>
              );
              
              const relTypesContent = (
                <div style={{ maxHeight: 150, overflowY: 'auto', minWidth: 120, maxWidth: 200 }}>
                  {layer.rel_types.length > 0 ? (
                    layer.rel_types.map((type, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: 12, 
                          color: '#333',
                          borderBottom: idx < layer.rel_types.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background 0.2s',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        • {type}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '8px 12px', fontSize: 12, color: '#999', textAlign: 'center' }}>暂无类型</div>
                  )}
                </div>
              );
              
              return (
                <Col span={6} key={layer.layer_code}>
                  <Card 
                    size="small" 
                    style={{ 
                      background: layerColors[layer.layer_code] || '#fafafa',
                      borderColor: layerBorderColors[layer.layer_code] || '#d9d9d9',
                      borderWidth: 1,
                      borderRadius: 8,
                      height: '100%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s'
                    }}
                    styles={{ body: { padding: '14px' } }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${layerBorderColors[layer.layer_code]}` }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: layerBorderColors[layer.layer_code] }}>
                        {layer.layer}
                      </div>
                    </div>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>节点总数:</span>
                        <span style={{ fontSize: 20, fontWeight: 'bold', color: layerBorderColors[layer.layer_code] }}>{layer.node_count}</span>
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(255,255,255,0.8)', 
                        padding: '6px 8px', 
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)' }}>节点类型数:</span>
                          <span style={{ fontSize: 13, fontWeight: 'bold', color: layerBorderColors[layer.layer_code] }}>{layer.node_type_count}</span>
                        </div>
                        <Popover 
                          content={nodeTypesContent} 
                          trigger="click" 
                          placement="bottomRight"
                          overlayStyle={{ padding: 0 }}
                          overlayInnerStyle={{ padding: 0, borderRadius: 6 }}
                        >
                          <DownOutlined 
                            style={{ 
                              fontSize: 11, 
                              color: layerBorderColors[layer.layer_code], 
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '50%',
                              transition: 'all 0.2s'
                            }} 
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          />
                        </Popover>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>关系总数:</span>
                        <span style={{ fontSize: 20, fontWeight: 'bold', color: layerBorderColors[layer.layer_code] }}>{layer.rel_count}</span>
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(255,255,255,0.8)', 
                        padding: '6px 8px', 
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)' }}>关系类型数:</span>
                          <span style={{ fontSize: 13, fontWeight: 'bold', color: layerBorderColors[layer.layer_code] }}>{layer.rel_type_count}</span>
                        </div>
                        <Popover 
                          content={relTypesContent} 
                          trigger="click" 
                          placement="bottomRight"
                          overlayStyle={{ padding: 0 }}
                          overlayInnerStyle={{ padding: 0, borderRadius: 6 }}
                        >
                          <DownOutlined 
                            style={{ 
                              fontSize: 11, 
                              color: layerBorderColors[layer.layer_code], 
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '50%',
                              transition: 'all 0.2s'
                            }} 
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          />
                        </Popover>
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
          }
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Row gutter={16} align="bottom">
            <Col flex="1">
              <Form.Item label="按节点名称查询" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入任意节点名称（支持所有层级节点）" style={{ height: 40 }} />
              </Form.Item>
            </Col>
            <Col style={{ width: 160 }}>
              <Form.Item label="检索层级" name="searchLayer" style={{ marginBottom: 0 }} initialValue="all">
                <Select options={[
                  {value: 'all', label: '全部层级'},
                  {value: 'Subject', label: '主体层'},
                  {value: 'Event', label: '事件层'},
                  {value: 'Feature', label: '特征层'},
                  {value: 'Regulation', label: '法规层'},
                ]} style={{ height: 40 }} />
              </Form.Item>
            </Col>
            <Col style={{ width: 140 }}>
              <Form.Item label="穿透深度" name="layers" style={{ marginBottom: 0 }} initialValue={1}>
                <Select options={[{value:1, label:'1层'}, {value:2, label:'2层'}, {value:3, label:'3层'}, {value:4, label:'4层'}]} style={{ height: 40 }} />
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => form.submit()} style={{ height: 42, width: 42 }} />
                <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); loadFullGraph(); }} style={{ height: 42, width: 42 }} />
                <Tooltip title="导出图谱PNG"><Button icon={<PictureOutlined />} onClick={handleExportPNG} style={{ height: 42 }} /></Tooltip>
                <Tooltip title="导出统计CSV"><Button icon={<FileExcelOutlined />} onClick={handleExportCSV} style={{ height: 42 }} /></Tooltip>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ background: '#fff', height: CANVAS_HEIGHT, position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(255,255,255,0.7)' }}>
              <Spin size="large" tip="加载图谱数据..." />
            </div>
          )}
          {!loading && processedData.nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Empty description="暂无图谱数据" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={loadFullGraph} icon={<ReloadOutlined />}>刷新数据</Button>
              </Empty>
            </div>
          ) : (
            <div ref={containerRef} style={{ width: '100%', height: CANVAS_HEIGHT, background: '#fff' }} />
          )}
        </div>
      </Card>

      <Drawer title="节点详情" width={380} onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        {selectedNode ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedNode.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', marginRight: 16 }}>
                {selectedNode.levelName?.[0]}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>{selectedNode.name}</h3>
                <Tag color={selectedNode.color}>{selectedNode.levelName}</Tag>
                <div style={{ marginTop: 12 }}>
                  <Button
                    type="primary"
                    icon={<NodeIndexOutlined />}
                    loading={expanding}
                    onClick={async () => {
                      setDrawerVisible(false);
                      if (!selectedNode?.id) return;

                      setExpanding(true);
                      try {
                        const response = await fetch(`/api/v1/graph/expand/${selectedNode.id}?depth=1&limit=100`);
                        const result = await response.json();

                        if (result.nodes && result.nodes.length > 0) {
                          setGraphData((prev: any) => {
                            const existingNodeIds = new Set((prev.nodes || []).map((n: any) => n.id));
                            const existingEdgeIds = new Set((prev.links || prev.edges || []).map((l: any) => `${l.source || l.sourceId}-${l.target || l.targetId}-${l.label || 'default'}`));

                            const newNodes = result.nodes.filter((n: any) => !existingNodeIds.has(n.id));
                            const newEdges = (result.edges || []).filter((e: any) => {
                              const eid = `${e.source || e.sourceId}-${e.target || e.targetId}-${e.label || 'default'}`;
                              return !existingEdgeIds.has(eid);
                            });

                            return {
                              nodes: [...(prev.nodes || []), ...newNodes],
                              edges: [...(prev.edges || []), ...newEdges],
                              links: [...(prev.links || prev.edges || []), ...newEdges],
                            };
                          });
                          message.success(`展开 ${result.nodes.length} 个关联节点`);
                        }
                      } catch (err) {
                        message.error('展开子图失败');
                      } finally {
                        setExpanding(false);
                      }
                    }}
                  >
                    展开关联
                  </Button>
                </div>
              </div>
            </div>
            <Descriptions column={1} bordered size="small">
              {Object.keys(selectedNode.properties || {}).map(key => {
                const val = selectedNode.properties[key];
                if (!val || val === null || val === undefined) return null;
                // 格式化属性名称
                const label = PROPERTY_MAP[key]?.label || key;
                // 格式化值
                let displayValue = String(val);
                if (typeof val === 'object') {
                  displayValue = JSON.stringify(val, null, 2);
                }
                return (
                  <Descriptions.Item key={key} label={label}>
                    <span style={{ wordBreak: 'break-all' }}>{displayValue}</span>
                  </Descriptions.Item>
                )
              })}
            </Descriptions>
          </Space>
        ) : <Empty />}
      </Drawer>
    </PageContainer>
  );
};

export default GeneralPage;
