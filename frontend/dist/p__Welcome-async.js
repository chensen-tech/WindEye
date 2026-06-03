((typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] = (typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] || []).push([
        ['p__Welcome'],
{ "src/pages/Welcome.tsx": function (module, exports, __mako_require__){
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
var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
var _max = __mako_require__("src/.umi/exports.ts");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _echartsforreact = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/echarts-for-react/esm/index.js"));
var _dashboard = __mako_require__("src/services/dashboard.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
var _s1 = $RefreshSig$();
var _s2 = $RefreshSig$();
const { Title, Text } = _antd.Typography;
// ══════════════════════════════════════════════════════════════════════════════
// Phase 1: Unified Layer Color System
// ══════════════════════════════════════════════════════════════════════════════
const LAYER_THEME = {
    Subject: {
        name: '主体层',
        color: '#2563EB',
        light: '#EFF6FF',
        border: '#BFDBFE'
    },
    Event: {
        name: '事件层',
        color: '#DC2626',
        light: '#FEF2F2',
        border: '#FECACA'
    },
    Feature: {
        name: '特征层',
        color: '#EA580C',
        light: '#FFF7ED',
        border: '#FED7AA'
    },
    Regulation: {
        name: '法规层',
        color: '#7C3AED',
        light: '#F5F3FF',
        border: '#DDD6FE'
    }
};
const LAYER_ORDER = [
    'Subject',
    'Event',
    'Feature',
    'Regulation'
];
const RISK_COLORS = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#2563EB'
};
const CARD_STYLE = {
    borderRadius: 12,
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)'
};
// ══════════════════════════════════════════════════════════════════════════════
// Phase 2: Sparkline Micro-Chart
// ══════════════════════════════════════════════════════════════════════════════
const genTrendData = (seed, points = 7)=>{
    const data = [];
    let v = Math.max(seed * 0.6, 1);
    for(let i = 0; i < points; i++){
        v = Math.max(1, v + (Math.random() - 0.45) * v * 0.3);
        data.push(Math.round(v));
    }
    data[data.length - 1] = seed;
    return data;
};
const Sparkline = ({ data, color, height = 36 })=>{
    _s();
    const option = (0, _react.useMemo)(()=>({
            grid: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            xAxis: {
                type: 'category',
                data: data.map((_, i)=>i),
                show: false
            },
            yAxis: {
                type: 'value',
                show: false,
                min: Math.min(...data) * 0.9
            },
            series: [
                {
                    type: 'line',
                    data,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        color,
                        width: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: `${color}30`
                                },
                                {
                                    offset: 1,
                                    color: `${color}05`
                                }
                            ]
                        }
                    }
                }
            ]
        }), [
        data,
        color
    ]);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
        option: option,
        style: {
            height,
            width: '100%'
        },
        notMerge: true
    }, void 0, false, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 120,
        columnNumber: 10
    }, this);
};
_s(Sparkline, "AEVhVam2GKnGDg9x7yKTM1GUxDk=");
_c = Sparkline;
// ══════════════════════════════════════════════════════════════════════════════
// KPI Card (upgraded with sparkline + trend arrow)
// ══════════════════════════════════════════════════════════════════════════════
const KPICard = ({ title, value, icon, color, suffix, loading, trendData, trendPct })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
        style: CARD_STYLE,
        styles: {
            body: {
                padding: '20px 20px 12px'
            }
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: `${color}14`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            color,
                            flexShrink: 0,
                            marginTop: 2
                        },
                        children: icon
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 139,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            flex: 1,
                            minWidth: 0
                        },
                        children: loading ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                            size: "small"
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                    title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        style: {
                                            fontSize: 12,
                                            color: '#94A3B8'
                                        },
                                        children: title
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 152,
                                        columnNumber: 22
                                    }, void 0),
                                    value: value,
                                    suffix: suffix ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 12,
                                            color: '#94A3B8'
                                        },
                                        children: suffix
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 154,
                                        columnNumber: 32
                                    }, void 0) : undefined,
                                    valueStyle: {
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: '#0F172A'
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 151,
                                    columnNumber: 13
                                }, this),
                                trendPct !== undefined && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                    style: {
                                        fontSize: 12,
                                        color: trendPct >= 0 ? '#10B981' : '#EF4444',
                                        fontWeight: 500
                                    },
                                    children: [
                                        trendPct >= 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CaretUpOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 159,
                                            columnNumber: 34
                                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CaretDownOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 159,
                                            columnNumber: 56
                                        }, this),
                                        ' ',
                                        Math.abs(trendPct),
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 146,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 138,
                columnNumber: 5
            }, this),
            trendData && !loading && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Sparkline, {
                data: trendData,
                color: color
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 167,
                columnNumber: 31
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 137,
        columnNumber: 3
    }, this);
