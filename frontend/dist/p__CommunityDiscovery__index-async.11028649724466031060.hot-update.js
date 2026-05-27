globalThis.makoModuleHotUpdate('p__CommunityDiscovery__index', {
    modules: {
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
            const RightPanel = ({ result, selectedCommunity, graphData, graphLoading, activeTab, onTabChange, onSelectCommunity, onClearSelection, onNodeClick, onExportCSV, onExportPNG, onViewFullGraph })=>{
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
                                                            lineNumber: 132,
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
                                                            lineNumber: 141,
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
                                                            lineNumber: 144,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                    lineNumber: 131,
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
                                                    lineNumber: 148,
                                                    columnNumber: 19
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 130,
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
                                                    lineNumber: 157,
                                                    columnNumber: 23
                                                }, void 0))
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 152,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 129,
                                    columnNumber: 15
                                }, void 0)
                            }, c.community_id, false, {
                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                        description: "配置参数后点击 ▶ 开始发现",
                        style: {
                            padding: 40
                        }
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 108,
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
                    lineNumber: 184,
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
                                            lineNumber: 201,
                                            columnNumber: 11
                                        }, this),
                                        "群体 #",
                                        selectedCommunity.community_id + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 200,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    type: "text",
                                    size: "small",
                                    onClick: onClearSelection,
                                    children: "清除"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 204,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 192,
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
                                        lineNumber: 211,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 210,
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
                                        lineNumber: 214,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 213,
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
                                        lineNumber: 217,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 216,
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
                                        lineNumber: 225,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 224,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 209,
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
                                    lineNumber: 237,
                                    columnNumber: 11
                                }, this))
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 235,
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
                                    lineNumber: 246,
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
                                                        lineNumber: 268,
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
                                                        lineNumber: 277,
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
                                                        lineNumber: 278,
                                                        columnNumber: 21
                                                    }, void 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 267,
                                                columnNumber: 19
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 253,
                                            columnNumber: 17
                                        }, void 0);
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 247,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 245,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskAssessment.default, {
                            community: selectedCommunity
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 288,
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
                                        lineNumber: 292,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onExportPNG,
                                    children: "导出子图 (PNG)"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 292,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    block: true,
                                    size: "small",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 295,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onExportCSV,
                                    children: "导出数据 (CSV)"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 295,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    block: true,
                                    size: "small",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MonitorOutlined, {}, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 298,
                                        columnNumber: 42
                                    }, void 0),
                                    onClick: onViewFullGraph,
                                    children: "查看全图"
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 298,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 291,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 190,
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
                    lineNumber: 307,
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
                                        lineNumber: 316,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 315,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "模块度",
                                        value: ((_result_modularity = result.modularity) === null || _result_modularity === void 0 ? void 0 : _result_modularity.toFixed(3)) || '-'
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 319,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 318,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "平均规模",
                                        value: avgSize
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 322,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 321,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 12,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "最大规模",
                                        value: maxSize
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 325,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                    lineNumber: 324,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 314,
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
                                    lineNumber: 330,
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
                                                        lineNumber: 336,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: c.size
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 335,
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
                                                lineNumber: 339,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, c.community_id, true, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 334,
                                        columnNumber: 13
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 329,
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
                                    lineNumber: 352,
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
                                                        lineNumber: 359,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        children: c.density.toFixed(2)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 358,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                                percent: Math.round(c.density * 100),
                                                showInfo: false,
                                                size: "small",
                                                strokeColor: c.density > 0.3 ? '#52c41a' : c.density > 0.1 ? '#faad14' : '#ff4d4f'
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                                lineNumber: 362,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, c.community_id, true, {
                                        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                        lineNumber: 357,
                                        columnNumber: 13
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                            lineNumber: 351,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 313,
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
                        lineNumber: 386,
                        columnNumber: 7
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                    lineNumber: 375,
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
        }
    }
}, function(runtime) {
    runtime._h = '11872419083294735112';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.11028649724466031060.hot-update.js.map