globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/components/RiskReportPanel.tsx": function(module, exports, __mako_require__) {
            "use strict";
            __mako_require__.d(exports, "__esModule", {
                value: true
            });
            __mako_require__.d(exports, "default", {
                enumerable: true,
                get: function() {
                    return _default;
                }
            });
            var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
            var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
            var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
            var _reactmarkdown = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react-markdown/index.js"));
            var _graphStyles = __mako_require__("src/pages/KnowledgeQA/components/graphStyles.ts");
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Title, Text, Paragraph } = _antd.Typography;
            const RISK_LEVEL_COLORS = {
                high: '#f5222d',
                medium: '#fa8c16',
                low: '#52c41a',
                insufficient_evidence: '#94a3b8'
            };
            const RISK_LEVEL_LABELS = {
                high: '高风险',
                medium: '中风险',
                low: '低风险',
                insufficient_evidence: '证据不足'
            };
            const URGENCY_TAGS = {
                urgent: {
                    color: '#f5222d',
                    label: '紧急'
                },
                normal: {
                    color: '#fa8c16',
                    label: '一般'
                },
                low: {
                    color: '#52c41a',
                    label: '低'
                }
            };
            const COMMUNITY_PALETTE = [
                '#2563eb',
                '#7c3aed',
                '#16a34a',
                '#ea580c',
                '#dc2626',
                '#0891b2'
            ];
            const STAGE_LABELS = {
                planning: '任务规划',
                retrieving: '图谱检索',
                entity_stats: '实体统计',
                community: '群体发现',
                analyzing: '协同治理',
                compliance: '合规匹配',
                reporting: '报告生成'
            };
            function inferClientEntityType(name) {
                if (!name) return 'COMPANY';
                if (/公司|集团|有限|股份|实业|科技|投资|控股|银行|基金|证券|保险|信托|租赁|保理|资本|产业/.test(name)) return 'COMPANY';
                if (/律师|法官|董事长|总经理|法定代表人|股东|监事|董事|经理|主任|行长|总裁/.test(name)) return 'PERSON';
                if (/^[一-鿿]{2,4}$/.test(name) && !/公司|事件|风险|法|条例|规定|集团|有限|银行/.test(name)) return 'PERSON';
                if (/事件|事故|案件|诉讼|处罚|仲裁|纠纷|争议|违约|违规|违法|资金占用|冻结|判决|裁定/.test(name)) return 'EVENT';
                if (/风险|因子|指标|预警|异常|波动/.test(name)) return 'RiskFactor';
                if (/法$|条例$|办法$|规定$|细则$/.test(name)) return 'Regulation';
                return 'COMPANY';
            }
            function getNodeDisplayName(node) {
                const props = (node === null || node === void 0 ? void 0 : node.properties) || {};
                return String((node === null || node === void 0 ? void 0 : node.name) || (node === null || node === void 0 ? void 0 : node.label) || props.name || props.title || props.COMPANY_NM || props.PERSON_NM || props.SECURITY_NM || (node === null || node === void 0 ? void 0 : node.id) || '');
            }
            function getNodeDisplayType(node) {
                var _node_labels, _node_properties;
                return String((node === null || node === void 0 ? void 0 : node.type) || (node === null || node === void 0 ? void 0 : node.label) || (node === null || node === void 0 ? void 0 : (_node_labels = node.labels) === null || _node_labels === void 0 ? void 0 : _node_labels[0]) || (node === null || node === void 0 ? void 0 : (_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.type) || inferClientEntityType(getNodeDisplayName(node)));
            }
            function getGraphCounts(graph) {
                return {
                    nodes: Array.isArray(graph === null || graph === void 0 ? void 0 : graph.nodes) ? graph.nodes.length : 0,
                    edges: Array.isArray(graph === null || graph === void 0 ? void 0 : graph.edges) ? graph.edges.length : 0
                };
            }
            function getEdgeEndpoint(edge, key) {
                const value = (edge === null || edge === void 0 ? void 0 : edge[key]) ?? (edge === null || edge === void 0 ? void 0 : edge[`${key}_id`]) ?? (edge === null || edge === void 0 ? void 0 : edge[`${key}Id`]);
                if (typeof value === 'object' && value !== null) return String(value.id || value.name || '');
                return String(value || '');
            }
            function formatTimestamp(ts) {
                if (!ts) return new Date().toISOString().replace('T', ' ').slice(0, 19);
                return ts;
            }
            function generateReportId(ts) {
                const d = ts ? new Date(ts) : new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const seq = String(d.getTime() % 100000).padStart(5, '0');
                return `WIND-RPT-${y}${m}${day}-${seq}`;
            }
            const RiskReportPanel = ({ report, stages, community, entityCommunityMap, isLoading, error, onRetry, onJumpToGraph, queryText, currentSubgraph, resolvedEntities, governancePlan: governancePlanProp })=>{
                var _this, _currentSubgraph_nodes, _report_subgraph_summary, _seededCommunityData_visualization, _stages_;
                _s();
                const { message } = _antd.App.useApp();
                const [historyOpen, setHistoryOpen] = (0, _react.useState)(false);
                const [historyLoading, setHistoryLoading] = (0, _react.useState)(false);
                const [historyReports, setHistoryReports] = (0, _react.useState)([]);
                const [showAllPaths, setShowAllPaths] = (0, _react.useState)(false);
                const [riskPathMode, setRiskPathMode] = (0, _react.useState)('community');
                const [communityNodePositions, setCommunityNodePositions] = (0, _react.useState)({});
                const [draggingCommunityNodeId, setDraggingCommunityNodeId] = (0, _react.useState)(null);
                const [hoveredCommunityNodeId, setHoveredCommunityNodeId] = (0, _react.useState)(null);
                const [highlightSection, setHighlightSection] = (0, _react.useState)(null);
                const finalReportRef = (0, _react.useRef)(null);
                const reportId = (report === null || report === void 0 ? void 0 : report.report_id) || generateReportId(report === null || report === void 0 ? void 0 : report.generated_at);
                const governancePlan = governancePlanProp || ((_this = report) === null || _this === void 0 ? void 0 : _this.governance_plan);
                const { highCount, mediumCount, lowCount, sortedEntities } = (0, _react.useMemo)(()=>{
                    if (!report) return {
                        highCount: 0,
                        mediumCount: 0,
                        lowCount: 0,
                        sortedEntities: []
                    };
                    let high = 0, medium = 0, low = 0;
                    for (const path of report.risk_paths || []){
                        if (path.risk_level === 'high') high++;
                        else if (path.risk_level === 'medium') medium++;
                        else low++;
                    }
                    const entityCounts = new Map();
                    for (const path of report.risk_paths || [])for (const entity of path.affected_entities || []){
                        const existing = entityCounts.get(entity);
                        if (existing) existing.count++;
                        else entityCounts.set(entity, {
                            count: 1,
                            types: new Set()
                        });
                    }
                    for (const anomaly of report.anomaly_findings || [])for (const entity of anomaly.affected_entities || []){
                        const existing = entityCounts.get(entity);
                        if (existing) existing.count++;
                        else entityCounts.set(entity, {
                            count: 1,
                            types: new Set()
                        });
                    }
                    const sorted = Array.from(entityCounts.entries()).sort((a, b)=>b[1].count - a[1].count).slice(0, 10);
                    return {
                        highCount: high,
                        mediumCount: medium,
                        lowCount: low,
                        sortedEntities: sorted
                    };
                }, [
                    report
                ]);
                const stageOrder = [
                    'planning',
                    'retrieving',
                    'entity_stats',
                    'community',
                    'analyzing',
                    'compliance',
                    'reporting'
                ];
                const completedStages = new Set(stages.map((s)=>s.stage));
                const currentStageIdx = stageOrder.findIndex((s)=>!completedStages.has(s));
                const activeStep = currentStageIdx >= 0 ? currentStageIdx : stageOrder.length;
                const loadHistory = async ()=>{
                    setHistoryOpen(true);
                    setHistoryLoading(true);
                    try {
                        const resp = await fetch('/api/v1/risk/reports');
                        if (resp.ok) {
                            const data = await resp.json();
                            const items = Array.isArray(data) ? data : data.data || data.reports || [];
                            setHistoryReports(items);
                        }
                    } catch  {
                    // silent
                    } finally{
                        setHistoryLoading(false);
                    }
                };
                const loadHistoryReport = async (id)=>{
                    try {
                        const resp = await fetch(`/api/v1/risk/reports/${id}`);
                        if (resp.ok) {
                            const data = await resp.json();
                            message.success('报告已加载');
                            setHistoryOpen(false);
                            window.dispatchEvent(new CustomEvent('loadRiskReport', {
                                detail: data
                            }));
                        }
                    } catch  {
                        message.error('加载报告失败');
                    }
                };
                const handleExportMD = ()=>{
                    if (!(report === null || report === void 0 ? void 0 : report.markdown_report)) return;
                    const header = `# WindEye 协同治理报告\n\n**报告编号**: ${reportId}\n**生成时间**: ${formatTimestamp(report.generated_at)}\n**查询**: ${queryText || report.query_summary || '-'}\n\n---\n\n`;
                    const blob = new Blob([
                        header + report.markdown_report
                    ], {
                        type: 'text/markdown'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${reportId}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                };
                const handleExportPDF = ()=>{
                    window.print();
                };
                const handleExportWord = async ()=>{
                    if (!report) return;
                    const hide = message.loading('正在生成 Word 文档...', 0);
                    try {
                        const resp = await fetch('/api/v1/risk/reports/export-docx', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                report,
                                reportId,
                                queryText: queryText || report.query_summary || '-'
                            })
                        });
                        if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
                        const blob = await resp.blob();
                        if (blob.type.includes('application/json')) {
                            const text = await blob.text();
                            throw new Error(text || '导出失败');
                        }
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${reportId}.docx`;
                        a.click();
                        URL.revokeObjectURL(url);
                        message.success('Word 文档已生成');
                    } catch (err) {
                        message.error((err === null || err === void 0 ? void 0 : err.message) || 'Word 导出失败');
                    } finally{
                        hide();
                    }
                };
                const scrollToSection = (key)=>{
                    const el = document.getElementById(`risk-section-${key}`);
                    el === null || el === void 0 || el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                };
                // ── Empty state ──
                if (!report && !isLoading && stages.length === 0) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                        description: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        color: '#475569',
                                        fontSize: 14,
                                        display: 'block'
                                    },
                                    children: "输入协同治理相关问题，生成协同治理报告"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 316,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        color: '#94A3B8',
                                        fontSize: 12
                                    },
                                    children: "任务规划 → 图谱检索 → 实体统计 → 群体发现 → 协同治理 → 合规匹配 → 报告生成"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 319,
                                    columnNumber: 15
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 315,
                            columnNumber: 13
                        }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 312,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 311,
                    columnNumber: 7
                }, this);
                const sortedPaths = (0, _react.useMemo)(()=>{
                    if (!(report === null || report === void 0 ? void 0 : report.risk_paths)) return [];
                    const order = {
                        high: 0,
                        medium: 1,
                        low: 2
                    };
                    return [
                        ...report.risk_paths
                    ].sort((a, b)=>(order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3));
                }, [
                    report
                ]);
                const displayedPaths = showAllPaths ? sortedPaths : sortedPaths.slice(0, 5);
                // Entity stats: priority → report.entity_stats → currentSubgraph.nodes → resolvedEntities → subgraph_summary
                const entityStats = report === null || report === void 0 ? void 0 : report.entity_stats;
                const totalEntities = (entityStats === null || entityStats === void 0 ? void 0 : entityStats.total_entities) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : (_currentSubgraph_nodes = currentSubgraph.nodes) === null || _currentSubgraph_nodes === void 0 ? void 0 : _currentSubgraph_nodes.length) || (resolvedEntities === null || resolvedEntities === void 0 ? void 0 : resolvedEntities.length) || (report === null || report === void 0 ? void 0 : (_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) || 0;
                const topEntities = (entityStats === null || entityStats === void 0 ? void 0 : entityStats.top_entities) || [];
                // Community info from new API (community_info) or fallback from community prop
                const communityInfo = report === null || report === void 0 ? void 0 : report.community_info;
                const communities = (communityInfo === null || communityInfo === void 0 ? void 0 : communityInfo.communities) || (community === null || community === void 0 ? void 0 : community.communities) || [];
                const seededCommunityData = {
                    ...community || {},
                    ...communityInfo || {}
                };
                const communitySubgraph = seededCommunityData.subgraph || currentSubgraph;
                const connectedCommunitySubgraph = seededCommunityData.connected_subgraph || seededCommunityData.connectedSubgraph || currentSubgraph;
                const seedNodes = seededCommunityData.seed_nodes || seededCommunityData.seedNodes || [];
                const mergedEntityCommunityMap = seededCommunityData.entity_community_map || seededCommunityData.entityCommunityMap || entityCommunityMap || (report === null || report === void 0 ? void 0 : report.entity_community_map);
                const subgraphCounts = getGraphCounts(communitySubgraph);
                const connectedSubgraphCounts = getGraphCounts(connectedCommunitySubgraph);
                const communityAlgorithm = seededCommunityData.algorithm || seededCommunityData.selected_method || seededCommunityData.method;
                const riskSubjects = (0, _react.useMemo)(()=>{
                    const seen = new Set();
                    const subjects = [];
                    const add = (name, type, id, source = '识别')=>{
                        const cleanName = String(name || '').trim();
                        if (!cleanName || seen.has(cleanName)) return;
                        seen.add(cleanName);
                        subjects.push({
                            id: id || cleanName,
                            name: cleanName,
                            type: type || inferClientEntityType(cleanName),
                            source
                        });
                    };
                    (resolvedEntities || []).forEach((entity)=>{
                        add(entity.name || entity.raw || entity.canonical_name, entity.type || entity.label, entity.kg_node_id || entity.id, '实体对齐');
                    });
                    topEntities.forEach((entity)=>add(entity.name, entity.type, entity.id, '图谱统计'));
                    sortedEntities.forEach(([name])=>add(name, inferClientEntityType(name), name, '风险涉及'));
                    ((currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.nodes) || []).forEach((node)=>{
                        var _node_properties, _node_labels;
                        add(node.name || ((_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.name) || node.id, node.type || node.label || ((_node_labels = node.labels) === null || _node_labels === void 0 ? void 0 : _node_labels[0]), node.id, '子图');
                    });
                    return subjects.slice(0, 12);
                }, [
                    resolvedEntities,
                    topEntities,
                    sortedEntities,
                    currentSubgraph
                ]);
                const seedFlowNodes = (0, _react.useMemo)(()=>{
                    const normalized = (Array.isArray(seedNodes) ? seedNodes : []).map((node)=>({
                            id: String(node.id || node.kg_node_id || getNodeDisplayName(node)),
                            name: getNodeDisplayName(node),
                            type: getNodeDisplayType(node)
                        })).filter((node)=>node.name);
                    if (normalized.length > 0) return normalized.slice(0, 6);
                    return riskSubjects.slice(0, 6);
                }, [
                    seedNodes,
                    riskSubjects
                ]);
                const communityIdByNode = (0, _react.useMemo)(()=>{
                    var _this;
                    const map = new Map();
                    const entityEntries = ((_this = mergedEntityCommunityMap) === null || _this === void 0 ? void 0 : _this.entities) || [];
                    entityEntries.forEach((entry)=>{
                        var _entry_communities_, _entry_communities;
                        const communityId = entry === null || entry === void 0 ? void 0 : (_entry_communities = entry.communities) === null || _entry_communities === void 0 ? void 0 : (_entry_communities_ = _entry_communities[0]) === null || _entry_communities_ === void 0 ? void 0 : _entry_communities_.community_id;
                        if (communityId === undefined || communityId === null) return;
                        [
                            entry.id,
                            entry.name
                        ].filter(Boolean).forEach((key)=>map.set(String(key), Number(communityId)));
                    });
                    communities.forEach((comm)=>{
                        const communityId = Number(comm.community_id ?? comm.id ?? 0);
                        (comm.member_ids || []).forEach((id)=>map.set(String(id), communityId));
                        (comm.members || []).forEach((member)=>{
                            [
                                member.id,
                                member.name
                            ].filter(Boolean).forEach((key)=>map.set(String(key), communityId));
                        });
                        (comm.top_entities || comm.core_nodes || []).forEach((member)=>{
                            [
                                member.id,
                                member.name
                            ].filter(Boolean).forEach((key)=>map.set(String(key), communityId));
                        });
                    });
                    return map;
                }, [
                    mergedEntityCommunityMap,
                    communities
                ]);
                const communityPreviewGraph = (0, _react.useMemo)(()=>{
                    const graphNodes = (connectedCommunitySubgraph === null || connectedCommunitySubgraph === void 0 ? void 0 : connectedCommunitySubgraph.nodes) || (communitySubgraph === null || communitySubgraph === void 0 ? void 0 : communitySubgraph.nodes) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.nodes) || [];
                    const graphEdges = (connectedCommunitySubgraph === null || connectedCommunitySubgraph === void 0 ? void 0 : connectedCommunitySubgraph.edges) || (communitySubgraph === null || communitySubgraph === void 0 ? void 0 : communitySubgraph.edges) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.edges) || [];
                    const nodes = graphNodes.slice(0, 38).map((node, index)=>{
                        const id = String(node.id || getNodeDisplayName(node) || index);
                        const name = getNodeDisplayName(node) || id;
                        return {
                            id,
                            name,
                            type: getNodeDisplayType(node),
                            communityId: communityIdByNode.get(id) ?? communityIdByNode.get(name),
                            isSeed: seedFlowNodes.some((seed)=>seed.id === id || seed.name === name),
                            x: 50,
                            y: 50
                        };
                    });
                    const centers = [
                        {
                            x: 28,
                            y: 36
                        },
                        {
                            x: 66,
                            y: 34
                        },
                        {
                            x: 36,
                            y: 68
                        },
                        {
                            x: 72,
                            y: 68
                        },
                        {
                            x: 50,
                            y: 50
                        },
                        {
                            x: 18,
                            y: 58
                        }
                    ];
                    const grouped = new Map();
                    nodes.forEach((node)=>{
                        const key = node.communityId !== undefined ? String(node.communityId) : 'unknown';
                        grouped.set(key, [
                            ...grouped.get(key) || [],
                            node
                        ]);
                    });
                    Array.from(grouped.entries()).forEach(([key, group], groupIndex)=>{
                        const center = centers[groupIndex % centers.length];
                        const radius = group.length <= 1 ? 0 : Math.min(17, 8 + group.length * 1.4);
                        group.forEach((node, index)=>{
                            const angle = Math.PI * 2 * index / Math.max(group.length, 1) - Math.PI / 2;
                            node.x = Math.max(6, Math.min(94, center.x + Math.cos(angle) * radius));
                            node.y = Math.max(10, Math.min(90, center.y + Math.sin(angle) * radius));
                            if (key === 'unknown') {
                                node.x = 14 + index * 23 % 72;
                                node.y = 18 + index * 31 % 62;
                            }
                        });
                    });
                    nodes.forEach((node)=>{
                        const moved = communityNodePositions[node.id];
                        if (moved) {
                            node.x = moved.x;
                            node.y = moved.y;
                        }
                    });
                    const nodeById = new Map(nodes.map((node)=>[
                            node.id,
                            node
                        ]));
                    const nodeByName = new Map(nodes.map((node)=>[
                            node.name,
                            node
                        ]));
                    const edges = graphEdges.map((edge)=>{
                        const sourceKey = getEdgeEndpoint(edge, 'source');
                        const targetKey = getEdgeEndpoint(edge, 'target');
                        const source = nodeById.get(sourceKey) || nodeByName.get(sourceKey);
                        const target = nodeById.get(targetKey) || nodeByName.get(targetKey);
                        if (!source || !target || source.id === target.id) return null;
                        return {
                            id: edge.id || `${source.id}-${target.id}`,
                            source,
                            target,
                            relation: edge.relation || edge.type || edge.label || ''
                        };
                    }).filter(Boolean).slice(0, 90);
                    return {
                        nodes,
                        edges,
                        groups: Array.from(grouped.entries())
                    };
                }, [
                    connectedCommunitySubgraph,
                    communitySubgraph,
                    currentSubgraph,
                    communityIdByNode,
                    seedFlowNodes,
                    communityNodePositions
                ]);
                const getCommunitySvgPoint = (0, _react.useCallback)((event)=>{
                    const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : event.currentTarget.ownerSVGElement;
                    const rect = svg === null || svg === void 0 ? void 0 : svg.getBoundingClientRect();
                    if (!rect || rect.width === 0 || rect.height === 0) return {
                        x: 50,
                        y: 50
                    };
                    return {
                        x: Math.max(4, Math.min(96, (event.clientX - rect.left) / rect.width * 100)),
                        y: Math.max(8, Math.min(92, (event.clientY - rect.top) / rect.height * 100))
                    };
                }, []);
                const handleCommunityNodePointerDown = (0, _react.useCallback)((event, nodeId)=>{
                    var _event_currentTarget_setPointerCapture, _event_currentTarget;
                    event.preventDefault();
                    event.stopPropagation();
                    (_event_currentTarget_setPointerCapture = (_event_currentTarget = event.currentTarget).setPointerCapture) === null || _event_currentTarget_setPointerCapture === void 0 || _event_currentTarget_setPointerCapture.call(_event_currentTarget, event.pointerId);
                    setDraggingCommunityNodeId(nodeId);
                    const point = getCommunitySvgPoint(event);
                    setCommunityNodePositions((prev)=>({
                            ...prev,
                            [nodeId]: point
                        }));
                }, [
                    getCommunitySvgPoint
                ]);
                const handleCommunityGraphPointerMove = (0, _react.useCallback)((event)=>{
                    if (!draggingCommunityNodeId) return;
                    const point = getCommunitySvgPoint(event);
                    setCommunityNodePositions((prev)=>({
                            ...prev,
                            [draggingCommunityNodeId]: point
                        }));
                }, [
                    draggingCommunityNodeId,
                    getCommunitySvgPoint
                ]);
                const stopCommunityGraphDrag = (0, _react.useCallback)(()=>{
                    setDraggingCommunityNodeId(null);
                }, []);
                const flowKeys = Array.isArray((_seededCommunityData_visualization = seededCommunityData.visualization) === null || _seededCommunityData_visualization === void 0 ? void 0 : _seededCommunityData_visualization.flow) ? seededCommunityData.visualization.flow : [
                    'seed_nodes',
                    'subgraph',
                    'connected_subgraph',
                    'communities'
                ];
                const flowLabelMap = {
                    seed_nodes: '种子节点',
                    n_hop_network: 'N 跳子图',
                    subgraph: 'N 跳子图',
                    connected_subgraph: '最大连通子图',
                    communities: '群体结果'
                };
                const flowCards = [
                    {
                        key: 'seed_nodes',
                        title: flowLabelMap[flowKeys[0]] || '种子节点',
                        value: seedFlowNodes.length,
                        desc: '风险主体输入'
                    },
                    {
                        key: 'subgraph',
                        title: flowLabelMap[flowKeys[1]] || 'N 跳子图',
                        value: subgraphCounts.nodes,
                        desc: `${subgraphCounts.edges} 条关系`
                    },
                    {
                        key: 'connected_subgraph',
                        title: flowLabelMap[flowKeys[2]] || '最大连通子图',
                        value: connectedSubgraphCounts.nodes,
                        desc: `${connectedSubgraphCounts.edges} 条关系`
                    },
                    {
                        key: 'communities',
                        title: flowLabelMap[flowKeys[3]] || '群体结果',
                        value: communities.length,
                        desc: '社区划分'
                    }
                ];
                const compactSeedNames = seedFlowNodes.slice(0, 3).map((node)=>node.name);
                const visibleCommunities = communities.slice(0, 6);
                const riskTransmissionGraph = (0, _react.useMemo)(()=>{
                    const levelOrder = {
                        high: 0,
                        medium: 1,
                        low: 2
                    };
                    const communityNodes = new Map();
                    const communityEdges = new Map();
                    communities.forEach((comm)=>{
                        const cid = Number(comm.community_id ?? comm.id ?? 0);
                        const members = comm.members || comm.top_entities || [];
                        communityNodes.set(cid, {
                            id: cid,
                            size: Number(comm.size || members.length || 0),
                            label: `群体 #${cid}`,
                            pathCount: 0,
                            highCount: 0,
                            mediumCount: 0,
                            sampleEntities: members.slice(0, 3).map((m)=>m.name || String(m.id || '')),
                            x: 50,
                            y: 50
                        });
                    });
                    const pathRows = sortedPaths.map((path)=>{
                        const entitySteps = (path.affected_entities || []).map((name)=>{
                            const cid = communityIdByNode.get(name);
                            return {
                                name,
                                type: inferClientEntityType(name),
                                communityId: cid
                            };
                        });
                        const communitySequence = entitySteps.map((step)=>step.communityId).filter((cid)=>cid !== undefined && cid !== null).filter((cid, index, arr)=>index === 0 || cid !== arr[index - 1]);
                        communitySequence.forEach((cid)=>{
                            const node = communityNodes.get(cid) || {
                                id: cid,
                                size: 0,
                                label: `群体 #${cid}`,
                                pathCount: 0,
                                highCount: 0,
                                mediumCount: 0,
                                sampleEntities: [],
                                x: 50,
                                y: 50
                            };
                            node.pathCount += 1;
                            if (path.risk_level === 'high') node.highCount += 1;
                            if (path.risk_level === 'medium') node.mediumCount += 1;
                            communityNodes.set(cid, node);
                        });
                        for(let i = 0; i < communitySequence.length - 1; i += 1){
                            const source = communitySequence[i];
                            const target = communitySequence[i + 1];
                            const key = `${source}->${target}`;
                            const current = communityEdges.get(key) || {
                                source,
                                target,
                                count: 0,
                                level: path.risk_level,
                                pathIds: []
                            };
                            current.count += 1;
                            current.pathIds.push(path.path_id);
                            if ((levelOrder[path.risk_level] ?? 3) < (levelOrder[current.level] ?? 3)) current.level = path.risk_level;
                            communityEdges.set(key, current);
                        }
                        return {
                            path,
                            entitySteps,
                            communitySequence
                        };
                    });
                    const nodes = Array.from(communityNodes.values()).filter((node)=>node.pathCount > 0 || communities.length <= 6).slice(0, 10);
                    const centerX = 50;
                    const centerY = 48;
                    const radius = nodes.length <= 3 ? 26 : 34;
                    nodes.forEach((node, index)=>{
                        const angle = nodes.length === 1 ? -Math.PI / 2 : Math.PI * 2 * index / nodes.length - Math.PI / 2;
                        node.x = nodes.length === 1 ? centerX : centerX + Math.cos(angle) * radius;
                        node.y = nodes.length === 1 ? centerY : centerY + Math.sin(angle) * Math.min(radius, 28);
                    });
                    const nodeSet = new Set(nodes.map((node)=>node.id));
                    const edges = Array.from(communityEdges.values()).filter((edge)=>nodeSet.has(edge.source) && nodeSet.has(edge.target));
                    return {
                        nodes,
                        edges,
                        pathRows
                    };
                }, [
                    sortedPaths,
                    communities,
                    communityIdByNode
                ]);
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    className: "risk-report-panel",
                    style: {
                        height: '100%',
                        overflow: 'auto',
                        padding: '12px 16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                            children: `
        @media print {
          body * { visibility: hidden; }
          .risk-report-panel, .risk-report-panel * { visibility: visible; }
          .risk-report-panel { position: absolute; left: 0; top: 0; width: 100%; padding: 20px 40px !important; }
          .no-print { display: none !important; }
        }
        @keyframes sectionHighlight {
          0%, 100% { border-color: #e2e8f0; }
          50% { border-color: #2855D1; box-shadow: 0 0 12px rgba(40,85,209,0.15); }
        }
      `
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 649,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12
                            },
                            children: [
                                isLoading && stages.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8
                                    },
                                    className: "no-print",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Steps, {
                                            size: "small",
                                            current: activeStep,
                                            status: error ? 'error' : 'process',
                                            items: stageOrder.map((key)=>({
                                                    title: STAGE_LABELS[key] || key
                                                }))
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 666,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                marginTop: 8,
                                                textAlign: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                type: "secondary",
                                                style: {
                                                    fontSize: 12
                                                },
                                                children: ((_stages_ = stages[stages.length - 1]) === null || _stages_ === void 0 ? void 0 : _stages_.content) || '初始化中...'
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 675,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 674,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 665,
                                    columnNumber: 11
                                }, this),
                                isLoading && !report && stages.length === 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    style: {
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: 200
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                                size: "large"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 686,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    marginTop: 16,
                                                    color: '#94a3b8',
                                                    fontSize: 14
                                                },
                                                children: "正在初始化协同治理流程..."
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 687,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 685,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 684,
                                    columnNumber: 11
                                }, this),
                                error && !report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    style: {
                                        borderRadius: 8
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: 24
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                type: "danger",
                                                style: {
                                                    fontSize: 14,
                                                    display: 'block',
                                                    marginBottom: 12
                                                },
                                                children: [
                                                    "协同治理分析失败: ",
                                                    error
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 698,
                                                columnNumber: 15
                                            }, this),
                                            onRetry && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 702,
                                                    columnNumber: 31
                                                }, void 0),
                                                onClick: onRetry,
                                                children: "重试"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 702,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 697,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 696,
                                    columnNumber: 11
                                }, this),
                                report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            style: {
                                                borderRadius: 8
                                            },
                                            className: "no-print",
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 10
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        width: 36,
                                                                        height: 36,
                                                                        borderRadius: 8,
                                                                        background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 700,
                                                                        fontSize: 16,
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "W"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 714,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                                                            level: 5,
                                                                            style: {
                                                                                margin: 0,
                                                                                fontSize: 15
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                                    style: {
                                                                                        marginRight: 6,
                                                                                        color: '#FFC101'
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 733,
                                                                                    columnNumber: 23
                                                                                }, this),
                                                                                "协同治理报告"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 732,
                                                                            columnNumber: 21
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            type: "secondary",
                                                                            style: {
                                                                                fontSize: 11
                                                                            },
                                                                            children: [
                                                                                reportId,
                                                                                " · ",
                                                                                formatTimestamp(report.generated_at)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 736,
                                                                            columnNumber: 21
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 731,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 713,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                    title: "历史报告",
                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.HistoryOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 743,
                                                                            columnNumber: 48
                                                                        }, void 0),
                                                                        onClick: loadHistory
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 743,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 742,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                    title: "导出 Markdown",
                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileMarkdownOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 746,
                                                                            columnNumber: 48
                                                                        }, void 0),
                                                                        onClick: handleExportMD
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 746,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 745,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                    title: "导出 Word",
                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileWordOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 749,
                                                                            columnNumber: 48
                                                                        }, void 0),
                                                                        onClick: handleExportWord
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 749,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 748,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                    title: "导出 PDF",
                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FilePdfOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 752,
                                                                            columnNumber: 48
                                                                        }, void 0),
                                                                        onClick: handleExportPDF
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 752,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 751,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 741,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 712,
                                                    columnNumber: 15
                                                }, this),
                                                queryText && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        marginTop: 6,
                                                        padding: '4px 10px',
                                                        background: '#f8fafc',
                                                        borderRadius: 6
                                                    },
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 11
                                                        },
                                                        children: [
                                                            "查询: ",
                                                            queryText
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 758,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 757,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        marginTop: 12,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        {
                                                            key: 'entity-stats',
                                                            label: '风险主体',
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.TeamOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 765,
                                                                columnNumber: 63
                                                            }, this),
                                                            color: '#2855D1'
                                                        },
                                                        {
                                                            key: 'community',
                                                            label: '群体发现',
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 766,
                                                                columnNumber: 60
                                                            }, this),
                                                            color: '#722ed1'
                                                        },
                                                        {
                                                            key: 'risk-paths',
                                                            label: '风险传导路径',
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 767,
                                                                columnNumber: 63
                                                            }, this),
                                                            color: '#f5222d'
                                                        },
                                                        {
                                                            key: 'final-report',
                                                            label: '协同治理社区报告',
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 67
                                                            }, this),
                                                            color: '#0f766e'
                                                        }
                                                    ].map((step, idx, arr)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                    size: "small",
                                                                    type: "text",
                                                                    icon: step.icon,
                                                                    onClick: ()=>scrollToSection(step.key),
                                                                    style: {
                                                                        color: step.color,
                                                                        padding: '0 6px',
                                                                        height: 24
                                                                    },
                                                                    children: step.label
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 771,
                                                                    columnNumber: 21
                                                                }, this),
                                                                idx < arr.length - 1 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 12
                                                                    },
                                                                    children: "→"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 780,
                                                                    columnNumber: 46
                                                                }, this)
                                                            ]
                                                        }, step.key, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 770,
                                                            columnNumber: 19
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 711,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            id: "risk-section-entity-stats",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    borderRadius: 8,
                                                    ...highlightSection === 'entity-stats' ? {
                                                        animation: 'sectionHighlight 1s ease-in-out 2'
                                                    } : {}
                                                },
                                                title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.TeamOutlined, {
                                                            style: {
                                                                marginRight: 8,
                                                                color: '#2855D1'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 796,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        "风险主体",
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            style: {
                                                                marginLeft: 8,
                                                                fontSize: 10
                                                            },
                                                            children: [
                                                                riskSubjects.length || totalEntities,
                                                                " 个主体"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 798,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 795,
                                                    columnNumber: 19
                                                }, void 0),
                                                children: riskSubjects.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 6,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: riskSubjects.map((entity)=>{
                                                        const color = _graphStyles.NODE_TYPE_COLORS[entity.type] || '#2855D1';
                                                        const label = _graphStyles.NODE_TYPE_LABELS[entity.type] || entity.type;
                                                        return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            style: {
                                                                margin: 0,
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                padding: '4px 8px',
                                                                cursor: onJumpToGraph ? 'pointer' : 'default',
                                                                background: `${color}10`,
                                                                border: `1px solid ${color}40`,
                                                                color
                                                            },
                                                            onClick: ()=>onJumpToGraph === null || onJumpToGraph === void 0 ? void 0 : onJumpToGraph(entity.id, entity.name, entity.type),
                                                            children: [
                                                                onJumpToGraph ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LinkOutlined, {
                                                                    style: {
                                                                        marginRight: 4,
                                                                        fontSize: 10
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 822,
                                                                    columnNumber: 44
                                                                }, this) : null,
                                                                entity.name,
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                    style: {
                                                                        color: '#94a3b8',
                                                                        marginLeft: 6,
                                                                        fontSize: 10
                                                                    },
                                                                    children: label
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 824,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, entity.id, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 808,
                                                            columnNumber: 25
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 803,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: isLoading ? '风险主体识别中...' : '暂无可展示的风险主体'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 830,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 788,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 787,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            id: "risk-section-community",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    borderRadius: 8,
                                                    ...highlightSection === 'community' ? {
                                                        animation: 'sectionHighlight 1s ease-in-out 2'
                                                    } : {}
                                                },
                                                title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {
                                                            style: {
                                                                marginRight: 8,
                                                                color: '#722ed1'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 847,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        "群体发现",
                                                        communities.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            style: {
                                                                marginLeft: 8,
                                                                fontSize: 10
                                                            },
                                                            children: [
                                                                communities.length,
                                                                " 个群体"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 850,
                                                            columnNumber: 23
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 846,
                                                    columnNumber: 19
                                                }, void 0),
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                overflowX: 'auto',
                                                                paddingBottom: 2
                                                            },
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'repeat(4, minmax(132px, 1fr))',
                                                                    gap: 8,
                                                                    minWidth: 560
                                                                },
                                                                children: flowCards.map((item, index)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            height: 72,
                                                                            padding: '10px 12px',
                                                                            borderRadius: 8,
                                                                            border: '1px solid #e2e8f0',
                                                                            background: index === 3 ? '#f5f3ff' : '#f8fafc'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                type: "secondary",
                                                                                style: {
                                                                                    fontSize: 11,
                                                                                    display: 'block'
                                                                                },
                                                                                children: item.title
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 869,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                strong: true,
                                                                                style: {
                                                                                    fontSize: 22,
                                                                                    color: index === 3 ? '#722ed1' : '#0f172a',
                                                                                    lineHeight: '28px'
                                                                                },
                                                                                children: item.value
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 870,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                type: "secondary",
                                                                                style: {
                                                                                    fontSize: 10,
                                                                                    display: 'block'
                                                                                },
                                                                                children: item.desc
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 873,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, item.title, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 859,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 857,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 856,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                gap: 10,
                                                                flexWrap: 'wrap',
                                                                padding: '8px 10px',
                                                                borderRadius: 8,
                                                                background: '#f8fafc',
                                                                border: '1px solid #e2e8f0'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 6,
                                                                        flexWrap: 'wrap',
                                                                        minWidth: 0
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                            style: {
                                                                                margin: 0,
                                                                                borderRadius: 6,
                                                                                color: '#b45309',
                                                                                background: '#fffbeb',
                                                                                borderColor: '#fde68a'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                                    style: {
                                                                                        marginRight: 4
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 894,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                "风险主体种子 ",
                                                                                seedFlowNodes.length,
                                                                                " 个"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 893,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        compactSeedNames.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            type: "secondary",
                                                                            style: {
                                                                                fontSize: 11
                                                                            },
                                                                            children: [
                                                                                compactSeedNames.join('、'),
                                                                                seedFlowNodes.length > compactSeedNames.length ? ` 等 ${seedFlowNodes.length} 个` : ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 898,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 892,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8,
                                                                        flexWrap: 'wrap'
                                                                    },
                                                                    children: [
                                                                        visibleCommunities.map((comm)=>{
                                                                            const cid = Number(comm.community_id ?? comm.id ?? 0);
                                                                            const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                                                                            const members = comm.members || comm.top_entities || [];
                                                                            const density = typeof comm.density === 'number' ? ` / 密度 ${comm.density.toFixed(2)}` : '';
                                                                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 5,
                                                                                    fontSize: 11,
                                                                                    color: '#475569'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                        style: {
                                                                                            width: 9,
                                                                                            height: 9,
                                                                                            borderRadius: '50%',
                                                                                            background: color,
                                                                                            boxShadow: `0 0 0 3px ${color}18`
                                                                                        }
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 911,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    "群体 #",
                                                                                    cid,
                                                                                    " · ",
                                                                                    comm.size || members.length,
                                                                                    " 成员",
                                                                                    density
                                                                                ]
                                                                            }, cid, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 910,
                                                                                columnNumber: 27
                                                                            }, this);
                                                                        }),
                                                                        communities.length > visibleCommunities.length && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            type: "secondary",
                                                                            style: {
                                                                                fontSize: 11
                                                                            },
                                                                            children: [
                                                                                "+",
                                                                                communities.length - visibleCommunities.length,
                                                                                " 个群体"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 917,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 903,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 879,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                minHeight: 430,
                                                                borderRadius: 8,
                                                                border: '1px solid #e2e8f0',
                                                                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                                                                padding: 14,
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        marginBottom: 8
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                    strong: true,
                                                                                    style: {
                                                                                        fontSize: 14,
                                                                                        display: 'block'
                                                                                    },
                                                                                    children: "群体发现子图"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 935,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                    type: "secondary",
                                                                                    style: {
                                                                                        fontSize: 10
                                                                                    },
                                                                                    children: [
                                                                                        connectedSubgraphCounts.nodes || subgraphCounts.nodes,
                                                                                        " 节点 / ",
                                                                                        connectedSubgraphCounts.edges || subgraphCounts.edges,
                                                                                        " 关系",
                                                                                        communityPreviewGraph.nodes.length < (connectedSubgraphCounts.nodes || subgraphCounts.nodes) && ` · 当前展示前 ${communityPreviewGraph.nodes.length} 个代表节点`
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 936,
                                                                                    columnNumber: 25
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 934,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                                            size: 6,
                                                                            children: [
                                                                                communityAlgorithm && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                    style: {
                                                                                        fontSize: 10,
                                                                                        margin: 0
                                                                                    },
                                                                                    children: [
                                                                                        "算法: ",
                                                                                        communityAlgorithm
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 942,
                                                                                    columnNumber: 48
                                                                                }, this),
                                                                                Object.keys(communityNodePositions).length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                                    size: "small",
                                                                                    type: "text",
                                                                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 947,
                                                                                        columnNumber: 35
                                                                                    }, void 0),
                                                                                    onClick: ()=>{
                                                                                        setCommunityNodePositions({});
                                                                                        setDraggingCommunityNodeId(null);
                                                                                    },
                                                                                    style: {
                                                                                        fontSize: 11,
                                                                                        height: 24,
                                                                                        padding: '0 6px'
                                                                                    },
                                                                                    children: "重置布局"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 944,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 941,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 933,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        position: 'relative',
                                                                        height: 360,
                                                                        borderRadius: 8,
                                                                        background: '#ffffff',
                                                                        border: '1px solid #dbeafe',
                                                                        overflow: 'hidden'
                                                                    },
                                                                    children: communityPreviewGraph.nodes.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                        viewBox: "0 0 100 100",
                                                                        preserveAspectRatio: "none",
                                                                        onPointerMove: handleCommunityGraphPointerMove,
                                                                        onPointerUp: stopCommunityGraphDrag,
                                                                        onPointerLeave: stopCommunityGraphDrag,
                                                                        style: {
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            display: 'block',
                                                                            cursor: draggingCommunityNodeId ? 'grabbing' : 'default',
                                                                            touchAction: 'none'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("defs", {
                                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("filter", {
                                                                                    id: "communityNodeShadow",
                                                                                    x: "-50%",
                                                                                    y: "-50%",
                                                                                    width: "200%",
                                                                                    height: "200%",
                                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("feDropShadow", {
                                                                                        dx: "0",
                                                                                        dy: "1",
                                                                                        stdDeviation: "1.2",
                                                                                        floodColor: "#0f172a",
                                                                                        floodOpacity: "0.18"
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 977,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 976,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 975,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            communityPreviewGraph.groups.map(([groupKey, groupNodes], groupIndex)=>{
                                                                                if (groupKey === 'unknown' || !groupNodes.length) return null;
                                                                                const color = COMMUNITY_PALETTE[Number(groupKey) % COMMUNITY_PALETTE.length];
                                                                                const avgX = groupNodes.reduce((sum, node)=>sum + node.x, 0) / groupNodes.length;
                                                                                const avgY = groupNodes.reduce((sum, node)=>sum + node.y, 0) / groupNodes.length;
                                                                                const radius = Math.min(28, Math.max(12, 7 + groupNodes.length * 1.8));
                                                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                    cx: avgX,
                                                                                    cy: avgY,
                                                                                    r: radius,
                                                                                    fill: `${color}10`,
                                                                                    stroke: `${color}35`,
                                                                                    strokeWidth: "0.5",
                                                                                    strokeDasharray: "2 1.5"
                                                                                }, groupKey, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 987,
                                                                                    columnNumber: 31
                                                                                }, this);
                                                                            }),
                                                                            communityPreviewGraph.edges.map((edge, index)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("line", {
                                                                                    x1: edge.source.x,
                                                                                    y1: edge.source.y,
                                                                                    x2: edge.target.x,
                                                                                    y2: edge.target.y,
                                                                                    stroke: "#94a3b8",
                                                                                    strokeWidth: "0.42",
                                                                                    strokeOpacity: "0.55",
                                                                                    vectorEffect: "non-scaling-stroke",
                                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                        children: edge.relation || '关系'
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1011,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                }, `${edge.id}-${index}`, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1000,
                                                                                    columnNumber: 29
                                                                                }, this)),
                                                                            communityPreviewGraph.nodes.map((node, index)=>{
                                                                                const color = node.communityId !== undefined ? COMMUNITY_PALETTE[node.communityId % COMMUNITY_PALETTE.length] : _graphStyles.NODE_TYPE_COLORS[node.type] || '#64748b';
                                                                                const showLabel = hoveredCommunityNodeId === node.id || draggingCommunityNodeId === node.id;
                                                                                const label = node.name.length > 14 ? `${node.name.slice(0, 13)}...` : node.name;
                                                                                const labelWidth = Math.max(18, Math.min(46, label.length * 3.1 + 6));
                                                                                const labelX = Math.min(96 - labelWidth, Math.max(4, node.x + 2.8));
                                                                                const labelY = Math.max(6, node.y - 6.2);
                                                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("g", {
                                                                                    onPointerDown: (event)=>handleCommunityNodePointerDown(event, node.id),
                                                                                    onPointerUp: stopCommunityGraphDrag,
                                                                                    onPointerEnter: ()=>setHoveredCommunityNodeId(node.id),
                                                                                    onPointerLeave: ()=>setHoveredCommunityNodeId((current)=>current === node.id ? null : current),
                                                                                    style: {
                                                                                        cursor: draggingCommunityNodeId === node.id ? 'grabbing' : 'grab'
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                            children: `${node.name}${node.communityId !== undefined ? ` / 群体 #${node.communityId}` : ''}`
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1032,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        node.isSeed && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                            cx: node.x,
                                                                                            cy: node.y,
                                                                                            r: "2.7",
                                                                                            fill: "none",
                                                                                            stroke: "#f59e0b",
                                                                                            strokeWidth: "1",
                                                                                            vectorEffect: "non-scaling-stroke"
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1034,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                            cx: node.x,
                                                                                            cy: node.y,
                                                                                            r: node.isSeed ? 1.85 : 1.45,
                                                                                            fill: color,
                                                                                            stroke: "#ffffff",
                                                                                            strokeWidth: "0.7",
                                                                                            filter: "url(#communityNodeShadow)",
                                                                                            vectorEffect: "non-scaling-stroke"
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1044,
                                                                                            columnNumber: 33
                                                                                        }, this),
                                                                                        showLabel && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("g", {
                                                                                            style: {
                                                                                                pointerEvents: 'none'
                                                                                            },
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("rect", {
                                                                                                    x: labelX,
                                                                                                    y: labelY,
                                                                                                    width: labelWidth,
                                                                                                    height: "7.2",
                                                                                                    rx: "1.8",
                                                                                                    fill: "#ffffff",
                                                                                                    stroke: `${color}55`,
                                                                                                    strokeWidth: "0.45",
                                                                                                    vectorEffect: "non-scaling-stroke"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                    lineNumber: 1056,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                                    x: labelX + 3,
                                                                                                    y: labelY + 4.9,
                                                                                                    fontSize: "2.65",
                                                                                                    fill: "#334155",
                                                                                                    children: label
                                                                                                }, void 0, false, {
                                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                    lineNumber: 1067,
                                                                                                    columnNumber: 37
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1055,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, `${node.id}-${index}`, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1024,
                                                                                    columnNumber: 31
                                                                                }, this);
                                                                            })
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 961,
                                                                        columnNumber: 25
                                                                    }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            height: '100%',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        },
                                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            type: "secondary",
                                                                            style: {
                                                                                fontSize: 12
                                                                            },
                                                                            children: "等待子图数据"
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1083,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1082,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 959,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        gap: 10,
                                                                        flexWrap: 'wrap',
                                                                        marginTop: 10,
                                                                        alignItems: 'center'
                                                                    },
                                                                    children: [
                                                                        seedFlowNodes.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                            style: {
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: 5,
                                                                                fontSize: 11,
                                                                                color: '#475569'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                    style: {
                                                                                        width: 10,
                                                                                        height: 10,
                                                                                        borderRadius: '50%',
                                                                                        background: '#2563eb',
                                                                                        border: '2px solid #f59e0b'
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1090,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "种子节点"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1089,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            type: "secondary",
                                                                            style: {
                                                                                fontSize: 11
                                                                            },
                                                                            children: "节点可拖拽调整位置，悬浮显示名称；大规模子图默认抽样展示，避免成员列表刷屏。"
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1094,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1087,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 922,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 839,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 838,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            id: "risk-section-risk-paths",
                                            children: sortedPaths.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    borderRadius: 8,
                                                    ...highlightSection === 'risk-paths' ? {
                                                        animation: 'sectionHighlight 1s ease-in-out 2'
                                                    } : {}
                                                },
                                                title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                                            style: {
                                                                marginRight: 8,
                                                                color: '#f5222d'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1114,
                                                            columnNumber: 23
                                                        }, void 0),
                                                        "风险传导路径 (",
                                                        sortedPaths.length,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1113,
                                                    columnNumber: 21
                                                }, void 0),
                                                extra: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                    size: 4,
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: "error",
                                                            style: {
                                                                fontSize: 10,
                                                                borderRadius: 4
                                                            },
                                                            children: [
                                                                "高风险 ",
                                                                highCount
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1120,
                                                            columnNumber: 23
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: "warning",
                                                            style: {
                                                                fontSize: 10,
                                                                borderRadius: 4
                                                            },
                                                            children: [
                                                                "中风险 ",
                                                                mediumCount
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1121,
                                                            columnNumber: 23
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: "success",
                                                            style: {
                                                                fontSize: 10,
                                                                borderRadius: 4
                                                            },
                                                            children: [
                                                                "低风险 ",
                                                                lowCount
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1122,
                                                            columnNumber: 23
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1119,
                                                    columnNumber: 21
                                                }, void 0),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            gap: 10,
                                                            flexWrap: 'wrap',
                                                            marginBottom: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                                size: 0,
                                                                style: {
                                                                    padding: 2,
                                                                    borderRadius: 8,
                                                                    background: '#f1f5f9',
                                                                    border: '1px solid #e2e8f0'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        type: riskPathMode === 'community' ? 'primary' : 'text',
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1131,
                                                                            columnNumber: 31
                                                                        }, void 0),
                                                                        onClick: ()=>setRiskPathMode('community'),
                                                                        style: {
                                                                            borderRadius: 6,
                                                                            fontSize: 12
                                                                        },
                                                                        children: "群体间传导"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1128,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        type: riskPathMode === 'node' ? 'primary' : 'text',
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1140,
                                                                            columnNumber: 31
                                                                        }, void 0),
                                                                        onClick: ()=>setRiskPathMode('node'),
                                                                        style: {
                                                                            borderRadius: 6,
                                                                            fontSize: 12
                                                                        },
                                                                        children: "具体节点路径"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1137,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1127,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: "群体视图看社区之间的风险扩散，节点视图看每条路径的实体链路"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1147,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1126,
                                                        columnNumber: 19
                                                    }, this),
                                                    riskPathMode === 'community' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                                                            gap: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: 8,
                                                                    background: '#ffffff',
                                                                    overflow: 'hidden'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            padding: '10px 12px',
                                                                            borderBottom: '1px solid #e2e8f0',
                                                                            background: '#f8fafc'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                strong: true,
                                                                                style: {
                                                                                    fontSize: 13
                                                                                },
                                                                                children: "群体社区之间的关系"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1156,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                type: "secondary",
                                                                                style: {
                                                                                    fontSize: 11,
                                                                                    display: 'block'
                                                                                },
                                                                                children: [
                                                                                    riskTransmissionGraph.nodes.length,
                                                                                    " 个群体 / ",
                                                                                    riskTransmissionGraph.edges.length,
                                                                                    " 条传导关系"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1157,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1155,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            height: 260,
                                                                            position: 'relative'
                                                                        },
                                                                        children: riskTransmissionGraph.nodes.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                            viewBox: "0 0 100 100",
                                                                            preserveAspectRatio: "none",
                                                                            style: {
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                display: 'block'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("defs", {
                                                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("marker", {
                                                                                        id: "riskArrow",
                                                                                        markerWidth: "8",
                                                                                        markerHeight: "8",
                                                                                        refX: "7",
                                                                                        refY: "4",
                                                                                        orient: "auto",
                                                                                        markerUnits: "strokeWidth",
                                                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                                                                                            d: "M0,0 L8,4 L0,8 Z",
                                                                                            fill: "#64748b"
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1166,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1165,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1164,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                riskTransmissionGraph.edges.map((edge, index)=>{
                                                                                    const source = riskTransmissionGraph.nodes.find((node)=>node.id === edge.source);
                                                                                    const target = riskTransmissionGraph.nodes.find((node)=>node.id === edge.target);
                                                                                    if (!source || !target) return null;
                                                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("line", {
                                                                                        x1: source.x,
                                                                                        y1: source.y,
                                                                                        x2: target.x,
                                                                                        y2: target.y,
                                                                                        stroke: RISK_LEVEL_COLORS[edge.level] || '#64748b',
                                                                                        strokeWidth: Math.min(2.8, 0.8 + edge.count * 0.45),
                                                                                        strokeOpacity: "0.72",
                                                                                        markerEnd: "url(#riskArrow)",
                                                                                        vectorEffect: "non-scaling-stroke",
                                                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                            children: `${source.label} → ${target.label} / ${edge.count} 条路径`
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                            lineNumber: 1186,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    }, `${edge.source}-${edge.target}-${index}`, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1174,
                                                                                        columnNumber: 35
                                                                                    }, this);
                                                                                }),
                                                                                riskTransmissionGraph.nodes.map((node)=>{
                                                                                    const color = COMMUNITY_PALETTE[node.id % COMMUNITY_PALETTE.length];
                                                                                    const nodeRiskColor = node.highCount > 0 ? RISK_LEVEL_COLORS.high : node.mediumCount > 0 ? RISK_LEVEL_COLORS.medium : color;
                                                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("g", {
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                                children: `${node.label} / ${node.size} 成员 / ${node.pathCount} 条路径`
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1195,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                                cx: node.x,
                                                                                                cy: node.y,
                                                                                                r: "8.5",
                                                                                                fill: `${color}18`,
                                                                                                stroke: nodeRiskColor,
                                                                                                strokeWidth: "1.4",
                                                                                                vectorEffect: "non-scaling-stroke"
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1196,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                                cx: node.x,
                                                                                                cy: node.y,
                                                                                                r: "3.2",
                                                                                                fill: color,
                                                                                                stroke: "#ffffff",
                                                                                                strokeWidth: "0.8",
                                                                                                vectorEffect: "non-scaling-stroke"
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1197,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                                x: node.x,
                                                                                                y: node.y + 13,
                                                                                                textAnchor: "middle",
                                                                                                fontSize: "3.1",
                                                                                                fill: "#334155",
                                                                                                stroke: "#ffffff",
                                                                                                strokeWidth: "0.65",
                                                                                                paintOrder: "stroke",
                                                                                                children: node.label
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1198,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                                x: node.x,
                                                                                                y: node.y + 17,
                                                                                                textAnchor: "middle",
                                                                                                fontSize: "2.4",
                                                                                                fill: "#64748b",
                                                                                                stroke: "#ffffff",
                                                                                                strokeWidth: "0.5",
                                                                                                paintOrder: "stroke",
                                                                                                children: [
                                                                                                    node.size,
                                                                                                    " 成员"
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1201,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, node.id, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1194,
                                                                                        columnNumber: 35
                                                                                    }, this);
                                                                                })
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1163,
                                                                            columnNumber: 29
                                                                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                height: '100%',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            },
                                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                type: "secondary",
                                                                                style: {
                                                                                    fontSize: 12
                                                                                },
                                                                                children: "暂无可映射的群体传导关系"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1210,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1209,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1161,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1154,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 8
                                                                },
                                                                children: riskTransmissionGraph.pathRows.slice(0, showAllPaths ? riskTransmissionGraph.pathRows.length : 5).map(({ path, communitySequence })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            padding: '10px 12px',
                                                                            borderRadius: 8,
                                                                            background: '#f8fafc',
                                                                            border: '1px solid #e2e8f0'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 6,
                                                                                    marginBottom: 6,
                                                                                    flexWrap: 'wrap'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                        color: RISK_LEVEL_COLORS[path.risk_level],
                                                                                        style: {
                                                                                            fontSize: 10,
                                                                                            borderRadius: 4,
                                                                                            margin: 0
                                                                                        },
                                                                                        children: path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1220,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                        strong: true,
                                                                                        style: {
                                                                                            fontSize: 12
                                                                                        },
                                                                                        children: path.path_id
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1223,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    path.confidence !== undefined && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                        style: {
                                                                                            fontSize: 10,
                                                                                            borderRadius: 4,
                                                                                            margin: 0
                                                                                        },
                                                                                        children: [
                                                                                            (path.confidence * 100).toFixed(0),
                                                                                            "%"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1225,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1219,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 4,
                                                                                    flexWrap: 'wrap',
                                                                                    marginBottom: 6
                                                                                },
                                                                                children: communitySequence.length > 0 ? communitySequence.map((cid, idx)=>{
                                                                                    const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                                                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                                                        children: [
                                                                                            idx > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                                style: {
                                                                                                    color: '#94a3b8',
                                                                                                    fontSize: 11
                                                                                                },
                                                                                                children: "→"
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1233,
                                                                                                columnNumber: 49
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                                style: {
                                                                                                    margin: 0,
                                                                                                    borderRadius: 6,
                                                                                                    fontSize: 11,
                                                                                                    color,
                                                                                                    background: `${color}10`,
                                                                                                    border: `1px solid ${color}40`
                                                                                                },
                                                                                                children: [
                                                                                                    "群体 #",
                                                                                                    cid
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1234,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, `${path.path_id}-${cid}-${idx}`, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1232,
                                                                                        columnNumber: 35
                                                                                    }, this);
                                                                                }) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                    type: "secondary",
                                                                                    style: {
                                                                                        fontSize: 11
                                                                                    },
                                                                                    children: "该路径暂未映射到群体"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1240,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1228,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                style: {
                                                                                    fontSize: 12,
                                                                                    color: '#475569'
                                                                                },
                                                                                children: path.path_description
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1243,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, path.path_id, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1218,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1216,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1153,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 8
                                                        },
                                                        children: displayedPaths.map((path)=>{
                                                            var _path_affected_entities;
                                                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    padding: '10px 12px',
                                                                    background: '#f8fafc',
                                                                    borderRadius: 6,
                                                                    borderLeft: `4px solid ${RISK_LEVEL_COLORS[path.risk_level] || '#fa8c16'}`
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 6,
                                                                            marginBottom: 4,
                                                                            flexWrap: 'wrap'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                color: RISK_LEVEL_COLORS[path.risk_level],
                                                                                style: {
                                                                                    fontSize: 10,
                                                                                    borderRadius: 4,
                                                                                    lineHeight: '18px',
                                                                                    margin: 0
                                                                                },
                                                                                children: path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1261,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                strong: true,
                                                                                style: {
                                                                                    fontSize: 12
                                                                                },
                                                                                children: path.path_id
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1264,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            path.confidence !== undefined && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                style: {
                                                                                    fontSize: 10,
                                                                                    borderRadius: 4,
                                                                                    lineHeight: '18px',
                                                                                    margin: 0,
                                                                                    background: '#f0f5ff',
                                                                                    border: '1px solid #d6e4ff',
                                                                                    color: '#2855D1'
                                                                                },
                                                                                children: [
                                                                                    (path.confidence * 100).toFixed(0),
                                                                                    "%"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1266,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            onJumpToGraph && ((_path_affected_entities = path.affected_entities) === null || _path_affected_entities === void 0 ? void 0 : _path_affected_entities.length) > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                                size: "small",
                                                                                type: "link",
                                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EyeOutlined, {}, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1274,
                                                                                    columnNumber: 39
                                                                                }, void 0),
                                                                                style: {
                                                                                    fontSize: 10,
                                                                                    padding: 0,
                                                                                    height: 20
                                                                                },
                                                                                onClick: ()=>onJumpToGraph(path.affected_entities[0], path.affected_entities[0], 'Entity'),
                                                                                children: "查看图谱"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1271,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1260,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                        style: {
                                                                            fontSize: 12,
                                                                            color: '#475569'
                                                                        },
                                                                        children: path.path_description
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1282,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    path.affected_entities && path.affected_entities.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            marginTop: 8,
                                                                            overflowX: 'auto',
                                                                            paddingBottom: 4
                                                                        },
                                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: 6,
                                                                                minWidth: 'max-content'
                                                                            },
                                                                            children: [
                                                                                path.affected_entities.slice(0, 12).map((entity, idx)=>{
                                                                                    const etype = inferClientEntityType(entity);
                                                                                    const color = _graphStyles.NODE_TYPE_COLORS[etype] || '#8c8c8c';
                                                                                    const label = _graphStyles.NODE_TYPE_LABELS[etype] || etype;
                                                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                                                        children: [
                                                                                            idx > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                                style: {
                                                                                                    color: '#94a3b8',
                                                                                                    fontSize: 14
                                                                                                },
                                                                                                children: "→"
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1292,
                                                                                                columnNumber: 51
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                                                title: `${label}: ${entity}`,
                                                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                                    style: {
                                                                                                        fontSize: 11,
                                                                                                        borderRadius: 16,
                                                                                                        cursor: onJumpToGraph ? 'pointer' : 'default',
                                                                                                        border: `1px solid ${color}40`,
                                                                                                        background: `${color}10`,
                                                                                                        color,
                                                                                                        margin: 0,
                                                                                                        padding: '3px 9px'
                                                                                                    },
                                                                                                    onClick: ()=>onJumpToGraph === null || onJumpToGraph === void 0 ? void 0 : onJumpToGraph(entity, entity, etype),
                                                                                                    children: entity.length > 14 ? entity.slice(0, 12) + '...' : entity
                                                                                                }, void 0, false, {
                                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                    lineNumber: 1294,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1293,
                                                                                                columnNumber: 39
                                                                                            }, this)
                                                                                        ]
                                                                                    }, entity, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1291,
                                                                                        columnNumber: 37
                                                                                    }, this);
                                                                                }),
                                                                                path.affected_entities.length > 12 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                    type: "secondary",
                                                                                    style: {
                                                                                        fontSize: 10,
                                                                                        marginLeft: 4
                                                                                    },
                                                                                    children: [
                                                                                        "+",
                                                                                        path.affected_entities.length - 12,
                                                                                        " 更多"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1309,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1285,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1284,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, path.path_id, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1251,
                                                                columnNumber: 25
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1249,
                                                        columnNumber: 21
                                                    }, this),
                                                    sortedPaths.length > 5 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        type: "link",
                                                        size: "small",
                                                        onClick: ()=>setShowAllPaths(!showAllPaths),
                                                        style: {
                                                            marginTop: 8,
                                                            padding: 0
                                                        },
                                                        children: showAllPaths ? '收起，仅显示前 5 条' : `展开全部 ${sortedPaths.length} 条路径`
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1319,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1106,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    borderRadius: 8
                                                },
                                                title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                                            style: {
                                                                marginRight: 8,
                                                                color: '#f5222d'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1335,
                                                            columnNumber: 23
                                                        }, void 0),
                                                        "风险传导路径"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1334,
                                                    columnNumber: 21
                                                }, void 0),
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: isLoading ? '风险路径分析进行中...' : '未检测到风险传导路径'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1340,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1330,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1104,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            id: "risk-section-final-report",
                                            ref: finalReportRef,
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    borderRadius: 8,
                                                    border: highlightSection === 'final-report' ? '2px solid #2855D1' : undefined,
                                                    transition: 'border-color 0.5s ease',
                                                    ...highlightSection === 'final-report' ? {
                                                        animation: 'sectionHighlight 1s ease-in-out 2'
                                                    } : {}
                                                },
                                                title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 13
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {
                                                            style: {
                                                                marginRight: 8,
                                                                color: '#2855D1'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1359,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        "协同治理社区报告"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1358,
                                                    columnNumber: 19
                                                }, void 0),
                                                extra: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                    size: 4,
                                                    className: "no-print",
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                            title: "导出 Markdown",
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                size: "small",
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileMarkdownOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1366,
                                                                    columnNumber: 50
                                                                }, void 0),
                                                                onClick: handleExportMD
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1366,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1365,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                            title: "导出 Word",
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                size: "small",
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileWordOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1369,
                                                                    columnNumber: 50
                                                                }, void 0),
                                                                onClick: handleExportWord
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1369,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1368,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                            title: "导出 PDF",
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                size: "small",
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FilePdfOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1372,
                                                                    columnNumber: 50
                                                                }, void 0),
                                                                onClick: handleExportPDF
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1372,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1371,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1364,
                                                    columnNumber: 19
                                                }, void 0),
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            flexWrap: 'wrap',
                                                            gap: 12,
                                                            marginBottom: 12
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                flex: 1,
                                                                minWidth: 200
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                                                    level: 5,
                                                                    style: {
                                                                        margin: '0 0 8px',
                                                                        fontSize: 15
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                            style: {
                                                                                marginRight: 8,
                                                                                color: '#FFC101'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1380,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        "社区治理结论"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1379,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Paragraph, {
                                                                    ellipsis: {
                                                                        rows: 4,
                                                                        expandable: true
                                                                    },
                                                                    style: {
                                                                        color: '#475569',
                                                                        fontSize: 13,
                                                                        marginBottom: 0
                                                                    },
                                                                    children: report.executive_summary
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1383,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1378,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1377,
                                                        columnNumber: 17
                                                    }, this),
                                                    report.integrated_report || report.markdown_report ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        className: "markdown-report",
                                                        style: {
                                                            fontSize: 13,
                                                            lineHeight: 1.75,
                                                            color: '#334155',
                                                            marginTop: 12,
                                                            padding: '14px 16px',
                                                            background: '#f8fafc',
                                                            borderRadius: 8
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_reactmarkdown.default, {
                                                            children: report.integrated_report || report.markdown_report
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1394,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1393,
                                                        columnNumber: 19
                                                    }, this) : null,
                                                    (governancePlan === null || governancePlan === void 0 ? void 0 : governancePlan.actions) && governancePlan.actions.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                strong: true,
                                                                style: {
                                                                    fontSize: 13,
                                                                    display: 'block',
                                                                    marginBottom: 8
                                                                },
                                                                children: "协同处置动作"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1400,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 6
                                                                },
                                                                children: governancePlan.actions.slice(0, 4).map((action, idx)=>{
                                                                    const urgency = URGENCY_TAGS[action.priority] || URGENCY_TAGS.normal;
                                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            alignItems: 'flex-start',
                                                                            gap: 8,
                                                                            padding: '8px 12px',
                                                                            background: action.priority === 'urgent' ? '#fff2f0' : '#f8fafc',
                                                                            borderRadius: 6,
                                                                            border: action.priority === 'urgent' ? '1px solid #ffccc7' : '1px solid #e2e8f0'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    fontSize: 18,
                                                                                    fontWeight: 700,
                                                                                    color: urgency.color,
                                                                                    minWidth: 24,
                                                                                    textAlign: 'center',
                                                                                    lineHeight: 1.2
                                                                                },
                                                                                children: idx + 1
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1417,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                style: {
                                                                                    flex: 1
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                        strong: true,
                                                                                        style: {
                                                                                            fontSize: 12
                                                                                        },
                                                                                        children: action.measure
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1421,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            color: '#94a3b8',
                                                                                            display: 'block'
                                                                                        },
                                                                                        children: [
                                                                                            action.target,
                                                                                            " · ",
                                                                                            action.risk_issue
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1422,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                        style: {
                                                                                            marginTop: 4,
                                                                                            display: 'flex',
                                                                                            gap: 4,
                                                                                            flexWrap: 'wrap'
                                                                                        },
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                                color: urgency.color,
                                                                                                style: {
                                                                                                    borderRadius: 4,
                                                                                                    fontSize: 10,
                                                                                                    margin: 0
                                                                                                },
                                                                                                children: urgency.label
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1426,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                                style: {
                                                                                                    borderRadius: 4,
                                                                                                    fontSize: 10,
                                                                                                    margin: 0
                                                                                                },
                                                                                                children: action.department
                                                                                            }, void 0, false, {
                                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                                lineNumber: 1429,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1425,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1420,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, idx, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1405,
                                                                        columnNumber: 27
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1401,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1399,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1349,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1348,
                                            columnNumber: 13
                                        }, this),
                                        error && report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            style: {
                                                borderRadius: 8,
                                                border: '1px solid #ffccc7'
                                            },
                                            className: "no-print",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                type: "danger",
                                                style: {
                                                    fontSize: 12
                                                },
                                                children: [
                                                    "注意: ",
                                                    error
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1444,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1443,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 662,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                            title: "历史报告",
                            open: historyOpen,
                            onClose: ()=>setHistoryOpen(false),
                            width: 360,
                            children: historyLoading ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    textAlign: 'center',
                                    padding: 40
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                    indicator: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LoadingOutlined, {
                                        spin: true
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1461,
                                        columnNumber: 30
                                    }, void 0)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 1461,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1460,
                                columnNumber: 11
                            }, this) : historyReports.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: "暂无历史报告",
                                image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1464,
                                columnNumber: 11
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                                dataSource: historyReports,
                                renderItem: (item)=>{
                                    var _item_overall_risk_level;
                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                                        style: {
                                            cursor: 'pointer',
                                            padding: '10px 12px',
                                            borderRadius: 6
                                        },
                                        onClick: ()=>loadHistoryReport(item.report_id),
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                width: '100%'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                            strong: true,
                                                            style: {
                                                                fontSize: 12
                                                            },
                                                            children: item.report_id
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1475,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: RISK_LEVEL_COLORS[item.overall_risk_level] || '#fa8c16',
                                                            style: {
                                                                borderRadius: 4,
                                                                fontSize: 10
                                                            },
                                                            children: RISK_LEVEL_LABELS[item.overall_risk_level] || ((_item_overall_risk_level = item.overall_risk_level) === null || _item_overall_risk_level === void 0 ? void 0 : _item_overall_risk_level.toUpperCase())
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1476,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1474,
                                                    columnNumber: 19
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 11,
                                                        display: 'block'
                                                    },
                                                    children: item.query_summary || '-'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1483,
                                                    columnNumber: 19
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 10
                                                    },
                                                    children: [
                                                        item.generated_at ? formatTimestamp(item.generated_at) : '',
                                                        " · ",
                                                        item.subtasks_completed,
                                                        " 个子任务"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1486,
                                                    columnNumber: 19
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1473,
                                            columnNumber: 17
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1469,
                                        columnNumber: 15
                                    }, void 0);
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1466,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 1453,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 648,
                    columnNumber: 5
                }, this);
            };
            _s(RiskReportPanel, "hAXFpttjM3v2iCcddnTWCAhfrnQ=", false, function() {
                return [
                    _antd.App.useApp
                ];
            });
            _c = RiskReportPanel;
            var _default = RiskReportPanel;
            var _c;
            $RefreshReg$(_c, "RiskReportPanel");
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
    runtime._h = '3744965457681501793';
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

//# sourceMappingURL=p__KnowledgeQA__index-async.16383555970901659217.hot-update.js.map