_c1 = KPICard;
// ══════════════════════════════════════════════════════════════════════════════
// Quick Action Card
// ══════════════════════════════════════════════════════════════════════════════
const QuickAction = ({ icon, title, desc, color, path })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
        hoverable: true,
        style: {
            ...CARD_STYLE,
            height: '100%'
        },
        onClick: ()=>_max.history.push(path),
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '4px 0'
            },
            children: [
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `${color}14`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        color,
                        marginBottom: 10
                    },
                    children: icon
                }, void 0, false, {
                    fileName: "src/pages/Welcome.tsx",
                    lineNumber: 180,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                    strong: true,
                    style: {
                        fontSize: 14,
                        marginBottom: 2
                    },
                    children: title
                }, void 0, false, {
                    fileName: "src/pages/Welcome.tsx",
                    lineNumber: 187,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                    style: {
                        fontSize: 11,
                        color: '#94A3B8'
                    },
                    children: desc
                }, void 0, false, {
                    fileName: "src/pages/Welcome.tsx",
                    lineNumber: 188,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 179,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 178,
        columnNumber: 3
    }, this);
_c2 = QuickAction;
// ══════════════════════════════════════════════════════════════════════════════
// Section Title
// ══════════════════════════════════════════════════════════════════════════════
const SectionTitle = ({ title, accentColor = '#2563EB' })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 0
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: accentColor,
                    flexShrink: 0
                }
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 199,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                strong: true,
                style: {
                    fontSize: 15,
                    color: '#0F172A'
                },
                children: title
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 200,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 198,
        columnNumber: 3
    }, this);
