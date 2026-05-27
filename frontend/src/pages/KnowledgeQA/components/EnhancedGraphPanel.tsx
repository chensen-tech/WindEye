import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react'
import { Typography, Spin, Empty, message, Button, Tooltip } from 'antd'
import { ExpandOutlined } from '@ant-design/icons'
import G6 from '@antv/g6'
import axios from 'axios'
import type { Subgraph, SubgraphNode, SubgraphEdge, AlignmentFeature } from '../types/api'
import LegendPanel from './LegendPanel'

const { Text } = Typography

const VALID_NODE_TYPES = new Set(['COMPANY', 'PERSON', 'EVENT', 'SUB_EVENT', 'TIME', 'RiskFeature', 'RiskFactor', 'Action', 'Regulation', 'Law'])

const NODE_VISUAL: Record<string, { color: string; size: number; labelOffset: number }> = {
  COMPANY: { color: '#FFC101', size: 34, labelOffset: 10 },
  PERSON: { color: '#1890FF', size: 26, labelOffset: 8 },
  EVENT: { color: '#FF6B6B', size: 30, labelOffset: 10 },
  SUB_EVENT: { color: '#FF9999', size: 20, labelOffset: 6 },
  TIME: { color: '#FF8C00', size: 16, labelOffset: 5 },
  RiskFeature: { color: '#4CAF50', size: 24, labelOffset: 8 },
  RiskFactor: { color: '#9C27B0', size: 22, labelOffset: 7 },
  Action: { color: '#45B7D1', size: 22, labelOffset: 7 },
  Regulation: { color: '#FFC101', size: 20, labelOffset: 6 },
  Law: { color: '#1890FF', size: 18, labelOffset: 6 },
}

const normalizeNeo4jNode = (raw: any): SubgraphNode => {
  const props = raw.properties || {}
  const labels: string[] = raw.labels || []
  return {
    id: String(raw.id),
    type: labels[0] || 'Unknown',
    score: props.score ?? 1,
    title: props.title || props.name || props.COMPANY_NM || raw.id,
    name: props.name || props.COMPANY_NM || props.title || raw.id,
    zh_name: props.zh_name || props.name,
    overview: props.overview || props.RISK_INFO || '',
    popularity: props.popularity,
    rating: props.rating,
    year: props.year,
  }
}

const normalizeNeo4jEdge = (raw: any): SubgraphEdge => ({
  source: String(raw.source || raw.start),
  target: String(raw.target || raw.end),
  relation: raw.label || raw.relation || raw.type || 'RELATED',
})

const EDGE_STYLE_MAP: Record<string, { stroke: string; lineDash?: number[]; lineWidth: number; opacity: number }> = {
  TRIGGERS: { stroke: '#f5222d', lineDash: [], lineWidth: 2, opacity: 0.8 },
  REFLECTS: { stroke: '#fa8c16', lineDash: [], lineWidth: 1.5, opacity: 0.7 },
  COMPLIES_WITH: { stroke: '#722ed1', lineDash: [4, 4], lineWidth: 1.5, opacity: 0.7 },
  MENTION: { stroke: '#45B7D1', lineDash: [2, 3], lineWidth: 1, opacity: 0.5 },
  CAUSE: { stroke: '#fa541c', lineDash: [], lineWidth: 1.5, opacity: 0.7 },
  BELONG: { stroke: '#52c41a', lineDash: [2, 3], lineWidth: 1, opacity: 0.5 },
}
const EDGE_DEFAULT_STYLE = { stroke: '#cbd5e1', lineDash: [], lineWidth: 0.8, opacity: 0.4 }

