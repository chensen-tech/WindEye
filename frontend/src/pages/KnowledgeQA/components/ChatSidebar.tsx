import React, { useState } from 'react'
import { Button, List, Typography, Popconfirm, Tooltip, Input } from 'antd'
import {
  PlusOutlined,
  MessageOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useChatStore } from '../store/chatStore'
import { useAgentStore } from '../store/agentStore'

const { Text } = Typography

interface ChatSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ collapsed, onToggle }) => {
  const { sessions, activeSessionId, createNewSession, switchSession, deleteSession, renameSession } =
    useChatStore()
  const clearHistory = useAgentStore((state) => state.clearHistory)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = () => {
    createNewSession()
    clearHistory()
  }

  const handleStartRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(currentTitle || 'New Session')
  }

  const handleConfirmRename = () => {
    if (editingId && editTitle.trim()) {
      renameSession(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  const handleCancelRename = () => {
    setEditingId(null)
  }

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div
      style={{
        width: collapsed ? 64 : 260,
        height: '100%',
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '16px 8px' : '16px 12px',
        transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          marginBottom: 12,
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ color: '#64748b' }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        {collapsed ? (
          <Tooltip title="New Session" placement="right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewChat}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
              }}
            />
          </Tooltip>
        ) : (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleNewChat}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
              boxShadow: '0 4px 12px rgba(40, 85, 209, 0.2)',
            }}
          >
            New Session
          </Button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>
        <List
          dataSource={sortedSessions}
          renderItem={(session) => {
            const isActive = session.id === activeSessionId
            const isEditing = session.id === editingId

            return (
              <div
                onClick={() => !isEditing && switchSession(session.id)}
                style={{
                  padding: collapsed ? '12px 0' : '10px 12px',
                  borderRadius: 10,
                  marginBottom: 4,
                  cursor: isEditing ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(40, 85, 209, 0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(40, 85, 209, 0.2)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 12,
                  position: 'relative',
                }}
                className="session-item"
              >
                <Tooltip title={collapsed ? session.title || 'New Session' : ''} placement="right">
                  <MessageOutlined
                    style={{
                      color: isActive ? '#2855D1' : '#94a3b8',
                      fontSize: 18,
                    }}
                  />
                </Tooltip>

                {!collapsed && (
                  <>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      {isEditing ? (
                        <Input
                          autoFocus
                          size="small"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onPressEnter={handleConfirmRename}
                          onBlur={handleConfirmRename}
                          onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 13, padding: '1px 4px', borderRadius: 4 }}
                        />
                      ) : (
                        <>
                          <Text
                            strong={isActive}
                            style={{
                              display: 'block',
                              fontSize: 14,
                              color: isActive ? '#1e293b' : '#475569',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {session.title || 'New Session'}
                          </Text>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 11,
                              color: isActive ? '#64748b' : '#94a3b8',
                            }}
                          >
                            {new Date(session.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div
                        className="action-icons"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        <Tooltip title="Rename">
                          <EditOutlined
                            onClick={(e) => handleStartRename(e, session.id, session.title)}
                            style={{ color: '#64748b', fontSize: 14, padding: 4 }}
                          />
                        </Tooltip>

                        <Popconfirm
                          title="Confirm delete?"
                          onConfirm={(e) => {
                            e?.stopPropagation()
                            deleteSession(session.id)
                          }}
                          onCancel={(e) => e?.stopPropagation()}
                          okText="Delete"
                          cancelText="Cancel"
                        >
                          <DeleteOutlined
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#ef4444', fontSize: 14, padding: 4 }}
                          />
                        </Popconfirm>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          }}
        />
      </div>

      <style>{`
        .session-item:hover { background: #f1f5f9; }
        .session-item:hover .action-icons { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default ChatSidebar
