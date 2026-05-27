globalThis.makoModuleHotUpdate('common', {
    modules: {
        "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx": function(module, exports, __mako_require__) {
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
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var _g6 = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
            var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
            var _graphConfig = __mako_require__(Object(function makoMissingModule() {
                var e = new Error("Cannot find module '../graphConfig'");
                e.code = "MODULE_NOT_FOUND";
                throw e;
            }()));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const { Option } = _antd.Select;
            const LayerGraphPage = ({ config })=>{
                _s();
                const { layerName, pageTitle, nodeStyles, relationLabels, propertyMap } = config;
                const [rawData, setRawData] = (0, _react.useState)(null);
                const [loading, setLoading] = (0, _react.useState)(false);
                const [graphError, setGraphError] = (0, _react.useState)(null);
                const [drawerVisible, setDrawerVisible] = (0, _react.useState)(false);
                const [selectedNode, setSelectedNode] = (0, _react.useState)(null);
                const [detailModalVisible, setDetailModalVisible] = (0, _react.useState)(false);
                const [detailData, setDetailData] = (0, _react.useState)([]);
                const [detailTitle, setDetailTitle] = (0, _react.useState)('');
                const [currentLayout, setCurrentLayout] = (0, _react.useState)('gForce');
                const [dbStats, setDbStats] = (0, _react.useState)({
                    total: 0,
                    details: []
                });
                const [expanding, setExpanding] = (0, _react.useState)(false);
                const containerRef = (0, _react.useRef)(null);
                const graphRef = (0, _react.useRef)(null);
                const expandedNodesRef = (0, _react.useRef)(new Set());
                const [form] = _antd.Form.useForm();
                // ─── Data Loading ─────────────────────────────────────────────────
                const loadData = (0, _react.useCallback)(async (params, isSearch)=>{
                    setLoading(true);
                    setGraphError(null);
                    params.set('layer', layerName);
                    const endpoint = isSearch ? 'search-all' : 'data';
                    const url = `/api/v1/graph/${endpoint}?${params.toString()}`;
                    try {
                        const response = await fetch(url);
                        const result = await response.json();
                        if (result.error) {
                            setGraphError(result.error);
                            setRawData(null);
                            return;
                        }
                        if (!result.nodes || !Array.isArray(result.nodes)) {
                            setGraphError('后端返回数据格式异常，缺少 nodes 字段');
                            setRawData(null);
                            return;
                        }
                        if (isSearch && result.nodes.length === 0) _antd.message.warning('未找到相关的关联节点');
                        setRawData({
                            nodes: result.nodes,
                            edges: result.edges || []
                        });
                        if (isSearch) _antd.message.success(`找到 ${result.nodes.length} 个关联节点`);
                        expandedNodesRef.current.clear();
                    } catch  {
                        setGraphError('后端服务连接失败，请检查服务是否启动');
                        setRawData(null);
                    } finally{
                        setLoading(false);
                    }
                }, [
                    layerName
                ]);
                const loadFullGraph = (0, _react.useCallback)(()=>{
                    const params = new URLSearchParams({
                        limit: '100'
                    });
                    loadData(params, false);
                }, [
                    loadData
                ]);
                const loadDbStatistics = (0, _react.useCallback)(async ()=>{
                    try {
                        const response = await fetch(`/api/v1/graph/statistics?layer=${layerName}`);
                        const data = await response.json();
                        if (data && Array.isArray(data.details)) setDbStats({
                            total: data.total || 0,
                            details: data.details
                        });
                    } catch  {
                        console.error('加载统计数据失败');
                    }
                }, [
                    layerName
                ]);
                const handleSearch = (0, _react.useCallback)((values)=>{
                    const { keyword, layers } = values;
                    const params = new URLSearchParams();
                    if (keyword) params.append('q', keyword.trim());
                    if (layers) params.append('depth', (layers || 1).toString());
                    params.append('limit', '200');
                    if (!keyword) loadFullGraph();
                    else loadData(params, true);
                }, [
                    loadData,
                    loadFullGraph
                ]);
                const handleExpand = (0, _react.useCallback)(async (nodeId)=>{
                    if (expandedNodesRef.current.has(nodeId)) {
                        _antd.message.info('该节点已展开');
                        return;
                    }
                    setExpanding(true);
                    try {
                        const response = await fetch(`/api/v1/graph/subgraph/${nodeId}?layer=${layerName}&limit=50`);
                        const result = await response.json();
                        if (result.nodes && result.nodes.length > 0 && rawData) {
                            const existingNodeIds = new Set(rawData.nodes.map((n)=>n.element_id || n.id));
                            const existingEdgeIds = new Set(rawData.edges.map((e)=>e.element_id || e.id));
                            const newNodes = result.nodes.filter((n)=>!existingNodeIds.has(n.element_id || n.id));
                            const newEdges = result.edges.filter((e)=>!existingEdgeIds.has(e.element_id || e.id));
                            if (newNodes.length > 0 || newEdges.length > 0) {
                                setRawData({
                                    nodes: [
                                        ...rawData.nodes,
                                        ...newNodes
                                    ],
                                    edges: [
                                        ...rawData.edges,
                                        ...newEdges
                                    ]
                                });
                                expandedNodesRef.current.add(nodeId);
                                _antd.message.success(`展开 ${newNodes.length} 个新节点, ${newEdges.length} 条新关系`);
                            } else _antd.message.info('没有新的节点或关系');
                        }
                    } catch  {
                        _antd.message.error('节点展开失败');
                    } finally{
                        setExpanding(false);
                    }
                }, [
                    rawData,
                    layerName
                ]);
                // ─── Data Processing ──────────────────────────────────────────────
                const processedData = (0, _react.useMemo)(()=>{
                    if (!rawData || !rawData.nodes || !rawData.nodes.length) return {
                        nodes: [],
                        links: []
                    };
                    var nodes = rawData.nodes.map(function(node) {
                        var labels = node.labels || [];
                        var props = node.properties || {};
                        var typeKey = 'Unknown';
                        for(var i = 0; i < labels.length; i++)if (nodeStyles[labels[i]]) {
                            typeKey = labels[i];
                            break;
                        }
                        var nodeStyle = nodeStyles[typeKey] || nodeStyles['Unknown'] || {
                            color: '#BFBFBF',
                            label: '未知'
                        };
                        var nodeName = props.name || props.COMPANY_NM || props.PERSON_NM || props.title || props.e_id || props.id || '未知';
                        return {
                            id: String(node.element_id || node.id),
                            name: nodeName,
                            labels: labels,
                            properties: props,
                            typeKey: typeKey,
                            color: nodeStyle.color
                        };
                    });
                    var nodeIds = new Set(nodes.map(function(n) {
                        return n.id;
                    }));
                    var edges = rawData.edges || [];
                    var links = edges.filter(function(e) {
                        var src = String(e.startNodeElementId || e.source || '');
                        var tgt = String(e.endNodeElementId || e.target || '');
                        return nodeIds.has(src) && nodeIds.has(tgt);
                    }).map(function(e) {
                        var src = String(e.startNodeElementId || e.source || '');
                        var tgt = String(e.endNodeElementId || e.target || '');
                        var edgeLabel = e.type || e.label || '';
                        return {
                            source: src,
                            target: tgt,
                            label: relationLabels[edgeLabel] || edgeLabel,
                            originalLabel: edgeLabel,
                            id: String(e.element_id || e.id || src + '-' + tgt + '-' + edgeLabel)
                        };
                    });
                    return {
                        nodes: nodes,
                        links: links
                    };
                }, [
                    rawData,
                    nodeStyles,
                    relationLabels
                ]);
                // ─── Layout Configuration ──────────────────────────────────────────
                var getLayoutConfig = function(layoutType, nodeCount) {
                    switch(layoutType){
                        case 'gForce':
                            return {
                                type: 'gForce',
                                maxIteration: 200 * Math.ceil(nodeCount / 50),
                                gravity: 5,
                                linkDistance: 100,
                                preventOverlap: true
                            };
                        case 'force2':
                            return {
                                type: 'force2',
                                maxIteration: 200,
                                linkDistance: 100,
                                nodeStrength: -30,
                                preventOverlap: true
                            };
                        case 'dagre':
                            return {
                                type: 'dagre',
                                rankdir: 'TB',
                                nodesep: 30,
                                ranksep: 50
                            };
                        case 'dagre-lr':
                            return {
                                type: 'dagre',
                                rankdir: 'LR',
                                nodesep: 30,
                                ranksep: 50
                            };
                        case 'circular':
                            return {
                                type: 'circular',
                                radius: null
                            };
                        case 'concentric':
                            return {
                                type: 'concentric',
                                minNodeSpacing: 40,
                                equidistant: true
                            };
                        default:
                            return {
                                type: 'gForce',
                                maxIteration: 200,
                                gravity: 5,
                                linkDistance: 100
                            };
                    }
                };
                var getNodeLayer = function(typeKey) {
                    var style = _graphConfig.GENERAL_CONFIG.nodeStyles[typeKey];
                    if (style && style.layer !== undefined) return style.layer;
                    return LAYER_NAME_MAP[config.layerName] ?? 0;
                };
                var LAYER_NAME_MAP = {
                    'Subject': 0,
                    'Event': 1,
                    'Feature': 2,
                    'Regulation': 3
                };
                // ─── G6 Graph ─────────────────────────────────────────────────────
                (0, _react.useEffect)(()=>{
                    if (!containerRef.current || !processedData.nodes.length) return;
                    if (graphRef.current) {
                        graphRef.current.destroy();
                        graphRef.current = null;
                    }
                    var width = containerRef.current.scrollWidth || window.innerWidth - 400;
                    var height = containerRef.current.scrollHeight || 600;
                    var nodeCount = processedData.nodes.length;
                    var graph = new _g6.default.Graph({
                        container: containerRef.current,
                        width: width,
                        height: height,
                        layout: getLayoutConfig(currentLayout, nodeCount),
                        modes: {
                            default: [
                                'drag-canvas',
                                'zoom-canvas',
                                'drag-node'
                            ]
                        },
                        defaultNode: {
                            type: 'circle',
                            size: 28,
                            labelCfg: {
                                position: 'bottom',
                                offset: 6,
                                style: {
                                    fill: '#666',
                                    fontSize: 11
                                }
                            },
                            style: {
                                stroke: '#fff',
                                lineWidth: 2
                            }
                        },
                        defaultEdge: {
                            type: 'line',
                            style: {
                                endArrow: {
                                    path: _g6.default.Arrow.triangle(6, 8, 2),
                                    fill: '#d9d9d9'
                                },
                                lineWidth: 1.5
                            },
                            labelCfg: {
                                autoRotate: true,
                                refY: -8,
                                style: {
                                    fill: '#999',
                                    fontSize: 9
                                }
                            }
                        },
                        animate: nodeCount < 200,
                        renderer: 'canvas',
                        fitView: true
                    });
                    var g6Nodes = processedData.nodes.map(function(n) {
                        return {
                            id: n.id,
                            label: n.name.length > 6 ? n.name.substring(0, 6) + '...' : n.name,
                            style: {
                                fill: n.color
                            },
                            typeKey: n.typeKey,
                            properties: n.properties,
                            labels: n.labels,
                            fullName: n.name
                        };
                    });
                    var g6Edges = processedData.links.map(function(l) {
                        var edgeColor = '#d9d9d9';
                        var arrowFill = edgeColor;
                        return {
                            id: l.id,
                            source: l.source,
                            target: l.target,
                            label: l.label,
                            style: {
                                stroke: edgeColor,
                                endArrow: {
                                    path: _g6.default.Arrow.triangle(6, 8, 2),
                                    fill: arrowFill
                                }
                            },
                            originalLabel: l.originalLabel
                        };
                    });
                    graph.data({
                        nodes: g6Nodes,
                        edges: g6Edges
                    });
                    graph.render();
                    graph.on('node:click', function(evt) {
                        var item = evt.item;
                        var model = item.getModel();
                        if (model.properties) {
                            setSelectedNode(model);
                            setDrawerVisible(true);
                        }
                    });
                    graph.on('node:dblclick', function(evt) {
                        var item = evt.item;
                        var model = item.getModel();
                        handleExpand(model.id);
                    });
                    graphRef.current = graph;
                    return function() {
                        if (graphRef.current) {
                            graphRef.current.destroy();
                            graphRef.current = null;
                        }
                    };
                }, [
                    processedData
                ]);
                // ─── Initial Load ──────────────────────────────────────────────────
                (0, _react.useEffect)(()=>{
                    loadFullGraph();
                    loadDbStatistics();
                }, []);
                // ─── Export ────────────────────────────────────────────────────────
                var handleExportPNG = (0, _react.useCallback)(function() {
                    if (graphRef.current) graphRef.current.downloadFullImage(layerName + '-graph-' + Date.now(), 'image/png', {
                        backgroundColor: '#fff',
                        padding: 20
                    });
                }, [
                    layerName
                ]);
                var handleExportCSV = (0, _react.useCallback)(function() {
                    var headers = '层级,节点类型,节点数\r\n';
                    var rows = dbStats.details.map(function(d) {
                        return layerName + ',' + d.label + ',' + d.value;
                    }).join('\r\n');
                    var csv = '﻿' + headers + rows;
                    var blob = new Blob([
                        csv
                    ], {
                        type: 'text/csv;charset=utf-8;'
                    });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = layerName + '-stats-' + Date.now() + '.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                    _antd.message.success('统计数据已导出');
                }, [
                    dbStats,
                    layerName
                ]);
                // ─── Property Rendering ────────────────────────────────────────────
                var renderPropertyValue = function(key, value) {
                    if (value === null || value === undefined) return '-';
                    if (typeof value === 'object') try {
                        return JSON.stringify(value);
                    } catch  {
                        return String(value);
                    }
                    var strValue = String(value);
                    var propConfig = propertyMap[key];
                    if (propConfig && propConfig.isRisk && strValue && strValue !== '[]' && strValue !== '{}') try {
                        var parsed = JSON.parse(strValue);
                        if (Array.isArray(parsed) && parsed.length > 0) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "link",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EyeOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 404,
                                columnNumber: 21
                            }, void 0),
                            onClick: function() {
                                setDetailTitle(propConfig.label || key);
                                setDetailData(parsed);
                                setDetailModalVisible(true);
                            },
                            children: [
                                "查看详情 (",
                                parsed.length,
                                "条)"
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 401,
                            columnNumber: 13
                        }, this);
                    } catch  {}
                    return strValue.length > 100 ? strValue.substring(0, 100) + '...' : strValue;
                };
                // ─── UI ────────────────────────────────────────────────────────────
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
                    header: {
                        title: pageTitle,
                        subTitle: layerName + '层知识图谱检索与可视化'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: 16,
                            style: {
                                marginBottom: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 6,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                            title: layerName + '层总节点数',
                                            value: dbStats.total,
                                            prefix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 431,
                                                columnNumber: 23
                                            }, void 0),
                                            loading: !dbStats.total
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 428,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 427,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 426,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 6,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                            title: "图谱当前节点数",
                                            value: processedData.nodes.length,
                                            prefix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AimOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 441,
                                                columnNumber: 23
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 438,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 437,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 436,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 6,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                            title: "图谱当前关系数",
                                            value: processedData.links.length,
                                            prefix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExpandOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 450,
                                                columnNumber: 23
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 447,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 446,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 445,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 6,
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                gap: 8,
                                                justifyContent: 'flex-end'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                    title: "导出图谱PNG",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PictureOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                            lineNumber: 458,
                                                            columnNumber: 31
                                                        }, void 0),
                                                        size: "small",
                                                        onClick: handleExportPNG,
                                                        children: "PNG"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                        lineNumber: 458,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                    lineNumber: 457,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                    title: "导出统计CSV",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileExcelOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                            lineNumber: 463,
                                                            columnNumber: 31
                                                        }, void 0),
                                                        size: "small",
                                                        onClick: handleExportCSV,
                                                        children: "CSV"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                        lineNumber: 463,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                    title: "刷新数据",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                            lineNumber: 469,
                                                            columnNumber: 25
                                                        }, void 0),
                                                        size: "small",
                                                        onClick: function() {
                                                            loadFullGraph();
                                                            loadDbStatistics();
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                        lineNumber: 468,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                    lineNumber: 467,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 456,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 455,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 454,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 425,
                            columnNumber: 7
                        }, this),
                        dbStats.details.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: 16,
                            style: {
                                marginBottom: 16
                            },
                            children: dbStats.details.map(function(d) {
                                var color = nodeStyles[d.type] && nodeStyles[d.type].color || '#BFBFBF';
                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: Math.max(4, Math.floor(24 / dbStats.details.length)),
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        style: {
                                            borderLeft: '3px solid ' + color
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                            title: d.label,
                                            value: d.value,
                                            valueStyle: {
                                                fontSize: 18
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 491,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 490,
                                        columnNumber: 17
                                    }, this)
                                }, d.type, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 489,
                                    columnNumber: 15
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 484,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                marginBottom: 16
                            },
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form, {
                                form: form,
                                layout: "inline",
                                onFinish: handleSearch,
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        name: "keyword",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Input.Search, {
                                            placeholder: "输入节点名称搜索...",
                                            style: {
                                                width: 320
                                            },
                                            enterButton: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 506,
                                                columnNumber: 28
                                            }, void 0),
                                            onSearch: function() {
                                                form.submit();
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 503,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 502,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        name: "layers",
                                        initialValue: 2,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                            style: {
                                                width: 120
                                            },
                                            placeholder: "穿透深度",
                                            children: [
                                                1,
                                                2,
                                                3,
                                                4,
                                                5
                                            ].map(function(n) {
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Option, {
                                                    value: n,
                                                    children: [
                                                        n,
                                                        "层穿透"
                                                    ]
                                                }, n, true, {
                                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 19
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 513,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 512,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            htmlType: "submit",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 524,
                                                columnNumber: 60
                                            }, void 0),
                                            loading: loading,
                                            children: "检索"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 524,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 523,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 530,
                                                columnNumber: 21
                                            }, void 0),
                                            onClick: function() {
                                                form.resetFields();
                                                loadFullGraph();
                                            },
                                            children: "重置"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 529,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 528,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 501,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 500,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            bodyStyle: {
                                padding: 0
                            },
                            style: {
                                marginBottom: 16,
                                overflow: 'hidden'
                            },
                            extra: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                        title: "适应画布",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            size: "small",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AimOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 552,
                                                columnNumber: 23
                                            }, void 0),
                                            onClick: function() {
                                                if (graphRef.current) graphRef.current.fitView(20);
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 550,
                                            columnNumber: 15
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, void 0),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                        title: "导出PNG",
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            size: "small",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownloadOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 559,
                                                columnNumber: 42
                                            }, void 0),
                                            onClick: handleExportPNG
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 559,
                                            columnNumber: 15
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 558,
                                        columnNumber: 13
                                    }, void 0)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 548,
                                columnNumber: 11
                            }, void 0),
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                        style: {
                                            marginRight: 8
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 565,
                                        columnNumber: 13
                                    }, void 0),
                                    "图谱可视化 (",
                                    processedData.nodes.length,
                                    "节点, ",
                                    processedData.links.length,
                                    "关系)",
                                    expanding && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                        size: "small",
                                        style: {
                                            marginLeft: 8
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 567,
                                        columnNumber: 27
                                    }, void 0)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 564,
                                columnNumber: 11
                            }, void 0),
                            children: [
                                loading && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        height: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                        size: "large",
                                        tip: "加载图谱数据中..."
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 581,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 573,
                                    columnNumber: 11
                                }, this),
                                graphError && !loading && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        height: 500,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                fontSize: 48,
                                                color: '#f5222d',
                                                marginBottom: 16
                                            },
                                            children: "⚠"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 596,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                color: '#f5222d',
                                                marginBottom: 8,
                                                fontSize: 14
                                            },
                                            children: graphError
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 597,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            onClick: loadFullGraph,
                                            children: "重新加载"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                            lineNumber: 600,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 587,
                                    columnNumber: 11
                                }, this),
                                !loading && !graphError && processedData.nodes.length === 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        height: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                        description: "暂无图谱数据，请尝试检索或刷新"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 616,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 608,
                                    columnNumber: 11
                                }, this),
                                !loading && !graphError && processedData.nodes.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    ref: containerRef,
                                    style: {
                                        width: '100%',
                                        height: 550
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                    lineNumber: 622,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 543,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.InfoCircleOutlined, {
                                        style: {
                                            marginRight: 8
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 630,
                                        columnNumber: 13
                                    }, void 0),
                                    "节点详情 - ",
                                    selectedNode ? selectedNode.name : ''
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 629,
                                columnNumber: 11
                            }, void 0),
                            placement: "right",
                            width: 480,
                            open: drawerVisible,
                            onClose: function() {
                                setDrawerVisible(false);
                                setSelectedNode(null);
                            },
                            children: selectedNode && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                        column: 1,
                                        size: "small",
                                        bordered: true,
                                        style: {
                                            marginBottom: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: "节点ID",
                                                children: selectedNode.id
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 645,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: "节点名称",
                                                children: selectedNode.name
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 646,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: "节点类型",
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: selectedNode.color,
                                                    children: selectedNode.typeKey
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                    lineNumber: 648,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 647,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: "标签",
                                                children: (selectedNode.labels || []).map(function(l) {
                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "blue",
                                                        children: l
                                                    }, l, false, {
                                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                        lineNumber: 653,
                                                        columnNumber: 21
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                                lineNumber: 650,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 644,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("h4", {
                                        children: "属性"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 661,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                        dataSource: Object.entries(selectedNode.properties || {}).map(function([key, value]) {
                                            return {
                                                key: key,
                                                value: value
                                            };
                                        }),
                                        columns: [
                                            {
                                                title: '属性名',
                                                dataIndex: 'key',
                                                key: 'key',
                                                width: 160,
                                                render: function(k) {
                                                    return propertyMap[k] ? propertyMap[k].label : k;
                                                }
                                            },
                                            {
                                                title: '属性值',
                                                dataIndex: 'value',
                                                key: 'value',
                                                render: function(val, record) {
                                                    return renderPropertyValue(record.key, val);
                                                }
                                            }
                                        ],
                                        pagination: {
                                            pageSize: 10
                                        },
                                        size: "small",
                                        rowKey: "key"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                        lineNumber: 662,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 627,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Modal, {
                            title: detailTitle,
                            open: detailModalVisible,
                            onCancel: function() {
                                setDetailModalVisible(false);
                            },
                            footer: null,
                            width: 700,
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                dataSource: detailData,
                                columns: [
                                    {
                                        title: '#',
                                        dataIndex: 'index',
                                        key: 'index',
                                        width: 60,
                                        render: function(_, __, idx) {
                                            return idx + 1;
                                        }
                                    },
                                    {
                                        title: '内容',
                                        dataIndex: 'content',
                                        key: 'content',
                                        render: function(val, record) {
                                            if (typeof record === 'string') return record;
                                            return JSON.stringify(record, null, 2);
                                        }
                                    }
                                ],
                                size: "small",
                                rowKey: function(_, idx) {
                                    return String(idx);
                                },
                                pagination: {
                                    pageSize: 10
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                                lineNumber: 706,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                            lineNumber: 697,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeGraph/components/LayerGraphPage.tsx",
                    lineNumber: 423,
                    columnNumber: 5
                }, this);
            };
            _s(LayerGraphPage, "QWwfF14wGq/LCt8rjeDZSEgaIkc=", false, function() {
                return [
                    _antd.Form.useForm
                ];
            });
            _c = LayerGraphPage;
            var _default = LayerGraphPage;
            var _c;
            $RefreshReg$(_c, "LayerGraphPage");
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
    runtime._h = '16094510306206647819';
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

//# sourceMappingURL=common-async.1294338497922426462.hot-update.js.map