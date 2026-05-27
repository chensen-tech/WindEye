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
            var _DiscoveryConfig = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx"));
            var _CommunityDetail = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/CommunityDetail.tsx"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Title, Text } = _antd.Typography;
            const LAYER_COLORS = {
                Subject: '#1890ff',
                Event: '#ff4d4f',
                Feature: '#52c41a',
                Regulation: '#722ed1'
            };
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
                const [graphLoading, setGraphLoading] = (0, _react.useState)(false);
                const [drawerVisible, setDrawerVisible] = (0, _react.useState)(false);
                const [selectedNode, setSelectedNode] = (0, _react.useState)(null);
                const [searchText, setSearchText] = (0, _react.useState)('');
                const [discoverParams, setDiscoverParams] = (0, _react.useState)(null);
                const [activeTab, setActiveTab] = (0, _react.useState)('list');
                const [fullGraphData, setFullGraphData] = (0, _react.useState)({
                    nodes: [],
                    edges: []
                });
                const graphContainerRef = (0, _react.useRef)(null);
                const fullGraphContainerRef = (0, _react.useRef)(null);
                const { downloadImage } = (0, _useCommunityGraph.useCommunityGraph)(graphContainerRef, {
                    graphData,
                    onNodeClick: (model)=>{
                        setSelectedNode(model);
                        setDrawerVisible(true);
                    }
                });
                (0, _useCommunityGraph.useCommunityGraph)(fullGraphContainerRef, {
                    graphData: fullGraphData,
                    onNodeClick: (model)=>{
                        // Find which community this node belongs to and select it
                        if (result) for (const c of result.communities){
                            const nodeIds = graphData.nodes.map((n)=>String(n.id));
                            if (nodeIds.includes(String(model.id))) {
                                handleSelectCommunity(c);
                                break;
                            }
                        }
                        setSelectedNode(model);
                        setDrawerVisible(true);
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
                        } else message.error(data.error || '群体发现失败');
                    } catch  {
                        message.error('服务连接失败');
                    } finally{
                        setLoading(false);
                    }
                }, []);
                const handleSelectCommunity = (0, _react.useCallback)(async (community)=>{
                    setSelectedCommunity(community);
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
                    discoverParams
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
                    setSearchText('');
                }, []);
                const handleViewFullGraph = (0, _react.useCallback)(async ()=>{
                    if (!result || !discoverParams) return;
                    setActiveTab('graph');
                    if (fullGraphData.nodes.length > 0) return;
                    // Build merged graph data from all communities
                    setGraphLoading(true);
                    try {
                        const layer = discoverParams.layer || 'all';
                        const allNodes = [];
                        const allEdges = [];
                        const nodeSeen = new Set();
                        for (const c of result.communities.slice(0, 10)){
                            const data = await (0, _service.getCommunityGraph)(c.community_id, layer, 100);
                            for (const n of data.nodes || []){
                                const key = String(n.id);
                                if (!nodeSeen.has(key)) {
                                    nodeSeen.add(key);
                                    n._communityId = c.community_id;
                                    allNodes.push(n);
                                }
                            }
                            for (const e of data.edges || [])allEdges.push(e);
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
                }, [
                    result,
                    discoverParams,
                    fullGraphData.nodes.length
                ]);
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
                    if (graphData.nodes.length === 0) {
                        message.warning('暂无图数据可导出');
                        return;
                    }
                    downloadImage();
                    message.success('PNG 导出已触发');
                }, [
                    graphData.nodes.length,
                    downloadImage
                ]);
                // ── Filtered communities ──
                const filteredCommunities = (result === null || result === void 0 ? void 0 : result.communities.filter((c)=>{
                    var _c_top_entities;
                    if (!searchText) return true;
                    const text = searchText.toLowerCase();
                    const topNames = ((_c_top_entities = c.top_entities) === null || _c_top_entities === void 0 ? void 0 : _c_top_entities.map((e)=>e.name.toLowerCase()).join(' ')) || '';
                    return String(c.community_id + 1).includes(text) || topNames.includes(text);
                })) || [];
                // ── Community table columns ──
                const communityColumns = [
                    {
                        title: '#',
                        dataIndex: 'community_id',
                        width: 48,
                        render: (_, __, idx)=>idx + 1
                    },
                    {
                        title: '规模',
                        dataIndex: 'size',
                        width: 64,
                        sorter: (a, b)=>a.size - b.size,
                        render: (v)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                strong: true,
                                children: v
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 236,
                                columnNumber: 30
                            }, this)
                    },
                    {
                        title: '密度',
                        dataIndex: 'density',
                        width: 90,
                        sorter: (a, b)=>a.density - b.density,
                        render: (v)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                percent: Math.round(v * 100),
                                size: "small",
                                format: ()=>v.toFixed(2),
                                strokeColor: v > 0.3 ? '#52c41a' : v > 0.1 ? '#faad14' : '#ff4d4f'
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 244,
                                columnNumber: 9
                            }, this)
                    },
                    {
                        title: '主要类型',
                        dataIndex: 'label_distribution',
                        width: 110,
                        render: (dist)=>{
                            const sorted = Object.entries(dist || {}).sort((a, b)=>b[1] - a[1]);
                            if (!sorted.length) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                children: "未知"
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 258,
                                columnNumber: 36
                            }, this);
                            const [topLabel, count] = sorted[0];
                            const total = sorted.reduce((s, [, c])=>s + c, 0);
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                color: LAYER_COLORS[topLabel] || '#888',
                                children: [
                                    topLabel,
                                    " (",
                                    total > 0 ? Math.round(count / total * 100) : 0,
                                    "%)"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 262,
                                columnNumber: 11
                            }, this);
                        }
                    },
                    {
                        title: '代表实体',
                        dataIndex: 'top_entities',
                        render: (entities)=>entities === null || entities === void 0 ? void 0 : entities.slice(0, 3).map((e, i)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                    style: {
                                        marginBottom: 4
                                    },
                                    children: e.name
                                }, i, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 273,
                                    columnNumber: 11
                                }, this))
                    }
                ];
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        padding: '0 16px'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                            level: 4,
                            style: {
                                marginBottom: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {
                                    style: {
                                        marginRight: 8
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 283,
                                    columnNumber: 9
                                }, this),
                                "群体发现"
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 282,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                height: 'calc(100vh - 160px)'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_DiscoveryConfig.default, {
                                    loading: loading,
                                    onDiscover: handleDiscover,
                                    onReset: handleReset,
                                    result: result
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 289,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        gap: 16,
                                        flex: 1,
                                        minHeight: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column'
                                            },
                                            children: result ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tabs, {
                                                activeKey: activeTab,
                                                onChange: setActiveTab,
                                                style: {
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                },
                                                tabBarExtraContent: activeTab === 'list' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Input.Search, {
                                                    placeholder: "搜索群体ID或实体名...",
                                                    allowClear: true,
                                                    size: "small",
                                                    style: {
                                                        width: 200
                                                    },
                                                    value: searchText,
                                                    onChange: (e)=>setSearchText(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 21
                                                }, void 0) : null,
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tabs.TabPane, {
                                                        tab: "群体列表",
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                                            dataSource: filteredCommunities,
                                                            columns: communityColumns,
                                                            rowKey: "community_id",
                                                            size: "small",
                                                            loading: loading,
                                                            pagination: {
                                                                pageSize: 15,
                                                                size: 'small',
                                                                showSizeChanger: false
                                                            },
                                                            scroll: {
                                                                y: 'calc(100vh - 320px)'
                                                            },
                                                            onRow: (record)=>({
                                                                    onClick: ()=>handleSelectCommunity(record),
                                                                    style: {
                                                                        background: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) === record.community_id ? '#e6f7ff' : undefined,
                                                                        cursor: 'pointer'
                                                                    }
                                                                })
                                                        }, void 0, false, {
                                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, "list", false, {
                                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tabs.TabPane, {
                                                        tab: "图谱概览",
                                                        children: fullGraphData.nodes.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            ref: fullGraphContainerRef,
                                                            style: {
                                                                width: '100%',
                                                                height: 'calc(100vh - 320px)',
                                                                background: '#fafafa',
                                                                borderRadius: 8
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 21
                                                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                            size: "small",
                                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                                                description: "点击「查看全图」加载群体概览图谱",
                                                                style: {
                                                                    padding: 60
                                                                },
                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                    type: "primary",
                                                                    loading: graphLoading,
                                                                    onClick: handleViewFullGraph,
                                                                    children: "加载全图"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                                    lineNumber: 351,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                                lineNumber: 347,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                            lineNumber: 346,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, "graph", false, {
                                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 301,
                                                columnNumber: 15
                                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                size: "small",
                                                style: {
                                                    flex: 1
                                                },
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                                    description: loading ? '正在发现群体...' : '选择算法后点击「开始发现」，然后在群体列表中选择一个群体查看详情',
                                                    style: {
                                                        padding: 80
                                                    },
                                                    children: loading && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                                        size: "large"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                        lineNumber: 373,
                                                        columnNumber: 31
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                    lineNumber: 365,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 364,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 299,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                width: 360,
                                                flexShrink: 0
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_CommunityDetail.default, {
                                                community: selectedCommunity,
                                                graphData: graphData,
                                                graphLoading: graphLoading,
                                                onClear: ()=>{
                                                    setSelectedCommunity(null);
                                                    setGraphData({
                                                        nodes: [],
                                                        edges: []
                                                    });
                                                },
                                                onNodeClick: (node)=>{
                                                    setSelectedNode(node);
                                                    setDrawerVisible(true);
                                                },
                                                onExportCSV: handleExportCSV,
                                                onExportPNG: handleExportPNG,
                                                onViewFullGraph: handleViewFullGraph
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 381,
                                                columnNumber: 13
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                                            lineNumber: 380,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 297,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 287,
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
                                                lineNumber: 411,
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
                                                lineNumber: 428,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: (_selectedNode_style1 = selectedNode.style) === null || _selectedNode_style1 === void 0 ? void 0 : _selectedNode_style1.fill,
                                                children: selectedNode.typeKey || 'Unknown'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                                lineNumber: 431,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 410,
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
                                                lineNumber: 438,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                                        lineNumber: 433,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {}, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 402,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                    lineNumber: 281,
                    columnNumber: 5
                }, this);
            };
            _s(CommunityDiscoveryPage, "P0Pro/1Ko3mBetEdvph40AAJP4s=", false, function() {
                return [
                    _antd.App.useApp,
                    _useCommunityGraph.useCommunityGraph,
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
    runtime._h = '17913397056008345795';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.9831507095799633632.hot-update.js.map