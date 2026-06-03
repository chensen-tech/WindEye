globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/store/agentStore.ts": function(module, exports, __mako_require__) {
            "use strict";
            __mako_require__.d(exports, "__esModule", {
                value: true
            });
            function _export(target, all) {
                for(var name in all)Object.defineProperty(target, name, {
                    enumerable: true,
                    get: all[name]
                });
            }
            __mako_require__.e(exports, {
                normalizeSubgraphEdges: function() {
                    return normalizeSubgraphEdges;
                },
                normalizeSubgraphNodes: function() {
                    return normalizeSubgraphNodes;
                },
                useAgentStore: function() {
                    return useAgentStore;
                }
            });
            var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
            var _zustand = __mako_require__("node_modules/zustand/esm/index.mjs");
            var _agent = __mako_require__("src/pages/KnowledgeQA/api/agent.ts");
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            const generateSessionId = ()=>`sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            // Normalize nodes from Neo4j format {id, labels, properties} to frontend format {id, type, ...}
            // Also handles DRAEngine format {id, label, type} which already has a `type` field.
            const VALID_TYPES = new Set([
                'COMPANY',
                'PERSON',
                'EVENT',
                'SUB_EVENT',
                'TIME',
                'RiskFeature',
                'RiskFactor',
                'Action',
                'Regulation',
                'Law'
            ]);
            function normalizeSubgraphNodes(rawNodes) {
                return rawNodes.map((n)=>{
                    // Already has a valid `type` field (DRAEngine format) — inject unified fields
                    if (n.type && VALID_TYPES.has(n.type)) {
                        const props = n.properties || {};
                        return {
                            ...n,
                            properties: props,
                            raw: n,
                            entityType: n.entityType || n.type,
                            entity_type: n.entity_type || n.type,
                            label: n.label || n.title || n.name || String(n.id),
                            compliance_score: n.compliance_score ?? props.compliance_score
                        };
                    }
                    // Neo4j format: extract type from `labels` array
                    let nodeType = '';
                    if (n.labels && Array.isArray(n.labels) && n.labels.length > 0) {
                        for (const label of n.labels){
                            const upper = typeof label === 'string' ? label.toUpperCase() : '';
                            if (upper === 'COMPANY' || upper === 'SUBJECT') {
                                nodeType = 'COMPANY';
                                break;
                            }
                            if (upper === 'PERSON') {
                                nodeType = 'PERSON';
                                break;
                            }
                            if (upper === 'EVENT') {
                                nodeType = 'EVENT';
                                break;
                            }
                            if (upper === 'SUB_EVENT') {
                                nodeType = 'SUB_EVENT';
                                break;
                            }
                            if (upper === 'TIME') {
                                nodeType = 'TIME';
                                break;
                            }
                            if (label === 'RiskFeature' || label === 'RiskFactor' || label === 'Action' || label === 'Regulation' || label === 'Law') {
                                nodeType = label;
                                break;
                            }
                        }
                        // Fallback: use first label, try to match known types
                        if (!nodeType) {
                            const firstLabel = String(n.labels[0]);
                            if (VALID_TYPES.has(firstLabel)) nodeType = firstLabel;
                            else {
                                const upper = firstLabel.toUpperCase();
                                if (VALID_TYPES.has(upper)) nodeType = upper;
                            }
                        }
                    }
                    // DRAEngine format fallback: type might need normalization
                    // Ontology layer types (Subject, Feature, Regulation) are mapped to concrete types
                    if (!nodeType && typeof n.type === 'string') {
                        const upper = String(n.type).toUpperCase();
                        nodeType = upper === 'COMPANY' || upper === 'SUBJECT' ? 'COMPANY' : upper === 'PERSON' ? 'PERSON' : upper === 'EVENT' ? 'EVENT' : upper === 'FEATURE' ? 'RiskFeature' : upper === 'REGULATION' ? 'Regulation' : VALID_TYPES.has(n.type) ? n.type : VALID_TYPES.has(upper) ? upper : n.type // Preserve original type so downstream resolveNodeType can handle it
                        ;
                    }
                    // Unified format: check entity_type from backend normalization
                    if (!nodeType && n.entity_type && VALID_TYPES.has(n.entity_type)) nodeType = n.entity_type;
                    // Absolute fallback: derive type from node name heuristics
                    if (!nodeType) {
                        const fallbackName = String(n.name || n.title || n.label || n.id || '');
                        const upper = fallbackName.toUpperCase();
                        if (/公司|集团|有限|股份|银行|基金|证券|保险|CO|LTD|INC|CORP/i.test(upper)) nodeType = 'COMPANY';
                        else if (/风险|事件|违约|违规|监管|处罚/i.test(upper)) nodeType = 'RiskFeature';
                        else nodeType = 'COMPANY' // Default to prevent silent filtering
                        ;
                    }
                    // Final safety net: if resolved type is still not valid, force to COMPANY
                    if (!VALID_TYPES.has(nodeType)) {
                        console.warn('[normalizeSubgraphNodes] Resolved type not in VALID_TYPES, forcing COMPANY:', {
                            id: n.id,
                            name: n.name,
                            title: n.title,
                            resolvedType: nodeType,
                            rawType: n.type,
                            rawEntityType: n.entity_type,
                            labels: n.labels
                        });
                        nodeType = 'COMPANY';
                    }
                    const props = n.properties || {};
                    const normalizedType = nodeType;
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
                        compliance_score: n.compliance_score ?? props.compliance_score
                    };
                });
            }
            function normalizeSubgraphEdges(rawEdges) {
                return rawEdges.map((e)=>({
                        id: e.id || e.element_id || e.elementId,
                        source: String(e.source || e.start || ''),
                        target: String(e.target || e.end || ''),
                        relation: e.relation || e.label || e.type || 'RELATED',
                        confidence: e.confidence
                    }));
            }
            const BACKEND_STAGE_TO_FRONTEND = {
                intent: 'planning',
                entity_resolution: 'planning',
                subgraph: 'retrieving',
                graph_analytics: 'entity_stats',
                community_detection: 'community',
                risk_analysis: 'analyzing',
                compliance: 'compliance',
                scoring: 'analyzing',
                governance: 'analyzing',
                reporting: 'reporting'
            };
            function mapBackendStage(backendStage) {
                return BACKEND_STAGE_TO_FRONTEND[backendStage] || 'retrieving';
            }
            function mergeRiskReport(prev, patch) {
                return {
                    ...prev || {},
                    ...patch,
                    // 元信息：最终 report 到达时优先使用最新值
                    report_id: patch.report_id ?? (prev === null || prev === void 0 ? void 0 : prev.report_id),
                    generated_at: patch.generated_at ?? (prev === null || prev === void 0 ? void 0 : prev.generated_at),
                    executive_summary: patch.executive_summary ?? (prev === null || prev === void 0 ? void 0 : prev.executive_summary),
                    markdown_report: patch.markdown_report ?? (prev === null || prev === void 0 ? void 0 : prev.markdown_report),
                    echarts_config: patch.echarts_config ?? (prev === null || prev === void 0 ? void 0 : prev.echarts_config),
                    // 中间阶段数据：渐进写入，新数据覆盖旧数据
                    entity_stats: patch.entity_stats ?? (prev === null || prev === void 0 ? void 0 : prev.entity_stats),
                    community_info: patch.community_info ?? (prev === null || prev === void 0 ? void 0 : prev.community_info),
                    risk_paths: patch.risk_paths ?? (prev === null || prev === void 0 ? void 0 : prev.risk_paths) ?? [],
                    anomaly_findings: patch.anomaly_findings ?? (prev === null || prev === void 0 ? void 0 : prev.anomaly_findings) ?? [],
                    compliance_matches: patch.compliance_matches ?? (prev === null || prev === void 0 ? void 0 : prev.compliance_matches) ?? [],
                    risk_scores: patch.risk_scores ?? (prev === null || prev === void 0 ? void 0 : prev.risk_scores),
                    governance_plan: patch.governance_plan ?? (prev === null || prev === void 0 ? void 0 : prev.governance_plan),
                    evidence_chains: patch.evidence_chains ?? (prev === null || prev === void 0 ? void 0 : prev.evidence_chains)
                };
            }
            function compactText(value, fallback = '') {
                if (value === undefined || value === null || value === '') return fallback;
                if (typeof value === 'string') return value;
                if (typeof value === 'number' || typeof value === 'boolean') return String(value);
                try {
                    return JSON.stringify(value);
                } catch  {
                    return fallback;
                }
            }
            function getSubgraphNodeName(node) {
                var _node_properties, _node_properties1;
                return compactText((node === null || node === void 0 ? void 0 : node.title) || (node === null || node === void 0 ? void 0 : node.zh_name) || (node === null || node === void 0 ? void 0 : node.name) || (node === null || node === void 0 ? void 0 : node.label) || (node === null || node === void 0 ? void 0 : (_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.name) || (node === null || node === void 0 ? void 0 : (_node_properties1 = node.properties) === null || _node_properties1 === void 0 ? void 0 : _node_properties1.COMPANY_NM) || (node === null || node === void 0 ? void 0 : node.id), '未知实体');
            }
            function buildGraphQaAnswer(query, subgraph) {
                const nodes = (subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes) || [];
                const edges = (subgraph === null || subgraph === void 0 ? void 0 : subgraph.edges) || [];
                if (nodes.length === 0) return '我暂时没有在图谱里找到明确匹配的实体或关系。可以把主体名称写完整一些，例如使用公司全称，我再帮你查。';
                const nodeById = new Map(nodes.map((node)=>[
                        String(node.id),
                        node
                    ]));
                const degree = new Map();
                edges.forEach((edge)=>{
                    const source = String(edge.source);
                    const target = String(edge.target);
                    degree.set(source, (degree.get(source) || 0) + 1);
                    degree.set(target, (degree.get(target) || 0) + 1);
                });
                const center = [
                    ...nodes
                ].sort((a, b)=>(degree.get(String(b.id)) || 0) - (degree.get(String(a.id)) || 0))[0];
                const centerId = center ? String(center.id) : '';
                const centerName = center ? getSubgraphNodeName(center) : '查询主体';
                const directEdges = edges.filter((edge)=>String(edge.source) === centerId || String(edge.target) === centerId);
                const related = directEdges.map((edge)=>{
                    const otherId = String(edge.source) === centerId ? String(edge.target) : String(edge.source);
                    const other = nodeById.get(otherId);
                    return {
                        name: getSubgraphNodeName(other),
                        relation: compactText(edge.relation || edge.type || edge.label, '关联')
                    };
                }).filter((item)=>item.name && item.name !== '未知实体');
                const lines = [];
                lines.push(`已根据你的问题查询到相关子图：${nodes.length} 个节点、${edges.length} 条关系。`);
                if (related.length > 0) {
                    lines.push(`${centerName} 的直接关联包括：`);
                    related.slice(0, 8).forEach((item, index)=>{
                        lines.push(`${index + 1}. ${item.name}（${item.relation}）`);
                    });
                    if (related.length > 8) lines.push(`还有 ${related.length - 8} 个关联实体，可在右侧图谱继续查看。`);
                } else {
                    const names = nodes.slice(0, 8).map(getSubgraphNodeName).join('、');
                    lines.push(`本次命中的实体包括：${names}。`);
                }
                if (/简称|缩写/.test(query) || /^[\u4e00-\u9fa5]{2,4}$/.test(query.trim())) {
                    lines.push('');
                    lines.push('如果这是公司简称，可能对应多个图谱实体。你可以补充公司全称、地区或关联对象，我可以进一步精确定位。');
                }
                return lines.join('\n');
            }
            function extractAmbiguousShortMention(query) {
                var _match_;
                if (/有限公司|有限责任|股份|集团|控股|投资管理|金融服务|证券|银行|保险/.test(query)) return null;
                const match = query.match(/^\s*([\u4e00-\u9fa5]{2,4})(?:公司)?(?:\s|与|和|的|有|关|查|风险|合规)/);
                const mention = match === null || match === void 0 ? void 0 : (_match_ = match[1]) === null || _match_ === void 0 ? void 0 : _match_.trim();
                if (!mention) return null;
                const stopWords = new Set([
                    '哪些',
                    '公司',
                    '关系',
                    '关联',
                    '查询',
                    '风险',
                    '合规',
                    '这个',
                    '那个'
                ]);
                return stopWords.has(mention) ? null : mention;
            }
            function buildClarifyAnswer(mention) {
                return `你说的“${mention}”可能是公司简称，图谱里可能存在多个相近实体。为了避免把主体识别错，请补充一个更明确的名称，例如公司全称、地区，或直接输入类似“${mention}投资管理有限公司”。`;
            }
            function buildReportAnswer(report) {
                var _report_risk_scores, _report_risk_scores1, _report_risk_scores2, _report_subgraph_summary, _report_subgraph_summary1;
                const paths = report.risk_paths || [];
                const anomalies = report.anomaly_findings || [];
                const compliance = report.compliance_matches || [];
                const recommendations = report.recommendations || [];
                const scoreLevel = ((_report_risk_scores = report.risk_scores) === null || _report_risk_scores === void 0 ? void 0 : _report_risk_scores.level) || report.overall_risk_level;
                const scoreValue = ((_report_risk_scores1 = report.risk_scores) === null || _report_risk_scores1 === void 0 ? void 0 : _report_risk_scores1.final_overall) ?? ((_report_risk_scores2 = report.risk_scores) === null || _report_risk_scores2 === void 0 ? void 0 : _report_risk_scores2.base_overall);
                const lines = [];
                lines.push(report.executive_summary || '协同治理分析已完成。');
                lines.push('');
                lines.push(`总体研判：${scoreLevel || '待评估'}${scoreValue !== undefined && scoreValue !== null ? `，综合评分 ${scoreValue}` : ''}`);
                lines.push(`图谱证据：${((_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) ?? '-'} 个节点、${((_report_subgraph_summary1 = report.subgraph_summary) === null || _report_subgraph_summary1 === void 0 ? void 0 : _report_subgraph_summary1.edge_count) ?? '-'} 条关系；识别 ${paths.length} 条风险路径、${anomalies.length} 个异常发现、${compliance.length} 条合规匹配。`);
                if (paths.length > 0) {
                    lines.push('');
                    lines.push('风险传导路径：');
                    paths.slice(0, 4).forEach((p, index)=>{
                        const desc = compactText(p.path_description || p.path_text, '暂无路径描述');
                        lines.push(`${index + 1}. [${p.risk_level || 'medium'}] ${desc}`);
                    });
                }
                if (anomalies.length > 0) {
                    lines.push('');
                    lines.push('异常关系：');
                    anomalies.slice(0, 3).forEach((a, index)=>{
                        lines.push(`${index + 1}. ${a.anomaly_type || '异常'}：${compactText(a.evidence, '暂无证据说明')}`);
                    });
                }
                if (compliance.length > 0) {
                    lines.push('');
                    lines.push('合规风险：');
                    compliance.slice(0, 3).forEach((c, index)=>{
                        const basis = [
                            c.regulation,
                            c.article
                        ].filter(Boolean).join(' ');
                        lines.push(`${index + 1}. ${basis || '相关法规'}：${c.violation || c.suggested_action || '需进一步核验'}`);
                    });
                }
                if (recommendations.length > 0) {
                    lines.push('');
                    lines.push('治理建议：');
                    recommendations.slice(0, 4).forEach((r, index)=>{
                        lines.push(`${index + 1}. ${r.action}（${r.department || '责任部门待定'}，${r.urgency || 'normal'}）`);
                    });
                }
                return lines.join('\n').slice(0, 1800);
            }
            const useAgentStore = (0, _zustand.create)((set, get)=>({
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
                    sendMessage: async (query, rewrittenQuery)=>{
                        return get().sendUnifiedMessage(rewrittenQuery || query);
                    },
                    sendRiskQuery: async (query, communityId, fileContent)=>{
                        set({
                            lastRiskQuery: query
                        });
                        return get().sendUnifiedMessage(query, 'risk_analysis');
                    },
                    sendUnifiedMessage: async (query, intentHint)=>{
                        if (get().isLoading) return;
                        const ambiguousMention = !intentHint ? extractAmbiguousShortMention(query) : null;
                        if (ambiguousMention) {
                            const userMsg = {
                                id: `user_${Date.now()}`,
                                role: 'user',
                                content: query,
                                timestamp: Date.now()
                            };
                            const assistantMsg = {
                                id: `asst_${Date.now()}`,
                                role: 'assistant',
                                content: buildClarifyAnswer(ambiguousMention),
                                timestamp: Date.now(),
                                isLoading: false
                            };
                            set((state)=>({
                                    messages: [
                                        ...state.messages,
                                        userMsg,
                                        assistantMsg
                                    ],
                                    currentRoute: 'graph',
                                    activeRightPanel: 'graph',
                                    clarifyMessage: assistantMsg.content
                                }));
                            return;
                        }
                        // Auto-detect risk intent from query keywords when no explicit hint provided
                        if (!intentHint) {
                            const riskKeywords = [
                                '风险',
                                '传导',
                                '合规',
                                '违规',
                                '处罚',
                                '监管',
                                '担保',
                                '关联交易',
                                '资金占用',
                                '内幕',
                                '操纵',
                                '洗钱',
                                '欺诈',
                                '违约',
                                '评级',
                                '预警'
                            ];
                            if (riskKeywords.some((kw)=>query.includes(kw))) intentHint = 'risk_analysis';
                        }
                        const { sessionId, roundId, messages, uploadedFile } = get();
                        set({
                            roundId: roundId + 1
                        });
                        const userMsg = {
                            id: `user_${Date.now()}`,
                            role: 'user',
                            content: query,
                            timestamp: Date.now()
                        };
                        const tempId = `asst_${Date.now()}`;
                        const assistantMsg = {
                            id: tempId,
                            role: 'assistant',
                            content: '',
                            timestamp: Date.now(),
                            isLoading: true
                        };
                        set((state)=>({
                                messages: [
                                    ...state.messages,
                                    userMsg,
                                    assistantMsg
                                ],
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
                                complianceIndicators: null
                            }));
                        (0, _agent.sendUnifiedStream)({
                            query,
                            fileContent: (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.text) ?? null,
                            sessionId,
                            roundId: roundId + 1,
                            maxHop: 3,
                            intentHint: intentHint ?? null
                        }, {
                            onStage: (_stage, data)=>{
                                var _data_data, _data_data1;
                                const stageName = ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.stage_name) || '';
                                const stageAction = ((_data_data1 = data.data) === null || _data_data1 === void 0 ? void 0 : _data_data1.agent_action) || '';
                                const frontendStage = mapBackendStage(data.stage || _stage);
                                set((state)=>({
                                        riskStages: [
                                            ...state.riskStages,
                                            {
                                                stage: frontendStage,
                                                content: stageAction || stageName
                                            }
                                        ],
                                        messages: state.messages.map((m)=>m.id === tempId ? {
                                                ...m,
                                                thinkingStatus: stageAction || stageName
                                            } : m)
                                    }));
                            },
                            onEntities: (data)=>{
                                const resolved = data.resolved || [];
                                set({
                                    resolvedEntities: resolved
                                });
                            },
                            onSubgraph: (graph)=>{
                                const rawNodes = graph.nodes || [];
                                const normalized = {
                                    nodes: normalizeSubgraphNodes(rawNodes),
                                    edges: normalizeSubgraphEdges(graph.edges || []),
                                    paths: graph.paths || []
                                };
                                const nodeTypes = [
                                    ...new Set(normalized.nodes.map((n)=>n.type))
                                ];
                                console.log(`[agentStore] onSubgraph nodes=${normalized.nodes.length} edges=${normalized.edges.length}`);
                                console.log('[agentStore] onSubgraph details:', {
                                    paths: normalized.paths.length,
                                    nodeTypes
                                });
                                if (rawNodes.length > 0) {
                                    console.log('[agentStore] onSubgraph first raw node keys:', Object.keys(rawNodes[0]));
                                    console.log('[agentStore] onSubgraph first raw node:', rawNodes[0]);
                                }
                                if (normalized.nodes.length > 0) {
                                    console.log('[agentStore] onSubgraph first normalized node keys:', Object.keys(normalized.nodes[0]));
                                    console.log('[agentStore] onSubgraph first normalized node:', normalized.nodes[0]);
                                }
                                // Warn about any nodes whose type is still not in VALID_TYPES
                                const invalid = normalized.nodes.filter((n)=>!VALID_TYPES.has(n.type));
                                if (invalid.length > 0) console.warn('[agentStore] onSubgraph WARNING: nodes with invalid type after normalization:', invalid.map((n)=>({
                                        id: n.id,
                                        title: n.title,
                                        type: n.type,
                                        entityType: n.entityType,
                                        entity_type: n.entity_type
                                    })));
                                set({
                                    currentSubgraph: normalized
                                });
                            },
                            onEntityStats: (stats)=>{
                                set((state)=>({
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            entity_stats: stats
                                        })
                                    }));
                            },
                            onCommunity: (info)=>{
                                var _communities, _this, _this1;
                                console.log('[agentStore] onCommunity:', {
                                    communityCount: (_this = info) === null || _this === void 0 ? void 0 : (_communities = _this.communities) === null || _communities === void 0 ? void 0 : _communities.length,
                                    method: (_this1 = info) === null || _this1 === void 0 ? void 0 : _this1.selected_method
                                });
                                set((state)=>({
                                        riskCommunity: info,
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            community_info: info
                                        })
                                    }));
                            },
                            onEntityCommunityMap: (map)=>{
                                var _entities, _this, _this1;
                                console.log('[agentStore] onEntityCommunityMap:', {
                                    entityCount: (_this = map) === null || _this === void 0 ? void 0 : (_entities = _this.entities) === null || _entities === void 0 ? void 0 : _entities.length,
                                    unmapped: (_this1 = map) === null || _this1 === void 0 ? void 0 : _this1.unmapped_count
                                });
                                set((state)=>({
                                        riskEntityCommunityMap: map
                                    }));
                            },
                            onCandidateRiskPaths: (paths)=>{
                                const arr = Array.isArray(paths) ? paths : [];
                                console.log('[agentStore] onCandidateRiskPaths:', {
                                    count: arr.length,
                                    firstPath: arr[0]
                                });
                                // Transform into SubgraphPath shape so buildG6Data highlights them
                                const subgraphPaths = arr.map((p)=>({
                                        pathId: p.path_id || '',
                                        nodeIds: p.node_ids || [],
                                        edgeIds: p.edge_ids || [],
                                        score: p.confidence ?? 0.7
                                    }));
                                set((state)=>{
                                    var _state_currentSubgraph;
                                    const currentPaths = ((_state_currentSubgraph = state.currentSubgraph) === null || _state_currentSubgraph === void 0 ? void 0 : _state_currentSubgraph.paths) || [];
                                    const mergedPaths = [
                                        ...currentPaths
                                    ];
                                    for (const sp of subgraphPaths)if (!mergedPaths.some((existing)=>existing.pathId === sp.pathId)) mergedPaths.push(sp);
                                    console.log('[agentStore] onCandidateRiskPaths: merged subgraph.paths count =', mergedPaths.length);
                                    return {
                                        currentSubgraph: state.currentSubgraph ? {
                                            ...state.currentSubgraph,
                                            paths: mergedPaths
                                        } : null
                                    };
                                });
                            },
                            onRiskPaths: (paths)=>{
                                // The SSE event now sends { candidate_paths, interpreted_paths, merged_paths }
                                const data = paths;
                                const interpretedArr = Array.isArray(data === null || data === void 0 ? void 0 : data.interpreted_paths) ? data.interpreted_paths : Array.isArray(data) ? data : [];
                                const mergedArr = Array.isArray(data === null || data === void 0 ? void 0 : data.merged_paths) ? data.merged_paths : interpretedArr;
                                // Store raw paths in riskReport for the text-based report panel
                                set((state)=>({
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            risk_paths: interpretedArr
                                        })
                                    }));
                                // Also merge into currentSubgraph.paths so the graph view can highlight them
                                if (mergedArr.length === 0) return;
                                const subgraphPaths = mergedArr.map((p)=>({
                                        pathId: p.path_id || '',
                                        nodeIds: p.node_ids || [],
                                        edgeIds: p.edge_ids || [],
                                        score: p.confidence ?? 0.7
                                    }));
                                set((state)=>{
                                    var _state_currentSubgraph;
                                    const currentPaths = ((_state_currentSubgraph = state.currentSubgraph) === null || _state_currentSubgraph === void 0 ? void 0 : _state_currentSubgraph.paths) || [];
                                    const newPaths = [
                                        ...currentPaths
                                    ];
                                    for (const sp of subgraphPaths)if (!newPaths.some((existing)=>existing.pathId === sp.pathId)) newPaths.push(sp);
                                    console.log('[agentStore] onRiskPaths: merged into subgraph.paths, count =', newPaths.length);
                                    return {
                                        currentSubgraph: state.currentSubgraph ? {
                                            ...state.currentSubgraph,
                                            paths: newPaths
                                        } : null
                                    };
                                });
                            },
                            onAnomalyFindings: (anomalies)=>{
                                set((state)=>{
                                    var _this;
                                    return {
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            anomaly_findings: Array.isArray(anomalies) ? anomalies : ((_this = anomalies) === null || _this === void 0 ? void 0 : _this.anomalies) ?? []
                                        })
                                    };
                                });
                            },
                            onCompliance: (matches)=>{
                                set((state)=>{
                                    var _this;
                                    return {
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            compliance_matches: Array.isArray(matches) ? matches : ((_this = matches) === null || _this === void 0 ? void 0 : _this.matches) ?? []
                                        })
                                    };
                                });
                            },
                            onComplianceScores: (scores)=>{
                                const scoreMap = scores;
                                console.log('[agentStore] onComplianceScores keys=%d', Object.keys(scoreMap || {}).length);
                                set({
                                    complianceScores: scoreMap
                                });
                            },
                            onComplianceIndicators: (data)=>{
                                var _this;
                                const indicators = ((_this = data) === null || _this === void 0 ? void 0 : _this.indicators) || data || [];
                                console.log('[agentStore] onComplianceIndicators count=%d', Array.isArray(indicators) ? indicators.length : 0);
                                set({
                                    complianceIndicators: Array.isArray(indicators) ? indicators : []
                                });
                            },
                            onScoring: (scores)=>{
                                set((state)=>{
                                    var _this;
                                    return {
                                        riskScores: scores,
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            risk_scores: scores,
                                            overall_risk_level: (_this = scores) === null || _this === void 0 ? void 0 : _this.level
                                        })
                                    };
                                });
                            },
                            onGovernance: (plan)=>{
                                set((state)=>({
                                        governancePlan: plan,
                                        riskReport: mergeRiskReport(state.riskReport, {
                                            governance_plan: plan
                                        })
                                    }));
                            },
                            onAgentTrace: (trace)=>{
                                set((state)=>({
                                        agentTraces: [
                                            ...state.agentTraces,
                                            trace
                                        ]
                                    }));
                                console.groupCollapsed(`%c[AgentTrace] ${trace.agent} / ${trace.step}`, 'color:#fa8c16;font-weight:bold');
                                console.log(trace.summary, trace.metrics);
                                console.groupEnd();
                            },
                            onReport: (report)=>{
                                set((state)=>({
                                        riskReport: mergeRiskReport(state.riskReport, report),
                                        messages: state.messages.map((m)=>m.id === tempId ? {
                                                ...m,
                                                content: buildReportAnswer(report),
                                                isLoading: false,
                                                thinkingStatus: undefined,
                                                data: {
                                                    echartsConfig: report.echarts_config
                                                }
                                            } : m),
                                        isLoading: false,
                                        currentRoute: 'risk',
                                        activeRightPanel: 'risk'
                                    }));
                            },
                            onDone: (data)=>{
                                set((state)=>({
                                        isLoading: false,
                                        currentRoute: (data === null || data === void 0 ? void 0 : data.intent_type) === 'risk_analysis' ? 'risk' : 'graph',
                                        activeRightPanel: (data === null || data === void 0 ? void 0 : data.intent_type) === 'risk_analysis' ? 'risk' : 'graph',
                                        messages: state.messages.map((m)=>m.id === tempId ? {
                                                ...m,
                                                content: m.content || ((data === null || data === void 0 ? void 0 : data.intent_type) === 'risk_analysis' ? '' : buildGraphQaAnswer(query, state.currentSubgraph)),
                                                isLoading: false,
                                                thinkingStatus: undefined
                                            } : m)
                                    }));
                            },
                            onError: (msg)=>{
                                set((state)=>({
                                        isLoading: false,
                                        error: msg,
                                        messages: state.messages.map((m)=>m.id === tempId ? {
                                                ...m,
                                                content: `Error: ${msg}`
                                            } : m)
                                    }));
                            }
                        });
                    },
                    retryRiskQuery: async ()=>{
                        const { lastRiskQuery } = get();
                        if (lastRiskQuery) await get().sendRiskQuery(lastRiskQuery);
                    },
                    clearHistory: ()=>{
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
                            lastRiskQuery: ''
                        });
                    },
                    uploadFile: async (file)=>{
                        const MAX_SIZE = 10485760;
                        if (file.size > MAX_SIZE) {
                            set({
                                error: '文件过大（最大 10MB）',
                                fileUploading: false
                            });
                            return;
                        }
                        set({
                            fileUploading: true,
                            error: null
                        });
                        try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const resp = await fetch('/api/v1/chat/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const result = await resp.json();
                            if (result.success) set({
                                uploadedFile: result.data,
                                fileUploading: false
                            });
                            else set({
                                error: result.message || '文件上传失败',
                                fileUploading: false
                            });
                        } catch (err) {
                            set({
                                error: err.message || '文件上传失败',
                                fileUploading: false
                            });
                        }
                    },
                    clearUploadedFile: ()=>set({
                            uploadedFile: null
                        }),
                    setError: (error)=>set({
                            error
                        }),
                    clearRoute: ()=>set({
                            currentRoute: null,
                            currentSubgraph: null
                        })
                }));
            if (prevRefreshReg) self.$RefreshReg$ = prevRefreshReg;
            if (prevRefreshSig) self.$RefreshSig$ = prevRefreshSig;
            function registerClassComponent(filename, moduleExports) {
                for(const key in moduleExports)try {
                    if (key === "__esModule") continue;
                    const exportValue = moduleExports[key];
                    if (_reactrefresh.isLikelyComponentType(exportValue) && exportValue.prototype && exportValue.prototype.isReactComponent) _reactrefresh.register(exportValue, filename + " " + key);
                } catch (e) {}
            }
            function $RefreshIsReactComponentLike$(moduleExports) {
                if (_reactrefresh.isLikelyComponentType(moduleExports || moduleExports.default)) return true;
                for(var key in moduleExports)try {
                    if (_reactrefresh.isLikelyComponentType(moduleExports[key])) return true;
                } catch (e) {}
                return false;
            }
            registerClassComponent(module.id, module.exports);
            if ($RefreshIsReactComponentLike$(module.exports)) {
                module.meta.hot.accept();
                _reactrefresh.performReactRefresh();
            }
        }
    }
}, function(runtime) {
    runtime._h = '11270723112539161309';
    runtime.updateEnsure2Map({
        "node_modules/@antv/g6/es/index.js": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__CommunityDiscovery__index"
        ],
        "src/.umi/core/EmptyRoute.tsx": [
            "src/.umi/core/EmptyRoute.tsx"
        ],
        "src/.umi/plugin-layout/Layout.tsx": [
            "vendors_2",
            "src/.umi/plugin-layout/Layout.tsx"
        ],
        "src/.umi/plugin-openapi/openapi.tsx": [
            "vendors_2",
            "vendors_0",
            "src/.umi/plugin-openapi/openapi.tsx"
        ],
        "src/pages/404.tsx": [
            "p__404"
        ],
        "src/pages/CommunityDiscovery/index.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__CommunityDiscovery__index"
        ],
        "src/pages/EventPage.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__EventPage"
        ],
        "src/pages/FeaturePage.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__FeaturePage"
        ],
        "src/pages/GeneralPage.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__GeneralPage"
        ],
        "src/pages/KnowledgeBuild/index.tsx": [
            "common",
            "vendors_0",
            "p__KnowledgeBuild__index"
        ],
        "src/pages/KnowledgeQA/api/agent.ts": [
            "vendors_2",
            "vendors_0",
            "vendors_1",
            "p__KnowledgeQA__index"
        ],
        "src/pages/KnowledgeQA/index.tsx": [
            "vendors_2",
            "vendors_0",
            "vendors_1",
            "p__KnowledgeQA__index"
        ],
        "src/pages/RegulationPage.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__RegulationPage"
        ],
        "src/pages/SubjectPage.tsx": [
            "vendors_2",
            "common",
            "vendors_1",
            "p__SubjectPage"
        ],
        "src/pages/Welcome.tsx": [
            "vendors_0",
            "vendors_1",
            "p__Welcome"
        ],
        "src/pages/user/login/index.tsx": [
            "p__user__login__index"
        ]
    });
    ;
});

//# sourceMappingURL=p__KnowledgeQA__index-async.12303606693460967405.hot-update.js.map