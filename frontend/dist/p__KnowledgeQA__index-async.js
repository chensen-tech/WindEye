((typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] = (typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] || []).push([
        ['p__KnowledgeQA__index'],
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
var _g6pc = /*#__PURE__*/ _interop_require_default._(_export_star._(__mako_require__("node_modules/@antv/g6-pc/es/index.js"), exports));
_g6pc.default.version = '4.8.23';
var _default = _g6pc.default;
var version = '4.8.23';

},
"src/pages/KnowledgeQA/api/agent.ts": function (module, exports, __mako_require__){
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
    healthCheck: function() {
        return healthCheck;
    },
    sendChat: function() {
        return sendChat;
    },
    sendChatStream: function() {
        return sendChatStream;
    },
    sendRiskStream: function() {
        return sendRiskStream;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _axios = _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const client = _axios.default.create({
    baseURL: '/api/v1',
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json'
    }
});
const sendChat = async (req)=>{
    const resp = await client.post('/chat/recommend', req);
    return resp.data;
};
const sendChatStream = (req, callbacks)=>{
    const params = new URLSearchParams({
        query: req.query,
        history: JSON.stringify(req.history),
        sessionId: req.sessionId,
        roundId: String(req.roundId)
    });
    let retryCount = 0;
    const maxRetries = 3;
    let es = null;
    let doneFired = false;
    let aborted = false;
    const connect = ()=>{
        if (aborted) return;
        es = new EventSource(`/api/v1/chat/recommend-stream?${params.toString()}`);
        es.addEventListener('stage', (e)=>{
            try {
                const data = JSON.parse(e.data);
                if (data.content && callbacks.onStage) callbacks.onStage(data.content);
            } catch (err) {
                console.error('[SSE] stage parse error:', err);
            }
        });
        es.addEventListener('cards', (e)=>{
            try {
                callbacks.onCards(JSON.parse(e.data));
            } catch (err) {
                console.error('[SSE] cards parse error:', err);
                callbacks.onError('Failed to parse cards event');
            }
        });
        es.addEventListener('graph', (e)=>{
            try {
                callbacks.onGraph(JSON.parse(e.data));
            } catch (err) {
                console.error('[SSE] graph parse error:', err);
                callbacks.onError('Failed to parse graph event');
            }
        });
        es.addEventListener('review', (e)=>{
            try {
                callbacks.onReview(JSON.parse(e.data));
            } catch (err) {
                console.error('[SSE] review parse error:', err);
                callbacks.onError('Failed to parse review event');
            }
        });
        es.addEventListener('done', ()=>{
            doneFired = true;
            callbacks.onDone();
            es === null || es === void 0 || es.close();
        });
        es.addEventListener('error', (e)=>{
            try {
                const data = JSON.parse(e.data);
                callbacks.onError(data.error || 'Server analysis error');
            } catch  {
                callbacks.onError('Server analysis error');
            }
        });
        es.onerror = ()=>{
            if (doneFired || aborted) {
                es === null || es === void 0 || es.close();
                return;
            }
            retryCount++;
            es === null || es === void 0 || es.close();
            if (retryCount < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
                console.warn(`[SSE] Connection lost, retrying in ${delay}ms (${retryCount}/${maxRetries})...`);
                setTimeout(connect, delay);
            } else {
                console.error(`[SSE] Max retries (${maxRetries}) reached`);
                callbacks.onError('连接失败，请重试');
            }
        };
    };
    connect();
    return ()=>{
        aborted = true;
        es === null || es === void 0 || es.close();
    };
};
const sendRiskStream = (req, callbacks)=>{
    const params = new URLSearchParams({
        query: req.query,
        sessionId: req.sessionId,
        roundId: String(req.roundId)
    });
    if (req.communityId !== undefined) params.set('communityId', String(req.communityId));
    if (req.maxHop !== undefined) params.set('maxHop', String(req.maxHop));
    let retryCount = 0;
    const maxRetries = 3;
    let aborted = false;
    let doneFired = false;
    let abortController = null;
    const connect = async ()=>{
        if (aborted) return;
        abortController = new AbortController();
        try {
            var _resp_body;
            const resp = await fetch(`/api/v1/chat/risk-stream?${params.toString()}`, {
                signal: abortController.signal
            });
            if (!resp.ok) throw new Error(`Risk stream failed: ${resp.status}`);
            const reader = (_resp_body = resp.body) === null || _resp_body === void 0 ? void 0 : _resp_body.getReader();
            if (!reader) throw new Error('No reader available');
            const decoder = new TextDecoder();
            let buffer = '';
            let pendingEvent = null;
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines){
                    const trimmed = line.trim();
                    if (!trimmed) continue;
                    if (trimmed.startsWith('event:')) pendingEvent = trimmed.slice(6).trim();
                    else if (trimmed.startsWith('data:')) {
                        const raw = trimmed.slice(5).trim();
                        const ev = pendingEvent;
                        pendingEvent = null;
                        if (!ev || !raw) continue;
                        try {
                            if (ev === 'stage') {
                                var _callbacks_onStage;
                                const { stage, content } = JSON.parse(raw);
                                (_callbacks_onStage = callbacks.onStage) === null || _callbacks_onStage === void 0 || _callbacks_onStage.call(callbacks, stage, content);
                            } else if (ev === 'community') {
                                var _callbacks_onCommunity;
                                (_callbacks_onCommunity = callbacks.onCommunity) === null || _callbacks_onCommunity === void 0 || _callbacks_onCommunity.call(callbacks, JSON.parse(raw));
                            } else if (ev === 'subgraph') {
                                var _callbacks_onSubgraph;
                                (_callbacks_onSubgraph = callbacks.onSubgraph) === null || _callbacks_onSubgraph === void 0 || _callbacks_onSubgraph.call(callbacks, JSON.parse(raw));
                            } else if (ev === 'report') {
                                var _callbacks_onReport;
                                doneFired = true;
                                (_callbacks_onReport = callbacks.onReport) === null || _callbacks_onReport === void 0 || _callbacks_onReport.call(callbacks, JSON.parse(raw));
                            } else if (ev === 'done') {
                                var _callbacks_onDone;
                                if (!doneFired) (_callbacks_onDone = callbacks.onDone) === null || _callbacks_onDone === void 0 || _callbacks_onDone.call(callbacks);
                            } else if (ev === 'error') {
                                var _callbacks_onError;
                                const { error } = JSON.parse(raw);
                                (_callbacks_onError = callbacks.onError) === null || _callbacks_onError === void 0 || _callbacks_onError.call(callbacks, error || 'Risk analysis error');
                            }
                        } catch (parseErr) {
                            console.error('[RiskSSE] parse error:', parseErr, raw);
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            retryCount++;
            if (retryCount < maxRetries && !aborted) {
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
                console.warn(`[RiskSSE] Retrying in ${delay}ms (${retryCount}/${maxRetries})...`);
                await new Promise((r)=>setTimeout(r, delay));
                connect();
            } else {
                var _callbacks_onError1;
                (_callbacks_onError1 = callbacks.onError) === null || _callbacks_onError1 === void 0 || _callbacks_onError1.call(callbacks, err.message || 'Risk analysis connection failed');
            }
        }
    };
    connect();
    return ()=>{
        aborted = true;
        abortController === null || abortController === void 0 || abortController.abort();
    };
};
const healthCheck = async ()=>{
    try {
        const resp = await _axios.default.get('/health', {
            timeout: 5000
        });
        return resp.status === 200;
    } catch  {
        return false;
    }
};
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
"src/pages/KnowledgeQA/components/AnalysisPanel.tsx": function (module, exports, __mako_require__){
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
    AnalysisPanel: function() {
        return AnalysisPanel;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _echarts = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/echarts/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const AnalysisPanel = ({ onClose })=>{
    _s();
    const { analysisResult, analysisQuery, isLoading, error } = (0, _agentStore.useAgentStore)();
    const chartRef = (0, _react.useRef)(null);
    const chartInstance = (0, _react.useRef)(null);
    const resizeObserver = (0, _react.useRef)(null);
    const handleExportImage = ()=>{
        if (!chartInstance.current) {
            _antd.message.warning('Chart not ready');
            return;
        }
        try {
            const dataURL = chartInstance.current.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            const link = document.createElement('a');
            link.download = `chart_${Date.now()}.png`;
            link.href = dataURL;
            link.click();
            _antd.message.success('Chart exported');
        } catch (err) {
            console.error('Export image failed:', err);
            _antd.message.error('Export failed');
        }
    };
    const handleExportCSV = ()=>{
        if (!(analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.raw_data) || analysisResult.raw_data.length === 0) {
            _antd.message.warning('No data to export');
            return;
        }
        try {
            const data = analysisResult.raw_data;
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map((row)=>headers.map((header)=>{
                        const val = row[header];
                        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
                        return `"${escaped}"`;
                    }).join(','))
            ];
            const csvString = '﻿' + csvRows.join('\n');
            const blob = new Blob([
                csvString
            ], {
                type: 'text/csv;charset=utf-8;'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `data_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            _antd.message.success('CSV exported');
        } catch (err) {
            console.error('Export CSV failed:', err);
            _antd.message.error('Export failed');
        }
    };
    const columns = (0, _react.useMemo)(()=>{
        if (!(analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.raw_data) || analysisResult.raw_data.length === 0) return [];
        return Object.keys(analysisResult.raw_data[0]).map((key)=>({
                title: key,
                dataIndex: key,
                key,
                sorter: (a, b)=>{
                    const valA = a[key];
                    const valB = b[key];
                    if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
                    return String(valA).localeCompare(String(valB));
                },
                ellipsis: true
            }));
    }, [
        analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.raw_data
    ]);
    (0, _react.useEffect)(()=>{
        if (!chartRef.current) return;
        chartInstance.current = _echarts.init(chartRef.current);
        resizeObserver.current = new ResizeObserver(()=>{
            var _chartInstance_current;
            (_chartInstance_current = chartInstance.current) === null || _chartInstance_current === void 0 || _chartInstance_current.resize();
        });
        resizeObserver.current.observe(chartRef.current);
        return ()=>{
            var _resizeObserver_current, _chartInstance_current;
            (_resizeObserver_current = resizeObserver.current) === null || _resizeObserver_current === void 0 || _resizeObserver_current.disconnect();
            (_chartInstance_current = chartInstance.current) === null || _chartInstance_current === void 0 || _chartInstance_current.dispose();
            chartInstance.current = null;
        };
    }, []);
    (0, _react.useEffect)(()=>{
        if (!(analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.echarts_config) || !chartInstance.current) {
            var _chartInstance_current;
            (_chartInstance_current = chartInstance.current) === null || _chartInstance_current === void 0 || _chartInstance_current.clear();
            return;
        }
        chartInstance.current.setOption(analysisResult.echarts_config, true);
    }, [
        analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.echarts_config
    ]);
    if (!analysisResult && !isLoading && !error) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff'
        },
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
            image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
            description: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                style: {
                    color: '#94a3b8',
                    fontSize: 14
                },
                children: "Start a data analysis query on the left"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                lineNumber: 136,
                columnNumber: 13
            }, void 0)
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
            lineNumber: 133,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
        lineNumber: 124,
        columnNumber: 7
    }, this);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: styles.header,
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.headerLeft,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                width: "16",
                                height: "16",
                                viewBox: "0 0 16 16",
                                fill: "none",
                                style: {
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("rect", {
                                        x: "1",
                                        y: "3",
                                        width: "14",
                                        height: "10",
                                        rx: "2",
                                        stroke: "#6c8ef5",
                                        strokeWidth: "1.4"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                                        d: "M4 7h8M4 10h5",
                                        stroke: "#6c8ef5",
                                        strokeWidth: "1.2",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 151,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 149,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.headerTitle,
                                children: "Analysis Results"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this),
                            analysisQuery && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.queryBadge,
                                children: analysisQuery
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 154,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        },
                        children: [
                            analysisResult && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                title: "Export chart as image",
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    type: "text",
                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileImageOutlined, {
                                        style: {
                                            color: '#64748b'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 161,
                                        columnNumber: 23
                                    }, void 0),
                                    onClick: handleExportImage,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                                style: styles.closeBtn,
                                onClick: onClose,
                                "aria-label": "Close",
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                    width: "12",
                                    height: "12",
                                    viewBox: "0 0 12 12",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                                        d: "M1 1l10 10M11 1L1 11",
                                        stroke: "currentColor",
                                        strokeWidth: "1.6",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 167,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: styles.content,
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chartSection,
                        children: [
                            isLoading && !analysisResult && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: styles.loadingOverlay,
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                    tip: "Analyzing data...",
                                    size: "large"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this),
                            error && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: styles.errorBanner,
                                children: error
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 187,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                ref: chartRef,
                                style: styles.chartCanvas
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.dataSection,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: styles.sectionLabel,
                                        children: [
                                            "Data Preview",
                                            ' ',
                                            analysisResult && `(${analysisResult.row_count || analysisResult.raw_data.length} rows)`
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, this),
                                    analysisResult && analysisResult.raw_data.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "primary",
                                        ghost: true,
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownloadOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                            lineNumber: 210,
                                            columnNumber: 23
                                        }, void 0),
                                        onClick: handleExportCSV,
                                        style: {
                                            fontSize: 12,
                                            borderRadius: 4,
                                            height: 24
                                        },
                                        children: "Export CSV"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                        lineNumber: 206,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            analysisResult && analysisResult.raw_data.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: styles.tableWrapper,
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                    dataSource: analysisResult.raw_data,
                                    columns: columns,
                                    rowKey: (_record, index)=>(index === null || index === void 0 ? void 0 : index.toString()) || '',
                                    pagination: {
                                        pageSize: 10,
                                        size: 'small',
                                        showSizeChanger: false,
                                        style: {
                                            marginBottom: 0
                                        }
                                    },
                                    size: "middle",
                                    scroll: {
                                        y: 'calc(100% - 40px)'
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                    lineNumber: 220,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 219,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: styles.noDataPlaceholder,
                                children: isLoading ? 'Fetching data...' : 'No raw data available'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                                lineNumber: 235,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/AnalysisPanel.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
};
_s(AnalysisPanel, "JNFGf4PXVLL33lX9kgdYY2Ow8Og=", false, function() {
    return [
        _agentStore.useAgentStore
    ];
});
_c = AnalysisPanel;
const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f5',
        background: '#fafafa',
        flexShrink: 0
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflow: 'hidden'
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#1e293b',
        whiteSpace: 'nowrap'
    },
    queryBadge: {
        fontSize: 11,
        color: '#6c8ef5',
        background: 'rgba(108,142,245,0.1)',
        padding: '2px 8px',
        borderRadius: 10,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 200
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: 4,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    chartSection: {
        position: 'relative',
        height: '60%',
        minHeight: 350,
        borderBottom: '1px solid #f0f0f5'
    },
    chartCanvas: {
        width: '100%',
        height: '100%'
    },
    loadingOverlay: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        zIndex: 10
    },
    errorBanner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '8px 16px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: 12,
        zIndex: 11,
        borderBottom: '1px solid #fee2e2'
    },
    dataSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'hidden'
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
    },
    tableWrapper: {
        flex: 1,
        overflow: 'auto',
        borderRadius: 8,
        border: '1px solid #e2e8f0'
    },
    noDataPlaceholder: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 13,
        background: '#f8fafc',
        borderRadius: 8,
        border: '1px dashed #e2e8f0'
    }
};
var _default = AnalysisPanel;
var _c;
$RefreshReg$(_c, "AnalysisPanel");
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
"src/pages/KnowledgeQA/components/ChatSidebar.tsx": function (module, exports, __mako_require__){
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
    ChatSidebar: function() {
        return ChatSidebar;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _chatStore = __mako_require__("src/pages/KnowledgeQA/store/chatStore.ts");
var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
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
const ChatSidebar = ({ collapsed, onToggle })=>{
    _s();
    const { sessions, activeSessionId, createNewSession, switchSession, deleteSession, renameSession } = (0, _chatStore.useChatStore)();
    const clearHistory = (0, _agentStore.useAgentStore)((state)=>state.clearHistory);
    const [editingId, setEditingId] = (0, _react.useState)(null);
    const [editTitle, setEditTitle] = (0, _react.useState)('');
    const handleNewChat = ()=>{
        createNewSession();
        clearHistory();
    };
    const handleStartRename = (e, id, currentTitle)=>{
        e.stopPropagation();
        setEditingId(id);
        setEditTitle(currentTitle || 'New Session');
    };
    const handleConfirmRename = ()=>{
        if (editingId && editTitle.trim()) renameSession(editingId, editTitle.trim());
        setEditingId(null);
    };
    const handleCancelRename = ()=>{
        setEditingId(null);
    };
    const sortedSessions = [
        ...sessions
    ].sort((a, b)=>b.updatedAt - a.updatedAt);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            width: collapsed ? 64 : 260,
            height: '100%',
            background: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            padding: collapsed ? '16px 8px' : '16px 12px',
            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
            overflow: 'hidden',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    justifyContent: collapsed ? 'center' : 'flex-end',
                    marginBottom: 12
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                    type: "text",
                    icon: collapsed ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MenuUnfoldOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                        lineNumber: 77,
                        columnNumber: 29
                    }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MenuFoldOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                        lineNumber: 77,
                        columnNumber: 54
                    }, void 0),
                    onClick: onToggle,
                    style: {
                        color: '#64748b'
                    }
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    marginBottom: 20
                },
                children: collapsed ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                    title: "New Session",
                    placement: "right",
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                        type: "primary",
                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PlusOutlined, {}, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                            lineNumber: 88,
                            columnNumber: 21
                        }, void 0),
                        onClick: handleNewChat,
                        style: {
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)'
                        }
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                        lineNumber: 86,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                    lineNumber: 85,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                    type: "primary",
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PlusOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                        lineNumber: 105,
                        columnNumber: 19
                    }, void 0),
                    size: "large",
                    onClick: handleNewChat,
                    style: {
                        width: '100%',
                        height: 48,
                        borderRadius: 12,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                        boxShadow: '0 4px 12px rgba(40, 85, 209, 0.2)'
                    },
                    children: "New Session"
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                    lineNumber: 103,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    margin: '0 -4px',
                    padding: '0 4px'
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                    dataSource: sortedSessions,
                    renderItem: (session)=>{
                        const isActive = session.id === activeSessionId;
                        const isEditing = session.id === editingId;
                        return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            onClick: ()=>!isEditing && switchSession(session.id),
                            style: {
                                padding: collapsed ? '12px 0' : '10px 12px',
                                borderRadius: 10,
                                marginBottom: 4,
                                cursor: isEditing ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(40, 85, 209, 0.08)' : 'transparent',
                                border: isActive ? '1px solid rgba(40, 85, 209, 0.2)' : '1px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: collapsed ? 0 : 12,
                                position: 'relative'
                            },
                            className: "session-item",
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                    title: collapsed ? session.title || 'New Session' : '',
                                    placement: "right",
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.MessageOutlined, {
                                        style: {
                                            color: isActive ? '#2855D1' : '#94a3b8',
                                            fontSize: 18
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                        lineNumber: 149,
                                        columnNumber: 19
                                    }, void 0)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                    lineNumber: 148,
                                    columnNumber: 17
                                }, void 0),
                                !collapsed && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                flex: 1,
                                                overflow: 'hidden'
                                            },
                                            children: isEditing ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Input, {
                                                autoFocus: true,
                                                size: "small",
                                                value: editTitle,
                                                onChange: (e)=>setEditTitle(e.target.value),
                                                onPressEnter: handleConfirmRename,
                                                onBlur: handleConfirmRename,
                                                onKeyDown: (e)=>e.key === 'Escape' && handleCancelRename(),
                                                onClick: (e)=>e.stopPropagation(),
                                                style: {
                                                    fontSize: 13,
                                                    padding: '1px 4px',
                                                    borderRadius: 4
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                lineNumber: 161,
                                                columnNumber: 25
                                            }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: isActive,
                                                        style: {
                                                            display: 'block',
                                                            fontSize: 14,
                                                            color: isActive ? '#1e293b' : '#475569',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: session.title || 'New Session'
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 27
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 11,
                                                            color: isActive ? '#64748b' : '#94a3b8'
                                                        },
                                                        children: new Date(session.updatedAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                        lineNumber: 187,
                                                        columnNumber: 27
                                                    }, void 0)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                            lineNumber: 159,
                                            columnNumber: 21
                                        }, void 0),
                                        !isEditing && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            className: "action-icons",
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                    title: "Rename",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EditOutlined, {
                                                        onClick: (e)=>handleStartRename(e, session.id, session.title),
                                                        style: {
                                                            color: '#64748b',
                                                            fontSize: 14,
                                                            padding: 4
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 27
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 25
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Popconfirm, {
                                                    title: "Confirm delete?",
                                                    onConfirm: (e)=>{
                                                        e === null || e === void 0 || e.stopPropagation();
                                                        deleteSession(session.id);
                                                    },
                                                    onCancel: (e)=>e === null || e === void 0 ? void 0 : e.stopPropagation(),
                                                    okText: "Delete",
                                                    cancelText: "Cancel",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DeleteOutlined, {
                                                        onClick: (e)=>e.stopPropagation(),
                                                        style: {
                                                            color: '#ef4444',
                                                            fontSize: 14,
                                                            padding: 4
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 27
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 25
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                                            lineNumber: 204,
                                            columnNumber: 23
                                        }, void 0)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                            lineNumber: 130,
                            columnNumber: 15
                        }, void 0);
                    }
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                    lineNumber: 123,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        .session-item:hover { background: #f1f5f9; }
        .session-item:hover .action-icons { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
                lineNumber: 246,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/ChatSidebar.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
};
_s(ChatSidebar, "iqJnf6hAWD7wjdY7Rmq/1Jet4u8=", false, function() {
    return [
        _chatStore.useChatStore,
        _agentStore.useAgentStore
    ];
});
_c = ChatSidebar;
var _default = ChatSidebar;
var _c;
$RefreshReg$(_c, "ChatSidebar");
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
"src/pages/KnowledgeQA/components/ContextTagBar.tsx": function (module, exports, __mako_require__){
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
    ContextTagBar: function() {
        return ContextTagBar;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const TYPE_COLORS = {
    COMPANY: {
        bg: 'rgba(255, 193, 1, 0.08)',
        border: 'rgba(255, 193, 1, 0.25)',
        text: '#CC9900'
    },
    PERSON: {
        bg: 'rgba(24, 144, 255, 0.08)',
        border: 'rgba(24, 144, 255, 0.25)',
        text: '#1890FF'
    },
    EVENT: {
        bg: 'rgba(255, 107, 107, 0.08)',
        border: 'rgba(255, 107, 107, 0.25)',
        text: '#FF6B6B'
    },
    SUB_EVENT: {
        bg: 'rgba(255, 153, 153, 0.08)',
        border: 'rgba(255, 153, 153, 0.25)',
        text: '#FF9999'
    },
    TIME: {
        bg: 'rgba(255, 140, 0, 0.08)',
        border: 'rgba(255, 140, 0, 0.25)',
        text: '#FF8C00'
    },
    RiskFeature: {
        bg: 'rgba(76, 175, 80, 0.08)',
        border: 'rgba(76, 175, 80, 0.25)',
        text: '#4CAF50'
    },
    RiskFactor: {
        bg: 'rgba(156, 39, 176, 0.08)',
        border: 'rgba(156, 39, 176, 0.25)',
        text: '#9C27B0'
    },
    Action: {
        bg: 'rgba(69, 183, 209, 0.08)',
        border: 'rgba(69, 183, 209, 0.25)',
        text: '#45B7D1'
    },
    Regulation: {
        bg: 'rgba(255, 193, 1, 0.08)',
        border: 'rgba(255, 193, 1, 0.25)',
        text: '#CC9900'
    },
    Law: {
        bg: 'rgba(24, 144, 255, 0.08)',
        border: 'rgba(24, 144, 255, 0.25)',
        text: '#1890FF'
    },
    default: {
        bg: 'rgba(148, 163, 184, 0.1)',
        border: 'rgba(148, 163, 184, 0.3)',
        text: '#64748B'
    }
};
const ContextTagBar = ({ tags, onRemove, onClearAll, onTagClick })=>{
    if (tags.length === 0) return null;
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(247, 249, 252, 0.8)',
            borderRadius: 10,
            border: `1px dashed ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
            marginBottom: 8
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                style: {
                    fontSize: 11,
                    color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                    fontWeight: 500,
                    marginRight: 4
                },
                children: "上下文约束:"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            tags.map((tag, index)=>{
                const colors = TYPE_COLORS[tag.type] || TYPE_COLORS.default;
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                    style: {
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: onTagClick ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        animation: 'tagFlyIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        animationFillMode: 'backwards',
                        animationDelay: `${index * 0.05}s`
                    },
                    onClick: ()=>onTagClick === null || onTagClick === void 0 ? void 0 : onTagClick(tag),
                    onMouseEnter: (e)=>{
                        if (onTagClick) {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}`;
                        }
                    },
                    onMouseLeave: (e)=>{
                        if (onTagClick) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                            style: {
                                fontSize: 10,
                                opacity: 0.7,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            },
                            children: tag.type
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                            children: tag.label || tag.id
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                            lineNumber: 156,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseOutlined, {
                            style: {
                                fontSize: 10,
                                marginLeft: 2,
                                opacity: 0.6,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            },
                            onClick: (e)=>{
                                e.stopPropagation();
                                onRemove(tag.id);
                            },
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.color = '#EF4444';
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.opacity = '0.6';
                                e.currentTarget.style.color = 'inherit';
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this)
                    ]
                }, `${tag.id}-${index}`, true, {
                    fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                    lineNumber: 113,
                    columnNumber: 11
                }, this);
            }),
            tags.length > 1 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                onClick: onClearAll,
                style: {
                    fontSize: 11,
                    color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 4,
                    transition: 'all 0.15s ease'
                },
                onMouseEnter: (e)=>{
                    e.currentTarget.style.color = _constants.DESIGN_TOKENS.COLOR_ERROR;
                    e.currentTarget.style.background = _constants.DESIGN_TOKENS.ERROR_LIGHT;
                },
                onMouseLeave: (e)=>{
                    e.currentTarget.style.color = _constants.DESIGN_TOKENS.TEXT_MUTED;
                    e.currentTarget.style.background = 'none';
                },
                children: "清空"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                lineNumber: 183,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        @keyframes tagFlyIn {
          0% { opacity: 0; transform: translateX(40px) translateY(-10px) scale(0.5); }
          60% { opacity: 1; transform: translateX(-3px) translateY(0) scale(1.03); }
          100% { opacity: 1; transform: translateX(0) translateY(0) scale(1); }
        }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/ContextTagBar.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
};
_c = ContextTagBar;
var _default = ContextTagBar;
var _c;
$RefreshReg$(_c, "ContextTagBar");
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
"src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx": function (module, exports, __mako_require__){
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
    EnhancedGraphPanel: function() {
        return EnhancedGraphPanel;
    },
    default: function() {
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
var _axios = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
var _LegendPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/LegendPanel.tsx"));
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
const VALID_NODE_TYPES = new Set([
    'COMPANY',
    'PERSON',
    'EVENT',
    'SUB_EVENT',
    'TIME',
    'RiskFeature',
    'RiskFactor',
    'Action',
    'Regulation',
    'Law'
]);
const NODE_VISUAL = {
    COMPANY: {
        color: '#FFC101',
        size: 34,
        labelOffset: 10
    },
    PERSON: {
        color: '#1890FF',
        size: 26,
        labelOffset: 8
    },
    EVENT: {
        color: '#FF6B6B',
        size: 30,
        labelOffset: 10
    },
    SUB_EVENT: {
        color: '#FF9999',
        size: 20,
        labelOffset: 6
    },
    TIME: {
        color: '#FF8C00',
        size: 16,
        labelOffset: 5
    },
    RiskFeature: {
        color: '#4CAF50',
        size: 24,
        labelOffset: 8
    },
    RiskFactor: {
        color: '#9C27B0',
        size: 22,
        labelOffset: 7
    },
    Action: {
        color: '#45B7D1',
        size: 22,
        labelOffset: 7
    },
    Regulation: {
        color: '#FFC101',
        size: 20,
        labelOffset: 6
    },
    Law: {
        color: '#1890FF',
        size: 18,
        labelOffset: 6
    }
};
const normalizeNeo4jNode = (raw)=>{
    const props = raw.properties || {};
    const labels = raw.labels || [];
    return {
        id: String(raw.id),
        type: labels[0] || 'Unknown',
        score: props.score ?? 1,
        title: props.title || props.name || props.COMPANY_NM || raw.id,
        name: props.name || props.COMPANY_NM || props.title || raw.id,
        zh_name: props.zh_name || props.name,
        overview: props.overview || props.RISK_INFO || '',
        popularity: props.popularity,
        rating: props.rating,
        year: props.year
    };
};
const normalizeNeo4jEdge = (raw)=>({
        source: String(raw.source || raw.start),
        target: String(raw.target || raw.end),
        relation: raw.label || raw.relation || raw.type || 'RELATED'
    });
const EDGE_STYLE_MAP = {
    TRIGGERS: {
        stroke: '#f5222d',
        lineDash: [],
        lineWidth: 2,
        opacity: 0.8
    },
    REFLECTS: {
        stroke: '#fa8c16',
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    COMPLIES_WITH: {
        stroke: '#722ed1',
        lineDash: [
            4,
            4
        ],
        lineWidth: 1.5,
        opacity: 0.7
    },
    MENTION: {
        stroke: '#45B7D1',
        lineDash: [
            2,
            3
        ],
        lineWidth: 1,
        opacity: 0.5
    },
    CAUSE: {
        stroke: '#fa541c',
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    BELONG: {
        stroke: '#52c41a',
        lineDash: [
            2,
            3
        ],
        lineWidth: 1,
        opacity: 0.5
    }
};
const EDGE_DEFAULT_STYLE = {
    stroke: '#cbd5e1',
    lineDash: [],
    lineWidth: 0.8,
    opacity: 0.4
};
const buildG6Data = (subgraph)=>{
    if (!subgraph) return {
        nodes: [],
        edges: []
    };
    const validNodeIds = new Set();
    const nodes = subgraph.nodes.filter((n)=>VALID_NODE_TYPES.has(n.type)).map((node)=>{
        const nodeIdStr = String(node.id);
        validNodeIds.add(nodeIdStr);
        const visual = NODE_VISUAL[node.type] ?? {
            color: '#a1a1aa',
            size: 14,
            labelOffset: 5
        };
        let label = String(node.title || node.zh_name || node.name || node.id);
        if (label.length > 15) label = label.slice(0, 12) + '...';
        return {
            id: nodeIdStr,
            label,
            _type: node.type,
            type: 'circle',
            size: visual.size,
            style: {
                fill: visual.color,
                stroke: node.type === 'COMPANY' ? visual.color : 'transparent',
                lineWidth: node.type === 'COMPANY' ? 2 : 0,
                cursor: 'pointer'
            },
            labelCfg: {
                position: 'bottom',
                offset: visual.labelOffset,
                style: {
                    fill: '#1e293b',
                    fontSize: node.type === 'COMPANY' ? 12 : 10,
                    fontWeight: node.type === 'COMPANY' ? 600 : 500,
                    background: {
                        fill: 'rgba(255, 255, 255, 0.85)',
                        padding: [
                            2,
                            4,
                            2,
                            4
                        ],
                        radius: 4
                    }
                }
            }
        };
    });
    const edges = subgraph.edges.filter((e)=>validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target))).map((edge, idx)=>{
        const relStyle = EDGE_STYLE_MAP[edge.relation] ?? EDGE_DEFAULT_STYLE;
        return {
            id: `edge-${idx}`,
            source: String(edge.source),
            target: String(edge.target),
            relation: edge.relation,
            type: 'quadratic',
            style: {
                ...relStyle,
                endArrow: true,
                curvature: 0.15
            }
        };
    });
    return {
        nodes,
        edges
    };
};
const EnhancedGraphPanel = /*#__PURE__*/ _s((0, _react.forwardRef)(_c = _s(({ subgraph, alignmentFeatures, onNodeDoubleClick, highlightedEntity }, ref)=>{
    _s();
    const containerRef = (0, _react.useRef)(null);
    const graphRef = (0, _react.useRef)(null);
    const subgraphRef = (0, _react.useRef)(subgraph);
    subgraphRef.current = subgraph;
    const [loading, setLoading] = (0, _react.useState)(false);
    const [selectedNode, setSelectedNode] = (0, _react.useState)(null);
    const [liveStats, setLiveStats] = (0, _react.useState)(null);
    const [visibleCategories, setVisibleCategories] = (0, _react.useState)(new Set(VALID_NODE_TYPES));
    const syncGraphStats = (0, _react.useCallback)(()=>{
        const g = graphRef.current;
        if (!g) return;
        const gNodes = g.getNodes();
        const gEdges = g.getEdges();
        const nodeCounts = {};
        const edgeCounts = {};
        for (const n of gNodes){
            const model = n.getModel();
            const t = (model === null || model === void 0 ? void 0 : model._type) ?? '';
            if (VALID_NODE_TYPES.has(t)) nodeCounts[t] = (nodeCounts[t] ?? 0) + 1;
        }
        for (const e of gEdges){
            const model = e.getModel();
            const rel = (model === null || model === void 0 ? void 0 : model.relation) ?? 'UNKNOWN';
            edgeCounts[rel] = (edgeCounts[rel] ?? 0) + 1;
        }
        setLiveStats({
            totalNodes: gNodes.length,
            totalEdges: gEdges.length,
            nodeCounts,
            edgeCounts
        });
    }, []);
    const applyHighlight = (0, _react.useCallback)((cat)=>{
        const g = graphRef.current;
        if (!g) return;
        g.getNodes().forEach((n)=>g.setItemState(n, 'dimmed', cat ? n.getModel()._type !== cat : false));
        g.getEdges().forEach((e)=>g.setItemState(e, 'dimmed', cat ? e.getModel().relation !== cat : false));
    }, []);
    const toggleCategory = (0, _react.useCallback)((cat)=>{
        const g = graphRef.current;
        if (!g) return;
        setVisibleCategories((prev)=>{
            const next = new Set(prev);
            const hide = next.has(cat);
            hide ? next.delete(cat) : next.add(cat);
            g.getNodes().forEach((n)=>{
                if (n.getModel()._type === cat) hide ? g.hideItem(n) : g.showItem(n);
            });
            g.getEdges().forEach((e)=>{
                if (e.getModel().relation === cat) hide ? g.hideItem(e) : g.showItem(e);
            });
            return next;
        });
    }, []);
    const searchAndExpand = (0, _react.useCallback)(async (nodeId, nodeType)=>{
        const graph = graphRef.current;
        if (!graph) {
            console.warn('Graph instance not ready for expansion');
            return;
        }
        _antd.message.loading({
            content: 'Exploring connections...',
            key: 'expand'
        });
        try {
            const url = `/api/v1/graph/expand?id=${encodeURIComponent(nodeId)}&type=${encodeURIComponent(nodeType)}`;
            const res = await _axios.default.get(url);
            const data = res.data;
            if (!data || !Array.isArray(data.nodes)) throw new Error('Invalid response format from server');
            const { nodes: rawNodes, edges: rawEdges } = data;
            const nN = (rawNodes || []).map(normalizeNeo4jNode);
            const nE = (rawEdges || []).map(normalizeNeo4jEdge);
            const addedNodeIds = new Set();
            nN.forEach((n)=>{
                const idStr = String(n.id);
                if (!graph.findById(idStr)) {
                    const v = NODE_VISUAL[n.type] || {
                        color: '#94a3b8',
                        size: 14,
                        labelOffset: 5
                    };
                    let label = String(n.title || n.zh_name || n.name || n.id);
                    if (label.length > 15) label = label.slice(0, 12) + '...';
                    try {
                        graph.addItem('node', {
                            id: idStr,
                            label,
                            type: 'circle',
                            _type: n.type,
                            size: v.size,
                            style: {
                                fill: v.color,
                                stroke: n.type === 'COMPANY' ? v.color : 'transparent',
                                lineWidth: n.type === 'COMPANY' ? 2 : 0,
                                cursor: 'pointer'
                            },
                            labelCfg: {
                                position: 'bottom',
                                offset: v.labelOffset,
                                style: {
                                    fill: '#1e293b',
                                    fontSize: n.type === 'COMPANY' ? 12 : 10,
                                    fontWeight: n.type === 'COMPANY' ? 600 : 500,
                                    background: {
                                        fill: 'rgba(255,255,255,0.85)',
                                        padding: [
                                            2,
                                            4,
                                            2,
                                            4
                                        ],
                                        radius: 4
                                    }
                                }
                            }
                        });
                        addedNodeIds.add(idStr);
                    } catch (e) {
                    // Node may already exist, skip silently
                    }
                } else addedNodeIds.add(idStr);
            });
            const seenEdges = new Set();
            nE.forEach((e, idx)=>{
                const src = String(e.source);
                const tgt = String(e.target);
                const edgeKey = `${src}→${tgt}→${e.relation}`;
                if (seenEdges.has(edgeKey)) return;
                seenEdges.add(edgeKey);
                if (!graph.findById(src) || !graph.findById(tgt)) return;
                const relStyle = EDGE_STYLE_MAP[e.relation] ?? EDGE_DEFAULT_STYLE;
                const edgeId = `edge-exp-${nodeId}-${idx}-${Date.now()}`;
                try {
                    graph.addItem('edge', {
                        id: edgeId,
                        source: src,
                        target: tgt,
                        relation: e.relation,
                        type: 'quadratic',
                        style: {
                            ...relStyle,
                            endArrow: true,
                            curvature: 0.15
                        }
                    });
                } catch (err) {
                // Edge may already exist, skip silently
                }
            });
            graph.layout();
            syncGraphStats();
            graph.focusItem(String(nodeId), true);
            _antd.message.success({
                content: 'Exploration complete',
                key: 'expand'
            });
        } catch (err) {
            console.error('Expand failed:', err);
            _antd.message.error({
                content: 'Exploration failed',
                key: 'expand'
            });
        }
    }, [
        syncGraphStats
    ]);
    (0, _react.useImperativeHandle)(ref, ()=>({
            refresh: (sg)=>{
                if (!graphRef.current) return;
                graphRef.current.changeData(buildG6Data(sg));
                graphRef.current.fitView(30);
                syncGraphStats();
            },
            fitView: ()=>{
                var _graphRef_current;
                return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView(30);
            },
            resetHighlight: ()=>{
                if (!graphRef.current) return;
                graphRef.current.getNodes().forEach((n)=>{
                    var _graphRef_current;
                    return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.clearItemStates(n);
                });
                graphRef.current.getEdges().forEach((e)=>{
                    var _graphRef_current;
                    return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.clearItemStates(e);
                });
            },
            focusNode: (nodeId)=>{
                var _subgraphRef_current;
                if (!graphRef.current) return;
                graphRef.current.focusItem(nodeId, true);
                const raw = (_subgraphRef_current = subgraphRef.current) === null || _subgraphRef_current === void 0 ? void 0 : _subgraphRef_current.nodes.find((n)=>String(n.id) === nodeId);
                if (raw) setSelectedNode(raw);
            },
            searchAndExpand,
            clear: ()=>{
                if (!graphRef.current) return;
                graphRef.current.changeData({
                    nodes: [],
                    edges: []
                });
                setLiveStats(null);
                setSelectedNode(null);
            }
        }));
    (0, _react.useEffect)(()=>{
        let mounted = true;
        let graph = null;
        const init = ()=>{
            if (!containerRef.current) return;
            setLoading(true);
            try {
                graph = new _g6.default.Graph({
                    container: containerRef.current,
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                    layout: {
                        type: 'force',
                        preventOverlap: true,
                        nodeSize: 40,
                        nodeSpacing: 40,
                        linkDistance: 150,
                        nodeStrength: -200
                    },
                    defaultNode: {
                        type: 'circle',
                        size: 20
                    },
                    defaultEdge: {
                        type: 'quadratic',
                        style: {
                            endArrow: true
                        }
                    },
                    modes: {
                        default: [
                            'drag-canvas',
                            'zoom-canvas',
                            'drag-node'
                        ]
                    }
                });
                graphRef.current = graph;
                graph.render();
                syncGraphStats();
                const resizeObserver = new ResizeObserver(()=>{
                    if (containerRef.current && graphRef.current) {
                        graphRef.current.changeSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                        graphRef.current.fitView(30);
                    }
                });
                resizeObserver.observe(containerRef.current);
                graph.on('node:click', (e)=>{
                    var _subgraphRef_current;
                    const raw = (_subgraphRef_current = subgraphRef.current) === null || _subgraphRef_current === void 0 ? void 0 : _subgraphRef_current.nodes.find((n)=>{
                        var _e_item;
                        return String(n.id) === ((_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getID());
                    });
                    if (raw) setSelectedNode(raw);
                });
                graph.on('node:dblclick', (e)=>{
                    var _e_item, _e_item1, _e_item2;
                    const nodeId = (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getID();
                    const nodeType = ((_e_item1 = e.item) === null || _e_item1 === void 0 ? void 0 : _e_item1.getModel()._type) || 'COMPANY';
                    const nodeName = ((_e_item2 = e.item) === null || _e_item2 === void 0 ? void 0 : _e_item2.getModel().label) || nodeId;
                    onNodeDoubleClick === null || onNodeDoubleClick === void 0 || onNodeDoubleClick(nodeId, nodeName, nodeType);
                });
                setLoading(false);
                return ()=>resizeObserver.disconnect();
            } finally{
                if (mounted) setLoading(false);
            }
        };
        init();
        return ()=>{
            mounted = false;
            graph === null || graph === void 0 || graph.destroy();
        };
    }, [
        syncGraphStats,
        searchAndExpand
    ]);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: styles.root,
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_LegendPanel.default, {
                stats: liveStats,
                visibleCategories: visibleCategories,
                onToggle: toggleCategory,
                onHighlight: applyHighlight
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                lineNumber: 392,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: styles.graphArea,
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        ref: containerRef,
                        style: styles.graphCanvas
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                        lineNumber: 399,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.floatingToolbar,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                            title: "Fit view",
                            placement: "left",
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                type: "default",
                                shape: "circle",
                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExpandOutlined, {}, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                    lineNumber: 406,
                                    columnNumber: 23
                                }, void 0),
                                onClick: ()=>{
                                    var _graphRef_current;
                                    return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView(30);
                                },
                                style: styles.floatingBtn
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                lineNumber: 403,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                            lineNumber: 402,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                        lineNumber: 401,
                        columnNumber: 11
                    }, this),
                    selectedNode && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.infoCard,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                                onClick: ()=>setSelectedNode(null),
                                style: styles.closeBtn,
                                children: "×"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                lineNumber: 415,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    padding: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        strong: true,
                                        style: {
                                            fontSize: 16,
                                            display: 'block'
                                        },
                                        children: selectedNode.title || selectedNode.zh_name || selectedNode.name
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                        lineNumber: 419,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        type: "secondary",
                                        style: {
                                            fontSize: 12
                                        },
                                        children: selectedNode.type
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                        lineNumber: 422,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginTop: 10,
                                            fontSize: 13,
                                            maxHeight: 200,
                                            overflowY: 'auto'
                                        },
                                        children: selectedNode.overview
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                        lineNumber: 425,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                lineNumber: 418,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                        lineNumber: 414,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                lineNumber: 398,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
        lineNumber: 391,
        columnNumber: 7
    }, this);
}, "xBlEftcz55Ijqf+gdXd+bedYAGc=")), "xBlEftcz55Ijqf+gdXd+bedYAGc=");
_c1 = EnhancedGraphPanel;
const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f8fafc'
    },
    graphArea: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
    },
    graphCanvas: {
        width: '100%',
        height: '100%'
    },
    floatingToolbar: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
    },
    floatingBtn: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: 'none'
    },
    infoCard: {
        position: 'absolute',
        top: 16,
        right: 60,
        width: 260,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 10,
        border: '1px solid #e2e8f0'
    },
    closeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'none',
        border: 'none',
        fontSize: 18,
        cursor: 'pointer',
        color: '#94a3b8'
    }
};
var _default = EnhancedGraphPanel;
var _c;
var _c1;
$RefreshReg$(_c, "EnhancedGraphPanel$forwardRef");
$RefreshReg$(_c1, "EnhancedGraphPanel");
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
"src/pages/KnowledgeQA/components/EntityMessageBubble.tsx": function (module, exports, __mako_require__){
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
    EntityMessageBubble: function() {
        return EntityMessageBubble;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const { Text } = _antd.Typography;
const formatTime = (ts)=>{
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};
const extractEntities = (text, recommendations)=>{
    const entities = [];
    const addedIds = new Set();
    const addEntity = (id, type, start, end, textContent)=>{
        if (!addedIds.has(id) && textContent && textContent.length > 1 && textContent.length < 30) {
            entities.push({
                id,
                type,
                start,
                end,
                text: textContent
            });
            addedIds.add(id);
        }
    };
    recommendations === null || recommendations === void 0 || recommendations.forEach((rec)=>{
        const bookRegex = /《([^》]+)》/g;
        let match;
        while((match = bookRegex.exec(text)) !== null)addEntity(match[1], 'COMPANY', match.index, match.index + match[0].length, match[1]);
    });
    recommendations === null || recommendations === void 0 || recommendations.forEach((rec)=>{
        if (rec.title || rec.zhTitle || rec.name) {
            const entityName = rec.zhTitle || rec.title || rec.name;
            const idx = text.indexOf(entityName);
            if (idx !== -1) addEntity(entityName, 'COMPANY', idx, idx + entityName.length, entityName);
        }
        if (rec.itemId && rec.itemId.length > 2 && rec.itemId.length < 50) {
            const idx = text.indexOf(rec.itemId);
            if (idx !== -1) addEntity(rec.itemId, 'COMPANY', idx, idx + rec.itemId.length, rec.itemId);
        }
    });
    return entities;
};
const EntityMessageBubble = ({ message, onEntityHover, onEntityClick, highlightedEntity })=>{
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    if (isSystem) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 12
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: _constants.DESIGN_TOKENS.ERROR_LIGHT,
                    border: `1px solid ${_constants.DESIGN_TOKENS.ERROR_BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.InfoCircleOutlined, {
                    style: {
                        color: _constants.DESIGN_TOKENS.COLOR_ERROR,
                        fontSize: 14
                    }
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                    lineNumber: 97,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 85,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    background: _constants.DESIGN_TOKENS.ERROR_LIGHT,
                    border: `1px solid ${_constants.DESIGN_TOKENS.ERROR_BORDER}`,
                    borderRadius: 14,
                    padding: '10px 14px',
                    maxWidth: '80%'
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                    style: {
                        color: _constants.DESIGN_TOKENS.COLOR_ERROR,
                        fontSize: 13,
                        lineHeight: 1.6
                    },
                    children: message.content
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
        lineNumber: 84,
        columnNumber: 7
    }, this);
    const renderContent = ()=>{
        var _message_data_output, _message_data;
        const recommendations = ((_message_data = message.data) === null || _message_data === void 0 ? void 0 : (_message_data_output = _message_data.output) === null || _message_data_output === void 0 ? void 0 : _message_data_output.recommendations) || [];
        const entities = extractEntities(message.content, recommendations);
        if (entities.length === 0) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
            children: message.content
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
            lineNumber: 121,
            columnNumber: 14
        }, this);
        const sortedEntities = [
            ...entities
        ].sort((a, b)=>a.start - b.start);
        const parts = [];
        let lastIndex = 0;
        sortedEntities.forEach((entity, idx)=>{
            if (entity.start > lastIndex) parts.push(/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                children: message.content.slice(lastIndex, entity.start)
            }, `text-${idx}`, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 132,
                columnNumber: 11
            }, this));
            const isHighlighted = highlightedEntity === entity.id;
            parts.push(/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                "data-entity-id": entity.id,
                "data-entity-type": entity.type,
                onMouseEnter: ()=>onEntityHover === null || onEntityHover === void 0 ? void 0 : onEntityHover(entity.id),
                onMouseLeave: ()=>onEntityHover === null || onEntityHover === void 0 ? void 0 : onEntityHover(null),
                onClick: ()=>onEntityClick === null || onEntityClick === void 0 ? void 0 : onEntityClick({
                        id: entity.id,
                        type: entity.type,
                        text: entity.id
                    }),
                style: {
                    color: isHighlighted ? _constants.DESIGN_TOKENS.ACCENT : _constants.DESIGN_TOKENS.TEXT_PRIMARY,
                    background: isHighlighted ? 'rgba(40, 85, 209, 0.2)' : 'rgba(40, 85, 209, 0.06)',
                    borderBottom: `2px solid ${isHighlighted ? _constants.DESIGN_TOKENS.ACCENT : 'rgba(40, 85, 209, 0.3)'}`,
                    cursor: 'pointer',
                    borderRadius: 2,
                    padding: '0 1px',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                },
                onMouseEnter: (e)=>{
                    e.currentTarget.style.background = 'rgba(40, 85, 209, 0.15)';
                },
                onMouseLeave: (e)=>{
                    e.currentTarget.style.background = isHighlighted ? 'rgba(40, 85, 209, 0.2)' : 'rgba(40, 85, 209, 0.06)';
                },
                children: message.content.slice(entity.start, entity.end)
            }, `entity-${idx}`, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 138,
                columnNumber: 9
            }, this));
            lastIndex = entity.end;
        });
        if (lastIndex < message.content.length) parts.push(/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
            children: message.content.slice(lastIndex)
        }, "text-end", false, {
            fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
            lineNumber: 170,
            columnNumber: 18
        }, this));
        return parts;
    };
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 16,
            flexDirection: isUser ? 'row-reverse' : 'row'
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    flexShrink: 0,
                    background: isUser ? 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#ffffff',
                    boxShadow: isUser ? '0 4px 12px rgba(40, 85, 209, 0.35)' : '0 4px 12px rgba(16, 185, 129, 0.35)'
                },
                children: isUser ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.UserOutlined, {}, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                    lineNumber: 206,
                    columnNumber: 19
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RobotOutlined, {}, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                    lineNumber: 206,
                    columnNumber: 38
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 186,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    maxWidth: '75%',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                            padding: '12px 16px',
                            fontSize: 14,
                            lineHeight: 1.7,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            background: isUser ? 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)' : 'rgba(255, 255, 255, 0.95)',
                            color: isUser ? '#ffffff' : _constants.DESIGN_TOKENS.TEXT_PRIMARY,
                            border: isUser ? 'none' : `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                            boxShadow: isUser ? '0 4px 16px rgba(40, 85, 209, 0.3)' : '0 2px 8px rgba(15, 23, 42, 0.06)'
                        },
                        children: renderContent()
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                            fontSize: 11,
                            padding: '0 4px'
                        },
                        children: formatTime(message.timestamp)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
        lineNumber: 177,
        columnNumber: 5
    }, this);
};
_c = EntityMessageBubble;
var _default = EntityMessageBubble;
var _c;
$RefreshReg$(_c, "EntityMessageBubble");
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
"src/pages/KnowledgeQA/components/LegendPanel.tsx": function (module, exports, __mako_require__){
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
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const fmt = (n)=>n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const NODE_COLORS = {
    COMPANY: '#FFC101',
    PERSON: '#1890FF',
    EVENT: '#FF6B6B',
    SUB_EVENT: '#FF9999',
    TIME: '#FF8C00',
    RiskFeature: '#4CAF50',
    RiskFactor: '#9C27B0',
    Action: '#45B7D1',
    Regulation: '#FFC101',
    Law: '#1890FF'
};
const NODE_LABELS = {
    COMPANY: 'Company',
    PERSON: 'Person',
    EVENT: 'Event',
    SUB_EVENT: 'Sub Event',
    TIME: 'Time',
    RiskFeature: 'Risk Feature',
    RiskFactor: 'Risk Factor',
    Action: 'Action',
    Regulation: 'Regulation',
    Law: 'Law'
};
const REL_LABELS = {
    TRIGGERS: 'Triggers',
    REFLECTS: 'Reflects',
    COMPLIES_WITH: 'Complies With',
    MENTION: 'Mention',
    CAUSE: 'Cause',
    BELONG: 'Belong'
};
const LegendPanel = ({ stats, visibleCategories, onToggle, onHighlight })=>{
    const isEdgeHidden = (rel)=>!visibleCategories.has(rel);
    if (!stats) return null;
    const nodeCountTotal = stats.totalNodes || 0;
    const edgeCountTotal = stats.totalEdges || Object.values(stats.edgeCounts).reduce((a, b)=>a + b, 0);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: styles.root,
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: styles.row,
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.labelGroup,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.rowLabel,
                                children: "Nodes"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.rowTotal,
                                children: [
                                    "(",
                                    fmt(nodeCountTotal),
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.divider
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chips,
                        children: Object.keys(NODE_LABELS).map((type)=>{
                            const count = stats.nodeCounts[type] ?? 0;
                            if (count === 0) return null;
                            const color = NODE_COLORS[type];
                            const hidden = !visibleCategories.has(type);
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                onMouseEnter: ()=>onHighlight(type),
                                onMouseLeave: ()=>onHighlight(null),
                                onClick: ()=>onToggle(type),
                                style: {
                                    ...styles.nodeChip,
                                    background: hidden ? `${color}08` : `${color}12`,
                                    border: `1px solid ${hidden ? `${color}15` : `${color}30`}`,
                                    color: hidden ? `${color}60` : color
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            ...styles.chipDot,
                                            background: color,
                                            opacity: hidden ? 0.3 : 1
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: styles.chipText,
                                        children: [
                                            NODE_LABELS[type],
                                            " ",
                                            fmt(count)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 98,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, type, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 83,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            edgeCountTotal > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    ...styles.row,
                    marginTop: 6
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.labelGroup,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.rowLabel,
                                children: "Relations"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: styles.rowTotal,
                                children: [
                                    "(",
                                    fmt(edgeCountTotal),
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.divider
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chips,
                        children: Object.entries(stats.edgeCounts).map(([rel, count])=>{
                            if (count === 0 || rel === 'UNKNOWN') return null;
                            const label = REL_LABELS[rel] || rel;
                            const hidden = isEdgeHidden(rel);
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                onMouseEnter: ()=>onHighlight(rel),
                                onMouseLeave: ()=>onHighlight(null),
                                onClick: ()=>onToggle(rel),
                                style: {
                                    ...styles.edgeChip,
                                    borderColor: hidden ? '#e2e8f0' : '#cbd5e1',
                                    color: hidden ? '#94a3b8' : '#475569',
                                    background: hidden ? '#f8fafc' : '#ffffff'
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                    style: styles.chipText,
                                    children: [
                                        label,
                                        " ",
                                        fmt(count)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                    lineNumber: 132,
                                    columnNumber: 19
                                }, this)
                            }, rel, false, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 120,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        .legend-scroll::-webkit-scrollbar { display: none; }
        .legend-scroll { scrollbar-width: none; }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
};
_c = LegendPanel;
const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 16px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    labelGroup: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        minWidth: 64,
        flexShrink: 0
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1e293b'
    },
    rowTotal: {
        fontSize: 11,
        fontWeight: 500,
        color: '#94a3b8'
    },
    divider: {
        width: 1,
        height: 14,
        background: '#e2e8f0',
        margin: '0 12px',
        flexShrink: 0
    },
    chips: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        flexWrap: 'nowrap',
        flex: 1,
        paddingBottom: 2
    },
    nodeChip: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 6,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none'
    },
    edgeChip: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 6,
        border: '1px solid',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        userSelect: 'none'
    },
    chipDot: {
        width: 5,
        height: 5,
        borderRadius: '50%'
    },
    chipText: {
        fontSize: 12,
        fontWeight: 600
    }
};
var _default = LegendPanel;
var _c;
$RefreshReg$(_c, "LegendPanel");
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
"src/pages/KnowledgeQA/components/RiskEntityCard.tsx": function (module, exports, __mako_require__){
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
    RiskEntityCard: function() {
        return RiskEntityCard;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const { Text, Paragraph } = _antd.Typography;
const RiskIcon = ({ style })=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        style: {
            width: '1em',
            height: '1em',
            ...style
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                d: "M12 2L2 20h20L12 2zm0 3.5L18.5 18H5.5L12 5.5z"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                d: "M11 10h2v5h-2zm0 6h2v2h-2z"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 12,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, this);
_c = RiskIcon;
const SparkleIcon = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
        viewBox: "0 0 24 24",
        fill: "currentColor",
        style: {
            width: '1em',
            height: '1em'
        },
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
            d: "M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
            lineNumber: 18,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, this);
_c1 = SparkleIcon;
const RISK_LEVEL_MAP = {
    '-3': {
        color: '#f5222d',
        label: '极高风险'
    },
    '-2': {
        color: '#fa541c',
        label: '高风险'
    },
    '-1': {
        color: '#faad14',
        label: '一般风险'
    },
    '0': {
        color: '#1890ff',
        label: '提示'
    }
};
const ENTITY_TYPE_COLORS = {
    COMPANY: '#FFC101',
    PERSON: '#1890FF',
    EVENT: '#FF6B6B',
    RiskFeature: '#4CAF50',
    RiskFactor: '#9C27B0',
    Action: '#45B7D1',
    Regulation: '#FFC101'
};
const getRiskLevel = (rec)=>{
    const riskScore = rec.riskScore ?? rec.importance;
    if (riskScore && RISK_LEVEL_MAP[String(riskScore)]) return String(riskScore);
    if (riskScore !== undefined && Number(riskScore) < 0) return String(Math.max(Number(riskScore), -3));
    return null;
};
const RiskEntityCard = ({ recommendations, overallReasoning, onEntityClick })=>{
    const safeRecommendations = recommendations || [];
    if (safeRecommendations.length === 0) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        children: [
            overallReasoning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(245, 34, 45, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        },
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(RiskIcon, {
                            style: {
                                fontSize: 14,
                                color: '#f5222d'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                            lineNumber: 70,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 69,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: _constants.DESIGN_TOKENS.TEXT_SECONDARY
                        },
                        children: overallReasoning
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 63,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    padding: 16,
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AlertOutlined, {
                        style: {
                            fontSize: 32,
                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                            marginBottom: 8
                        }
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                            fontSize: 13
                        },
                        children: "No matching risk entities found"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            marginTop: 8,
                            fontSize: 12,
                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                            opacity: 0.8
                        },
                        children: "Try adjusting your query"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 77,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
        lineNumber: 61,
        columnNumber: 7
    }, this);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        children: [
            overallReasoning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(245, 34, 45, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        },
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(RiskIcon, {
                            style: {
                                fontSize: 14,
                                color: '#f5222d'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: _constants.DESIGN_TOKENS.TEXT_SECONDARY
                        },
                        children: overallReasoning
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 95,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 91,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: 'rgba(245, 34, 45, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(SparkleIcon, {}, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        strong: true,
                        style: {
                            fontSize: 14,
                            color: _constants.DESIGN_TOKENS.TEXT_PRIMARY
                        },
                        children: "Risk Entities"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                        style: {
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#f5222d',
                            background: 'rgba(245, 34, 45, 0.08)',
                            padding: '2px 8px',
                            borderRadius: 10
                        },
                        children: [
                            safeRecommendations.length,
                            " entities"
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 99,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                },
                children: safeRecommendations.map((rec, idx)=>{
                    const itemId = rec.itemId || `entity-${idx}`;
                    const title = rec.title || rec.zhTitle || rec.name || itemId;
                    const entityType = rec.entityType || rec.type || 'COMPANY';
                    const typeColor = ENTITY_TYPE_COLORS[entityType] || '#94a3b8';
                    const riskLevel = getRiskLevel(rec);
                    const riskInfo = riskLevel ? RISK_LEVEL_MAP[riskLevel] : null;
                    const score = rec.score ?? rec.confidence ?? 0;
                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        onClick: ()=>onEntityClick === null || onEntityClick === void 0 ? void 0 : onEntityClick(itemId, entityType),
                        style: {
                            display: 'flex',
                            gap: 12,
                            padding: 12,
                            background: '#fff',
                            borderRadius: 14,
                            border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: _constants.DESIGN_TOKENS.SHADOW_CARD
                        },
                        onMouseEnter: (e)=>{
                            e.currentTarget.style.boxShadow = _constants.DESIGN_TOKENS.SHADOW_GLOW;
                            e.currentTarget.style.borderColor = '#f5222d';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        },
                        onMouseLeave: (e)=>{
                            e.currentTarget.style.boxShadow = _constants.DESIGN_TOKENS.SHADOW_CARD;
                            e.currentTarget.style.borderColor = _constants.DESIGN_TOKENS.BORDER_DEFAULT;
                            e.currentTarget.style.transform = 'none';
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background: typeColor + '20',
                                    border: `2px solid ${typeColor}40`
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BankOutlined, {
                                    style: {
                                        fontSize: 22,
                                        color: typeColor
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                lineNumber: 139,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                strong: true,
                                                style: {
                                                    fontSize: 14
                                                },
                                                ellipsis: true,
                                                children: title
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this),
                                            riskInfo && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    fontSize: 10,
                                                    padding: '0 6px',
                                                    borderRadius: 4,
                                                    background: riskInfo.color + '18',
                                                    border: 'none',
                                                    color: riskInfo.color
                                                },
                                                children: riskInfo.label
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                lineNumber: 147,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 4
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    fontSize: 10,
                                                    padding: '0 6px',
                                                    borderRadius: 4,
                                                    background: typeColor + '18',
                                                    border: 'none',
                                                    color: typeColor
                                                },
                                                children: entityType
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                lineNumber: 154,
                                                columnNumber: 19
                                            }, this),
                                            score > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            width: 40,
                                                            height: 4,
                                                            borderRadius: 2,
                                                            background: '#f1f5f9',
                                                            overflow: 'hidden'
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                width: `${Math.round(score * 100)}%`,
                                                                height: '100%',
                                                                borderRadius: 2,
                                                                background: score > 0.7 ? '#10B981' : score > 0.4 ? '#F59E0B' : '#EF4444'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                            lineNumber: 160,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        style: {
                                                            fontSize: 10,
                                                            color: _constants.DESIGN_TOKENS.TEXT_MUTED
                                                        },
                                                        children: [
                                                            (score * 100).toFixed(0),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                        lineNumber: 162,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                                lineNumber: 158,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    rec.highlight && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Paragraph, {
                                        ellipsis: {
                                            rows: 2
                                        },
                                        style: {
                                            fontSize: 11,
                                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                                            marginBottom: 0
                                        },
                                        children: rec.highlight
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                        lineNumber: 168,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                                lineNumber: 143,
                                columnNumber: 15
                            }, this)
                        ]
                    }, itemId, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                        lineNumber: 120,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/RiskEntityCard.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
};
_c2 = RiskEntityCard;
var _default = RiskEntityCard;
var _c;
var _c1;
var _c2;
$RefreshReg$(_c, "RiskIcon");
$RefreshReg$(_c1, "SparkleIcon");
$RefreshReg$(_c2, "RiskEntityCard");
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
"src/pages/KnowledgeQA/components/RiskReportPanel.tsx": function (module, exports, __mako_require__){
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
var _reactmarkdown = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react-markdown/index.js"));
var _RiskPieChart = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/charts/RiskPieChart.tsx"));
var _EventBarChart = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/charts/EventBarChart.tsx"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const { Title, Text, Paragraph } = _antd.Typography;
const RISK_LEVEL_COLORS = {
    high: '#f5222d',
    medium: '#fa8c16',
    low: '#52c41a'
};
const URGENCY_TAGS = {
    urgent: {
        color: '#f5222d',
        label: '紧急'
    },
    normal: {
        color: '#fa8c16',
        label: '一般'
    },
    low: {
        color: '#52c41a',
        label: '低'
    }
};
const STAGE_LABELS = {
    planning: '任务规划',
    retrieving: '图谱检索',
    analyzing: '风险分析',
    compliance: '合规匹配',
    reporting: '报告生成'
};
const RiskReportPanel = ({ report, stages, community, isLoading, error, onRetry })=>{
    var _stages_, _report_subgraph_summary, _report_subgraph_summary1;
    _s();
    const { message } = _antd.App.useApp();
    // Derived chart data
    const { highCount, mediumCount, lowCount, entityData, sortedEntities } = (0, _react.useMemo)(()=>{
        if (!report) return {
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            entityData: [],
            sortedEntities: []
        };
        let high = 0, medium = 0, low = 0;
        for (const path of report.risk_paths || []){
            if (path.risk_level === 'high') high++;
            else if (path.risk_level === 'medium') medium++;
            else low++;
        }
        const entityCounts = new Map();
        for (const path of report.risk_paths || [])for (const entity of path.affected_entities || []){
            const existing = entityCounts.get(entity);
            if (existing) existing.count++;
            else entityCounts.set(entity, {
                count: 1
            });
        }
        const sorted = Array.from(entityCounts.entries()).sort((a, b)=>b[1].count - a[1].count).slice(0, 10);
        const typeData = Array.from(entityCounts.entries().reduce((acc, [, val])=>{
            acc.set('Entity', (acc.get('Entity') || 0) + val.count);
            return acc;
        }, new Map())).map(([name, count])=>({
                name,
                count,
                color: '#1890ff'
            }));
        return {
            highCount: high,
            mediumCount: medium,
            lowCount: low,
            entityData: typeData,
            sortedEntities: sorted
        };
    }, [
        report
    ]);
    // Determine current stage for Steps
    const stageOrder = [
        'planning',
        'retrieving',
        'analyzing',
        'compliance',
        'reporting'
    ];
    const completedStages = new Set(stages.map((s)=>s.stage));
    const currentStageIdx = stageOrder.findIndex((s)=>!completedStages.has(s));
    const activeStep = currentStageIdx >= 0 ? currentStageIdx : stageOrder.length;
    // Export handlers
    const handleExportMD = ()=>{
        if (!(report === null || report === void 0 ? void 0 : report.markdown_report)) return;
        const blob = new Blob([
            report.markdown_report
        ], {
            type: 'text/markdown'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleExportPDF = ()=>{
        window.print();
    };
    const handleExportWord = ()=>{
        if (!(report === null || report === void 0 ? void 0 : report.markdown_report)) return;
        const html = `<html><body>${report.markdown_report.replace(/\n/g, '<br/>')}</body></html>`;
        const blob = new Blob([
            html
        ], {
            type: 'application/msword'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${Date.now()}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };
    // Empty state
    if (!report && !isLoading && stages.length === 0) return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
        },
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
            image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
            description: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            color: '#475569',
                            fontSize: 14,
                            display: 'block'
                        },
                        children: "Ask a risk-related question to generate a community report"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 149,
                        columnNumber: 15
                    }, void 0),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            color: '#94A3B8',
                            fontSize: 12
                        },
                        children: "Task Planning → Graph Retrieval → Risk Analysis → Compliance Matching → Report Generation"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 152,
                        columnNumber: 15
                    }, void 0)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                lineNumber: 148,
                columnNumber: 13
            }, void 0)
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
            lineNumber: 145,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
        lineNumber: 144,
        columnNumber: 7
    }, this);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            height: '100%',
            overflow: 'auto',
            padding: '12px 16px'
        },
        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            },
            children: [
                isLoading && stages.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    size: "small",
                    style: {
                        borderRadius: 8
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Steps, {
                            size: "small",
                            current: activeStep,
                            status: error ? 'error' : 'process',
                            items: stageOrder.map((key)=>({
                                    title: STAGE_LABELS[key]
                                }))
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 168,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginTop: 8,
                                textAlign: 'center'
                            },
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                type: "secondary",
                                style: {
                                    fontSize: 12
                                },
                                children: ((_stages_ = stages[stages.length - 1]) === null || _stages_ === void 0 ? void 0 : _stages_.content) || 'Initializing...'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 177,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 176,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 167,
                    columnNumber: 11
                }, this),
                community && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    size: "small",
                    style: {
                        borderRadius: 8,
                        background: '#f0f5ff'
                    },
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                            strong: true,
                            style: {
                                fontSize: 13
                            },
                            children: [
                                "Community #",
                                community.community_id
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 187,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                            type: "secondary",
                            style: {
                                fontSize: 12,
                                marginLeft: 8
                            },
                            children: [
                                community.size,
                                " nodes"
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 188,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                marginTop: 6,
                                display: 'flex',
                                gap: 4,
                                flexWrap: 'wrap'
                            },
                            children: community.top_entities.slice(0, 5).map((e)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                    style: {
                                        fontSize: 11,
                                        borderRadius: 6
                                    },
                                    children: e.name
                                }, e.id, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 193,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 191,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 186,
                    columnNumber: 11
                }, this),
                isLoading && !report && stages.length === 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    style: {
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                size: "large"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 203,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginTop: 16,
                                    color: '#94a3b8',
                                    fontSize: 14
                                },
                                children: "Initializing risk analysis pipeline..."
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 204,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 202,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 201,
                    columnNumber: 11
                }, this),
                error && !report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    style: {
                        borderRadius: 8
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            textAlign: 'center',
                            padding: 24
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                type: "danger",
                                style: {
                                    fontSize: 14,
                                    display: 'block',
                                    marginBottom: 12
                                },
                                children: [
                                    "Risk analysis failed: ",
                                    error
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 215,
                                columnNumber: 15
                            }, this),
                            onRetry && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 219,
                                    columnNumber: 31
                                }, void 0),
                                onClick: onRetry,
                                children: "Retry"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 219,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 214,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 213,
                    columnNumber: 11
                }, this),
                report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Title, {
                                            level: 5,
                                            style: {
                                                margin: 0,
                                                fontSize: 15
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                    style: {
                                                        marginRight: 8,
                                                        color: '#FFC101'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 19
                                                }, this),
                                                "Executive Summary"
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                            color: RISK_LEVEL_COLORS[report.overall_risk_level] || '#fa8c16',
                                            style: {
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600
                                            },
                                            children: report.overall_risk_level === 'high' ? 'High Risk' : report.overall_risk_level === 'medium' ? 'Medium Risk' : 'Low Risk'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 234,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Paragraph, {
                                    ellipsis: {
                                        rows: 3,
                                        expandable: true
                                    },
                                    style: {
                                        color: '#475569',
                                        fontSize: 13,
                                        marginBottom: 8
                                    },
                                    children: report.executive_summary
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 241,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                    size: "small",
                                    column: 3,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "Nodes",
                                            children: ((_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) || '-'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 245,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "Edges",
                                            children: ((_report_subgraph_summary1 = report.subgraph_summary) === null || _report_subgraph_summary1 === void 0 ? void 0 : _report_subgraph_summary1.edge_count) || '-'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 246,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "Tasks",
                                            children: report.subtasks_completed || '-'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 244,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 228,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Collapse, {
                            defaultActiveKey: [
                                'charts'
                            ],
                            size: "small",
                            items: [
                                {
                                    key: 'charts',
                                    label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        strong: true,
                                        style: {
                                            fontSize: 13
                                        },
                                        children: "Charts & Entities"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 257,
                                        columnNumber: 24
                                    }, void 0),
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12
                                        },
                                        children: [
                                            highCount + mediumCount + lowCount > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 11
                                                        },
                                                        children: "Risk Path Distribution"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 262,
                                                        columnNumber: 25
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskPieChart.default, {
                                                        highCount: highCount,
                                                        mediumCount: mediumCount,
                                                        lowCount: lowCount
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 25
                                                    }, void 0)
                                                ]
                                            }, void 0, true),
                                            entityData.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 11
                                                        },
                                                        children: "Entity Type Distribution"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 25
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_EventBarChart.default, {
                                                        data: entityData
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 269,
                                                        columnNumber: 25
                                                    }, void 0)
                                                ]
                                            }, void 0, true),
                                            sortedEntities.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                                                size: "small",
                                                header: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 11
                                                    },
                                                    children: "Related Entities (Top 10)"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 33
                                                }, void 0),
                                                dataSource: sortedEntities,
                                                renderItem: ([name, { count }])=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                                                        style: {
                                                            padding: '2px 0'
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                            style: {
                                                                width: '100%',
                                                                justifyContent: 'space-between'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    style: {
                                                                        fontSize: 12
                                                                    },
                                                                    ellipsis: true,
                                                                    children: name
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 280,
                                                                    columnNumber: 31
                                                                }, void 0),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 10
                                                                    },
                                                                    children: [
                                                                        count,
                                                                        "x"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 281,
                                                                    columnNumber: 31
                                                                }, void 0)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 29
                                                        }, void 0)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 27
                                                    }, void 0)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 273,
                                                columnNumber: 23
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 259,
                                        columnNumber: 19
                                    }, void 0)
                                }
                            ]
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 252,
                            columnNumber: 13
                        }, this),
                        report.risk_paths && report.risk_paths.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 13
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.AlertOutlined, {
                                        style: {
                                            marginRight: 8,
                                            color: '#f5222d'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 299,
                                        columnNumber: 21
                                    }, void 0),
                                    "Risk Paths (",
                                    report.risk_paths.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 298,
                                columnNumber: 19
                            }, void 0),
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: report.risk_paths.slice(0, 5).map((path)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            padding: '8px 12px',
                                            background: '#f8fafc',
                                            borderRadius: 6,
                                            borderLeft: `3px solid ${RISK_LEVEL_COLORS[path.risk_level] || '#fa8c16'}`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    marginBottom: 4
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: RISK_LEVEL_COLORS[path.risk_level],
                                                        style: {
                                                            fontSize: 10,
                                                            borderRadius: 4,
                                                            lineHeight: '18px'
                                                        },
                                                        children: path.risk_level === 'high' ? 'High' : path.risk_level === 'medium' ? 'Medium' : 'Low'
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: true,
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: path.path_id
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 315,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#475569'
                                                },
                                                children: path.path_description
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 321,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, path.path_id, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 306,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 304,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 294,
                            columnNumber: 15
                        }, this),
                        report.anomaly_findings && report.anomaly_findings.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 13
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BulbOutlined, {
                                        style: {
                                            marginRight: 8,
                                            color: '#FF8C00'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 335,
                                        columnNumber: 21
                                    }, void 0),
                                    "Anomaly Findings (",
                                    report.anomaly_findings.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 334,
                                columnNumber: 19
                            }, void 0),
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: report.anomaly_findings.map((anomaly, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            padding: '8px 12px',
                                            background: '#fffbeb',
                                            borderRadius: 6,
                                            border: '1px solid #fef3c7'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    marginBottom: 2
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: true,
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: anomaly.anomaly_type
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        style: {
                                                            fontSize: 10,
                                                            borderRadius: 4
                                                        },
                                                        children: [
                                                            (anomaly.confidence * 100).toFixed(0),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 343,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                style: {
                                                    fontSize: 11,
                                                    color: '#64748b'
                                                },
                                                children: anomaly.evidence
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 347,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, idx, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 342,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 340,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 330,
                            columnNumber: 15
                        }, this),
                        report.compliance_matches && report.compliance_matches.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 13
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SafetyOutlined, {
                                        style: {
                                            marginRight: 8,
                                            color: '#722ed1'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 361,
                                        columnNumber: 21
                                    }, void 0),
                                    "Compliance Matches (",
                                    report.compliance_matches.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 360,
                                columnNumber: 19
                            }, void 0),
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8
                                },
                                children: report.compliance_matches.map((match, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            padding: '8px 12px',
                                            background: '#faf5ff',
                                            borderRadius: 6,
                                            border: '1px solid #f3e8ff'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    marginBottom: 2
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: true,
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: match.regulation
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 370,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#722ed1",
                                                        style: {
                                                            fontSize: 10,
                                                            borderRadius: 4
                                                        },
                                                        children: match.suggested_action
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 369,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                style: {
                                                    fontSize: 11,
                                                    color: '#64748b'
                                                },
                                                children: match.violation
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 373,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, idx, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 368,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 366,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 356,
                            columnNumber: 15
                        }, this),
                        report.recommendations && report.recommendations.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 13
                                },
                                children: "Recommendations"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 382,
                                columnNumber: 69
                            }, void 0),
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                },
                                children: report.recommendations.map((rec, idx)=>{
                                    const urgency = URGENCY_TAGS[rec.urgency] || URGENCY_TAGS.normal;
                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '6px 10px',
                                            background: '#f8fafc',
                                            borderRadius: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    fontSize: 16,
                                                    fontWeight: 700,
                                                    color: urgency.color,
                                                    minWidth: 20,
                                                    textAlign: 'center'
                                                },
                                                children: idx + 1
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 388,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    flex: 1
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: true,
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: rec.action
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        style: {
                                                            fontSize: 11,
                                                            color: '#94a3b8',
                                                            display: 'block'
                                                        },
                                                        children: rec.reasoning
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 391,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 389,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: urgency.color,
                                                style: {
                                                    borderRadius: 4,
                                                    fontSize: 10
                                                },
                                                children: urgency.label
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 393,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    borderRadius: 4,
                                                    fontSize: 10
                                                },
                                                children: rec.department
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 394,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, idx, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 387,
                                        columnNumber: 23
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 383,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 382,
                            columnNumber: 15
                        }, this),
                        report.markdown_report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Collapse, {
                            size: "small",
                            items: [
                                {
                                    key: 'full-report',
                                    label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                        strong: true,
                                        style: {
                                            fontSize: 13
                                        },
                                        children: "Full Report (Markdown)"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 408,
                                        columnNumber: 26
                                    }, void 0),
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        className: "markdown-report",
                                        style: {
                                            fontSize: 13,
                                            lineHeight: 1.7,
                                            color: '#334155'
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_reactmarkdown.default, {
                                            children: report.markdown_report
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 411,
                                            columnNumber: 23
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 410,
                                        columnNumber: 21
                                    }, void 0)
                                }
                            ]
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 404,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                            size: "small",
                            style: {
                                borderRadius: 8
                            },
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                wrap: true,
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 421,
                                            columnNumber: 44
                                        }, void 0),
                                        onClick: handleExportMD,
                                        children: "Export MD"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 421,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExportOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 422,
                                            columnNumber: 44
                                        }, void 0),
                                        onClick: handleExportPDF,
                                        children: "Export PDF"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 422,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExportOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 423,
                                            columnNumber: 44
                                        }, void 0),
                                        onClick: handleExportWord,
                                        children: "Export Word"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 423,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 420,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 419,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                error && report && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    size: "small",
                    style: {
                        borderRadius: 8,
                        border: '1px solid #ffccc7'
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                        type: "danger",
                        style: {
                            fontSize: 12
                        },
                        children: [
                            "Note: ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 432,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 431,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
            lineNumber: 164,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
};
_s(RiskReportPanel, "D20f1fdJL8dM0+QMpNAkaamiKkw=", false, function() {
    return [
        _antd.App.useApp
    ];
});
_c = RiskReportPanel;
var _default = RiskReportPanel;
var _c;
$RefreshReg$(_c, "RiskReportPanel");
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
"src/pages/KnowledgeQA/components/WorkspaceContainer.tsx": function (module, exports, __mako_require__){
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
    WorkspaceContainer: function() {
        return WorkspaceContainer;
    },
    default: function() {
        return _default;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _EntityMessageBubble = __mako_require__("src/pages/KnowledgeQA/components/EntityMessageBubble.tsx");
var _RiskEntityCard = __mako_require__("src/pages/KnowledgeQA/components/RiskEntityCard.tsx");
var _ContextTagBar = __mako_require__("src/pages/KnowledgeQA/components/ContextTagBar.tsx");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const { TextArea } = _antd.Input;
const Text = ({ type, className = '', children, strong })=>{
    const colorMap = {
        secondary: '#71717a',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981'
    };
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
        style: {
            color: type ? colorMap[type] : _constants.DESIGN_TOKENS.TEXT_PRIMARY,
            fontWeight: strong ? 600 : 400
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
};
_c = Text;
const WorkspaceContainer = ({ messages, isLoading, pendingRecommendations, onSendMessage, onClearHistory, onEntityHover, onEntityClick, highlightedEntity, graphInjectedEntity, onClearGraphInject })=>{
    _s();
    const [input, setInput] = (0, _react.useState)('');
    const [contextTags, setContextTags] = (0, _react.useState)([]);
    const messagesEndRef = (0, _react.useRef)(null);
    const inputRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(()=>{
        var _messagesEndRef_current;
        (_messagesEndRef_current = messagesEndRef.current) === null || _messagesEndRef_current === void 0 || _messagesEndRef_current.scrollIntoView({
            behavior: 'smooth'
        });
    }, [
        messages,
        isLoading
    ]);
    const handleSend = (0, _react.useCallback)(async ()=>{
        var _inputRef_current;
        const text = input.trim();
        if (!text || isLoading) return;
        let fullQuery = text;
        if (graphInjectedEntity) fullQuery = `[${graphInjectedEntity.name}] ${fullQuery}`;
        if (contextTags.length > 0) fullQuery = `Context: ${contextTags.map((t)=>t.id).join(', ')}. Query: ${fullQuery}`;
        setInput('');
        await onSendMessage(fullQuery);
        (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 || _inputRef_current.focus();
    }, [
        input,
        isLoading,
        onSendMessage,
        graphInjectedEntity,
        contextTags
    ]);
    const handleKeyDown = (e)=>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleRemoveTag = (id)=>{
        setContextTags((prev)=>prev.filter((t)=>t.id !== id));
    };
    const handleClearTags = ()=>{
        setContextTags([]);
    };
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'linear-gradient(180deg, #F7F9FC 0%, #F1F5F9 100%)'
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("h2", {
                                style: {
                                    margin: 0,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: _constants.DESIGN_TOKENS.TEXT_PRIMARY
                                },
                                children: "Chat"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                type: "secondary",
                                className: "text-xs",
                                children: [
                                    messages.length,
                                    " messages"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                        onClick: onClearHistory,
                        style: {
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            borderRadius: 8,
                            transition: 'all 0.2s ease'
                        },
                        onMouseEnter: (e)=>{
                            e.currentTarget.style.background = '#f1f5f9';
                        },
                        onMouseLeave: (e)=>{
                            e.currentTarget.style.background = 'none';
                        },
                        title: "Clear chat",
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClearOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                children: "Clear"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px'
                },
                children: messages.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                        image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
                        description: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                textAlign: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                    style: {
                                        color: '#475569',
                                        fontSize: 14,
                                        marginBottom: 8
                                    },
                                    children: "Start your first query!"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 174,
                                    columnNumber: 19
                                }, void 0),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                    style: {
                                        color: '#94A3B8',
                                        fontSize: 12
                                    },
                                    children: 'Try: "查询某公司近期的风险传导路径和异常事件"'
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 177,
                                    columnNumber: 19
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 173,
                            columnNumber: 17
                        }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 170,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                    lineNumber: 162,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                    children: [
                        messages.map((msg)=>{
                            var _msg_data, _msg_data1;
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_EntityMessageBubble.EntityMessageBubble, {
                                        message: msg,
                                        onEntityHover: onEntityHover,
                                        onEntityClick: (entity)=>{
                                            setContextTags((prev)=>{
                                                if (prev.find((t)=>t.id === entity.id)) return prev;
                                                return [
                                                    ...prev,
                                                    {
                                                        id: entity.id,
                                                        type: entity.type
                                                    }
                                                ];
                                            });
                                            onEntityClick === null || onEntityClick === void 0 || onEntityClick(entity.id, entity.type);
                                        },
                                        highlightedEntity: highlightedEntity
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 188,
                                        columnNumber: 17
                                    }, this),
                                    msg.role === 'assistant' && (((_msg_data = msg.data) === null || _msg_data === void 0 ? void 0 : _msg_data.output) || pendingRecommendations) && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginLeft: 44,
                                            marginBottom: 12
                                        },
                                        children: pendingRecommendations && pendingRecommendations.length > 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskEntityCard.RiskEntityCard, {
                                                    recommendations: pendingRecommendations,
                                                    onEntityClick: ()=>{}
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                    lineNumber: 204,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        marginTop: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                                            size: "small"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                            lineNumber: 209,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                            style: {
                                                                color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                                                                fontSize: 12
                                                            },
                                                            children: "Generating review..."
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                            lineNumber: 210,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true) : ((_msg_data1 = msg.data) === null || _msg_data1 === void 0 ? void 0 : _msg_data1.output) ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_RiskEntityCard.RiskEntityCard, {
                                            recommendations: msg.data.output.recommendations || [],
                                            onEntityClick: (entityId, entityType)=>{
                                                setContextTags((prev)=>{
                                                    if (prev.find((t)=>t.id === entityId)) return prev;
                                                    return [
                                                        ...prev,
                                                        {
                                                            id: entityId,
                                                            type: entityType
                                                        }
                                                    ];
                                                });
                                                onEntityClick === null || onEntityClick === void 0 || onEntityClick(entityId, entityType);
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                            lineNumber: 216,
                                            columnNumber: 23
                                        }, this) : null
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 201,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, msg.id, true, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this);
                        }),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            ref: messagesEndRef
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 231,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(16px)',
                    borderTop: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`
                },
                children: [
                    graphInjectedEntity && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            background: 'rgba(0, 47, 167, 0.06)',
                            borderRadius: 10,
                            border: '1px dashed rgba(0, 47, 167, 0.3)',
                            marginBottom: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("svg", {
                                width: "12",
                                height: "12",
                                viewBox: "0 0 12 12",
                                fill: "none",
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("path", {
                                    d: "M6 1L11 6L6 11",
                                    stroke: _constants.DESIGN_TOKENS.KLEIN_BLUE,
                                    strokeWidth: "1.5",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 259,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 258,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 11,
                                    color: '#475569',
                                    fontWeight: 500
                                },
                                children: "From Graph:"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 267,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                style: {
                                    background: 'rgba(0, 47, 167, 0.1)',
                                    border: '1px solid rgba(0, 47, 167, 0.3)',
                                    color: _constants.DESIGN_TOKENS.KLEIN_BLUE,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: '1px 8px',
                                    borderRadius: 14,
                                    animation: 'tagFlyIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                },
                                children: graphInjectedEntity.name
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 270,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                style: {
                                    fontSize: 11,
                                    color: '#94a3b8'
                                },
                                children: "· Click input to continue"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 284,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                                onClick: ()=>{
                                    var _inputRef_current;
                                    onClearGraphInject === null || onClearGraphInject === void 0 || onClearGraphInject();
                                    (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 || _inputRef_current.focus();
                                },
                                style: {
                                    marginLeft: 'auto',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: 14,
                                    lineHeight: 1,
                                    padding: '2px 4px'
                                },
                                children: "×"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 287,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 246,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_ContextTagBar.ContextTagBar, {
                        tags: contextTags,
                        onRemove: handleRemoveTag,
                        onClearAll: handleClearTags,
                        onTagClick: (entity)=>{
                            setContextTags((prev)=>{
                                if (prev.find((t)=>t.id === entity.id)) return prev;
                                return [
                                    ...prev,
                                    {
                                        id: entity.id,
                                        type: entity.type
                                    }
                                ];
                            });
                        }
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 308,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            background: '#FFFFFF',
                            border: `1px solid ${_constants.DESIGN_TOKENS.BORDER_DEFAULT}`,
                            borderRadius: 14,
                            padding: '10px 14px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                        },
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                display: 'flex',
                                gap: 8,
                                alignItems: 'flex-end'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(TextArea, {
                                    ref: inputRef,
                                    value: input,
                                    onChange: (e)=>setInput(e.target.value),
                                    onKeyDown: handleKeyDown,
                                    placeholder: contextTags.length > 0 ? 'Continue with context constraints, or enter a new question...' : 'Enter your question, press Enter to send...',
                                    autoSize: {
                                        minRows: 1,
                                        maxRows: 4
                                    },
                                    style: {
                                        flex: 1,
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        background: 'transparent',
                                        padding: 0
                                    },
                                    disabled: isLoading
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 331,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("button", {
                                    onClick: handleSend,
                                    disabled: !input.trim() || isLoading,
                                    style: {
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                        background: input.trim() && !isLoading ? 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)' : '#F1F5F9',
                                        color: input.trim() && !isLoading ? '#ffffff' : '#94A3B8',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                        boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(40, 85, 209, 0.3)' : 'none'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SendOutlined, {
                                        style: {
                                            fontSize: 15
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 379,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 354,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 330,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 320,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                        style: {
                            color: _constants.DESIGN_TOKENS.TEXT_MUTED,
                            fontSize: 12,
                            marginTop: 8,
                            display: 'block',
                            paddingLeft: 4
                        },
                        children: "Enter to send · Shift+Enter for newline · Double-click graph node to add context"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 384,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 237,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
};
_s(WorkspaceContainer, "iM18rKO3YEv04mpgH9oA0MQ/zlM=");
_c1 = WorkspaceContainer;
var _default = WorkspaceContainer;
var _c;
var _c1;
$RefreshReg$(_c, "Text");
$RefreshReg$(_c1, "WorkspaceContainer");
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
"src/pages/KnowledgeQA/components/charts/EventBarChart.tsx": function (module, exports, __mako_require__){
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
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _echartsforreact = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/echarts-for-react/esm/index.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const EventBarChart = ({ data })=>{
    const sorted = [
        ...data
    ].sort((a, b)=>b.count - a.count);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: 10,
            right: 20,
            top: 5,
            bottom: 5,
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                fontSize: 10,
                color: '#94a3b8'
            },
            splitLine: {
                lineStyle: {
                    color: '#f1f5f9'
                }
            }
        },
        yAxis: {
            type: 'category',
            data: sorted.map((d)=>d.name),
            axisLabel: {
                fontSize: 10,
                color: '#475569'
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            }
        },
        series: [
            {
                type: 'bar',
                data: sorted.map((d)=>({
                        value: d.count,
                        itemStyle: {
                            color: d.color,
                            borderRadius: [
                                0,
                                4,
                                4,
                                0
                            ]
                        }
                    })),
                barWidth: 14,
                label: {
                    show: true,
                    position: 'right',
                    fontSize: 10,
                    color: '#64748b'
                }
            }
        ]
    };
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
        option: option,
        style: {
            height: sorted.length * 30 + 50,
            maxHeight: 200
        }
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/charts/EventBarChart.tsx",
        lineNumber: 53,
        columnNumber: 10
    }, this);
};
_c = EventBarChart;
var _default = EventBarChart;
var _c;
$RefreshReg$(_c, "EventBarChart");
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
"src/pages/KnowledgeQA/components/charts/RiskPieChart.tsx": function (module, exports, __mako_require__){
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
var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
var _echartsforreact = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/echarts-for-react/esm/index.js"));
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const RiskPieChart = ({ highCount, mediumCount, lowCount })=>{
    const total = highCount + mediumCount + lowCount;
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            bottom: 0,
            textStyle: {
                fontSize: 11
            }
        },
        series: [
            {
                type: 'pie',
                radius: [
                    '45%',
                    '72%'
                ],
                center: [
                    '50%',
                    '45%'
                ],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontWeight: 'bold'
                    }
                },
                data: [
                    {
                        value: highCount,
                        name: '高风险',
                        itemStyle: {
                            color: '#f5222d'
                        }
                    },
                    {
                        value: mediumCount,
                        name: '中风险',
                        itemStyle: {
                            color: '#faad14'
                        }
                    },
                    {
                        value: lowCount,
                        name: '低风险',
                        itemStyle: {
                            color: '#52c41a'
                        }
                    }
                ]
            }
        ],
        graphic: total > 0 ? [
            {
                type: 'text',
                left: 'center',
                top: '38%',
                style: {
                    text: String(total),
                    textAlign: 'center',
                    fill: '#1e293b',
                    fontSize: 22,
                    fontWeight: 'bold'
                }
            },
            {
                type: 'text',
                left: 'center',
                top: '48%',
                style: {
                    text: '路径总数',
                    textAlign: 'center',
                    fill: '#94a3b8',
                    fontSize: 11
                }
            }
        ] : []
    };
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
        option: option,
        style: {
            height: 200
        }
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/charts/RiskPieChart.tsx",
        lineNumber: 73,
        columnNumber: 10
    }, this);
};
_c = RiskPieChart;
var _default = RiskPieChart;
var _c;
$RefreshReg$(_c, "RiskPieChart");
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
"src/pages/KnowledgeQA/index.tsx": function (module, exports, __mako_require__){
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
var _WorkspaceContainer = __mako_require__("src/pages/KnowledgeQA/components/WorkspaceContainer.tsx");
var _EnhancedGraphPanel = __mako_require__("src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx");
var _AnalysisPanel = __mako_require__("src/pages/KnowledgeQA/components/AnalysisPanel.tsx");
var _RiskReportPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/RiskReportPanel.tsx"));
var _ChatSidebar = __mako_require__("src/pages/KnowledgeQA/components/ChatSidebar.tsx");
var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
var _chatStore = __mako_require__("src/pages/KnowledgeQA/store/chatStore.ts");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const KnowledgeQA = ()=>{
    _s();
    const { messages, currentSubgraph, alignmentFeatures, isLoading, sendMessage, clearHistory, pendingRecommendations, clarifyMessage, activeRightPanel, analysisResult, riskReport, riskStages, riskCommunity, error } = (0, _agentStore.useAgentStore)();
    const { activeSessionId, updateCurrentSession, getActiveSession, createNewSession } = (0, _chatStore.useChatStore)();
    const graphRef = (0, _react.useRef)(null);
    const [highlightedEntity, setHighlightedEntity] = (0, _react.useState)(null);
    const [graphInjectedEntity, setGraphInjectedEntity] = (0, _react.useState)(null);
    const [sidebarCollapsed, setSidebarCollapsed] = (0, _react.useState)(false);
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
            if (messages.length > 0 || currentSubgraph || analysisResult || riskReport) {
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
                        chartOptions: analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.echarts_config,
                        stats: {
                            rawData: analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.raw_data,
                            rowCount: analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.row_count
                        },
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
        analysisResult,
        riskReport,
        activeSessionId,
        updateCurrentSession,
        getActiveSession,
        createNewSession
    ]);
    // Session restoration
    (0, _react.useEffect)(()=>{
        var _session_messages_find;
        if (_agentStore.useAgentStore.getState().isLoading) return;
        const session = getActiveSession();
        if (!session) return;
        _agentStore.useAgentStore.setState({
            messages: session.messages,
            currentSubgraph: session.workspaceState.graphData,
            analysisResult: session.workspaceState.graphData ? null : {
                analysis_text: ((_session_messages_find = session.messages.find((m)=>m.role === 'assistant' && m.content)) === null || _session_messages_find === void 0 ? void 0 : _session_messages_find.content) || '',
                echarts_config: session.workspaceState.chartOptions,
                raw_data: session.workspaceState.stats.rawData || [],
                row_count: session.workspaceState.stats.rowCount || 0
            },
            riskReport: session.workspaceState.riskReport || null,
            riskStages: session.workspaceState.riskStages || [],
            riskCommunity: session.workspaceState.riskCommunity || null,
            activeRightPanel: session.workspaceState.riskReport ? 'risk' : session.workspaceState.graphData ? 'graph' : 'analysis'
        });
        if (session.workspaceState.graphData && graphRef.current) {
            graphRef.current.refresh(session.workspaceState.graphData, []);
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
        if (currentSubgraph && graphRef.current) {
            graphRef.current.refresh(currentSubgraph, alignmentFeatures);
            const t = setTimeout(()=>{
                var _graphRef_current;
                return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView();
            }, 500);
            return ()=>clearTimeout(t);
        }
    }, [
        currentSubgraph,
        alignmentFeatures
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
    const handleBFFSend = (0, _react.useCallback)(async (query)=>{
        const history = _agentStore.useAgentStore.getState().messages.filter((m)=>m.role === 'user' || m.role === 'assistant').slice(-4).map((m)=>`${m.role === 'user' ? 'User' : 'System'}: ${m.content.slice(0, 100)}`);
        try {
            const params = new URLSearchParams({
                query,
                history: JSON.stringify(history)
            });
            const res = await fetch(`http://localhost:3001/api/rewrite?${params.toString()}`);
            if (res.ok) {
                const { rewrittenQuery } = await res.json();
                await sendMessage(query, rewrittenQuery);
            } else throw new Error('BFF unreachable');
        } catch (e) {
            console.warn('BFF unavailable, sending original query directly.', e);
            await sendMessage(query);
        }
    }, [
        sendMessage
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
            title: 'Knowledge Graph Q&A',
            subTitle: 'Knowledge graph recommendation engine'
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
                        lineNumber: 226,
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
                                                            lineNumber: 260,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "16",
                                                            cy: "10",
                                                            r: "3",
                                                            fill: "#ffffff"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 261,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "10",
                                                            cy: "20",
                                                            r: "2.5",
                                                            fill: "#10B981"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 262,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "22",
                                                            cy: "20",
                                                            r: "2.5",
                                                            fill: "#F59E0B"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 263,
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
                                                            lineNumber: 264,
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
                                                            lineNumber: 265,
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
                                                            lineNumber: 266,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 247,
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
                                                        lineNumber: 270,
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
                                                        lineNumber: 281,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 269,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 246,
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
                                                    lineNumber: 289,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#64748B'
                                                    },
                                                    children: apiHealthy === null ? 'Checking' : apiHealthy ? 'API Online' : 'API Offline'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 288,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 287,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 234,
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
                                            width: 480,
                                            minWidth: 360,
                                            maxWidth: 560,
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
                                                lineNumber: 333,
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
                                                        lineNumber: 359,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 6
                                                        },
                                                        children: clarifyMessage
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 368,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 347,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 318,
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
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'rgba(255, 255, 255, 0.5)',
                                                    backdropFilter: 'blur(10px)'
                                                },
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Segmented, {
                                                    options: [
                                                        {
                                                            label: 'Knowledge Graph',
                                                            value: 'graph'
                                                        },
                                                        {
                                                            label: 'Data Analysis',
                                                            value: 'analysis'
                                                        },
                                                        {
                                                            label: 'Risk Report',
                                                            value: 'risk'
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
                                                    lineNumber: 397,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 386,
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
                                                    isLoading: isLoading,
                                                    error: error
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 19
                                                }, this) : activeRightPanel === 'analysis' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_AnalysisPanel.AnalysisPanel, {
                                                    onClose: ()=>_agentStore.useAgentStore.setState({
                                                            activeRightPanel: 'graph'
                                                        })
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 426,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_EnhancedGraphPanel.EnhancedGraphPanel, {
                                                    ref: graphRef,
                                                    subgraph: currentSubgraph,
                                                    alignmentFeatures: alignmentFeatures,
                                                    onNodeDoubleClick: handleNodeDoubleClick,
                                                    onNodeHover: (nodeId)=>setHighlightedEntity(nodeId),
                                                    highlightedEntity: highlightedEntity
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 428,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 416,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 374,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 308,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/index.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/index.tsx",
                lineNumber: 215,
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
                lineNumber: 443,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/index.tsx",
        lineNumber: 209,
        columnNumber: 5
    }, this);
};
_s(KnowledgeQA, "X9MA0CMUBOtJDy+Hes9aM0eXekg=", false, function() {
    return [
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

},
"src/pages/KnowledgeQA/store/agentStore.ts": function (module, exports, __mako_require__){
"use strict";
__mako_require__.d(exports, "__esModule", {
    value: true
});
__mako_require__.d(exports, "useAgentStore", {
    enumerable: true,
    get: function() {
        return useAgentStore;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _zustand = __mako_require__("node_modules/zustand/esm/index.mjs");
var _axios = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
var _agent = __mako_require__("src/pages/KnowledgeQA/api/agent.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const generateSessionId = ()=>`sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const useAgentStore = (0, _zustand.create)((set, get)=>({
        messages: [],
        currentSubgraph: null,
        rewriteResult: null,
        alignmentFeatures: [],
        isLoading: false,
        sessionId: generateSessionId(),
        roundId: 0,
        error: null,
        pendingRecommendations: null,
        clarifyMessage: null,
        currentRoute: null,
        analysisQuery: null,
        analysisResult: null,
        activeRightPanel: 'graph',
        riskReport: null,
        riskStages: [],
        riskCommunity: null,
        sendMessage: async (query, rewrittenQuery)=>{
            if (get().isLoading) return;
            const { sessionId, roundId, messages } = get();
            set({
                roundId: roundId + 1
            });
            const backendQuery = rewrittenQuery || query;
            const userMsg = {
                id: `user_${Date.now()}`,
                role: 'user',
                content: query,
                timestamp: Date.now()
            };
            const tempId = `asst_${Date.now()}`;
            const initialThinkingProcess = [];
            if (rewrittenQuery && rewrittenQuery !== query) initialThinkingProcess.push(`BFF intent recognition: optimized query to "${rewrittenQuery}"`);
            const assistantMsg = {
                id: tempId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isLoading: true,
                thinkingProcess: initialThinkingProcess
            };
            set((state)=>({
                    messages: [
                        ...state.messages,
                        userMsg,
                        assistantMsg
                    ],
                    isLoading: true,
                    error: null,
                    pendingRecommendations: null,
                    clarifyMessage: null
                }));
            // Step 1: IntentRouter
            let route = 'graph';
            try {
                const routeResp = await _axios.default.post('/api/v1/chat/route', {
                    query: backendQuery
                });
                route = routeResp.data.route;
                if (route === 'clarify') {
                    set((state)=>({
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    isLoading: false,
                                    content: routeResp.data.clarify_message ?? 'Sorry, I didn\'t fully understand. Could you provide more specific criteria?'
                                } : m),
                            clarifyMessage: routeResp.data.clarify_message ?? null,
                            isLoading: false
                        }));
                    return;
                }
            } catch (err) {
                console.warn('[Store] /route failed, defaulting to graph:', err);
            }
            // Step 2: Risk Report pipeline
            if (route === 'risk') {
                set({
                    currentRoute: 'risk',
                    activeRightPanel: 'risk',
                    riskReport: null,
                    riskStages: [],
                    riskCommunity: null,
                    isLoading: true,
                    currentSubgraph: null,
                    analysisResult: null
                });
                await get().sendRiskQuery(backendQuery);
                return;
            }
            // Step 3: Analysis pipeline
            if (route === 'analysis') {
                set({
                    currentRoute: 'analysis',
                    activeRightPanel: 'analysis',
                    analysisQuery: backendQuery,
                    isLoading: true,
                    currentSubgraph: null,
                    analysisResult: null
                });
                const maxRetries = 3;
                let retryCount = 0;
                let success = false;
                while(retryCount < maxRetries && !success){
                    if (retryCount > 0) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
                        set((state)=>({
                                messages: state.messages.map((m)=>m.id === tempId ? {
                                        ...m,
                                        thinkingStatus: `连接中断，${delay / 1000}s 后重试 (${retryCount}/${maxRetries})...`
                                    } : m)
                            }));
                        await new Promise((r)=>setTimeout(r, delay));
                    }
                    try {
                        var _resp_body;
                        const resp = await fetch('/api/v1/chat/analyze', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                query: backendQuery
                            })
                        });
                        if (!resp.ok) throw new Error(`Analysis failed: ${resp.status}`);
                        const reader = (_resp_body = resp.body) === null || _resp_body === void 0 ? void 0 : _resp_body.getReader();
                        if (!reader) throw new Error('No reader available');
                        const decoder = new TextDecoder();
                        let buffer = '';
                        let pendingEvent = null;
                        let accumulatedText = '';
                        let finalConfig = null;
                        let finalData = [];
                        let rowCount = 0;
                        success = true;
                        while(true){
                            const { done, value } = await reader.read();
                            if (done) break;
                            buffer += decoder.decode(value, {
                                stream: true
                            });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() ?? '';
                            for (const line of lines){
                                const trimmed = line.trim();
                                if (!trimmed) continue;
                                if (trimmed.startsWith('event:')) pendingEvent = trimmed.slice(6).trim();
                                else if (trimmed.startsWith('data:')) {
                                    const raw = trimmed.slice(5).trim();
                                    const ev = pendingEvent;
                                    pendingEvent = null;
                                    if (!ev || !raw) continue;
                                    try {
                                        if (ev === 'stage') {
                                            const { content } = JSON.parse(raw);
                                            set((state)=>({
                                                    messages: state.messages.map((m)=>m.id === tempId ? {
                                                            ...m,
                                                            thinkingStatus: content,
                                                            thinkingProcess: [
                                                                ...m.thinkingProcess || [],
                                                                content
                                                            ]
                                                        } : m)
                                                }));
                                        } else if (ev === 'analysis_text') {
                                            const { chunk } = JSON.parse(raw);
                                            accumulatedText += chunk;
                                            set((state)=>({
                                                    messages: state.messages.map((m)=>m.id === tempId ? {
                                                            ...m,
                                                            content: accumulatedText
                                                        } : m)
                                                }));
                                        } else if (ev === 'echarts_config') finalConfig = JSON.parse(raw);
                                        else if (ev === 'raw_data') finalData = JSON.parse(raw);
                                        else if (ev === 'done') {
                                            const meta = JSON.parse(raw);
                                            rowCount = meta.row_count || 0;
                                        } else if (ev === 'error') {
                                            const { error: errMsg } = JSON.parse(raw);
                                            throw new Error(errMsg || 'Analysis error');
                                        }
                                    } catch (e) {
                                        console.error('[Store] Parse error in analysis stream:', e, raw);
                                    }
                                }
                            }
                        }
                        set((state)=>({
                                analysisResult: {
                                    analysis_text: accumulatedText,
                                    echarts_config: finalConfig,
                                    raw_data: finalData,
                                    row_count: rowCount
                                },
                                messages: state.messages.map((m)=>m.id === tempId ? {
                                        ...m,
                                        isLoading: false,
                                        thinkingStatus: undefined
                                    } : m),
                                isLoading: false
                            }));
                    } catch (err) {
                        retryCount++;
                        console.error(`[Store] Analysis attempt ${retryCount} failed:`, err);
                        if (retryCount >= maxRetries) set((state)=>({
                                isLoading: false,
                                error: err.message,
                                messages: state.messages.map((m)=>m.id === tempId ? {
                                        ...m,
                                        content: `Analysis failed after ${maxRetries} attempts: ${err.message}`
                                    } : m)
                            }));
                    }
                }
                return;
            }
            // Step 4: Graph / recommend pipeline
            set({
                activeRightPanel: 'graph'
            });
            const history = messages.filter((m)=>m.role === 'user').map((m)=>m.content);
            (0, _agent.sendChatStream)({
                query: backendQuery,
                history,
                sessionId,
                roundId: roundId + 1
            }, {
                onStage: (content)=>{
                    set((state)=>({
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    thinkingStatus: content,
                                    thinkingProcess: [
                                        ...m.thinkingProcess || [],
                                        content
                                    ]
                                } : m)
                        }));
                },
                onCards: (cards)=>{
                    set(()=>({
                            pendingRecommendations: cards
                        }));
                },
                onGraph: (graph)=>{
                    set(()=>({
                            currentSubgraph: graph
                        }));
                },
                onReview: ({ overall, highlights, explanation })=>{
                    const highlightMap = new Map(highlights.map((h)=>[
                            h.itemId,
                            h.highlight
                        ]));
                    set((state)=>{
                        const enrichedRecs = (state.pendingRecommendations ?? []).map((rec)=>({
                                ...rec,
                                highlight: highlightMap.get(rec.itemId) ?? rec.highlight ?? ''
                            }));
                        const finalOutput = {
                            overallReasoning: explanation || overall,
                            recommendations: enrichedRecs,
                            explanations: highlights.map((h)=>({
                                    itemId: h.itemId,
                                    highlight: h.highlight,
                                    pathIds: []
                                }))
                        };
                        return {
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: overall,
                                    isLoading: false,
                                    thinkingStatus: undefined,
                                    data: {
                                        output: finalOutput
                                    }
                                } : m),
                            pendingRecommendations: null,
                            isLoading: false,
                            currentRoute: 'graph'
                        };
                    });
                },
                onDone: ()=>{
                    set((state)=>({
                            pendingRecommendations: null,
                            isLoading: false,
                            currentRoute: 'graph',
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    isLoading: false,
                                    thinkingStatus: undefined
                                } : m)
                        }));
                },
                onError: (msg)=>{
                    set((state)=>({
                            isLoading: false,
                            pendingRecommendations: null,
                            error: msg,
                            currentRoute: 'graph',
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: `Error: ${msg}`
                                } : m)
                        }));
                }
            });
        // cleanup is handled internally on done/error events
        },
        sendRiskQuery: async (query, communityId)=>{
            const { sessionId, roundId } = get();
            const tempId = `asst_${Date.now()}`;
            const assistantMsg = {
                id: tempId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isLoading: true,
                thinkingProcess: [
                    'Risk Report: starting 5-agent pipeline...'
                ]
            };
            set((state)=>({
                    messages: [
                        ...state.messages,
                        assistantMsg
                    ],
                    isLoading: true,
                    error: null
                }));
            (0, _agent.sendRiskStream)({
                query,
                sessionId,
                roundId,
                communityId,
                maxHop: 3
            }, {
                onStage: (stage, content)=>{
                    set((state)=>({
                            riskStages: [
                                ...state.riskStages.filter((s)=>s.stage !== stage),
                                {
                                    stage: stage,
                                    content
                                }
                            ],
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    thinkingStatus: content,
                                    thinkingProcess: [
                                        ...m.thinkingProcess || [],
                                        `[${stage}] ${content}`
                                    ]
                                } : m)
                        }));
                },
                onCommunity: (info)=>{
                    set({
                        riskCommunity: info
                    });
                },
                onSubgraph: (graph)=>{
                    set({
                        currentSubgraph: graph
                    });
                },
                onReport: (report)=>{
                    set((state)=>({
                            riskReport: report,
                            messages: state.messages.map((m)=>{
                                var _report_markdown_report;
                                return m.id === tempId ? {
                                    ...m,
                                    content: report.executive_summary || ((_report_markdown_report = report.markdown_report) === null || _report_markdown_report === void 0 ? void 0 : _report_markdown_report.slice(0, 300)) || '',
                                    isLoading: false,
                                    thinkingStatus: undefined,
                                    data: {
                                        echartsConfig: report.echarts_config
                                    }
                                } : m;
                            }),
                            isLoading: false,
                            currentRoute: 'risk',
                            activeRightPanel: 'risk'
                        }));
                },
                onDone: ()=>{
                    set((state)=>({
                            isLoading: false,
                            currentRoute: 'risk',
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    isLoading: false,
                                    thinkingStatus: undefined
                                } : m)
                        }));
                },
                onError: (msg)=>{
                    set((state)=>({
                            isLoading: false,
                            error: msg,
                            currentRoute: 'risk',
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: `Risk analysis failed: ${msg}`
                                } : m)
                        }));
                }
            });
        },
        clearHistory: ()=>{
            set({
                messages: [],
                currentSubgraph: null,
                rewriteResult: null,
                alignmentFeatures: [],
                roundId: 0,
                sessionId: generateSessionId(),
                error: null,
                pendingRecommendations: null,
                clarifyMessage: null,
                currentRoute: null,
                analysisQuery: null,
                analysisResult: null,
                riskReport: null,
                riskStages: [],
                riskCommunity: null,
                activeRightPanel: 'graph'
            });
        },
        setError: (error)=>set({
                error
            }),
        clearRoute: ()=>set({
                currentRoute: null,
                currentSubgraph: null,
                analysisQuery: null
            })
    }));
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
"src/pages/KnowledgeQA/store/chatStore.ts": function (module, exports, __mako_require__){
"use strict";
__mako_require__.d(exports, "__esModule", {
    value: true
});
__mako_require__.d(exports, "useChatStore", {
    enumerable: true,
    get: function() {
        return useChatStore;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _zustand = __mako_require__("node_modules/zustand/esm/index.mjs");
var _middleware = __mako_require__("node_modules/zustand/esm/middleware.mjs");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const createEmptyState = ()=>({
        graphData: null,
        chartOptions: null,
        stats: {},
        riskReport: null,
        riskStages: [],
        riskCommunity: null
    });
const useChatStore = (0, _zustand.create)()((0, _middleware.persist)((set, get)=>({
        sessions: [],
        activeSessionId: null,
        createNewSession: ()=>{
            const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const newSession = {
                id,
                title: '新会话',
                updatedAt: Date.now(),
                messages: [],
                workspaceState: createEmptyState()
            };
            set((state)=>({
                    sessions: [
                        ...state.sessions,
                        newSession
                    ],
                    activeSessionId: id
                }));
            return id;
        },
        switchSession: (id)=>{
            set({
                activeSessionId: id
            });
        },
        deleteSession: (id)=>{
            set((state)=>{
                const remaining = state.sessions.filter((s)=>s.id !== id);
                const nextActive = state.activeSessionId === id ? remaining.length > 0 ? remaining[remaining.length - 1].id : null : state.activeSessionId;
                return {
                    sessions: remaining,
                    activeSessionId: nextActive
                };
            });
        },
        renameSession: (id, title)=>{
            set((state)=>({
                    sessions: state.sessions.map((s)=>s.id === id ? {
                            ...s,
                            title,
                            updatedAt: Date.now()
                        } : s)
                }));
        },
        updateCurrentSession: (updates)=>{
            const { activeSessionId } = get();
            if (!activeSessionId) return;
            set((state)=>({
                    sessions: state.sessions.map((s)=>{
                        if (s.id !== activeSessionId) return s;
                        return {
                            ...s,
                            ...updates.messages !== undefined ? {
                                messages: updates.messages
                            } : {},
                            ...updates.title !== undefined ? {
                                title: updates.title
                            } : {},
                            updatedAt: Date.now(),
                            workspaceState: {
                                ...s.workspaceState,
                                ...updates.workspaceState
                            }
                        };
                    })
                }));
        },
        getActiveSession: ()=>{
            const { sessions, activeSessionId } = get();
            return sessions.find((s)=>s.id === activeSessionId);
        }
    }), {
    name: 'bidakg-chat-history'
}));
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
"src/pages/KnowledgeQA/styles/constants.ts": function (module, exports, __mako_require__){
"use strict";
__mako_require__.d(exports, "__esModule", {
    value: true
});
__mako_require__.d(exports, "DESIGN_TOKENS", {
    enumerable: true,
    get: function() {
        return DESIGN_TOKENS;
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
const DESIGN_TOKENS = {
    // Klein Blue primary
    KLEIN_BLUE: '#002FA7',
    ACCENT: '#2855D1',
    ACCENT_HOVER: '#1A44B5',
    ACCENT_LIGHT: 'rgba(40, 85, 209, 0.08)',
    ACCENT_BORDER: 'rgba(40, 85, 209, 0.2)',
    ACCENT_SHADOW: '0 4px 16px rgba(40, 85, 209, 0.25)',
    // Background
    BG_CANVAS: '#F7F9FC',
    BG_SURFACE: '#FFFFFF',
    BG_HOVER: '#F1F5F9',
    BG_ELEVATED: '#FFFFFF',
    // Text
    TEXT_PRIMARY: '#0F172A',
    TEXT_SECONDARY: '#475569',
    TEXT_MUTED: '#94A3B8',
    // Border
    BORDER_DEFAULT: '#E2E8F0',
    BORDER_LIGHT: '#F1F5F9',
    // Emerald / Success
    ACCENT_EMERALD: '#10B981',
    EMERALD_LIGHT: 'rgba(16, 185, 129, 0.08)',
    EMERALD_BORDER: 'rgba(16, 185, 129, 0.25)',
    // Warning
    ACCENT_WARNING: '#F59E0B',
    WARNING_LIGHT: 'rgba(245, 158, 11, 0.08)',
    // Error
    COLOR_ERROR: '#EF4444',
    ERROR_LIGHT: 'rgba(239, 68, 68, 0.08)',
    ERROR_BORDER: 'rgba(239, 68, 68, 0.15)',
    // Purple (for KG actions)
    ACCENT_PURPLE: '#7C3AED',
    PURPLE_LIGHT: 'rgba(124, 58, 237, 0.1)',
    // Neutral
    NEUTRAL: '#E8E8E8',
    NEUTRAL_DARK: '#64748B',
    // Shadows
    SHADOW_SM: '0 1px 2px rgba(15, 23, 42, 0.04)',
    SHADOW_MD: '0 4px 12px rgba(15, 23, 42, 0.06)',
    SHADOW_CARD: '0 2px 8px rgba(15, 23, 42, 0.06)',
    SHADOW_GLOW: '0 0 24px rgba(40, 85, 209, 0.12)',
    SHADOW_ACCENT: '0 4px 12px rgba(40, 85, 209, 0.3)',
    // Glass
    GLASS_BG: 'rgba(255, 255, 255, 0.85)',
    GLASS_BLUR: 'blur(16px)',
    GLASS_BORDER: '1px solid rgba(255, 255, 255, 0.6)',
    // Radius
    RADIUS_SM: 8,
    RADIUS_MD: 12,
    RADIUS_LG: 16,
    RADIUS_XL: 20,
    // Font
    FONT_FAMILY: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
    FONT_MONO: "'Monaco', 'Consolas', monospace"
};
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
//# sourceMappingURL=p__KnowledgeQA__index-async.js.map