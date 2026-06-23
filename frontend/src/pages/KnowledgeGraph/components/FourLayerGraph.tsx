import G6 from '@antv/g6';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  GraphLayer,
  GraphFilterMode,
  GraphLayoutMode,
  KGEdge,
  KGNode,
} from '@/types/knowledgeGraph';
import { truncateLabel } from '@/utils/knowledgeGraph';
import { computeAdaptiveLayout } from '../utils/layouts';

const LAYER_THEME: Record<GraphLayer, {
  label: string;
  color: string;
  background: string;
}> = {
  Subject: { label: '主体层', color: '#1677ff', background: 'rgba(22,119,255,0.055)' },
  Event: { label: '事件层', color: '#faad14', background: 'rgba(250,173,20,0.065)' },
  Feature: { label: '特征层', color: '#52c41a', background: 'rgba(82,196,26,0.055)' },
  Regulation: { label: '法规层', color: '#722ed1', background: 'rgba(114,46,209,0.055)' },
  Unknown: { label: '未归类', color: '#8c8c8c', background: 'rgba(140,140,140,0.05)' },
};

const LAYOUT_LABELS: Record<GraphLayoutMode, string> = {
  aggregate: '类型聚合',
  cascade: '逐层定向级联',
  radial: '中心放射',
  'semantic-force': '四层语义分布',
  community: '社区聚类',
  'path-focus': '路径优先',
};

export interface FourLayerGraphHandle {
  exportPNG: () => void;
  fitView: () => void;
}

interface FourLayerGraphProps {
  nodes: KGNode[];
  edges: KGEdge[];
  layoutMode: GraphLayoutMode;
  centerNodeId?: string;
  pathNodeIds?: string[];
  omittedNodeCount?: number;
  highlightedNodeIds?: Set<string>;
  highlightedEdgeIds?: Set<string>;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  hasActiveFilter?: boolean;
  filterMode?: GraphFilterMode;
  loading?: boolean;
  onNodeClick?: (node: KGNode) => void;
  onNodeDoubleClick?: (node: KGNode) => void;
  onEdgeClick?: (edge: KGEdge) => void;
  onRenderError?: (message: string | null) => void;
}

function isHighRiskEdge(edge: KGEdge): boolean {
  const value = edge.properties?.risk_level
    ?? edge.properties?.riskLevel
    ?? edge.properties?.importance;
  return ['high', 'critical', '-3', '-2', 3, 4, 5].includes(value);
}

function isHighRiskNode(node: KGNode): boolean {
  const value = node.properties?.risk_level
    ?? node.properties?.riskLevel
    ?? node.properties?.importance;
  return ['high', 'critical', '-3', '-2', 3, 4, 5].includes(value);
}

