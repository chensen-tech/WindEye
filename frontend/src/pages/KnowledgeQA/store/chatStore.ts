import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Subgraph } from '../types/api'
import type { ChatSession, WorkspaceState } from '../types/chat'

interface ChatStore {
  sessions: ChatSession[]
  activeSessionId: string | null

  createNewSession: () => string
  switchSession: (id: string) => void
  deleteSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  updateCurrentSession: (updates: {
    messages?: ChatMessage[]
    title?: string
    workspaceState?: Partial<WorkspaceState>
  }) => void
  getActiveSession: () => ChatSession | undefined
}

const createEmptyState = (): WorkspaceState => ({
  graphData: null,
  chartOptions: null,
  stats: {},
  riskReport: null,
  riskStages: [],
  riskCommunity: null,
})

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createNewSession: () => {
        const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const newSession: ChatSession = {
          id,
          title: '新会话',
          updatedAt: Date.now(),
          messages: [],
          workspaceState: createEmptyState(),
        }
        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: id,
        }))
        return id
      },

      switchSession: (id: string) => {
        set({ activeSessionId: id })
      },

      deleteSession: (id: string) => {
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id)
          const nextActive =
            state.activeSessionId === id
              ? remaining.length > 0
                ? remaining[remaining.length - 1].id
                : null
              : state.activeSessionId
          return { sessions: remaining, activeSessionId: nextActive }
        })
      },

      renameSession: (id: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, title, updatedAt: Date.now() } : s
          ),
        }))
      },

      updateCurrentSession: (updates) => {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== activeSessionId) return s
            return {
              ...s,
              ...(updates.messages !== undefined ? { messages: updates.messages } : {}),
              ...(updates.title !== undefined ? { title: updates.title } : {}),
              updatedAt: Date.now(),
              workspaceState: {
                ...s.workspaceState,
                ...updates.workspaceState,
              },
            }
          }),
        }))
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get()
        return sessions.find((s) => s.id === activeSessionId)
      },
    }),
    {
      name: 'bidakg-chat-history',
    }
  )
)