const buildG6Data = (subgraph: Subgraph | null) => {
  if (!subgraph) return { nodes: [], edges: [] }
  const validNodeIds = new Set<string>()
  const nodes = subgraph.nodes
    .filter((n: SubgraphNode) => VALID_NODE_TYPES.has(n.type))
    .map((node: SubgraphNode) => {
      const nodeIdStr = String(node.id)
      validNodeIds.add(nodeIdStr)
      const visual = NODE_VISUAL[node.type] ?? { color: '#a1a1aa', size: 14, labelOffset: 5 }
      let label = String(node.title || (node as any).zh_name || (node as any).name || node.id)
      if (label.length > 15) label = label.slice(0, 12) + '...'
      return {
        id: nodeIdStr,
        label,
        _type: node.type,
        type: 'circle',
        size: visual.size,
        style: {
          fill: visual.color,
          stroke: node.type === 'COMPANY' ? visual.color : 'transparent',
          lineWidth: node.type === 'COMPANY' ? 2 : 0,
          cursor: 'pointer',
        },
        labelCfg: {
          position: 'bottom',
          offset: visual.labelOffset,
          style: {
            fill: '#1e293b',
            fontSize: node.type === 'COMPANY' ? 12 : 10,
            fontWeight: node.type === 'COMPANY' ? 600 : 500,
            background: {
              fill: 'rgba(255, 255, 255, 0.85)',
              padding: [2, 4, 2, 4],
              radius: 4,
            },
          },
        },
      }
    })
  const edges = subgraph.edges
    .filter((e: SubgraphEdge) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target)))
    .map((edge: SubgraphEdge, idx: number) => {
      const relStyle = EDGE_STYLE_MAP[edge.relation] ?? EDGE_DEFAULT_STYLE
      return {
        id: `edge-${idx}`,
        source: String(edge.source),
        target: String(edge.target),
        relation: edge.relation,
        type: 'quadratic',
        style: { ...relStyle, endArrow: true, curvature: 0.15 },
      }
    })
  return { nodes, edges }
}

export interface EnhancedGraphPanelHandle {
  refresh: (subgraph: Subgraph, alignmentFeatures: AlignmentFeature[]) => void
  fitView: () => void
  focusNode: (nodeId: string) => void
  resetHighlight: () => void
  clear: () => void
  searchAndExpand: (nodeId: string, nodeType: string) => void
}

interface Props {
  subgraph: Subgraph | null
  alignmentFeatures: AlignmentFeature[]
  onNodeDoubleClick?: (nodeId: string, nodeName: string, nodeType: string) => void
  onNodeHover?: (nodeId: string | null) => void
  highlightedEntity?: string | null
}