const FourLayerGraph = forwardRef<FourLayerGraphHandle, FourLayerGraphProps>(
  function FourLayerGraph(
    {
      nodes,
      edges,
      layoutMode,
      centerNodeId,
      pathNodeIds,
      omittedNodeCount = 0,
      highlightedNodeIds = new Set<string>(),
      highlightedEdgeIds = new Set<string>(),
      selectedNodeId,
      selectedEdgeId,
      hasActiveFilter = false,
      filterMode = 'highlight',
      onNodeClick,
      onNodeDoubleClick,
      onEdgeClick,
      onRenderError,
    },
    ref,
  ) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const graphDataRef = useRef<any>({ nodes: [], edges: [] });
    const clickRef = useRef(onNodeClick);
    const doubleClickRef = useRef(onNodeDoubleClick);
    const edgeClickRef = useRef(onEdgeClick);
    const [containerWidth, setContainerWidth] = useState(960);
    const [highlightedLayer, setHighlightedLayer] = useState<GraphLayer | null>(null);

    clickRef.current = onNodeClick;
    doubleClickRef.current = onNodeDoubleClick;
    edgeClickRef.current = onEdgeClick;

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return undefined;
      const updateWidth = () => setContainerWidth(Math.max(720, viewport.clientWidth));
      updateWidth();
      const observer = new ResizeObserver(updateWidth);
      observer.observe(viewport);
      return () => observer.disconnect();
    }, []);

    const canvasHeight = layoutMode === 'community' ? 820 : 720;
    const layout = useMemo(() => computeAdaptiveLayout({
      mode: layoutMode,
      nodes,
      edges,
      width: containerWidth,
      height: canvasHeight,
      centerNodeId,
      pathNodeIds,
    }), [layoutMode, nodes, edges, containerWidth, canvasHeight, centerNodeId, pathNodeIds]);

    const graphData = useMemo(() => {
      const nodeMap = new Map(layout.nodes.map(node => [node.id, node]));
      const pathPairs = new Set<string>();
      for (let index = 0; index < layout.pathNodeIds.length - 1; index += 1) {
        const left = layout.pathNodeIds[index];
        const right = layout.pathNodeIds[index + 1];
        pathPairs.add(`${left}|${right}`);
        pathPairs.add(`${right}|${left}`);
      }
      const g6Nodes = layout.nodes.map((node) => {
        const theme = LAYER_THEME[node.layer];
        const isCenter = node.isCenter || node.id === centerNodeId;
        const highRisk = isHighRiskNode(node);
        const size = isCenter
          ? 46
          : node.isMatched
            ? 42
            : node.isAggregate
              ? Math.min(70, 36 + Math.sqrt(Math.max(1, node.count || 1)) * 2)
              : Math.min(42, 24 + Math.sqrt(Math.max(1, node.degree)) * 3);
        const layerDimmed = highlightedLayer !== null && highlightedLayer !== node.layer;
        const pathDimmed = layoutMode === 'path-focus' && !node.isPathNode;
        const filterHighlighted = highlightedNodeIds.has(node.id);
        const selected = selectedNodeId === node.id;
        const filterDimmed = hasActiveFilter
          && filterMode === 'highlight'
          && !filterHighlighted;
        const showLabel = node.isAggregate
          || layout.nodes.length <= 30
          || node.isCenter
          || node.isMatched
          || filterHighlighted
          || node.degree >= 4;
        return {
          id: node.id,
          x: node.x,
          y: node.y,
          label: showLabel
            ? node.isAggregate
              ? `${node.type}\n${(node.count || 0).toLocaleString()} 个 · ${(node.relationCount || 0).toLocaleString()} 关系`
              : truncateLabel(node.name, node.isCenter ? 18 : 10)
            : '',
          fullName: node.name,
          layer: node.layer,
          kgNode: node,
          size,
          style: {
            fill: theme.color,
            stroke: isCenter
              ? '#f5222d'
              : node.isMatched
                ? '#1677ff'
                : highRisk
                  ? '#f5222d'
                : selected
                  ? '#eb2f96'
                : filterHighlighted
                  ? '#fa8c16'
                  : '#ffffff',
            lineWidth: isCenter ? 5 : node.isMatched ? 4 : highRisk ? 4 : selected ? 4 : filterHighlighted ? 4 : 2,
            lineDash: node.isAggregate ? [6, 4] : undefined,
            opacity: layerDimmed ? 0.16 : filterDimmed ? 0.14 : pathDimmed ? 0.32 : 1,
            shadowColor: highRisk ? '#f5222d88' : isCenter || node.isMatched ? `${theme.color}88` : undefined,
            shadowBlur: isCenter || node.isMatched || highRisk || filterHighlighted ? 14 : 0,
          },
          labelCfg: {
            position: 'bottom',
            offset: 7,
            style: {
              fill: '#262626',
              fontSize: 11,
              fontWeight: node.isAggregate || isCenter ? 600 : 400,
              opacity: layerDimmed ? 0.12 : filterDimmed ? 0.1 : pathDimmed ? 0.28 : 0.9,
            },
          },
        };
      });
      const g6Edges = edges
        .filter(edge => nodeMap.has(edge.source) && nodeMap.has(edge.target))
        .map((edge) => {
          const sourceNode = nodeMap.get(edge.source)!;
          const targetNode = nodeMap.get(edge.target)!;
          const crossLayer = sourceNode.layer !== targetNode.layer;
          const onPath = pathPairs.has(`${edge.source}|${edge.target}`);
          const layerDimmed = highlightedLayer !== null
            && sourceNode.layer !== highlightedLayer
            && targetNode.layer !== highlightedLayer;
          const pathDimmed = layoutMode === 'path-focus' && !onPath;
          const filterHighlighted = highlightedEdgeIds.has(edge.id);
          const selected = selectedEdgeId === edge.id;
          const filterDimmed = hasActiveFilter
            && filterMode === 'highlight'
            && !filterHighlighted;
          const highRisk = isHighRiskEdge(edge);
          const stroke = selected
            ? '#eb2f96'
            : filterHighlighted
            ? '#fa8c16'
            : onPath
            ? '#f5222d'
            : highRisk
              ? '#fa541c'
              : crossLayer
                ? '#66788a'
                : '#c8cdd3';
          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: layoutMode === 'cascade'
              ? 'cubic-horizontal'
              : layoutMode === 'radial' || crossLayer
                ? 'quadratic'
                : 'line',
            relationType: edge.type,
            kgEdge: edge,
            properties: edge.properties,
            onPath,
            label: selected
              ? edge.type
              : edge.isAggregate && (edge.count || 0) > 1
              ? `${edge.type} × ${edge.count}`
              : '',
            labelCfg: {
              autoRotate: true,
              style: {
                fill: '#595959',
                fontSize: 10,
                background: {
                  fill: 'rgba(255,255,255,0.88)',
                  padding: [2, 4, 2, 4],
                  radius: 2,
                },
              },
            },
            style: {
              stroke,
              lineWidth: edge.count
                ? 1 + Math.log((edge.count || 0) + 1)
                : selected ? 3.5 : filterHighlighted ? 3.2 : onPath ? 4 : highRisk ? 2.8 : crossLayer ? 1.5 : 1,
              opacity: layerDimmed
                ? 0.08
                : filterDimmed
                  ? 0.06
                  : pathDimmed
                    ? 0.12
                    : filterHighlighted
                      ? 0.95
                      : crossLayer
                        ? 0.48
                        : 0.18,
              endArrow: layoutMode === 'cascade' && crossLayer
                ? {
                  path: G6.Arrow.triangle(4, 6, 1),
                  fill: stroke,
                }
                : false,
            },
          };
        });
      return { nodes: g6Nodes, edges: g6Edges };
    }, [
      layout,
      edges,
      highlightedLayer,
      layoutMode,
      highlightedNodeIds,
      highlightedEdgeIds,
      selectedNodeId,
      selectedEdgeId,
      hasActiveFilter,
      filterMode,
    ]);
    graphDataRef.current = graphData;

    useEffect(() => {
      if (!containerRef.current || graphRef.current || nodes.length === 0) return undefined;
      try {
        const graph = new G6.Graph({
          container: containerRef.current,
          width: layout.width,
          height: layout.height,
          layout: null as any,
          animate: layoutMode === 'cascade',
          animateCfg: {
            duration: 720,
            easing: 'easeCubic',
          },
          renderer: 'canvas',
          modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
          defaultNode: { type: 'circle' },
          defaultEdge: { type: 'line' },
          plugins: [
            new G6.Tooltip({
              itemTypes: ['node', 'edge'],
              offsetX: 12,
              offsetY: 12,
              getContent: (event: any) => {
                const model: any = event?.item?.getModel();
                if (event?.item?.getType?.() === 'edge') {
                  const properties = model?.properties && Object.keys(model.properties).length
                    ? `<div style="color:#8c8c8c;margin-top:4px">${JSON.stringify(model.properties)}</div>`
                    : '';
                  return `<div style="padding:7px 10px;max-width:360px"><b>${model?.relationType || '关联'}</b>${properties}</div>`;
                }
                return `<div style="padding:8px 10px;max-width:360px;white-space:normal"><b>${model?.fullName || ''}</b><div style="color:#8c8c8c;margin-top:3px">${model?.layer || ''}</div></div>`;
              },
            }),
          ],
        });
        graph.on('node:click', (event: any) => {
          const node = event?.item?.getModel()?.kgNode as KGNode | undefined;
          if (node) clickRef.current?.(node);
        });
        graph.on('node:dblclick', (event: any) => {
          const node = event?.item?.getModel()?.kgNode as KGNode | undefined;
          if (node) doubleClickRef.current?.(node);
        });
        graph.on('edge:click', (event: any) => {
          const edge = event?.item?.getModel()?.kgEdge as KGEdge | undefined;
          if (edge) edgeClickRef.current?.(edge);
        });
        graph.on('node:mouseenter', (event: any) => {
          const item = event?.item;
          if (!item) return;
          const id = String(item.getID());
          const neighborIds = new Set<string>([id]);
          graph.getEdges().forEach((edgeItem: any) => {
            const model = edgeItem.getModel();
            if (model.source === id) neighborIds.add(String(model.target));
            if (model.target === id) neighborIds.add(String(model.source));
          });
          graph.getNodes().forEach((nodeItem: any) => {
            const model = nodeItem.getModel();
            graph.updateItem(nodeItem, {
              style: { ...model.style, opacity: neighborIds.has(String(model.id)) ? 1 : 0.12 },
              labelCfg: {
                ...model.labelCfg,
                style: { ...model.labelCfg?.style, opacity: neighborIds.has(String(model.id)) ? 1 : 0.1 },
              },
            });
          });
          graph.getEdges().forEach((edgeItem: any) => {
            const model = edgeItem.getModel();
            const related = model.source === id || model.target === id;
            graph.updateItem(edgeItem, {
              style: { ...model.style, opacity: related ? 0.95 : 0.06, lineWidth: related ? Math.max(2.5, model.style?.lineWidth || 1) : model.style?.lineWidth },
            });
          });
        });
        graph.on('node:mouseleave', () => graph.changeData(graphDataRef.current));
        graph.data(graphData);
        graph.render();
        if (layoutMode !== 'cascade') graph.fitView(30);
        graphRef.current = graph;
        onRenderError?.(null);
      } catch (error) {
        onRenderError?.(error instanceof Error ? error.message : 'G6 初始化失败');
      }
      return undefined;
    }, [nodes.length, layout.width, layout.height, graphData, layoutMode, onRenderError]);

    useEffect(() => {
      const graph = graphRef.current;
      if (!graph) return;
      try {
        graph.changeSize(layout.width, layout.height);
        graph.changeData(graphData);
        if (layoutMode !== 'cascade') graph.fitView(30);
        onRenderError?.(null);
      } catch (error) {
        onRenderError?.(error instanceof Error ? error.message : 'G6 数据更新失败');
      }
    }, [graphData, layout.width, layout.height, layoutMode, onRenderError]);

    useEffect(() => () => {
      if (graphRef.current && !graphRef.current.get('destroyed')) graphRef.current.destroy();
      graphRef.current = null;
    }, []);

    useImperativeHandle(ref, () => ({
      exportPNG: () => graphRef.current?.downloadFullImage(
        `knowledge-graph-${Date.now()}`,
        'image/png',
        { backgroundColor: '#fff', padding: 24 },
      ),
      fitView: () => graphRef.current?.fitView(30),
    }), []);

    if (nodes.length === 0) return null;

    return (
      <div
        ref={viewportRef}
        style={{ width: '100%', height: canvasHeight, overflow: 'auto', position: 'relative' }}
      >
        <SemanticBackground mode={layoutMode} layout={layout} />
        <div style={{
          position: 'absolute',
          top: layoutMode === 'cascade' ? 58 : 12,
          left: 14,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}>
          <span style={{ color: '#8c8c8c', fontSize: 12 }}>{LAYOUT_LABELS[layoutMode]}</span>
          {(Object.keys(LAYER_THEME) as GraphLayer[]).slice(0, 4).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setHighlightedLayer(current => current === layer ? null : layer)}
              style={{
                border: highlightedLayer === layer
                  ? `1px solid ${LAYER_THEME[layer].color}`
                  : '1px solid transparent',
                background: highlightedLayer === layer ? LAYER_THEME[layer].background : 'transparent',
                borderRadius: 5,
                padding: '3px 6px',
                cursor: 'pointer',
                color: LAYER_THEME[layer].color,
                fontSize: 12,
              }}
            >
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                marginRight: 4,
                borderRadius: '50%',
                background: LAYER_THEME[layer].color,
              }} />
              {LAYER_THEME[layer].label}
            </button>
          ))}
        </div>
        {layoutMode === 'community' && omittedNodeCount > 0 && (
          <div style={{
            position: 'absolute',
            top: 58,
            left: 14,
            zIndex: 5,
            padding: '5px 9px',
            borderRadius: 14,
            color: '#595959',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #d9d9d9',
            fontSize: 12,
          }}>
            更多节点 +{omittedNodeCount.toLocaleString()}
          </div>
        )}
        {layoutMode === 'path-focus' && (
          <div style={{
            position: 'absolute',
            right: 14,
            top: 58,
            zIndex: 5,
            width: 250,
            maxHeight: 220,
            overflowY: 'auto',
            padding: 12,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>EvidenceChain / 法规依据</div>
            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 8 }}>
              主路径 {layout.pathNodeIds.length} 个节点
            </div>
            {layout.nodes.filter(node => node.layer === 'Regulation').length > 0
              ? layout.nodes
                .filter(node => node.layer === 'Regulation')
                .slice(0, 6)
                .map(node => (
                  <div key={node.id} style={{
                    padding: '5px 0',
                    borderTop: '1px solid #f0f0f0',
                    color: LAYER_THEME.Regulation.color,
                    fontSize: 12,
                  }}>
                    {truncateLabel(node.name, 20)}
                  </div>
                ))
              : (
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                  当前接口未返回路径法规节点，展开或切换关系后可继续补充证据。
                </div>
              )}
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: layout.width,
            height: layout.height,
            background: 'transparent',
          }}
        />
      </div>
    );
  },
);

