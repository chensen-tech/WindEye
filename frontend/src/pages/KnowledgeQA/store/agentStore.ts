import { create } from 'zustand'
import type {
  ChatMessage,
  QueryRewriteResult,
  Subgraph,
  AlignmentFeature,
  RecommendationItem,
  RiskReport,
  RiskStage,
  CommunityResult,
  EntityCommunityMap,
  ResolvedEntity,
  EvidenceChains,
  RiskScores,
  GovernancePlan,
  ComplianceIndicator,
} from '../types/api'
import { sendUnifiedStream } from '../api/agent'

const generateSessionId = () => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// Normalize nodes from Neo4j format {id, labels, properties} to frontend format {id, type, ...}
// Also handles DRAEngine format {id, label, type} which already has a `type` field.
const VALID_TYPES = new Set(['COMPANY', 'PERSON', 'EVENT', 'SUB_EVENT', 'TIME', 'RiskFeature', 'RiskFactor', 'Action', 'Regulation', 'Law'])

export function normalizeSubgraphNodes(rawNodes: any[]): any[] {
  return rawNodes.map((n: any) => {
    // Already has a valid `type` field (DRAEngine format) — inject unified fields
    if (n.type && VALID_TYPES.has(n.type)) {
      const props = n.properties || {}
      return {
        ...n,
        properties: props,
        raw: n,
        entityType: n.entityType || n.type,
        entity_type: n.entity_type || n.type,
        label: n.label || n.title || n.name || String(n.id),
        compliance_score: n.compliance_score ?? props.compliance_score,
      }
    }

    // Neo4j format: extract type from `labels` array
    let nodeType = ''
    if (n.labels && Array.isArray(n.labels) && n.labels.length > 0) {
      for (const label of n.labels) {
        const upper = typeof label === 'string' ? label.toUpperCase() : ''
        if (upper === 'COMPANY' || upper === 'SUBJECT') { nodeType = 'COMPANY'; break }
        if (upper === 'PERSON') { nodeType = 'PERSON'; break }
        if (upper === 'EVENT') { nodeType = 'EVENT'; break }
        if (upper === 'SUB_EVENT') { nodeType = 'SUB_EVENT'; break }
        if (upper === 'TIME') { nodeType = 'TIME'; break }
        if (label === 'RiskFeature' || label === 'RiskFactor' || label === 'Action' || label === 'Regulation' || label === 'Law') {
          nodeType = label; break
        }
      }
      // Fallback: use first label, try to match known types
      if (!nodeType) {
        const firstLabel = String(n.labels[0])
        if (VALID_TYPES.has(firstLabel)) {
          nodeType = firstLabel
        } else {
          const upper = firstLabel.toUpperCase()
          if (VALID_TYPES.has(upper)) nodeType = upper
        }
      }
    }

    // DRAEngine format fallback: type might need normalization
    // Ontology layer types (Subject, Feature, Regulation) are mapped to concrete types
    if (!nodeType && typeof n.type === 'string') {
      const upper = String(n.type).toUpperCase()
      nodeType = upper === 'COMPANY' || upper === 'SUBJECT' ? 'COMPANY'
        : upper === 'PERSON' ? 'PERSON'
        : upper === 'EVENT' ? 'EVENT'
        : upper === 'FEATURE' ? 'RiskFeature'
        : upper === 'REGULATION' ? 'Regulation'
        : VALID_TYPES.has(n.type) ? n.type
        : VALID_TYPES.has(upper) ? upper
        : n.type // Preserve original type so downstream resolveNodeType can handle it
    }

    // Unified format: check entity_type from backend normalization
    if (!nodeType && (n as any).entity_type && VALID_TYPES.has((n as any).entity_type)) {
      nodeType = (n as any).entity_type
    }

    // Absolute fallback: derive type from node name heuristics
    if (!nodeType) {
      const fallbackName = String(n.name || n.title || n.label || n.id || '')
      const upper = fallbackName.toUpperCase()
      if (/公司|集团|有限|股份|银行|基金|证券|保险|CO|LTD|INC|CORP/i.test(upper)) {
        nodeType = 'COMPANY'
      } else if (/风险|事件|违约|违规|监管|处罚/i.test(upper)) {
        nodeType = 'RiskFeature'
      } else {
        nodeType = 'COMPANY'  // Default to prevent silent filtering
      }
    }

    // Final safety net: if resolved type is still not valid, force to COMPANY
    if (!VALID_TYPES.has(nodeType)) {
      console.warn('[normalizeSubgraphNodes] Resolved type not in VALID_TYPES, forcing COMPANY:', { id: n.id, name: n.name, title: n.title, resolvedType: nodeType, rawType: n.type, rawEntityType: n.entity_type, labels: n.labels })
      nodeType = 'COMPANY'
    }

    const props = n.properties || {}
    const normalizedType = nodeType
    return {
      id: String(n.id),
      type: normalizedType,
      entityType: normalizedType,
      entity_type: normalizedType,
      properties: props,
      raw: n,
      label: n.label || n.title || props.title || props.name || props.COMPANY_NM || n.name || String(n.id),
      title: n.title || props.title || props.name || props.COMPANY_NM || n.label || n.id,
      name: n.name || props.name || props.COMPANY_NM || props.title || n.label || n.id,
      zh_name: n.zh_name || props.zh_name || props.name,
      overview: n.overview || props.overview || props.RISK_INFO || '',
      popularity: n.popularity ?? props.popularity,
      rating: n.rating ?? props.rating,
      year: n.year ?? props.year,
      risk_level: (n.risk_level || props.risk_level || '').toString().toLowerCase() || undefined,
      compliance_score: n.compliance_score ?? props.compliance_score,
    }
  })
}

