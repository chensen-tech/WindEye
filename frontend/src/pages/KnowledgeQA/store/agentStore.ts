import { create } from 'zustand'
import axios from 'axios'
import type {
  ChatMessage,
  QueryRewriteResult,
  Subgraph,
  AlignmentFeature,
  AgentOutput,
  RecommendationItem,
  RiskReport,
  RiskStage,
  CommunityInfo,
} from '../types/api'
import { sendChatStream, sendRiskStream } from '../api/agent'

const generateSessionId = () => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

type RouteDecision = 'graph' | 'analysis' | 'clarify' | 'risk'
type RightPanelMode = 'graph' | 'analysis' | 'risk'

interface AnalysisResult {
  analysis_text: string
  echarts_config: any
  raw_data: any[]
  row_count?: number
}

interface AgentStore {
  messages: ChatMessage[]
  currentSubgraph: Subgraph | null
  rewriteResult: QueryRewriteResult | null
  alignmentFeatures: AlignmentFeature[]
  isLoading: boolean
  sessionId: string
  roundId: number
  error: string | null
  pendingRecommendations: RecommendationItem[] | null
  clarifyMessage: string | null
  currentRoute: RouteDecision | null
  analysisQuery: string | null
  analysisResult: AnalysisResult | null
  activeRightPanel: RightPanelMode

  // Risk Report state
  riskReport: RiskReport | null
  riskStages: RiskStage[]
  riskCommunity: CommunityInfo | null

  sendMessage: (query: string, rewrittenQuery?: string) => Promise<void>
  sendRiskQuery: (query: string, communityId?: number) => Promise<void>
  clearHistory: () => void
  setError: (error: string | null) => void
  clearRoute: () => void
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  messages: [],
  currentSubgraph: null,
  rewriteResult: null,
  alignmentFeatures: [],
  isLoading: false,
  sessionId: generateSessionId(),
  roundId: 0,
  error: null,
  pendingRecommendations: null,
  clarifyMessage: null,
  currentRoute: null,
  analysisQuery: null,
  analysisResult: null,
  activeRightPanel: 'graph',

  riskReport: null,
  riskStages: [],
  riskCommunity: null,

  sendMessage: async (query: string, rewrittenQuery?: string) => {
    if (get().isLoading) return
    const { sessionId, roundId, messages } = get()
    set({ roundId: roundId + 1 })
    const backendQuery = rewrittenQuery || query

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    }

    const tempId = `asst_${Date.now()}`
    const initialThinkingProcess: string[] = []
    if (rewrittenQuery && rewrittenQuery !== query) {
      initialThinkingProcess.push(`BFF intent recognition: optimized query to "${rewrittenQuery}"`)
    }