const SemanticBackground: React.FC<{
  mode: GraphLayoutMode;
  layout: ReturnType<typeof computeAdaptiveLayout>;
}> = ({ mode, layout }) => {
  if (mode === 'aggregate') {
    const anchors: Array<{ layer: GraphLayer; x: number; y: number }> = [
      { layer: 'Subject', x: layout.width * 0.24, y: layout.height * 0.36 },
      { layer: 'Event', x: layout.width * 0.56, y: layout.height * 0.28 },
      { layer: 'Feature', x: layout.width * 0.45, y: layout.height * 0.72 },
      { layer: 'Regulation', x: layout.width * 0.78, y: layout.height * 0.64 },
    ];
    return (
      <>
        {anchors.map(item => (
          <div key={item.layer} style={{
            position: 'absolute',
            left: item.x - 125,
            top: item.y - 90,
            width: 250,
            height: 180,
            borderRadius: '50%',
            background: LAYER_THEME[item.layer].background,
            border: `1px dashed ${LAYER_THEME[item.layer].color}33`,
          }}>
            <span style={{
              position: 'absolute',
              top: 10,
              left: 18,
              color: LAYER_THEME[item.layer].color,
              fontWeight: 600,
              fontSize: 12,
            }}>
              {LAYER_THEME[item.layer].label}类型组
            </span>
          </div>
        ))}
      </>
    );
  }
  if (mode === 'cascade') {
    const stages: Array<{ layer: GraphLayer; label: string }> = [
      { layer: 'Subject', label: '主体及关联主体' },
      { layer: 'Event', label: '相关事件' },
      { layer: 'Feature', label: '风险特征' },
      { layer: 'Regulation', label: '法规依据' },
    ];
    return (
      <>
        {stages.map((stage, index) => (
          <React.Fragment key={stage.layer}>
            <div style={{
              position: 'absolute',
              left: index * layout.width / 4,
              top: 0,
              width: layout.width / 4,
              height: layout.height,
              borderRight: index < stages.length - 1 ? '1px solid rgba(0,0,0,0.055)' : undefined,
            }}>
              <span style={{
                position: 'absolute',
                top: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '5px 9px',
                borderRadius: 18,
                color: LAYER_THEME[stage.layer].color,
                background: '#fff',
                border: `1px solid ${LAYER_THEME[stage.layer].color}55`,
                boxShadow: '0 3px 12px rgba(0,0,0,0.06)',
                fontWeight: 600,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}>
                {index + 1}. {stage.label}（
                {layout.nodes.filter(node => node.layer === stage.layer).length.toLocaleString()}）
              </span>
            </div>
            {index < stages.length - 1 && (
              <span style={{
                position: 'absolute',
                left: (index + 1) * layout.width / 4,
                top: 20,
                transform: 'translateX(-50%)',
                color: '#8c8c8c',
                fontSize: 18,
                zIndex: 2,
              }}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  }
  if (mode === 'semantic-force') {
    const columns: Array<{ layer: GraphLayer; left: string }> = [
      { layer: 'Subject', left: '0%' },
      { layer: 'Event', left: '25%' },
      { layer: 'Feature', left: '50%' },
      { layer: 'Regulation', left: '75%' },
    ];
    return (
      <>
        {columns.map(item => (
          <div key={item.layer} style={{
            position: 'absolute',
            left: item.left,
            top: 0,
            width: '25%',
            height: '100%',
            background: LAYER_THEME[item.layer].background,
            border: '1px dashed rgba(0,0,0,0.06)',
          }}>
            <span style={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: LAYER_THEME[item.layer].color,
              opacity: 0.48,
              fontWeight: 600,
            }}>
              {LAYER_THEME[item.layer].label}
            </span>
          </div>
        ))}
      </>
    );
  }
  if (mode === 'community') {
    return (
      <>
        {layout.communityCenters.map(center => (
          <div key={center.id} style={{
            position: 'absolute',
            left: center.x - center.radius,
            top: center.y - center.radius,
            width: center.radius * 2,
            height: center.radius * 2,
            borderRadius: '50%',
            background: 'rgba(22,119,255,0.025)',
            border: '1px dashed rgba(22,119,255,0.18)',
          }}>
            <span style={{ position: 'absolute', top: 8, left: 14, color: '#8c8c8c', fontSize: 11 }}>
              {center.id}
            </span>
          </div>
        ))}
      </>
    );
  }
  if (mode === 'radial') {
    return (
      <>
        {[0.18, 0.3, 0.42].map(scale => (
          <div key={scale} style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: Math.min(layout.width, layout.height) * scale * 2,
            height: Math.min(layout.width, layout.height) * scale * 2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px dashed rgba(22,119,255,0.12)',
          }} />
        ))}
      </>
    );
  }
  return (
    <div style={{
      position: 'absolute',
      left: 50,
      right: 50,
      top: '50%',
      borderTop: '2px dashed rgba(245,34,45,0.12)',
    }} />
  );
};

export default FourLayerGraph;