export function normalizeSubgraphEdges(rawEdges: any[]): any[] {
  return rawEdges.map((e: any) => ({
    id: e.id || e.element_id || e.elementId,
    source: String(e.source || e.start || ''),
    target: String(e.target || e.end || ''),
    relation: e.relation || e.label || e.type || 'RELATED',
    confidence: e.confidence,
  }))
}

const BACKEND_STAGE_TO_FRONTEND: Record<string, RiskStage['stage']> = {
  intent: 'planning',
  entity_resolution: 'planning',
  subgraph: 'retrieving',
  graph_analytics: 'entity_stats',
  community_detection: 'community',
  risk_analysis: 'analyzing',
  compliance: 'compliance',
  scoring: 'analyzing',
  governance: 'analyzing',
  reporting: 'reporting',
}

function mapBackendStage(backendStage: string): RiskStage['stage'] {
  return BACKEND_STAGE_TO_FRONTEND[backendStage] || 'retrieving'
}

function mergeRiskReport(prev: RiskReport | null, patch: Partial<RiskReport>): RiskReport {
  return {
    ...(prev || {}),
    ...patch,
    // 元信息：最终 report 到达时优先使用最新值
    report_id: patch.report_id ?? prev?.report_id,
    generated_at: patch.generated_at ?? prev?.generated_at,
    executive_summary: patch.executive_summary ?? prev?.executive_summary,
    markdown_report: patch.markdown_report ?? prev?.markdown_report,
    echarts_config: patch.echarts_config ?? prev?.echarts_config,
    // 中间阶段数据：渐进写入，新数据覆盖旧数据
    entity_stats: patch.entity_stats ?? prev?.entity_stats,
    community_info: patch.community_info ?? prev?.community_info,
    risk_paths: patch.risk_paths ?? prev?.risk_paths ?? [],
    anomaly_findings: patch.anomaly_findings ?? prev?.anomaly_findings ?? [],
    compliance_matches: patch.compliance_matches ?? prev?.compliance_matches ?? [],
    risk_scores: patch.risk_scores ?? prev?.risk_scores,
    governance_plan: patch.governance_plan ?? prev?.governance_plan,
    evidence_chains: patch.evidence_chains ?? prev?.evidence_chains,
  } as RiskReport
}

