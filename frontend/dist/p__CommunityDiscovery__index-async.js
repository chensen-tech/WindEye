((typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] = (typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] || []).push([
        ['p__CommunityDiscovery__index'],
{ "node_modules/@antv/g6/es/index.js": function (module, exports, __mako_require__){
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
    default: function() {
        return _default;
    },
    version: function() {
        return version;
    }
});
var _export_star = __mako_require__("@swc/helpers/_/_export_star");
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _g6pc = _interop_require_default._(_export_star._(__mako_require__("node_modules/@antv/g6-pc/es/index.js"), exports));
_g6pc.default.version = '4.8.23';
var _default = _g6pc.default;
var version = '4.8.23';

},
"src/pages/CommunityDiscovery/components/RightPanel.tsx": function (module, exports, __mako_require__){
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _react = _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _RiskAssessment = _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/RiskAssessment.tsx"));
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
    const listTab = (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            flex: 1,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 220px)'
        },
        children: result && result.communities.length > 0 ? (0, _jsxdevruntime.jsxDEV)(_antd.List, {
            size: "small",
            dataSource: result.communities,
            renderItem: (c, idx)=>(0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                    onClick: ()=>onSelectCommunity(c),
                    style: {
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) === c.community_id ? '#e6f7ff' : undefined,
                        borderLeft: (selectedCommunity === null || selectedCommunity === void 0 ? void 0 : selectedCommunity.community_id) === c.community_id ? `3px solid ${COMMUNITY_COLORS[idx % COMMUNITY_COLORS.length]}` : '3px solid transparent',
                        transition: 'all 0.2s'
                    },
                    children: (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: '100%'
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        size: 4,
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("span", {
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
                                            (0, _jsxdevruntime.jsxDEV)(Text, {
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
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
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
                                    (0, _jsxdevruntime.jsxDEV)(Text, {
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
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginTop: 4
                                },
                                children: Object.entries(c.label_distribution || {}).sort((a, b)=>b[1] - a[1]).slice(0, 2).map(([lbl, cnt])=>(0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
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
        }, this) : (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
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
    const topNodes = graphData.nodes.length > 0 ? Array.from(computeDegreeCentrality(graphData).values()).sort((a, b)=>b.degree - a.degree).slice(0, 8) : [];
    const detailTab = !selectedCommunity ? (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
        description: "在列表中点击一个群体查看详情",
        style: {
            padding: 40
        }
    }, void 0, false, {
        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            overflow: 'auto',
            maxHeight: 'calc(100vh - 220px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0'
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Text, {
                        strong: true,
                        style: {
                            fontSize: 14
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
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
            (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    8,
                    8
                ],
                children: [
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
            (0, _jsxdevruntime.jsxDEV)("div", {
                children: Object.entries(selectedCommunity.label_distribution || {}).map(([lbl, cnt])=>(0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
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
            topNodes.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                        size: "small",
                        dataSource: topNodes,
                        renderItem: ({ node, degree })=>{
                            const name = getNodeName(node);
                            return (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
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
                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                    size: 4,
                                    children: [
                                        (0, _jsxdevruntime.jsxDEV)("span", {
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
                                        (0, _jsxdevruntime.jsxDEV)(Text, {
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
                                        (0, _jsxdevruntime.jsxDEV)(Text, {
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
            (0, _jsxdevruntime.jsxDEV)(_RiskAssessment.default, {
                community: selectedCommunity
            }, void 0, false, {
                fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                direction: "vertical",
                style: {
                    width: '100%'
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                        block: true,
                        size: "small",
                        icon: (0, _jsxdevruntime.jsxDEV)(_icons.ExportOutlined, {}, void 0, false, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                        block: true,
                        size: "small",
                        icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                        block: true,
                        size: "small",
                        icon: (0, _jsxdevruntime.jsxDEV)(_icons.MonitorOutlined, {}, void 0, false, {
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
    const statsTab = !result ? (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
        description: "运行群体发现后查看统计",
        style: {
            padding: 40
        }
    }, void 0, false, {
        fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
        lineNumber: 307,
        columnNumber: 5
    }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            overflow: 'auto',
            maxHeight: 'calc(100vh - 220px)'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    12,
                    16
                ],
                children: [
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
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
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    marginTop: 16
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Text, {
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
                        return (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginBottom: 6
                            },
                            children: [
                                (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 11
                                    },
                                    children: [
                                        (0, _jsxdevruntime.jsxDEV)("span", {
                                            children: [
                                                "#",
                                                idx + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 336,
                                            columnNumber: 17
                                        }, this),
                                        (0, _jsxdevruntime.jsxDEV)("span", {
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
                                (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
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
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    marginTop: 16
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    ].sort((a, b)=>b.density - a.density).slice(0, 10).map((c, idx)=>(0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginBottom: 6
                            },
                            children: [
                                (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 11
                                    },
                                    children: [
                                        (0, _jsxdevruntime.jsxDEV)("span", {
                                            children: [
                                                "#",
                                                c.community_id + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/CommunityDiscovery/components/RightPanel.tsx",
                                            lineNumber: 359,
                                            columnNumber: 17
                                        }, this),
                                        (0, _jsxdevruntime.jsxDEV)("span", {
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
                                (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
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
    return (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
        },
        children: (0, _jsxdevruntime.jsxDEV)(_antd.Tabs, {
            size: "small",
            activeKey: activeTab,
            onChange: onTabChange,
            style: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            },
            tabBarStyle: {
                margin: '0 12px',
                paddingTop: 4
            },
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

},
"src/pages/CommunityDiscovery/components/RiskAssessment.tsx": function (module, exports, __mako_require__){
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
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
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
const RISK_COLORS = {
    high: '#f5222d',
    medium: '#faad14',
    low: '#52c41a'
};
const RISK_LABELS = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
};
const RISK_ICONS = {
    high: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AlertOutlined, {}, void 0, false, {
        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
        lineNumber: 26,
        columnNumber: 9
    }, this),
    medium: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.WarningOutlined, {}, void 0, false, {
        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
        lineNumber: 27,
        columnNumber: 11
    }, this),
    low: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CheckCircleOutlined, {}, void 0, false, {
        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
        lineNumber: 28,
        columnNumber: 8
    }, this)
};
function deriveRiskLevel(community) {
    const labelDist = community.label_distribution || {};
    const hasEvent = Object.keys(labelDist).some((l)=>[
            'Event',
            'RiskEvent',
            '事件',
            '风险事件'
        ].includes(l));
    const hasRegulation = Object.keys(labelDist).some((l)=>[
            'Regulation',
            '法规',
            'RegulatoryViolation'
        ].includes(l));
    let score = 15 + community.size * 2;
    if (hasEvent) score += 25;
    if (hasRegulation) score += 20;
    score = Math.min(score, 100);
    const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
    return {
        level,
        score
    };
}
const RiskAssessment = ({ community })=>{
    _s();
    const { level, score } = (0, _react.useMemo)(()=>deriveRiskLevel(community), [
        community
    ]);
    const labelDist = community.label_distribution || {};
    const eventCount = Object.entries(labelDist).filter(([l])=>[
            'Event',
            'RiskEvent',
            '事件',
            '风险事件'
        ].includes(l)).reduce((s, [, c])=>s + c, 0);
    const regulationCount = Object.entries(labelDist).filter(([l])=>[
            'Regulation',
            '法规',
            'RegulatoryViolation'
        ].includes(l)).reduce((s, [, c])=>s + c, 0);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
        size: "small",
        title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
            children: [
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {
                    style: {
                        marginRight: 6
                    }
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                    lineNumber: 69,
                    columnNumber: 11
                }, void 0),
                "风险评估"
            ]
        }, void 0, true, {
            fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
            lineNumber: 68,
            columnNumber: 9
        }, void 0),
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    textAlign: 'center',
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                        color: RISK_COLORS[level],
                        icon: RISK_ICONS[level],
                        style: {
                            fontSize: 15,
                            padding: '4px 16px',
                            lineHeight: '24px'
                        },
                        children: RISK_LABELS[level]
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                        percent: score,
                        size: "small",
                        strokeColor: score >= 60 ? RISK_COLORS.high : score >= 30 ? RISK_COLORS.medium : RISK_COLORS.low,
                        style: {
                            marginTop: 8
                        },
                        format: ()=>`${score}/100`
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                lineNumber: 74,
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
                            title: "风险事件",
                            value: eventCount,
                            valueStyle: {
                                fontSize: 20
                            }
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                            title: "法规关联",
                            value: regulationCount,
                            valueStyle: {
                                fontSize: 20
                            }
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                            title: "群体规模",
                            value: community.size,
                            valueStyle: {
                                fontSize: 20
                            }
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        span: 12,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                            title: "密度",
                            value: community.density.toFixed(2),
                            valueStyle: {
                                fontSize: 20
                            }
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    marginTop: 12
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                    type: "secondary",
                    style: {
                        fontSize: 11
                    },
                    children: level === 'high' ? '该群体风险较高，建议重点监控其动态变化。' : level === 'medium' ? '该群体存在一定风险，建议定期审查。' : '该群体风险较低，常规关注即可。'
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                    lineNumber: 117,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/CommunityDiscovery/components/RiskAssessment.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
};
_s(RiskAssessment, "H51Lm7DdgxxYcyrfxH3pMqFNmrI=");
_c = RiskAssessment;
var _default = RiskAssessment;
var _c;
$RefreshReg$(_c, "RiskAssessment");
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
"src/pages/CommunityDiscovery/components/TopControlBar.tsx": function (module, exports, __mako_require__){
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _react = _interop_require_default._(__mako_require__("node_modules/react/index.js"));
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
    return (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)(_antd.Segmented, {
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
            (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
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
            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                title: "最小群体规模",
                children: (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                    size: "small",
                    min: 1,
                    max: 50,
                    value: minSize,
                    onChange: (v)=>setMinSize(v ?? 3),
                    style: {
                        width: 56
                    },
                    variant: "borderless",
                    prefix: (0, _jsxdevruntime.jsxDEV)("span", {
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
            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                title: "最大节点数",
                children: (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
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
                    prefix: (0, _jsxdevruntime.jsxDEV)("span", {
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
            (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                size: 2,
                children: [
                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "开始发现",
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "primary",
                            size: "small",
                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.CaretRightOutlined, {}, void 0, false, {
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
                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "重置",
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            size: "small",
                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
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

},
"src/pages/CommunityDiscovery/hooks/useCommunityGraph.ts": function (module, exports, __mako_require__){
"use strict";
__mako_require__.d(exports, "__esModule", {
    value: true
});
__mako_require__.d(exports, "useCommunityGraph", {
    enumerable: true,
    get: function() {
        return useCommunityGraph;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _g6 = _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
var _react = __mako_require__("node_modules/react/index.js");
var _graphConfig = __mako_require__("src/pages/graphConfig.ts");
var _convexHull = __mako_require__("src/pages/CommunityDiscovery/utils/convexHull.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const NODE_STYLE_CONFIG = _graphConfig.GENERAL_CONFIG.nodeStyles;
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
let hullNodeRegistered = false;
function registerHullNode() {
    if (hullNodeRegistered) return;
    hullNodeRegistered = true;
    _g6.default.registerNode('community-hull', {
        draw (cfg, group) {
            const { hullPoints, hullFill } = cfg;
            if (!hullPoints || hullPoints.length < 3) return group.addShape('circle', {
                attrs: {
                    r: 0,
                    fill: 'transparent'
                }
            });
            const keyShape = group.addShape('polygon', {
                attrs: {
                    points: hullPoints,
                    fill: hullFill || '#5B8FF9',
                    stroke: hullFill || '#5B8FF9',
                    lineWidth: 1.5,
                    fillOpacity: 0.08,
                    strokeOpacity: 0.5,
                    lineDash: [
                        4,
                        4
                    ],
                    cursor: 'default'
                },
                name: 'hull-shape'
            });
            return keyShape;
        },
        getAnchorPoints () {
            return [
                [
                    0.5,
                    0.5
                ]
            ];
        }
    }, 'circle');
}
function useCommunityGraph(containerRef, options) {
    _s();
    const { graphData, selectedCommunityId, onNodeClick, onCommunityClick } = options;
    const graphRef = (0, _react.useRef)(null);
    const onNodeClickRef = (0, _react.useRef)(onNodeClick);
    onNodeClickRef.current = onNodeClick;
    const onCommunityClickRef = (0, _react.useRef)(onCommunityClick);
    onCommunityClickRef.current = onCommunityClick;
    registerHullNode();
    const destroyGraph = (0, _react.useCallback)(()=>{
        if (graphRef.current) {
            graphRef.current.destroy();
            graphRef.current = null;
        }
    }, []);
    (0, _react.useEffect)(()=>{
        if (!containerRef.current || !graphData.nodes.length) {
            destroyGraph();
            return;
        }
        destroyGraph();
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 600;
        const cx = width / 2;
        const cy = height / 2;
        const R = Math.min(width, height) * 0.32;
        const communityNodeMap = new Map();
        const nodes = graphData.nodes.map((n, idx)=>{
            var _n_properties, _n_properties1, _n_properties2;
            const labels = n.labels || [];
            let typeKey = 'Unknown';
            for (const lbl of labels)if (NODE_STYLE_CONFIG[lbl]) {
                typeKey = lbl;
                break;
            }
            const name = ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.title) || ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.COMPANY_NM) || '(unnamed)';
            const communityId = n._communityId ?? 0;
            const commColor = COMMUNITY_COLORS[communityId % COMMUNITY_COLORS.length];
            const nodeModel = {
                id: String(n.id),
                label: name.length > 8 ? name.substring(0, 8) + '...' : name,
                fullLabel: name,
                typeKey,
                communityId,
                properties: n.properties || {},
                style: {
                    fill: commColor,
                    stroke: '#fff',
                    lineWidth: 2,
                    r: 20
                },
                labelCfg: {
                    position: 'bottom',
                    offset: 6,
                    style: {
                        fill: '#666',
                        fontSize: 11
                    }
                }
            };
            if (!communityNodeMap.has(communityId)) communityNodeMap.set(communityId, []);
            communityNodeMap.get(communityId).push(nodeModel);
            return nodeModel;
        });
        const commIds = Array.from(communityNodeMap.keys()).sort((a, b)=>a - b);
        commIds.forEach((commId, ci)=>{
            const angle = 2 * Math.PI * ci / commIds.length - Math.PI / 2;
            const commCx = cx + R * Math.cos(angle);
            const commCy = cy + R * Math.sin(angle);
            const nodesInComm = communityNodeMap.get(commId) || [];
            const localR = Math.max(40, Math.min(120, nodesInComm.length * 8));
            nodesInComm.forEach((nodeModel, ni)=>{
                const la = 2 * Math.PI * ni / nodesInComm.length;
                const jitter = (Math.random() - 0.5) * localR * 0.4;
                nodeModel.x = commCx + (localR + jitter) * Math.cos(la);
                nodeModel.y = commCy + (localR + jitter) * Math.sin(la);
            });
        });
        const edges = graphData.edges.map((e)=>({
                source: String(e.source),
                target: String(e.target),
                label: e.label || '',
                style: {
                    stroke: '#d1d1d6',
                    lineWidth: 0.8,
                    opacity: 0.6,
                    endArrow: {
                        path: _g6.default.Arrow.triangle(5, 5, 0),
                        fill: '#d1d1d6'
                    }
                }
            }));
        const graph = new _g6.default.Graph({
            container: containerRef.current,
            width,
            height,
            fitView: true,
            fitViewPadding: 50,
            layout: {
                type: 'force',
                preventOverlap: true,
                nodeStrength: -300,
                edgeStrength: 0.12,
                linkDistance: 55,
                nodeSpacing: 20,
                alpha: 0.8,
                alphaDecay: 0.006,
                alphaMin: 0.001,
                gravity: 12
            },
            modes: {
                default: [
                    'drag-canvas',
                    'zoom-canvas',
                    'drag-node'
                ]
            },
            defaultNode: {
                size: 30
            },
            nodeStateStyles: {
                selected: {
                    stroke: '#1890ff',
                    lineWidth: 3,
                    shadowColor: 'rgba(24,144,255,0.5)',
                    shadowBlur: 10
                },
                dimmed: {
                    opacity: 0.15
                }
            },
            edgeStateStyles: {
                dimmed: {
                    opacity: 0.05
                }
            }
        });
        graph.data({
            nodes,
            edges
        });
        graph.render();
        graphRef.current = graph;
        let hullsDrawn = false;
        const drawHulls = ()=>{
            if (hullsDrawn) return;
            hullsDrawn = true;
            communityNodeMap.forEach((commNodes, commId)=>{
                if (commNodes.length < 3) return;
                const nodePositions = [];
                commNodes.forEach((model)=>{
                    const item = graph.findById(model.id);
                    if (item) {
                        const pos = item.getModel();
                        if (pos.x != null && pos.y != null) nodePositions.push([
                            pos.x,
                            pos.y
                        ]);
                    }
                });
                if (nodePositions.length < 3) return;
                const hull = (0, _convexHull.convexHull)(nodePositions);
                if (hull.length < 3) return;
                const [cx, cy] = (0, _convexHull.polygonCentroid)(hull);
                const relativePoints = hull.map(([x, y])=>[
                        x - cx,
                        y - cy
                    ]);
                const color = COMMUNITY_COLORS[commId % COMMUNITY_COLORS.length];
                graph.addItem('node', {
                    id: `hull-${commId}`,
                    type: 'community-hull',
                    x: cx,
                    y: cy,
                    hullPoints: relativePoints,
                    hullFill: color,
                    communityId: commId
                });
                const hullItem = graph.findById(`hull-${commId}`);
                if (hullItem) hullItem.toBack();
            });
            graph.paint();
        };
        const onAfterLayout = ()=>{
            setTimeout(drawHulls, 300);
        };
        graph.on('afterlayout', onAfterLayout);
        const fallbackTimer = setTimeout(drawHulls, 3000);
        graph.on('node:click', (evt)=>{
            var _evt_item, _onNodeClickRef_current;
            const model = (_evt_item = evt.item) === null || _evt_item === void 0 ? void 0 : _evt_item.getModel();
            if (!model) return;
            if (model.type === 'community-hull') {
                if (model.communityId != null) {
                    var _onCommunityClickRef_current;
                    (_onCommunityClickRef_current = onCommunityClickRef.current) === null || _onCommunityClickRef_current === void 0 || _onCommunityClickRef_current.call(onCommunityClickRef, model.communityId);
                }
                return;
            }
            const allNodes = graph.getNodes();
            allNodes.forEach((n)=>{
                const m = n.getModel();
                if (m.type === 'community-hull') return;
                graph.clearItemStates(n, 'selected');
            });
            graph.setItemState(evt.item, 'selected', true);
            (_onNodeClickRef_current = onNodeClickRef.current) === null || _onNodeClickRef_current === void 0 || _onNodeClickRef_current.call(onNodeClickRef, model);
        });
        graph.on('canvas:click', ()=>{
            const allNodes = graph.getNodes();
            allNodes.forEach((n)=>{
                graph.clearItemStates(n, 'selected');
            });
        });
        return ()=>{
            clearTimeout(fallbackTimer);
            graph.off('afterlayout', onAfterLayout);
            destroyGraph();
        };
    }, [
        graphData,
        containerRef,
        destroyGraph
    ]);
    (0, _react.useEffect)(()=>{
        const graph = graphRef.current;
        if (!graph) return;
        const allNodes = graph.getNodes();
        allNodes.forEach((n)=>{
            const model = n.getModel();
            if (model.type === 'community-hull') {
                if (selectedCommunityId != null && model.communityId === selectedCommunityId) graph.updateItem(n, {
                    style: {
                        fillOpacity: 0.18,
                        strokeOpacity: 0.9,
                        lineWidth: 2.5
                    }
                });
                else graph.updateItem(n, {
                    style: {
                        fillOpacity: 0.08,
                        strokeOpacity: 0.5,
                        lineWidth: 1.5
                    }
                });
            } else if (selectedCommunityId != null && model.communityId !== selectedCommunityId) graph.setItemState(n, 'dimmed', true);
            else graph.setItemState(n, 'dimmed', false);
        });
        graph.paint();
    }, [
        selectedCommunityId
    ]);
    const fitView = (0, _react.useCallback)(()=>{
        var _graphRef_current;
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.fitView(50);
    }, []);
    const downloadImage = (0, _react.useCallback)(()=>{
        var _graphRef_current;
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.downloadFullImage(`community-graph-${Date.now()}`, 'image/png', {
            backgroundColor: '#f9fafb',
            padding: 30
        });
    }, []);
    const centerOnCommunity = (0, _react.useCallback)((communityId)=>{
        const graph = graphRef.current;
        if (!graph) return;
        const hullNode = graph.findById(`hull-${communityId}`);
        if (hullNode) graph.focusItem(hullNode, true, {
            easing: 'easeCubic',
            duration: 600
        });
    }, []);
    return {
        graphInstance: graphRef.current,
        fitView,
        downloadImage,
        centerOnCommunity
    };
}
_s(useCommunityGraph, "F6clPC1RI9ME2U/yAChktQ3a3mw=");
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
"src/pages/CommunityDiscovery/index.tsx": function (module, exports, __mako_require__){
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _graphConfig = __mako_require__("src/pages/graphConfig.ts");
var _service = __mako_require__("src/pages/CommunityDiscovery/service.ts");
var _useCommunityGraph = __mako_require__("src/pages/CommunityDiscovery/hooks/useCommunityGraph.ts");
var _TopControlBar = _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/TopControlBar.tsx"));
var _RightPanel = _interop_require_default._(__mako_require__("src/pages/CommunityDiscovery/components/RightPanel.tsx"));
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
    const loadFullGraph = (0, _react.useCallback)(async (data, layer)=>{
        setGraphLoading(true);
        try {
            const topCommunities = data.communities.slice(0, 10);
            const results = await Promise.all(topCommunities.map((c)=>(0, _service.getCommunityGraph)(c.community_id, layer, 500).catch(()=>null)));
            const allNodes = [];
            const allEdges = [];
            const nodeSeen = new Set();
            results.forEach((g, idx)=>{
                if (!g) return;
                const communityId = topCommunities[idx].community_id;
                for (const n of g.nodes || []){
                    const key = String(n.id);
                    if (!nodeSeen.has(key)) {
                        nodeSeen.add(key);
                        n._communityId = communityId;
                        allNodes.push(n);
                    }
                }
                for (const e of g.edges || [])allEdges.push(e);
            });
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
        setRightPanelTab('list');
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
    return (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f5f6f8'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0'
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Title, {
                        level: 5,
                        style: {
                            margin: 0
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {
                                style: {
                                    marginRight: 8
                                }
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this),
                            "群体发现"
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this),
                    (0, _jsxdevruntime.jsxDEV)(_TopControlBar.default, {
                        loading: loading,
                        onDiscover: handleDiscover,
                        onReset: handleReset
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/CommunityDiscovery/index.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden'
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            flex: 1,
                            minWidth: 0,
                            position: 'relative',
                            background: '#f9fafb'
                        },
                        children: [
                            fullGraphData.nodes.length > 0 ? (0, _jsxdevruntime.jsxDEV)("div", {
                                ref: graphContainerRef,
                                style: {
                                    width: '100%',
                                    height: '100%'
                                }
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                },
                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                    description: loading ? '正在分析图谱结构...' : '选择算法，点击 ▶ 开始群体发现'
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 252,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/CommunityDiscovery/index.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            graphLoading && fullGraphData.nodes.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
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
                                lineNumber: 264,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this),
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: 340,
                            flexShrink: 0,
                            padding: '8px 12px 8px 0',
                            background: '#f5f6f8'
                        },
                        children: (0, _jsxdevruntime.jsxDEV)(_RightPanel.default, {
                            result: result,
                            selectedCommunity: selectedCommunity,
                            graphData: graphData,
                            graphLoading: graphLoading,
                            activeTab: rightPanelTab,
                            onTabChange: setRightPanelTab,
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
                            lineNumber: 292,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/CommunityDiscovery/index.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/CommunityDiscovery/index.tsx",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                title: "节点详情",
                width: 400,
                onClose: ()=>setDrawerVisible(false),
                open: drawerVisible,
                children: selectedNode ? (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                    children: [
                        (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                textAlign: 'center',
                                marginBottom: 16
                            },
                            children: [
                                (0, _jsxdevruntime.jsxDEV)("div", {
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
                                    lineNumber: 322,
                                    columnNumber: 15
                                }, this),
                                (0, _jsxdevruntime.jsxDEV)(Title, {
                                    level: 5,
                                    style: {
                                        margin: 0
                                    },
                                    children: selectedNode.fullLabel || selectedNode.label
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 339,
                                    columnNumber: 15
                                }, this),
                                (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                    color: (_selectedNode_style1 = selectedNode.style) === null || _selectedNode_style1 === void 0 ? void 0 : _selectedNode_style1.fill,
                                    children: selectedNode.typeKey || 'Unknown'
                                }, void 0, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 342,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 321,
                            columnNumber: 13
                        }, this),
                        (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                            column: 1,
                            bordered: true,
                            size: "small",
                            children: Object.entries(selectedNode.properties || {}).map(([key, val])=>{
                                var _GENERAL_CONFIG_propertyMap_key, _GENERAL_CONFIG_propertyMap;
                                if (val === null || val === undefined) return null;
                                const label = ((_GENERAL_CONFIG_propertyMap = _graphConfig.GENERAL_CONFIG.propertyMap) === null || _GENERAL_CONFIG_propertyMap === void 0 ? void 0 : (_GENERAL_CONFIG_propertyMap_key = _GENERAL_CONFIG_propertyMap[key]) === null || _GENERAL_CONFIG_propertyMap_key === void 0 ? void 0 : _GENERAL_CONFIG_propertyMap_key.label) || key;
                                return (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                    label: label,
                                    children: String(val).length > 100 ? String(val).substring(0, 100) + '...' : String(val)
                                }, key, false, {
                                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                                    lineNumber: 349,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "src/pages/CommunityDiscovery/index.tsx",
                            lineNumber: 344,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {}, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/index.tsx",
                    lineNumber: 359,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/CommunityDiscovery/index.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/CommunityDiscovery/index.tsx",
        lineNumber: 203,
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

},
"src/pages/CommunityDiscovery/service.ts": function (module, exports, __mako_require__){
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
    discoverCommunities: function() {
        return discoverCommunities;
    },
    getCommunityGraph: function() {
        return getCommunityGraph;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
async function discoverCommunities(params) {
    const searchParams = new URLSearchParams();
    if (params.layer && params.layer !== 'all') searchParams.append('layer', params.layer);
    if (params.method) searchParams.append('method', params.method);
    if (params.minSize) searchParams.append('min_community_size', String(params.minSize));
    searchParams.append('max_nodes', String(params.maxNodes));
    const response = await fetch(`/api/v1/graph/communities?${searchParams.toString()}`);
    return response.json();
}
async function getCommunityGraph(communityId, layer, limit = 200) {
    const searchParams = new URLSearchParams();
    if (layer && layer !== 'all') searchParams.append('layer', layer);
    searchParams.append('limit', String(limit));
    const response = await fetch(`/api/v1/graph/communities/${communityId}?${searchParams.toString()}`);
    return response.json();
}
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
"src/pages/CommunityDiscovery/utils/convexHull.ts": function (module, exports, __mako_require__){
/**
 * Monotone Chain (Andrew's algorithm) for computing convex hull in O(n log n).
 * Returns points in CCW order forming the convex polygon.
 */ "use strict";
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
    convexHull: function() {
        return convexHull;
    },
    polygonCentroid: function() {
        return polygonCentroid;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
function convexHull(points) {
    if (points.length <= 2) return [
        ...points
    ];
    const sorted = [
        ...points
    ].sort((a, b)=>a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b)=>(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of sorted){
        while(lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)lower.pop();
        lower.push(p);
    }
    const upper = [];
    for(let i = sorted.length - 1; i >= 0; i--){
        const p = sorted[i];
        while(upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)upper.pop();
        upper.push(p);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}
function polygonCentroid(points) {
    if (points.length === 0) return [
        0,
        0
    ];
    let sx = 0;
    let sy = 0;
    for (const [x, y] of points){
        sx += x;
        sy += y;
    }
    return [
        sx / points.length,
        sy / points.length
    ];
}
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
 }]);
//# sourceMappingURL=p__CommunityDiscovery__index-async.js.map