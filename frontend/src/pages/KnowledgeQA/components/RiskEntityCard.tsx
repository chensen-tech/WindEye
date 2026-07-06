import React from 'react'
import { Typography, Tag } from 'antd'
import { AlertOutlined, BankOutlined } from '@ant-design/icons'
import type { RecommendationItem } from '../types/api'
import { DESIGN_TOKENS } from '../styles/constants'

const { Text, Paragraph } = Typography

const RiskIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em', ...style }}>
    <path d="M12 2L2 20h20L12 2zm0 3.5L18.5 18H5.5L12 5.5z" />
    <path d="M11 10h2v5h-2zm0 6h2v2h-2z" />
  </svg>
)

const SparkleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
  </svg>
)

const RISK_LEVEL_MAP: Record<string, { color: string; label: string }> = {
  '-3': { color: '#f5222d', label: '极高风险' },
  '-2': { color: '#fa541c', label: '高风险' },
  '-1': { color: '#faad14', label: '一般风险' },
  '0': { color: '#1890ff', label: '提示' },
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  COMPANY: '#FFC101',
  PERSON: '#1890FF',
  EVENT: '#FF6B6B',
  RiskFeature: '#4CAF50',
  RiskFactor: '#9C27B0',
  Action: '#45B7D1',
  Regulation: '#FFC101',
}

interface RiskEntityCardProps {
  recommendations: RecommendationItem[]
  overallReasoning?: string
  onEntityClick?: (entityId: string, entityType: string) => void
}

const getRiskLevel = (rec: RecommendationItem): string | null => {
  const riskScore = (rec as any).riskScore ?? (rec as any).importance
  if (riskScore && RISK_LEVEL_MAP[String(riskScore)]) return String(riskScore)
  if (riskScore !== undefined && Number(riskScore) < 0) return String(Math.max(Number(riskScore), -3))
  return null
}

export const RiskEntityCard: React.FC<RiskEntityCardProps> = ({
  recommendations,
  overallReasoning,
  onEntityClick,
}) => {
  const safeRecommendations = recommendations || []

  if (safeRecommendations.length === 0) {
    return (
      <div>
        {overallReasoning && (
          <div
            style={{
              display: 'flex', gap: 10, padding: '10px 14px', background: '#f8fafc',
              borderRadius: 12, border: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`, marginBottom: 16,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(245, 34, 45, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RiskIcon style={{ fontSize: 14, color: '#f5222d' }} />
            </div>
            <Text style={{ fontSize: 13, lineHeight: 1.7, color: DESIGN_TOKENS.TEXT_SECONDARY }}>
              {overallReasoning}
            </Text>
          </div>
        )}
        <div style={{ padding: 16, textAlign: 'center' }}>
          <AlertOutlined style={{ fontSize: 32, color: DESIGN_TOKENS.TEXT_MUTED, marginBottom: 8 }} />
          <div style={{ color: DESIGN_TOKENS.TEXT_MUTED, fontSize: 13 }}>No matching risk entities found</div>
          <div style={{ marginTop: 8, fontSize: 12, color: DESIGN_TOKENS.TEXT_MUTED, opacity: 0.8 }}>
            Try adjusting your query
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {overallReasoning && (
        <div style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(245, 34, 45, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RiskIcon style={{ fontSize: 14, color: '#f5222d' }} />
          </div>
          <Text style={{ fontSize: 13, lineHeight: 1.7, color: DESIGN_TOKENS.TEXT_SECONDARY }}>{overallReasoning}</Text>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245, 34, 45, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SparkleIcon />
        </div>
        <Text strong style={{ fontSize: 14, color: DESIGN_TOKENS.TEXT_PRIMARY }}>Risk Entities</Text>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#f5222d', background: 'rgba(245, 34, 45, 0.08)', padding: '2px 8px', borderRadius: 10 }}>
          {safeRecommendations.length} entities
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {safeRecommendations.map((rec, idx) => {
          const itemId = rec.itemId || `entity-${idx}`
          const title = rec.title || (rec as any).zhTitle || (rec as any).name || itemId
          const entityType = (rec as any).entityType || rec.type || 'COMPANY'
          const typeColor = ENTITY_TYPE_COLORS[entityType] || '#94a3b8'
          const riskLevel = getRiskLevel(rec)
          const riskInfo = riskLevel ? RISK_LEVEL_MAP[riskLevel] : null
          const score = rec.score ?? (rec as any).confidence ?? 0

          return (
            <div
              key={itemId}
              onClick={() => onEntityClick?.(itemId, entityType)}
              style={{
                display: 'flex', gap: 12, padding: 12, background: '#fff', borderRadius: 14,
                border: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`, cursor: 'pointer',
                transition: 'all 0.2s ease', boxShadow: DESIGN_TOKENS.SHADOW_CARD,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = DESIGN_TOKENS.SHADOW_GLOW
                e.currentTarget.style.borderColor = '#f5222d'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = DESIGN_TOKENS.SHADOW_CARD
                e.currentTarget.style.borderColor = DESIGN_TOKENS.BORDER_DEFAULT
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: typeColor + '20', border: `2px solid ${typeColor}40` }}>
                <BankOutlined style={{ fontSize: 22, color: typeColor }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 14 }} ellipsis>{title}</Text>
                  {riskInfo && (
                    <Tag style={{ fontSize: 10, padding: '0 6px', borderRadius: 4, background: riskInfo.color + '18', border: 'none', color: riskInfo.color }}>
                      {riskInfo.label}
                    </Tag>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag style={{ fontSize: 10, padding: '0 6px', borderRadius: 4, background: typeColor + '18', border: 'none', color: typeColor }}>
                    {entityType}
                  </Tag>
                  {score > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(score * 100)}%`, height: '100%', borderRadius: 2, background: score > 0.7 ? '#10B981' : score > 0.4 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                      <Text style={{ fontSize: 10, color: DESIGN_TOKENS.TEXT_MUTED }}>{(score * 100).toFixed(0)}%</Text>
                    </div>
                  )}
                </div>

                {(rec as any).highlight && (
                  <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 11, color: DESIGN_TOKENS.TEXT_MUTED, marginBottom: 0 }}>
                    {(rec as any).highlight}
                  </Paragraph>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RiskEntityCard
