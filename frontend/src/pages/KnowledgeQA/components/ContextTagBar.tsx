import React from 'react'
import { Tag } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { DESIGN_TOKENS } from '../styles/constants'

export interface ContextEntity {
  id: string
  type: string
  label?: string
}

interface ContextTagBarProps {
  tags: ContextEntity[]
  onRemove: (id: string) => void
  onClearAll: () => void
  onTagClick?: (entity: ContextEntity) => void
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  COMPANY: {
    bg: 'rgba(255, 193, 1, 0.08)',
    border: 'rgba(255, 193, 1, 0.25)',
    text: '#CC9900',
  },
  PERSON: {
    bg: 'rgba(24, 144, 255, 0.08)',
    border: 'rgba(24, 144, 255, 0.25)',
    text: '#1890FF',
  },
  EVENT: {
    bg: 'rgba(255, 107, 107, 0.08)',
    border: 'rgba(255, 107, 107, 0.25)',
    text: '#FF6B6B',
  },
  SUB_EVENT: {
    bg: 'rgba(255, 153, 153, 0.08)',
    border: 'rgba(255, 153, 153, 0.25)',
    text: '#FF9999',
  },
  TIME: {
    bg: 'rgba(255, 140, 0, 0.08)',
    border: 'rgba(255, 140, 0, 0.25)',
    text: '#FF8C00',
  },
  RiskFeature: {
    bg: 'rgba(76, 175, 80, 0.08)',
    border: 'rgba(76, 175, 80, 0.25)',
    text: '#4CAF50',
  },
  RiskFactor: {
    bg: 'rgba(156, 39, 176, 0.08)',
    border: 'rgba(156, 39, 176, 0.25)',
    text: '#9C27B0',
  },
  Action: {
    bg: 'rgba(69, 183, 209, 0.08)',
    border: 'rgba(69, 183, 209, 0.25)',
    text: '#45B7D1',
  },
  Regulation: {
    bg: 'rgba(255, 193, 1, 0.08)',
    border: 'rgba(255, 193, 1, 0.25)',
    text: '#CC9900',
  },
  Law: {
    bg: 'rgba(24, 144, 255, 0.08)',
    border: 'rgba(24, 144, 255, 0.25)',
    text: '#1890FF',
  },
  default: {
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.3)',
    text: '#64748B',
  },
}

export const ContextTagBar: React.FC<ContextTagBarProps> = ({
  tags,
  onRemove,
  onClearAll,
  onTagClick,
}) => {
  if (tags.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        padding: '8px 12px',
        background: 'rgba(247, 249, 252, 0.8)',
        borderRadius: 10,
        border: `1px dashed ${DESIGN_TOKENS.BORDER_DEFAULT}`,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: DESIGN_TOKENS.TEXT_MUTED,
          fontWeight: 500,
          marginRight: 4,
        }}
      >
        上下文约束:
      </span>

      {tags.map((tag, index) => {
        const colors = TYPE_COLORS[tag.type] || TYPE_COLORS.default
        return (
          <Tag
            key={`${tag.id}-${index}`}
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: onTagClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              animation: 'tagFlyIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animationFillMode: 'backwards',
              animationDelay: `${index * 0.05}s`,
            }}
            onClick={() => onTagClick?.(tag)}
            onMouseEnter={(e) => {
              if (onTagClick) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}`
              }
            }}
            onMouseLeave={(e) => {
              if (onTagClick) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <span
              style={{
                fontSize: 10,
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {tag.type}
            </span>
            <span>{tag.label || tag.id}</span>
            <CloseOutlined
              style={{
                fontSize: 10,
                marginLeft: 2,
                opacity: 0.6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(tag.id)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.color = '#EF4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6'
                e.currentTarget.style.color = 'inherit'
              }}
            />
          </Tag>
        )
      })}

      {tags.length > 1 && (
        <button
          onClick={onClearAll}
          style={{
            fontSize: 11,
            color: DESIGN_TOKENS.TEXT_MUTED,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = DESIGN_TOKENS.COLOR_ERROR
            e.currentTarget.style.background = DESIGN_TOKENS.ERROR_LIGHT
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = DESIGN_TOKENS.TEXT_MUTED
            e.currentTarget.style.background = 'none'
          }}
        >
          清空
        </button>
      )}

      <style>{`
        @keyframes tagFlyIn {
          0% { opacity: 0; transform: translateX(40px) translateY(-10px) scale(0.5); }
          60% { opacity: 1; transform: translateX(-3px) translateY(0) scale(1.03); }
          100% { opacity: 1; transform: translateX(0) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default ContextTagBar
