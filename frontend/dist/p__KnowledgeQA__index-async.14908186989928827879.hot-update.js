globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx": function(module, exports, __mako_require__) {
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
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
            var _echartsforreact = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/echarts-for-react/esm/index.js"));
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Text, Title } = _antd.Typography;
            // ── Constants ────────────────────────────────────────────────────────────────
            const L1_STYLE = {
                '数据合规性': {
                    color: '#1677ff',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DatabaseOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 66,
                        columnNumber: 38
                    }, this)
                },
                '算法合规性': {
                    color: '#722ed1',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AuditOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 38
                    }, this)
                },
                '内容合规性': {
                    color: '#13a8a8',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 68,
                        columnNumber: 38
                    }, this)
                }
            };
            const DEFAULT_WEIGHTS = [
                35,
                35,
                30
            ];
            const WEIGHT_PRESETS = [
                {
                    label: '默认 35/35/30',
                    values: [
                        35,
                        35,
                        30
                    ]
                },
                {
                    label: '内容优先 20/30/50',
                    values: [
                        20,
                        30,
                        50
                    ]
                },
                {
                    label: '算法优先 25/50/25',
                    values: [
                        25,
                        50,
                        25
                    ]
                },
                {
                    label: '数据优先 50/30/20',
                    values: [
                        50,
                        30,
                        20
                    ]
                },
                {
                    label: '均衡 34/33/33',
                    values: [
                        34,
                        33,
                        33
                    ]
                }
            ];
            const L1_ORDER = [
                '数据合规性',
                '算法合规性',
                '内容合规性'
            ];
            const SCORE_LEVELS = [
                {
                    range: '90-100',
                    label: '高合规',
                    color: '#52c41a'
                },
                {
                    range: '75-89',
                    label: '较合规',
                    color: '#1677ff'
                },
                {
                    range: '60-74',
                    label: '中等合规',
                    color: '#fa8c16'
                },
                {
                    range: '0-59',
                    label: '低合规',
                    color: '#f5222d'
                }
            ];
            const TABLE_SCROLL_X = 514;
            const FULL_FALLBACK_INDICATORS = [
                {
                    id: 'data-source-auth',
                    l1: '数据合规性',
                    l2: '数据来源合法性',
                    l3: '数据来源清单与授权证明',
                    objective: 80,
                    category: 'data_driven'
                },
                {
                    id: 'data-no-illegal',
                    l1: '数据合规性',
                    l2: '数据来源合法性',
                    l3: '禁止使用非法爬取、内幕信息等',
                    objective: 70,
                    category: 'policy_driven'
                },
                {
                    id: 'data-local-storage',
                    l1: '数据合规性',
                    l2: '数据跨境与本地化',
                    l3: '境内资本市场相关数据存储',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'data-cross-border',
                    l1: '数据合规性',
                    l2: '数据跨境与本地化',
                    l3: '跨境数据传输履行安全评估与备案',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'data-quality-report',
                    l1: '数据合规性',
                    l2: '数据完整性与准确性',
                    l3: '建立数据质量评估报告',
                    objective: 80,
                    category: 'data_driven'
                },
                {
                    id: 'data-authoritative',
                    l1: '数据合规性',
                    l2: '数据完整性与准确性',
                    l3: '关键金融数据对接权威信源验证',
                    objective: 90,
                    category: 'evidence_based'
                },
                {
                    id: 'data-representation',
                    l1: '数据合规性',
                    l2: '数据偏见控制',
                    l3: '群体代表性分析',
                    objective: 70,
                    category: 'data_driven'
                },
                {
                    id: 'data-bias-mitigation',
                    l1: '数据合规性',
                    l2: '数据偏见控制',
                    l3: '数据偏见缓解机制',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'data-pipl-compliance',
                    l1: '数据合规性',
                    l2: '个人信息处理合规',
                    l3: '遵守个人信息保护法',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'data-investor-consent',
                    l1: '数据合规性',
                    l2: '个人信息处理合规',
                    l3: '投资者画像数据单独授权',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'data-encryption',
                    l1: '数据合规性',
                    l2: '数据安全防护',
                    l3: '数据分级分类加密脱敏',
                    objective: 80,
                    category: 'data_driven'
                },
                {
                    id: 'data-breach-response',
                    l1: '数据合规性',
                    l2: '数据安全防护',
                    l3: '数据泄露应急响应机制与日志留存',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-gov-committee',
                    l1: '算法合规性',
                    l2: '算法治理与问责',
                    l3: '设立人工智能治理委员会',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-lifecycle-mgmt',
                    l1: '算法合规性',
                    l2: '算法治理与问责',
                    l3: '算法全生命周期管理制度',
                    objective: 70,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-filing',
                    l1: '算法合规性',
                    l2: '算法治理与问责',
                    l3: '算法备案信息与供应商清单',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-third-party',
                    l1: '算法合规性',
                    l2: '算法治理与问责',
                    l3: '第三方模型血缘证明',
                    objective: 70,
                    category: 'evidence_based'
                },
                {
                    id: 'algo-bias-detect',
                    l1: '算法合规性',
                    l2: '算法公平性与非歧视',
                    l3: '偏见检测与缓解',
                    objective: 80,
                    category: 'data_driven'
                },
                {
                    id: 'algo-disparity-disclose',
                    l1: '算法合规性',
                    l2: '算法公平性与非歧视',
                    l3: '公开披露决策差异率',
                    objective: 70,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-stress-test',
                    l1: '算法合规性',
                    l2: '算法公平性与非歧视',
                    l3: '反操纵与压力测试',
                    objective: 80,
                    category: 'evidence_based'
                },
                {
                    id: 'algo-no-inducement',
                    l1: '算法合规性',
                    l2: '算法公平性与非歧视',
                    l3: '禁止嵌入诱导性交易策略',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'algo-explain-user',
                    l1: '算法合规性',
                    l2: '算法可解释性与安全',
                    l3: '用户可理解决策解释',
                    objective: 80,
                    category: 'evidence_based'
                },
                {
                    id: 'algo-explain-report',
                    l1: '算法合规性',
                    l2: '算法可解释性与安全',
                    l3: '可解释AI生成归因报告',
                    objective: 80,
                    category: 'evidence_based'
                },
                {
                    id: 'algo-robustness',
                    l1: '算法合规性',
                    l2: '算法可解释性与安全',
                    l3: '模型鲁棒性测试机制',
                    objective: 70,
                    category: 'evidence_based'
                },
                {
                    id: 'algo-failure-drill',
                    l1: '算法合规性',
                    l2: '算法可解释性与安全',
                    l3: '算法失效应急演练',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'content-authoritative-src',
                    l1: '内容合规性',
                    l2: '内容真实性与准确性',
                    l3: 'AI生成市场分析链接权威数据源',
                    objective: 80,
                    category: 'evidence_based'
                },
                {
                    id: 'content-hallucination-detect',
                    l1: '内容合规性',
                    l2: '内容真实性与准确性',
                    l3: 'AI幻觉检测拦截模块',
                    objective: 80,
                    category: 'evidence_based'
                },
                {
                    id: 'content-completeness',
                    l1: '内容合规性',
                    l2: '内容真实性与准确性',
                    l3: '信息完整性控制',
                    objective: 90,
                    category: 'data_driven'
                },
                {
                    id: 'content-ai-label',
                    l1: '内容合规性',
                    l2: '内容透明度与标识',
                    l3: 'AI生成内容强制标识',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'content-traceable',
                    l1: '内容合规性',
                    l2: '内容透明度与标识',
                    l3: '用户可查询生成依据',
                    objective: 90,
                    category: 'evidence_based'
                },
                {
                    id: 'content-audit-log',
                    l1: '内容合规性',
                    l2: '内容透明度与标识',
                    l3: 'AI生成内容审计日志记录与追溯',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'content-no-fake-exec',
                    l1: '内容合规性',
                    l2: '反滥用与风险防控',
                    l3: '禁止生成高管虚假言论/伪造财报',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'content-sensitive-filter',
                    l1: '内容合规性',
                    l2: '反滥用与风险防控',
                    l3: '敏感词库与AI内容过滤系统',
                    objective: 90,
                    category: 'policy_driven'
                },
                {
                    id: 'content-investor-suitability',
                    l1: '内容合规性',
                    l2: '反滥用与风险防控',
                    l3: '投资者适当性匹配',
                    objective: 80,
                    category: 'policy_driven'
                },
                {
                    id: 'content-no-highrisk-push',
                    l1: '内容合规性',
                    l2: '反滥用与风险防控',
                    l3: '禁止向非合格投资者推送高风险策略',
                    objective: 90,
                    category: 'policy_driven'
                }
            ];
            function clamp(v) {
                if (Number.isNaN(v)) return 0;
                return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
            }
            function getScoreColor(score) {
                if (score >= 90) return '#52c41a';
                if (score >= 75) return '#1677ff';
                if (score >= 60) return '#fa8c16';
                return '#f5222d';
            }
            function getScoreLabel(score) {
                if (score >= 90) return '高合规';
                if (score >= 75) return '较合规';
                if (score >= 60) return '中等合规';
                return '低合规';
            }
            // ── Fallback: build full indicator data when no complianceIndicators ─────────
            function buildLegacyMetrics(report, currentSubgraph) {
                var _report_evidence_chains, _report_evidence_chains1, _report_risk_scores, _report_risk_scores1, _report_risk_scores2, _report_risk_scores3, _report_risk_scores4;
                const nodes = (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.nodes) || [];
                const paths = (report === null || report === void 0 ? void 0 : report.risk_paths) || [];
                const matches = (report === null || report === void 0 ? void 0 : report.compliance_matches) || [];
                const chains = (report === null || report === void 0 ? void 0 : (_report_evidence_chains = report.evidence_chains) === null || _report_evidence_chains === void 0 ? void 0 : _report_evidence_chains.chains) || [];
                const nodesWithRichProps = nodes.filter((node)=>{
                    const props = node.properties || {};
                    return Object.keys(props).filter((key)=>props[key] !== undefined && props[key] !== null && props[key] !== '').length >= 3;
                }).length;
                const dataCompleteness = nodes.length > 0 ? nodesWithRichProps / nodes.length * 100 : 76;
                const pathExplainability = paths.length > 0 ? paths.filter((path)=>path.path_description || path.path_text).length / paths.length * 100 : 72;
                const avgComplianceConf = chains.length > 0 ? chains.reduce((sum, c)=>sum + (c.confidence || 0) * 100, 0) / chains.length : 82;
                const evidenceConfidence = (report === null || report === void 0 ? void 0 : (_report_evidence_chains1 = report.evidence_chains) === null || _report_evidence_chains1 === void 0 ? void 0 : _report_evidence_chains1.overall_confidence) !== undefined ? report.evidence_chains.overall_confidence * 100 : 74;
                const scoringCompleteness = (report === null || report === void 0 ? void 0 : (_report_risk_scores = report.risk_scores) === null || _report_risk_scores === void 0 ? void 0 : _report_risk_scores.final_overall) !== undefined ? 88 : 74;
                const nodeTypeCount = new Set(nodes.map((node)=>node.type || node.entityType || node.entity_type).filter(Boolean)).size;
                const dynamicScores = {
                    'data-source-auth': {
                        objective: nodes.length > 0 ? 90 : 68,
                        evidence: `${nodes.length || 0} 个证据子图节点`
                    },
                    'data-quality-report': {
                        objective: clamp(dataCompleteness),
                        evidence: `${nodesWithRichProps}/${nodes.length || 0} 个节点包含完整属性`
                    },
                    'data-representation': {
                        objective: nodeTypeCount >= 3 ? 85 : 72,
                        evidence: `子图覆盖 ${nodeTypeCount} 类实体，用于群体代表性分析`
                    },
                    'data-authoritative': {
                        objective: clamp((evidenceConfidence + avgComplianceConf) / 2),
                        evidence: `证据链置信度 ${Math.round(evidenceConfidence)}%，合规匹配 ${matches.length} 条`
                    },
                    'data-encryption': {
                        objective: 85,
                        evidence: '敏感字段仅在详情面板展示，建议结合数据分级策略复核'
                    },
                    'algo-lifecycle-mgmt': {
                        objective: scoringCompleteness,
                        evidence: `综合风险评分 ${(report === null || report === void 0 ? void 0 : (_report_risk_scores1 = report.risk_scores) === null || _report_risk_scores1 === void 0 ? void 0 : _report_risk_scores1.final_overall) ?? '待生成'}`
                    },
                    'algo-filing': {
                        objective: matches.length > 0 ? 78 : 72,
                        evidence: `${matches.length} 条合规匹配记录可用于备案信息复核`
                    },
                    'algo-third-party': {
                        objective: clamp(65 + chains.length * 3),
                        evidence: `基于 ${chains.length} 条证据链，模型血缘可追溯性待复核`
                    },
                    'algo-bias-detect': {
                        objective: paths.length > 0 && nodeTypeCount >= 3 ? 85 : 75,
                        evidence: `${paths.length} 条风险路径覆盖 ${nodeTypeCount} 类实体`
                    },
                    'algo-stress-test': {
                        objective: (report === null || report === void 0 ? void 0 : (_report_risk_scores2 = report.risk_scores) === null || _report_risk_scores2 === void 0 ? void 0 : _report_risk_scores2.final_overall) !== undefined ? 80 : 76,
                        evidence: `综合风险评分 ${(report === null || report === void 0 ? void 0 : (_report_risk_scores3 = report.risk_scores) === null || _report_risk_scores3 === void 0 ? void 0 : _report_risk_scores3.final_overall) ?? '待生成'}，建议纳入压力测试`
                    },
                    'algo-explain-user': {
                        objective: clamp(pathExplainability),
                        evidence: `${paths.length} 条风险路径具备说明`
                    },
                    'algo-explain-report': {
                        objective: clamp(evidenceConfidence),
                        evidence: `${chains.length} 条证据链支撑归因报告`
                    },
                    'algo-robustness': {
                        objective: (report === null || report === void 0 ? void 0 : (_report_risk_scores4 = report.risk_scores) === null || _report_risk_scores4 === void 0 ? void 0 : _report_risk_scores4.final_overall) !== undefined ? 78 : 70,
                        evidence: '基于风险评分稳定性与证据链一致性初步评估'
                    },
                    'content-authoritative-src': {
                        objective: clamp(avgComplianceConf),
                        evidence: `${matches.length} 条法规/证据匹配用于权威数据源校验`
                    },
                    'content-hallucination-detect': {
                        objective: clamp((avgComplianceConf + evidenceConfidence) / 2),
                        evidence: `合规匹配置信度与证据链置信度联合评估`
                    },
                    'content-completeness': {
                        objective: clamp((dataCompleteness + 90) / 2),
                        evidence: `${nodesWithRichProps}/${nodes.length || 0} 个节点包含完整属性`
                    },
                    'content-traceable': {
                        objective: chains.length > 0 ? clamp(70 + chains.length * 5) : 82,
                        evidence: `${chains.length} 条证据链可追溯`
                    }
                };
                return FULL_FALLBACK_INDICATORS.map((item)=>{
                    var _dynamicScores_item_id, _dynamicScores_item_id1, _dynamicScores_item_id2;
                    return {
                        ...item,
                        objective: ((_dynamicScores_item_id = dynamicScores[item.id]) === null || _dynamicScores_item_id === void 0 ? void 0 : _dynamicScores_item_id.objective) ?? item.objective,
                        evidence: ((_dynamicScores_item_id1 = dynamicScores[item.id]) === null || _dynamicScores_item_id1 === void 0 ? void 0 : _dynamicScores_item_id1.evidence) ?? item.evidence ?? `需人工复核：${item.l3}`,
                        key: item.id,
                        subjective: 0,
                        score: clamp(((_dynamicScores_item_id2 = dynamicScores[item.id]) === null || _dynamicScores_item_id2 === void 0 ? void 0 : _dynamicScores_item_id2.objective) ?? item.objective)
                    };
                });
            }
            // ── Component ────────────────────────────────────────────────────────────────
            const ComplianceAnalysisPanel = ({ report, currentSubgraph, isLoading, onJumpToGraph, complianceIndicators })=>{
                _s();
                const [subjectiveMap, setSubjectiveMap] = (0, _react.useState)({});
                const [draftSubjectiveMap, setDraftSubjectiveMap] = (0, _react.useState)({});
                const [weights, setWeights] = (0, _react.useState)(DEFAULT_WEIGHTS);
                const [chartsExpanded, setChartsExpanded] = (0, _react.useState)(true);
                const [isMaximized, setIsMaximized] = (0, _react.useState)(false);
                // ── Escape key to exit maximize ────────────────────────────────────
                const handleKeyDown = (0, _react.useCallback)((e)=>{
                    if (e.key === 'Escape') setIsMaximized(false);
                }, []);
                (0, _react.useEffect)(()=>{
                    if (isMaximized) {
                        document.addEventListener('keydown', handleKeyDown);
                        return ()=>document.removeEventListener('keydown', handleKeyDown);
                    }
                    return undefined;
                }, [
                    isMaximized,
                    handleKeyDown
                ]);
                const updateWeight = (0, _react.useCallback)((index, rawValue)=>{
                    const value = Math.max(0, Math.min(100, Math.round(rawValue ?? weights[index] ?? 0)));
                    const next = [
                        ...weights
                    ];
                    const otherIndexes = next.map((_, i)=>i).filter((i)=>i !== index);
                    const otherSum = otherIndexes.reduce((sum, i)=>sum + next[i], 0);
                    const targetOtherSum = 100 - value;
                    next[index] = value;
                    if (otherSum > 0) otherIndexes.forEach((i)=>{
                        next[i] = Math.round(next[i] / otherSum * targetOtherSum);
                    });
                    else {
                        const first = otherIndexes[0];
                        const second = otherIndexes[1];
                        next[first] = Math.floor(targetOtherSum / 2);
                        next[second] = targetOtherSum - next[first];
                    }
                    const diff = 100 - next.reduce((sum, item)=>sum + item, 0);
                    if (diff !== 0) {
                        const targetIndex = otherIndexes.find((i)=>next[i] + diff >= 0) ?? index;
                        next[targetIndex] += diff;
                    }
                    setWeights(next);
                }, [
                    weights
                ]);
                const updateSubjectiveDraft = (0, _react.useCallback)((indicatorId, rawValue)=>{
                    const value = Math.max(-10, Math.min(10, Math.round(rawValue ?? 0)));
                    setDraftSubjectiveMap((prev)=>{
                        const next = {
                            ...prev
                        };
                        const committed = subjectiveMap[indicatorId] ?? 0;
                        if (value === committed) delete next[indicatorId];
                        else next[indicatorId] = value;
                        return next;
                    });
                }, [
                    subjectiveMap
                ]);
                (0, _react.useCallback)(()=>{
                    setSubjectiveMap((prev)=>({
                            ...prev,
                            ...draftSubjectiveMap
                        }));
                    setDraftSubjectiveMap({});
                }, [
                    draftSubjectiveMap
                ]);
                (0, _react.useCallback)(()=>{
                    setDraftSubjectiveMap({});
                }, []);
                Object.keys(draftSubjectiveMap).length;
                // ── Build scored indicators from backend data ──────────────────────
                const scoredIndicators = (0, _react.useMemo)(()=>{
                    const source = complianceIndicators && complianceIndicators.length > 0 ? complianceIndicators : null;
                    if (source) return source.map((ind)=>{
                        const sub = subjectiveMap[ind.id] ?? 0;
                        const score = clamp(ind.objective + sub);
                        return {
                            ...ind,
                            key: ind.id,
                            subjective: sub,
                            score
                        };
                    });
                    const legacy = buildLegacyMetrics(report, currentSubgraph);
                    return legacy.map((m)=>({
                            ...m,
                            subjective: subjectiveMap[m.id] ?? 0,
                            score: clamp(m.objective + (subjectiveMap[m.id] ?? 0))
                        }));
                }, [
                    complianceIndicators,
                    report,
                    currentSubgraph,
                    subjectiveMap
                ]);
                // ── Build hierarchy tree ──────────────────────────────────────────
                const hierarchy = (0, _react.useMemo)(()=>{
                    const l2Map = new Map();
                    for (const ind of scoredIndicators){
                        const key = `${ind.l1}|||${ind.l2}`;
                        if (!l2Map.has(key)) l2Map.set(key, []);
                        l2Map.get(key).push(ind);
                    }
                    const l1Map = new Map();
                    for (const [key, children] of l2Map){
                        const [l1Name, l2Name] = key.split('|||');
                        const l2Score = clamp(children.reduce((s, c)=>s + c.score, 0) / children.length);
                        if (!l1Map.has(l1Name)) l1Map.set(l1Name, []);
                        l1Map.get(l1Name).push({
                            key: `${l1Name}|||${l2Name}`,
                            name: l2Name,
                            l1Name,
                            score: l2Score,
                            children
                        });
                    }
                    const l1Summaries = L1_ORDER.filter((name)=>l1Map.has(name)).map((name, idx)=>{
                        const children = l1Map.get(name);
                        const l1Score = clamp(children.reduce((s, c)=>s + c.score, 0) / children.length);
                        return {
                            key: name,
                            name,
                            weight: weights[idx] / 100,
                            score: l1Score,
                            children
                        };
                    });
                    return l1Summaries;
                }, [
                    scoredIndicators,
                    weights
                ]);
                // ── Overall score ─────────────────────────────────────────────────
                const overallScore = (0, _react.useMemo)(()=>{
                    if (hierarchy.length === 0) return 0;
                    let total = 0;
                    let totalWeight = 0;
                    for(let i = 0; i < hierarchy.length; i++){
                        const w = weights[i] / 100;
                        total += hierarchy[i].score * w;
                        totalWeight += w;
                    }
                    return totalWeight > 0 ? clamp(total / totalWeight) : 0;
                }, [
                    hierarchy,
                    weights
                ]);
                // ── Build tree rows for Ant Design Table ──────────────────────────
                const treeData = (0, _react.useMemo)(()=>{
                    return hierarchy.map((l1)=>({
                            key: l1.key,
                            name: l1.name,
                            l1Name: l1.name,
                            l2Name: null,
                            l3Name: null,
                            level: 1,
                            objective: null,
                            subjective: null,
                            score: l1.score,
                            weight: l1.weight,
                            evidence: '',
                            category: '',
                            indicatorId: null,
                            children: l1.children.map((l2)=>({
                                    key: l2.key,
                                    name: l2.name,
                                    l1Name: l1.name,
                                    l2Name: l2.name,
                                    l3Name: null,
                                    level: 2,
                                    objective: null,
                                    subjective: null,
                                    score: l2.score,
                                    weight: null,
                                    evidence: '',
                                    category: '',
                                    indicatorId: null,
                                    children: l2.children.map((l3)=>({
                                            key: l3.id,
                                            name: l3.l3,
                                            l1Name: l1.name,
                                            l2Name: l2.name,
                                            l3Name: l3.l3,
                                            level: 3,
                                            objective: l3.objective,
                                            subjective: l3.subjective,
                                            score: l3.score,
                                            weight: null,
                                            evidence: l3.evidence,
                                            category: l3.category,
                                            indicatorId: l3.id
                                        }))
                                }))
                        }));
                }, [
                    hierarchy
                ]);
                // ── Charts ────────────────────────────────────────────────────────
                const radarOption = (0, _react.useMemo)(()=>({
                        tooltip: {
                            trigger: 'item'
                        },
                        radar: {
                            center: [
                                '50%',
                                '54%'
                            ],
                            radius: '62%',
                            indicator: hierarchy.map((l1)=>({
                                    name: l1.name,
                                    max: 100
                                })),
                            axisName: {
                                color: '#475569',
                                fontSize: 11,
                                padding: [
                                    2,
                                    4
                                ]
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#e2e8f0'
                                }
                            },
                            splitArea: {
                                areaStyle: {
                                    color: [
                                        '#ffffff',
                                        '#f8fafc'
                                    ]
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#cbd5e1'
                                }
                            }
                        },
                        series: [
                            {
                                type: 'radar',
                                data: [
                                    {
                                        value: hierarchy.map((l1)=>l1.score),
                                        name: '综合分',
                                        areaStyle: {
                                            color: 'rgba(22,119,255,0.18)'
                                        },
                                        lineStyle: {
                                            color: '#1677ff',
                                            width: 2
                                        },
                                        itemStyle: {
                                            color: '#1677ff'
                                        }
                                    }
                                ]
                            }
                        ]
                    }), [
                    hierarchy
                ]);
                const barOption = (0, _react.useMemo)(()=>({
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            left: 20,
                            right: 12,
                            top: 18,
                            bottom: 20,
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            data: hierarchy.map((l1)=>l1.name.replace('合规性', '')),
                            axisLabel: {
                                color: '#475569',
                                fontSize: 10
                            },
                            axisTick: {
                                show: false
                            }
                        },
                        yAxis: {
                            type: 'value',
                            max: 100,
                            axisLabel: {
                                color: '#94a3b8',
                                fontSize: 10
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#f1f5f9'
                                }
                            }
                        },
                        series: [
                            {
                                name: '一级得分',
                                type: 'bar',
                                data: hierarchy.map((l1)=>({
                                        value: l1.score,
                                        itemStyle: {
                                            color: getScoreColor(l1.score),
                                            borderRadius: [
                                                4,
                                                4,
                                                0,
                                                0
                                            ]
                                        }
                                    })),
                                barMaxWidth: 34,
                                label: {
                                    show: true,
                                    position: 'top',
                                    color: '#475569',
                                    fontSize: 11,
                                    formatter: '{c}'
                                }
                            }
                        ]
                    }), [
                    hierarchy
                ]);
                (0, _react.useMemo)(()=>hierarchy.map((l1)=>{
                        var _L1_STYLE_l1_name;
                        const color = ((_L1_STYLE_l1_name = L1_STYLE[l1.name]) === null || _L1_STYLE_l1_name === void 0 ? void 0 : _L1_STYLE_l1_name.color) || '#1677ff';
                        return {
                            key: l1.key,
                            title: l1.name.replace('合规性', ''),
                            color,
                            option: {
                                tooltip: {
                                    trigger: 'item'
                                },
                                radar: {
                                    center: [
                                        '50%',
                                        '56%'
                                    ],
                                    radius: '58%',
                                    indicator: l1.children.map((l2)=>({
                                            name: l2.name,
                                            max: 100
                                        })),
                                    axisName: {
                                        color: '#475569',
                                        fontSize: 10,
                                        padding: [
                                            2,
                                            4
                                        ]
                                    },
                                    splitLine: {
                                        lineStyle: {
                                            color: '#e2e8f0'
                                        }
                                    },
                                    splitArea: {
                                        areaStyle: {
                                            color: [
                                                '#ffffff',
                                                '#f8fafc'
                                            ]
                                        }
                                    },
                                    axisLine: {
                                        lineStyle: {
                                            color: '#cbd5e1'
                                        }
                                    }
                                },
                                series: [
                                    {
                                        type: 'radar',
                                        data: [
                                            {
                                                value: l1.children.map((l2)=>l2.score),
                                                name: `${l1.name}二级指标`,
                                                areaStyle: {
                                                    color: `${color}24`
                                                },
                                                lineStyle: {
                                                    color,
                                                    width: 2
                                                },
                                                itemStyle: {
                                                    color
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        };
                    }), [
                    hierarchy
                ]);
                // ── Tree table columns ────────────────────────────────────────────
                const treeColumns = (0, _react.useMemo)(()=>[
                        {
                            title: '指标',
                            dataIndex: 'name',
                            width: 238,
                            render: (_, record)=>{
                                if (record.level === 1) {
                                    const style = L1_STYLE[record.name] || {
                                        color: '#8c8c8c',
                                        icon: null
                                    };
                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                        color: style.color,
                                        style: {
                                            margin: 0,
                                            fontWeight: 600,
                                            whiteSpace: 'normal',
                                            lineHeight: '20px'
                                        },
                                        children: [
                                            style.icon,
                                            " ",
                                            record.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 534,
                                        columnNumber: 13
                                    }, this);
                                }
                                if (record.level === 2) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        display: 'block',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        whiteSpace: 'normal'
                                    },
                                    children: record.name
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 540,
                                    columnNumber: 18
                                }, this);
                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                    title: record.evidence,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        style: {
                                            display: 'inline',
                                            fontSize: 12,
                                            cursor: 'help',
                                            borderBottom: '1px dashed #cbd5e1',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word'
                                        },
                                        children: record.name
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 544,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 543,
                                    columnNumber: 11
                                }, this);
                            }
                        },
                        {
                            title: '客观分',
                            dataIndex: 'objective',
                            width: 96,
                            align: 'center',
                            render: (v, record)=>{
                                if (record.level !== 3 || v === null) return null;
                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                    percent: Math.round(v),
                                    size: "small",
                                    strokeColor: getScoreColor(v),
                                    format: ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                            style: {
                                                whiteSpace: 'nowrap'
                                            },
                                            children: v
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 570,
                                            columnNumber: 27
                                        }, void 0),
                                    style: {
                                        minWidth: 74,
                                        margin: 0
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 566,
                                    columnNumber: 11
                                }, this);
                            }
                        },
                        {
                            title: '主观修正',
                            dataIndex: 'subjective',
                            width: 92,
                            align: 'center',
                            render: (_, record)=>{
                                if (record.level !== 3 || record.indicatorId === null) return null;
                                const draftValue = draftSubjectiveMap[record.indicatorId];
                                const hasDraft = draftValue !== undefined;
                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                            size: "small",
                                            min: -10,
                                            max: 10,
                                            step: 1,
                                            value: hasDraft ? draftValue : record.subjective ?? 0,
                                            onChange: (val)=>updateSubjectiveDraft(record.indicatorId, typeof val === 'number' ? val : 0),
                                            style: {
                                                width: 72,
                                                borderColor: hasDraft ? '#fa8c16' : undefined,
                                                boxShadow: hasDraft ? '0 0 0 1px rgba(250,140,22,0.12)' : undefined
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 587,
                                            columnNumber: 13
                                        }, this),
                                        hasDraft && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                            style: {
                                                width: 6,
                                                height: 6,
                                                borderRadius: 6,
                                                background: '#fa8c16',
                                                flexShrink: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 600,
                                            columnNumber: 26
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 586,
                                    columnNumber: 11
                                }, this);
                            }
                        },
                        {
                            title: '得分',
                            dataIndex: 'score',
                            width: 88,
                            align: 'center',
                            sorter: (a, b)=>a.score - b.score,
                            render: (v, record)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        minWidth: 70,
                                        whiteSpace: 'nowrap'
                                    },
                                    children: [
                                        record.level <= 2 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                            percent: Math.round(v),
                                            size: "small",
                                            strokeColor: getScoreColor(v),
                                            showInfo: false,
                                            style: {
                                                width: 36,
                                                margin: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 621,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                            strong: true,
                                            style: {
                                                color: getScoreColor(v),
                                                fontSize: record.level === 1 ? 14 : 13,
                                                whiteSpace: 'nowrap'
                                            },
                                            children: v.toFixed(record.level === 3 ? 0 : 1)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 629,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 612,
                                    columnNumber: 9
                                }, this)
                        }
                    ], [
                    draftSubjectiveMap,
                    updateSubjectiveDraft
                ]);
                // ── Empty state ───────────────────────────────────────────────────
                if (!report && !isLoading) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                        description: "生成治理报告后展示合规指标评分",
                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 642,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                    lineNumber: 641,
                    columnNumber: 7
                }, this);
                // ── Panel content ─────────────────────────────────────────────────
                const panelContent = /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        height: '100%',
                        overflow: 'auto',
                        padding: '12px 16px',
                        background: isMaximized ? '#f8fafc' : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        minHeight: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("section", {
                            style: {
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: 14,
                                flexShrink: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 16
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                                    type: "circle",
                                                    percent: Math.round(overallScore),
                                                    size: 72,
                                                    strokeColor: getScoreColor(overallScore),
                                                    format: (p)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        fontSize: 18,
                                                                        fontWeight: 700
                                                                    },
                                                                    children: p
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 19
                                                                }, void 0),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        color: '#64748b'
                                                                    },
                                                                    children: getScoreLabel(overallScore)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 667,
                                                                    columnNumber: 19
                                                                }, void 0)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 665,
                                                            columnNumber: 17
                                                        }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 659,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                                                level: 5,
                                                                style: {
                                                                    margin: 0,
                                                                    fontSize: 15
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {
                                                                        style: {
                                                                            color: '#13a8a8',
                                                                            marginRight: 6
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                        lineNumber: 674,
                                                                        columnNumber: 19
                                                                    }, this),
                                                                    "合规分析面板"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 673,
                                                                columnNumber: 17
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                size: "small",
                                                                type: "text",
                                                                icon: isMaximized ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenExitOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 680,
                                                                    columnNumber: 39
                                                                }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 680,
                                                                    columnNumber: 68
                                                                }, void 0),
                                                                onClick: ()=>setIsMaximized(!isMaximized),
                                                                style: {
                                                                    color: '#94a3b8'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 677,
                                                                columnNumber: 17
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                        lineNumber: 672,
                                                        columnNumber: 15
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 671,
                                                    columnNumber: 13
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 658,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 24,
                                                alignItems: 'center'
                                            },
                                            children: hierarchy.map((l1, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        textAlign: 'center'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                            style: {
                                                                fontSize: 11,
                                                                color: '#64748b'
                                                            },
                                                            children: l1.name
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 690,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                strong: true,
                                                                style: {
                                                                    fontSize: 18,
                                                                    color: getScoreColor(l1.score)
                                                                },
                                                                children: l1.score.toFixed(1)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 692,
                                                                columnNumber: 19
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 691,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, l1.key, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 689,
                                                    columnNumber: 15
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 687,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 657,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        marginTop: 12,
                                        padding: '10px 12px',
                                        background: '#f8fafc',
                                        borderRadius: 6,
                                        border: '1px solid #e2e8f0'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 6,
                                                flexWrap: 'wrap',
                                                marginBottom: 10
                                            },
                                            children: WEIGHT_PRESETS.map((preset)=>{
                                                const active = weights.join('/') === preset.values.join('/');
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    type: active ? 'primary' : 'default',
                                                    onClick: ()=>setWeights([
                                                            ...preset.values
                                                        ]),
                                                    style: {
                                                        borderRadius: 6,
                                                        fontSize: 11
                                                    },
                                                    children: preset.label
                                                }, preset.label, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 705,
                                                    columnNumber: 17
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 701,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                gap: 14
                                            },
                                            children: hierarchy.map((l1, idx)=>{
                                                var _L1_STYLE_l1_name;
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: '52px minmax(92px, 1fr) 78px',
                                                        alignItems: 'center',
                                                        gap: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: (_L1_STYLE_l1_name = L1_STYLE[l1.name]) === null || _L1_STYLE_l1_name === void 0 ? void 0 : _L1_STYLE_l1_name.color,
                                                            style: {
                                                                margin: 0,
                                                                textAlign: 'center',
                                                                borderRadius: 6
                                                            },
                                                            children: l1.name.replace('合规性', '')
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 720,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Slider, {
                                                            style: {
                                                                margin: 0
                                                            },
                                                            min: 0,
                                                            max: 100,
                                                            step: 1,
                                                            value: weights[idx],
                                                            onChange: (val)=>updateWeight(idx, val)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 723,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 4
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                                                    size: "small",
                                                                    min: 0,
                                                                    max: 100,
                                                                    step: 1,
                                                                    value: weights[idx],
                                                                    onChange: (val)=>updateWeight(idx, typeof val === 'number' ? val : null),
                                                                    style: {
                                                                        width: 56
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 732,
                                                                    columnNumber: 19
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        color: '#475569'
                                                                    },
                                                                    children: "%"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 741,
                                                                    columnNumber: 19
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 731,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, l1.key, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 719,
                                                    columnNumber: 15
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 717,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 700,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 656,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("section", {
                            style: {
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: '10px 14px',
                                flexShrink: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: chartsExpanded ? 4 : 0,
                                        cursor: 'pointer'
                                    },
                                    onClick: ()=>setChartsExpanded(!chartsExpanded),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BarChartOutlined, {
                                            style: {
                                                color: '#1677ff'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 755,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                            strong: true,
                                            style: {
                                                fontSize: 13
                                            },
                                            children: "一级指标对比"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 756,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                flex: 1
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 757,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                            type: "secondary",
                                            style: {
                                                fontSize: 10
                                            },
                                            children: chartsExpanded ? '收起' : '展开'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 758,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 751,
                                    columnNumber: 9
                                }, this),
                                chartsExpanded && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'stretch',
                                        gap: 12,
                                        flexWrap: 'wrap'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                            option: radarOption,
                                            style: {
                                                height: 176,
                                                minWidth: 220,
                                                flex: '1 1 260px'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 762,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                            option: barOption,
                                            style: {
                                                height: 176,
                                                minWidth: 240,
                                                flex: '1.1 1 280px'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 763,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                width: 118,
                                                marginLeft: 'auto',
                                                flexShrink: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                                justifyContent: 'center',
                                                alignSelf: 'stretch'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 11,
                                                        textAlign: 'right'
                                                    },
                                                    children: "评分等级"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 774,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4
                                                    },
                                                    children: SCORE_LEVELS.map((item)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-end',
                                                                gap: 5
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                    style: {
                                                                        width: 7,
                                                                        height: 7,
                                                                        borderRadius: 2,
                                                                        background: item.color,
                                                                        flexShrink: 0
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 778,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        color: '#475569',
                                                                        lineHeight: '14px'
                                                                    },
                                                                    children: item.label
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 779,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 10,
                                                                        lineHeight: '14px'
                                                                    },
                                                                    children: item.range
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                    lineNumber: 780,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, item.label, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                            lineNumber: 777,
                                                            columnNumber: 19
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                    lineNumber: 775,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                            lineNumber: 764,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 761,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 750,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("section", {
                            style: {
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: 12,
                                flex: '1 1 360px',
                                minHeight: 0,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    strong: true,
                                    style: {
                                        fontSize: 13,
                                        display: 'block',
                                        marginBottom: 8,
                                        flexShrink: 0
                                    },
                                    children: [
                                        "指标评分明细 ",
                                        scoredIndicators.length,
                                        " 个三级指标"
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 794,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        flex: 1,
                                        minHeight: 0,
                                        overflow: 'hidden'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                        size: "small",
                                        rowKey: "key",
                                        columns: treeColumns,
                                        dataSource: treeData,
                                        pagination: false,
                                        defaultExpandAllRows: true,
                                        sticky: true,
                                        tableLayout: "fixed",
                                        scroll: {
                                            x: TABLE_SCROLL_X,
                                            y: isMaximized ? 'calc(100vh - 480px)' : 'calc(100vh - 720px)'
                                        },
                                        rowClassName: (record)=>record.level === 1 ? 'l1-row' : '',
                                        onRow: (record)=>{
                                            if (record.level === 1) return {};
                                            return {};
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 798,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                    lineNumber: 797,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 790,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                    lineNumber: 650,
                    columnNumber: 5
                }, this);
                // ── Maximized overlay ─────────────────────────────────────────────
                if (isMaximized) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                position: 'fixed',
                                inset: 0,
                                zIndex: 1040,
                                background: 'rgba(0,0,0,0.45)'
                            },
                            onClick: ()=>setIsMaximized(false)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 824,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                position: 'fixed',
                                inset: 24,
                                zIndex: 1050
                            },
                            children: panelContent
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 828,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true);
                return panelContent;
            };
            _s(ComplianceAnalysisPanel, "sHYPk7y6MzZCPZUdc5AYh8eWOUA=");
            _c = ComplianceAnalysisPanel;
            var _default = ComplianceAnalysisPanel;
            var _c;
            $RefreshReg$(_c, "ComplianceAnalysisPanel");
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
    runtime._h = '1556462856657701693';
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

//# sourceMappingURL=p__KnowledgeQA__index-async.14908186989928827879.hot-update.js.map