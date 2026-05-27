globalThis.makoModuleHotUpdate('p__GeneralPage', {
    modules: {
        "src/pages/GeneralPage.tsx": function(module, exports, __mako_require__) {
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
            var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
            var _g6 = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
            var _graphConfig = __mako_require__("src/pages/graphConfig.ts");
            var _layouts = __mako_require__("src/pages/KnowledgeGraph/layouts/index.ts");
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            // 画布配置
            const CANVAS_HEIGHT = 900; // 增加总高度
            const LAYER_GAP = 50;
            // 为不同层分配不同的高度
            const LAYER_HEIGHTS = {
                0: 120,
                1: 300,
                2: 240,
                3: 120
            };
            const LAYER_CONFIG = [
                {
                    name: '主体层',
                    color: '#e6f7ff',
                    labelColor: '#1890ff',
                    index: 0,
                    tag: 'Subject',
                    height: LAYER_HEIGHTS[0]
                },
                {
                    name: '事件层',
                    color: '#fff1f0',
                    labelColor: '#ff4d4f',
                    index: 1,
                    tag: 'Event',
                    height: LAYER_HEIGHTS[1]
                },
                {
                    name: '特征层',
                    color: '#f6ffed',
                    labelColor: '#52c41a',
                    index: 2,
                    tag: 'Feature',
                    height: LAYER_HEIGHTS[2]
                },
                {
                    name: '法规层',
                    color: '#f9f0ff',
                    labelColor: '#722ed1',
                    index: 3,
                    tag: 'Regulation',
                    height: LAYER_HEIGHTS[3]
                }
            ];
            const NODE_STYLE_CONFIG = _graphConfig.GENERAL_CONFIG.nodeStyles;
            const RELATION_LABEL_MAP = _graphConfig.GENERAL_CONFIG.relationLabels;
            const PROPERTY_MAP = _graphConfig.GENERAL_CONFIG.propertyMap;
            const NODE_TYPE_OPTIONS = Object.keys(NODE_STYLE_CONFIG).filter((k)=>k !== 'Unknown').map(_c = (k)=>({
                    value: k,
                    label: NODE_STYLE_CONFIG[k].label
                }));
            _c1 = NODE_TYPE_OPTIONS;
            // 辅助函数
            const parseRiskJson = (jsonStr)=>{
                try {
                    let fixedStr = jsonStr.trim();
                    if (!fixedStr.startsWith('[')) fixedStr = '[' + fixedStr.replace(/\}\s*\{/g, '},{') + ']';
                    const parsed = JSON.parse(fixedStr);
                    return Array.isArray(parsed) ? parsed : [
                        parsed
                    ];
                } catch (e) {
                    const matches = jsonStr.match(/\{[^{}]+\}/g);
                    return matches ? matches.map((m)=>{
                        try {
                            return JSON.parse(m);
                        } catch  {
                            return null;
                        }
                    }).filter(Boolean) : [];
                }
            };
            const safeParseCount = (jsonStr)=>{
                try {
                    return parseRiskJson(jsonStr).length;
                } catch  {
                    return 0;
                }
            };
            const getYByLayer = (layerIndex)=>{
                let y = 0;
                for(let i = 0; i < layerIndex; i++)y += LAYER_HEIGHTS[i] + LAYER_GAP;
                return y + LAYER_HEIGHTS[layerIndex] / 2;
            };
            const drawSwimlanes = (graph, width)=>{
                const group = graph.get('group');
                let currentY = 0;
                LAYER_CONFIG.forEach((cfg)=>{
                    const layerHeight = cfg.height;
                    group.addShape('rect', {
                        attrs: {
                            x: 0,
                            y: currentY,
                            width: width,
                            height: layerHeight,
                            fill: cfg.color,
                            opacity: 0.5
                        },
                        name: 'lane-background',
                        zIndex: -10
                    });
                    if (cfg.index < 3) group.addShape('path', {
                        attrs: {
                            path: [
                                [
                                    'M',
                                    0,
                                    currentY + layerHeight + LAYER_GAP / 2
                                ],
                                [
                                    'L',
                                    width,
                                    currentY + layerHeight + LAYER_GAP / 2
                                ]
                            ],
                            stroke: '#e8e8e8',
                            lineDash: [
                                5,
                                5
                            ],
                            lineWidth: 1
                        },
                        name: 'lane-divider',
                        zIndex: -9
                    });
                    currentY += layerHeight + LAYER_GAP;
                });
                group.sort();
            };
            const CustomStatistic = ({ title, value })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        padding: '2px 0',
                        textAlign: 'center'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                fontSize: '14px',
                                color: 'rgba(0,0,0,0.65)',
                                marginBottom: 4,
                                fontWeight: 500
                            },
                            children: title
                        }, void 0, false, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 90,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#000',
                                lineHeight: 1.2
                            },
                            children: value.toLocaleString()
                        }, void 0, false, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 91,
                            columnNumber: 5
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/GeneralPage.tsx",
                    lineNumber: 89,
                    columnNumber: 3
                }, this);
            _c2 = CustomStatistic;
            const GeneralPage = ()=>{
                var _selectedNode_levelName;
                _s();
                const [form] = _antd.Form.useForm();
                const { message } = _antd.App.useApp();
                const [graphData, setGraphData] = (0, _react.useState)({
                    nodes: [],
                    edges: [],
                    links: []
                });
                const [loading, setLoading] = (0, _react.useState)(true);
                const [graphError, setGraphError] = (0, _react.useState)(null);
                const [drawerVisible, setDrawerVisible] = (0, _react.useState)(false);
                const [selectedNode, setSelectedNode] = (0, _react.useState)(null);
                const [layerStats, setLayerStats] = (0, _react.useState)({
                    total: 0,
                    total_relationships: 0,
                    details: []
                });
                const [detailedStats, setDetailedStats] = (0, _react.useState)([]);
                const [detailModalVisible, setDetailModalVisible] = (0, _react.useState)(false);
                const [detailData, setDetailData] = (0, _react.useState)([]);
                const [detailTitle, setDetailTitle] = (0, _react.useState)("");
                const [expanding, setExpanding] = (0, _react.useState)(false);
                const [filterLayer, setFilterLayer] = (0, _react.useState)(null);
                const [showDetailedStats, setShowDetailedStats] = (0, _react.useState)(false);
                const containerRef = (0, _react.useRef)(null);
                const graphRef = (0, _react.useRef)(null);
                const loadData = async (url, isSearch)=>{
                    setLoading(true);
                    setGraphError(null);
                    try {
                        const response = await fetch(url);
                        const result = await response.json();
                        if (result.error) {
                            setGraphError(result.error);
                            setGraphData({
                                nodes: [],
                                edges: [],
                                links: []
                            });
                            return;
                        }
                        if (!result.nodes || !Array.isArray(result.nodes)) {
                            setGraphError('后端返回数据格式异常，缺少 nodes 字段');
                            setGraphData({
                                nodes: [],
                                edges: [],
                                links: []
                            });
                            return;
                        }
                        if (isSearch && result.nodes.length === 0) {
                            message.warning("未找到相关的关联主体");
                            setGraphData({
                                nodes: [],
                                edges: [],
                                links: []
                            });
                        } else {
                            var _dataWithLinks_nodes, _dataWithLinks_links;
                            const rawEdges = result.edges || result.links || [];
                            const dataWithLinks = {
                                ...result,
                                links: Array.isArray(rawEdges) ? rawEdges : []
                            };
                            setGraphData(dataWithLinks);
                            console.log('Graph data loaded:', {
                                nodes: (_dataWithLinks_nodes = dataWithLinks.nodes) === null || _dataWithLinks_nodes === void 0 ? void 0 : _dataWithLinks_nodes.length,
                                links: (_dataWithLinks_links = dataWithLinks.links) === null || _dataWithLinks_links === void 0 ? void 0 : _dataWithLinks_links.length
                            });
                            if (isSearch) message.success(`找到 ${result.nodes.length} 个关联节点`);
                        }
                    } catch (err) {
                        setGraphError('后端服务连接失败，请检查服务是否启动');
                        setGraphData({
                            nodes: [],
                            edges: [],
                            links: []
                        });
                    } finally{
                        setLoading(false);
                    }
                };
                const loadFullGraph = ()=>{
                    setLoading(true);
                    setFilterLayer(null);
                    loadData('/api/v1/graph/data?limit=100', false).finally(()=>setLoading(false));
                };
                const loadLayerFilter = (layer)=>{
                    if (filterLayer === layer) {
                        loadFullGraph();
                        return;
                    }
                    setLoading(true);
                    setFilterLayer(layer);
                    loadData(`/api/v1/graph/data?limit=100&layer=${layer}`, false).finally(()=>setLoading(false));
                };
                const loadLayerStatistics = async ()=>{
                    try {
                        // Use unified summary-stats endpoint (B1) for total counts
                        const response = await fetch('/api/v1/graph/summary-stats');
                        const data = await response.json();
                        if (data && data.total_nodes !== undefined) setLayerStats({
                            total: data.total_nodes,
                            total_relationships: data.total_relationships,
                            details: data.layers ? data.layers.map((l)=>({
                                    label: l.layer,
                                    value: l.node_count,
                                    type: l.layer_code
                                })) : []
                        });
                    } catch  {
                        // Fallback: use the enhanced /statistics?layer=all (B3)
                        try {
                            const response = await fetch('/api/v1/graph/statistics');
                            const data = await response.json();
                            if (data && data.total !== undefined && Array.isArray(data.details)) setLayerStats({
                                total: data.total,
                                total_relationships: data.total_relationships || 0,
                                details: data.details
                            });
                        } catch (err) {
                            console.error('加载层级统计失败:', err);
                        }
                    }
                };
                const loadDetailedStatistics = async ()=>{
                    try {
                        const response = await fetch('/api/v1/graph/statistics');
                        const result = await response.json();
                        if (result.success && result.layers) setDetailedStats(result.layers);
                    } catch (err) {
                        console.error('加载详细统计失败:', err);
                    }
                };
                var handleExportPNG = function() {
                    if (graphRef.current) {
                        graphRef.current.downloadFullImage('knowledge-graph-' + Date.now(), 'image/png', {
                            backgroundColor: '#fff',
                            padding: 20
                        });
                        message.success('图谱已导出为 PNG');
                    }
                };
                var handleExportCSV = function() {
                    var headers = '层级,节点数,节点类型数,关系数,关系类型数\r\n';
                    var rows = detailedStats.map(function(l) {
                        return l.layer + ',' + l.node_count + ',' + l.node_type_count + ',' + l.rel_count + ',' + l.rel_type_count;
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
                    a.download = 'knowledge-graph-stats-' + Date.now() + '.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                    message.success('统计数据已导出为 CSV');
                };
                const handleSearch = (values)=>{
                    const { keyword, layers, searchLayer } = values;
                    const params = new URLSearchParams();
                    if (keyword) params.append('q', keyword.trim());
                    if (layers) params.append('depth', layers.toString());
                    if (searchLayer && searchLayer !== 'all') params.append('layer', searchLayer);
                    params.append('limit', '200');
                    if (!keyword) loadFullGraph();
                    else loadData(`/api/v1/graph/search-all?${params.toString()}`, true);
                };
                const processedData = (0, _react.useMemo)(()=>{
                    if (!graphData || !graphData.nodes || !Array.isArray(graphData.nodes) || !graphData.nodes.length) return {
                        nodes: [],
                        links: []
                    };
                    const nodes = graphData.nodes.map((node)=>{
                        let typeKey = 'Unknown';
                        let layerIdx = 0;
                        const labels = node.labels || [];
                        const props = node.properties || {};
                        if (labels.includes('Subject')) {
                            layerIdx = 0;
                            typeKey = labels.includes('COMPANY') ? 'COMPANY' : 'PERSON';
                        } else if (labels.includes('Event')) {
                            layerIdx = 1;
                            // 判断是否为TIME节点
                            if (labels.includes('TIME')) typeKey = 'TIME';
                            else {
                                // 区分主事件和子事件
                                const nodeName = props.name || props.title || '';
                                const nodeType = props.node_type || '';
                                const eventType = props.event_type || '';
                                // 通过多种方式判断是否为子事件
                                if (props.parent_event || // 有父事件属性
                                nodeName.includes('子事件') || // 名称包含"子事件"
                                nodeType.includes('子') || // 节点类型包含"子"
                                eventType.includes('子') || // 事件类型包含"子"
                                props.is_sub_event === true || // 明确标记为子事件
                                props.level === 'sub' // 层级标记为sub
                                ) typeKey = 'SUB_EVENT';
                                else typeKey = 'EVENT';
                            }
                        } else if (labels.includes('Feature')) {
                            layerIdx = 2;
                            typeKey = labels.includes('RiskFeature') ? 'RiskFeature' : 'RiskFactor';
                        } else if (labels.includes('Regulation')) {
                            layerIdx = 3;
                            typeKey = 'Action';
                        }
                        const finalTypeKey = node.typeKey || typeKey;
                        const nodeStyle = NODE_STYLE_CONFIG[finalTypeKey] || NODE_STYLE_CONFIG['Unknown'];
                        // 根据节点类型选择显示的属性
                        let nodeName = '未知';
                        if (finalTypeKey === 'TIME') // TIME节点显示id属性
                        nodeName = props.id || props.time || props.name || '未知时间';
                        else if (finalTypeKey === 'RiskFactor') // 风险因子显示e_id属性
                        nodeName = props.e_id || props.factor_nm || props.name || '未知因子';
                        else if (finalTypeKey === 'RiskFeature') // 风险特征显示id属性
                        nodeName = props.id || props.feature_nm || props.name || '未知特征';
                        else // 其他节点显示常规属性
                        nodeName = props.name || props.COMPANY_NM || props.title || '未知';
                        return {
                            ...node,
                            id: String(node.id),
                            name: nodeName,
                            label: nodeName.length > 6 ? `${nodeName.substring(0, 6)}...` : nodeName,
                            fullLabel: nodeName,
                            typeKey: finalTypeKey,
                            layer: layerIdx,
                            color: nodeStyle.color,
                            levelName: nodeStyle.label,
                            y: getYByLayer(layerIdx),
                            style: {
                                fill: nodeStyle.color,
                                stroke: '#fff',
                                lineWidth: 2,
                                r: 30,
                                cursor: 'pointer'
                            },
                            labelCfg: {
                                position: 'center',
                                style: {
                                    fill: '#fff',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    textBaseline: 'middle'
                                }
                            }
                        };
                    }).filter(Boolean);
                    var processed = {
                        nodes: nodes,
                        links: []
                    };
                    var rawLinks = graphData.links || graphData.edges || [];
                    var linksArr = Array.isArray(rawLinks) ? rawLinks : [];
                    processed.links = linksArr.map(function(link) {
                        var sourceId = String(link.source || link.sourceId || '');
                        var targetId = String(link.target || link.targetId || '');
                        var sourceNode = nodes.find(function(n) {
                            return n.id === sourceId;
                        });
                        var targetNode = nodes.find(function(n) {
                            return n.id === targetId;
                        });
                        var edgeColor = '#d9d9d9';
                        var edgeWidth = 1.5;
                        if (sourceNode && targetNode) {
                            var key = sourceNode.layer + '-' + targetNode.layer;
                            var styleConfig = _graphConfig.EDGE_STYLE_MAP[key];
                            if (styleConfig) {
                                edgeColor = styleConfig.stroke;
                                edgeWidth = styleConfig.lineWidth;
                            }
                        }
                        return {
                            ...link,
                            id: sourceId + '-' + targetId + '-' + (link.label || 'default'),
                            source: sourceId,
                            target: targetId,
                            label: RELATION_LABEL_MAP[link.label] || link.label || '关联',
                            type: 'line',
                            style: {
                                endArrow: true,
                                stroke: edgeColor,
                                lineWidth: edgeWidth
                            },
                            labelCfg: {
                                autoRotate: true,
                                refY: -8,
                                style: {
                                    fill: edgeColor,
                                    fontSize: 10
                                }
                            }
                        };
                    }).filter(function(link) {
                        return link !== null;
                    });
                    return processed;
                }, [
                    graphData
                ]);
                (0, _react.useEffect)(()=>{
                    loadFullGraph();
                    loadLayerStatistics();
                    loadDetailedStatistics();
                    return ()=>{
                        if (graphRef.current) graphRef.current.destroy();
                    };
                }, []);
                (0, _react.useEffect)(()=>{
                    if (!containerRef.current || !processedData.nodes.length) return;
                    if (graphRef.current) graphRef.current.destroy();
                    var nodeCount = processedData.nodes.length;
                    var width = containerRef.current.scrollWidth || window.innerWidth;
                    var graph = new _g6.default.Graph({
                        container: containerRef.current,
                        width: width,
                        height: CANVAS_HEIGHT,
                        fitView: true,
                        fitViewPadding: 50,
                        renderer: 'canvas',
                        animate: nodeCount < 200,
                        layout: null,
                        defaultNode: {
                            type: 'circle',
                            size: 60,
                            labelCfg: {
                                position: 'center'
                            }
                        },
                        defaultEdge: {
                            type: 'line',
                            style: {
                                endArrow: true,
                                stroke: '#e2e2e2'
                            },
                            labelCfg: {
                                autoRotate: true,
                                refY: 10
                            }
                        },
                        modes: {
                            default: [
                                {
                                    type: 'drag-canvas',
                                    enableOptimize: true,
                                    scalableRange: 0.1
                                },
                                {
                                    type: 'zoom-canvas',
                                    sensitivity: 2,
                                    minZoom: 0.5,
                                    maxZoom: 3
                                },
                                'drag-node',
                                'click-select'
                            ]
                        },
                        plugins: [
                            new _g6.default.Tooltip({
                                offsetX: 10,
                                offsetY: 10,
                                itemTypes: [
                                    'node'
                                ],
                                getContent: (e)=>{
                                    var _e_item;
                                    const model = e === null || e === void 0 ? void 0 : (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getModel();
                                    if (!model) return '';
                                    const labels = model.labels || [];
                                    const hasEventLabels = labels.includes('EVENT') && labels.includes('Event');
                                    if (hasEventLabels) {
                                        var _model_properties;
                                        const textContent = ((_model_properties = model.properties) === null || _model_properties === void 0 ? void 0 : _model_properties.text) || '';
                                        if (textContent) return `<div style="padding: 12px; background: rgba(0, 0, 0, 0.85); color: #fff; border-radius: 4px; max-width: 300px; word-wrap: break-word; font-size: 13px; line-height: 1.5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">${textContent}</div>`;
                                    }
                                    return '';
                                },
                                shouldBegin: (e)=>{
                                    var _e_item, _model_properties;
                                    const model = e === null || e === void 0 ? void 0 : (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getModel();
                                    if (!model) return false;
                                    const labels = model.labels || [];
                                    const hasEventLabels = labels.includes('EVENT') && labels.includes('Event');
                                    return hasEventLabels && !!((_model_properties = model.properties) === null || _model_properties === void 0 ? void 0 : _model_properties.text);
                                }
                            })
                        ]
                    });
                    // 按层级和类型分组节点
                    const layerNodesMap = {};
                    const eventLayerNodes = {
                        main: [],
                        sub: [],
                        time: []
                    };
                    const featureLayerNodes = {
                        factor: [],
                        feature: []
                    };
                    processedData.nodes.forEach((node)=>{
                        const layer = node.layer || 0;
                        if (!layerNodesMap[layer]) layerNodesMap[layer] = [];
                        layerNodesMap[layer].push(node);
                        // 事件层特殊处理：分为主事件、子事件、时间三个子层
                        if (layer === 1) {
                            if (node.typeKey === 'EVENT') eventLayerNodes.main.push(node);
                            else if (node.typeKey === 'SUB_EVENT') eventLayerNodes.sub.push(node);
                            else if (node.typeKey === 'TIME') eventLayerNodes.time.push(node);
                        }
                        // 特征层特殊处理：分为风险因子和风险特征两个子层
                        if (layer === 2) {
                            if (node.typeKey === 'RiskFactor') featureLayerNodes.factor.push(node);
                            else if (node.typeKey === 'RiskFeature') featureLayerNodes.feature.push(node);
                        }
                    });
                    // 构建父子关系映射
                    const parentToChildren = new Map();
                    const childToParent = new Map();
                    processedData.links.forEach((link)=>{
                        const sourceId = String(link.source);
                        const targetId = String(link.target);
                        const sourceNode = processedData.nodes.find((n)=>n.id === sourceId);
                        const targetNode = processedData.nodes.find((n)=>n.id === targetId);
                        // 建立父子关系（从上层到下层）
                        if (sourceNode && targetNode) {
                            // 事件层：主事件 -> 子事件 -> 时间
                            if (sourceNode.typeKey === 'EVENT' && targetNode.typeKey === 'SUB_EVENT') {
                                var _parentToChildren_get;
                                if (!parentToChildren.has(sourceId)) parentToChildren.set(sourceId, []);
                                (_parentToChildren_get = parentToChildren.get(sourceId)) === null || _parentToChildren_get === void 0 || _parentToChildren_get.push(targetId);
                                childToParent.set(targetId, sourceId);
                            } else if (sourceNode.typeKey === 'SUB_EVENT' && targetNode.typeKey === 'TIME') {
                                var _parentToChildren_get1;
                                if (!parentToChildren.has(sourceId)) parentToChildren.set(sourceId, []);
                                (_parentToChildren_get1 = parentToChildren.get(sourceId)) === null || _parentToChildren_get1 === void 0 || _parentToChildren_get1.push(targetId);
                                childToParent.set(targetId, sourceId);
                            } else if (sourceNode.typeKey === 'RiskFactor' && targetNode.typeKey === 'RiskFeature') {
                                var _parentToChildren_get2;
                                if (!parentToChildren.has(sourceId)) parentToChildren.set(sourceId, []);
                                (_parentToChildren_get2 = parentToChildren.get(sourceId)) === null || _parentToChildren_get2 === void 0 || _parentToChildren_get2.push(targetId);
                                childToParent.set(targetId, sourceId);
                            }
                        }
                    });
                    // 计算节点位置 —— 多阶段管线
                    const leftMargin = 150;
                    const availableWidth = width - leftMargin * 2;
                    const nodeWidth = 80;
                    const layerCenterX = leftMargin + availableWidth / 2;
                    // 存储中间位置结果
                    var nodePositions = new Map();
                    // --- Phase 1: Layer 1 (Event) 三层树状布局 ---
                    var layerStartY1 = LAYER_HEIGHTS[0] + LAYER_GAP;
                    var subLayerH1 = LAYER_HEIGHTS[1] / 3;
                    // 先计算主事件 X 位置
                    eventLayerNodes.main.forEach(function(n, i) {
                        var total = eventLayerNodes.main.length;
                        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
                        var x = total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX;
                        var y = layerStartY1 + subLayerH1 * 0.5;
                        nodePositions.set(n.id, {
                            x: x,
                            y: y
                        });
                    });
                    // 子事件：基于父主事件的 X 分散
                    eventLayerNodes.sub.forEach(function(node) {
                        var parentId = childToParent.get(node.id);
                        var parentX = layerCenterX;
                        if (parentId) {
                            var parentPos = nodePositions.get(parentId);
                            if (parentPos) parentX = parentPos.x;
                        }
                        var siblings = parentId ? parentToChildren.get(parentId) || [] : [];
                        var idx = siblings.indexOf(node.id);
                        var count = siblings.length;
                        var x = parentX;
                        if (count > 1) {
                            var spread = Math.min(nodeWidth * count * 1.2, availableWidth / Math.max(eventLayerNodes.main.length, 1));
                            var step = spread / (count + 1);
                            x = parentX - spread / 2 + (idx + 1) * step;
                        }
                        nodePositions.set(node.id, {
                            x: x,
                            y: layerStartY1 + subLayerH1 * 1.5
                        });
                    });
                    // 时间节点：基于父子事件的 X 分散
                    eventLayerNodes.time.forEach(function(node) {
                        var parentId = childToParent.get(node.id);
                        var parentX = layerCenterX;
                        if (parentId) {
                            var parentPos = nodePositions.get(parentId);
                            if (parentPos) parentX = parentPos.x;
                        }
                        var siblings = parentId ? parentToChildren.get(parentId) || [] : [];
                        var idx = siblings.indexOf(node.id);
                        var count = siblings.length;
                        var x = parentX;
                        if (count > 1) {
                            var spread = Math.min(nodeWidth * count * 0.8, nodeWidth * 3);
                            var step = spread / (count + 1);
                            x = parentX - spread / 2 + (idx + 1) * step;
                        }
                        nodePositions.set(node.id, {
                            x: x,
                            y: layerStartY1 + subLayerH1 * 2.5
                        });
                    });
                    // --- Phase 2: Layer 2 (Feature) 两层树状布局 ---
                    var layerStartY2 = LAYER_HEIGHTS[0] + LAYER_GAP + LAYER_HEIGHTS[1] + LAYER_GAP;
                    var subLayerH2 = LAYER_HEIGHTS[2] / 2;
                    featureLayerNodes.factor.forEach(function(n, i) {
                        var total = featureLayerNodes.factor.length;
                        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
                        var x = total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX;
                        nodePositions.set(n.id, {
                            x: x,
                            y: layerStartY2 + subLayerH2 * 0.5
                        });
                    });
                    featureLayerNodes.feature.forEach(function(node) {
                        var parentId = childToParent.get(node.id);
                        var parentX = layerCenterX;
                        if (parentId) {
                            var parentPos = nodePositions.get(parentId);
                            if (parentPos) parentX = parentPos.x;
                        }
                        var siblings = parentId ? parentToChildren.get(parentId) || [] : [];
                        var idx = siblings.indexOf(node.id);
                        var count = siblings.length;
                        var x = parentX;
                        if (count > 1) {
                            var spread = Math.min(nodeWidth * count * 1.2, availableWidth / Math.max(featureLayerNodes.factor.length, 1));
                            var step = spread / (count + 1);
                            x = parentX - spread / 2 + (idx + 1) * step;
                        }
                        nodePositions.set(node.id, {
                            x: x,
                            y: layerStartY2 + subLayerH2 * 1.5
                        });
                    });
                    // --- Phase 3: Layer 0 (Subject) 质心排序 ---
                    // 基于与 Layer 1 节点的连接关系排序，减少跨层边交叉
                    var layer0Nodes = (layerNodesMap[0] || []).slice();
                    var layer1All = [
                        {
                            id: '',
                            x: 0,
                            y: 0
                        }
                    ].concat(eventLayerNodes.main.map(function(n) {
                        var _nodePositions_get;
                        return {
                            id: n.id,
                            x: ((_nodePositions_get = nodePositions.get(n.id)) === null || _nodePositions_get === void 0 ? void 0 : _nodePositions_get.x) ?? layerCenterX,
                            y: 0
                        };
                    }), eventLayerNodes.sub.map(function(n) {
                        var _nodePositions_get;
                        return {
                            id: n.id,
                            x: ((_nodePositions_get = nodePositions.get(n.id)) === null || _nodePositions_get === void 0 ? void 0 : _nodePositions_get.x) ?? layerCenterX,
                            y: 0
                        };
                    }), eventLayerNodes.time.map(function(n) {
                        var _nodePositions_get;
                        return {
                            id: n.id,
                            x: ((_nodePositions_get = nodePositions.get(n.id)) === null || _nodePositions_get === void 0 ? void 0 : _nodePositions_get.x) ?? layerCenterX,
                            y: 0
                        };
                    })).filter(function(n) {
                        return n.id !== '';
                    });
                    var sortedLayer0 = (0, _layouts.barycenterSort)(layer0Nodes.map(function(n) {
                        return {
                            id: n.id
                        };
                    }), layer1All, processedData.links.map(function(l) {
                        return {
                            source: String(l.source),
                            target: String(l.target)
                        };
                    }));
                    sortedLayer0.forEach(function(sortedNode, i) {
                        var total = sortedLayer0.length;
                        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
                        nodePositions.set(sortedNode.id, {
                            x: total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX,
                            y: getYByLayer(0)
                        });
                    });
                    // Phase 3 补充：Layer 0 中未被 barycenterSort 覆盖的节点（理论上不会有）
                    layer0Nodes.forEach(function(n) {
                        if (!nodePositions.has(n.id)) nodePositions.set(n.id, {
                            x: layerCenterX,
                            y: getYByLayer(0)
                        });
                    });
                    // --- Phase 4: Layer 3 (Regulation) 质心排序 ---
                    var layer3Nodes = (layerNodesMap[3] || []).slice();
                    var layer2All = featureLayerNodes.factor.concat(featureLayerNodes.feature).map(function(n) {
                        var _nodePositions_get;
                        return {
                            id: n.id,
                            x: ((_nodePositions_get = nodePositions.get(n.id)) === null || _nodePositions_get === void 0 ? void 0 : _nodePositions_get.x) ?? layerCenterX,
                            y: 0
                        };
                    });
                    var sortedLayer3 = (0, _layouts.barycenterSort)(layer3Nodes.map(function(n) {
                        return {
                            id: n.id
                        };
                    }), layer2All, processedData.links.map(function(l) {
                        return {
                            source: String(l.source),
                            target: String(l.target)
                        };
                    }));
                    sortedLayer3.forEach(function(sortedNode, i) {
                        var total = sortedLayer3.length;
                        var spacing = total > 1 ? availableWidth / (total + 1) : 0;
                        nodePositions.set(sortedNode.id, {
                            x: total > 1 ? leftMargin + (i + 1) * spacing : layerCenterX,
                            y: getYByLayer(3)
                        });
                    });
                    layer3Nodes.forEach(function(n) {
                        if (!nodePositions.has(n.id)) nodePositions.set(n.id, {
                            x: layerCenterX,
                            y: getYByLayer(3)
                        });
                    });
                    // --- Phase 5: 约束力导向精炼 ---
                    // Y 坐标锁定在泳道内，仅 X 通过力模拟调整，使同层节点按连接关系自然聚合
                    var forceNodes = processedData.nodes.map(function(n) {
                        var pos = nodePositions.get(n.id) || {
                            x: layerCenterX,
                            y: getYByLayer(n.layer || 0)
                        };
                        return {
                            id: n.id,
                            x: pos.x,
                            y: pos.y,
                            assignedY: pos.y
                        };
                    });
                    var forceEdges = processedData.links.map(function(l) {
                        return {
                            source: String(l.source),
                            target: String(l.target)
                        };
                    });
                    (0, _layouts.constrainedForceLayout)(forceNodes, forceEdges, layerCenterX, {
                        repulsionStrength: 5000,
                        attractionStrength: 0.01,
                        gravity: 0.03,
                        maxIterations: 80
                    });
                    // 构建最终的 nodesWithPosition
                    var forcePosMap = new Map();
                    forceNodes.forEach(function(n) {
                        forcePosMap.set(n.id, {
                            x: n.x,
                            y: n.y
                        });
                    });
                    var nodesWithPosition = processedData.nodes.map(function(node) {
                        var pos = forcePosMap.get(node.id);
                        if (pos) return Object.assign({}, node, {
                            x: pos.x,
                            y: pos.y
                        });
                        var fallbackPos = nodePositions.get(node.id);
                        return Object.assign({}, node, {
                            x: fallbackPos ? fallbackPos.x : layerCenterX,
                            y: fallbackPos ? fallbackPos.y : getYByLayer(node.layer || 0)
                        });
                    });
                    graph.data({
                        nodes: nodesWithPosition,
                        edges: processedData.links
                    });
                    graph.render();
                    drawSwimlanes(graph, width);
                    graph.on('node:click', (evt)=>{
                        const item = evt.item;
                        const model = item === null || item === void 0 ? void 0 : item.getModel();
                        if (!model) return;
                        setSelectedNode(model);
                        setDrawerVisible(true);
                    });
                    // Double-click to expand neighbor nodes
                    graph.on('node:dblclick', async (evt)=>{
                        const item = evt.item;
                        const model = item === null || item === void 0 ? void 0 : item.getModel();
                        if (!model || expanding) return;
                        setExpanding(true);
                        try {
                            const nodeId = model.id;
                            const response = await fetch(`/api/v1/graph/expand/${nodeId}?depth=1&limit=100`);
                            const result = await response.json();
                            if (result.nodes && result.nodes.length > 0) {
                                // Merge new nodes and edges with existing graph data
                                const existingNodeIds = new Set(processedData.nodes.map((n)=>n.id));
                                const existingEdgeIds = new Set(processedData.links.map((l)=>l.id));
                                const newNodes = result.nodes.filter((n)=>!existingNodeIds.has(n.id));
                                const newEdges = (result.edges || []).filter((e)=>{
                                    const eid = `${e.source || e.sourceId}-${e.target || e.targetId}-${e.label || 'default'}`;
                                    return !existingEdgeIds.has(eid);
                                });
                                if (newNodes.length > 0 || newEdges.length > 0) {
                                    setGraphData((prev)=>({
                                            nodes: [
                                                ...prev.nodes,
                                                ...newNodes
                                            ],
                                            edges: [
                                                ...prev.edges || [],
                                                ...newEdges
                                            ],
                                            links: [
                                                ...prev.links || prev.edges || [],
                                                ...newEdges
                                            ]
                                        }));
                                    message.success(`展开 ${newNodes.length} 个新节点，${newEdges.length} 条新关系`);
                                } else message.info('未发现新的关联节点');
                            }
                        } catch (err) {
                            message.error('展开子图失败');
                        } finally{
                            setExpanding(false);
                        }
                    });
                    graphRef.current = graph;
                    return ()=>{
                        graph.destroy();
                    };
                }, [
                    processedData
                ]);
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
                    title: "四层知识图谱检索",
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            style: {
                                marginBottom: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                    gutter: [
                                        16,
                                        0
                                    ],
                                    align: "middle",
                                    style: {
                                        padding: '6px 0',
                                        marginBottom: 16
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "1",
                                            style: {
                                                cursor: 'pointer'
                                            },
                                            onClick: ()=>loadFullGraph(),
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(CustomStatistic, {
                                                title: filterLayer ? "总节点数（点击取消筛选）" : "总节点数",
                                                value: layerStats.total
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 766,
                                                columnNumber: 13
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 765,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "0 0 1px",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    borderLeft: '1px solid #e8e8e8',
                                                    height: '40px'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 768,
                                                columnNumber: 31
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 768,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "1",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(CustomStatistic, {
                                                title: "总关系数",
                                                value: layerStats.total_relationships || 0
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 769,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 769,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "0 0 1px",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    borderLeft: '1px solid #e8e8e8',
                                                    height: '40px'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 770,
                                                columnNumber: 31
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 770,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "1",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(CustomStatistic, {
                                                title: "当前节点数",
                                                value: processedData.nodes.length
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 771,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 771,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "0 0 1px",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    borderLeft: '1px solid #e8e8e8',
                                                    height: '40px'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 772,
                                                columnNumber: 31
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 772,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "1",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(CustomStatistic, {
                                                title: "当前关系数",
                                                value: processedData.links.length
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 773,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 773,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "0 0 1px",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    borderLeft: '1px solid #e8e8e8',
                                                    height: '40px'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 774,
                                                columnNumber: 31
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 774,
                                            columnNumber: 11
                                        }, this),
                                        layerStats.details.map((layer, index)=>{
                                            const config = NODE_STYLE_CONFIG[layer.type] || {
                                                color: '#BFBFBF',
                                                label: layer.label
                                            };
                                            const isActive = filterLayer === layer.type;
                                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                        flex: "1",
                                                        style: {
                                                            cursor: 'pointer'
                                                        },
                                                        onClick: ()=>loadLayerFilter(layer.type),
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '2px 0',
                                                                textAlign: 'center',
                                                                borderRadius: 8,
                                                                border: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                                                                background: isActive ? `${config.color}15` : 'transparent',
                                                                margin: '-2px',
                                                                transition: 'all 0.2s'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginBottom: 4
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                            style: {
                                                                                width: 10,
                                                                                height: 10,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: config.color,
                                                                                marginRight: 6,
                                                                                display: 'inline-block'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/GeneralPage.tsx",
                                                                            lineNumber: 791,
                                                                            columnNumber: 23
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                            style: {
                                                                                fontSize: '14px',
                                                                                color: 'rgba(0,0,0,0.65)',
                                                                                fontWeight: 500
                                                                            },
                                                                            children: layer.label
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/GeneralPage.tsx",
                                                                            lineNumber: 792,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/GeneralPage.tsx",
                                                                    lineNumber: 790,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        fontSize: '24px',
                                                                        fontWeight: '600',
                                                                        color: '#000'
                                                                    },
                                                                    children: layer.value.toLocaleString()
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/GeneralPage.tsx",
                                                                    lineNumber: 794,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 781,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 780,
                                                        columnNumber: 17
                                                    }, this),
                                                    index < layerStats.details.length - 1 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                        flex: "0 0 1px",
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                borderLeft: '1px solid #e8e8e8',
                                                                height: '40px'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 797,
                                                            columnNumber: 79
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 797,
                                                        columnNumber: 59
                                                    }, this)
                                                ]
                                            }, layer.type, true, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 779,
                                                columnNumber: 15
                                            }, this);
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/GeneralPage.tsx",
                                    lineNumber: 764,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        marginTop: 16,
                                        paddingTop: 16,
                                        borderTop: '1px solid #f0f0f0'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                fontSize: 15,
                                                fontWeight: 600,
                                                marginBottom: 12,
                                                color: 'rgba(0,0,0,0.85)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6
                                            },
                                            onClick: ()=>setShowDetailedStats(!showDetailedStats),
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownOutlined, {
                                                    style: {
                                                        fontSize: 11,
                                                        transition: 'transform 0.2s',
                                                        transform: showDetailedStats ? 'rotate(180deg)' : 'rotate(0deg)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 808,
                                                    columnNumber: 13
                                                }, this),
                                                "层级详细统计"
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 804,
                                            columnNumber: 11
                                        }, this),
                                        showDetailedStats && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                            gutter: 12,
                                            children: detailedStats.map((layer)=>{
                                                const layerColors = {
                                                    'Subject': '#f0f8ff',
                                                    'Event': '#fff5f5',
                                                    'Feature': '#f6fff6',
                                                    'Regulation': '#faf5ff'
                                                };
                                                const layerBorderColors = {
                                                    'Subject': '#1890ff',
                                                    'Event': '#ff4d4f',
                                                    'Feature': '#52c41a',
                                                    'Regulation': '#722ed1'
                                                };
                                                const nodeTypesContent = /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        maxHeight: 150,
                                                        overflowY: 'auto',
                                                        minWidth: 120,
                                                        maxWidth: 200
                                                    },
                                                    children: layer.node_types.length > 0 ? layer.node_types.map((type, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '6px 12px',
                                                                fontSize: 12,
                                                                color: '#333',
                                                                borderBottom: idx < layer.node_types.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                                transition: 'background 0.2s',
                                                                cursor: 'default'
                                                            },
                                                            onMouseEnter: (e)=>e.currentTarget.style.background = '#f5f5f5',
                                                            onMouseLeave: (e)=>e.currentTarget.style.background = 'transparent',
                                                            children: [
                                                                "• ",
                                                                type
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 830,
                                                            columnNumber: 23
                                                        }, this)) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            padding: '8px 12px',
                                                            fontSize: 12,
                                                            color: '#999',
                                                            textAlign: 'center'
                                                        },
                                                        children: "暂无类型"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 847,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 827,
                                                    columnNumber: 17
                                                }, this);
                                                const relTypesContent = /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        maxHeight: 150,
                                                        overflowY: 'auto',
                                                        minWidth: 120,
                                                        maxWidth: 200
                                                    },
                                                    children: layer.rel_types.length > 0 ? layer.rel_types.map((type, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '6px 12px',
                                                                fontSize: 12,
                                                                color: '#333',
                                                                borderBottom: idx < layer.rel_types.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                                transition: 'background 0.2s',
                                                                cursor: 'default'
                                                            },
                                                            onMouseEnter: (e)=>e.currentTarget.style.background = '#f5f5f5',
                                                            onMouseLeave: (e)=>e.currentTarget.style.background = 'transparent',
                                                            children: [
                                                                "• ",
                                                                type
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 856,
                                                            columnNumber: 23
                                                        }, this)) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            padding: '8px 12px',
                                                            fontSize: 12,
                                                            color: '#999',
                                                            textAlign: 'center'
                                                        },
                                                        children: "暂无类型"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 873,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 853,
                                                    columnNumber: 17
                                                }, this);
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                    span: 6,
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                        size: "small",
                                                        style: {
                                                            background: layerColors[layer.layer_code] || '#fafafa',
                                                            borderColor: layerBorderColors[layer.layer_code] || '#d9d9d9',
                                                            borderWidth: 1,
                                                            borderRadius: 8,
                                                            height: '100%',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                            transition: 'all 0.3s'
                                                        },
                                                        styles: {
                                                            body: {
                                                                padding: '14px'
                                                            }
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    textAlign: 'center',
                                                                    marginBottom: 12,
                                                                    paddingBottom: 10,
                                                                    borderBottom: `2px solid ${layerBorderColors[layer.layer_code]}`
                                                                },
                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        fontSize: 16,
                                                                        fontWeight: 'bold',
                                                                        color: layerBorderColors[layer.layer_code]
                                                                    },
                                                                    children: layer.layer
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/GeneralPage.tsx",
                                                                    lineNumber: 902,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                lineNumber: 901,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                                direction: "vertical",
                                                                size: 8,
                                                                style: {
                                                                    width: '100%'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            padding: '2px 0'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    fontSize: 12,
                                                                                    color: 'rgba(0,0,0,0.65)'
                                                                                },
                                                                                children: "节点总数:"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 908,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    fontSize: 20,
                                                                                    fontWeight: 'bold',
                                                                                    color: layerBorderColors[layer.layer_code]
                                                                                },
                                                                                children: layer.node_count
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 909,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                        lineNumber: 907,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            background: 'rgba(255,255,255,0.8)',
                                                                            padding: '6px 8px',
                                                                            borderRadius: 4,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            border: '1px solid rgba(0,0,0,0.04)'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 6
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            color: 'rgba(0,0,0,0.6)'
                                                                                        },
                                                                                        children: "节点类型数:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                                        lineNumber: 922,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                        style: {
                                                                                            fontSize: 13,
                                                                                            fontWeight: 'bold',
                                                                                            color: layerBorderColors[layer.layer_code]
                                                                                        },
                                                                                        children: layer.node_type_count
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                                        lineNumber: 923,
                                                                                        columnNumber: 27
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 921,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Popover, {
                                                                                content: nodeTypesContent,
                                                                                trigger: "click",
                                                                                placement: "bottomRight",
                                                                                overlayStyle: {
                                                                                    padding: 0
                                                                                },
                                                                                overlayInnerStyle: {
                                                                                    padding: 0,
                                                                                    borderRadius: 6
                                                                                },
                                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownOutlined, {
                                                                                    style: {
                                                                                        fontSize: 11,
                                                                                        color: layerBorderColors[layer.layer_code],
                                                                                        cursor: 'pointer',
                                                                                        padding: '4px',
                                                                                        borderRadius: '50%',
                                                                                        transition: 'all 0.2s'
                                                                                    },
                                                                                    onMouseEnter: (e)=>{
                                                                                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                                                                                    },
                                                                                    onMouseLeave: (e)=>{
                                                                                        e.currentTarget.style.background = 'transparent';
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/GeneralPage.tsx",
                                                                                    lineNumber: 932,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 925,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                        lineNumber: 912,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            padding: '2px 0'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    fontSize: 12,
                                                                                    color: 'rgba(0,0,0,0.65)'
                                                                                },
                                                                                children: "关系总数:"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 952,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                style: {
                                                                                    fontSize: 20,
                                                                                    fontWeight: 'bold',
                                                                                    color: layerBorderColors[layer.layer_code]
                                                                                },
                                                                                children: layer.rel_count
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 953,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                        lineNumber: 951,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            background: 'rgba(255,255,255,0.8)',
                                                                            padding: '6px 8px',
                                                                            borderRadius: 4,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            border: '1px solid rgba(0,0,0,0.04)'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 6
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            color: 'rgba(0,0,0,0.6)'
                                                                                        },
                                                                                        children: "关系类型数:"
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                                        lineNumber: 966,
                                                                                        columnNumber: 27
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                        style: {
                                                                                            fontSize: 13,
                                                                                            fontWeight: 'bold',
                                                                                            color: layerBorderColors[layer.layer_code]
                                                                                        },
                                                                                        children: layer.rel_type_count
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                                        lineNumber: 967,
                                                                                        columnNumber: 27
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 965,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Popover, {
                                                                                content: relTypesContent,
                                                                                trigger: "click",
                                                                                placement: "bottomRight",
                                                                                overlayStyle: {
                                                                                    padding: 0
                                                                                },
                                                                                overlayInnerStyle: {
                                                                                    padding: 0,
                                                                                    borderRadius: 6
                                                                                },
                                                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownOutlined, {
                                                                                    style: {
                                                                                        fontSize: 11,
                                                                                        color: layerBorderColors[layer.layer_code],
                                                                                        cursor: 'pointer',
                                                                                        padding: '4px',
                                                                                        borderRadius: '50%',
                                                                                        transition: 'all 0.2s'
                                                                                    },
                                                                                    onMouseEnter: (e)=>{
                                                                                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                                                                                    },
                                                                                    onMouseLeave: (e)=>{
                                                                                        e.currentTarget.style.background = 'transparent';
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/GeneralPage.tsx",
                                                                                    lineNumber: 976,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                                lineNumber: 969,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/GeneralPage.tsx",
                                                                        lineNumber: 956,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                lineNumber: 906,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 880,
                                                        columnNumber: 19
                                                    }, this)
                                                }, layer.layer_code, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 879,
                                                    columnNumber: 17
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 811,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/GeneralPage.tsx",
                                    lineNumber: 803,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 763,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            style: {
                                marginBottom: 16
                            },
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form, {
                                form: form,
                                layout: "vertical",
                                onFinish: handleSearch,
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                    gutter: 16,
                                    align: "bottom",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            flex: "1",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                                label: "按节点名称查询",
                                                name: "keyword",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Input, {
                                                    placeholder: "输入任意节点名称（支持所有层级节点）",
                                                    style: {
                                                        height: 40
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 1009,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1008,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1007,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            style: {
                                                width: 160
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                                label: "检索层级",
                                                name: "searchLayer",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                initialValue: "all",
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                                    options: [
                                                        {
                                                            value: 'all',
                                                            label: '全部层级'
                                                        },
                                                        {
                                                            value: 'Subject',
                                                            label: '主体层'
                                                        },
                                                        {
                                                            value: 'Event',
                                                            label: '事件层'
                                                        },
                                                        {
                                                            value: 'Feature',
                                                            label: '特征层'
                                                        },
                                                        {
                                                            value: 'Regulation',
                                                            label: '法规层'
                                                        }
                                                    ],
                                                    style: {
                                                        height: 40
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 1014,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1012,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            style: {
                                                width: 140
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                                label: "穿透深度",
                                                name: "layers",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                initialValue: 1,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                                    options: [
                                                        {
                                                            value: 1,
                                                            label: '1层'
                                                        },
                                                        {
                                                            value: 2,
                                                            label: '2层'
                                                        },
                                                        {
                                                            value: 3,
                                                            label: '3层'
                                                        },
                                                        {
                                                            value: 4,
                                                            label: '4层'
                                                        }
                                                    ],
                                                    style: {
                                                        height: 40
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 1025,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1023,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        type: "primary",
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 1030,
                                                            columnNumber: 46
                                                        }, void 0),
                                                        onClick: ()=>form.submit(),
                                                        style: {
                                                            height: 42,
                                                            width: 42
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1030,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 1031,
                                                            columnNumber: 31
                                                        }, void 0),
                                                        onClick: ()=>{
                                                            form.resetFields();
                                                            loadFullGraph();
                                                        },
                                                        style: {
                                                            height: 42,
                                                            width: 42
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1031,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "导出图谱PNG",
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PictureOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                lineNumber: 1032,
                                                                columnNumber: 56
                                                            }, void 0),
                                                            onClick: handleExportPNG,
                                                            style: {
                                                                height: 42
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 1032,
                                                            columnNumber: 42
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1032,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "导出统计CSV",
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileExcelOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                lineNumber: 1033,
                                                                columnNumber: 56
                                                            }, void 0),
                                                            onClick: handleExportCSV,
                                                            style: {
                                                                height: 42
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 1033,
                                                            columnNumber: 42
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1033,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1029,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1028,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/GeneralPage.tsx",
                                    lineNumber: 1006,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/GeneralPage.tsx",
                                lineNumber: 1005,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 1004,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            styles: {
                                body: {
                                    padding: 0
                                }
                            },
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    background: '#fff',
                                    height: CANVAS_HEIGHT,
                                    position: 'relative'
                                },
                                children: [
                                    loading && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 100,
                                            background: 'rgba(255,255,255,0.7)'
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                            size: "large",
                                            tip: "加载图谱数据..."
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1044,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/GeneralPage.tsx",
                                        lineNumber: 1043,
                                        columnNumber: 13
                                    }, this),
                                    !loading && processedData.nodes.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%'
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                            description: "暂无图谱数据",
                                            image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                type: "primary",
                                                onClick: loadFullGraph,
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 1050,
                                                    columnNumber: 70
                                                }, void 0),
                                                children: "刷新数据"
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/GeneralPage.tsx",
                                            lineNumber: 1049,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/GeneralPage.tsx",
                                        lineNumber: 1048,
                                        columnNumber: 13
                                    }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        ref: containerRef,
                                        style: {
                                            width: '100%',
                                            height: CANVAS_HEIGHT,
                                            background: '#fff'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/GeneralPage.tsx",
                                        lineNumber: 1054,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/GeneralPage.tsx",
                                lineNumber: 1041,
                                columnNumber: 9
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 1040,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                            title: "节点详情",
                            width: 380,
                            onClose: ()=>setDrawerVisible(false),
                            open: drawerVisible,
                            children: selectedNode ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                direction: "vertical",
                                style: {
                                    width: '100%'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: 16
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: selectedNode.color,
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                    marginRight: 16
                                                },
                                                children: (_selectedNode_levelName = selectedNode.levelName) === null || _selectedNode_levelName === void 0 ? void 0 : _selectedNode_levelName[0]
                                            }, void 0, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1063,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("h3", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 18
                                                        },
                                                        children: selectedNode.name
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1067,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: selectedNode.color,
                                                        children: selectedNode.levelName
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1068,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 12
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            type: "primary",
                                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/GeneralPage.tsx",
                                                                lineNumber: 1072,
                                                                columnNumber: 27
                                                            }, void 0),
                                                            loading: expanding,
                                                            onClick: async ()=>{
                                                                setDrawerVisible(false);
                                                                if (!(selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.id)) return;
                                                                setExpanding(true);
                                                                try {
                                                                    const response = await fetch(`/api/v1/graph/expand/${selectedNode.id}?depth=1&limit=100`);
                                                                    const result = await response.json();
                                                                    if (result.nodes && result.nodes.length > 0) {
                                                                        setGraphData((prev)=>{
                                                                            const existingNodeIds = new Set((prev.nodes || []).map((n)=>n.id));
                                                                            const existingEdgeIds = new Set((prev.links || prev.edges || []).map((l)=>`${l.source || l.sourceId}-${l.target || l.targetId}-${l.label || 'default'}`));
                                                                            const newNodes = result.nodes.filter((n)=>!existingNodeIds.has(n.id));
                                                                            const newEdges = (result.edges || []).filter((e)=>{
                                                                                const eid = `${e.source || e.sourceId}-${e.target || e.targetId}-${e.label || 'default'}`;
                                                                                return !existingEdgeIds.has(eid);
                                                                            });
                                                                            return {
                                                                                nodes: [
                                                                                    ...prev.nodes || [],
                                                                                    ...newNodes
                                                                                ],
                                                                                edges: [
                                                                                    ...prev.edges || [],
                                                                                    ...newEdges
                                                                                ],
                                                                                links: [
                                                                                    ...prev.links || prev.edges || [],
                                                                                    ...newEdges
                                                                                ]
                                                                            };
                                                                        });
                                                                        message.success(`展开 ${result.nodes.length} 个关联节点`);
                                                                    }
                                                                } catch (err) {
                                                                    message.error('展开子图失败');
                                                                } finally{
                                                                    setExpanding(false);
                                                                }
                                                            },
                                                            children: "展开关联"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/GeneralPage.tsx",
                                                            lineNumber: 1070,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/GeneralPage.tsx",
                                                        lineNumber: 1069,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1066,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/GeneralPage.tsx",
                                        lineNumber: 1062,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                        column: 1,
                                        bordered: true,
                                        size: "small",
                                        children: Object.keys(selectedNode.properties || {}).map((key)=>{
                                            var _PROPERTY_MAP_key;
                                            const val = selectedNode.properties[key];
                                            if (!val || val === null || val === undefined) return null;
                                            // 格式化属性名称
                                            const label = ((_PROPERTY_MAP_key = PROPERTY_MAP[key]) === null || _PROPERTY_MAP_key === void 0 ? void 0 : _PROPERTY_MAP_key.label) || key;
                                            // 格式化值
                                            let displayValue = String(val);
                                            if (typeof val === 'object') displayValue = JSON.stringify(val, null, 2);
                                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                label: label,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        wordBreak: 'break-all'
                                                    },
                                                    children: displayValue
                                                }, void 0, false, {
                                                    fileName: "src/pages/GeneralPage.tsx",
                                                    lineNumber: 1127,
                                                    columnNumber: 21
                                                }, this)
                                            }, key, false, {
                                                fileName: "src/pages/GeneralPage.tsx",
                                                lineNumber: 1126,
                                                columnNumber: 19
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "src/pages/GeneralPage.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/GeneralPage.tsx",
                                lineNumber: 1061,
                                columnNumber: 11
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {}, void 0, false, {
                                fileName: "src/pages/GeneralPage.tsx",
                                lineNumber: 1133,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/GeneralPage.tsx",
                            lineNumber: 1059,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/GeneralPage.tsx",
                    lineNumber: 762,
                    columnNumber: 5
                }, this);
            };
            _s(GeneralPage, "16mvezJS3LZpKAdE9rgsVnVwOZ4=", false, function() {
                return [
                    _antd.Form.useForm,
                    _antd.App.useApp
                ];
            });
            _c3 = GeneralPage;
            var _default = GeneralPage;
            var _c;
            var _c1;
            var _c2;
            var _c3;
            $RefreshReg$(_c, "NODE_TYPE_OPTIONS$Object.keys(NODE_STYLE_CONFIG)\r\n  .filter(k => k !== 'Unknown')\r\n  .map");
            $RefreshReg$(_c1, "NODE_TYPE_OPTIONS");
            $RefreshReg$(_c2, "CustomStatistic");
            $RefreshReg$(_c3, "GeneralPage");
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
        "src/pages/KnowledgeGraph/layouts/barycenterSort.ts": function(module, exports, __mako_require__) {
            "use strict";
            __mako_require__.d(exports, "__esModule", {
                value: true
            });
            __mako_require__.d(exports, "barycenterSort", {
                enumerable: true,
                get: function() {
                    return barycenterSort;
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
            function barycenterSort(layerNodes, adjacentNodes, edges) {
                const adjacentMap = new Map();
                adjacentNodes.forEach(function(n) {
                    adjacentMap.set(n.id, n);
                });
                const layerNodeIds = new Set(layerNodes.map(function(n) {
                    return n.id;
                }));
                const adjacency = new Map();
                layerNodes.forEach(function(n) {
                    adjacency.set(n.id, []);
                });
                edges.forEach(function(e) {
                    if (layerNodeIds.has(e.source) && adjacentMap.has(e.target)) adjacency.get(e.source).push(e.target);
                    if (layerNodeIds.has(e.target) && adjacentMap.has(e.source)) adjacency.get(e.target).push(e.source);
                });
                var scored = layerNodes.map(function(node) {
                    var neighbors = adjacency.get(node.id) || [];
                    if (neighbors.length === 0) return {
                        node: node,
                        barycenter: null
                    };
                    var sumX = neighbors.reduce(function(s, nid) {
                        var neighbor = adjacentMap.get(nid);
                        return s + (neighbor && neighbor.x !== undefined ? neighbor.x : 0);
                    }, 0);
                    return {
                        node: node,
                        barycenter: sumX / neighbors.length
                    };
                });
                scored.sort(function(a, b) {
                    if (a.barycenter === null && b.barycenter === null) return 0;
                    if (a.barycenter === null) return 1;
                    if (b.barycenter === null) return -1;
                    return a.barycenter - b.barycenter;
                });
                return scored.map(function(s) {
                    return s.node;
                });
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
        "src/pages/KnowledgeGraph/layouts/constrainedForce.ts": function(module, exports, __mako_require__) {
            "use strict";
            __mako_require__.d(exports, "__esModule", {
                value: true
            });
            __mako_require__.d(exports, "constrainedForceLayout", {
                enumerable: true,
                get: function() {
                    return constrainedForceLayout;
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
            function constrainedForceLayout(nodes, edges, layerCenterX, options = {}) {
                var repulsionStrength = options.repulsionStrength ?? 5000;
                var attractionStrength = options.attractionStrength ?? 0.01;
                var gravity = options.gravity ?? 0.05;
                var maxIterations = options.maxIterations ?? 100;
                var minMovement = options.minMovement ?? 0.1;
                var nodeMap = new Map();
                nodes.forEach(function(n) {
                    nodeMap.set(n.id, n);
                });
                var edgePairs = [];
                edges.forEach(function(e) {
                    var src = nodeMap.get(e.source);
                    var tgt = nodeMap.get(e.target);
                    if (src && tgt) edgePairs.push({
                        source: src,
                        target: tgt
                    });
                });
                for(var iter = 0; iter < maxIterations; iter++){
                    var totalMovement = 0;
                    // N-body repulsion (O(n^2) — acceptable for < 200 nodes)
                    for(var i = 0; i < nodes.length; i++)for(var j = i + 1; j < nodes.length; j++){
                        var dx = nodes[j].x - nodes[i].x;
                        var dy = nodes[j].assignedY - nodes[i].assignedY;
                        var dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                        var force = repulsionStrength / (dist * dist);
                        var fx = dx / dist * force;
                        nodes[i].x -= fx;
                        nodes[j].x += fx;
                    }
                    // Spring attraction along edges
                    edgePairs.forEach(function(pair) {
                        var dx = pair.target.x - pair.source.x;
                        var dist = Math.max(Math.abs(dx), 1);
                        var force = dist * attractionStrength;
                        pair.source.x += force * Math.sign(dx);
                        pair.target.x -= force * Math.sign(dx);
                    });
                    // Y constraint + center gravity
                    nodes.forEach(function(n) {
                        n.y = n.assignedY;
                        var dx = layerCenterX - n.x;
                        n.x += dx * gravity;
                        totalMovement += Math.abs(dx * gravity);
                    });
                    if (totalMovement / nodes.length < minMovement) break;
                }
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
        "src/pages/KnowledgeGraph/layouts/index.ts": function(module, exports, __mako_require__) {
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
                barycenterSort: function() {
                    return _barycenterSort.barycenterSort;
                },
                constrainedForceLayout: function() {
                    return _constrainedForce.constrainedForceLayout;
                }
            });
            var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
            var _barycenterSort = __mako_require__("src/pages/KnowledgeGraph/layouts/barycenterSort.ts");
            var _constrainedForce = __mako_require__("src/pages/KnowledgeGraph/layouts/constrainedForce.ts");
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
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
    runtime._h = '45561791928500701';
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

//# sourceMappingURL=p__GeneralPage-async.14928454263692940727.hot-update.js.map