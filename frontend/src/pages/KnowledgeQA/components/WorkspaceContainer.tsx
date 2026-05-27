import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Input, Spin, Empty, Tag } from 'antd'
import { SendOutlined, ClearOutlined } from '@ant-design/icons'
import { EntityMessageBubble } from './EntityMessageBubble'
import { RiskEntityCard } from './RiskEntityCard'
import { ContextTagBar, ContextEntity } from './ContextTagBar'
import type { ChatMessage, RecommendationItem } from '../types/api'
import { DESIGN_TOKENS } from '../styles/constants'

const { TextArea } = Input

const Text: React.FC<{
  type?: 'secondary' | 'danger' | 'warning' | 'success' | undefined
  className?: string
  children: React.ReactNode
  strong?: boolean
}> = ({ type, className = '', children, strong }) => {
  const colorMap: Record<string, string> = {
    secondary: '#71717a',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  }
  return (
    <span
      style={{
        color: type ? colorMap[type] : DESIGN_TOKENS.TEXT_PRIMARY,
        fontWeight: strong ? 600 : 400,
      }}
      className={className}
    >
      {children}
    </span>
  )
}

interface WorkspaceContainerProps {
  messages: ChatMessage[]
  isLoading: boolean
  pendingRecommendations: RecommendationItem[] | null
  onSendMessage: (query: string) => void
  onClearHistory: () => void
  onEntityHover?: (entityId: string | null) => void
  onEntityClick?: (entityId: string, entityType: string) => void
  highlightedEntity?: string | null
  graphInjectedEntity?: { id: string; name: string; type: string } | null
  onClearGraphInject?: () => void
}

export const WorkspaceContainer: React.FC<WorkspaceContainerProps> = ({
  messages,
  isLoading,
  pendingRecommendations,
  onSendMessage,
  onClearHistory,
  onEntityHover,
  onEntityClick,
  highlightedEntity,
  graphInjectedEntity,
  onClearGraphInject,
}) => {
  const [input, setInput] = useState('')
  const [contextTags, setContextTags] = useState<ContextEntity[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return
    let fullQuery = text
    if (graphInjectedEntity) {
      fullQuery = `[${graphInjectedEntity.name}] ${fullQuery}`
    }
    if (contextTags.length > 0) {
      fullQuery = `Context: ${contextTags.map(t => t.id).join(', ')}. Query: ${fullQuery}`
    }
    setInput('')
    await onSendMessage(fullQuery)
    inputRef.current?.focus()
  }, [input, isLoading, onSendMessage, graphInjectedEntity, contextTags])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRemoveTag = (id: string) => {
    setContextTags((prev) => prev.filter((t) => t.id !== id))
  }

  const handleClearTags = () => {
    setContextTags([])
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #F7F9FC 0%, #F1F5F9 100%)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: DESIGN_TOKENS.TEXT_PRIMARY }}>
            Chat
          </h2>
          <Text type="secondary" className="text-xs">
            {messages.length} messages
          </Text>
        </div>
        <button
          onClick={onClearHistory}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
          }}
          title="Clear chat"
        >
          <ClearOutlined />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>
                    Start your first query!
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: 12 }}>
                    Try: "查询某公司近期的风险传导路径和异常事件"
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id}>
                <EntityMessageBubble
                  message={msg}
                  onEntityHover={onEntityHover}
                  onEntityClick={(entity) => {
                    setContextTags((prev) => {
                      if (prev.find((t) => t.id === entity.id)) return prev
                      return [...prev, { id: entity.id, type: entity.type }]
                    })
                    onEntityClick?.(entity.id, entity.type)
                  }}
                  highlightedEntity={highlightedEntity}
                />
                {msg.role === 'assistant' && (msg.data?.output || pendingRecommendations) && (
                  <div style={{ marginLeft: 44, marginBottom: 12 }}>
                    {pendingRecommendations && pendingRecommendations.length > 0 ? (
                      <>
                        <RiskEntityCard
                          recommendations={pendingRecommendations}
                          onEntityClick={() => {}}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <Spin size="small" />
                          <span style={{ color: DESIGN_TOKENS.TEXT_MUTED, fontSize: 12 }}>
                            Generating review...
                          </span>
                        </div>
                      </>
                    ) : msg.data?.output ? (
                      <RiskEntityCard
                        recommendations={msg.data.output.recommendations || []}
                        onEntityClick={(entityId, entityType) => {
                          setContextTags((prev) => {
                            if (prev.find((t) => t.id === entityId)) return prev
                            return [...prev, { id: entityId, type: entityType }]
                          })
                          onEntityClick?.(entityId, entityType)
                        }}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`,
        }}
      >
        {graphInjectedEntity && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              background: 'rgba(0, 47, 167, 0.06)',
              borderRadius: 10,
              border: '1px dashed rgba(0, 47, 167, 0.3)',
              marginBottom: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L11 6L6 11"
                stroke={DESIGN_TOKENS.KLEIN_BLUE}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
              From Graph:
            </span>
            <Tag
              style={{
                background: 'rgba(0, 47, 167, 0.1)',
                border: '1px solid rgba(0, 47, 167, 0.3)',
                color: DESIGN_TOKENS.KLEIN_BLUE,
                fontSize: 12,
                fontWeight: 600,
                padding: '1px 8px',
                borderRadius: 14,
                animation: 'tagFlyIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {graphInjectedEntity.name}
            </Tag>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              · Click input to continue
            </span>
            <button
              onClick={() => {
                onClearGraphInject?.()
                inputRef.current?.focus()
              }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 14,
                lineHeight: 1,
                padding: '2px 4px',
              }}
            >
              ×
            </button>
          </div>
        )}

        <ContextTagBar
          tags={contextTags}
          onRemove={handleRemoveTag}
          onClearAll={handleClearTags}
          onTagClick={(entity) => {
            setContextTags((prev) => {
              if (prev.find((t) => t.id === entity.id)) return prev
              return [...prev, { id: entity.id, type: entity.type }]
            })
          }}
        />

        <div
          style={{
            background: '#FFFFFF',
            border: `1px solid ${DESIGN_TOKENS.BORDER_DEFAULT}`,
            borderRadius: 14,
            padding: '10px 14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <TextArea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                contextTags.length > 0
                  ? 'Continue with context constraints, or enter a new question...'
                  : 'Enter your question, press Enter to send...'
              }
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                lineHeight: 1.5,
                background: 'transparent',
                padding: 0,
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                background:
                  input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)'
                    : '#F1F5F9',
                color: input.trim() && !isLoading ? '#ffffff' : '#94A3B8',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow:
                  input.trim() && !isLoading
                    ? '0 4px 12px rgba(40, 85, 209, 0.3)'
                    : 'none',
              }}
            >
              <SendOutlined style={{ fontSize: 15 }} />
            </button>
          </div>
        </div>

        <span
          style={{
            color: DESIGN_TOKENS.TEXT_MUTED,
            fontSize: 12,
            marginTop: 8,
            display: 'block',
            paddingLeft: 4,
          }}
        >
          Enter to send · Shift+Enter for newline · Double-click graph node to add context
        </span>
      </div>
    </div>
  )
}

export default WorkspaceContainer
