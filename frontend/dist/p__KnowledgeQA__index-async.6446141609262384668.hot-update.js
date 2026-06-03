globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/index.tsx": function(module, exports, __mako_require__) {
            "use strict";
            var interop = __mako_require__("@swc/helpers/_/_interop_require_wildcard")._;
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
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
            var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var _WorkspaceContainer = __mako_require__("src/pages/KnowledgeQA/components/WorkspaceContainer.tsx");
            var _EnhancedGraphPanel = __mako_require__("src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx");
            var _RiskReportPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/RiskReportPanel.tsx"));
            var _ComplianceAnalysisPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx"));
            var _AgentTracePanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/AgentTracePanel.tsx"));
            var _LegendPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/LegendPanel.tsx"));
            var _ChatSidebar = __mako_require__("src/pages/KnowledgeQA/components/ChatSidebar.tsx");
            var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
            var _chatStore = __mako_require__("src/pages/KnowledgeQA/store/chatStore.ts");
            var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
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
            const RELATION_TEXT = {
                INVEST: '投资',
                GUARANTEE: '担保',
                WORK: '任职',
                CONTROLLER: '控制',
                MENTION: '涉及',
                TRIGGERS: '触发',
                REFLECTS: '反映',
                COMPLIES_WITH: '合规',
                CAUSE: '因果',
                BELONG: '归属',
                TRANSACTION: '交易',
                WARNING: '预警',
                RELATED: '关联'
            };
            const ATTRIBUTE_LABELS = {
                entity_id: '实体ID',
                id: '实体ID',
                COMPANY_NM: '公司名称',
                COMPANY_NAME: '公司名称',
                PERSON_NM: '人员姓名',
                PERSON_NAME: '人员姓名',
                name: '名称',
                title: '标题',
                label: '标签',
                STATUS: '状态',
                LEGAL_PERSON: '法定代表人',
                LEGAL_REPRESENTATIVE: '法定代表人',
                REG_CAPITAL: '注册资本',
                ESTABLISH_DATE: '成立日期',
                INDUSTRY: '所属行业',
                ADDRESS: '注册地址',
                CREDIT_CODE: '统一社会信用代码',
                RISK_INFO: '风险信息',
                WARNING_NUM: '预警次数',
                EVENT_TYPE: '事件类型',
                EVENT_DATE: '事件日期',
                AMOUNT: '金额',
                POSITION: '职位',
                role: '角色',
                score: '匹配分数',
                risk_level: '风险等级',
                compliance_score: '合规总分',
                entity_type: '实体类型',
                type: '实体类型'
            };
            const HIDDEN_ATTRIBUTE_KEYS = new Set([
                'raw',
                'properties',
                'embedding',
                'vector',
                'graph_embedding',
                'semantic_embedding',
                'poster',
                'poster_url'
            ]);
            function formatAttributeValue(value) {
                if (value === undefined || value === null || value === '') return '';
                if (Array.isArray(value)) return value.map(formatAttributeValue).filter(Boolean).join('、');
                if (typeof value === 'object') try {
                    const entries = Object.entries(value).filter(([, v])=>v !== undefined && v !== null && v !== '').slice(0, 6);
                    return entries.map(([k, v])=>`${ATTRIBUTE_LABELS[k] || k}: ${formatAttributeValue(v)}`).join('；');
                } catch  {
                    return '';
                }
                return String(value);
            }
            function getNodeAttributes(node) {
                const props = node.properties || {};
                const fields = {
                    entity_id: node.id,
                    entity_type: node.entity_type || node.entityType || node.type,
                    ...props,
                    risk_level: node.risk_level,
                    compliance_score: node.compliance_score,
                    score: node.score
                };
                const displayName = node.title || node.zh_name || node.name || node.label || node.id;
                const seen = new Set();
                return Object.entries(fields).filter(([key, value])=>{
                    if (HIDDEN_ATTRIBUTE_KEYS.has(key)) return false;
                    if (value === undefined || value === null || value === '') return false;
                    const text = formatAttributeValue(value);
                    if (!text || key !== 'entity_id' && text === String(displayName)) return false;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                }).map(([key, value])=>({
                        key,
                        label: ATTRIBUTE_LABELS[key] || key.replace(/_/g, ' '),
                        value: formatAttributeValue(value)
                    })).slice(0, 18);
            }
            // Extract entity names from query text and match against graph nodes
            function extractSubjectEntityIds(query, nodes) {
                if (!query || nodes.length === 0) return [];
                const matched = [];
                for (const node of nodes){
                    const nodeId = String(node.id);
                    const names = [
                        node.title,
                        node.name,
                        node.zh_name,
                        node.zhTitle
                    ].filter(Boolean);
                    for (const name of names)if (name.length >= 2 && query.includes(name)) {
                        matched.push(nodeId);
                        break;
                    }
                }
                // If no direct match, try extracting entities from query with common patterns
                if (matched.length === 0) {
                    // Match《书名号》patterns
                    const bookMatches = query.match(/《([^》]{2,30})》/g);
                    if (bookMatches) for (const m of bookMatches){
                        const name = m.replace(/[《》]/g, '');
                        for (const node of nodes){
                            const nodeId = String(node.id);
                            const nodeNames = [
                                node.title,
                                node.name,
                                node.zh_name,
                                node.zhTitle
                            ].filter(Boolean);
                            if (nodeNames.some((n)=>n.includes(name) || name.includes(n))) {
                                if (!matched.includes(nodeId)) matched.push(nodeId);
                            }
                        }
                    }
                    // Match company name patterns (ending with 公司/集团/有限 etc)
                    if (matched.length === 0) {
                        const companyMatches = query.match(/([一-龥]{2,15}(?:有限|股份|集团|科技|实业|投资|控股)?(?:公司|企业|集团|中心|所))/g);
                        if (companyMatches) {
                            for (const name of companyMatches)for (const node of nodes){
                                const nodeId = String(node.id);
                                const nodeNames = [
                                    node.title,
                                    node.name,
                                    node.zh_name,
                                    node.zhTitle
                                ].filter(Boolean);
                                if (nodeNames.some((n)=>n.includes(name) || name.includes(n.slice(0, 10)))) {
                                    if (!matched.includes(nodeId)) matched.push(nodeId);
                                }
                            }
                        }
                    }
                }
                return matched;
            }
            // Find 1-hop neighbor IDs for given node IDs
            function findNeighborIds(nodeIds, edges) {
                if (nodeIds.length === 0 || edges.length === 0) return [];
                const idSet = new Set(nodeIds.map(String));
                const neighbors = new Set();
                for (const e of edges){
                    const src = String(e.source);
                    const tgt = String(e.target);
                    if (idSet.has(src) && !idSet.has(tgt)) neighbors.add(tgt);
                    if (idSet.has(tgt) && !idSet.has(src)) neighbors.add(src);
                }
                return Array.from(neighbors);
            }
            const KnowledgeQA = ()=>{
                _s();
                const { message } = _antd.App.useApp();
                const { messages, currentSubgraph, alignmentFeatures, isLoading, sendUnifiedMessage, clearHistory, pendingRecommendations, clarifyMessage, activeRightPanel, riskReport, riskStages, riskCommunity, riskEntityCommunityMap, resolvedEntities, riskScores, governancePlan, complianceScores, complianceIndicators, error, retryRiskQuery, agentTraces } = (0, _agentStore.useAgentStore)();
                const { activeSessionId, updateCurrentSession, getActiveSession, createNewSession } = (0, _chatStore.useChatStore)();
                const graphRef = (0, _react.useRef)(null);
                const [highlightedEntity, setHighlightedEntity] = (0, _react.useState)(null);
                const [graphInjectedEntity, setGraphInjectedEntity] = (0, _react.useState)(null);
                const [sidebarCollapsed, setSidebarCollapsed] = (0, _react.useState)(false);
                const [graphStats, setGraphStats] = (0, _react.useState)(null);
                const [drawerNode, setDrawerNode] = (0, _react.useState)(null);
                const [tracePanelVisible, setTracePanelVisible] = (0, _react.useState)(false);
                const [visibleCategories, setVisibleCategories] = (0, _react.useState)(new Set([
                    ...Object.keys(_graphStyles.NODE_TYPE_LABELS),
                    ...Object.keys(_graphStyles.RELATION_LABELS)
                ]));
                // Auto-save logic
                (0, _react.useEffect)(()=>{
                    if (_agentStore.useAgentStore.getState().isLoading) return;
                    if (!activeSessionId) {
                        if (_chatStore.useChatStore.getState().sessions.length === 0) createNewSession();
                        return;
                    }
                    const timer = setTimeout(()=>{
                        const activeSession = getActiveSession();
                        if (!activeSession) return;
                        if (messages.length > 0 || currentSubgraph || riskReport) {
                            let newTitle = activeSession.title;
                            if ((!newTitle || newTitle === '新会话') && messages.length > 0) {
                                const firstUserMsg = messages.find((m)=>m.role === 'user');
                                if (firstUserMsg) newTitle = firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
                            }
                            updateCurrentSession({
                                messages,
                                title: newTitle,
                                workspaceState: {
                                    graphData: currentSubgraph,
                                    riskReport,
                                    riskStages,
                                    riskCommunity
                                }
                            });
                        }
                    }, 1000);
                    return ()=>clearTimeout(timer);
                }, [
                    messages,
                    currentSubgraph,
                    riskReport,
                    activeSessionId,
                    updateCurrentSession,
                    getActiveSession,
                    createNewSession
                ]);
                // Session restoration
                (0, _react.useEffect)(()=>{
                    if (_agentStore.useAgentStore.getState().isLoading) return;
                    const session = getActiveSession();
                    if (!session) return;
                    // Migrate old 'analysis' panel setting to 'graph'
                    const savedPanel = session.workspaceState.riskReport ? 'risk' : session.workspaceState.graphData ? 'graph' : 'graph';
                    // Normalize stored graph data (handles old sessions with Neo4j-format nodes)
                    const rawGraph = session.workspaceState.graphData;
                    const normalizedGraph = rawGraph ? {
                        nodes: (0, _agentStore.normalizeSubgraphNodes)(rawGraph.nodes || []),
                        edges: (0, _agentStore.normalizeSubgraphEdges)(rawGraph.edges || []),
                        paths: rawGraph.paths || []
                    } : null;
                    _agentStore.useAgentStore.setState({
                        messages: session.messages,
                        currentSubgraph: normalizedGraph,
                        riskReport: session.workspaceState.riskReport || null,
                        riskStages: session.workspaceState.riskStages || [],
                        riskCommunity: session.workspaceState.riskCommunity || null,
                        activeRightPanel: savedPanel === 'analysis' ? 'graph' : savedPanel
                    });
                    if (normalizedGraph && graphRef.current) {
                        graphRef.current.refresh(normalizedGraph, []);
                        setTimeout(()=>{
                            var _graphRef_current;
                            return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView();
                        }, 300);
                    }
                }, [
                    activeSessionId
                ]);
                // Update graph when subgraph changes
                (0, _react.useEffect)(()=>{
                    if (!currentSubgraph) return;
                    const doRefresh = ()=>{
                        if (!graphRef.current) return false;
                        const lastUserMsg = [
                            ...messages
                        ].reverse().find((m)=>m.role === 'user');
                        const query = (lastUserMsg === null || lastUserMsg === void 0 ? void 0 : lastUserMsg.content) || '';
                        const subjectIds = extractSubjectEntityIds(query, currentSubgraph.nodes);
                        const neighborIds = findNeighborIds(subjectIds, currentSubgraph.edges);
                        graphRef.current.refresh(currentSubgraph, alignmentFeatures, subjectIds, neighborIds);
                        if (subjectIds.length > 0) setTimeout(()=>{
                            var _graphRef_current, _graphRef_current1;
                            (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.focusNode(subjectIds[0]);
                            (_graphRef_current1 = graphRef.current) === null || _graphRef_current1 === void 0 || _graphRef_current1.dimNonFocused(subjectIds, neighborIds);
                        }, 600);
                        else setTimeout(()=>{
                            var _graphRef_current;
                            return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView();
                        }, 500);
                        return true;
                    };
                    if (!doRefresh()) {
                        // Graph not ready yet — retry once after a short delay
                        console.log('[KnowledgeQA] graphRef not ready, retrying refresh in 100ms...');
                        const retryTimer = setTimeout(()=>{
                            if (!doRefresh()) console.warn('[KnowledgeQA] graphRef still not ready after retry — subgraph data may not be rendered');
                        }, 100);
                        return ()=>clearTimeout(retryTimer);
                    }
                }, [
                    currentSubgraph,
                    alignmentFeatures,
                    riskEntityCommunityMap
                ]);
                const handleEntityHover = (0, _react.useCallback)((entityId)=>{
                    setHighlightedEntity(entityId);
                    if (entityId && graphRef.current) graphRef.current.focusNode(entityId);
                    else if (!entityId && graphRef.current) graphRef.current.resetHighlight();
                }, []);
                const handleNodeDoubleClick = (0, _react.useCallback)((nodeId, nodeName, nodeType)=>{
                    setGraphInjectedEntity({
                        id: nodeId,
                        name: nodeName,
                        type: nodeType
                    });
                }, []);
                const handleEntityClick = (0, _react.useCallback)((entityId, entityType)=>{
                    _agentStore.useAgentStore.setState({
                        activeRightPanel: 'graph'
                    });
                    if (graphRef.current) graphRef.current.searchAndExpand(entityId, entityType);
                }, []);
                const handleJumpToGraph = (0, _react.useCallback)((entityId, entityName, entityType)=>{
                    _agentStore.useAgentStore.setState({
                        activeRightPanel: 'graph'
                    });
                    if (graphRef.current) graphRef.current.searchAndExpand(entityId, entityType);
                }, []);
                // ── Graph stats & node click handlers ──
                const handleNodeClick = (0, _react.useCallback)((node)=>{
                    setDrawerNode(node);
                }, []);
                const handleCanvasClick = (0, _react.useCallback)(()=>{
                    setDrawerNode(null);
                    setVisibleCategories(new Set([
                        ...Object.keys(_graphStyles.NODE_TYPE_LABELS),
                        ...Object.keys(_graphStyles.RELATION_LABELS)
                    ]));
                }, []);
                const handleDrawerClose = (0, _react.useCallback)(()=>{
                    var _graphRef_current;
                    setDrawerNode(null);
                    (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.translateCanvas(0, 0);
                }, []);
                const handleDrawerJumpToNode = (0, _react.useCallback)((nodeId, nodeName)=>{
                    const subgraph = _agentStore.useAgentStore.getState().currentSubgraph;
                    const targetNode = subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes.find((n)=>String(n.id) === nodeId);
                    if (targetNode) {
                        var _graphRef_current;
                        setDrawerNode(targetNode);
                        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.focusNode(nodeId);
                    }
                }, []);
                const handleLegendToggle = (0, _react.useCallback)((cat)=>{
                    var _graphRef_current;
                    setVisibleCategories((prev)=>{
                        const next = new Set(prev);
                        if (next.has(cat)) next.delete(cat);
                        else next.add(cat);
                        return next;
                    });
                    (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.toggleCategory(cat);
                }, []);
                const handleLegendHighlight = (0, _react.useCallback)((cat)=>{
                    var _graphRef_current;
                    (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.applyHighlight(cat);
                }, []);
                const lastQueryText = (0, _react.useMemo)(()=>{
                    const lastUserMsg = [
                        ...messages
                    ].reverse().find((m)=>m.role === 'user');
                    return (lastUserMsg === null || lastUserMsg === void 0 ? void 0 : lastUserMsg.content) || '';
                }, [
                    messages
                ]);
                const handleBFFSend = (0, _react.useCallback)(async (query)=>{
                    // XXX: /api/rewrite 暂未实现，直接调用统一链路
                    // IntentAgent + Entity Resolution 在后端内部处理 query rewrite
                    await sendUnifiedMessage(query);
                }, [
                    sendUnifiedMessage
                ]);
                // Header component with API health indicator
                const [apiHealthy, setApiHealthy] = (0, _react.useState)(null);
                const intervalRef = (0, _react.useRef)();
                (0, _react.useEffect)(()=>{
                    __mako_require__.ensure2("src/pages/KnowledgeQA/api/agent.ts").then(__mako_require__.dr(interop, __mako_require__.bind(__mako_require__, "src/pages/KnowledgeQA/api/agent.ts"))).then(({ healthCheck })=>{
                        healthCheck().then(setApiHealthy).catch(()=>setApiHealthy(false));
                        intervalRef.current = setInterval(()=>{
                            healthCheck().then(setApiHealthy).catch(()=>setApiHealthy(false));
                        }, 15000);
                    });
                    return ()=>{
                        if (intervalRef.current) clearInterval(intervalRef.current);
                    };
                }, []);
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
                    header: {
                        title: '协同治理',
                        subTitle: '协同治理引擎'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                height: 'calc(100vh - 120px)',
                                overflow: 'hidden',
                                background: _constants.DESIGN_TOKENS.BG_CANVAS,
                                margin: '-24px',
                                borderRadius: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_ChatSidebar.ChatSidebar, {
                                    collapsed: sidebarCollapsed,
                                    onToggle: ()=>setSidebarCollapsed(!sidebarCollapsed)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                    lineNumber: 482,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: 1,
                                        overflow: 'hidden'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("header", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 24px',
                                                background: 'rgba(255, 255, 255, 0.85)',
                                                backdropFilter: 'blur(20px)',
                                                borderBottom: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 12,
                                                                background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 4px 12px rgba(40, 85, 209, 0.3)'
                                                            },
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                width: "24",
                                                                height: "24",
                                                                viewBox: "0 0 32 32",
                                                                fill: "none",
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                        cx: "16",
                                                                        cy: "16",
                                                                        r: "12",
                                                                        stroke: "#ffffff",
                                                                        strokeWidth: "2",
                                                                        opacity: "0.3"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 516,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                        cx: "16",
                                                                        cy: "10",
                                                                        r: "3",
                                                                        fill: "#ffffff"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 517,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                        cx: "10",
                                                                        cy: "20",
                                                                        r: "2.5",
                                                                        fill: "#10B981"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 518,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                        cx: "22",
                                                                        cy: "20",
                                                                        r: "2.5",
                                                                        fill: "#F59E0B"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 519,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("line", {
                                                                        x1: "16",
                                                                        y1: "13",
                                                                        x2: "11",
                                                                        y2: "18",
                                                                        stroke: "#ffffff",
                                                                        strokeWidth: "1.5"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 520,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("line", {
                                                                        x1: "16",
                                                                        y1: "13",
                                                                        x2: "21",
                                                                        y2: "18",
                                                                        stroke: "#ffffff",
                                                                        strokeWidth: "1.5"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 521,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("line", {
                                                                        x1: "12",
                                                                        y1: "20",
                                                                        x2: "20",
                                                                        y2: "20",
                                                                        stroke: "#ffffff",
                                                                        strokeWidth: "1.5"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 522,
                                                                        columnNumber: 19
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 515,
                                                                columnNumber: 17
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 503,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("h1", {
                                                                    style: {
                                                                        margin: 0,
                                                                        fontSize: 18,
                                                                        fontWeight: 700,
                                                                        color: '#0F172A',
                                                                        letterSpacing: '-0.02em'
                                                                    },
                                                                    children: "WindEye"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 526,
                                                                    columnNumber: 17
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                                                    style: {
                                                                        margin: 0,
                                                                        fontSize: 12,
                                                                        color: '#94A3B8'
                                                                    },
                                                                    children: "Knowledge Graph Recommendation Engine"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 17
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 525,
                                                            columnNumber: 15
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 502,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16
                                                    },
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: apiHealthy === null ? '#94A3B8' : apiHealthy ? '#10B981' : '#EF4444',
                                                                    boxShadow: apiHealthy ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                                                                    animation: apiHealthy ? 'pulse 2s infinite' : 'none'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 545,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#64748B'
                                                                },
                                                                children: apiHealthy === null ? '检测中' : apiHealthy ? 'API 在线' : 'API 离线'
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 556,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 15
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 543,
                                                    columnNumber: 13
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 490,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                flex: 1,
                                                overflow: 'hidden',
                                                padding: '16px',
                                                gap: '16px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        width: 'clamp(320px, 32vw, 520px)',
                                                        flexShrink: 0,
                                                        borderRadius: 20,
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        background: '#fff',
                                                        boxShadow: _constants.DESIGN_TOKENS.SHADOW_MD,
                                                        border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_WorkspaceContainer.WorkspaceContainer, {
                                                            messages: messages,
                                                            isLoading: isLoading,
                                                            pendingRecommendations: pendingRecommendations,
                                                            onSendMessage: handleBFFSend,
                                                            onClearHistory: clearHistory,
                                                            onEntityHover: handleEntityHover,
                                                            onEntityClick: handleEntityClick,
                                                            highlightedEntity: highlightedEntity,
                                                            graphInjectedEntity: graphInjectedEntity,
                                                            onClearGraphInject: ()=>setGraphInjectedEntity(null)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 587,
                                                            columnNumber: 15
                                                        }, this),
                                                        clarifyMessage && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                margin: '0 16px 16px',
                                                                padding: '10px 14px',
                                                                background: 'rgba(245,169,66,0.12)',
                                                                border: '1px solid rgba(245,169,66,0.3)',
                                                                borderRadius: 10,
                                                                fontSize: 13,
                                                                color: '#92400e',
                                                                lineHeight: 1.6
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("strong", {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: 0.5
                                                                    },
                                                                    children: "Needs Clarification"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 613,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        marginTop: 6
                                                                    },
                                                                    children: clarifyMessage
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 622,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 601,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 574,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        flex: 1,
                                                        borderRadius: 20,
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        background: '#fff',
                                                        boxShadow: _constants.DESIGN_TOKENS.SHADOW_MD,
                                                        border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '10px 16px',
                                                                borderBottom: '1px solid #f1f5f9',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                background: 'rgba(255, 255, 255, 0.5)',
                                                                backdropFilter: 'blur(10px)',
                                                                flexShrink: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 8
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Segmented, {
                                                                            options: [
                                                                                {
                                                                                    label: '图谱视图',
                                                                                    value: 'graph'
                                                                                },
                                                                                {
                                                                                    label: '治理报告',
                                                                                    value: 'risk'
                                                                                },
                                                                                {
                                                                                    label: '合规分析',
                                                                                    value: 'compliance'
                                                                                }
                                                                            ],
                                                                            value: activeRightPanel,
                                                                            onChange: (val)=>_agentStore.useAgentStore.setState({
                                                                                    activeRightPanel: val
                                                                                }),
                                                                            size: "middle",
                                                                            style: {
                                                                                background: '#f1f5f9',
                                                                                padding: '2px',
                                                                                borderRadius: '10px'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 653,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                            title: `Agent 调试日志${agentTraces.length > 0 ? ` (${agentTraces.length})` : ''}`,
                                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                                size: "small",
                                                                                type: "text",
                                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BugOutlined, {}, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                                    lineNumber: 674,
                                                                                    columnNumber: 29
                                                                                }, void 0),
                                                                                onClick: ()=>setTracePanelVisible(true),
                                                                                style: {
                                                                                    color: agentTraces.length > 0 ? '#fa8c16' : '#94a3b8',
                                                                                    borderRadius: 6
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                                lineNumber: 671,
                                                                                columnNumber: 21
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 670,
                                                                            columnNumber: 19
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 652,
                                                                    columnNumber: 17
                                                                }, this),
                                                                activeRightPanel === 'graph' && graphStats && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_LegendPanel.default, {
                                                                    stats: graphStats,
                                                                    visibleCategories: visibleCategories,
                                                                    onToggle: handleLegendToggle,
                                                                    onHighlight: handleLegendHighlight
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 684,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 640,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                flex: 1,
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            },
                                                            children: activeRightPanel === 'risk' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskReportPanel.default, {
                                                                report: riskReport,
                                                                stages: riskStages,
                                                                community: riskCommunity,
                                                                entityCommunityMap: riskEntityCommunityMap,
                                                                isLoading: isLoading,
                                                                error: error,
                                                                onJumpToGraph: handleJumpToGraph,
                                                                onRetry: retryRiskQuery,
                                                                queryText: lastQueryText,
                                                                currentSubgraph: currentSubgraph,
                                                                resolvedEntities: resolvedEntities,
                                                                riskScores: riskScores,
                                                                governancePlan: governancePlan,
                                                                complianceScores: complianceScores
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 695,
                                                                columnNumber: 19
                                                            }, this) : activeRightPanel === 'compliance' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_ComplianceAnalysisPanel.default, {
                                                                report: riskReport,
                                                                currentSubgraph: currentSubgraph,
                                                                isLoading: isLoading,
                                                                onJumpToGraph: handleJumpToGraph,
                                                                complianceIndicators: complianceIndicators
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 712,
                                                                columnNumber: 19
                                                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_EnhancedGraphPanel.EnhancedGraphPanel, {
                                                                ref: graphRef,
                                                                subgraph: currentSubgraph,
                                                                alignmentFeatures: alignmentFeatures,
                                                                entityCommunityMap: riskEntityCommunityMap,
                                                                onNodeDoubleClick: handleNodeDoubleClick,
                                                                onNodeHover: (nodeId)=>setHighlightedEntity(nodeId),
                                                                highlightedEntity: highlightedEntity,
                                                                onNodeClick: handleNodeClick,
                                                                onCanvasClick: handleCanvasClick,
                                                                onStatsChange: setGraphStats
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 720,
                                                                columnNumber: 19
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 693,
                                                            columnNumber: 15
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 628,
                                                    columnNumber: 13
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 564,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                    lineNumber: 488,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/index.tsx",
                            lineNumber: 471,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                            title: null,
                            placement: "right",
                            width: 380,
                            open: drawerNode !== null,
                            onClose: handleDrawerClose,
                            closable: true,
                            styles: {
                                body: {
                                    padding: 0
                                }
                            },
                            maskStyle: {
                                background: 'rgba(0,0,0,0.05)'
                            },
                            children: drawerNode && (()=>{
                                const subgraph = _agentStore.useAgentStore.getState().currentSubgraph;
                                const nodeType = drawerNode.type || '';
                                const typeColor = _graphStyles.NODE_TYPE_COLORS[nodeType] || '#8c8c8c';
                                const typeLabel = _graphStyles.NODE_TYPE_LABELS[nodeType] || nodeType || '未知';
                                const riskLevel = drawerNode.risk_level;
                                const rv = riskLevel ? _graphStyles.RISK_LEVEL_VISUAL[riskLevel] : null;
                                // Find connected edges and neighbor nodes
                                const connectedEdges = ((subgraph === null || subgraph === void 0 ? void 0 : subgraph.edges) || []).filter((e)=>String(e.source) === String(drawerNode.id) || String(e.target) === String(drawerNode.id));
                                const neighborIds = new Set();
                                connectedEdges.forEach((e)=>{
                                    const src = String(e.source);
                                    const tgt = String(e.target);
                                    if (src !== String(drawerNode.id)) neighborIds.add(src);
                                    if (tgt !== String(drawerNode.id)) neighborIds.add(tgt);
                                });
                                const neighborNodes = ((subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes) || []).filter((n)=>neighborIds.has(String(n.id)));
                                const displayName = drawerNode.title || drawerNode.zh_name || drawerNode.name || drawerNode.id;
                                const attributeRows = getNodeAttributes(drawerNode);
                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                padding: '20px 24px 16px',
                                                borderBottom: '1px solid #f1f5f9'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        fontSize: 18,
                                                        fontWeight: 700,
                                                        color: '#0f172a',
                                                        lineHeight: 1.3,
                                                        marginBottom: 10
                                                    },
                                                    children: displayName
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 779,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: 8,
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                display: 'inline-block',
                                                                padding: '2px 10px',
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                color: typeColor,
                                                                background: `${typeColor}12`,
                                                                border: `1px solid ${typeColor}30`
                                                            },
                                                            children: typeLabel
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 783,
                                                            columnNumber: 19
                                                        }, this),
                                                        rv && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                display: 'inline-block',
                                                                padding: '2px 10px',
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                color: rv.border,
                                                                background: rv.bg,
                                                                border: `1px solid ${rv.border}40`
                                                            },
                                                            children: rv.label
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 790,
                                                            columnNumber: 21
                                                        }, this),
                                                        drawerNode.rating !== undefined && drawerNode.rating !== null && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: '#64748b',
                                                                padding: '2px 6px'
                                                            },
                                                            children: [
                                                                "评分: ",
                                                                drawerNode.rating
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 798,
                                                            columnNumber: 21
                                                        }, this),
                                                        drawerNode.year && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                fontSize: 12,
                                                                color: '#64748b',
                                                                padding: '2px 6px'
                                                            },
                                                            children: drawerNode.year
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 803,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 782,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 778,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                padding: '16px 24px'
                                            },
                                            children: [
                                                drawerNode.overview && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        marginBottom: 20
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: '#475569',
                                                                marginBottom: 8,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: 0.5
                                                            },
                                                            children: "溯源文本"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 814,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                color: '#334155',
                                                                lineHeight: 1.7,
                                                                maxHeight: 200,
                                                                overflowY: 'auto',
                                                                background: '#f8fafc',
                                                                borderRadius: 8,
                                                                padding: '10px 12px'
                                                            },
                                                            children: drawerNode.overview.length > 500 ? drawerNode.overview.slice(0, 500) + '...' : drawerNode.overview
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 817,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 813,
                                                    columnNumber: 19
                                                }, this),
                                                attributeRows.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        marginBottom: 20
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: '#475569',
                                                                marginBottom: 8,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: 0.5
                                                            },
                                                            children: [
                                                                "属性信息 (",
                                                                attributeRows.length,
                                                                ")"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 826,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'grid',
                                                                gap: 8
                                                            },
                                                            children: attributeRows.map((attr)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '92px minmax(0, 1fr)',
                                                                        gap: 10,
                                                                        alignItems: 'start',
                                                                        padding: '8px 10px',
                                                                        borderRadius: 8,
                                                                        background: '#f8fafc',
                                                                        border: '1px solid #eef2f7'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                fontSize: 12,
                                                                                color: '#64748b',
                                                                                fontWeight: 600
                                                                            },
                                                                            children: attr.label
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 844,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                fontSize: 12,
                                                                                color: '#1e293b',
                                                                                lineHeight: 1.6,
                                                                                wordBreak: 'break-word'
                                                                            },
                                                                            children: attr.value
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 847,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, attr.key, true, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 831,
                                                                    columnNumber: 25
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 829,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 825,
                                                    columnNumber: 19
                                                }, this),
                                                neighborNodes.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color: '#475569',
                                                                marginBottom: 8,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: 0.5
                                                            },
                                                            children: [
                                                                "关联实体 (",
                                                                neighborNodes.length,
                                                                ")"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 859,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 6
                                                            },
                                                            children: neighborNodes.map((neighbor)=>{
                                                                const nId = String(neighbor.id);
                                                                const nType = neighbor.type || '';
                                                                const nColor = _graphStyles.NODE_TYPE_COLORS[nType] || '#8c8c8c';
                                                                const nTypeLabel = _graphStyles.NODE_TYPE_LABELS[nType] || nType;
                                                                const nName = neighbor.title || neighbor.zh_name || neighbor.name || neighbor.id;
                                                                // Find relation type
                                                                const relEdge = connectedEdges.find((e)=>String(e.source) === nId || String(e.target) === nId);
                                                                const relType = (relEdge === null || relEdge === void 0 ? void 0 : relEdge.relation) || '相关';
                                                                const relLabel = RELATION_TEXT[relType] || _graphStyles.RELATION_LABELS[relType] || relType;
                                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    onClick: ()=>handleDrawerJumpToNode(nId, String(nName)),
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 10,
                                                                        padding: '8px 12px',
                                                                        borderRadius: 8,
                                                                        cursor: 'pointer',
                                                                        transition: 'background 0.15s',
                                                                        border: '1px solid #f1f5f9'
                                                                    },
                                                                    onMouseEnter: (e)=>{
                                                                        e.currentTarget.style.background = '#f8fafc';
                                                                    },
                                                                    onMouseLeave: (e)=>{
                                                                        e.currentTarget.style.background = 'transparent';
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                            style: {
                                                                                width: 8,
                                                                                height: 8,
                                                                                borderRadius: '50%',
                                                                                flexShrink: 0,
                                                                                background: nColor
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 887,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                flex: 1,
                                                                                minWidth: 0
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                    style: {
                                                                                        fontSize: 13,
                                                                                        fontWeight: 600,
                                                                                        color: '#1e293b',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    },
                                                                                    children: String(nName).length > 18 ? String(nName).slice(0, 16) + '...' : nName
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                                    lineNumber: 892,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                    style: {
                                                                                        fontSize: 11,
                                                                                        color: '#94a3b8'
                                                                                    },
                                                                                    children: [
                                                                                        nTypeLabel,
                                                                                        " · ",
                                                                                        relLabel
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                                    lineNumber: 895,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 891,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                            width: "12",
                                                                            height: "12",
                                                                            viewBox: "0 0 24 24",
                                                                            fill: "none",
                                                                            stroke: "#94a3b8",
                                                                            strokeWidth: "2",
                                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                                                                                d: "M9 18l6-6-6-6"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                                lineNumber: 900,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                            lineNumber: 899,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, nId, true, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 876,
                                                                    columnNumber: 27
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 862,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 858,
                                                    columnNumber: 19
                                                }, this),
                                                !drawerNode.overview && attributeRows.length === 0 && neighborNodes.length === 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: 40,
                                                        color: '#94a3b8',
                                                        fontSize: 13
                                                    },
                                                    children: "暂无更多详情"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 911,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 810,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                    lineNumber: 776,
                                    columnNumber: 13
                                }, this);
                            })()
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/index.tsx",
                            lineNumber: 740,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_AgentTracePanel.default, {
                            traces: agentTraces,
                            visible: tracePanelVisible,
                            onClose: ()=>setTracePanelVisible(false),
                            onClear: ()=>_agentStore.useAgentStore.setState({
                                    agentTraces: []
                                })
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/index.tsx",
                            lineNumber: 922,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                            children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/index.tsx",
                            lineNumber: 929,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/index.tsx",
                    lineNumber: 465,
                    columnNumber: 5
                }, this);
            };
            _s(KnowledgeQA, "E2ynosqQ6xu0Tojr2Uj/qOHLYQY=", false, function() {
                return [
                    _antd.App.useApp,
                    _agentStore.useAgentStore,
                    _chatStore.useChatStore
                ];
            });
            _c = KnowledgeQA;
            var _default = KnowledgeQA;
            var _c;
            $RefreshReg$(_c, "KnowledgeQA");
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
    runtime._h = '16383555970901659217';
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

//# sourceMappingURL=p__KnowledgeQA__index-async.6446141609262384668.hot-update.js.map