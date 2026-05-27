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
                }, []);
                const handleSelectCommunity = (0, _react.useCallback)(async (community)=>{
                    setSelectedCommunity(community);
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
                                            lineNumber: 203,
                                            columnNumber: 11
                                        }, this),
                                        "群体发现"
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 202,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_TopControlBar.default, {
                                    loading: loading,
                                    onDiscover: handleDiscover,
                                    onReset: handleReset
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 206,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 192,
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
                                            lineNumber: 225,
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
                                                lineNumber: 239,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 230,
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
                                            lineNumber: 251,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 216,
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
                                        lineNumber: 279,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 271,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 214,
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
                                                lineNumber: 307,
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
                                                lineNumber: 324,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: (_selectedNode_style1 = selectedNode.style) === null || _selectedNode_style1 === void 0 ? void 0 : _selectedNode_style1.fill,
                                                children: selectedNode.typeKey || 'Unknown'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 327,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 306,
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
                                                lineNumber: 334,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 329,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {}, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 344,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 298,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                    lineNumber: 190,
                    columnNumber: 5
                }, this);
            };
            _s(CommunityDiscoveryPage, "mrF1S7QDrtDJHtszI/2VpNn9TH4=", false, function() {
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
        },
        "src/pages/CommunityDiscovery/components/RightPanel.tsx": function(module, exports, __mako_require__) {
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
                COMMUNITY_COLORS: function() {
                    return COMMUNITY_COLORS;
                },
                default: function() {
                    return _default;
                }
            });
            var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
            var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
            var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
            var _RiskAssessment = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/RiskAssessment.tsx"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Text } = _antd.Typography;
            const LAYER_COLORS = {
                Subject: '#1890ff',
                Event: '#ff4d4f',
                Feature: '#52c41a',
                Regulation: '#722ed1'
            };
            const COMMUNITY_COLORS = [
                '#5B8FF9',
                '#5AD8A6',
                '#F6BD16',
                '#E8684A',
                '#9270CA',
                '#6DC8EC',
                '#FF9D4D',
                '#269A99',
                '#FF99C3',
                '#5D7092'
            ];
            function computeDegreeCentrality(graphData) {
                const degreeMap = new Map();
                for (const node of graphData.nodes)degreeMap.set(String(node.id), {
                    node,
                    degree: 0
                });
                for (const edge of graphData.edges){
                    const srcEntry = degreeMap.get(String(edge.source));
                    const tgtEntry = degreeMap.get(String(edge.target));
                    if (srcEntry) srcEntry.degree += 1;
                    if (tgtEntry) tgtEntry.degree += 1;
                }
                return degreeMap;
            }
            function getNodeName(n) {
                var _n_properties, _n_properties1, _n_properties2;
                return ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.title) || ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.COMPANY_NM) || '(unnamed)';
            }
            function getNodeLabel(n) {
                const labels = n.labels || [];
                return labels.length > 0 ? labels[0] : 'Unknown';
            }
            function getNodeColor(n) {
                for (const lbl of n.labels || []){
                    if (LAYER_COLORS[lbl]) return LAYER_COLORS[lbl];
                }
                return '#BFBFBF';
            }
            const RightPanel = ({ result, selectedCommunity, graphData, graphLoading, onSelectCommunity, onClearSelection, onNodeClick, onExportCSV, onExportPNG, onViewFullGraph })=>{
                var _result_modularity;
                _s();
                const { message } = _antd.App.useApp();
                const avgSize = result && result.communities.length > 0 ? Math.round(result.communities.reduce((s, c)=>s + c.size, 0) / result.communities.length) : 0;
                const maxSize = result && result.communities.length > 0 ? result.communities[0].size : 0;
                // ── Tab 1: Community List ──
                const listTab = /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        flex: 1,
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 220px)'
                    },
                    children: result && result.communities.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                        size: "small",
                        dataSource: result.communities,
                        renderItem: (c, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                                onClick: ()=>onSelectCommunity(c),
                                style: {
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    background: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) === c.community_id ? '#e6f7ff' : undefined,
                                    borderLeft: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) === c.community_id ? `3px solid ${COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}` : '3px solid transparent',
                                    transition: 'all 0.2s'
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        width: '100%'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                    size: 4,
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                display: 'inline-block',
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: 2,
                                                                backgroundColor: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                            lineNumber: 128,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                            strong: true,
                                                            style: {
                                                                fontSize: 13
                                                            },
                                                            children: [
                                                                "#",
                                                                idx + 1
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                            lineNumber: 137,
                                                            columnNumber: 21
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            style: {
                                                                fontSize: 10,
                                                                lineHeight: '16px'
                                                            },
                                                            children: [
                                                                c.size,
                                                                " 节点"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                            lineNumber: 140,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 19
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 11
                                                    },
                                                    children: [
                                                        "ρ=",
                                                        c.density.toFixed(2)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 19
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 126,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                marginTop: 4
                                            },
                                            children: Object.entries(c.label_distribution || {}).sort((a, b)=>b[1] - a[1]).slice(0, 2).map(([lbl, cnt])=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: LAYER_COLORS[lbl] || '#888',
                                                    style: {
                                                        fontSize: 10,
                                                        lineHeight: '16px'
                                                    },
                                                    children: [
                                                        lbl,
                                                        " ",
                                                        cnt
                                                    ]
                                                }, lbl, true, {
                                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 23
                                                }, void 0))
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 148,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 125,
                                    columnNumber: 15
                                }, void 0)
                            }, c.community_id, false, {
                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                        description: "配置参数后点击 ▶ 开始发现",
                        style: {
                            padding: 40
                        }
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 104,
                    columnNumber: 5
                }, this);
                // ── Tab 2: Community Detail ──
                const topNodes = graphData.nodes.length > 0 ? Array.from(computeDegreeCentrality(graphData).values()).sort((a, b)=>b.degree - a.degree).slice(0, 8) : [];
                const detailTab = !selectedCommunity ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                    image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                    description: "在列表中点击一个群体查看详情",
                    style: {
                        padding: 40
                    }
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 180,
                    columnNumber: 5
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 220px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 0'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    strong: true,
                                    style: {
                                        fontSize: 14
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                            style: {
                                                marginRight: 6
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 197,
                                            columnNumber: 11
                                        }, this),
                                        "群体 #",
                                        selectedCommunity.community_id + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 196,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    type: "text",
                                    size: "small",
                                    onClick: onClearSelection,
                                    children: "清除"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 200,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 188,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: [
                                8,
                                8
                            ],
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "节点数",
                                        value: selectedCommunity.size,
                                        loading: graphLoading,
                                        valueStyle: {
                                            fontSize: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 207,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 206,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "内部边",
                                        value: selectedCommunity.internal_edges,
                                        loading: graphLoading,
                                        valueStyle: {
                                            fontSize: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 210,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 209,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "密度",
                                        value: selectedCommunity.density.toFixed(3),
                                        loading: graphLoading,
                                        valueStyle: {
                                            fontSize: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 213,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 212,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "类型数",
                                        value: Object.keys(selectedCommunity.label_distribution).length,
                                        suffix: "种",
                                        loading: graphLoading,
                                        valueStyle: {
                                            fontSize: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 221,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 220,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 205,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            children: Object.entries(selectedCommunity.label_distribution || {}).map(([lbl, cnt])=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                    color: LAYER_COLORS[lbl] || '#888',
                                    children: [
                                        lbl,
                                        ": ",
                                        cnt
                                    ]
                                }, lbl, true, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 233,
                                    columnNumber: 11
                                }, this))
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 231,
                            columnNumber: 7
                        }, this),
                        topNodes.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "secondary",
                                    style: {
                                        fontSize: 11
                                    },
                                    children: "核心节点"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 242,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                                    size: "small",
                                    dataSource: topNodes,
                                    renderItem: ({ node, degree })=>{
                                        const name = getNodeName(node);
                                        return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                                            style: {
                                                cursor: 'pointer',
                                                padding: '4px 0'
                                            },
                                            onClick: ()=>{
                                                const label = getNodeLabel(node);
                                                onNodeClick({
                                                    id: String(node.id),
                                                    label: name.length > 8 ? name.substring(0, 8) + '...' : name,
                                                    fullLabel: name,
                                                    typeKey: label,
                                                    properties: node.properties || {},
                                                    style: {
                                                        fill: getNodeColor(node)
                                                    }
                                                });
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                size: 4,
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: 7,
                                                            height: 7,
                                                            borderRadius: '50%',
                                                            backgroundColor: getNodeColor(node)
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 264,
                                                        columnNumber: 21
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        style: {
                                                            fontSize: 12,
                                                            maxWidth: 120
                                                        },
                                                        ellipsis: true,
                                                        children: name
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 21
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 10
                                                        },
                                                        children: [
                                                            "d=",
                                                            degree
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 274,
                                                        columnNumber: 21
                                                    }, void 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 263,
                                                columnNumber: 19
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 249,
                                            columnNumber: 17
                                        }, void 0);
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 243,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 241,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskAssessment.default, {
                            community: selectedCommunity
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 284,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                            direction: "vertical",
                            style: {
                                width: '100%'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    block: true,
                                    size: "small",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExportOutlined, {}, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 288,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onExportPNG,
                                    children: "导出子图 (PNG)"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 288,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    block: true,
                                    size: "small",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 291,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onExportCSV,
                                    children: "导出数据 (CSV)"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 291,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    block: true,
                                    size: "small",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MonitorOutlined, {}, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 294,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onViewFullGraph,
                                    children: "查看全图"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 294,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 287,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 186,
                    columnNumber: 5
                }, this);
                // ── Tab 3: Statistics ──
                const statsTab = !result ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                    image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                    description: "运行群体发现后查看统计",
                    style: {
                        padding: 40
                    }
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 303,
                    columnNumber: 5
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 220px)'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: [
                                12,
                                16
                            ],
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "群体总数",
                                        value: result.communities_count
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 312,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 311,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "模块度",
                                        value: ((_result_modularity = result.modularity) === null || _result_modularity === void 0 ? void 0 : _result_modularity.toFixed(3)) || '-'
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 315,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 314,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "平均规模",
                                        value: avgSize
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 318,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 317,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "最大规模",
                                        value: maxSize
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 321,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 320,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 310,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginTop: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "secondary",
                                    style: {
                                        fontSize: 11
                                    },
                                    children: "规模分布"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 326,
                                    columnNumber: 9
                                }, this),
                                result.communities.slice(0, 10).map((c, idx)=>{
                                    const pct = maxSize > 0 ? c.size / maxSize * 100 : 0;
                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginBottom: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: 11
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: [
                                                            "#",
                                                            idx + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: c.size
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 331,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                                percent: pct,
                                                showInfo: false,
                                                size: "small",
                                                strokeColor: COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length],
                                                trailColor: "#f5f5f5"
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 335,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, c.community_id, true, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 330,
                                        columnNumber: 13
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 325,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginTop: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "secondary",
                                    style: {
                                        fontSize: 11
                                    },
                                    children: "密度分布"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 348,
                                    columnNumber: 9
                                }, this),
                                [
                                    ...result.communities
                                ].sort((a, b)=>b.density - a.density).slice(0, 10).map((c, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginBottom: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: 11
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: [
                                                            "#",
                                                            c.community_id + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 355,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: c.density.toFixed(2)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 356,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 354,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                                percent: Math.round(c.density * 100),
                                                showInfo: false,
                                                size: "small",
                                                strokeColor: c.density > 0.3 ? '#52c41a' : c.density > 0.1 ? '#faad14' : '#ff4d4f'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 358,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, c.community_id, true, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 347,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 309,
                    columnNumber: 5
                }, this);
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#fff',
                        borderRadius: 8,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0'
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tabs, {
                        size: "small",
                        style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column'
                        },
                        tabBarStyle: {
                            margin: '0 12px',
                            paddingTop: 4
                        },
                        defaultActiveKey: "list",
                        items: [
                            {
                                key: 'list',
                                label: '群体列表',
                                children: listTab
                            },
                            {
                                key: 'detail',
                                label: '群体详情',
                                children: detailTab
                            },
                            {
                                key: 'stats',
                                label: '统计',
                                children: statsTab
                            }
                        ]
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                        lineNumber: 382,
                        columnNumber: 7
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 371,
                    columnNumber: 5
                }, this);
            };
            _s(RightPanel, "jK2x0xwF+B89KTYv+aIIQKUGY1A=", false, function() {
                return [
                    _antd.App.useApp
                ];
            });
            _c = RightPanel;
            var _default = RightPanel;
            var _c;
            $RefreshReg$(_c, "RightPanel");
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
        },
        "src/pages/CommunityDiscovery/components/TopControlBar.tsx": function(module, exports, __mako_require__) {
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
            var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const LAYER_OPTIONS = [
                {
                    value: 'all',
                    label: '全部'
                },
                {
                    value: 'Subject',
                    label: '主体'
                },
                {
                    value: 'Event',
                    label: '事件'
                },
                {
                    value: 'Feature',
                    label: '特征'
                },
                {
                    value: 'Regulation',
                    label: '法规'
                }
            ];
            const TopControlBar = ({ loading, onDiscover, onReset })=>{
                _s();
                const [method, setMethod] = _react.default.useState('wcc');
                const [layer, setLayer] = _react.default.useState('all');
                const [minSize, setMinSize] = _react.default.useState(3);
                const [maxNodes, setMaxNodes] = _react.default.useState(5000);
                const handleDiscover = ()=>{
                    onDiscover({
                        layer,
                        method,
                        minSize,
                        maxNodes
                    });
                };
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 16px',
                        background: '#fff',
                        borderBottom: '1px solid #f0f0f0'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Segmented, {
                            size: "small",
                            value: method,
                            onChange: (v)=>setMethod(String(v)),
                            options: [
                                {
                                    value: 'wcc',
                                    label: 'WCC'
                                },
                                {
                                    value: 'louvain',
                                    label: 'Louvain'
                                },
                                {
                                    value: 'label_propagation',
                                    label: 'LPA'
                                }
                            ]
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                            lineNumber: 51,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                            size: "small",
                            value: layer,
                            onChange: setLayer,
                            options: LAYER_OPTIONS,
                            style: {
                                width: 80
                            },
                            variant: "borderless"
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                            lineNumber: 62,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                            title: "最小群体规模",
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                size: "small",
                                min: 1,
                                max: 50,
                                value: minSize,
                                onChange: (v)=>setMinSize(v ?? 3),
                                style: {
                                    width: 56
                                },
                                variant: "borderless",
                                prefix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                    style: {
                                        color: '#999',
                                        fontSize: 11
                                    },
                                    children: "≥"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                    lineNumber: 80,
                                    columnNumber: 19
                                }, void 0)
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                lineNumber: 72,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                            lineNumber: 71,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                            title: "最大节点数",
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                size: "small",
                                min: 100,
                                max: 10000,
                                step: 500,
                                value: maxNodes,
                                onChange: (v)=>setMaxNodes(v ?? 5000),
                                style: {
                                    width: 76
                                },
                                variant: "borderless",
                                prefix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                    style: {
                                        color: '#999',
                                        fontSize: 11
                                    },
                                    children: "≤"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                    lineNumber: 94,
                                    columnNumber: 19
                                }, void 0)
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                lineNumber: 85,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                            lineNumber: 84,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                            size: 2,
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                    title: "开始发现",
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "primary",
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CaretRightOutlined, {}, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                            lineNumber: 103,
                                            columnNumber: 19
                                        }, void 0),
                                        loading: loading,
                                        onClick: handleDiscover
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                        lineNumber: 100,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                    lineNumber: 99,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                    title: "重置",
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                            lineNumber: 111,
                                            columnNumber: 19
                                        }, void 0),
                                        onClick: onReset,
                                        disabled: loading
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                        lineNumber: 109,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                                    lineNumber: 108,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                            lineNumber: 98,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/components/TopControlBar.tsx",
                    lineNumber: 41,
                    columnNumber: 5
                }, this);
            };
            _s(TopControlBar, "OFhhKxR8pH25qxjoie+cPj5kiOY=");
            _c = TopControlBar;
            var _default = TopControlBar;
            var _c;
            $RefreshReg$(_c, "TopControlBar");
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
    runtime._h = '11028649724466031060';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.172497406803541179.hot-update.js.map