import React from 'react'

interface LegendStats {
  totalNodes: number
  totalEdges: number
  nodeCounts: Record<string, number>
  edgeCounts: Record<string, number>
}

export interface LegendPanelProps {
  stats: LegendStats | null
  visibleCategories: Set<string>
  onToggle: (category: string) => void
  onHighlight: (category: string | null) => void
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

const NODE_COLORS: Record<string, string> = {
  COMPANY: '#FFC101',
  PERSON: '#1890FF',
  EVENT: '#FF6B6B',
  SUB_EVENT: '#FF9999',
  TIME: '#FF8C00',
  RiskFeature: '#4CAF50',
  RiskFactor: '#9C27B0',
  Action: '#45B7D1',
  Regulation: '#FFC101',
  Law: '#1890FF',
}

const NODE_LABELS: Record<string, string> = {
  COMPANY: 'Company',
  PERSON: 'Person',
  EVENT: 'Event',
  SUB_EVENT: 'Sub Event',
  TIME: 'Time',
  RiskFeature: 'Risk Feature',
  RiskFactor: 'Risk Factor',
  Action: 'Action',
  Regulation: 'Regulation',
  Law: 'Law',
}

const REL_LABELS: Record<string, string> = {
  TRIGGERS: 'Triggers',
  REFLECTS: 'Reflects',
  COMPLIES_WITH: 'Complies With',
  MENTION: 'Mention',
  CAUSE: 'Cause',
  BELONG: 'Belong',
}

const LegendPanel: React.FC<LegendPanelProps> = ({
  stats,
  visibleCategories,
  onToggle,
  onHighlight,
}) => {
  const isEdgeHidden = (rel: string) => !visibleCategories.has(rel)

  if (!stats) return null

  const nodeCountTotal = stats.totalNodes || 0
  const edgeCountTotal =
    stats.totalEdges || Object.values(stats.edgeCounts).reduce((a, b) => a + b, 0)

  return (
    <div style={styles.root}>
      <div style={styles.row}>
        <div style={styles.labelGroup}>
          <span style={styles.rowLabel}>Nodes</span>
          <span style={styles.rowTotal}>({fmt(nodeCountTotal)})</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.chips}>
          {Object.keys(NODE_LABELS).map((type) => {
            const count = stats.nodeCounts[type] ?? 0
            if (count === 0) return null
            const color = NODE_COLORS[type]
            const hidden = !visibleCategories.has(type)
            return (
              <div
                key={type}
                onMouseEnter={() => onHighlight(type)}
                onMouseLeave={() => onHighlight(null)}
                onClick={() => onToggle(type)}
                style={{
                  ...styles.nodeChip,
                  background: hidden ? `${color}08` : `${color}12`,
                  border: `1px solid ${hidden ? `${color}15` : `${color}30`}`,
                  color: hidden ? `${color}60` : color,
                }}
              >
                <span
                  style={{ ...styles.chipDot, background: color, opacity: hidden ? 0.3 : 1 }}
                />
                <span style={styles.chipText}>
                  {NODE_LABELS[type]} {fmt(count)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {edgeCountTotal > 0 && (
        <div style={{ ...styles.row, marginTop: 6 }}>
          <div style={styles.labelGroup}>
            <span style={styles.rowLabel}>Relations</span>
            <span style={styles.rowTotal}>({fmt(edgeCountTotal)})</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.chips}>
            {Object.entries(stats.edgeCounts).map(([rel, count]) => {
              if (count === 0 || rel === 'UNKNOWN') return null
              const label = REL_LABELS[rel] || rel
              const hidden = isEdgeHidden(rel)
              return (
                <div
                  key={rel}
                  onMouseEnter={() => onHighlight(rel)}
                  onMouseLeave={() => onHighlight(null)}
                  onClick={() => onToggle(rel)}
                  style={{
                    ...styles.edgeChip,
                    borderColor: hidden ? '#e2e8f0' : '#cbd5e1',
                    color: hidden ? '#94a3b8' : '#475569',
                    background: hidden ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <span style={styles.chipText}>
                    {label} {fmt(count)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        .legend-scroll::-webkit-scrollbar { display: none; }
        .legend-scroll { scrollbar-width: none; }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 16px',
    background: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  labelGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 64,
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
  },
  rowTotal: {
    fontSize: 11,
    fontWeight: 500,
    color: '#94a3b8',
  },
  divider: {
    width: 1,
    height: 14,
    background: '#e2e8f0',
    margin: '0 12px',
    flexShrink: 0,
  },
  chips: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    overflowX: 'auto',
    flexWrap: 'nowrap',
    flex: 1,
    paddingBottom: 2,
  },
  nodeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 6,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  },
  edgeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 6,
    border: '1px solid',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
  },
  chipText: {
    fontSize: 12,
    fontWeight: 600,
  },
}

export default LegendPanel