_c3 = SectionTitle;
// ══════════════════════════════════════════════════════════════════════════════
// Phase 3: Sankey Chart — cross-layer risk flow
// ══════════════════════════════════════════════════════════════════════════════
const buildSankeyOption = (crossStats)=>{
    const nodes = LAYER_ORDER.map((key)=>({
            name: LAYER_THEME[key].name,
            itemStyle: {
                color: LAYER_THEME[key].color
            },
            label: {
                fontSize: 12,
                fontWeight: 600
            }
        }));
    const links = [];
    if (crossStats === null || crossStats === void 0 ? void 0 : crossStats.cross_layer_rels) {
        const cr = crossStats.cross_layer_rels;
        const pairs = [
            [
                'Subject',
                'Event'
            ],
            [
                'Event',
                'Feature'
            ],
            [
                'Feature',
                'Regulation'
            ],
            [
                'Subject',
                'Feature'
            ],
            [
                'Event',
                'Regulation'
            ],
            [
                'Subject',
                'Regulation'
            ]
        ];
        for (const [from, to] of pairs){
            var _cr_key;
            const key = `${from}_to_${to}`;
            if (((_cr_key = cr[key]) === null || _cr_key === void 0 ? void 0 : _cr_key.count) > 0) links.push({
                source: LAYER_THEME[from].name,
                target: LAYER_THEME[to].name,
                value: cr[key].count
            });
        }
    }
    const totalOutflow = {};
    for (const link of links)totalOutflow[link.source] = (totalOutflow[link.source] || 0) + link.value;
    return {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter: (params)=>{
                if (params.dataType === 'edge') {
                    const total = totalOutflow[params.data.source] || 1;
                    const pct = (params.value / total * 100).toFixed(1);
                    return `<b>${params.data.source}</b> → <b>${params.data.target}</b><br/>流转量: <b>${params.value.toLocaleString()}</b><br/>占源节点流出: <b>${pct}%</b>`;
                }
                return `<b>${params.name}</b>`;
            }
        },
        series: [
            {
                type: 'sankey',
                layout: 'none',
                layoutIterations: 0,
                nodeWidth: 22,
                nodeGap: 14,
                emphasis: {
                    focus: 'adjacency'
                },
                lineStyle: {
                    color: 'gradient',
                    curveness: 0.5,
                    opacity: 0.45
                },
                data: nodes,
                links
            }
        ]
    };
};
// ══════════════════════════════════════════════════════════════════════════════
// Phase 4: Top10 High-Risk Entities Table
// ══════════════════════════════════════════════════════════════════════════════
const MAX_WARNINGS = 10;
const entityColumns = [
    {
        title: '主体名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                strong: true,
                style: {
                    fontSize: 13
                },
                children: text || '(未命名)'
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 282,
                columnNumber: 31
            }, this)
    },
    {
        title: '类型',
        dataIndex: 'labels',
        key: 'labels',
        width: 80,
        render: (labels)=>{
            const label = (labels === null || labels === void 0 ? void 0 : labels.find((l)=>[
                    'COMPANY',
                    'PERSON',
                    'PFCOMPANY',
                    'PFUND'
                ].includes(l))) || (labels === null || labels === void 0 ? void 0 : labels[0]) || '?';
            const typeColors = {
                COMPANY: 'blue',
                PERSON: 'cyan',
                PFCOMPANY: 'purple',
                PFUND: 'green'
            };
            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                color: typeColors[label] || 'default',
                style: {
                    borderRadius: 6
                },
                children: label
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 294,
                columnNumber: 14
            }, this);
        }
    },
    {
        title: '预警数',
        dataIndex: 'warning_num',
        key: 'warning_num',
        width: 100,
        sorter: (a, b)=>a.warning_num - b.warning_num,
        defaultSortOrder: 'descend',
        render: (v)=>{
            const pct = Math.min(v / MAX_WARNINGS * 100, 100);
            const isHigh = v >= 5;
            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: 26,
                    display: 'flex',
                    alignItems: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${pct}%`,
                            borderRadius: 4,
                            background: isHigh ? 'linear-gradient(90deg, #FEE2E2, #FECACA)' : 'linear-gradient(90deg, #FEF9C3, #FDE68A)',
                            transition: 'width 0.6s ease'
                        }
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 309,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                        style: {
                            position: 'relative',
                            zIndex: 1,
                            fontWeight: 700,
                            paddingLeft: 10,
                            fontSize: 13,
                            color: isHigh ? '#DC2626' : '#B45309'
                        },
                        children: v
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 316,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 308,
                columnNumber: 9
            }, this);
        }
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (s)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Badge, {
                status: s === '吊销' ? 'error' : s === '存续' ? 'success' : 'default',
                text: s || '-'
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 329,
                columnNumber: 7
            }, this)
    },
    {
        title: '关联数',
        dataIndex: 'related_count',
        key: 'related_count',
        width: 70,
        align: 'center'
    },
    {
        title: '',
        key: 'actions',
        width: 60,
        render: (_, record)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                type: "link",
                size: "small",
                onClick: ()=>_max.history.push(`/knowledge-graph?q=${encodeURIComponent(record.name)}`),
                children: "查看"
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 347,
                columnNumber: 7
            }, this)
    }
];
const MOCK_ACTIVITIES = [
    {
        id: 'mock-1',
        level: 'high',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        relativeTime: '10 分钟前',
        agentName: '分析智能体',
        title: '发现可疑资金回流路径',
        description: '华创地产与新成立空壳公司存在可疑资金回流，已关联至违规特征，建议立即冻结。',
        layerTags: [
            'Subject',
            'Event'
        ],
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RobotOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 379,
            columnNumber: 44
        }, this)
    },
    {
        id: 'mock-2',
        level: 'medium',
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        relativeTime: '25 分钟前',
        agentName: '合规智能体',
        title: '匹配到 3 条反洗钱法规条款',
        description: '涉及《反洗钱法》第32条、《金融机构大额交易和可疑交易报告管理办法》第10条。',
        layerTags: [
            'Regulation'
        ],
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AuditOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 385,
            columnNumber: 38
        }, this)
    },
    {
        id: 'mock-3',
        level: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        relativeTime: '1 小时前',
        agentName: '检索智能体',
        title: '图谱新增高风险节点 "张某"',
        description: '从最新工商变更记录中识别出与 3 家吊销企业存在关联的自然人。',
        layerTags: [
            'Subject'
        ],
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 391,
            columnNumber: 35
        }, this)
    },
    {
        id: 'mock-4',
        level: 'low',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        relativeTime: '2 小时前',
        agentName: '图谱构建管线',
        title: '事件层增量更新完成',
        description: '完成事件层增量更新，新增 42 条关系，更新 17 个节点属性。',
        layerTags: [
            'Event'
        ],
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BuildOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 397,
            columnNumber: 33
        }, this)
    },
    {
        id: 'mock-5',
        level: 'low',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        relativeTime: '3 小时前',
        agentName: '数据分析管线',
        title: '月度风险报告已生成',
        description: '本月共识别高风险主体 28 个，异常路径 64 条，合规风险点 12 处。',
        layerTags: [
            'Feature',
            'Regulation'
        ],
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BarChartOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 403,
            columnNumber: 49
        }, this)
    }
];
const mapReportToActivity = (r)=>{
    var _r_query;
    const level = [
        'high',
        'medium',
        'low'
    ].includes(r.overall_risk_level) ? r.overall_risk_level : 'low';
    const minutesAgo = r.created_at ? Math.round((Date.now() - new Date(r.created_at).getTime()) / 60000) : null;
    const relativeTime = minutesAgo != null ? minutesAgo < 60 ? `${minutesAgo} 分钟前` : minutesAgo < 1440 ? `${Math.round(minutesAgo / 60)} 小时前` : `${Math.round(minutesAgo / 1440)} 天前` : '';
    const tags = [];
    if (r.compliance_count > 0) tags.push('Regulation');
    if (r.anomaly_count > 0) tags.push('Feature');
    if (r.risk_path_count > 0) {
        tags.push('Event');
        tags.push('Subject');
    }
    if (tags.length === 0) tags.push('Subject', 'Event', 'Feature', 'Regulation');
    return {
        id: r.report_id,
        level,
        timestamp: r.created_at || '',
        relativeTime,
        title: ((_r_query = r.query) === null || _r_query === void 0 ? void 0 : _r_query.length) > 40 ? r.query.slice(0, 40) + '...' : r.query || '协同治理报告',
        description: r.executive_summary ? r.executive_summary.length > 80 ? r.executive_summary.slice(0, 80) + '...' : r.executive_summary : `${r.risk_path_count || 0} 条风险路径, ${r.anomaly_count || 0} 个异常, ${r.compliance_count || 0} 条合规匹配`,
        layerTags: [
            ...new Set(tags)
        ].slice(0, 3),
        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RobotOutlined, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 434,
            columnNumber: 11
        }, this)
    };
};
const ActivityTimeline = ({ reports, loading })=>{
    _s1();
    const activities = (0, _react.useMemo)(()=>{
        if (reports.length > 0) return reports.slice(0, 8).map(mapReportToActivity);
        return MOCK_ACTIVITIES;
    }, [
        reports
    ]);
    if (loading) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            justifyContent: 'center',
            padding: 60
        },
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {}, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 447,
            columnNumber: 84
        }, this)
    }, void 0, false, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 447,
        columnNumber: 12
    }, this);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            maxHeight: 380,
            overflow: 'auto',
            scrollBehavior: 'smooth'
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Timeline, {
                items: activities.map((item)=>({
                        color: RISK_COLORS[item.level],
                        dot: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: RISK_COLORS[item.level],
                                boxShadow: `0 0 0 3px ${RISK_COLORS[item.level]}20`
                            }
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 455,
                            columnNumber: 16
                        }, void 0),
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginBottom: 4
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                        marginBottom: 4
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                            strong: true,
                                            style: {
                                                fontSize: 13,
                                                color: '#0F172A'
                                            },
                                            children: [
                                                item.agentName && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        marginRight: 4,
                                                        fontSize: 13
                                                    },
                                                    children: item.icon
                                                }, void 0, false, {
                                                    fileName: "src/pages/Welcome.tsx",
                                                    lineNumber: 465,
                                                    columnNumber: 21
                                                }, void 0),
                                                item.title
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 463,
                                            columnNumber: 17
                                        }, void 0),
                                        item.layerTags.map((key)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: LAYER_THEME[key].color,
                                                style: {
                                                    borderRadius: 4,
                                                    fontSize: 10,
                                                    lineHeight: '16px',
                                                    margin: 0
                                                },
                                                children: LAYER_THEME[key].name
                                            }, key, false, {
                                                fileName: "src/pages/Welcome.tsx",
                                                lineNumber: 470,
                                                columnNumber: 19
                                            }, void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 462,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        fontSize: 12,
                                        color: '#475569',
                                        display: 'block',
                                        lineHeight: 1.5
                                    },
                                    children: item.description
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 475,
                                    columnNumber: 15
                                }, void 0),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        fontSize: 11,
                                        color: '#94A3B8'
                                    },
                                    children: item.relativeTime || (item.timestamp ? new Date(item.timestamp).toLocaleString('zh-CN') : '')
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 478,
                                    columnNumber: 15
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 461,
                            columnNumber: 13
                        }, void 0)
                    }))
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 452,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    position: 'sticky',
                    bottom: 0,
                    height: 40,
                    background: 'linear-gradient(transparent, #FFFFFF)',
                    pointerEvents: 'none'
                }
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 485,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 451,
        columnNumber: 5
    }, this);
};
_s1(ActivityTimeline, "MqddocQvT/u0BRpB0PsdDkuU4rI=");
_c4 = ActivityTimeline;
// ══════════════════════════════════════════════════════════════════════════════
// Main Dashboard Component
// ══════════════════════════════════════════════════════════════════════════════
const Welcome = ()=>{
    _s2();
    const { token } = _antd.theme.useToken();
    // ── Data states ──
    const [summaryLoading, setSummaryLoading] = (0, _react.useState)(true);
    const [summary, setSummary] = (0, _react.useState)(null);
    const [riskDist, setRiskDist] = (0, _react.useState)(null);
    const [crossStats, setCrossStats] = (0, _react.useState)(null);
    const [highRiskEntities, setHighRiskEntities] = (0, _react.useState)([]);
    const [recentReports, setRecentReports] = (0, _react.useState)([]);
    const [dataError, setDataError] = (0, _react.useState)(null);
    // ── Stable sparkline data (seeded once) ──
    const trendRef = (0, _react.useRef)({});
    const trendPctRef = (0, _react.useRef)({});
    const loadAllData = (0, _react.useCallback)(async ()=>{
        setDataError(null);
        setSummaryLoading(true);
        try {
            const [summaryRes, riskRes, crossRes, entitiesRes, reportsRes] = await Promise.all([
                (0, _dashboard.fetchSummaryStats)().catch(()=>null),
                (0, _dashboard.fetchRiskDistribution)().catch(()=>null),
                (0, _dashboard.fetchCrossStats)().catch(()=>null),
                (0, _dashboard.fetchHighRiskEntities)(10).catch(()=>null),
                (0, _dashboard.fetchRecentReports)(1, 5).catch(()=>null)
            ]);
            if (summaryRes) setSummary(summaryRes);
            if (riskRes === null || riskRes === void 0 ? void 0 : riskRes.success) setRiskDist(riskRes.data);
            if (crossRes === null || crossRes === void 0 ? void 0 : crossRes.success) setCrossStats(crossRes);
            if (entitiesRes === null || entitiesRes === void 0 ? void 0 : entitiesRes.success) setHighRiskEntities(entitiesRes.data);
            if (reportsRes === null || reportsRes === void 0 ? void 0 : reportsRes.success) setRecentReports(reportsRes.data.reports);
        } catch  {
            setDataError('部分数据加载失败，使用缓存数据');
        } finally{
            setSummaryLoading(false);
        }
    }, []);
    (0, _react.useEffect)(()=>{
        loadAllData();
    }, [
        loadAllData
    ]);
    // ── Derived values ──
    const totalNodes = (summary === null || summary === void 0 ? void 0 : summary.total_nodes) || 0;
    const totalRels = (summary === null || summary === void 0 ? void 0 : summary.total_relationships) || 0;
    const subjectTotal = (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Subject.total) || 0;
    const eventTotal = (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Event.total) || 0;
    const featureTotal = (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Feature.total) || 0;
    const regulationTotal = (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Regulation.total) || 0;
    const highRiskCount = riskDist ? riskDist.Subject.high + riskDist.Event.high + riskDist.Feature.high : 0;
    const reportCount = recentReports.length;
    // ── Seed sparkline data per session ──
    if (!trendRef.current.nodes) {
        trendRef.current = {
            nodes: genTrendData(totalNodes || 1500),
            highRisk: genTrendData(highRiskCount || 45),
            rels: genTrendData(totalRels || 3200),
            events: genTrendData(eventTotal || 280),
            regulations: genTrendData(regulationTotal || 160),
            reports: genTrendData(reportCount || 12)
        };
        trendPctRef.current = {
            nodes: 12,
            highRisk: -5,
            rels: 8,
            events: 3,
            regulations: 0,
            reports: 18
        };
    }
    // ── ECharts: Rose/Nightingale — 4-layer entity distribution ──
    const roseOption = (0, _react.useMemo)(()=>({
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} 个节点 ({d}%)'
            },
            legend: {
                bottom: 0,
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8
            },
            series: [
                {
                    type: 'pie',
                    roseType: 'area',
                    radius: [
                        '25%',
                        '65%'
                    ],
                    center: [
                        '50%',
                        '48%'
                    ],
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}\n{d}%',
                        fontSize: 11
                    },
                    data: LAYER_ORDER.map((key)=>{
                        const totals = {
                            Subject: subjectTotal,
                            Event: eventTotal,
                            Feature: featureTotal,
                            Regulation: regulationTotal
                        };
                        return {
                            value: totals[key],
                            name: LAYER_THEME[key].name,
                            itemStyle: {
                                color: LAYER_THEME[key].color
                            }
                        };
                    }).filter((d)=>d.value > 0)
                }
            ]
        }), [
        subjectTotal,
        eventTotal,
        featureTotal,
        regulationTotal
    ]);
    // ── ECharts: Risk Donut ──
    const riskDonutOption = (0, _react.useMemo)(()=>{
        const high = riskDist ? riskDist.Subject.high + riskDist.Event.high + riskDist.Feature.high : 0;
        const medium = riskDist ? riskDist.Subject.medium + riskDist.Event.medium + riskDist.Feature.medium : 0;
        const low = riskDist ? riskDist.Subject.low + riskDist.Event.low + riskDist.Feature.low : 0;
        return {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                bottom: 0,
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8
            },
            series: [
                {
                    type: 'pie',
                    radius: [
                        '48%',
                        '72%'
                    ],
                    center: [
                        '50%',
                        '43%'
                    ],
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}\n{c}',
                        fontSize: 11
                    },
                    data: [
                        {
                            value: high,
                            name: '高风险',
                            itemStyle: {
                                color: RISK_COLORS.high
                            }
                        },
                        {
                            value: medium,
                            name: '中风险',
                            itemStyle: {
                                color: RISK_COLORS.medium
                            }
                        },
                        {
                            value: low,
                            name: '低风险',
                            itemStyle: {
                                color: RISK_COLORS.low
                            }
                        }
                    ]
                }
            ]
        };
    }, [
        riskDist
    ]);
    // ── ECharts: Stacked Bar — per-layer risk breakdown ──
    const riskBarOption = (0, _react.useMemo)(()=>({
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: [
                    '高风险',
                    '中风险',
                    '低风险'
                ],
                bottom: 0,
                icon: 'circle',
                itemWidth: 8,
                itemHeight: 8
            },
            grid: {
                left: 50,
                right: 10,
                top: 10,
                bottom: 30
            },
            xAxis: {
                type: 'category',
                data: LAYER_ORDER.filter((k)=>k !== 'Regulation').map((k)=>LAYER_THEME[k].name),
                axisLine: {
                    lineStyle: {
                        color: '#E2E8F0'
                    }
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: '#F1F5F9'
                    }
                }
            },
            series: [
                {
                    name: '高风险',
                    type: 'bar',
                    stack: 'total',
                    color: RISK_COLORS.high,
                    barWidth: 22,
                    itemStyle: {
                        borderRadius: [
                            4,
                            4,
                            0,
                            0
                        ]
                    },
                    data: [
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Subject.high) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Event.high) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Feature.high) || 0
                    ]
                },
                {
                    name: '中风险',
                    type: 'bar',
                    stack: 'total',
                    color: RISK_COLORS.medium,
                    barWidth: 22,
                    data: [
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Subject.medium) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Event.medium) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Feature.medium) || 0
                    ]
                },
                {
                    name: '低风险',
                    type: 'bar',
                    stack: 'total',
                    color: RISK_COLORS.low,
                    barWidth: 22,
                    itemStyle: {
                        borderRadius: [
                            0,
                            0,
                            4,
                            4
                        ]
                    },
                    data: [
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Subject.low) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Event.low) || 0,
                        (riskDist === null || riskDist === void 0 ? void 0 : riskDist.Feature.low) || 0
                    ]
                }
            ]
        }), [
        riskDist
    ]);
    // ── ECharts: Sankey ──
    const sankeyOption = (0, _react.useMemo)(()=>buildSankeyOption(crossStats), [
        crossStats
    ]);
    // ── Empty / loading placeholder ──
    const chartPlaceholder = (loading, msg, h = 300)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
            style: {
                height: h,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            children: loading ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                tip: "加载数据..."
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 648,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                description: msg,
                image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 648,
                columnNumber: 43
            }, this)
        }, void 0, false, {
            fileName: "src/pages/Welcome.tsx",
            lineNumber: 647,
            columnNumber: 5
        }, this);
    const hasRoseData = subjectTotal + eventTotal + featureTotal + regulationTotal > 0;
    const hasRiskData = riskDist !== null;
    const hasCrossData = crossStats !== null;
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                style: {
                    borderRadius: 14,
                    marginBottom: 24,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 24px rgba(15,23,42,0.08)'
                },
                styles: {
                    body: {
                        padding: '28px 36px',
                        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
                    }
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                    align: "middle",
                    justify: "space-between",
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                            style: {
                                                fontSize: 28,
                                                color: '#FFC101'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 666,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                            level: 3,
                                            style: {
                                                margin: 0,
                                                color: '#ffffff',
                                                fontWeight: 700
                                            },
                                            children: "WindEye 风瞳"
                                        }, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 667,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 665,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                    style: {
                                        color: '#94A3B8',
                                        fontSize: 14
                                    },
                                    children: "Capital Markets Risk Transmission Monitoring Platform — 基于多层知识图谱的金融风险传导分析"
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 671,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 664,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "primary",
                                        size: "large",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MessageOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 680,
                                            columnNumber: 23
                                        }, void 0),
                                        onClick: ()=>_max.history.push('/knowledge-qa'),
                                        style: {
                                            borderRadius: 10,
                                            background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                                            border: 'none'
                                        },
                                        children: "开始分析"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 677,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "large",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 688,
                                            columnNumber: 23
                                        }, void 0),
                                        onClick: ()=>_max.history.push('/knowledge-graph'),
                                        style: {
                                            borderRadius: 10,
                                            color: '#94A3B8',
                                            borderColor: '#334155'
                                        },
                                        children: "浏览图谱"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 686,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 676,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 675,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/Welcome.tsx",
                    lineNumber: 663,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 659,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    16,
                    16
                ],
                style: {
                    marginBottom: 24
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "图谱节点",
                            value: totalNodes.toLocaleString(),
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 702,
                                columnNumber: 75
                            }, void 0),
                            color: "#2563EB",
                            suffix: "个",
                            loading: summaryLoading,
                            trendData: trendRef.current.nodes,
                            trendPct: trendPctRef.current.nodes
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 702,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 701,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "高风险主体",
                            value: highRiskCount.toLocaleString(),
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AlertOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 707,
                                columnNumber: 79
                            }, void 0),
                            color: "#DC2626",
                            suffix: "个",
                            loading: summaryLoading,
                            trendData: trendRef.current.highRisk,
                            trendPct: trendPctRef.current.highRisk
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 707,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 706,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "关联关系",
                            value: totalRels.toLocaleString(),
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RiseOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 712,
                                columnNumber: 74
                            }, void 0),
                            color: "#EA580C",
                            suffix: "条",
                            loading: summaryLoading,
                            trendData: trendRef.current.rels,
                            trendPct: trendPctRef.current.rels
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 712,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 711,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "监控事件",
                            value: eventTotal.toLocaleString(),
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 717,
                                columnNumber: 75
                            }, void 0),
                            color: "#DC2626",
                            suffix: "个",
                            loading: summaryLoading,
                            trendData: trendRef.current.events,
                            trendPct: trendPctRef.current.events
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 717,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 716,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "法规条目",
                            value: regulationTotal.toLocaleString(),
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 722,
                                columnNumber: 80
                            }, void 0),
                            color: "#7C3AED",
                            suffix: "条",
                            loading: summaryLoading,
                            trendData: trendRef.current.regulations,
                            trendPct: trendPctRef.current.regulations
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 722,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 721,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        sm: 12,
                        lg: 4,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(KPICard, {
                            title: "治理报告",
                            value: recentReports.length > 0 ? `${recentReports.length}` : '0',
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 727,
                                columnNumber: 106
                            }, void 0),
                            color: "#10B981",
                            suffix: "份",
                            loading: summaryLoading,
                            trendData: trendRef.current.reports,
                            trendPct: trendPctRef.current.reports
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 727,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 726,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 700,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    16,
                    16
                ],
                style: {
                    marginBottom: 24
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        lg: 14,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                                title: "跨层风险流转",
                                accentColor: "#EA580C"
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 737,
                                columnNumber: 20
                            }, void 0),
                            style: CARD_STYLE,
                            children: hasCrossData ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                option: sankeyOption,
                                style: {
                                    height: 340
                                }
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 741,
                                columnNumber: 17
                            }, this) : chartPlaceholder(summaryLoading, '暂无跨层关系数据', 340)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 736,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 735,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        lg: 10,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                                        title: "高风险主体 Top10",
                                        accentColor: "#DC2626"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 750,
                                        columnNumber: 17
                                    }, void 0),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 751,
                                            columnNumber: 44
                                        }, void 0),
                                        onClick: loadAllData,
                                        style: {
                                            borderRadius: 8
                                        },
                                        children: "刷新"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 751,
                                        columnNumber: 17
                                    }, void 0)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 749,
                                columnNumber: 15
                            }, void 0),
                            style: CARD_STYLE,
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                dataSource: highRiskEntities,
                                columns: entityColumns,
                                rowKey: "id",
                                size: "small",
                                loading: summaryLoading,
                                pagination: false,
                                bordered: false,
                                showHeader: true,
                                scroll: {
                                    y: 290
                                },
                                locale: {
                                    emptyText: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                        description: dataError || '暂无高风险主体',
                                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 766,
                                        columnNumber: 36
                                    }, void 0)
                                },
                                onRow: (_, index)=>({
                                        style: {
                                            cursor: 'pointer',
                                            background: index !== undefined && index % 2 === 0 ? '#FAFBFC' : '#FFFFFF'
                                        }
                                    })
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 756,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 747,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 746,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 734,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    16,
                    16
                ],
                style: {
                    marginBottom: 24
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        lg: 8,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                                title: "四层实体分布",
                                accentColor: "#2563EB"
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 778,
                                columnNumber: 24
                            }, void 0),
                            style: CARD_STYLE,
                            children: hasRoseData ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                option: roseOption,
                                style: {
                                    height: 320
                                }
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 780,
                                columnNumber: 17
                            }, this) : chartPlaceholder(summaryLoading, '暂无图谱数据', 320)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 778,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 777,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        lg: 8,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                                title: "风险等级分布",
                                accentColor: "#F59E0B"
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 786,
                                columnNumber: 24
                            }, void 0),
                            style: CARD_STYLE,
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                gutter: 0,
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 12,
                                        children: hasRiskData ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                            option: riskDonutOption,
                                            style: {
                                                height: 200
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 790,
                                            columnNumber: 21
                                        }, this) : chartPlaceholder(summaryLoading, '', 200)
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 788,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 12,
                                        children: hasRiskData ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                            option: riskBarOption,
                                            style: {
                                                height: 200
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 796,
                                            columnNumber: 21
                                        }, this) : chartPlaceholder(summaryLoading, '', 200)
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 794,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 787,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 786,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 785,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                        xs: 24,
                        lg: 8,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RiseOutlined, {
                                        style: {
                                            color: '#DC2626'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 807,
                                        columnNumber: 17
                                    }, void 0),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                                        title: "近期风险动态",
                                        accentColor: "#DC2626"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 808,
                                        columnNumber: 17
                                    }, void 0)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 806,
                                columnNumber: 15
                            }, void 0),
                            style: CARD_STYLE,
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(ActivityTimeline, {
                                reports: recentReports,
                                loading: summaryLoading
                            }, void 0, false, {
                                fileName: "src/pages/Welcome.tsx",
                                lineNumber: 813,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 804,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 803,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 776,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                gutter: [
                    16,
                    16
                ],
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                    span: 24,
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                        title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SectionTitle, {
                            title: "快捷操作",
                            accentColor: "#2563EB"
                        }, void 0, false, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 821,
                            columnNumber: 24
                        }, void 0),
                        style: CARD_STYLE,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: [
                                12,
                                12
                            ],
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloudDownloadOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 824,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "数据采集",
                                        desc: "多智能体协同网络爬虫",
                                        color: "#EA580C",
                                        path: "/data-collection"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 824,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 823,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MessageOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 827,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "协同治理",
                                        desc: "自然语言查询风险传导路径",
                                        color: "#2563EB",
                                        path: "/knowledge-qa"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 827,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 826,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 830,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "知识图谱",
                                        desc: "浏览四层资本市场图谱网络",
                                        color: "#2563EB",
                                        path: "/knowledge-graph"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 830,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 829,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 833,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "治理报告",
                                        desc: "结构化风险分析与合规研判",
                                        color: "#7C3AED",
                                        path: "/knowledge-qa"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 833,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 832,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ToolOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 836,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "图谱构建",
                                        desc: "ETL流水线与知识图谱构建",
                                        color: "#10B981",
                                        path: "/knowledge-build"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 836,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 835,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    xs: 12,
                                    sm: 8,
                                    lg: 4,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(QuickAction, {
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AlertOutlined, {}, void 0, false, {
                                            fileName: "src/pages/Welcome.tsx",
                                            lineNumber: 839,
                                            columnNumber: 36
                                        }, void 0),
                                        title: "群体发现",
                                        desc: "社群检测与中心性分析",
                                        color: "#DC2626",
                                        path: "/community-discovery"
                                    }, void 0, false, {
                                        fileName: "src/pages/Welcome.tsx",
                                        lineNumber: 839,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/Welcome.tsx",
                                    lineNumber: 838,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/Welcome.tsx",
                            lineNumber: 822,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/Welcome.tsx",
                        lineNumber: 821,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/Welcome.tsx",
                    lineNumber: 820,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "src/pages/Welcome.tsx",
                lineNumber: 819,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/Welcome.tsx",
        lineNumber: 657,
        columnNumber: 5
    }, this);
};
_s2(Welcome, "gd7KF0TjyfCxd4meUmnpgsi8o5M=", false, function() {
    return [
        _antd.theme.useToken
    ];
});
_c5 = Welcome;
var _default = Welcome;
var _c;
var _c1;
var _c2;
var _c3;
var _c4;
var _c5;
$RefreshReg$(_c, "Sparkline");
$RefreshReg$(_c1, "KPICard");
$RefreshReg$(_c2, "QuickAction");
$RefreshReg$(_c3, "SectionTitle");
$RefreshReg$(_c4, "ActivityTimeline");
$RefreshReg$(_c5, "Welcome");
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
"src/services/dashboard.ts": function (module, exports, __mako_require__){
/** Dashboard data service — centralized API calls for the Welcome page. */ "use strict";
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
    fetchCrossStats: function() {
        return fetchCrossStats;
    },
    fetchHighRiskEntities: function() {
        return fetchHighRiskEntities;
    },
    fetchPipelineStatus: function() {
        return fetchPipelineStatus;
    },
    fetchRecentReports: function() {
        return fetchRecentReports;
    },
    fetchRiskDistribution: function() {
        return fetchRiskDistribution;
    },
    fetchSummaryStats: function() {
        return fetchSummaryStats;
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
const BASE = '';
async function fetchSummaryStats() {
    const res = await fetch(`${BASE}/api/v1/graph/summary-stats`);
    if (!res.ok) throw new Error(`summary-stats: ${res.status}`);
    return res.json();
}
async function fetchRiskDistribution() {
    const res = await fetch(`${BASE}/api/v1/graph/risk-distribution`);
    if (!res.ok) throw new Error(`risk-distribution: ${res.status}`);
    return res.json();
}
async function fetchCrossStats() {
    const res = await fetch(`${BASE}/api/v1/graph/cross-stats`);
    if (!res.ok) throw new Error(`cross-stats: ${res.status}`);
    return res.json();
}
async function fetchHighRiskEntities(limit = 10) {
    const res = await fetch(`${BASE}/api/v1/graph/high-risk-entities?limit=${limit}`);
    if (!res.ok) throw new Error(`high-risk-entities: ${res.status}`);
    return res.json();
}
async function fetchRecentReports(page = 1, limit = 5) {
    const res = await fetch(`${BASE}/api/v1/risk/reports?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`reports: ${res.status}`);
    return res.json();
}
async function fetchPipelineStatus() {
    const res = await fetch(`${BASE}/api/v1/pipeline/status`);
    if (!res.ok) throw new Error(`pipeline-status: ${res.status}`);
    return res.json();
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
//# sourceMappingURL=p__Welcome-async.js.map