    const assistantMsg: ChatMessage = {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
      thinkingProcess: initialThinkingProcess,
    }

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isLoading: true,
      error: null,
      pendingRecommendations: null,
      clarifyMessage: null,
    }))

    // Step 1: IntentRouter
    let route: RouteDecision = 'graph'
    try {
      const routeResp = await axios.post<{ route: RouteDecision; clarify_message: string | null }>(
        '/api/v1/chat/route',
        { query: backendQuery }
      )
      route = routeResp.data.route

      if (route === 'clarify') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  isLoading: false,
                  content:
                    routeResp.data.clarify_message ??
                    'Sorry, I didn\'t fully understand. Could you provide more specific criteria?',
                }
              : m
          ),
          clarifyMessage: routeResp.data.clarify_message ?? null,
          isLoading: false,
        }))
        return
      }
    } catch (err) {
      console.warn('[Store] /route failed, defaulting to graph:', err)
    }

    // Step 2: Risk Report pipeline
    if (route === 'risk') {
      set({
        currentRoute: 'risk',
        activeRightPanel: 'risk',
        riskReport: null,
        riskStages: [],
        riskCommunity: null,
        isLoading: true,
        currentSubgraph: null,
        analysisResult: null,
      })

      await get().sendRiskQuery(backendQuery)
      return
    }

    // Step 3: Analysis pipeline
    if (route === 'analysis') {
      set({
        currentRoute: 'analysis',
        activeRightPanel: 'analysis',
        analysisQuery: backendQuery,
        isLoading: true,
        currentSubgraph: null,
        analysisResult: null,
      })

      const maxRetries = 3
      let retryCount = 0
      let success = false

      while (retryCount < maxRetries && !success) {
        if (retryCount > 0) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000)
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempId
                ? { ...m, thinkingStatus: `连接中断，${delay / 1000}s 后重试 (${retryCount}/${maxRetries})...` }
                : m
            ),
          }))
          await new Promise((r) => setTimeout(r, delay))
        }

        try {
          const resp = await fetch('/api/v1/chat/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: backendQuery }),
          })

          if (!resp.ok) throw new Error(`Analysis failed: ${resp.status}`)

          const reader = resp.body?.getReader()
          if (!reader) throw new Error('No reader available')

          const decoder = new TextDecoder()
          let buffer = ''
          let pendingEvent: string | null = null
          let accumulatedText = ''
          let finalConfig = null
          let finalData: any[] = []
          let rowCount = 0
          success = true

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue

              if (trimmed.startsWith('event:')) {
                pendingEvent = trimmed.slice(6).trim()
              } else if (trimmed.startsWith('data:')) {
                const raw = trimmed.slice(5).trim()
                const ev = pendingEvent
                pendingEvent = null
                if (!ev || !raw) continue

                try {
                  if (ev === 'stage') {
                    const { content } = JSON.parse(raw)
                    set((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === tempId
                          ? {
                              ...m,
                              thinkingStatus: content,
                              thinkingProcess: [...(m.thinkingProcess || []), content],
                            }
                          : m
                      ),
                    }))
                  } else if (ev === 'analysis_text') {
                    const { chunk } = JSON.parse(raw)
                    accumulatedText += chunk
                    set((state) => ({
                      messages: state.messages.map((m) =>
                        m.id === tempId ? { ...m, content: accumulatedText } : m
                      ),
                    }))
                  } else if (ev === 'echarts_config') {
                    finalConfig = JSON.parse(raw)
                  } else if (ev === 'raw_data') {
                    finalData = JSON.parse(raw)
                  } else if (ev === 'done') {
                    const meta = JSON.parse(raw)
                    rowCount = meta.row_count || 0
                  } else if (ev === 'error') {
                    const { error: errMsg } = JSON.parse(raw)
                    throw new Error(errMsg || 'Analysis error')
                  }
                } catch (e) {
                  console.error('[Store] Parse error in analysis stream:', e, raw)
                }
              }
            }
          }

          set((state) => ({
            analysisResult: {
              analysis_text: accumulatedText,
              echarts_config: finalConfig,
              raw_data: finalData,
              row_count: rowCount,
            },
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, isLoading: false, thinkingStatus: undefined } : m
            ),
            isLoading: false,
          }))
        } catch (err: any) {
          retryCount++
          console.error(`[Store] Analysis attempt ${retryCount} failed:`, err)
          if (retryCount >= maxRetries) {
            set((state) => ({
              isLoading: false,
              error: err.message,
              messages: state.messages.map((m) =>
                m.id === tempId ? { ...m, content: `Analysis failed after ${maxRetries} attempts: ${err.message}` } : m
              ),
            }))
          }
        }
      }
      return
    }

    // Step 4: Graph / recommend pipeline
    set({ activeRightPanel: 'graph' })
    const history = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)

    const cleanup = sendChatStream(
      { query: backendQuery, history, sessionId, roundId: roundId + 1 },
      {
        onStage: (content) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    thinkingStatus: content,
                    thinkingProcess: [...(m.thinkingProcess || []), content],
                  }
                : m
            ),
          }))
        },

        onCards: (cards) => {
          set(() => ({ pendingRecommendations: cards }))
        },

        onGraph: (graph) => {
          set(() => ({ currentSubgraph: graph as Subgraph }))
        },

        onReview: ({ overall, highlights, explanation }) => {
          const highlightMap = new Map(highlights.map((h) => [h.itemId, h.highlight]))

          set((state) => {
            const enrichedRecs = (state.pendingRecommendations ?? []).map((rec) => ({
              ...rec,
              highlight: highlightMap.get(rec.itemId) ?? rec.highlight ?? '',
            }))

            const finalOutput: AgentOutput = {
              overallReasoning: explanation || overall,
              recommendations: enrichedRecs,
              explanations: highlights.map((h) => ({
                itemId: h.itemId,
                highlight: h.highlight,
                pathIds: [],
              })),
            }

            return {
              messages: state.messages.map((m) =>
                m.id === tempId
                  ? {
                      ...m,
                      content: overall,
                      isLoading: false,
                      thinkingStatus: undefined,
                      data: { output: finalOutput },
                    }
                  : m
              ),
              pendingRecommendations: null,
              isLoading: false,
              currentRoute: 'graph',
            }
          })
        },

        onDone: () => {
          set((state) => ({
            pendingRecommendations: null,
            isLoading: false,
            currentRoute: 'graph',
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, isLoading: false, thinkingStatus: undefined } : m
            ),
          }))
        },

        onError: (msg) => {
          set((state) => ({
            isLoading: false,
            pendingRecommendations: null,
            error: msg,
            currentRoute: 'graph',
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, content: `Error: ${msg}` } : m
            ),
          }))
        },
      }
    )

    // cleanup is handled internally on done/error events
  },

  sendRiskQuery: async (query: string, communityId?: number) => {
    const { sessionId, roundId } = get()
    const tempId = `asst_${Date.now()}`

    const assistantMsg: ChatMessage = {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
      thinkingProcess: ['Risk Report: starting 5-agent pipeline...'],
    }

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isLoading: true,
      error: null,
    }))

    const cleanup = sendRiskStream(
      { query, sessionId, roundId, communityId, maxHop: 3 },
      {
        onStage: (stage, content) => {
          set((state) => ({
            riskStages: [
              ...state.riskStages.filter((s) => s.stage !== stage),
              { stage: stage as RiskStage['stage'], content },
            ],
            messages: state.messages.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    thinkingStatus: content,
                    thinkingProcess: [...(m.thinkingProcess || []), `[${stage}] ${content}`],
                  }
                : m
            ),
          }))
        },

        onCommunity: (info) => {
          set({ riskCommunity: info as CommunityInfo })
        },

        onSubgraph: (graph) => {
          set({
            currentSubgraph: graph as Subgraph,
          })
        },

        onReport: (report) => {
          set((state) => ({
            riskReport: report as RiskReport,
            messages: state.messages.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    content: report.executive_summary || report.markdown_report?.slice(0, 300) || '',
                    isLoading: false,
                    thinkingStatus: undefined,
                    data: { echartsConfig: report.echarts_config },
                  }
                : m
            ),
            isLoading: false,
            currentRoute: 'risk',
            activeRightPanel: 'risk',
          }))
        },

        onDone: () => {
          set((state) => ({
            isLoading: false,
            currentRoute: 'risk',
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, isLoading: false, thinkingStatus: undefined } : m
            ),
          }))
        },

        onError: (msg) => {
          set((state) => ({
            isLoading: false,
            error: msg,
            currentRoute: 'risk',
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, content: `Risk analysis failed: ${msg}` } : m
            ),
          }))
        },
      }
    )
  },

  clearHistory: () => {
    set({
      messages: [],
      currentSubgraph: null,
      rewriteResult: null,
      alignmentFeatures: [],
      roundId: 0,
      sessionId: generateSessionId(),
      error: null,
      pendingRecommendations: null,
      clarifyMessage: null,
      currentRoute: null,
      analysisQuery: null,
      analysisResult: null,
      riskReport: null,
      riskStages: [],
      riskCommunity: null,
      activeRightPanel: 'graph',
    })
  },

  setError: (error: string | null) => set({ error }),

  clearRoute: () => set({ currentRoute: null, currentSubgraph: null, analysisQuery: null }),
}))
