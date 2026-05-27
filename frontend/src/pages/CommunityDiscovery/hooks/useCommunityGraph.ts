import G6 from '@antv/g6';
import { useEffect, useRef, useCallback } from 'react';
import type { GraphData } from '../service';
import { GENERAL_CONFIG } from '../../graphConfig';
import { convexHull, polygonCentroid } from '../utils/convexHull';

const NODE_STYLE_CONFIG = GENERAL_CONFIG.nodeStyles;

const COMMUNITY_COLORS = [
  '#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A', '#9270CA',
  '#6DC8EC', '#FF9D4D', '#269A99', '#FF99C3', '#5D7092',
];

let hullNodeRegistered = false;

function registerHullNode() {
  if (hullNodeRegistered) return;
  hullNodeRegistered = true;
  G6.registerNode(
    'community-hull',
    {
      draw(cfg: any, group: any) {
        const { hullPoints, hullFill } = cfg;
        if (!hullPoints || hullPoints.length < 3) {
          return (group as any).addShape('circle', {
            attrs: { r: 0, fill: 'transparent' },
          });
        }
        const keyShape = group.addShape('polygon', {
          attrs: {
            points: hullPoints,
            fill: hullFill || '#5B8FF9',
            stroke: hullFill || '#5B8FF9',
            lineWidth: 1.5,
            fillOpacity: 0.08,
            strokeOpacity: 0.5,
            lineDash: [4, 4],
            cursor: 'default',
          },
          name: 'hull-shape',
        });
        return keyShape;
      },
      getAnchorPoints() {
        return [[0.5, 0.5]];
      },
    },
    'circle',
  );
}

export interface UseCommunityGraphOptions {
  graphData: GraphData;
  selectedCommunityId?: number | null;
  onNodeClick?: (nodeModel: any) => void;
  onCommunityClick?: (communityId: number) => void;
}