function compactText(value: unknown, fallback = ''): string {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

function getSubgraphNodeName(node: any): string {
  return compactText(
    node?.title || node?.zh_name || node?.name || node?.label || node?.properties?.name || node?.properties?.COMPANY_NM || node?.id,
    '未知实体',
  )
}

function buildGraphQaAnswer(query: string, subgraph: Subgraph | null): string {
  const nodes = subgraph?.nodes || []
  const edges = subgraph?.edges || []
  if (nodes.length === 0) {
    return '我暂时没有在图谱里找到明确匹配的实体或关系。可以把主体名称写完整一些，例如使用公司全称，我再帮你查。'
  }

  const nodeById = new Map(nodes.map((node: any) => [String(node.id), node]))
  const degree = new Map<string, number>()
  edges.forEach((edge: any) => {
    const source = String(edge.source)
    const target = String(edge.target)
    degree.set(source, (degree.get(source) || 0) + 1)
    degree.set(target, (degree.get(target) || 0) + 1)
  })
  const center = [...nodes].sort((a: any, b: any) => (degree.get(String(b.id)) || 0) - (degree.get(String(a.id)) || 0))[0]
  const centerId = center ? String((center as any).id) : ''
  const centerName = center ? getSubgraphNodeName(center) : '查询主体'
  const directEdges = edges.filter((edge: any) => String(edge.source) === centerId || String(edge.target) === centerId)
  const related = directEdges
    .map((edge: any) => {
      const otherId = String(edge.source) === centerId ? String(edge.target) : String(edge.source)
      const other = nodeById.get(otherId)
      return {
        name: getSubgraphNodeName(other),
        relation: compactText(edge.relation || (edge as any).type || (edge as any).label, '关联'),
      }
    })
    .filter((item) => item.name && item.name !== '未知实体')

  const lines: string[] = []
  lines.push(`已根据你的问题查询到相关子图：${nodes.length} 个节点、${edges.length} 条关系。`)
  if (related.length > 0) {
    lines.push(`${centerName} 的直接关联包括：`)
    related.slice(0, 8).forEach((item, index) => {
      lines.push(`${index + 1}. ${item.name}（${item.relation}）`)
    })
    if (related.length > 8) {
      lines.push(`还有 ${related.length - 8} 个关联实体，可在右侧图谱继续查看。`)
    }
  } else {
    const names = nodes.slice(0, 8).map(getSubgraphNodeName).join('、')
    lines.push(`本次命中的实体包括：${names}。`)
  }
  if (/简称|缩写/.test(query) || /^[\u4e00-\u9fa5]{2,4}$/.test(query.trim())) {
    lines.push('')
    lines.push('如果这是公司简称，可能对应多个图谱实体。你可以补充公司全称、地区或关联对象，我可以进一步精确定位。')
  }
  return lines.join('\n')
}

function buildPartialRiskAnswer(query: string, report: RiskReport | null, subgraph: Subgraph | null): string {
  const paths = report?.risk_paths || []
  const anomalies = report?.anomaly_findings || []
  const compliance = report?.compliance_matches || []
  const nodes = subgraph?.nodes?.length || report?.subgraph_summary?.node_count || 0
  const edges = subgraph?.edges?.length || report?.subgraph_summary?.edge_count || 0
  const lines: string[] = []

  lines.push('已按“协同治理社区报告”进入分析流程。')
  if (nodes || edges) {
    lines.push(`当前已检索到 ${nodes} 个节点、${edges} 条关系，右侧已切换到治理报告面板。`)
  }
  if (paths.length || anomalies.length || compliance.length) {
    lines.push(`已识别 ${paths.length} 条风险传导路径、${anomalies.length} 个异常发现、${compliance.length} 条合规匹配。`)
  } else {
    lines.push('目前证据仍在汇总中，若图谱证据不足，报告会优先展示已确认的主体、群体和关系。')
  }
  if (/简称|缩写|鑫达|华创/.test(query)) {
    lines.push('如果主体名称是简称，建议补充公司全称以提升实体对齐准确度。')
  }
  return lines.join('\n')
}

function extractAmbiguousShortMention(query: string): string | null {
  if (/有限公司|有限责任|股份|集团|控股|投资管理|金融服务|证券|银行|保险/.test(query)) return null
  const match = query.match(/^\s*([\u4e00-\u9fa5]{2,4})(?:公司)?(?:\s|与|和|的|有|关|查|风险|合规)/)
  const mention = match?.[1]?.trim()
  if (!mention) return null
  const stopWords = new Set(['哪些', '公司', '关系', '关联', '查询', '风险', '合规', '这个', '那个'])
  return stopWords.has(mention) ? null : mention
}

function buildClarifyAnswer(mention: string): string {
  return `你说的“${mention}”可能是公司简称，图谱里可能存在多个相近实体。为了避免把主体识别错，请补充一个更明确的名称，例如公司全称、地区，或直接输入类似“${mention}投资管理有限公司”。`
}

function buildReportAnswer(report: RiskReport): string {
  const paths = report.risk_paths || []
  const anomalies = report.anomaly_findings || []
  const compliance = report.compliance_matches || []
  const recommendations = report.recommendations || []
  const scoreLevel = report.risk_scores?.level || report.overall_risk_level
  const scoreValue = report.risk_scores?.final_overall ?? report.risk_scores?.base_overall

  const lines: string[] = []
  lines.push(report.executive_summary || '协同治理分析已完成。')
  lines.push('')
  lines.push(`总体研判：${scoreLevel || '待评估'}${scoreValue !== undefined && scoreValue !== null ? `，综合评分 ${scoreValue}` : ''}`)
  lines.push(`图谱证据：${report.subgraph_summary?.node_count ?? '-'} 个节点、${report.subgraph_summary?.edge_count ?? '-'} 条关系；识别 ${paths.length} 条风险路径、${anomalies.length} 个异常发现、${compliance.length} 条合规匹配。`)

  if (paths.length > 0) {
    lines.push('')
    lines.push('风险传导路径：')
    paths.slice(0, 4).forEach((p, index) => {
      const desc = compactText(p.path_description || p.path_text, '暂无路径描述')
      lines.push(`${index + 1}. [${p.risk_level || 'medium'}] ${desc}`)
    })
  }

  if (anomalies.length > 0) {
    lines.push('')
    lines.push('异常关系：')
    anomalies.slice(0, 3).forEach((a, index) => {
      lines.push(`${index + 1}. ${a.anomaly_type || '异常'}：${compactText(a.evidence, '暂无证据说明')}`)
    })
  }

  if (compliance.length > 0) {
    lines.push('')
    lines.push('合规风险：')
    compliance.slice(0, 3).forEach((c, index) => {
      const basis = [c.regulation, c.article].filter(Boolean).join(' ')
      lines.push(`${index + 1}. ${basis || '相关法规'}：${c.violation || c.suggested_action || '需进一步核验'}`)
    })
  }

  if (recommendations.length > 0) {
    lines.push('')
    lines.push('治理建议：')
    recommendations.slice(0, 4).forEach((r, index) => {
      lines.push(`${index + 1}. ${r.action}（${r.department || '责任部门待定'}，${r.urgency || 'normal'}）`)
    })
  }

  return lines.join('\n').slice(0, 1800)
}

type RouteDecision = 'graph' | 'clarify' | 'risk'
type RightPanelMode = 'graph' | 'risk' | 'compliance'

export interface AgentTraceEntry {
  agent: string
  step: string
  summary: string
  metrics: Record<string, unknown>
  timestamp: number
}

interface UploadedFileInfo {
  filename: string
  text: string
  char_count: number
  truncated: boolean
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
  activeRightPanel: RightPanelMode

  // Unified Engine state
  resolvedEntities: ResolvedEntity[]
  evidenceChains: EvidenceChains | null
  riskScores: RiskScores | null
  governancePlan: GovernancePlan | null

  // Risk Report state
  riskReport: RiskReport | null
  riskStages: RiskStage[]
  riskCommunity: CommunityResult | null
  riskEntityCommunityMap: EntityCommunityMap | null
  complianceScores: Record<string, number> | null
  complianceIndicators: ComplianceIndicator[] | null

  // File upload state
  uploadedFile: UploadedFileInfo | null
  fileUploading: boolean

  // Agent trace state
  agentTraces: AgentTraceEntry[]

  lastRiskQuery: string
  sendMessage: (query: string, rewrittenQuery?: string) => Promise<void>
  sendRiskQuery: (query: string, communityId?: number) => Promise<void>
  sendUnifiedMessage: (query: string, intentHint?: string) => Promise<void>
  retryRiskQuery: () => Promise<void>
  uploadFile: (file: File) => Promise<void>
  clearUploadedFile: () => void
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
  activeRightPanel: 'graph',

  resolvedEntities: [],
  evidenceChains: null,
  riskScores: null,
  governancePlan: null,

  riskReport: null,
  riskStages: [],
  riskCommunity: null,
  riskEntityCommunityMap: null,
  complianceScores: null,
  complianceIndicators: null,

  uploadedFile: null,
  fileUploading: false,
  agentTraces: [],

  lastRiskQuery: '',

  sendMessage: async (query: string, rewrittenQuery?: string) => {
    return get().sendUnifiedMessage(rewrittenQuery || query)
  },

  sendRiskQuery: async (query: string, communityId?: number, fileContent?: string) => {
    set({ lastRiskQuery: query })
    return get().sendUnifiedMessage(query, 'risk_analysis')
  },

  sendUnifiedMessage: async (query: string, intentHint?: string) => {
    if (get().isLoading) return

    const ambiguousMention = !intentHint ? extractAmbiguousShortMention(query) : null
    if (ambiguousMention) {
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: Date.now(),
      }
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: buildClarifyAnswer(ambiguousMention),
        timestamp: Date.now(),
        isLoading: false,
      }
      set((state) => ({
        messages: [...state.messages, userMsg, assistantMsg],
        currentRoute: 'graph',
        activeRightPanel: 'graph',
        clarifyMessage: assistantMsg.content,
      }))
      return
    }

    // Auto-detect risk intent from query keywords when no explicit hint provided
    if (!intentHint) {
      const riskKeywords = [
        '风险', '传导', '合规', '违规', '处罚', '监管',
        '担保', '关联交易', '资金占用', '内幕', '操纵',
        '洗钱', '欺诈', '违约', '评级', '预警',
        '治理报告', '社区报告', '社区风险', '群体风险', '风险报告', '协同治理',
      ]
      if (riskKeywords.some((kw) => query.includes(kw))) {
        intentHint = 'risk_analysis'
      }
    }

    const expectedIntent = intentHint ?? 'graph_qa'
    const expectsRiskReport = expectedIntent === 'risk_analysis'

    const { sessionId, roundId, messages, uploadedFile } = get()
    set({ roundId: roundId + 1 })

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    }

    const tempId = `asst_${Date.now()}`

    const assistantMsg: ChatMessage = {
      id: tempId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
    }

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isLoading: true,
      error: null,
      pendingRecommendations: null,
      resolvedEntities: [],
      evidenceChains: null,
      riskScores: null,
      governancePlan: null,
      riskReport: null,
      riskStages: [],
      riskCommunity: null,
      riskEntityCommunityMap: null,
      complianceScores: null,
      complianceIndicators: null,
      currentRoute: expectsRiskReport ? 'risk' : 'graph',
      activeRightPanel: expectsRiskReport ? 'risk' : 'graph',
    }))

    sendUnifiedStream(
      {
        query,
        fileContent: uploadedFile?.text ?? null,
        sessionId,
        roundId: roundId + 1,
        maxHop: 3,
        intentHint: intentHint ?? null,
      },
      {
        onStage: (_stage, data) => {
          const stageName = data.data?.stage_name || ''
          const stageAction = data.data?.agent_action || ''
          const frontendStage = mapBackendStage(data.stage || _stage)
          set((state) => ({
            riskStages: [...state.riskStages, { stage: frontendStage, content: stageAction || stageName }],
            messages: state.messages.map((m) =>
              m.id === tempId
                ? { ...m, thinkingStatus: stageAction || stageName }
                : m
            ),
          }))
        },

        onEntities: (data) => {
          const resolved = data.resolved || []
          set({ resolvedEntities: resolved })
        },

        onSubgraph: (graph) => {
          const rawNodes = (graph as any).nodes || []
          const normalized = {
            nodes: normalizeSubgraphNodes(rawNodes),
            edges: normalizeSubgraphEdges((graph as any).edges || []),
            paths: (graph as any).paths || [],
          }
          const nodeTypes = [...new Set(normalized.nodes.map((n: any) => n.type))]
          console.log(`[agentStore] onSubgraph nodes=${normalized.nodes.length} edges=${normalized.edges.length}`)
          console.log('[agentStore] onSubgraph details:', { paths: normalized.paths.length, nodeTypes })
          if (rawNodes.length > 0) {
            console.log('[agentStore] onSubgraph first raw node keys:', Object.keys(rawNodes[0]))
            console.log('[agentStore] onSubgraph first raw node:', rawNodes[0])
          }
          if (normalized.nodes.length > 0) {
            console.log('[agentStore] onSubgraph first normalized node keys:', Object.keys(normalized.nodes[0]))
            console.log('[agentStore] onSubgraph first normalized node:', normalized.nodes[0])
          }
          // Warn about any nodes whose type is still not in VALID_TYPES
          const invalid = normalized.nodes.filter((n: any) => !VALID_TYPES.has(n.type))
          if (invalid.length > 0) {
            console.warn('[agentStore] onSubgraph WARNING: nodes with invalid type after normalization:', invalid.map((n: any) => ({ id: n.id, title: n.title, type: n.type, entityType: n.entityType, entity_type: n.entity_type })))
          }
          set({ currentSubgraph: normalized as Subgraph })
        },

        onEntityStats: (stats) => {
          set((state) => ({
            riskReport: mergeRiskReport(state.riskReport, { entity_stats: stats } as any),
          }))
        },

        onCommunity: (info) => {
          console.log('[agentStore] onCommunity:', { communityCount: (info as any)?.communities?.length, method: (info as any)?.selected_method })
          set((state) => ({
            riskCommunity: info as CommunityResult,
            riskReport: mergeRiskReport(state.riskReport, { community_info: info } as any),
          }))
        },

        onEntityCommunityMap: (map) => {
          console.log('[agentStore] onEntityCommunityMap:', { entityCount: (map as any)?.entities?.length, unmapped: (map as any)?.unmapped_count })
          set((state) => ({
            riskEntityCommunityMap: map as EntityCommunityMap,
          }))
        },

        onCandidateRiskPaths: (paths) => {
          const arr = Array.isArray(paths) ? paths : []
          console.log('[agentStore] onCandidateRiskPaths:', { count: arr.length, firstPath: arr[0] })
          // Transform into SubgraphPath shape so buildG6Data highlights them
          const subgraphPaths = arr.map((p: any) => ({
            pathId: p.path_id || '',
            nodeIds: p.node_ids || [],
            edgeIds: p.edge_ids || [],
            score: p.confidence ?? 0.7,
          }))
          set((state) => {
            const currentPaths = state.currentSubgraph?.paths || []
            const mergedPaths = [...currentPaths]
            for (const sp of subgraphPaths) {
              if (!mergedPaths.some((existing) => existing.pathId === sp.pathId)) {
                mergedPaths.push(sp)
              }
            }
            console.log('[agentStore] onCandidateRiskPaths: merged subgraph.paths count =', mergedPaths.length)
            return {
              currentSubgraph: state.currentSubgraph
                ? { ...state.currentSubgraph, paths: mergedPaths }
                : null,
            }
          })
        },

        onRiskPaths: (paths) => {
          // The SSE event now sends { candidate_paths, interpreted_paths, merged_paths }
          const data: any = paths
          const interpretedArr: any[] = Array.isArray(data?.interpreted_paths)
            ? data.interpreted_paths
            : Array.isArray(data) ? data : []
          const mergedArr: any[] = Array.isArray(data?.merged_paths)
            ? data.merged_paths
            : interpretedArr

          // Store raw paths in riskReport for the text-based report panel
          set((state) => ({
            riskReport: mergeRiskReport(state.riskReport, {
              risk_paths: interpretedArr,
            } as any),
          }))

          // Also merge into currentSubgraph.paths so the graph view can highlight them
          if (mergedArr.length === 0) return
          const subgraphPaths = mergedArr.map((p: any) => ({
            pathId: p.path_id || '',
            nodeIds: p.node_ids || [],
            edgeIds: p.edge_ids || [],
            score: p.confidence ?? 0.7,
          }))
          set((state) => {
            const currentPaths = state.currentSubgraph?.paths || []
            const newPaths = [...currentPaths]
            for (const sp of subgraphPaths) {
              if (!newPaths.some((existing) => existing.pathId === sp.pathId)) {
                newPaths.push(sp)
              }
            }
            console.log('[agentStore] onRiskPaths: merged into subgraph.paths, count =', newPaths.length)
            return {
              currentSubgraph: state.currentSubgraph
                ? { ...state.currentSubgraph, paths: newPaths }
                : null,
            }
          })
        },

        onAnomalyFindings: (anomalies) => {
          set((state) => ({
            riskReport: mergeRiskReport(state.riskReport, {
              anomaly_findings: Array.isArray(anomalies) ? anomalies : (anomalies as any)?.anomalies ?? [],
            } as any),
          }))
        },

        onCompliance: (matches) => {
          set((state) => ({
            riskReport: mergeRiskReport(state.riskReport, {
              compliance_matches: Array.isArray(matches) ? matches : (matches as any)?.matches ?? [],
            } as any),
          }))
        },

        onComplianceScores: (scores) => {
          const scoreMap = scores as Record<string, number>
          console.log('[agentStore] onComplianceScores keys=%d', Object.keys(scoreMap || {}).length)
          set({ complianceScores: scoreMap })
        },

        onComplianceIndicators: (data) => {
          const indicators = (data as any)?.indicators || data || []
          console.log('[agentStore] onComplianceIndicators count=%d', Array.isArray(indicators) ? indicators.length : 0)
          set({ complianceIndicators: Array.isArray(indicators) ? indicators : [] })
        },

        onScoring: (scores) => {
          set((state) => ({
            riskScores: scores as RiskScores,
            riskReport: mergeRiskReport(state.riskReport, {
              risk_scores: scores,
              overall_risk_level: (scores as any)?.level,
            } as any),
          }))
        },

        onGovernance: (plan) => {
          set((state) => ({
            governancePlan: plan as GovernancePlan,
            riskReport: mergeRiskReport(state.riskReport, { governance_plan: plan } as any),
          }))
        },

        onAgentTrace: (trace) => {
          set((state) => ({
            agentTraces: [...state.agentTraces, trace as AgentTraceEntry],
          }))
          console.groupCollapsed(
            `%c[AgentTrace] ${trace.agent} / ${trace.step}`,
            'color:#fa8c16;font-weight:bold',
          )
          console.log(trace.summary, trace.metrics)
          console.groupEnd()
        },

        onReport: (report) => {
          set((state) => ({
            riskReport: mergeRiskReport(state.riskReport, report as RiskReport),
            messages: state.messages.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    content: buildReportAnswer(report as RiskReport),
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

        onDone: (data) => {
          const finalIntent = data?.intent_type || expectedIntent
          const isRisk = finalIntent === 'risk_analysis'
          set((state) => ({
            isLoading: false,
            currentRoute: isRisk ? 'risk' : 'graph',
            activeRightPanel: isRisk ? 'risk' : 'graph',
            messages: state.messages.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    content: m.content || (isRisk
                      ? buildPartialRiskAnswer(query, state.riskReport, state.currentSubgraph)
                      : buildGraphQaAnswer(query, state.currentSubgraph)),
                    isLoading: false,
                    thinkingStatus: undefined,
                  }
                : m
            ),
          }))
        },

        onError: (msg) => {
          set((state) => ({
            isLoading: false,
            error: msg,
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, content: `Error: ${msg}` } : m
            ),
          }))
        },
      }
    )
  },

  retryRiskQuery: async () => {
    const { lastRiskQuery } = get()
    if (lastRiskQuery) {
      await get().sendRiskQuery(lastRiskQuery)
    }
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
      riskReport: null,
      riskStages: [],
      riskCommunity: null,
      riskEntityCommunityMap: null,
      complianceScores: null,
      complianceIndicators: null,
      activeRightPanel: 'graph',
      resolvedEntities: [],
      evidenceChains: null,
      riskScores: null,
      governancePlan: null,
      uploadedFile: null,
      fileUploading: false,
      agentTraces: [],
      lastRiskQuery: '',
    })
  },

  uploadFile: async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      set({ error: '文件过大（最大 10MB）', fileUploading: false })
      return
    }

    set({ fileUploading: true, error: null })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const resp = await fetch('/api/v1/chat/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await resp.json()
      if (result.success) {
        set({ uploadedFile: result.data, fileUploading: false })
      } else {
        set({ error: result.message || '文件上传失败', fileUploading: false })
      }
    } catch (err: any) {
      set({ error: err.message || '文件上传失败', fileUploading: false })
    }
  },

  clearUploadedFile: () => set({ uploadedFile: null }),

  setError: (error: string | null) => set({ error }),

  clearRoute: () => set({ currentRoute: null, currentSubgraph: null }),
}))