export const EnhancedGraphPanel = forwardRef<EnhancedGraphPanelHandle, Props>(
  ({ subgraph, alignmentFeatures, onNodeDoubleClick, highlightedEntity }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<any>(null)
    const subgraphRef = useRef(subgraph)
    subgraphRef.current = subgraph

    const [loading, setLoading] = useState(false)
    const [selectedNode, setSelectedNode] = useState<SubgraphNode | null>(null)
    const [liveStats, setLiveStats] = useState<any>(null)
    const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(VALID_NODE_TYPES))

    const syncGraphStats = useCallback(() => {
      const g = graphRef.current
      if (!g) return
      const gNodes = g.getNodes()
      const gEdges = g.getEdges()
      const nodeCounts: Record<string, number> = {}
      const edgeCounts: Record<string, number> = {}
      for (const n of gNodes) {
        const model = (n as any).getModel()
        const t = model?._type ?? ''
        if (VALID_NODE_TYPES.has(t)) nodeCounts[t] = (nodeCounts[t] ?? 0) + 1
      }
      for (const e of gEdges) {
        const model = (e as any).getModel()
        const rel = model?.relation ?? 'UNKNOWN'
        edgeCounts[rel] = (edgeCounts[rel] ?? 0) + 1
      }
      setLiveStats({ totalNodes: gNodes.length, totalEdges: gEdges.length, nodeCounts, edgeCounts })
    }, [])

    const applyHighlight = useCallback((cat: string | null) => {
      const g = graphRef.current
      if (!g) return
      g.getNodes().forEach((n: any) =>
        g.setItemState(n, 'dimmed', cat ? n.getModel()._type !== cat : false)
      )
      g.getEdges().forEach((e: any) =>
        g.setItemState(e, 'dimmed', cat ? e.getModel().relation !== cat : false)
      )
    }, [])

    const toggleCategory = useCallback((cat: string) => {
      const g = graphRef.current
      if (!g) return
      setVisibleCategories((prev) => {
        const next = new Set(prev)
        const hide = next.has(cat)
        hide ? next.delete(cat) : next.add(cat)
        g.getNodes().forEach((n: any) => {
          if (n.getModel()._type === cat) hide ? g.hideItem(n) : g.showItem(n)
        })
        g.getEdges().forEach((e: any) => {
          if (e.getModel().relation === cat) hide ? g.hideItem(e) : g.showItem(e)
        })
        return next
      })
    }, [])

    const searchAndExpand = useCallback(
      async (nodeId: string, nodeType: string) => {
        const graph = graphRef.current
        if (!graph) {
          console.warn('Graph instance not ready for expansion')
          return
        }

        message.loading({ content: 'Exploring connections...', key: 'expand' })
        try {
          const url = `/api/v1/graph/expand?id=${encodeURIComponent(nodeId)}&type=${encodeURIComponent(nodeType)}`
          const res = await axios.get(url)

          const data = res.data
          if (!data || !Array.isArray(data.nodes)) {
            throw new Error('Invalid response format from server')
          }

          const { nodes: rawNodes, edges: rawEdges } = data
          const nN = (rawNodes || []).map(normalizeNeo4jNode)
          const nE = (rawEdges || []).map(normalizeNeo4jEdge)
          const addedNodeIds = new Set<string>()

          nN.forEach((n: SubgraphNode) => {
            const idStr = String(n.id)
            if (!graph.findById(idStr)) {
              const v = NODE_VISUAL[n.type] || { color: '#94a3b8', size: 14, labelOffset: 5 }
              let label = String(n.title || n.zh_name || n.name || n.id)
              if (label.length > 15) label = label.slice(0, 12) + '...'
              try {
                graph.addItem('node', {
                  id: idStr,
                  label,
                  type: 'circle',
                  _type: n.type,
                  size: v.size,
                  style: {
                    fill: v.color,
                    stroke: n.type === 'COMPANY' ? v.color : 'transparent',
                    lineWidth: n.type === 'COMPANY' ? 2 : 0,
                    cursor: 'pointer',
                  },
                  labelCfg: {
                    position: 'bottom',
                    offset: v.labelOffset,
                    style: {
                      fill: '#1e293b',
                      fontSize: n.type === 'COMPANY' ? 12 : 10,
                      fontWeight: n.type === 'COMPANY' ? 600 : 500,
                      background: {
                        fill: 'rgba(255,255,255,0.85)',
                        padding: [2, 4, 2, 4],
                        radius: 4,
                      },
                    },
                  },
                })
                addedNodeIds.add(idStr)
              } catch (e) {
                // Node may already exist, skip silently
              }
            } else {
              addedNodeIds.add(idStr)
            }
          })

          const seenEdges = new Set<string>()
          nE.forEach((e: SubgraphEdge, idx: number) => {
            const src = String(e.source)
            const tgt = String(e.target)
            const edgeKey = `${src}→${tgt}→${e.relation}`
            if (seenEdges.has(edgeKey)) return
            seenEdges.add(edgeKey)

            if (!graph.findById(src) || !graph.findById(tgt)) return

            const relStyle = EDGE_STYLE_MAP[e.relation] ?? EDGE_DEFAULT_STYLE
            const edgeId = `edge-exp-${nodeId}-${idx}-${Date.now()}`
            try {
              graph.addItem('edge', {
                id: edgeId,
                source: src,
                target: tgt,
                relation: e.relation,
                type: 'quadratic',
                style: { ...relStyle, endArrow: true, curvature: 0.15 },
              })
            } catch (err) {
              // Edge may already exist, skip silently
            }
          })

          graph.layout()
          syncGraphStats()
          graph.focusItem(String(nodeId), true)

          message.success({ content: 'Exploration complete', key: 'expand' })
        } catch (err) {
          console.error('Expand failed:', err)
          message.error({ content: 'Exploration failed', key: 'expand' })
        }
      },
      [syncGraphStats]
    )

    useImperativeHandle(ref, () => ({
      refresh: (sg) => {
        if (!graphRef.current) return
        graphRef.current.changeData(buildG6Data(sg))
        graphRef.current.fitView(30)
        syncGraphStats()
      },
      fitView: () => graphRef.current?.fitView(30),
      resetHighlight: () => {
        if (!graphRef.current) return
        graphRef.current.getNodes().forEach((n: any) => graphRef.current?.clearItemStates(n))
        graphRef.current.getEdges().forEach((e: any) => graphRef.current?.clearItemStates(e))
      },
      focusNode: (nodeId) => {
        if (!graphRef.current) return
        graphRef.current.focusItem(nodeId, true)
        const raw = subgraphRef.current?.nodes.find((n: any) => String(n.id) === nodeId)
        if (raw) setSelectedNode(raw)
      },
      searchAndExpand,
      clear: () => {
        if (!graphRef.current) return
        graphRef.current.changeData({ nodes: [], edges: [] })
        setLiveStats(null)
        setSelectedNode(null)
      },
    }))

    useEffect(() => {
      let mounted = true
      let graph: any = null

      const init = () => {
        if (!containerRef.current) return
        setLoading(true)
        try {
          graph = new G6.Graph({
            container: containerRef.current,
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            layout: {
              type: 'force',
              preventOverlap: true,
              nodeSize: 40,
              nodeSpacing: 40,
              linkDistance: 150,
              nodeStrength: -200,
            },
            defaultNode: { type: 'circle', size: 20 },
            defaultEdge: { type: 'quadratic', style: { endArrow: true } },
            modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
          })
          graphRef.current = graph
          graph.render()
          syncGraphStats()

          const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && graphRef.current) {
              graphRef.current.changeSize(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
              )
              graphRef.current.fitView(30)
            }
          })
          resizeObserver.observe(containerRef.current)

          graph.on('node:click', (e: any) => {
            const raw = subgraphRef.current?.nodes.find(
              (n: any) => String(n.id) === e.item?.getID()
            )
            if (raw) setSelectedNode(raw)
          })
          graph.on('node:dblclick', (e: any) => {
            const nodeId = e.item?.getID()
            const nodeType = e.item?.getModel()._type || 'COMPANY'
            const nodeName = e.item?.getModel().label || nodeId
            onNodeDoubleClick?.(nodeId, nodeName, nodeType)
          })

          setLoading(false)
          return () => resizeObserver.disconnect()
        } finally {
          if (mounted) setLoading(false)
        }
      }

      init()
      return () => {
        mounted = false
        graph?.destroy()
      }
    }, [syncGraphStats, searchAndExpand])

    return (
      <div style={styles.root}>
        <LegendPanel
          stats={liveStats}
          visibleCategories={visibleCategories}
          onToggle={toggleCategory}
          onHighlight={applyHighlight}
        />
        <div style={styles.graphArea}>
          <div ref={containerRef} style={styles.graphCanvas} />

          <div style={styles.floatingToolbar}>
            <Tooltip title="Fit view" placement="left">
              <Button
                type="default"
                shape="circle"
                icon={<ExpandOutlined />}
                onClick={() => graphRef.current?.fitView(30)}
                style={styles.floatingBtn}
              />
            </Tooltip>
          </div>

          {selectedNode && (
            <div style={styles.infoCard}>
              <button onClick={() => setSelectedNode(null)} style={styles.closeBtn}>
                ×
              </button>
              <div style={{ padding: 16 }}>
                <Text strong style={{ fontSize: 16, display: 'block' }}>
                  {selectedNode.title || (selectedNode as any).zh_name || selectedNode.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedNode.type}
                </Text>
                <div style={{ marginTop: 10, fontSize: 13, maxHeight: 200, overflowY: 'auto' }}>
                  {selectedNode.overview}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' },
  graphArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  graphCanvas: { width: '100%', height: '100%' },
  floatingToolbar: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  floatingBtn: { boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: 'none' },
  infoCard: {
    position: 'absolute',
    top: 16,
    right: 60,
    width: 260,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
    border: '1px solid #e2e8f0',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    color: '#94a3b8',
  },
}

export default EnhancedGraphPanel