export function useCommunityGraph(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCommunityGraphOptions,
) {
  const { graphData, selectedCommunityId, onNodeClick, onCommunityClick } = options;
  const graphRef = useRef<G6.Graph | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;
  const onCommunityClickRef = useRef(onCommunityClick);
  onCommunityClickRef.current = onCommunityClick;

  registerHullNode();

  const destroyGraph = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.destroy();
      graphRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !graphData.nodes.length) {
      destroyGraph();
      return;
    }
    destroyGraph();

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) * 0.32;

    // Group nodes by community and apply community colors
    const communityNodeMap = new Map<number, any[]>();

    const nodes = graphData.nodes.map((n: any, idx: number) => {
      const labels: string[] = n.labels || [];
      let typeKey = 'Unknown';
      for (const lbl of labels) {
        if (NODE_STYLE_CONFIG[lbl]) {
          typeKey = lbl;
          break;
        }
      }
      const name =
        n.properties?.name || n.properties?.title || n.properties?.COMPANY_NM || '(unnamed)';
      const communityId: number = (n as any)._communityId ?? 0;
      const commColor = COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length];

      const nodeModel = {
        id: String(n.id),
        label: name.length > 8 ? name.substring(0, 8) + '...' : name,
        fullLabel: name,
        typeKey,
        communityId,
        properties: n.properties || {},
        style: { fill: commColor, stroke: '#fff', lineWidth: 2, r: 20 },
        labelCfg: { position: 'bottom', offset: 6, style: { fill: '#666', fontSize: 11 } },
      };

      if (!communityNodeMap.has(communityId)) {
        communityNodeMap.set(communityId, []);
      }
      communityNodeMap.get(communityId)!.push(nodeModel);

      return nodeModel;
    });

    // ── Pre-layout: arrange community centers in a circle, nodes near center ──
    const commIds = Array.from(communityNodeMap.keys()).sort((a, b) => a - b);
    commIds.forEach((commId, ci) => {
      const angle = (2 * Math.PI * ci) / commIds.length - Math.PI / 2;
      const commCx = cx + R * Math.cos(angle);
      const commCy = cy + R * Math.sin(angle);
      const nodesInComm = communityNodeMap.get(commId) || [];
      const localR = Math.max(40, Math.min(120, nodesInComm.length * 8));
      nodesInComm.forEach((nodeModel, ni) => {
        const la = (2 * Math.PI * ni) / nodesInComm.length;
        const jitter = (Math.random() - 0.5) * localR * 0.4;
        nodeModel.x = commCx + (localR + jitter) * Math.cos(la);
        nodeModel.y = commCy + (localR + jitter) * Math.sin(la);
      });
    });

    const edges = graphData.edges.map((e: any) => ({
      source: String(e.source),
      target: String(e.target),
      label: e.label || '',
      style: {
        stroke: '#d1d1d6',
        lineWidth: 0.8,
        opacity: 0.6,
        endArrow: { path: G6.Arrow.triangle(5, 5, 0), fill: '#d1d1d6' },
      },
    }));

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      fitView: true,
      fitViewPadding: 50,
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeStrength: -300,
        edgeStrength: 0.12,
        linkDistance: 55,
        nodeSpacing: 20,
        alpha: 0.8,
        alphaDecay: 0.006,
        alphaMin: 0.001,
        gravity: 12,
      },
      modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
      defaultNode: { size: 30 },
      nodeStateStyles: {
        selected: {
          stroke: '#1890ff',
          lineWidth: 3,
          shadowColor: 'rgba(24,144,255,0.5)',
          shadowBlur: 10,
        },
        dimmed: {
          opacity: 0.15,
        },
      },
      edgeStateStyles: {
        dimmed: {
          opacity: 0.05,
        },
      },
    });

    graph.data({ nodes, edges });
    graph.render();
    graphRef.current = graph;

    // Draw convex hulls after force layout stabilizes
    let hullsDrawn = false;
    const drawHulls = () => {
      if (hullsDrawn) return;
      hullsDrawn = true;

      communityNodeMap.forEach((commNodes, commId) => {
        if (commNodes.length < 3) return;

        const nodePositions: [number, number][] = [];
        commNodes.forEach((model) => {
          const item = graph.findById(model.id);
          if (item) {
            const pos = item.getModel();
            if (pos.x != null && pos.y != null) {
              nodePositions.push([pos.x as number, pos.y as number]);
            }
          }
        });

        if (nodePositions.length < 3) return;

        const hull = convexHull(nodePositions);
        if (hull.length < 3) return;

        const [cx, cy] = polygonCentroid(hull);
        const relativePoints = hull.map(([x, y]) => [x - cx, y - cy]);
        const color = COMMUNITY_COLORS[commId % COMMUNITY_COLORS.length];

        graph.addItem('node', {
          id: `hull-${commId}`,
          type: 'community-hull',
          x: cx,
          y: cy,
          hullPoints: relativePoints,
          hullFill: color,
          communityId: commId,
        });

        // Move hull behind data nodes
        const hullItem = graph.findById(`hull-${commId}`);
        if (hullItem) {
          hullItem.toBack();
        }
      });

      graph.paint();
    };

    // Try drawing hulls after layout stabilizes
    const onAfterLayout = () => {
      // Small delay to ensure positions are settled
      setTimeout(drawHulls, 300);
    };

    graph.on('afterlayout', onAfterLayout);

    // If force layout doesn't fire afterlayout, fallback
    const fallbackTimer = setTimeout(drawHulls, 3000);

    // Node click handler
    graph.on('node:click', (evt: any) => {
      const model = evt.item?.getModel();
      if (!model) return;

      // Ignore clicks on hull nodes
      if (model.type === 'community-hull') {
        if (model.communityId != null) {
          onCommunityClickRef.current?.(model.communityId);
        }
        return;
      }

      const allNodes = graph.getNodes();
      allNodes.forEach((n: any) => {
        const m = n.getModel();
        if (m.type === 'community-hull') return;
        graph.clearItemStates(n, 'selected');
      });
      graph.setItemState(evt.item, 'selected', true);
      onNodeClickRef.current?.(model);
    });

    // Canvas click to deselect
    graph.on('canvas:click', () => {
      const allNodes = graph.getNodes();
      allNodes.forEach((n: any) => {
        graph.clearItemStates(n, 'selected');
      });
    });

    return () => {
      clearTimeout(fallbackTimer);
      graph.off('afterlayout', onAfterLayout);
      destroyGraph();
    };
  }, [graphData, containerRef, destroyGraph]);

  // Handle selected community highlight
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const allNodes = graph.getNodes();
    allNodes.forEach((n: any) => {
      const model = n.getModel();
      if (model.type === 'community-hull') {
        // Highlight selected hull
        if (selectedCommunityId != null && model.communityId === selectedCommunityId) {
          graph.updateItem(n, {
            style: { fillOpacity: 0.18, strokeOpacity: 0.9, lineWidth: 2.5 },
          });
        } else {
          graph.updateItem(n, {
            style: { fillOpacity: 0.08, strokeOpacity: 0.5, lineWidth: 1.5 },
          });
        }
      } else {
        if (selectedCommunityId != null && model.communityId !== selectedCommunityId) {
          graph.setItemState(n, 'dimmed', true);
        } else {
          graph.setItemState(n, 'dimmed', false);
        }
      }
    });
    graph.paint();
  }, [selectedCommunityId]);

  const fitView = useCallback(() => {
    graphRef.current?.fitView(50);
  }, []);

  const downloadImage = useCallback(() => {
    graphRef.current?.downloadFullImage(`community-graph-${Date.now()}`, 'image/png', {
      backgroundColor: '#f9fafb',
      padding: 30,
    });
  }, []);

  const centerOnCommunity = useCallback((communityId: number) => {
    const graph = graphRef.current;
    if (!graph) return;
    const hullNode = graph.findById(`hull-${communityId}`);
    if (hullNode) {
      graph.focusItem(hullNode, true, { easing: 'easeCubic', duration: 600 });
    }
  }, []);

  return { graphInstance: graphRef.current, fitView, downloadImage, centerOnCommunity };
}
