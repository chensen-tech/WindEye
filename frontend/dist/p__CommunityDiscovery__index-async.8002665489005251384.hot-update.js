globalThis.makoModuleHotUpdate('p__CommunityDiscovery__index', {
    modules: {
        "src/pages/CommunityDiscovery/index.tsx": function(module, exports, __mako_require__) {
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
            var _graphConfig = __mako_require__("src/pages/graphConfig.ts");
            var _service = __mako_require__("src/pages/CommunityDiscovery/service.ts");
            var _useCommunityGraph = __mako_require__("src/pages/CommunityDiscovery/hooks/useCommunityGraph.ts");
            var _TopControlBar = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/TopControlBar.tsx"));
            var _RightPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/RightPanel.tsx"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Title } = _antd.Typography;
            const CommunityDiscoveryPage = ()=>{
                var _selectedNode_style, _selectedNode_fullLabel, _selectedNode_style1;
                _s();
                const { message } = _antd.App.useApp();
                const [loading, setLoading] = (0, _react.useState)(false);
                const [result, setResult] = (0, _react.useState)(null);
                const [selectedCommunity, setSelectedCommunity] = (0, _react.useState)(null);
                const [graphData, setGraphData] = (0, _react.useState)({
                    nodes: [],
                    edges: []
                });
                const [fullGraphData, setFullGraphData] = (0, _react.useState)({
                    nodes: [],
                    edges: []
                });
                const [graphLoading, setGraphLoading] = (0, _react.useState)(false);
                const [drawerVisible, setDrawerVisible] = (0, _react.useState)(false);
                const [selectedNode, setSelectedNode] = (0, _react.useState)(null);
                const [discoverParams, setDiscoverParams] = (0, _react.useState)(null);
                const [rightPanelTab, setRightPanelTab] = (0, _react.useState)('list');
                const graphContainerRef = (0, _react.useRef)(null);
                // ── Load merged graph from top N communities ──
                const loadFullGraph = (0, _react.useCallback)(async (data, layer)=>{
                    setGraphLoading(true);
                    try {
                        const allNodes = [];
                        const allEdges = [];
                        const nodeSeen = new Set();
                        for (const c of data.communities.slice(0, 10)){
                            const g = await (0, _service.getCommunityGraph)(c.community_id, layer, 100);
                            for (const n of g.nodes || []){
                                const key = String(n.id);
                                if (!nodeSeen.has(key)) {
                                    nodeSeen.add(key);
                                    n._communityId = c.community_id;
                                    allNodes.push(n);
                                }
                            }
                            for (const e of g.edges || [])allEdges.push(e);
                        }
                        setFullGraphData({
                            nodes: allNodes,
                            edges: allEdges
                        });
                    } catch  {
                        message.error('加载全图失败');
                    } finally{
                        setGraphLoading(false);
                    }
                }, []);
                // ── Graph hook for the immersive main view ──
                const { downloadImage, centerOnCommunity } = (0, _useCommunityGraph.useCommunityGraph)(graphContainerRef, {
                    graphData: fullGraphData,
                    selectedCommunityId: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) ?? null,
                    onNodeClick: (model)=>{
                        setSelectedNode(model);
                        setDrawerVisible(true);
                    },
                    onCommunityClick: (communityId)=>{
                        const comm = result === null || result === void 0 ? void 0 : result.communities.find((c)=>c.community_id === communityId);
                        if (comm) handleSelectCommunity(comm);
                    }
                });
                // ── Handlers ──
                const handleDiscover = (0, _react.useCallback)(async (params)=>{
                    setDiscoverParams(params);
                    setLoading(true);
                    setSelectedCommunity(null);
                    setGraphData({
                        nodes: [],
                        edges: []
                    });
                    setFullGraphData({
                        nodes: [],
                        edges: []
                    });
                    try {
                        const data = await (0, _service.discoverCommunities)(params);
                        if (data.success) {
                            setResult(data);
                            message.success(`发现 ${data.communities_count} 个群体`);
                            await loadFullGraph(data, params.layer || 'all');
                        } else message.error(data.error || '群体发现失败');
                    } catch  {
                        message.error('服务连接失败');
                    } finally{
                        setLoading(false);
                    }
                }, [
                    loadFullGraph
                ]);
                const handleReset = (0, _react.useCallback)(()=>{
                    setResult(null);
                    setSelectedCommunity(null);
                    setGraphData({
                        nodes: [],
                        edges: []
                    });
                    setFullGraphData({
                        nodes: [],
                        edges: []
                    });
                    setDiscoverParams(null);
                    setRightPanelTab('list');
                }, []);
                const handleSelectCommunity = (0, _react.useCallback)(async (community)=>{
                    setSelectedCommunity(community);
                    setRightPanelTab('detail');
                    centerOnCommunity(community.community_id);
                    setGraphLoading(true);
                    try {
                        const layer = (discoverParams === null || discoverParams === void 0 ? void 0 : discoverParams.layer) || 'all';
                        const data = await (0, _service.getCommunityGraph)(community.community_id, layer);
                        setGraphData({
                            nodes: data.nodes || [],
                            edges: data.edges || []
                        });
                    } catch  {
                        message.error('加载子图失败');
                    } finally{
                        setGraphLoading(false);
                    }
                }, [
                    discoverParams,
                    centerOnCommunity
                ]);
                const handleClearSelection = (0, _react.useCallback)(()=>{
                    setSelectedCommunity(null);
                    setGraphData({
                        nodes: [],
                        edges: []
                    });
                }, []);
                const handleExportCSV = (0, _react.useCallback)(()=>{
                    if (!selectedCommunity || graphData.nodes.length === 0) {
                        message.warning('请先选择一个群体');
                        return;
                    }
                    const nodeRows = graphData.nodes.map((n)=>{
                        var _n_properties, _n_properties1, _n_properties2;
                        const name = ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.title) || ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.COMPANY_NM) || '';
                        const type = (n.labels || [])[0] || 'Unknown';
                        return `${n.id},${name},${type}`;
                    });
                    const edgeRows = graphData.edges.map((e)=>`${e.source},${e.target},${e.label || ''}`);
                    const csv = 'id,name,type\n' + nodeRows.join('\n') + '\n\nsource,target,label\n' + edgeRows.join('\n');
                    const blob = new Blob([
                        '﻿' + csv
                    ], {
                        type: 'text/csv;charset=utf-8;'
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `community-${selectedCommunity.community_id}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    message.success('CSV 导出成功');
                }, [
                    selectedCommunity,
                    graphData
                ]);
                const handleExportPNG = (0, _react.useCallback)(()=>{
                    if (fullGraphData.nodes.length === 0) {
                        message.warning('暂无图数据可导出');
                        return;
                    }
                    downloadImage();
                    message.success('PNG 导出已触发');
                }, [
                    fullGraphData.nodes.length,
                    downloadImage
                ]);
                const handleViewFullGraph = (0, _react.useCallback)(()=>{
                    if (fullGraphData.nodes.length > 0 && selectedCommunity) {
                        centerOnCommunity(selectedCommunity.community_id);
                        message.info('已定位到当前群体');
                    }
                }, [
                    fullGraphData.nodes.length,
                    selectedCommunity,
                    centerOnCommunity
                ]);
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#f5f6f8'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 16px',
                                background: '#fff',
                                borderBottom: '1px solid #f0f0f0'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                    level: 5,
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {
                                            style: {
                                                marginRight: 8
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 206,
                                            columnNumber: 11
                                        }, this),
                                        "群体发现"
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 205,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_TopControlBar.default, {
                                    loading: loading,
                                    onDiscover: handleDiscover,
                                    onReset: handleReset
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 209,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 195,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                flex: 1,
                                display: 'flex',
                                overflow: 'hidden'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        flex: 1,
                                        minWidth: 0,
                                        position: 'relative',
                                        background: '#f9fafb'
                                    },
                                    children: [
                                        fullGraphData.nodes.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            ref: graphContainerRef,
                                            style: {
                                                width: '100%',
                                                height: '100%'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 228,
                                            columnNumber: 13
                                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                                description: loading ? '正在分析图谱结构...' : '选择算法，点击 ▶ 开始群体发现'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 242,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 233,
                                            columnNumber: 13
                                        }, this),
                                        graphLoading && fullGraphData.nodes.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                position: 'absolute',
                                                top: 12,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'rgba(255,255,255,0.9)',
                                                padding: '4px 12px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                color: '#999',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                            },
                                            children: "加载子图数据..."
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 254,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 219,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        width: 340,
                                        flexShrink: 0,
                                        padding: '8px 12px 8px 0',
                                        background: '#f5f6f8'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RightPanel.default, {
                                        result: result,
                                        selectedCommunity: selectedCommunity,
                                        graphData: graphData,
                                        graphLoading: graphLoading,
                                        onSelectCommunity: handleSelectCommunity,
                                        onClearSelection: handleClearSelection,
                                        onNodeClick: (node)=>{
                                            setSelectedNode(node);
                                            setDrawerVisible(true);
                                        },
                                        onExportCSV: handleExportCSV,
                                        onExportPNG: handleExportPNG,
                                        onViewFullGraph: handleViewFullGraph
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 282,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 274,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 217,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                            title: "节点详情",
                            width: 400,
                            onClose: ()=>setDrawerVisible(false),
                            open: drawerVisible,
                            children: selectedNode ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center',
                                            marginBottom: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    backgroundColor: ((_selectedNode_style = selectedNode.style) === null || _selectedNode_style === void 0 ? void 0 : _selectedNode_style.fill) || '#BFBFBF',
                                                    margin: '0 auto 8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontSize: 22,
                                                    fontWeight: 'bold'
                                                },
                                                children: ((_selectedNode_fullLabel = selectedNode.fullLabel) === null || _selectedNode_fullLabel === void 0 ? void 0 : _selectedNode_fullLabel[0]) || '?'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 310,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                                level: 5,
                                                style: {
                                                    margin: 0
                                                },
                                                children: selectedNode.fullLabel || selectedNode.label
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 327,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: (_selectedNode_style1 = selectedNode.style) === null || _selectedNode_style1 === void 0 ? void 0 : _selectedNode_style1.fill,
                                                children: selectedNode.typeKey || 'Unknown'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 330,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 309,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                        column: 1,
                                        bordered: true,
                                        size: "small",
                                        children: Object.entries(selectedNode.properties || {}).map(([key, val])=>{
                                            var _GENERAL_CONFIG_propertyMap_key, _GENERAL_CONFIG_propertyMap;
                                            if (val === null || val === undefined) return null;
                                            const label = ((_GENERAL_CONFIG_propertyMap = _graphConfig.GENERAL_CONFIG.propertyMap) === null || _GENERAL_CONFIG_propertyMap === void 0 ? void 0 : (_GENERAL_CONFIG_propertyMap_key = _GENERAL_CONFIG_propertyMap[key]) === null || _GENERAL_CONFIG_propertyMap_key === void 0 ? void 0 : _GENERAL_CONFIG_propertyMap_key.label) || key;
                                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: label,
                                                children: String(val).length > 100 ? String(val).substring(0, 100) + '...' : String(val)
                                            }, key, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 337,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 332,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {}, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 301,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                    lineNumber: 193,
                    columnNumber: 5
                }, this);
            };
            _s(CommunityDiscoveryPage, "qZlA25mgD2rR0biqyEqhgK8RTZw=", false, function() {
                return [
                    _antd.App.useApp,
                    _useCommunityGraph.useCommunityGraph
                ];
            });
            _c = CommunityDiscoveryPage;
            var _default = CommunityDiscoveryPage;
            var _c;
            $RefreshReg$(_c, "CommunityDiscoveryPage");
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
    runtime._h = '5814327383346879712';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.8002665489005251384.hot-update.js.map