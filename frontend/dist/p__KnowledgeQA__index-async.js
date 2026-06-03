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
var _g6pc = _interop_require_default._(_export_star._(__mako_require__("node_modules/@antv/g6-pc/es/index.js"), exports));
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
    },
    sendUnifiedStream: function() {
        return sendUnifiedStream;
    }
});
var _interop_require_default = __mako_require__("@swc/helpers/_/_interop_require_default");
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _axios = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
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
                if (callbacks.onStage) {
                    // New structured format with machine-readable stage_id
                    if (data.stage_id) callbacks.onStage({
                        stage_id: data.stage_id,
                        stage_name: data.stage_name || '',
                        stage_index: data.stage_index ?? 0,
                        total_stages: data.total_stages ?? 5,
                        agent: data.agent || '',
                        agent_action: data.agent_action || '',
                        progress: data.progress ?? 0,
                        timestamp: data.timestamp || Date.now(),
                        status: data.progress !== undefined && data.progress >= 1.0 ? 'done' : 'running',
                        trace: data.trace
                    });
                    else if (data.content) // Backward-compat: old string-format stages
                    callbacks.onStage(data.content);
                }
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
        es.addEventListener('entity_stats', (e)=>{
            try {
                var _stats_top_entities, _callbacks_onEntityStats;
                const stats = JSON.parse(e.data);
                console.groupCollapsed(`%c[SSE-Graph] 实体统计 %c${stats.total_entities}个实体 %c${Object.keys(stats.entity_type_counts).length}种类型`, 'color:#2855D1;font-weight:bold', 'color:#1890ff', 'color:#8c8c8c');
                console.log('类型分布:', stats.entity_type_counts);
                console.table((_stats_top_entities = stats.top_entities) === null || _stats_top_entities === void 0 ? void 0 : _stats_top_entities.map((e)=>({
                        名称: e.name,
                        类型: e.type,
                        ID: e.id
                    })));
                console.groupEnd();
                (_callbacks_onEntityStats = callbacks.onEntityStats) === null || _callbacks_onEntityStats === void 0 || _callbacks_onEntityStats.call(callbacks, stats);
            } catch (err) {
                console.error('[SSE] entity_stats parse error:', err);
            }
        });
        es.addEventListener('community', (e)=>{
            try {
                var _info_communities, _info_communities1, _callbacks_onCommunity;
                const info = JSON.parse(e.data);
                console.groupCollapsed(`%c[SSE-Graph] 群体发现 %c${((_info_communities = info.communities) === null || _info_communities === void 0 ? void 0 : _info_communities.length) || 0}个群体 %c算法:${info.algorithm}`, 'color:#722ed1;font-weight:bold', 'color:#a855f7', 'color:#8c8c8c');
                if (((_info_communities1 = info.communities) === null || _info_communities1 === void 0 ? void 0 : _info_communities1.length) > 0) console.table(info.communities.map((c)=>{
                    var _c_members;
                    return {
                        '群体ID': c.community_id,
                        '成员数': c.size,
                        '成员(前5)': ((_c_members = c.members) === null || _c_members === void 0 ? void 0 : _c_members.slice(0, 5).map((m)=>m.name).join(', ')) ?? ''
                    };
                }));
                console.groupEnd();
                (_callbacks_onCommunity = callbacks.onCommunity) === null || _callbacks_onCommunity === void 0 || _callbacks_onCommunity.call(callbacks, info);
            } catch (err) {
                console.error('[SSE] community parse error:', err);
            }
        });
        es.addEventListener('entity_community_map', (e)=>{
            try {
                var _map_entities, _map_entities1, _callbacks_onEntityCommunityMap;
                const map = JSON.parse(e.data);
                console.groupCollapsed(`%c[SSE-Graph] 实体→群体映射 %c${((_map_entities = map.entities) === null || _map_entities === void 0 ? void 0 : _map_entities.length) || 0}个实体 %c${map.unmapped_count || 0}个未归属`, 'color:#eb2f96;font-weight:bold', 'color:#f759ab', 'color:#8c8c8c');
                if (((_map_entities1 = map.entities) === null || _map_entities1 === void 0 ? void 0 : _map_entities1.length) > 0) {
                    console.table(map.entities.map((e)=>{
                        var _e_communities, _e_communities1;
                        return {
                            '实体名称': e.name,
                            '类型': e.type,
                            '所属群体数': ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) || 0,
                            '群体(角色)': ((_e_communities1 = e.communities) === null || _e_communities1 === void 0 ? void 0 : _e_communities1.map((c)=>`#${c.community_id}(${c.role},${c.size}成员)`).join(' | ')) || '无'
                        };
                    }));
                    const bridges = map.entities.filter((e)=>{
                        var _e_communities;
                        return ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) >= 2;
                    });
                    if (bridges.length > 0) console.log('%c桥接实体 (≥2个群体):', 'color:#fa8c16;font-weight:bold', bridges.map((e)=>e.name));
                    const unmapped = map.entities.filter((e)=>{
                        var _e_communities;
                        return ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) === 0;
                    });
                    if (unmapped.length > 0) console.log('%c未归属实体:', 'color:#8c8c8c', unmapped.map((e)=>e.name));
                }
                console.groupEnd();
                (_callbacks_onEntityCommunityMap = callbacks.onEntityCommunityMap) === null || _callbacks_onEntityCommunityMap === void 0 || _callbacks_onEntityCommunityMap.call(callbacks, map);
            } catch (err) {
                console.error('[SSE] entity_community_map parse error:', err);
            }
        });
        es.addEventListener('reasoning', (e)=>{
            try {
                var _callbacks_onReasoning;
                const data = JSON.parse(e.data);
                (_callbacks_onReasoning = callbacks.onReasoning) === null || _callbacks_onReasoning === void 0 || _callbacks_onReasoning.call(callbacks, data);
            } catch (err) {
                console.error('[SSE] reasoning parse error:', err);
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
            doneFired = true;
            es === null || es === void 0 || es.close();
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
    const body = JSON.stringify({
        query: req.query,
        sessionId: req.sessionId,
        roundId: req.roundId,
        communityId: req.communityId ?? null,
        maxHop: req.maxHop ?? 3,
        focusEntities: req.focusEntities ?? [],
        fileContent: req.fileContent ?? null
    });
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
            const resp = await fetch('/api/v1/chat/risk-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body,
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
                            } else if (ev === 'entity_stats') {
                                var _stats_top_entities, _callbacks_onEntityStats;
                                const stats = JSON.parse(raw);
                                console.groupCollapsed(`%c[RiskSSE] 实体统计 %c${stats.total_entities}个实体 %c${Object.keys(stats.entity_type_counts).length}种类型`, 'color:#2855D1;font-weight:bold', 'color:#1890ff', 'color:#8c8c8c');
                                console.log('类型分布:', stats.entity_type_counts);
                                console.table((_stats_top_entities = stats.top_entities) === null || _stats_top_entities === void 0 ? void 0 : _stats_top_entities.map((e)=>({
                                        名称: e.name,
                                        类型: e.type,
                                        ID: e.id
                                    })));
                                console.groupEnd();
                                (_callbacks_onEntityStats = callbacks.onEntityStats) === null || _callbacks_onEntityStats === void 0 || _callbacks_onEntityStats.call(callbacks, stats);
                            } else if (ev === 'community') {
                                var _info_communities, _info_communities1, _callbacks_onCommunity;
                                const info = JSON.parse(raw);
                                console.groupCollapsed(`%c[RiskSSE] 群体发现 %c${((_info_communities = info.communities) === null || _info_communities === void 0 ? void 0 : _info_communities.length) || 0}个群体 %c算法:${info.algorithm}`, 'color:#722ed1;font-weight:bold', 'color:#a855f7', 'color:#8c8c8c');
                                if (((_info_communities1 = info.communities) === null || _info_communities1 === void 0 ? void 0 : _info_communities1.length) > 0) {
                                    var _info_communities__members, _info_communities_;
                                    console.table(info.communities.map((c)=>{
                                        var _c_modularity, _c_members;
                                        return {
                                            '群体ID': c.community_id,
                                            '成员数': c.size,
                                            '模块度': ((_c_modularity = c.modularity) === null || _c_modularity === void 0 ? void 0 : _c_modularity.toFixed(4)) ?? '-',
                                            '成员(前5)': ((_c_members = c.members) === null || _c_members === void 0 ? void 0 : _c_members.slice(0, 5).map((m)=>m.name).join(', ')) ?? ''
                                        };
                                    }));
                                    if (((_info_communities_ = info.communities[0]) === null || _info_communities_ === void 0 ? void 0 : (_info_communities__members = _info_communities_.members) === null || _info_communities__members === void 0 ? void 0 : _info_communities__members.length) > 0) console.log(`群体#0 全部成员 (${info.communities[0].members.length}):`, info.communities[0].members.map((m)=>`${m.name}(${m.type})`));
                                }
                                console.groupEnd();
                                (_callbacks_onCommunity = callbacks.onCommunity) === null || _callbacks_onCommunity === void 0 || _callbacks_onCommunity.call(callbacks, info);
                            } else if (ev === 'entity_community_map') {
                                var _map_entities, _map_entities1, _callbacks_onEntityCommunityMap;
                                const map = JSON.parse(raw);
                                console.groupCollapsed(`%c[RiskSSE] 实体→群体映射 %c${((_map_entities = map.entities) === null || _map_entities === void 0 ? void 0 : _map_entities.length) || 0}个实体 %c${map.unmapped_count || 0}个未归属`, 'color:#eb2f96;font-weight:bold', 'color:#f759ab', 'color:#8c8c8c');
                                if (((_map_entities1 = map.entities) === null || _map_entities1 === void 0 ? void 0 : _map_entities1.length) > 0) {
                                    const rows = map.entities.map((e)=>{
                                        var _e_communities, _e_communities1;
                                        return {
                                            '实体名称': e.name,
                                            '类型': e.type,
                                            '所属群体数': ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) || 0,
                                            '群体(角色)': ((_e_communities1 = e.communities) === null || _e_communities1 === void 0 ? void 0 : _e_communities1.map((c)=>`#${c.community_id}(${c.role},${c.size}成员)`).join(' | ')) || '无'
                                        };
                                    });
                                    console.table(rows);
                                    const bridges = map.entities.filter((e)=>{
                                        var _e_communities;
                                        return ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) >= 2;
                                    });
                                    if (bridges.length > 0) console.log('%c桥接实体 (≥2个群体):', 'color:#fa8c16;font-weight:bold', bridges.map((e)=>e.name));
                                    const unmapped = map.entities.filter((e)=>{
                                        var _e_communities;
                                        return ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) === 0;
                                    });
                                    if (unmapped.length > 0) console.log('%c未归属实体:', 'color:#8c8c8c', unmapped.map((e)=>e.name));
                                }
                                console.groupEnd();
                                (_callbacks_onEntityCommunityMap = callbacks.onEntityCommunityMap) === null || _callbacks_onEntityCommunityMap === void 0 || _callbacks_onEntityCommunityMap.call(callbacks, map);
                            } else if (ev === 'risk_paths') {
                                var _callbacks_onRiskPaths;
                                (_callbacks_onRiskPaths = callbacks.onRiskPaths) === null || _callbacks_onRiskPaths === void 0 || _callbacks_onRiskPaths.call(callbacks, JSON.parse(raw));
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
const sendUnifiedStream = (req, callbacks)=>{
    const body = JSON.stringify({
        query: req.query,
        fileContent: req.fileContent ?? null,
        sessionId: req.sessionId,
        roundId: req.roundId,
        maxHop: req.maxHop ?? 3,
        intentHint: req.intentHint ?? null
    });
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
            const resp = await fetch('/api/v1/chat/unified-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body,
                signal: abortController.signal
            });
            if (!resp.ok) throw new Error(`Unified stream failed: ${resp.status}`);
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
                            const data = JSON.parse(raw);
                            switch(ev){
                                case 'stage':
                                    var _callbacks_onStage;
                                    (_callbacks_onStage = callbacks.onStage) === null || _callbacks_onStage === void 0 || _callbacks_onStage.call(callbacks, data.stage || data.stage_name || '', data);
                                    break;
                                case 'entities':
                                    var _callbacks_onEntities;
                                    (_callbacks_onEntities = callbacks.onEntities) === null || _callbacks_onEntities === void 0 || _callbacks_onEntities.call(callbacks, data.data || data);
                                    break;
                                case 'subgraph':
                                    var _callbacks_onSubgraph;
                                    (_callbacks_onSubgraph = callbacks.onSubgraph) === null || _callbacks_onSubgraph === void 0 || _callbacks_onSubgraph.call(callbacks, data.data || data);
                                    break;
                                case 'entity_stats':
                                    var _callbacks_onEntityStats;
                                    (_callbacks_onEntityStats = callbacks.onEntityStats) === null || _callbacks_onEntityStats === void 0 || _callbacks_onEntityStats.call(callbacks, data.data || data);
                                    break;
                                case 'community':
                                    var _callbacks_onCommunity;
                                    (_callbacks_onCommunity = callbacks.onCommunity) === null || _callbacks_onCommunity === void 0 || _callbacks_onCommunity.call(callbacks, data.data || data);
                                    break;
                                case 'entity_community_map':
                                    var _callbacks_onEntityCommunityMap;
                                    (_callbacks_onEntityCommunityMap = callbacks.onEntityCommunityMap) === null || _callbacks_onEntityCommunityMap === void 0 || _callbacks_onEntityCommunityMap.call(callbacks, data.data || data);
                                    break;
                                case 'candidate_risk_paths':
                                    var _callbacks_onCandidateRiskPaths;
                                    (_callbacks_onCandidateRiskPaths = callbacks.onCandidateRiskPaths) === null || _callbacks_onCandidateRiskPaths === void 0 || _callbacks_onCandidateRiskPaths.call(callbacks, data.data || data);
                                    break;
                                case 'risk_paths':
                                    var _callbacks_onRiskPaths;
                                    (_callbacks_onRiskPaths = callbacks.onRiskPaths) === null || _callbacks_onRiskPaths === void 0 || _callbacks_onRiskPaths.call(callbacks, data.data || data);
                                    break;
                                case 'anomaly_findings':
                                    var _callbacks_onAnomalyFindings;
                                    (_callbacks_onAnomalyFindings = callbacks.onAnomalyFindings) === null || _callbacks_onAnomalyFindings === void 0 || _callbacks_onAnomalyFindings.call(callbacks, data.data || data);
                                    break;
                                case 'compliance':
                                    var _callbacks_onCompliance;
                                    (_callbacks_onCompliance = callbacks.onCompliance) === null || _callbacks_onCompliance === void 0 || _callbacks_onCompliance.call(callbacks, data.data || data);
                                    break;
                                case 'compliance_scores':
                                    var _callbacks_onComplianceScores;
                                    (_callbacks_onComplianceScores = callbacks.onComplianceScores) === null || _callbacks_onComplianceScores === void 0 || _callbacks_onComplianceScores.call(callbacks, data.data || data);
                                    break;
                                case 'compliance_indicators':
                                    var _callbacks_onComplianceIndicators;
                                    (_callbacks_onComplianceIndicators = callbacks.onComplianceIndicators) === null || _callbacks_onComplianceIndicators === void 0 || _callbacks_onComplianceIndicators.call(callbacks, data.data || data);
                                    break;
                                case 'scoring':
                                    var _callbacks_onScoring;
                                    (_callbacks_onScoring = callbacks.onScoring) === null || _callbacks_onScoring === void 0 || _callbacks_onScoring.call(callbacks, data.data || data);
                                    break;
                                case 'governance':
                                    var _callbacks_onGovernance;
                                    (_callbacks_onGovernance = callbacks.onGovernance) === null || _callbacks_onGovernance === void 0 || _callbacks_onGovernance.call(callbacks, data.data || data);
                                    break;
                                case 'agent_trace':
                                    var _callbacks_onAgentTrace;
                                    (_callbacks_onAgentTrace = callbacks.onAgentTrace) === null || _callbacks_onAgentTrace === void 0 || _callbacks_onAgentTrace.call(callbacks, data.data || data);
                                    break;
                                case 'report':
                                    var _callbacks_onReport;
                                    doneFired = true;
                                    (_callbacks_onReport = callbacks.onReport) === null || _callbacks_onReport === void 0 || _callbacks_onReport.call(callbacks, data.data || data);
                                    break;
                                case 'done':
                                    var _callbacks_onDone;
                                    if (!doneFired) (_callbacks_onDone = callbacks.onDone) === null || _callbacks_onDone === void 0 || _callbacks_onDone.call(callbacks, data.data || data);
                                    break;
                                case 'error':
                                    var _data_data, _callbacks_onError;
                                    (_callbacks_onError = callbacks.onError) === null || _callbacks_onError === void 0 || _callbacks_onError.call(callbacks, data.error || ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.error) || 'Unified stream error');
                                    break;
                            }
                        } catch (parseErr) {
                            console.error('[UnifiedSSE] parse error:', parseErr, raw);
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            retryCount++;
            if (retryCount < maxRetries && !aborted) {
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
                console.warn(`[UnifiedSSE] Retrying in ${delay}ms (${retryCount}/${maxRetries})...`);
                await new Promise((r)=>setTimeout(r, delay));
                connect();
            } else {
                var _callbacks_onError1;
                (_callbacks_onError1 = callbacks.onError) === null || _callbacks_onError1 === void 0 || _callbacks_onError1.call(callbacks, err.message || 'Unified stream connection failed');
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
"src/pages/KnowledgeQA/components/AgentTracePanel.tsx": function (module, exports, __mako_require__){
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
const { Text, Paragraph } = _antd.Typography;
const AGENT_COLORS = {
    intent_agent: '#2855D1',
    probe: '#722ed1',
    planner: '#722ed1',
    compiler: '#fa8c16',
    verifier: '#52c41a',
    risk_analyst: '#f5222d',
    compliance: '#722ed1',
    scoring: '#fa8c16',
    governance: '#52c41a',
    reporter: '#2855D1'
};
const AGENT_LABELS = {
    intent_agent: '意图识别',
    probe: '探查',
    planner: '规划',
    compiler: '编译',
    verifier: '验证',
    risk_analyst: '风险分析',
    compliance: '合规匹配',
    scoring: '风险评分',
    governance: '治理方案',
    reporter: '报告生成'
};
const AgentTracePanel = ({ traces, visible, onClose, onClear })=>{
    _s();
    const [expandedKeys, setExpandedKeys] = (0, _react.useState)([]);
    const groupedTraces = (0, _react.useMemo)(()=>{
        const groups = {};
        for (const trace of traces){
            if (!groups[trace.agent]) groups[trace.agent] = [];
            groups[trace.agent].push(trace);
        }
        return groups;
    }, [
        traces
    ]);
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
        title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            },
            children: [
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BugOutlined, {
                            style: {
                                marginRight: 8,
                                color: '#fa8c16'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                            lineNumber: 80,
                            columnNumber: 13
                        }, void 0),
                        "Agent 调试日志",
                        traces.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                            style: {
                                marginLeft: 8,
                                borderRadius: 10
                            },
                            children: traces.length
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                            lineNumber: 83,
                            columnNumber: 15
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                    lineNumber: 79,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                    size: 4,
                    children: [
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                            title: "清空日志",
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                size: "small",
                                type: "text",
                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClearOutlined, {}, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                    lineNumber: 91,
                                    columnNumber: 23
                                }, void 0),
                                onClick: onClear,
                                disabled: traces.length === 0
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 88,
                                columnNumber: 15
                            }, void 0)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                            lineNumber: 87,
                            columnNumber: 13
                        }, void 0),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                            title: "关闭",
                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                size: "small",
                                type: "text",
                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseOutlined, {}, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                    lineNumber: 97,
                                    columnNumber: 54
                                }, void 0),
                                onClick: onClose
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 97,
                                columnNumber: 15
                            }, void 0)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                            lineNumber: 96,
                            columnNumber: 13
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                    lineNumber: 86,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
            lineNumber: 78,
            columnNumber: 9
        }, void 0),
        open: visible,
        onClose: onClose,
        width: 480,
        placement: "right",
        styles: {
            body: {
                padding: '12px 16px'
            }
        },
        children: traces.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
            image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
            description: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                type: "secondary",
                children: "暂无 Agent 调试日志，发送查询后自动采集"
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                lineNumber: 111,
                columnNumber: 24
            }, void 0)
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
            lineNumber: 109,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Collapse, {
            size: "small",
            activeKey: expandedKeys,
            onChange: (keys)=>setExpandedKeys(Array.isArray(keys) ? keys : [
                    keys
                ]),
            expandIcon: ({ isActive })=>isActive ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.DownOutlined, {}, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                    lineNumber: 118,
                    columnNumber: 53
                }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RightOutlined, {}, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                    lineNumber: 118,
                    columnNumber: 72
                }, void 0),
            items: Object.entries(groupedTraces).map(([agent, entries])=>({
                    key: agent,
                    label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: AGENT_COLORS[agent] || '#94a3b8'
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 123,
                                columnNumber: 17
                            }, void 0),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                strong: true,
                                style: {
                                    fontSize: 13
                                },
                                children: AGENT_LABELS[agent] || agent
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 131,
                                columnNumber: 17
                            }, void 0),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                style: {
                                    borderRadius: 10,
                                    fontSize: 10,
                                    margin: 0
                                },
                                children: entries.length
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 134,
                                columnNumber: 17
                            }, void 0)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                        lineNumber: 122,
                        columnNumber: 15
                    }, void 0),
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        },
                        children: entries.map((entry, idx)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    padding: '8px 10px',
                                    background: '#f8fafc',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0'
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
                                                    fontSize: 12,
                                                    color: '#1e293b'
                                                },
                                                children: entry.step
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                                lineNumber: 150,
                                                columnNumber: 23
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                type: "secondary",
                                                style: {
                                                    fontSize: 10
                                                },
                                                children: new Date(entry.timestamp).toLocaleTimeString()
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                                lineNumber: 151,
                                                columnNumber: 23
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                        lineNumber: 149,
                                        columnNumber: 21
                                    }, void 0),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Paragraph, {
                                        ellipsis: {
                                            rows: 2,
                                            expandable: true
                                        },
                                        style: {
                                            fontSize: 11,
                                            color: '#475569',
                                            marginBottom: 4
                                        },
                                        children: entry.summary
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                        lineNumber: 155,
                                        columnNumber: 21
                                    }, void 0),
                                    entry.metrics && Object.keys(entry.metrics).length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Collapse, {
                                        size: "small",
                                        ghost: true,
                                        items: [
                                            {
                                                key: `metrics-${idx}`,
                                                label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    style: {
                                                        fontSize: 10,
                                                        color: '#94a3b8'
                                                    },
                                                    children: "指标详情"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                                    lineNumber: 167,
                                                    columnNumber: 34
                                                }, void 0),
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("pre", {
                                                    style: {
                                                        fontSize: 10,
                                                        background: '#1e293b',
                                                        color: '#e2e8f0',
                                                        padding: 8,
                                                        borderRadius: 4,
                                                        overflow: 'auto',
                                                        maxHeight: 200,
                                                        margin: 0
                                                    },
                                                    children: JSON.stringify(entry.metrics, null, 2)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 29
                                                }, void 0)
                                            }
                                        ]
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                        lineNumber: 162,
                                        columnNumber: 23
                                    }, void 0)
                                ]
                            }, idx, true, {
                                fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                                lineNumber: 140,
                                columnNumber: 19
                            }, void 0))
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
                        lineNumber: 138,
                        columnNumber: 15
                    }, void 0)
                }))
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
            lineNumber: 114,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/AgentTracePanel.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
};
_s(AgentTracePanel, "smp1C/wssgrP3BrzGeoWJZBbln4=");
_c = AgentTracePanel;
var _default = AgentTracePanel;
var _c;
$RefreshReg$(_c, "AgentTracePanel");
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
"src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx": function (module, exports, __mako_require__){
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
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _echartsforreact = _interop_require_default._(__mako_require__("node_modules/echarts-for-react/esm/index.js"));
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
const L1_STYLE = {
    '数据合规性': {
        color: '#1677ff',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.DatabaseOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
            lineNumber: 66,
            columnNumber: 38
        }, this)
    },
    '算法合规性': {
        color: '#722ed1',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.AuditOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
            lineNumber: 67,
            columnNumber: 38
        }, this)
    },
    '内容合规性': {
        color: '#13a8a8',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {}, void 0, false, {
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
const ComplianceAnalysisPanel = ({ report, currentSubgraph, isLoading, onJumpToGraph, complianceIndicators })=>{
    _s();
    const [subjectiveMap, setSubjectiveMap] = (0, _react.useState)({});
    const [draftSubjectiveMap, setDraftSubjectiveMap] = (0, _react.useState)({});
    const [weights, setWeights] = (0, _react.useState)(DEFAULT_WEIGHTS);
    const [chartsExpanded, setChartsExpanded] = (0, _react.useState)(true);
    const [isMaximized, setIsMaximized] = (0, _react.useState)(false);
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
    const confirmSubjectiveDraft = (0, _react.useCallback)(()=>{
        setSubjectiveMap((prev)=>({
                ...prev,
                ...draftSubjectiveMap
            }));
        setDraftSubjectiveMap({});
    }, [
        draftSubjectiveMap
    ]);
    const cancelSubjectiveDraft = (0, _react.useCallback)(()=>{
        setDraftSubjectiveMap({});
    }, []);
    const draftSubjectiveCount = Object.keys(draftSubjectiveMap).length;
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
    const l2RadarOptions = (0, _react.useMemo)(()=>hierarchy.map((l1)=>{
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
                        return (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
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
                    if (record.level === 2) return (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    return (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: record.evidence,
                        children: (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    return (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                        percent: Math.round(v),
                        size: "small",
                        strokeColor: getScoreColor(v),
                        format: ()=>(0, _jsxdevruntime.jsxDEV)("span", {
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
                    return (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
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
                            hasDraft && (0, _jsxdevruntime.jsxDEV)("span", {
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
                render: (v, record)=>(0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minWidth: 70,
                            whiteSpace: 'nowrap'
                        },
                        children: [
                            record.level <= 2 && (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
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
                            (0, _jsxdevruntime.jsxDEV)(Text, {
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
    if (!report && !isLoading) return (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        children: (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
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
    const panelContent = (0, _jsxdevruntime.jsxDEV)("div", {
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
            (0, _jsxdevruntime.jsxDEV)("section", {
                style: {
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 14,
                    flexShrink: 0
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 12
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                        type: "circle",
                                        percent: Math.round(overallScore),
                                        size: 72,
                                        strokeColor: getScoreColor(overallScore),
                                        format: (p)=>(0, _jsxdevruntime.jsxDEV)("span", {
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
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
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
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
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        children: (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            },
                                            children: [
                                                (0, _jsxdevruntime.jsxDEV)(Title, {
                                                    level: 5,
                                                    style: {
                                                        margin: 0,
                                                        fontSize: 15
                                                    },
                                                    children: [
                                                        (0, _jsxdevruntime.jsxDEV)(_icons.SafetyCertificateOutlined, {
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
                                                (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    type: "text",
                                                    icon: isMaximized ? (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenExitOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                        lineNumber: 680,
                                                        columnNumber: 39
                                                    }, void 0) : (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenOutlined, {}, void 0, false, {
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
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    gap: 24,
                                    alignItems: 'center'
                                },
                                children: hierarchy.map((l1, idx)=>(0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(Text, {
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
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                children: (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            marginTop: 12,
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0'
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    gap: 6,
                                    flexWrap: 'wrap',
                                    marginBottom: 10
                                },
                                children: WEIGHT_PRESETS.map((preset)=>{
                                    const active = weights.join('/') === preset.values.join('/');
                                    return (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
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
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: 14
                                },
                                children: hierarchy.map((l1, idx)=>{
                                    var _L1_STYLE_l1_name;
                                    return (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '52px minmax(92px, 1fr) 78px',
                                            alignItems: 'center',
                                            gap: 8
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
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
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Slider, {
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
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
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
                                                    (0, _jsxdevruntime.jsxDEV)(Text, {
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
            (0, _jsxdevruntime.jsxDEV)("section", {
                style: {
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    flexShrink: 0
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: chartsExpanded ? 4 : 0,
                            cursor: 'pointer'
                        },
                        onClick: ()=>setChartsExpanded(!chartsExpanded),
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_icons.BarChartOutlined, {
                                style: {
                                    color: '#1677ff'
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 755,
                                columnNumber: 11
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)(Text, {
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
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    flex: 1
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 757,
                                columnNumber: 11
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)(Text, {
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
                    chartsExpanded && (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    gap: 12,
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                        option: radarOption,
                                        style: {
                                            height: 176,
                                            minWidth: 220,
                                            flex: '1 1 260px'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 763,
                                        columnNumber: 15
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                        option: barOption,
                                        style: {
                                            height: 176,
                                            minWidth: 240,
                                            flex: '1.1 1 280px'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 764,
                                        columnNumber: 15
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)("div", {
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
                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                type: "secondary",
                                                style: {
                                                    fontSize: 11,
                                                    textAlign: 'right'
                                                },
                                                children: "评分等级"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                lineNumber: 775,
                                                columnNumber: 17
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 4
                                                },
                                                children: SCORE_LEVELS.map((item)=>(0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end',
                                                            gap: 5
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    width: 7,
                                                                    height: 7,
                                                                    borderRadius: 2,
                                                                    background: item.color,
                                                                    flexShrink: 0
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 779,
                                                                columnNumber: 23
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                style: {
                                                                    fontSize: 10,
                                                                    color: '#475569',
                                                                    lineHeight: '14px'
                                                                },
                                                                children: item.label
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 780,
                                                                columnNumber: 23
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 10,
                                                                    lineHeight: '14px'
                                                                },
                                                                children: item.range
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                                lineNumber: 781,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, item.label, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                        lineNumber: 778,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                lineNumber: 776,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 765,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 762,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                    gap: 12,
                                    marginTop: 10
                                },
                                children: l2RadarOptions.map((item)=>(0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            minHeight: 190,
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            background: '#fbfdff',
                                            padding: '8px 10px 4px'
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    marginBottom: 2
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("span", {
                                                        style: {
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: 8,
                                                            background: item.color
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                        lineNumber: 800,
                                                        columnNumber: 21
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        strong: true,
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: [
                                                            item.title,
                                                            "二级指标对比"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                        lineNumber: 801,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                lineNumber: 799,
                                                columnNumber: 19
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)(_echartsforreact.default, {
                                                option: item.option,
                                                style: {
                                                    height: 166,
                                                    width: '100%'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                                lineNumber: 803,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.key, true, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 789,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 787,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                lineNumber: 750,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)("section", {
                style: {
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 12,
                    flex: '0 0 auto',
                    minHeight: 0,
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column'
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            marginBottom: 8,
                            flexWrap: 'wrap'
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                strong: true,
                                style: {
                                    fontSize: 13,
                                    display: 'block',
                                    flexShrink: 0
                                },
                                children: [
                                    "指标评分明细 ",
                                    scoredIndicators.length,
                                    " 个三级指标"
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 817,
                                columnNumber: 11
                            }, this),
                            draftSubjectiveCount > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 6px',
                                    borderRadius: 6,
                                    background: '#fff7e6',
                                    border: '1px solid #ffd591'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                        style: {
                                            fontSize: 12,
                                            color: '#ad6800'
                                        },
                                        children: [
                                            draftSubjectiveCount,
                                            " 项主观修正待确认"
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 822,
                                        columnNumber: 15
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        type: "primary",
                                        onClick: confirmSubjectiveDraft,
                                        style: {
                                            height: 24,
                                            fontSize: 12
                                        },
                                        children: "确认应用"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 823,
                                        columnNumber: 15
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        size: "small",
                                        onClick: cancelSubjectiveDraft,
                                        style: {
                                            height: 24,
                                            fontSize: 12
                                        },
                                        children: "撤销"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                        lineNumber: 826,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                                lineNumber: 821,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 816,
                        columnNumber: 9
                    }, this),
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            minHeight: 0,
                            overflowX: 'auto',
                            overflowY: 'visible'
                        },
                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                            size: "small",
                            rowKey: "key",
                            columns: treeColumns,
                            dataSource: treeData,
                            pagination: false,
                            defaultExpandAllRows: true,
                            sticky: true,
                            tableLayout: "fixed",
                            scroll: {
                                x: TABLE_SCROLL_X
                            },
                            rowClassName: (record)=>record.level === 1 ? 'l1-row' : '',
                            onRow: (record)=>{
                                if (record.level === 1) return {};
                                return {};
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                            lineNumber: 833,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                        lineNumber: 832,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                lineNumber: 812,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
        lineNumber: 650,
        columnNumber: 5
    }, this);
    if (isMaximized) return (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
        children: [
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1040,
                    background: 'rgba(0,0,0,0.45)'
                },
                onClick: ()=>setIsMaximized(false)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                lineNumber: 859,
                columnNumber: 9
            }, this),
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    position: 'fixed',
                    inset: 24,
                    zIndex: 1050
                },
                children: panelContent
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx",
                lineNumber: 863,
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _g6 = _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
var _axios = _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
var _NodeContextMenu = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/NodeContextMenu.tsx"));
var _GraphToolbar = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/GraphToolbar.tsx"));
var _graphStyles = __mako_require__("src/pages/KnowledgeQA/components/graphStyles.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
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
        fill: '#BAE7FF',
        stroke: '#1677ff',
        size: 34,
        labelOffset: 10
    },
    PERSON: {
        fill: '#D3ADF7',
        stroke: '#722ed1',
        size: 26,
        labelOffset: 8
    },
    EVENT: {
        fill: '#FFA39E',
        stroke: '#cf1322',
        size: 30,
        labelOffset: 10
    },
    SUB_EVENT: {
        fill: '#FFCCC7',
        stroke: '#cf1322',
        size: 20,
        labelOffset: 6
    },
    TIME: {
        fill: '#D9D9D9',
        stroke: '#595959',
        size: 16,
        labelOffset: 5
    },
    RiskFeature: {
        fill: '#B7EB8F',
        stroke: '#389e0d',
        size: 24,
        labelOffset: 8
    },
    RiskFactor: {
        fill: '#95DE64',
        stroke: '#389e0d',
        size: 22,
        labelOffset: 7
    },
    Action: {
        fill: '#D9D9D9',
        stroke: '#595959',
        size: 22,
        labelOffset: 7
    },
    Regulation: {
        fill: '#FFE58F',
        stroke: '#d48806',
        size: 20,
        labelOffset: 6
    },
    Law: {
        fill: '#FFD666',
        stroke: '#d48806',
        size: 18,
        labelOffset: 6
    }
};
const NODE_DEFAULT_VISUAL = {
    fill: '#F5F5F5',
    stroke: '#8c8c8c',
    size: 14,
    labelOffset: 5
};
const RELATION_TEXT = {
    INVEST: '投资',
    GUARANTEE: '担保',
    WORK: '任职',
    CONTROLLER: '控制',
    MENTION: '涉及',
    TRIGGERS: '触发',
    REFLECTS: '反映',
    COMPLIES_WITH: '合规',
    CAUSE: '因果',
    BELONG: '归属',
    TRANSACTION: '交易',
    WARNING: '预警',
    RELATED: '关联'
};
const COMMUNITY_COLORS = [
    '#1890ff',
    '#f5222d',
    '#52c41a',
    '#fa8c16',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#faad14',
    '#2f54eb',
    '#a0d911',
    '#f759ab',
    '#5cdbd3'
];
const COMMUNITY_BG_COLORS = [
    'rgba(24,144,255,0.12)',
    'rgba(245,34,45,0.12)',
    'rgba(82,196,26,0.12)',
    'rgba(250,140,22,0.12)',
    'rgba(114,46,209,0.12)',
    'rgba(19,194,194,0.12)',
    'rgba(235,47,150,0.12)',
    'rgba(250,173,20,0.12)',
    'rgba(47,84,235,0.12)',
    'rgba(160,217,17,0.12)',
    'rgba(247,89,171,0.12)',
    'rgba(92,219,211,0.12)'
];
const getCommunityColor = (communityId)=>{
    const idx = (communityId - 1) % COMMUNITY_COLORS.length;
    return {
        stroke: COMMUNITY_COLORS[idx],
        bg: COMMUNITY_BG_COLORS[idx]
    };
};
const normalizeNeo4jNode = (raw)=>{
    var _rawType_toUpperCase;
    const props = raw.properties || {};
    const labels = raw.labels || [];
    let rawType = raw.type || labels[0] || 'Unknown';
    const type = rawType === 'Company' ? 'COMPANY' : rawType === 'Person' ? 'PERSON' : rawType === 'Event' ? 'EVENT' : rawType === 'Subject' ? 'COMPANY' : rawType === 'Feature' ? 'RiskFeature' : rawType === 'Regulation' ? 'Regulation' : rawType === 'Law' ? 'Law' : VALID_NODE_TYPES.has(rawType) ? rawType : rawType === 'PFCOMPANY' || rawType === 'PFUND' || rawType === 'SECURITY' ? 'COMPANY' : rawType === 'REGULATOR' ? 'EVENT' : ((_rawType_toUpperCase = rawType.toUpperCase) === null || _rawType_toUpperCase === void 0 ? void 0 : _rawType_toUpperCase.call(rawType)) || rawType;
    return {
        id: String(raw.id),
        type,
        entityType: type,
        entity_type: type,
        label: raw.label || props.title || props.name || props.COMPANY_NM || raw.id,
        score: props.score ?? raw.score ?? 1,
        title: props.title || props.name || props.COMPANY_NM || raw.label || raw.id,
        name: props.name || props.COMPANY_NM || props.title || raw.label || raw.id,
        zh_name: props.zh_name || raw.label || props.name,
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
    INVEST: {
        stroke: '#1890ff',
        lineDash: [],
        lineWidth: 2,
        opacity: 0.8
    },
    GUARANTEE: {
        stroke: '#faad14',
        lineDash: [],
        lineWidth: 2,
        opacity: 0.8
    },
    WORK: {
        stroke: '#722ed1',
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    CONTROLLER: {
        stroke: '#722ed1',
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    MENTION: {
        stroke: '#f5222d',
        lineDash: [],
        lineWidth: 2,
        opacity: 0.8
    },
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
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    CAUSE: {
        stroke: '#fa541c',
        lineDash: [],
        lineWidth: 1.5,
        opacity: 0.7
    },
    BELONG: {
        stroke: '#52c41a',
        lineDash: [],
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
const PATH_EDGE_KEY_SEP = '->';
const assignReadablePositions = (nodes, edges)=>{
    var _nodes_slice_sort_, _center_style, _center_style1, _center_style2;
    if (nodes.length === 0) return;
    const adjacency = new Map();
    const relationMap = new Map();
    nodes.forEach((node)=>adjacency.set(node.id, new Set()));
    edges.forEach((edge)=>{
        var _adjacency_get, _adjacency_get1;
        const source = String(edge.source);
        const target = String(edge.target);
        (_adjacency_get = adjacency.get(source)) === null || _adjacency_get === void 0 || _adjacency_get.add(target);
        (_adjacency_get1 = adjacency.get(target)) === null || _adjacency_get1 === void 0 || _adjacency_get1.add(source);
        relationMap.set(`${source}${PATH_EDGE_KEY_SEP}${target}`, edge.relation || '');
        relationMap.set(`${target}${PATH_EDGE_KEY_SEP}${source}`, edge.relation || '');
    });
    const centerId = (_nodes_slice_sort_ = nodes.slice().sort((a, b)=>{
        var _adjacency_get, _adjacency_get1;
        const degreeDiff = (((_adjacency_get = adjacency.get(b.id)) === null || _adjacency_get === void 0 ? void 0 : _adjacency_get.size) || 0) - (((_adjacency_get1 = adjacency.get(a.id)) === null || _adjacency_get1 === void 0 ? void 0 : _adjacency_get1.size) || 0);
        if (degreeDiff !== 0) return degreeDiff;
        if (a._type === 'COMPANY' && b._type !== 'COMPANY') return -1;
        if (b._type === 'COMPANY' && a._type !== 'COMPANY') return 1;
        return String(a.label).localeCompare(String(b.label), 'zh-CN');
    })[0]) === null || _nodes_slice_sort_ === void 0 ? void 0 : _nodes_slice_sort_.id;
    const center = nodes.find((node)=>node.id === centerId) || nodes[0];
    center.x = 0;
    center.y = 0;
    center.size = Math.max(Number(center.size) || 0, 72);
    center.style = {
        ...center.style || {},
        lineWidth: Math.max(Number((_center_style = center.style) === null || _center_style === void 0 ? void 0 : _center_style.lineWidth) || 0, 4),
        shadowBlur: Math.max(Number((_center_style1 = center.style) === null || _center_style1 === void 0 ? void 0 : _center_style1.shadowBlur) || 0, 14),
        shadowColor: ((_center_style2 = center.style) === null || _center_style2 === void 0 ? void 0 : _center_style2.shadowColor) || 'rgba(40, 85, 209, 0.28)'
    };
    const centerNeighbors = new Set(adjacency.get(center.id) || []);
    const ringNodes = nodes.filter((node)=>node.id !== center.id).sort((a, b)=>{
        const relationA = relationMap.get(`${center.id}${PATH_EDGE_KEY_SEP}${a.id}`) || 'ZZZ';
        const relationB = relationMap.get(`${center.id}${PATH_EDGE_KEY_SEP}${b.id}`) || 'ZZZ';
        const relationOrder = [
            'INVEST',
            'MENTION',
            'WORK',
            'REFLECTS',
            'GUARANTEE',
            'CONTROLLER'
        ];
        const relationDiff = relationOrder.indexOf(relationA) - relationOrder.indexOf(relationB);
        if (relationDiff !== 0) return relationDiff;
        return String(a.label).localeCompare(String(b.label), 'zh-CN');
    });
    const oneHop = ringNodes.filter((node)=>centerNeighbors.has(node.id));
    const otherHop = ringNodes.filter((node)=>!centerNeighbors.has(node.id));
    const radius = Math.max(170, Math.min(230, nodes.length * 24));
    const startAngle = -Math.PI / 2;
    const placeOnRing = (items, r, angleOffset = 0)=>{
        const count = Math.max(1, items.length);
        items.forEach((node, index)=>{
            const angle = startAngle + angleOffset + Math.PI * 2 * index / count;
            node.x = Math.cos(angle) * r;
            node.y = Math.sin(angle) * r;
        });
    };
    placeOnRing(oneHop, radius);
    placeOnRing(otherHop, radius + 170, Math.PI / Math.max(3, otherHop.length || 3));
};
const buildG6Data = (subgraph, subjectIds, neighborIds, entityCommunityMap)=>{
    var _subgraph_nodes, _subgraph_edges, _subgraph_paths;
    if (!subgraph) return {
        nodes: [],
        edges: []
    };
    console.log('[EnhancedGraphPanel] input nodes=%d edges=%d paths=%d', ((_subgraph_nodes = subgraph.nodes) === null || _subgraph_nodes === void 0 ? void 0 : _subgraph_nodes.length) || 0, ((_subgraph_edges = subgraph.edges) === null || _subgraph_edges === void 0 ? void 0 : _subgraph_edges.length) || 0, ((_subgraph_paths = subgraph.paths) === null || _subgraph_paths === void 0 ? void 0 : _subgraph_paths.length) || 0);
    const subjectIdSet = new Set((subjectIds || []).map(String));
    const neighborIdSet = new Set((neighborIds || []).map(String));
    const degreeMap = new Map();
    for (const e of subgraph.edges || []){
        const src = String(e.source);
        const tgt = String(e.target);
        degreeMap.set(src, (degreeMap.get(src) || 0) + 1);
        degreeMap.set(tgt, (degreeMap.get(tgt) || 0) + 1);
    }
    const maxDegree = Math.max(1, ...Array.from(degreeMap.values()));
    const scaleSize = (degree)=>{
        const minSize = 26;
        const maxSize = 64;
        return minSize + degree / maxDegree * (maxSize - minSize);
    };
    const pathNodeIds = new Set();
    const pathEdgeKeys = new Set();
    const pathEdgeIds = new Set();
    for (const path of subgraph.paths || []){
        for (const nid of path.nodeIds || [])pathNodeIds.add(String(nid));
        if (path.edgeIds && path.edgeIds.length > 0) for (const eid of path.edgeIds)pathEdgeIds.add(String(eid));
        const nids = path.nodeIds || [];
        for(let i = 0; i < nids.length - 1; i++){
            pathEdgeKeys.add(`${nids[i]}${PATH_EDGE_KEY_SEP}${nids[i + 1]}`);
            pathEdgeKeys.add(`${nids[i + 1]}${PATH_EDGE_KEY_SEP}${nids[i]}`);
            pathEdgeKeys.add(`${nids[i]}→${nids[i + 1]}`);
            pathEdgeKeys.add(`${nids[i + 1]}→${nids[i]}`);
        }
    }
    const nodeCommunityMap = new Map();
    if (entityCommunityMap === null || entityCommunityMap === void 0 ? void 0 : entityCommunityMap.entities) {
        for (const entry of entityCommunityMap.entities)if (entry.communities && entry.communities.length > 0) {
            const key = entry.name || entry.id;
            nodeCommunityMap.set(key, {
                communityIds: entry.communities.map((c)=>c.community_id),
                roles: entry.communities.map((c)=>c.role)
            });
        }
    }
    const resolveNodeType = (node)=>{
        const t = node.type;
        if (t && VALID_NODE_TYPES.has(t)) return t;
        if (t) {
            const upper = t.toUpperCase();
            if (upper === 'COMPANY' || upper === 'SUBJECT') return 'COMPANY';
            if (upper === 'PERSON') return 'PERSON';
            if (upper === 'EVENT') return 'EVENT';
            if (upper === 'SUB_EVENT') return 'SUB_EVENT';
            if (upper === 'TIME') return 'TIME';
            if (VALID_NODE_TYPES.has(upper)) return upper;
        }
        const entType = node.entityType;
        if (entType && VALID_NODE_TYPES.has(entType)) return entType;
        const entType2 = node.entity_type;
        if (entType2 && VALID_NODE_TYPES.has(entType2)) return entType2;
        const labels = node.labels;
        if (labels && labels.length > 0) {
            for (const label of labels){
                const upper = typeof label === 'string' ? label.toUpperCase() : '';
                if (upper === 'COMPANY' || upper === 'SUBJECT') return 'COMPANY';
                if (upper === 'PERSON') return 'PERSON';
                if (upper === 'EVENT') return 'EVENT';
                if (upper === 'SUB_EVENT') return 'SUB_EVENT';
                if (upper === 'TIME') return 'TIME';
                if (VALID_NODE_TYPES.has(label)) return label;
            }
            const first = String(labels[0]);
            if (VALID_NODE_TYPES.has(first)) return first;
            const upperFirst = first.toUpperCase();
            if (VALID_NODE_TYPES.has(upperFirst)) return upperFirst;
        }
        return 'COMPANY';
    };
    const resolveEdgeRelation = (edge)=>{
        return edge.relation || edge.label || edge.type || 'RELATED';
    };
    const validNodeIds = new Set();
    const nodes = subgraph.nodes.filter((n)=>{
        const nt = resolveNodeType(n);
        if (nt === '' || !VALID_NODE_TYPES.has(nt)) {
            console.warn('[EnhancedGraphPanel] Dropped node — resolved type not in VALID_NODE_TYPES:', {
                id: n.id,
                title: n.title,
                type: n.type,
                resolvedType: nt
            });
            return false;
        }
        return true;
    }).map((node)=>{
        var _this;
        const nodeIdStr = String(node.id);
        const nodeType = resolveNodeType(node);
        validNodeIds.add(nodeIdStr);
        const visual = NODE_VISUAL[nodeType] ?? NODE_DEFAULT_VISUAL;
        let label = String(node.title || node.label || node.zh_name || node.name || node.id);
        if (label.length > 15) label = label.slice(0, 12) + '...';
        const riskLevel = node.risk_level;
        const complianceScore = node.compliance_score ?? ((_this = node.properties) === null || _this === void 0 ? void 0 : _this.compliance_score);
        const riskVisual = riskLevel ? _graphStyles.RISK_LEVEL_VISUAL[riskLevel] : null;
        const fillColor = (riskVisual === null || riskVisual === void 0 ? void 0 : riskVisual.bg) || visual.fill;
        const strokeColor = (riskVisual === null || riskVisual === void 0 ? void 0 : riskVisual.border) || visual.stroke;
        const deg = degreeMap.get(nodeIdStr) || 1;
        const nodeSize = scaleSize(deg);
        const isPathNode = pathNodeIds.has(nodeIdStr);
        const isSubject = subjectIdSet.has(nodeIdStr);
        const isNeighbor = neighborIdSet.has(nodeIdStr);
        const nodeName = String(node.title || node.name || node.zh_name || '');
        const communityMatch = nodeCommunityMap.get(nodeName) || nodeCommunityMap.get(String(node.id));
        const communityIds = (communityMatch === null || communityMatch === void 0 ? void 0 : communityMatch.communityIds) || [];
        const communityRoles = (communityMatch === null || communityMatch === void 0 ? void 0 : communityMatch.roles) || [];
        const isBridge = communityRoles.includes('bridge') || communityIds.length >= 2;
        const primaryCommunityId = communityIds.length > 0 ? communityIds[0] : null;
        const communityColor = primaryCommunityId != null ? getCommunityColor(primaryCommunityId) : null;
        const communityFill = communityColor && !isSubject && !isPathNode ? communityColor.bg : undefined;
        const communityStroke = communityColor ? communityColor.stroke : undefined;
        const borderColor = isSubject ? '#2855D1' : isNeighbor ? '#1890FF' : isPathNode ? strokeColor : isBridge ? communityStroke || strokeColor : communityStroke || strokeColor;
        const borderWidth = isSubject ? 4 : isNeighbor ? 2 : isPathNode ? 2.5 : isBridge ? 3 : 2;
        const finalSize = isSubject ? nodeSize * 1.3 : isBridge ? nodeSize * 1.2 : isNeighbor ? nodeSize * 1.1 : nodeSize;
        const lineDash = isBridge ? [
            4,
            2
        ] : undefined;
        return {
            id: nodeIdStr,
            label,
            _type: nodeType,
            type: 'circle',
            size: finalSize,
            _riskLevel: riskLevel || null,
            _complianceScore: complianceScore ?? null,
            _isPathNode: isPathNode,
            _isSubject: isSubject,
            _isNeighbor: isNeighbor,
            _degree: deg,
            _communityIds: communityIds,
            _isBridge: isBridge,
            style: {
                fill: communityFill || fillColor,
                stroke: borderColor,
                lineWidth: borderWidth,
                lineDash: lineDash,
                cursor: 'pointer',
                shadowColor: riskLevel === 'high' ? 'rgba(245, 34, 45, 0.6)' : isSubject ? 'rgba(40, 85, 209, 0.4)' : isPathNode ? 'rgba(40, 85, 209, 0.22)' : undefined,
                shadowBlur: riskLevel === 'high' ? 20 : isSubject ? 12 : isPathNode ? 8 : 0
            },
            labelCfg: {
                position: 'bottom',
                offset: visual.labelOffset + Math.max(0, (finalSize - 20) * 0.3),
                style: {
                    fill: '#1e293b',
                    fontSize: isSubject ? 13 : nodeType === 'COMPANY' ? 12 : 10,
                    fontWeight: isSubject ? 800 : isNeighbor || isPathNode ? 700 : nodeType === 'COMPANY' ? 600 : 500,
                    background: {
                        fill: 'rgba(255, 255, 255, 0.92)',
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
    let renderedPathEdgeCount = 0;
    const edges = subgraph.edges.filter((e)=>validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target))).map((edge, idx)=>{
        const relation = resolveEdgeRelation(edge);
        const relationLabel = RELATION_TEXT[relation] || _graphStyles.RELATION_LABELS[relation] || relation;
        const relStyle = EDGE_STYLE_MAP[relation] ?? EDGE_DEFAULT_STYLE;
        const confidence = edge.confidence;
        const confWidthAdj = confidence !== undefined ? confidence > 0.8 ? 1 : confidence < 0.5 ? -0.5 : 0 : 0;
        const confOpacityAdj = confidence !== undefined && confidence < 0.5 ? 0.6 : 1;
        const edgeKey = `${edge.source}→${edge.target}`;
        const readableEdgeKey = `${edge.source}${PATH_EDGE_KEY_SEP}${edge.target}`;
        const isPathEdge = pathEdgeKeys.has(readableEdgeKey) || pathEdgeKeys.has(edgeKey) || pathEdgeIds.has(String(edge.id || ''));
        if (isPathEdge) renderedPathEdgeCount += 1;
        return {
            id: String(edge.id || `edge-${idx}`),
            source: String(edge.source),
            target: String(edge.target),
            relation,
            type: 'line',
            _isPathEdge: isPathEdge,
            label: relationLabel,
            labelCfg: {
                autoRotate: true,
                refX: 0,
                refY: 2,
                style: {
                    fontSize: 11,
                    fill: '#334155',
                    fontWeight: 700,
                    background: {
                        fill: 'rgba(255, 255, 255, 0.96)',
                        padding: [
                            2,
                            5,
                            2,
                            5
                        ],
                        radius: 4
                    }
                }
            },
            style: {
                ...relStyle,
                lineWidth: isPathEdge ? Math.max(3, (relStyle.lineWidth || 1) * 1.8) : relStyle.lineWidth + confWidthAdj,
                stroke: isPathEdge ? '#2855D1' : relStyle.stroke,
                lineDash: [],
                opacity: isPathEdge ? 1 : relStyle.opacity * confOpacityAdj,
                endArrow: true
            }
        };
    });
    assignReadablePositions(nodes, edges);
    console.log(`[buildG6Data] rendered nodes=${nodes.length} edges=${edges.length} pathNodes=${pathNodeIds.size} pathEdges=${renderedPathEdgeCount}`);
    console.log('[buildG6Data] rendered details:', {
        pathEdgeKeys: pathEdgeKeys.size,
        pathEdgeIds: pathEdgeIds.size
    });
    return {
        nodes,
        edges,
        pathNodeIds,
        pathEdgeKeys
    };
};
const EnhancedGraphPanel = _s((0, _react.forwardRef)(_c = _s(({ subgraph, alignmentFeatures, entityCommunityMap, onNodeDoubleClick, onNodeClick, onCanvasClick, onStatsChange, highlightedEntity }, ref)=>{
    var _subgraph_paths;
    _s();
    const containerRef = (0, _react.useRef)(null);
    const graphRef = (0, _react.useRef)(null);
    const subgraphRef = (0, _react.useRef)(subgraph);
    subgraphRef.current = subgraph;
    const [loading, setLoading] = (0, _react.useState)(false);
    const [liveStats, setLiveStats] = (0, _react.useState)(null);
    const [visibleCategories, setVisibleCategories] = (0, _react.useState)(new Set(VALID_NODE_TYPES));
    const [contextMenu, setContextMenu] = (0, _react.useState)({
        visible: false,
        x: 0,
        y: 0,
        nodeId: '',
        nodeName: '',
        nodeType: ''
    });
    const [isFullscreen, setIsFullscreen] = (0, _react.useState)(false);
    const [layoutMode, setLayoutMode] = (0, _react.useState)('concentric');
    const [pathOnly, setPathOnly] = (0, _react.useState)(false);
    const pathNodeIdsRef = (0, _react.useRef)(new Set());
    const suppressNextCanvasClickRef = (0, _react.useRef)(false);
    const [activeNodeFilters, setActiveNodeFilters] = (0, _react.useState)(new Set());
    const [activeEdgeFilters, setActiveEdgeFilters] = (0, _react.useState)(new Set());
    const [activeRiskFilters, setActiveRiskFilters] = (0, _react.useState)(new Set());
    const applyGraphFilters = (0, _react.useCallback)(()=>{
        const g = graphRef.current;
        if (!g) return;
        const hasNodeFilter = activeNodeFilters.size > 0;
        const hasEdgeFilter = activeEdgeFilters.size > 0;
        const hasRiskFilter = activeRiskFilters.size > 0;
        const hasAnyFilter = hasNodeFilter || hasEdgeFilter || hasRiskFilter;
        g.getNodes().forEach((n)=>{
            const model = n.getModel();
            const typeMatch = !hasNodeFilter || activeNodeFilters.has(model._type);
            const riskMatch = !hasRiskFilter || model._riskLevel && activeRiskFilters.has(model._riskLevel);
            g.setItemState(n, 'dimmed', hasAnyFilter && !(typeMatch && riskMatch));
        });
        g.getEdges().forEach((e)=>{
            const model = e.getModel();
            const relMatch = !hasEdgeFilter || activeEdgeFilters.has(model.relation);
            g.setItemState(e, 'dimmed', hasEdgeFilter && !relMatch);
        });
    }, [
        activeNodeFilters,
        activeEdgeFilters,
        activeRiskFilters
    ]);
    (0, _react.useEffect)(()=>{
        applyGraphFilters();
    }, [
        applyGraphFilters
    ]);
    const clearAllFilters = ()=>{
        setActiveNodeFilters(new Set());
        setActiveEdgeFilters(new Set());
        setActiveRiskFilters(new Set());
        setVisibleCategories(new Set(VALID_NODE_TYPES));
        const g = graphRef.current;
        if (g) {
            g.getNodes().forEach((n)=>g.showItem(n));
            g.getEdges().forEach((e)=>g.showItem(e));
        }
    };
    const syncGraphStats = (0, _react.useCallback)(()=>{
        const g = graphRef.current;
        if (!g) return;
        const gNodes = g.getNodes();
        const gEdges = g.getEdges();
        const nodeCounts = {};
        const edgeCounts = {};
        const riskLevelCounts = {};
        for (const n of gNodes){
            const model = n.getModel();
            const t = (model === null || model === void 0 ? void 0 : model._type) ?? '';
            if (VALID_NODE_TYPES.has(t)) nodeCounts[t] = (nodeCounts[t] ?? 0) + 1;
            const rl = model === null || model === void 0 ? void 0 : model._riskLevel;
            if (rl) riskLevelCounts[rl] = (riskLevelCounts[rl] ?? 0) + 1;
        }
        for (const e of gEdges){
            const model = e.getModel();
            const rel = (model === null || model === void 0 ? void 0 : model.relation) ?? 'UNKNOWN';
            edgeCounts[rel] = (edgeCounts[rel] ?? 0) + 1;
        }
        const stats = {
            totalNodes: gNodes.length,
            totalEdges: gEdges.length,
            nodeCounts,
            edgeCounts,
            riskLevelCounts
        };
        setLiveStats(stats);
        onStatsChange === null || onStatsChange === void 0 || onStatsChange(stats);
    }, [
        onStatsChange
    ]);
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
                    const v = NODE_VISUAL[n.type] || NODE_DEFAULT_VISUAL;
                    let label = String(n.title || n.label || n.zh_name || n.name || n.id);
                    if (label.length > 15) label = label.slice(0, 12) + '...';
                    try {
                        graph.addItem('node', {
                            id: idStr,
                            label,
                            type: 'circle',
                            _type: n.type,
                            size: v.size,
                            style: {
                                fill: v.fill,
                                stroke: v.stroke,
                                lineWidth: 2,
                                cursor: 'pointer'
                            },
                            labelCfg: {
                                position: 'bottom',
                                offset: v.labelOffset,
                                style: {
                                    fill: '#1e293b',
                                    fontSize: 12,
                                    fontWeight: 500,
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
                    } catch (e) {}
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
                } catch (err) {}
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
    const handleZoomIn = (0, _react.useCallback)(()=>{
        const g = graphRef.current;
        if (!g) return;
        const current = g.getZoom();
        g.zoomTo(current * 1.2);
    }, []);
    const handleZoomOut = (0, _react.useCallback)(()=>{
        const g = graphRef.current;
        if (!g) return;
        const current = g.getZoom();
        g.zoomTo(current * 0.8);
    }, []);
    const handleFitView = (0, _react.useCallback)(()=>{
        var _graphRef_current;
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.fitView(35);
    }, []);
    const handleToggleFullscreen = (0, _react.useCallback)(()=>{
        const container = containerRef.current;
        if (!container) return;
        if (!isFullscreen) {
            var _container_requestFullscreen;
            (_container_requestFullscreen = container.requestFullscreen) === null || _container_requestFullscreen === void 0 || _container_requestFullscreen.call(container).catch(()=>{});
        } else {
            var _document_exitFullscreen, _document;
            (_document_exitFullscreen = (_document = document).exitFullscreen) === null || _document_exitFullscreen === void 0 || _document_exitFullscreen.call(_document).catch(()=>{});
        }
        setIsFullscreen(!isFullscreen);
    }, [
        isFullscreen
    ]);
    const handleExportImage = (0, _react.useCallback)((format)=>{
        const g = graphRef.current;
        if (!g) return;
        const mime = format === 'svg' ? 'image/svg+xml' : 'image/png';
        g.downloadFullImage(`windeye-graph-${Date.now()}`, mime, {
            backgroundColor: '#ffffff',
            padding: 20
        });
    }, []);
    const handleChangeLayout = (0, _react.useCallback)((mode)=>{
        const g = graphRef.current;
        if (!g) return;
        setLayoutMode(mode);
        switch(mode){
            case 'force':
                g.updateLayout({
                    type: 'force',
                    preventOverlap: true,
                    nodeSize: 40,
                    nodeSpacing: 40,
                    linkDistance: 150,
                    nodeStrength: -200
                });
                break;
            case 'dagre':
                g.updateLayout({
                    type: 'dagre',
                    rankdir: 'TB',
                    nodesep: 20,
                    ranksep: 60
                });
                break;
            case 'circular':
                g.updateLayout({
                    type: 'circular',
                    radius: 250,
                    ordering: 'degree'
                });
                break;
            case 'concentric':
                {
                    const nodes = g.getNodes();
                    const edges = g.getEdges();
                    if (nodes.length === 0) break;
                    const adj = new Map();
                    nodes.forEach((n)=>adj.set(n.getID(), new Set()));
                    edges.forEach((e)=>{
                        var _adj_get, _adj_get1;
                        const model = e.getModel();
                        const src = String(model.source);
                        const tgt = String(model.target);
                        (_adj_get = adj.get(src)) === null || _adj_get === void 0 || _adj_get.add(tgt);
                        (_adj_get1 = adj.get(tgt)) === null || _adj_get1 === void 0 || _adj_get1.add(src);
                    });
                    let subjectIds = new Set();
                    let maxDeg = 0;
                    nodes.forEach((n)=>{
                        var _adj_get;
                        const id = n.getID();
                        const model = n.getModel();
                        if (model._isSubject) subjectIds.add(id);
                        const deg = ((_adj_get = adj.get(id)) === null || _adj_get === void 0 ? void 0 : _adj_get.size) || 0;
                        if (deg > maxDeg) maxDeg = deg;
                    });
                    if (subjectIds.size === 0 && nodes.length > 0) nodes.forEach((n)=>{
                        var _adj_get;
                        const id = n.getID();
                        if ((((_adj_get = adj.get(id)) === null || _adj_get === void 0 ? void 0 : _adj_get.size) || 0) === maxDeg) subjectIds.add(id);
                    });
                    const hop = new Map();
                    const queue = [];
                    for (const sid of subjectIds){
                        hop.set(sid, 0);
                        queue.push(sid);
                    }
                    while(queue.length > 0){
                        const cur = queue.shift();
                        const curHop = hop.get(cur) || 0;
                        for (const nb of adj.get(cur) || [])if (!hop.has(nb)) {
                            hop.set(nb, curHop + 1);
                            queue.push(nb);
                        }
                    }
                    const maxHop = hop.size > 0 ? Math.max(...hop.values()) : 0;
                    nodes.forEach((n)=>{
                        if (!hop.has(n.getID())) hop.set(n.getID(), maxHop + 1);
                    });
                    const nodeComm = new Map();
                    nodes.forEach((n)=>{
                        const model = n.getModel();
                        const cids = model._communityIds;
                        nodeComm.set(n.getID(), cids && cids.length > 0 ? cids[0] : 0);
                    });
                    const rings = new Map();
                    rings.set(0, []);
                    rings.set(1, []);
                    rings.set(2, []);
                    rings.set(3, []);
                    nodes.forEach((n)=>{
                        const id = n.getID();
                        const h = Math.min(hop.get(id) || 0, 3);
                        rings.get(h).push({
                            id,
                            x: 0,
                            y: 0,
                            comm: nodeComm.get(id) || 0
                        });
                    });
                    const radii = [
                        0,
                        120,
                        240,
                        360
                    ];
                    const center = {
                        x: 400,
                        y: 350
                    };
                    for(let ring = 0; ring <= 3; ring++){
                        const members = rings.get(ring) || [];
                        if (members.length === 0) continue;
                        members.sort((a, b)=>a.comm - b.comm);
                        const r = radii[ring];
                        members.forEach((m, i)=>{
                            const angle = 2 * Math.PI * i / members.length - Math.PI / 2;
                            m.x = center.x + r * Math.cos(angle);
                            m.y = center.y + r * Math.sin(angle);
                        });
                        if (ring === 0) members.forEach((m)=>{
                            m.x = center.x;
                            m.y = center.y;
                        });
                    }
                    const allPositions = new Map();
                    for (const members of rings.values())for (const m of members)allPositions.set(m.id, {
                        x: m.x,
                        y: m.y
                    });
                    nodes.forEach((n)=>{
                        const pos = allPositions.get(n.getID());
                        if (pos) g.updateItem(n, {
                            x: pos.x,
                            y: pos.y
                        });
                    });
                    g.fitView(35);
                    break;
                }
        }
        if (mode !== 'concentric') setTimeout(()=>g.fitView(35), 400);
    }, []);
    const applyPathOnlyFilter = (0, _react.useCallback)((showPathOnly)=>{
        const g = graphRef.current;
        if (!g) return;
        const pathIds = pathNodeIdsRef.current;
        if (pathIds.size === 0) return;
        if (showPathOnly) {
            g.getNodes().forEach((n)=>{
                const id = n.getID();
                if (!pathIds.has(id)) g.hideItem(n);
                else g.showItem(n);
            });
            g.getEdges().forEach((e)=>{
                const model = e.getModel();
                if (!model._isPathEdge) g.hideItem(e);
                else g.showItem(e);
            });
        } else {
            g.getNodes().forEach((n)=>g.showItem(n));
            g.getEdges().forEach((e)=>g.showItem(e));
        }
        g.fitView(35);
    }, []);
    const handleTogglePathOnly = (0, _react.useCallback)(()=>{
        setPathOnly((prev)=>{
            const next = !prev;
            applyPathOnlyFilter(next);
            return next;
        });
    }, [
        applyPathOnlyFilter
    ]);
    const handleContextViewDetail = (0, _react.useCallback)(()=>{
        var _subgraphRef_current;
        const raw = (_subgraphRef_current = subgraphRef.current) === null || _subgraphRef_current === void 0 ? void 0 : _subgraphRef_current.nodes.find((n)=>String(n.id) === contextMenu.nodeId);
        if (raw) {
            var _graphRef_current;
            (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.translate(-240, 0, {
                duration: 300,
                easing: 'easeCubic'
            });
            onNodeClick === null || onNodeClick === void 0 || onNodeClick(raw);
        }
        setContextMenu((prev)=>({
                ...prev,
                visible: false
            }));
    }, [
        contextMenu.nodeId,
        onNodeClick
    ]);
    const handleContextExpand = (0, _react.useCallback)(()=>{
        searchAndExpand(contextMenu.nodeId, contextMenu.nodeType);
        setContextMenu((prev)=>({
                ...prev,
                visible: false
            }));
    }, [
        contextMenu.nodeId,
        contextMenu.nodeType,
        searchAndExpand
    ]);
    const handleContextGenerateReport = (0, _react.useCallback)(()=>{
        window.dispatchEvent(new CustomEvent('generateRiskForEntity', {
            detail: {
                entityId: contextMenu.nodeId,
                entityName: contextMenu.nodeName,
                entityType: contextMenu.nodeType
            }
        }));
        _antd.message.info(`Generating risk report for: ${contextMenu.nodeName}`);
        setContextMenu((prev)=>({
                ...prev,
                visible: false
            }));
    }, [
        contextMenu.nodeId,
        contextMenu.nodeName,
        contextMenu.nodeType
    ]);
    const hasPaths = ((subgraph === null || subgraph === void 0 ? void 0 : (_subgraph_paths = subgraph.paths) === null || _subgraph_paths === void 0 ? void 0 : _subgraph_paths.length) || 0) > 0;
    (0, _react.useImperativeHandle)(ref, ()=>({
            refresh: (sg, _alignedFeatures, subjectIds, neighborIds)=>{
                if (!graphRef.current) return;
                const g6Data = buildG6Data(sg, subjectIds, neighborIds, entityCommunityMap);
                pathNodeIdsRef.current = g6Data.pathNodeIds || new Set();
                graphRef.current.changeData(g6Data);
                graphRef.current.fitView(35);
                syncGraphStats();
                if (pathOnly) applyPathOnlyFilter(true);
            },
            fitView: ()=>{
                var _graphRef_current;
                return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView(35);
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
                if (!graphRef.current) return;
                graphRef.current.focusItem(nodeId, true);
            },
            searchAndExpand,
            toggleCategory,
            applyHighlight,
            translateCanvas: (dx, dy)=>{
                var _graphRef_current;
                (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.translate(dx, dy, {
                    duration: 300,
                    easing: 'easeCubic'
                });
            },
            dimNonFocused: (subjectIds, neighborIds)=>{
                const g = graphRef.current;
                if (!g) return;
                if (subjectIds.length === 0) {
                    g.getNodes().forEach((n)=>g.clearItemStates(n));
                    g.getEdges().forEach((e)=>g.clearItemStates(e));
                    return;
                }
                const subjectSet = new Set(subjectIds.map(String));
                const neighborSet = new Set(neighborIds.map(String));
                g.getNodes().forEach((n)=>{
                    const id = n.getID();
                    if (!subjectSet.has(id) && !neighborSet.has(id)) g.setItemState(n, 'dimmed', true);
                });
                g.getEdges().forEach((e)=>{
                    const model = e.getModel();
                    const src = String(model.source);
                    const tgt = String(model.target);
                    const isRelevant = subjectSet.has(src) || subjectSet.has(tgt) || neighborSet.has(src) || neighborSet.has(tgt);
                    if (!isRelevant) g.setItemState(e, 'dimmed', true);
                });
            },
            clear: ()=>{
                if (!graphRef.current) return;
                graphRef.current.changeData({
                    nodes: [],
                    edges: []
                });
                setLiveStats(null);
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
                        type: 'preset'
                    },
                    defaultNode: {
                        type: 'circle',
                        size: 20
                    },
                    defaultEdge: {
                        type: 'line',
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
                    },
                    nodeStateStyles: {
                        dimmed: {
                            opacity: 0.15
                        }
                    },
                    edgeStateStyles: {
                        dimmed: {
                            opacity: 0.08
                        }
                    }
                });
                graphRef.current = graph;
                graph.render();
                const initialSubgraph = subgraphRef.current;
                if (initialSubgraph) {
                    const g6Data = buildG6Data(initialSubgraph, undefined, undefined, entityCommunityMap);
                    pathNodeIdsRef.current = g6Data.pathNodeIds || new Set();
                    graph.changeData(g6Data);
                    graph.fitView(35);
                }
                syncGraphStats();
                const resizeObserver = new ResizeObserver(()=>{
                    if (containerRef.current && graphRef.current) {
                        graphRef.current.changeSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                        graphRef.current.fitView(35);
                    }
                });
                resizeObserver.observe(containerRef.current);
                graph.on('node:click', (e)=>{
                    var _subgraphRef_current;
                    const raw = (_subgraphRef_current = subgraphRef.current) === null || _subgraphRef_current === void 0 ? void 0 : _subgraphRef_current.nodes.find((n)=>{
                        var _e_item;
                        return String(n.id) === ((_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getID());
                    });
                    if (raw) {
                        suppressNextCanvasClickRef.current = true;
                        window.setTimeout(()=>{
                            suppressNextCanvasClickRef.current = false;
                        }, 120);
                        onNodeClick === null || onNodeClick === void 0 || onNodeClick(raw);
                    }
                });
                graph.on('node:dblclick', (e)=>{
                    var _e_item, _e_item1, _e_item2;
                    const nodeId = (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getID();
                    const nodeType = ((_e_item1 = e.item) === null || _e_item1 === void 0 ? void 0 : _e_item1.getModel()._type) || 'COMPANY';
                    const nodeName = ((_e_item2 = e.item) === null || _e_item2 === void 0 ? void 0 : _e_item2.getModel().label) || nodeId;
                    onNodeDoubleClick === null || onNodeDoubleClick === void 0 || onNodeDoubleClick(nodeId, nodeName, nodeType);
                    searchAndExpand(nodeId, nodeType);
                });
                graph.on('node:mouseenter', (e)=>{
                    var _e_item;
                    const model = (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getModel();
                    const nodeType = (model === null || model === void 0 ? void 0 : model._type) || '';
                    const riskLevel = model === null || model === void 0 ? void 0 : model._riskLevel;
                    const complianceScore = model === null || model === void 0 ? void 0 : model._complianceScore;
                    const tooltipEl = document.getElementById('windeye-node-tooltip');
                    if (tooltipEl) {
                        const typeLabel = _graphStyles.NODE_TYPE_LABELS[nodeType] || nodeType;
                        const typeColor = _graphStyles.NODE_TYPE_COLORS[nodeType] || '#8c8c8c';
                        const rv = riskLevel ? _graphStyles.RISK_LEVEL_VISUAL[riskLevel] : null;
                        tooltipEl.innerHTML = `
                <div style="font-weight:600;font-size:13px;color:#1e293b;margin-bottom:4px">${(model === null || model === void 0 ? void 0 : model.label) || (model === null || model === void 0 ? void 0 : model.id) || ''}</div>
                <span style="display:inline-block;padding:1px 8px;border-radius:4px;font-size:11px;font-weight:600;color:${typeColor};background:${typeColor}15;border:1px solid ${typeColor}30">${typeLabel}</span>
                ${rv ? `<span style="display:inline-block;margin-left:6px;padding:1px 8px;border-radius:4px;font-size:11px;font-weight:600;color:${rv.border};background:${rv.bg};border:1px solid ${rv.border}40">${rv.label}</span>` : ''}
                ${complianceScore !== undefined && complianceScore !== null ? `<div style="margin-top:6px;font-size:11px;color:#64748b">合规指标总分：<b style="color:#1677ff">${Number(complianceScore).toFixed(1)}</b></div>` : ''}
              `;
                        tooltipEl.style.display = 'block';
                    }
                });
                graph.on('node:mouseleave', ()=>{
                    const tooltipEl = document.getElementById('windeye-node-tooltip');
                    if (tooltipEl) tooltipEl.style.display = 'none';
                });
                graph.on('node:mousemove', (e)=>{
                    const tooltipEl = document.getElementById('windeye-node-tooltip');
                    if (tooltipEl && tooltipEl.style.display === 'block') {
                        var _e_originalEvent, _e_originalEvent1;
                        const x = (((_e_originalEvent = e.originalEvent) === null || _e_originalEvent === void 0 ? void 0 : _e_originalEvent.clientX) || e.clientX || 0) + 15;
                        const y = (((_e_originalEvent1 = e.originalEvent) === null || _e_originalEvent1 === void 0 ? void 0 : _e_originalEvent1.clientY) || e.clientY || 0) + 15;
                        tooltipEl.style.left = `${x}px`;
                        tooltipEl.style.top = `${y}px`;
                    }
                });
                graph.on('node:contextmenu', (e)=>{
                    var _e_originalEvent_preventDefault, _e_originalEvent, _e_item, _e_item1, _e_originalEvent1, _e_originalEvent2;
                    (_e_originalEvent = e.originalEvent) === null || _e_originalEvent === void 0 || (_e_originalEvent_preventDefault = _e_originalEvent.preventDefault) === null || _e_originalEvent_preventDefault === void 0 || _e_originalEvent_preventDefault.call(_e_originalEvent);
                    const model = (_e_item = e.item) === null || _e_item === void 0 ? void 0 : _e_item.getModel();
                    const nodeId = (model === null || model === void 0 ? void 0 : model.id) || ((_e_item1 = e.item) === null || _e_item1 === void 0 ? void 0 : _e_item1.getID());
                    const nodeName = (model === null || model === void 0 ? void 0 : model.label) || nodeId;
                    const nodeType = (model === null || model === void 0 ? void 0 : model._type) || 'Unknown';
                    setContextMenu({
                        visible: true,
                        x: ((_e_originalEvent1 = e.originalEvent) === null || _e_originalEvent1 === void 0 ? void 0 : _e_originalEvent1.clientX) || e.clientX || 0,
                        y: ((_e_originalEvent2 = e.originalEvent) === null || _e_originalEvent2 === void 0 ? void 0 : _e_originalEvent2.clientY) || e.clientY || 0,
                        nodeId,
                        nodeName,
                        nodeType
                    });
                });
                graph.on('canvas:click', ()=>{
                    if (suppressNextCanvasClickRef.current) {
                        suppressNextCanvasClickRef.current = false;
                        return;
                    }
                    setContextMenu((prev)=>prev.visible ? {
                            ...prev,
                            visible: false
                        } : prev);
                    clearAllFilters();
                    graph.translate(0, 0, {
                        duration: 300,
                        easing: 'easeCubic'
                    });
                    onCanvasClick === null || onCanvasClick === void 0 || onCanvasClick();
                });
                let pulseFrame = 0;
                const pulseHighRiskNodes = ()=>{
                    if (!graph || graph.destroyed) return;
                    pulseFrame++;
                    const glowIntensity = 15 + 10 * Math.sin(pulseFrame * 0.06);
                    graph.getNodes().forEach((n)=>{
                        const model = n.getModel();
                        if (model._riskLevel === 'high') {
                            var _n_getContainer;
                            const container = (_n_getContainer = n.getContainer) === null || _n_getContainer === void 0 ? void 0 : _n_getContainer.call(n);
                            if (container) {
                                var _container_getChildByIndex;
                                const circle = (_container_getChildByIndex = container.getChildByIndex) === null || _container_getChildByIndex === void 0 ? void 0 : _container_getChildByIndex.call(container, 0);
                                if (circle && typeof circle.attr === 'function') circle.attr('shadowBlur', glowIntensity);
                            }
                        }
                    });
                    graph.__pulseTimer = requestAnimationFrame(pulseHighRiskNodes);
                };
                graph.__pulseTimer = requestAnimationFrame(pulseHighRiskNodes);
                let dashOffset = 0;
                const animatePathEdges = ()=>{
                    if (!graph || graph.destroyed) return;
                    dashOffset = (dashOffset + 0.3) % 16;
                    graph.getEdges().forEach((edge)=>{
                        const model = edge.getModel();
                        if (model._isPathEdge) {
                            var _edge_getKeyShape;
                            const keyShape = (_edge_getKeyShape = edge.getKeyShape) === null || _edge_getKeyShape === void 0 ? void 0 : _edge_getKeyShape.call(edge);
                            if (keyShape && typeof keyShape.attr === 'function') keyShape.attr('lineDashOffset', -dashOffset);
                        }
                    });
                    graph.__pathFlowTimer = requestAnimationFrame(animatePathEdges);
                };
                graph.__pathFlowTimer = requestAnimationFrame(animatePathEdges);
                setLoading(false);
                return ()=>resizeObserver.disconnect();
            } finally{
                if (mounted) setLoading(false);
            }
        };
        init();
        return ()=>{
            mounted = false;
            if (graph.__pulseTimer) cancelAnimationFrame(graph.__pulseTimer);
            if (graph.__pathFlowTimer) cancelAnimationFrame(graph.__pathFlowTimer);
            graph === null || graph === void 0 || graph.destroy();
        };
    }, [
        syncGraphStats,
        searchAndExpand
    ]);
    return (0, _jsxdevruntime.jsxDEV)("div", {
        style: styles.root,
        children: (0, _jsxdevruntime.jsxDEV)("div", {
            style: styles.graphArea,
            children: [
                (0, _jsxdevruntime.jsxDEV)("div", {
                    ref: containerRef,
                    style: styles.graphCanvas
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                    lineNumber: 1197,
                    columnNumber: 11
                }, this),
                (0, _jsxdevruntime.jsxDEV)("div", {
                    id: "windeye-node-tooltip",
                    style: {
                        display: 'none',
                        position: 'fixed',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        background: '#fff',
                        borderRadius: 8,
                        padding: '8px 12px',
                        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
                        border: '1px solid #e2e8f0',
                        maxWidth: 220
                    }
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                    lineNumber: 1200,
                    columnNumber: 11
                }, this),
                (0, _jsxdevruntime.jsxDEV)(_GraphToolbar.default, {
                    onZoomIn: handleZoomIn,
                    onZoomOut: handleZoomOut,
                    onFitView: handleFitView,
                    onToggleFullscreen: handleToggleFullscreen,
                    isFullscreen: isFullscreen,
                    onExportImage: handleExportImage,
                    onChangeLayout: handleChangeLayout,
                    layoutMode: layoutMode,
                    onTogglePathOnly: handleTogglePathOnly,
                    pathOnly: pathOnly,
                    hasPaths: hasPaths
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                    lineNumber: 1216,
                    columnNumber: 11
                }, this),
                (0, _jsxdevruntime.jsxDEV)(_NodeContextMenu.default, {
                    visible: contextMenu.visible,
                    x: contextMenu.x,
                    y: contextMenu.y,
                    nodeId: contextMenu.nodeId,
                    nodeName: contextMenu.nodeName,
                    nodeType: contextMenu.nodeType,
                    onClose: ()=>setContextMenu((prev)=>({
                                ...prev,
                                visible: false
                            })),
                    onViewDetail: handleContextViewDetail,
                    onExpand: handleContextExpand,
                    onGenerateReport: handleContextGenerateReport
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                    lineNumber: 1230,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
            lineNumber: 1196,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
        lineNumber: 1195,
        columnNumber: 7
    }, this);
}, "t5abTC/Rxy6C6t3fXTRl88tf9Z0=")), "t5abTC/Rxy6C6t3fXTRl88tf9Z0=");
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
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
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
var _s = $RefreshSig$();
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
    _s();
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [showReasoning, setShowReasoning] = (0, _react.useState)(false);
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
                    lineNumber: 98,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 86,
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
                    lineNumber: 109,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
        lineNumber: 85,
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
            lineNumber: 122,
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
                lineNumber: 133,
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
                lineNumber: 139,
                columnNumber: 9
            }, this));
            lastIndex = entity.end;
        });
        if (lastIndex < message.content.length) parts.push(/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
            children: message.content.slice(lastIndex)
        }, "text-end", false, {
            fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
            lineNumber: 171,
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
                    lineNumber: 207,
                    columnNumber: 19
                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RobotOutlined, {}, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                    lineNumber: 207,
                    columnNumber: 38
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 187,
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
                        lineNumber: 219,
                        columnNumber: 9
                    }, this),
                    !isUser && message.reasoningLog && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            width: '100%',
                            marginTop: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                onClick: ()=>setShowReasoning(!showReasoning),
                                style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    background: 'rgba(250, 140, 22, 0.08)',
                                    border: '1px solid rgba(250, 140, 22, 0.2)',
                                    fontSize: 12,
                                    color: '#d46b08',
                                    userSelect: 'none',
                                    transition: 'all 0.2s'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CaretRightOutlined, {
                                        style: {
                                            fontSize: 10,
                                            transition: 'transform 0.2s',
                                            transform: showReasoning ? 'rotate(90deg)' : 'rotate(0deg)'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                                        lineNumber: 260,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BugOutlined, {
                                        style: {
                                            fontSize: 12
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                                        lineNumber: 267,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        children: "智能体推理日志"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                                        lineNumber: 268,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            showReasoning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginTop: 6,
                                    padding: '12px 14px',
                                    borderRadius: 8,
                                    background: 'rgba(15, 23, 42, 0.92)',
                                    border: '1px solid rgba(250, 140, 22, 0.25)',
                                    fontSize: 12,
                                    lineHeight: 1.7,
                                    color: '#e2e8f0',
                                    fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace",
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    maxHeight: 500,
                                    overflowY: 'auto'
                                },
                                children: message.reasoningLog
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                                lineNumber: 271,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                        lineNumber: 242,
                        columnNumber: 11
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
                        lineNumber: 294,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/EntityMessageBubble.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
};
_s(EntityMessageBubble, "7RXySMueAP6bGHBKAlUHC9UdJrE=");
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
"src/pages/KnowledgeQA/components/GraphToolbar.tsx": function (module, exports, __mako_require__){
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
const btnStyle = {
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    background: '#fff'
};
const GraphToolbar = ({ onZoomIn, onZoomOut, onFitView, onToggleFullscreen, isFullscreen, onExportImage, onChangeLayout, layoutMode, onTogglePathOnly, pathOnly, hasPaths })=>{
    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
        },
        children: [
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 10,
                    padding: '4px 0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "Zoom In",
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ZoomInOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 67,
                                columnNumber: 50
                            }, void 0),
                            onClick: onZoomIn,
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "Zoom Out",
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ZoomOutOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 70,
                                columnNumber: 50
                            }, void 0),
                            onClick: onZoomOut,
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "Fit View",
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExpandOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 73,
                                columnNumber: 50
                            }, void 0),
                            onClick: onFitView,
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: isFullscreen ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenExitOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 79,
                                columnNumber: 34
                            }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FullscreenOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 79,
                                columnNumber: 63
                            }, void 0),
                            onClick: onToggleFullscreen,
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 10,
                    padding: '4px 0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "Export PNG",
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CameraOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 89,
                                columnNumber: 50
                            }, void 0),
                            onClick: ()=>onExportImage('png'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: "Export SVG",
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: "text",
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileImageOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 92,
                                columnNumber: 50
                            }, void 0),
                            onClick: ()=>onExportImage('svg'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 10,
                    padding: '4px 0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: `Force Layout${layoutMode === 'force' ? ' (active)' : ''}`,
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: layoutMode === 'force' ? 'primary' : 'text',
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 102,
                                columnNumber: 19
                            }, void 0),
                            onClick: ()=>onChangeLayout('force'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: `Hierarchical Layout${layoutMode === 'dagre' ? ' (active)' : ''}`,
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: layoutMode === 'dagre' ? 'primary' : 'text',
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.VerticalAlignTopOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 111,
                                columnNumber: 19
                            }, void 0),
                            onClick: ()=>onChangeLayout('dagre'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: `Circular Layout${layoutMode === 'circular' ? ' (active)' : ''}`,
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: layoutMode === 'circular' ? 'primary' : 'text',
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.RadiusSettingOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 120,
                                columnNumber: 19
                            }, void 0),
                            onClick: ()=>onChangeLayout('circular'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                        title: `Concentric Layout${layoutMode === 'concentric' ? ' (active)' : ''}`,
                        placement: "left",
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                            type: layoutMode === 'concentric' ? 'primary' : 'text',
                            size: "small",
                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FilterOutlined, {}, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                                lineNumber: 129,
                                columnNumber: 19
                            }, void 0),
                            onClick: ()=>onChangeLayout('concentric'),
                            style: {
                                border: 'none',
                                boxShadow: 'none'
                            }
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            hasPaths && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 10,
                    padding: '4px 0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                },
                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                    title: pathOnly ? 'Show All Nodes' : 'Show Path Nodes Only',
                    placement: "left",
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                        type: pathOnly ? 'primary' : 'text',
                        size: "small",
                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FilterOutlined, {}, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                            lineNumber: 143,
                            columnNumber: 21
                        }, void 0),
                        onClick: onTogglePathOnly,
                        style: {
                            border: 'none',
                            boxShadow: 'none'
                        }
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                        lineNumber: 140,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                    lineNumber: 139,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
                lineNumber: 138,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/GraphToolbar.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
};
_c = GraphToolbar;
var _default = GraphToolbar;
var _c;
$RefreshReg$(_c, "GraphToolbar");
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
var _graphStyles = __mako_require__("src/pages/KnowledgeQA/components/graphStyles.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
const fmt = (n)=>n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
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
                                children: "节点"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 39,
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
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.divider
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chips,
                        children: Object.keys(_graphStyles.NODE_TYPE_LABELS).map((type)=>{
                            const count = stats.nodeCounts[type] ?? 0;
                            if (count === 0) return null;
                            const color = _graphStyles.NODE_TYPE_COLORS[type] || '#8c8c8c';
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
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: styles.chipText,
                                        children: [
                                            _graphStyles.NODE_TYPE_LABELS[type],
                                            " ",
                                            fmt(count)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 65,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, type, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 50,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 37,
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
                                children: "关系"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 77,
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
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 76,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.divider
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chips,
                        children: Object.entries(stats.edgeCounts).map(([rel, count])=>{
                            if (count === 0 || rel === 'UNKNOWN') return null;
                            const label = _graphStyles.RELATION_LABELS[rel] || rel;
                            const color = _graphStyles.EDGE_COLORS[rel] || '#8c8c8c';
                            const hidden = isEdgeHidden(rel);
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                onMouseEnter: ()=>onHighlight(rel),
                                onMouseLeave: ()=>onHighlight(null),
                                onClick: ()=>onToggle(rel),
                                style: {
                                    ...styles.edgeChip,
                                    background: hidden ? `${color}08` : `${color}12`,
                                    borderColor: hidden ? `${color}15` : `${color}30`,
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
                                        lineNumber: 100,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: styles.chipText,
                                        children: [
                                            label,
                                            " ",
                                            fmt(count)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 103,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, rel, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 88,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 75,
                columnNumber: 9
            }, this),
            stats.riskLevelCounts && Object.keys(stats.riskLevelCounts).length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    ...styles.row,
                    marginTop: 6
                },
                children: [
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.labelGroup,
                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                            style: styles.rowLabel,
                            children: "风险"
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.divider
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.chips,
                        children: Object.entries(stats.riskLevelCounts).map(([level, count])=>{
                            const rv = _graphStyles.RISK_LEVEL_VISUAL[level];
                            if (!rv) return null;
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    ...styles.nodeChip,
                                    background: `${rv.border}12`,
                                    border: `1px solid ${rv.border}30`,
                                    color: rv.border,
                                    cursor: 'default'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            ...styles.chipDot,
                                            background: rv.border
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 135,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: styles.chipText,
                                        children: [
                                            rv.label,
                                            " ",
                                            fmt(count)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                        lineNumber: 138,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, level, true, {
                                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                                lineNumber: 125,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                        lineNumber: 120,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        .legend-scroll::-webkit-scrollbar { display: none; }
        .legend-scroll { scrollbar-width: none; }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/LegendPanel.tsx",
        lineNumber: 36,
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
"src/pages/KnowledgeQA/components/NodeContextMenu.tsx": function (module, exports, __mako_require__){
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
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
const menuItems = [
    {
        key: 'detail',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.EyeOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
            lineNumber: 23,
            columnNumber: 26
        }, this),
        label: 'View Detail'
    },
    {
        key: 'expand',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
            lineNumber: 24,
            columnNumber: 26
        }, this),
        label: 'Expand Connections'
    },
    {
        key: 'report',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
            lineNumber: 25,
            columnNumber: 26
        }, this),
        label: 'Generate Risk Report'
    },
    {
        key: 'copy',
        icon: (0, _jsxdevruntime.jsxDEV)(_icons.CopyOutlined, {}, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
            lineNumber: 26,
            columnNumber: 24
        }, this),
        label: 'Copy Node Name'
    }
];
const NodeContextMenu = ({ visible, x, y, nodeId, nodeName, nodeType, onClose, onViewDetail, onExpand, onGenerateReport })=>{
    _s();
    const menuRef = (0, _react.useRef)(null);
    (0, _react.useEffect)(()=>{
        if (!visible) return;
        const handleClick = (e)=>{
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return ()=>document.removeEventListener('mousedown', handleClick);
    }, [
        visible,
        onClose
    ]);
    (0, _react.useEffect)(()=>{
        if (!visible) return;
        const handleKey = (e)=>{
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return ()=>document.removeEventListener('keydown', handleKey);
    }, [
        visible,
        onClose
    ]);
    if (!visible) return null;
    const handleAction = (key)=>{
        switch(key){
            case 'detail':
                onViewDetail();
                break;
            case 'expand':
                onExpand();
                break;
            case 'report':
                onGenerateReport();
                break;
            case 'copy':
                navigator.clipboard.writeText(nodeName).catch(()=>{
                    const ta = document.createElement('textarea');
                    ta.value = nodeName;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                });
                break;
        }
        onClose();
    };
    const adjustedX = Math.min(x, window.innerWidth - 200);
    const adjustedY = Math.min(y, window.innerHeight - (menuItems.length * 36 + 16));
    return (0, _jsxdevruntime.jsxDEV)("div", {
        ref: menuRef,
        style: {
            position: 'fixed',
            left: adjustedX,
            top: adjustedY,
            zIndex: 10000,
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.18)',
            border: '1px solid #e2e8f0',
            padding: '4px 0',
            minWidth: 190,
            backdropFilter: 'blur(10px)'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    padding: '5px 14px 7px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 11,
                    color: '#94a3b8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                },
                children: nodeType
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            menuItems.map((item)=>(0, _jsxdevruntime.jsxDEV)("div", {
                    onClick: ()=>handleAction(item.key),
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: '#334155',
                        transition: 'background 0.12s'
                    },
                    onMouseEnter: (e)=>{
                        e.currentTarget.style.background = '#f1f5f9';
                    },
                    onMouseLeave: (e)=>{
                        e.currentTarget.style.background = 'transparent';
                    },
                    children: [
                        (0, _jsxdevruntime.jsxDEV)("span", {
                            style: {
                                width: 16,
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: 12
                            },
                            children: item.icon
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                            lineNumber: 139,
                            columnNumber: 11
                        }, this),
                        (0, _jsxdevruntime.jsxDEV)("span", {
                            children: item.label
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this)
                    ]
                }, item.key, true, {
                    fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                    lineNumber: 119,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
};
_s(NodeContextMenu, "C8c55G4RkkeDIgsw+guSQfBbpOs=");
_c = NodeContextMenu;
var _default = NodeContextMenu;
var _c;
$RefreshReg$(_c, "NodeContextMenu");
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _reactmarkdown = _interop_require_default._(__mako_require__("node_modules/react-markdown/index.js"));
var _graphStyles = __mako_require__("src/pages/KnowledgeQA/components/graphStyles.ts");
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
    low: '#52c41a',
    insufficient_evidence: '#94a3b8'
};
const RISK_LEVEL_LABELS = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
    insufficient_evidence: '证据不足'
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
const COMMUNITY_PALETTE = [
    '#2563eb',
    '#7c3aed',
    '#16a34a',
    '#ea580c',
    '#dc2626',
    '#0891b2'
];
const STAGE_LABELS = {
    planning: '任务规划',
    retrieving: '图谱检索',
    entity_stats: '实体统计',
    community: '群体发现',
    analyzing: '协同治理',
    compliance: '合规匹配',
    reporting: '报告生成'
};
function inferClientEntityType(name) {
    if (!name) return 'COMPANY';
    if (/公司|集团|有限|股份|实业|科技|投资|控股|银行|基金|证券|保险|信托|租赁|保理|资本|产业/.test(name)) return 'COMPANY';
    if (/律师|法官|董事长|总经理|法定代表人|股东|监事|董事|经理|主任|行长|总裁/.test(name)) return 'PERSON';
    if (/^[一-鿿]{2,4}$/.test(name) && !/公司|事件|风险|法|条例|规定|集团|有限|银行/.test(name)) return 'PERSON';
    if (/事件|事故|案件|诉讼|处罚|仲裁|纠纷|争议|违约|违规|违法|资金占用|冻结|判决|裁定/.test(name)) return 'EVENT';
    if (/风险|因子|指标|预警|异常|波动/.test(name)) return 'RiskFactor';
    if (/法$|条例$|办法$|规定$|细则$/.test(name)) return 'Regulation';
    return 'COMPANY';
}
function getNodeDisplayName(node) {
    const props = (node === null || node === void 0 ? void 0 : node.properties) || {};
    return String((node === null || node === void 0 ? void 0 : node.name) || (node === null || node === void 0 ? void 0 : node.label) || props.name || props.title || props.COMPANY_NM || props.PERSON_NM || props.SECURITY_NM || (node === null || node === void 0 ? void 0 : node.id) || '');
}
function getNodeDisplayType(node) {
    var _node_labels, _node_properties;
    return String((node === null || node === void 0 ? void 0 : node.type) || (node === null || node === void 0 ? void 0 : node.label) || (node === null || node === void 0 ? void 0 : (_node_labels = node.labels) === null || _node_labels === void 0 ? void 0 : _node_labels[0]) || (node === null || node === void 0 ? void 0 : (_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.type) || inferClientEntityType(getNodeDisplayName(node)));
}
function getGraphCounts(graph) {
    return {
        nodes: Array.isArray(graph === null || graph === void 0 ? void 0 : graph.nodes) ? graph.nodes.length : 0,
        edges: Array.isArray(graph === null || graph === void 0 ? void 0 : graph.edges) ? graph.edges.length : 0
    };
}
function getEdgeEndpoint(edge, key) {
    const value = (edge === null || edge === void 0 ? void 0 : edge[key]) ?? (edge === null || edge === void 0 ? void 0 : edge[`${key}_id`]) ?? (edge === null || edge === void 0 ? void 0 : edge[`${key}Id`]);
    if (typeof value === 'object' && value !== null) return String(value.id || value.name || '');
    return String(value || '');
}
function formatTimestamp(ts) {
    if (!ts) return new Date().toISOString().replace('T', ' ').slice(0, 19);
    return ts;
}
function generateReportId(ts) {
    const d = ts ? new Date(ts) : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const seq = String(d.getTime() % 100000).padStart(5, '0');
    return `WIND-RPT-${y}${m}${day}-${seq}`;
}
const RiskReportPanel = ({ report, stages, community, entityCommunityMap, isLoading, error, onRetry, onJumpToGraph, queryText, currentSubgraph, resolvedEntities, governancePlan: governancePlanProp })=>{
    var _this, _currentSubgraph_nodes, _report_subgraph_summary, _seededCommunityData_visualization, _stages_;
    _s();
    const { message } = _antd.App.useApp();
    const [historyOpen, setHistoryOpen] = (0, _react.useState)(false);
    const [historyLoading, setHistoryLoading] = (0, _react.useState)(false);
    const [historyReports, setHistoryReports] = (0, _react.useState)([]);
    const [showAllPaths, setShowAllPaths] = (0, _react.useState)(false);
    const [riskPathMode, setRiskPathMode] = (0, _react.useState)('community');
    const [communityNodePositions, setCommunityNodePositions] = (0, _react.useState)({});
    const [draggingCommunityNodeId, setDraggingCommunityNodeId] = (0, _react.useState)(null);
    const [hoveredCommunityNodeId, setHoveredCommunityNodeId] = (0, _react.useState)(null);
    const [highlightSection, setHighlightSection] = (0, _react.useState)(null);
    const finalReportRef = (0, _react.useRef)(null);
    const reportId = (report === null || report === void 0 ? void 0 : report.report_id) || generateReportId(report === null || report === void 0 ? void 0 : report.generated_at);
    const governancePlan = governancePlanProp || ((_this = report) === null || _this === void 0 ? void 0 : _this.governance_plan);
    const { highCount, mediumCount, lowCount, sortedEntities } = (0, _react.useMemo)(()=>{
        if (!report) return {
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
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
                count: 1,
                types: new Set()
            });
        }
        for (const anomaly of report.anomaly_findings || [])for (const entity of anomaly.affected_entities || []){
            const existing = entityCounts.get(entity);
            if (existing) existing.count++;
            else entityCounts.set(entity, {
                count: 1,
                types: new Set()
            });
        }
        const sorted = Array.from(entityCounts.entries()).sort((a, b)=>b[1].count - a[1].count).slice(0, 10);
        return {
            highCount: high,
            mediumCount: medium,
            lowCount: low,
            sortedEntities: sorted
        };
    }, [
        report
    ]);
    const stageOrder = [
        'planning',
        'retrieving',
        'entity_stats',
        'community',
        'analyzing',
        'compliance',
        'reporting'
    ];
    const completedStages = new Set(stages.map((s)=>s.stage));
    const currentStageIdx = stageOrder.findIndex((s)=>!completedStages.has(s));
    const activeStep = currentStageIdx >= 0 ? currentStageIdx : stageOrder.length;
    const loadHistory = async ()=>{
        setHistoryOpen(true);
        setHistoryLoading(true);
        try {
            const resp = await fetch('/api/v1/risk/reports');
            if (resp.ok) {
                const data = await resp.json();
                const items = Array.isArray(data) ? data : data.data || data.reports || [];
                setHistoryReports(items);
            }
        } catch  {} finally{
            setHistoryLoading(false);
        }
    };
    const loadHistoryReport = async (id)=>{
        try {
            const resp = await fetch(`/api/v1/risk/reports/${id}`);
            if (resp.ok) {
                const data = await resp.json();
                message.success('报告已加载');
                setHistoryOpen(false);
                window.dispatchEvent(new CustomEvent('loadRiskReport', {
                    detail: data
                }));
            }
        } catch  {
            message.error('加载报告失败');
        }
    };
    const handleExportMD = ()=>{
        if (!(report === null || report === void 0 ? void 0 : report.markdown_report)) return;
        const header = `# WindEye 协同治理报告\n\n**报告编号**: ${reportId}\n**生成时间**: ${formatTimestamp(report.generated_at)}\n**查询**: ${queryText || report.query_summary || '-'}\n\n---\n\n`;
        const blob = new Blob([
            header + report.markdown_report
        ], {
            type: 'text/markdown'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleExportPDF = ()=>{
        window.print();
    };
    const handleExportWord = async ()=>{
        if (!report) return;
        const hide = message.loading('正在生成 Word 文档...', 0);
        try {
            const resp = await fetch('/api/v1/risk/reports/export-docx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    report,
                    reportId,
                    queryText: queryText || report.query_summary || '-'
                })
            });
            if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
            const blob = await resp.blob();
            if (blob.type.includes('application/json')) {
                const text = await blob.text();
                throw new Error(text || '导出失败');
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportId}.docx`;
            a.click();
            URL.revokeObjectURL(url);
            message.success('Word 文档已生成');
        } catch (err) {
            message.error((err === null || err === void 0 ? void 0 : err.message) || 'Word 导出失败');
        } finally{
            hide();
        }
    };
    const scrollToSection = (key)=>{
        const el = document.getElementById(`risk-section-${key}`);
        el === null || el === void 0 || el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };
    if (!report && !isLoading && stages.length === 0) return (0, _jsxdevruntime.jsxDEV)("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
        },
        children: (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
            image: _antd.Empty.PRESENTED_IMAGE_SIMPLE,
            description: (0, _jsxdevruntime.jsxDEV)("div", {
                children: [
                    (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            color: '#475569',
                            fontSize: 14,
                            display: 'block'
                        },
                        children: "输入协同治理相关问题，生成协同治理报告"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 316,
                        columnNumber: 15
                    }, void 0),
                    (0, _jsxdevruntime.jsxDEV)(Text, {
                        style: {
                            color: '#94A3B8',
                            fontSize: 12
                        },
                        children: "任务规划 → 图谱检索 → 实体统计 → 群体发现 → 协同治理 → 合规匹配 → 报告生成"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 319,
                        columnNumber: 15
                    }, void 0)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                lineNumber: 315,
                columnNumber: 13
            }, void 0)
        }, void 0, false, {
            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
            lineNumber: 312,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
        lineNumber: 311,
        columnNumber: 7
    }, this);
    const sortedPaths = (0, _react.useMemo)(()=>{
        if (!(report === null || report === void 0 ? void 0 : report.risk_paths)) return [];
        const order = {
            high: 0,
            medium: 1,
            low: 2
        };
        return [
            ...report.risk_paths
        ].sort((a, b)=>(order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3));
    }, [
        report
    ]);
    const displayedPaths = showAllPaths ? sortedPaths : sortedPaths.slice(0, 5);
    const entityStats = report === null || report === void 0 ? void 0 : report.entity_stats;
    const totalEntities = (entityStats === null || entityStats === void 0 ? void 0 : entityStats.total_entities) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : (_currentSubgraph_nodes = currentSubgraph.nodes) === null || _currentSubgraph_nodes === void 0 ? void 0 : _currentSubgraph_nodes.length) || (resolvedEntities === null || resolvedEntities === void 0 ? void 0 : resolvedEntities.length) || (report === null || report === void 0 ? void 0 : (_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) || 0;
    const topEntities = (entityStats === null || entityStats === void 0 ? void 0 : entityStats.top_entities) || [];
    const communityInfo = report === null || report === void 0 ? void 0 : report.community_info;
    const communities = (communityInfo === null || communityInfo === void 0 ? void 0 : communityInfo.communities) || (community === null || community === void 0 ? void 0 : community.communities) || [];
    const seededCommunityData = {
        ...community || {},
        ...communityInfo || {}
    };
    const communitySubgraph = seededCommunityData.subgraph || currentSubgraph;
    const connectedCommunitySubgraph = seededCommunityData.connected_subgraph || seededCommunityData.connectedSubgraph || currentSubgraph;
    const seedNodes = seededCommunityData.seed_nodes || seededCommunityData.seedNodes || [];
    const mergedEntityCommunityMap = seededCommunityData.entity_community_map || seededCommunityData.entityCommunityMap || entityCommunityMap || (report === null || report === void 0 ? void 0 : report.entity_community_map);
    const subgraphCounts = getGraphCounts(communitySubgraph);
    const connectedSubgraphCounts = getGraphCounts(connectedCommunitySubgraph);
    const communityAlgorithm = seededCommunityData.algorithm || seededCommunityData.selected_method || seededCommunityData.method;
    const riskSubjects = (0, _react.useMemo)(()=>{
        const seen = new Set();
        const subjects = [];
        const add = (name, type, id, source = '识别')=>{
            const cleanName = String(name || '').trim();
            if (!cleanName || seen.has(cleanName)) return;
            seen.add(cleanName);
            subjects.push({
                id: id || cleanName,
                name: cleanName,
                type: type || inferClientEntityType(cleanName),
                source
            });
        };
        (resolvedEntities || []).forEach((entity)=>{
            add(entity.name || entity.raw || entity.canonical_name, entity.type || entity.label, entity.kg_node_id || entity.id, '实体对齐');
        });
        topEntities.forEach((entity)=>add(entity.name, entity.type, entity.id, '图谱统计'));
        sortedEntities.forEach(([name])=>add(name, inferClientEntityType(name), name, '风险涉及'));
        ((currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.nodes) || []).forEach((node)=>{
            var _node_properties, _node_labels;
            add(node.name || ((_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.name) || node.id, node.type || node.label || ((_node_labels = node.labels) === null || _node_labels === void 0 ? void 0 : _node_labels[0]), node.id, '子图');
        });
        return subjects.slice(0, 12);
    }, [
        resolvedEntities,
        topEntities,
        sortedEntities,
        currentSubgraph
    ]);
    const seedFlowNodes = (0, _react.useMemo)(()=>{
        const normalized = (Array.isArray(seedNodes) ? seedNodes : []).map((node)=>({
                id: String(node.id || node.kg_node_id || getNodeDisplayName(node)),
                name: getNodeDisplayName(node),
                type: getNodeDisplayType(node)
            })).filter((node)=>node.name);
        if (normalized.length > 0) return normalized.slice(0, 6);
        return riskSubjects.slice(0, 6);
    }, [
        seedNodes,
        riskSubjects
    ]);
    const communityIdByNode = (0, _react.useMemo)(()=>{
        var _this;
        const map = new Map();
        const entityEntries = ((_this = mergedEntityCommunityMap) === null || _this === void 0 ? void 0 : _this.entities) || [];
        entityEntries.forEach((entry)=>{
            var _entry_communities_, _entry_communities;
            const communityId = entry === null || entry === void 0 ? void 0 : (_entry_communities = entry.communities) === null || _entry_communities === void 0 ? void 0 : (_entry_communities_ = _entry_communities[0]) === null || _entry_communities_ === void 0 ? void 0 : _entry_communities_.community_id;
            if (communityId === undefined || communityId === null) return;
            [
                entry.id,
                entry.name
            ].filter(Boolean).forEach((key)=>map.set(String(key), Number(communityId)));
        });
        communities.forEach((comm)=>{
            const communityId = Number(comm.community_id ?? comm.id ?? 0);
            (comm.member_ids || []).forEach((id)=>map.set(String(id), communityId));
            (comm.members || []).forEach((member)=>{
                [
                    member.id,
                    member.name
                ].filter(Boolean).forEach((key)=>map.set(String(key), communityId));
            });
            (comm.top_entities || comm.core_nodes || []).forEach((member)=>{
                [
                    member.id,
                    member.name
                ].filter(Boolean).forEach((key)=>map.set(String(key), communityId));
            });
        });
        return map;
    }, [
        mergedEntityCommunityMap,
        communities
    ]);
    const communityPreviewGraph = (0, _react.useMemo)(()=>{
        const graphNodes = (connectedCommunitySubgraph === null || connectedCommunitySubgraph === void 0 ? void 0 : connectedCommunitySubgraph.nodes) || (communitySubgraph === null || communitySubgraph === void 0 ? void 0 : communitySubgraph.nodes) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.nodes) || [];
        const graphEdges = (connectedCommunitySubgraph === null || connectedCommunitySubgraph === void 0 ? void 0 : connectedCommunitySubgraph.edges) || (communitySubgraph === null || communitySubgraph === void 0 ? void 0 : communitySubgraph.edges) || (currentSubgraph === null || currentSubgraph === void 0 ? void 0 : currentSubgraph.edges) || [];
        const nodes = graphNodes.slice(0, 38).map((node, index)=>{
            const id = String(node.id || getNodeDisplayName(node) || index);
            const name = getNodeDisplayName(node) || id;
            return {
                id,
                name,
                type: getNodeDisplayType(node),
                communityId: communityIdByNode.get(id) ?? communityIdByNode.get(name),
                isSeed: seedFlowNodes.some((seed)=>seed.id === id || seed.name === name),
                x: 50,
                y: 50
            };
        });
        const centers = [
            {
                x: 28,
                y: 36
            },
            {
                x: 66,
                y: 34
            },
            {
                x: 36,
                y: 68
            },
            {
                x: 72,
                y: 68
            },
            {
                x: 50,
                y: 50
            },
            {
                x: 18,
                y: 58
            }
        ];
        const grouped = new Map();
        nodes.forEach((node)=>{
            const key = node.communityId !== undefined ? String(node.communityId) : 'unknown';
            grouped.set(key, [
                ...grouped.get(key) || [],
                node
            ]);
        });
        Array.from(grouped.entries()).forEach(([key, group], groupIndex)=>{
            const center = centers[groupIndex % centers.length];
            const radius = group.length <= 1 ? 0 : Math.min(17, 8 + group.length * 1.4);
            group.forEach((node, index)=>{
                const angle = Math.PI * 2 * index / Math.max(group.length, 1) - Math.PI / 2;
                node.x = Math.max(6, Math.min(94, center.x + Math.cos(angle) * radius));
                node.y = Math.max(10, Math.min(90, center.y + Math.sin(angle) * radius));
                if (key === 'unknown') {
                    node.x = 14 + index * 23 % 72;
                    node.y = 18 + index * 31 % 62;
                }
            });
        });
        nodes.forEach((node)=>{
            const moved = communityNodePositions[node.id];
            if (moved) {
                node.x = moved.x;
                node.y = moved.y;
            }
        });
        const nodeById = new Map(nodes.map((node)=>[
                node.id,
                node
            ]));
        const nodeByName = new Map(nodes.map((node)=>[
                node.name,
                node
            ]));
        const edges = graphEdges.map((edge)=>{
            const sourceKey = getEdgeEndpoint(edge, 'source');
            const targetKey = getEdgeEndpoint(edge, 'target');
            const source = nodeById.get(sourceKey) || nodeByName.get(sourceKey);
            const target = nodeById.get(targetKey) || nodeByName.get(targetKey);
            if (!source || !target || source.id === target.id) return null;
            return {
                id: edge.id || `${source.id}-${target.id}`,
                source,
                target,
                relation: edge.relation || edge.type || edge.label || ''
            };
        }).filter(Boolean).slice(0, 90);
        return {
            nodes,
            edges,
            groups: Array.from(grouped.entries())
        };
    }, [
        connectedCommunitySubgraph,
        communitySubgraph,
        currentSubgraph,
        communityIdByNode,
        seedFlowNodes,
        communityNodePositions
    ]);
    const getCommunitySvgPoint = (0, _react.useCallback)((event)=>{
        const svg = event.currentTarget instanceof SVGSVGElement ? event.currentTarget : event.currentTarget.ownerSVGElement;
        const rect = svg === null || svg === void 0 ? void 0 : svg.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return {
            x: 50,
            y: 50
        };
        return {
            x: Math.max(4, Math.min(96, (event.clientX - rect.left) / rect.width * 100)),
            y: Math.max(8, Math.min(92, (event.clientY - rect.top) / rect.height * 100))
        };
    }, []);
    const handleCommunityNodePointerDown = (0, _react.useCallback)((event, nodeId)=>{
        var _event_currentTarget_setPointerCapture, _event_currentTarget;
        event.preventDefault();
        event.stopPropagation();
        (_event_currentTarget_setPointerCapture = (_event_currentTarget = event.currentTarget).setPointerCapture) === null || _event_currentTarget_setPointerCapture === void 0 || _event_currentTarget_setPointerCapture.call(_event_currentTarget, event.pointerId);
        setDraggingCommunityNodeId(nodeId);
        const point = getCommunitySvgPoint(event);
        setCommunityNodePositions((prev)=>({
                ...prev,
                [nodeId]: point
            }));
    }, [
        getCommunitySvgPoint
    ]);
    const handleCommunityGraphPointerMove = (0, _react.useCallback)((event)=>{
        if (!draggingCommunityNodeId) return;
        const point = getCommunitySvgPoint(event);
        setCommunityNodePositions((prev)=>({
                ...prev,
                [draggingCommunityNodeId]: point
            }));
    }, [
        draggingCommunityNodeId,
        getCommunitySvgPoint
    ]);
    const stopCommunityGraphDrag = (0, _react.useCallback)(()=>{
        setDraggingCommunityNodeId(null);
    }, []);
    const flowKeys = Array.isArray((_seededCommunityData_visualization = seededCommunityData.visualization) === null || _seededCommunityData_visualization === void 0 ? void 0 : _seededCommunityData_visualization.flow) ? seededCommunityData.visualization.flow : [
        'seed_nodes',
        'subgraph',
        'connected_subgraph',
        'communities'
    ];
    const flowLabelMap = {
        seed_nodes: '种子节点',
        n_hop_network: 'N 跳子图',
        subgraph: 'N 跳子图',
        connected_subgraph: '最大连通子图',
        communities: '群体结果'
    };
    const flowCards = [
        {
            key: 'seed_nodes',
            title: flowLabelMap[flowKeys[0]] || '种子节点',
            value: seedFlowNodes.length,
            desc: '风险主体输入'
        },
        {
            key: 'subgraph',
            title: flowLabelMap[flowKeys[1]] || 'N 跳子图',
            value: subgraphCounts.nodes,
            desc: `${subgraphCounts.edges} 条关系`
        },
        {
            key: 'connected_subgraph',
            title: flowLabelMap[flowKeys[2]] || '最大连通子图',
            value: connectedSubgraphCounts.nodes,
            desc: `${connectedSubgraphCounts.edges} 条关系`
        },
        {
            key: 'communities',
            title: flowLabelMap[flowKeys[3]] || '群体结果',
            value: communities.length,
            desc: '社区划分'
        }
    ];
    const compactSeedNames = seedFlowNodes.slice(0, 3).map((node)=>node.name);
    const visibleCommunities = communities.slice(0, 6);
    const riskTransmissionGraph = (0, _react.useMemo)(()=>{
        const levelOrder = {
            high: 0,
            medium: 1,
            low: 2
        };
        const communityNodes = new Map();
        const communityEdges = new Map();
        communities.forEach((comm)=>{
            const cid = Number(comm.community_id ?? comm.id ?? 0);
            const members = comm.members || comm.top_entities || [];
            communityNodes.set(cid, {
                id: cid,
                size: Number(comm.size || members.length || 0),
                label: `群体 #${cid}`,
                pathCount: 0,
                highCount: 0,
                mediumCount: 0,
                sampleEntities: members.slice(0, 3).map((m)=>m.name || String(m.id || '')),
                x: 50,
                y: 50
            });
        });
        const pathRows = sortedPaths.map((path)=>{
            const entitySteps = (path.affected_entities || []).map((name)=>{
                const cid = communityIdByNode.get(name);
                return {
                    name,
                    type: inferClientEntityType(name),
                    communityId: cid
                };
            });
            const communitySequence = entitySteps.map((step)=>step.communityId).filter((cid)=>cid !== undefined && cid !== null).filter((cid, index, arr)=>index === 0 || cid !== arr[index - 1]);
            communitySequence.forEach((cid)=>{
                const node = communityNodes.get(cid) || {
                    id: cid,
                    size: 0,
                    label: `群体 #${cid}`,
                    pathCount: 0,
                    highCount: 0,
                    mediumCount: 0,
                    sampleEntities: [],
                    x: 50,
                    y: 50
                };
                node.pathCount += 1;
                if (path.risk_level === 'high') node.highCount += 1;
                if (path.risk_level === 'medium') node.mediumCount += 1;
                communityNodes.set(cid, node);
            });
            for(let i = 0; i < communitySequence.length - 1; i += 1){
                const source = communitySequence[i];
                const target = communitySequence[i + 1];
                const key = `${source}->${target}`;
                const current = communityEdges.get(key) || {
                    source,
                    target,
                    count: 0,
                    level: path.risk_level,
                    pathIds: []
                };
                current.count += 1;
                current.pathIds.push(path.path_id);
                if ((levelOrder[path.risk_level] ?? 3) < (levelOrder[current.level] ?? 3)) current.level = path.risk_level;
                communityEdges.set(key, current);
            }
            return {
                path,
                entitySteps,
                communitySequence
            };
        });
        const nodes = Array.from(communityNodes.values()).filter((node)=>node.pathCount > 0 || communities.length <= 6).slice(0, 10);
        const centerX = 50;
        const centerY = 48;
        const radius = nodes.length <= 3 ? 26 : 34;
        nodes.forEach((node, index)=>{
            const angle = nodes.length === 1 ? -Math.PI / 2 : Math.PI * 2 * index / nodes.length - Math.PI / 2;
            node.x = nodes.length === 1 ? centerX : centerX + Math.cos(angle) * radius;
            node.y = nodes.length === 1 ? centerY : centerY + Math.sin(angle) * Math.min(radius, 28);
        });
        const nodeSet = new Set(nodes.map((node)=>node.id));
        const edges = Array.from(communityEdges.values()).filter((edge)=>nodeSet.has(edge.source) && nodeSet.has(edge.target));
        return {
            nodes,
            edges,
            pathRows
        };
    }, [
        sortedPaths,
        communities,
        communityIdByNode
    ]);
    return (0, _jsxdevruntime.jsxDEV)("div", {
        className: "risk-report-panel",
        style: {
            height: '100%',
            overflow: 'auto',
            padding: '12px 16px'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        @media print {
          body * { visibility: hidden; }
          .risk-report-panel, .risk-report-panel * { visibility: visible; }
          .risk-report-panel { position: absolute; left: 0; top: 0; width: 100%; padding: 20px 40px !important; }
          .no-print { display: none !important; }
        }
        @keyframes sectionHighlight {
          0%, 100% { border-color: #e2e8f0; }
          50% { border-color: #2855D1; box-shadow: 0 0 12px rgba(40,85,209,0.15); }
        }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                lineNumber: 649,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                },
                children: [
                    isLoading && stages.length > 0 && (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                        size: "small",
                        style: {
                            borderRadius: 8
                        },
                        className: "no-print",
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_antd.Steps, {
                                size: "small",
                                current: activeStep,
                                status: error ? 'error' : 'process',
                                items: stageOrder.map((key)=>({
                                        title: STAGE_LABELS[key] || key
                                    }))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 666,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginTop: 8,
                                    textAlign: 'center'
                                },
                                children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "secondary",
                                    style: {
                                        fontSize: 12
                                    },
                                    children: ((_stages_ = stages[stages.length - 1]) === null || _stages_ === void 0 ? void 0 : _stages_.content) || '初始化中...'
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 675,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 674,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 665,
                        columnNumber: 11
                    }, this),
                    isLoading && !report && stages.length === 0 && (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                        style: {
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 200
                        },
                        children: (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                textAlign: 'center'
                            },
                            children: [
                                (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                                    size: "large"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 686,
                                    columnNumber: 15
                                }, this),
                                (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        marginTop: 16,
                                        color: '#94a3b8',
                                        fontSize: 14
                                    },
                                    children: "正在初始化协同治理流程..."
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 687,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 685,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 684,
                        columnNumber: 11
                    }, this),
                    error && !report && (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                        style: {
                            borderRadius: 8
                        },
                        children: (0, _jsxdevruntime.jsxDEV)("div", {
                            style: {
                                textAlign: 'center',
                                padding: 24
                            },
                            children: [
                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "danger",
                                    style: {
                                        fontSize: 14,
                                        display: 'block',
                                        marginBottom: 12
                                    },
                                    children: [
                                        "协同治理分析失败: ",
                                        error
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 698,
                                    columnNumber: 15
                                }, this),
                                onRetry && (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 702,
                                        columnNumber: 31
                                    }, void 0),
                                    onClick: onRetry,
                                    children: "重试"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 702,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 697,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 696,
                        columnNumber: 11
                    }, this),
                    report && (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                        children: [
                            (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                style: {
                                    borderRadius: 8
                                },
                                className: "no-print",
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            background: 'linear-gradient(135deg, #2855D1 0%, #1A44B5 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            fontWeight: 700,
                                                            fontSize: 16,
                                                            flexShrink: 0
                                                        },
                                                        children: "W"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 714,
                                                        columnNumber: 19
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)(Title, {
                                                                level: 5,
                                                                style: {
                                                                    margin: 0,
                                                                    fontSize: 15
                                                                },
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                        style: {
                                                                            marginRight: 6,
                                                                            color: '#FFC101'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 733,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    "协同治理报告"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 732,
                                                                columnNumber: 21
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: [
                                                                    reportId,
                                                                    " · ",
                                                                    formatTimestamp(report.generated_at)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 736,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 731,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 713,
                                                columnNumber: 17
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "历史报告",
                                                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.HistoryOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 743,
                                                                columnNumber: 48
                                                            }, void 0),
                                                            onClick: loadHistory
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 743,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 742,
                                                        columnNumber: 19
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "导出 Markdown",
                                                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileMarkdownOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 746,
                                                                columnNumber: 48
                                                            }, void 0),
                                                            onClick: handleExportMD
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 746,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 745,
                                                        columnNumber: 19
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "导出 Word",
                                                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileWordOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 749,
                                                                columnNumber: 48
                                                            }, void 0),
                                                            onClick: handleExportWord
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 749,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 748,
                                                        columnNumber: 19
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                        title: "导出 PDF",
                                                        children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.FilePdfOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 752,
                                                                columnNumber: 48
                                                            }, void 0),
                                                            onClick: handleExportPDF
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 752,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 751,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 741,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 712,
                                        columnNumber: 15
                                    }, this),
                                    queryText && (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginTop: 6,
                                            padding: '4px 10px',
                                            background: '#f8fafc',
                                            borderRadius: 6
                                        },
                                        children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                            type: "secondary",
                                            style: {
                                                fontSize: 11
                                            },
                                            children: [
                                                "查询: ",
                                                queryText
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 758,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 757,
                                        columnNumber: 17
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginTop: 12,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            {
                                                key: 'entity-stats',
                                                label: '风险主体',
                                                icon: (0, _jsxdevruntime.jsxDEV)(_icons.TeamOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 765,
                                                    columnNumber: 63
                                                }, this),
                                                color: '#2855D1'
                                            },
                                            {
                                                key: 'community',
                                                label: '群体发现',
                                                icon: (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 766,
                                                    columnNumber: 60
                                                }, this),
                                                color: '#722ed1'
                                            },
                                            {
                                                key: 'risk-paths',
                                                label: '风险传导路径',
                                                icon: (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 63
                                                }, this),
                                                color: '#f5222d'
                                            },
                                            {
                                                key: 'final-report',
                                                label: '协同治理社区报告',
                                                icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 768,
                                                    columnNumber: 67
                                                }, this),
                                                color: '#0f766e'
                                            }
                                        ].map((step, idx, arr)=>(0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        size: "small",
                                                        type: "text",
                                                        icon: step.icon,
                                                        onClick: ()=>scrollToSection(step.key),
                                                        style: {
                                                            color: step.color,
                                                            padding: '0 6px',
                                                            height: 24
                                                        },
                                                        children: step.label
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 771,
                                                        columnNumber: 21
                                                    }, this),
                                                    idx < arr.length - 1 && (0, _jsxdevruntime.jsxDEV)(Text, {
                                                        type: "secondary",
                                                        style: {
                                                            fontSize: 12
                                                        },
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 780,
                                                        columnNumber: 46
                                                    }, this)
                                                ]
                                            }, step.key, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 770,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 763,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 711,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                id: "risk-section-entity-stats",
                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8,
                                        ...highlightSection === 'entity-stats' ? {
                                            animation: 'sectionHighlight 1s ease-in-out 2'
                                        } : {}
                                    },
                                    title: (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 13
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_icons.TeamOutlined, {
                                                style: {
                                                    marginRight: 8,
                                                    color: '#2855D1'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 796,
                                                columnNumber: 21
                                            }, void 0),
                                            "风险主体",
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    marginLeft: 8,
                                                    fontSize: 10
                                                },
                                                children: [
                                                    riskSubjects.length || totalEntities,
                                                    " 个主体"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 798,
                                                columnNumber: 21
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 795,
                                        columnNumber: 19
                                    }, void 0),
                                    children: riskSubjects.length > 0 ? (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 6,
                                            flexWrap: 'wrap'
                                        },
                                        children: riskSubjects.map((entity)=>{
                                            const color = _graphStyles.NODE_TYPE_COLORS[entity.type] || '#2855D1';
                                            const label = _graphStyles.NODE_TYPE_LABELS[entity.type] || entity.type;
                                            return (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    margin: 0,
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    padding: '4px 8px',
                                                    cursor: onJumpToGraph ? 'pointer' : 'default',
                                                    background: `${color}10`,
                                                    border: `1px solid ${color}40`,
                                                    color
                                                },
                                                onClick: ()=>onJumpToGraph === null || onJumpToGraph === void 0 ? void 0 : onJumpToGraph(entity.id, entity.name, entity.type),
                                                children: [
                                                    onJumpToGraph ? (0, _jsxdevruntime.jsxDEV)(_icons.LinkOutlined, {
                                                        style: {
                                                            marginRight: 4,
                                                            fontSize: 10
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 822,
                                                        columnNumber: 44
                                                    }, this) : null,
                                                    entity.name,
                                                    (0, _jsxdevruntime.jsxDEV)("span", {
                                                        style: {
                                                            color: '#94a3b8',
                                                            marginLeft: 6,
                                                            fontSize: 10
                                                        },
                                                        children: label
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 824,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, entity.id, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 808,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 803,
                                        columnNumber: 19
                                    }, this) : (0, _jsxdevruntime.jsxDEV)(Text, {
                                        type: "secondary",
                                        style: {
                                            fontSize: 12
                                        },
                                        children: isLoading ? '风险主体识别中...' : '暂无可展示的风险主体'
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 830,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 788,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 787,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                id: "risk-section-community",
                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8,
                                        ...highlightSection === 'community' ? {
                                            animation: 'sectionHighlight 1s ease-in-out 2'
                                        } : {}
                                    },
                                    title: (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 13
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {
                                                style: {
                                                    marginRight: 8,
                                                    color: '#722ed1'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 847,
                                                columnNumber: 21
                                            }, void 0),
                                            "群体发现",
                                            communities.length > 0 && (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                style: {
                                                    marginLeft: 8,
                                                    fontSize: 10
                                                },
                                                children: [
                                                    communities.length,
                                                    " 个群体"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 850,
                                                columnNumber: 23
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 846,
                                        columnNumber: 19
                                    }, void 0),
                                    children: (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    overflowX: 'auto',
                                                    paddingBottom: 2
                                                },
                                                children: (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(4, minmax(132px, 1fr))',
                                                        gap: 8,
                                                        minWidth: 560
                                                    },
                                                    children: flowCards.map((item, index)=>(0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                height: 72,
                                                                padding: '10px 12px',
                                                                borderRadius: 8,
                                                                border: '1px solid #e2e8f0',
                                                                background: index === 3 ? '#f5f3ff' : '#f8fafc'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 11,
                                                                        display: 'block'
                                                                    },
                                                                    children: item.title
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 869,
                                                                    columnNumber: 27
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    strong: true,
                                                                    style: {
                                                                        fontSize: 22,
                                                                        color: index === 3 ? '#722ed1' : '#0f172a',
                                                                        lineHeight: '28px'
                                                                    },
                                                                    children: item.value
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 870,
                                                                    columnNumber: 27
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 10,
                                                                        display: 'block'
                                                                    },
                                                                    children: item.desc
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 873,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, item.title, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 859,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 857,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 856,
                                                columnNumber: 19
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 10,
                                                    flexWrap: 'wrap',
                                                    padding: '8px 10px',
                                                    borderRadius: 8,
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0'
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                            flexWrap: 'wrap',
                                                            minWidth: 0
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                style: {
                                                                    margin: 0,
                                                                    borderRadius: 6,
                                                                    color: '#b45309',
                                                                    background: '#fffbeb',
                                                                    borderColor: '#fde68a'
                                                                },
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                        style: {
                                                                            marginRight: 4
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 894,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    "风险主体种子 ",
                                                                    seedFlowNodes.length,
                                                                    " 个"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 893,
                                                                columnNumber: 23
                                                            }, this),
                                                            compactSeedNames.length > 0 && (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: [
                                                                    compactSeedNames.join('、'),
                                                                    seedFlowNodes.length > compactSeedNames.length ? ` 等 ${seedFlowNodes.length} 个` : ''
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 898,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 892,
                                                        columnNumber: 21
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            flexWrap: 'wrap'
                                                        },
                                                        children: [
                                                            visibleCommunities.map((comm)=>{
                                                                const cid = Number(comm.community_id ?? comm.id ?? 0);
                                                                const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                                                                const members = comm.members || comm.top_entities || [];
                                                                const density = typeof comm.density === 'number' ? ` / 密度 ${comm.density.toFixed(2)}` : '';
                                                                return (0, _jsxdevruntime.jsxDEV)("span", {
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 5,
                                                                        fontSize: 11,
                                                                        color: '#475569'
                                                                    },
                                                                    children: [
                                                                        (0, _jsxdevruntime.jsxDEV)("span", {
                                                                            style: {
                                                                                width: 9,
                                                                                height: 9,
                                                                                borderRadius: '50%',
                                                                                background: color,
                                                                                boxShadow: `0 0 0 3px ${color}18`
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 911,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        "群体 #",
                                                                        cid,
                                                                        " · ",
                                                                        comm.size || members.length,
                                                                        " 成员",
                                                                        density
                                                                    ]
                                                                }, cid, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 910,
                                                                    columnNumber: 27
                                                                }, this);
                                                            }),
                                                            communities.length > visibleCommunities.length && (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: [
                                                                    "+",
                                                                    communities.length - visibleCommunities.length,
                                                                    " 个群体"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 917,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 903,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 879,
                                                columnNumber: 19
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    minHeight: 430,
                                                    borderRadius: 8,
                                                    border: '1px solid #e2e8f0',
                                                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                                                    padding: 14,
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            marginBottom: 8
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                        strong: true,
                                                                        style: {
                                                                            fontSize: 14,
                                                                            display: 'block'
                                                                        },
                                                                        children: "群体发现子图"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 935,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                        type: "secondary",
                                                                        style: {
                                                                            fontSize: 10
                                                                        },
                                                                        children: [
                                                                            connectedSubgraphCounts.nodes || subgraphCounts.nodes,
                                                                            " 节点 / ",
                                                                            connectedSubgraphCounts.edges || subgraphCounts.edges,
                                                                            " 关系",
                                                                            communityPreviewGraph.nodes.length < (connectedSubgraphCounts.nodes || subgraphCounts.nodes) && ` · 当前展示前 ${communityPreviewGraph.nodes.length} 个代表节点`
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 936,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 934,
                                                                columnNumber: 23
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                                size: 6,
                                                                children: [
                                                                    communityAlgorithm && (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                        style: {
                                                                            fontSize: 10,
                                                                            margin: 0
                                                                        },
                                                                        children: [
                                                                            "算法: ",
                                                                            communityAlgorithm
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 942,
                                                                        columnNumber: 48
                                                                    }, this),
                                                                    Object.keys(communityNodePositions).length > 0 && (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        size: "small",
                                                                        type: "text",
                                                                        icon: (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 947,
                                                                            columnNumber: 35
                                                                        }, void 0),
                                                                        onClick: ()=>{
                                                                            setCommunityNodePositions({});
                                                                            setDraggingCommunityNodeId(null);
                                                                        },
                                                                        style: {
                                                                            fontSize: 11,
                                                                            height: 24,
                                                                            padding: '0 6px'
                                                                        },
                                                                        children: "重置布局"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 944,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 941,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 933,
                                                        columnNumber: 21
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            position: 'relative',
                                                            height: 360,
                                                            borderRadius: 8,
                                                            background: '#ffffff',
                                                            border: '1px solid #dbeafe',
                                                            overflow: 'hidden'
                                                        },
                                                        children: communityPreviewGraph.nodes.length > 0 ? (0, _jsxdevruntime.jsxDEV)("svg", {
                                                            viewBox: "0 0 100 100",
                                                            preserveAspectRatio: "none",
                                                            onPointerMove: handleCommunityGraphPointerMove,
                                                            onPointerUp: stopCommunityGraphDrag,
                                                            onPointerLeave: stopCommunityGraphDrag,
                                                            style: {
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'block',
                                                                cursor: draggingCommunityNodeId ? 'grabbing' : 'default',
                                                                touchAction: 'none'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)("defs", {
                                                                    children: (0, _jsxdevruntime.jsxDEV)("filter", {
                                                                        id: "communityNodeShadow",
                                                                        x: "-50%",
                                                                        y: "-50%",
                                                                        width: "200%",
                                                                        height: "200%",
                                                                        children: (0, _jsxdevruntime.jsxDEV)("feDropShadow", {
                                                                            dx: "0",
                                                                            dy: "1",
                                                                            stdDeviation: "1.2",
                                                                            floodColor: "#0f172a",
                                                                            floodOpacity: "0.18"
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 977,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 976,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 975,
                                                                    columnNumber: 27
                                                                }, this),
                                                                communityPreviewGraph.groups.map(([groupKey, groupNodes], groupIndex)=>{
                                                                    if (groupKey === 'unknown' || !groupNodes.length) return null;
                                                                    const color = COMMUNITY_PALETTE[Number(groupKey) % COMMUNITY_PALETTE.length];
                                                                    const avgX = groupNodes.reduce((sum, node)=>sum + node.x, 0) / groupNodes.length;
                                                                    const avgY = groupNodes.reduce((sum, node)=>sum + node.y, 0) / groupNodes.length;
                                                                    const radius = Math.min(28, Math.max(12, 7 + groupNodes.length * 1.8));
                                                                    return (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                        cx: avgX,
                                                                        cy: avgY,
                                                                        r: radius,
                                                                        fill: `${color}10`,
                                                                        stroke: `${color}35`,
                                                                        strokeWidth: "0.5",
                                                                        strokeDasharray: "2 1.5"
                                                                    }, groupKey, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 987,
                                                                        columnNumber: 31
                                                                    }, this);
                                                                }),
                                                                communityPreviewGraph.edges.map((edge, index)=>(0, _jsxdevruntime.jsxDEV)("line", {
                                                                        x1: edge.source.x,
                                                                        y1: edge.source.y,
                                                                        x2: edge.target.x,
                                                                        y2: edge.target.y,
                                                                        stroke: "#94a3b8",
                                                                        strokeWidth: "0.42",
                                                                        strokeOpacity: "0.55",
                                                                        vectorEffect: "non-scaling-stroke",
                                                                        children: (0, _jsxdevruntime.jsxDEV)("title", {
                                                                            children: edge.relation || '关系'
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1011,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, `${edge.id}-${index}`, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1000,
                                                                        columnNumber: 29
                                                                    }, this)),
                                                                communityPreviewGraph.nodes.map((node, index)=>{
                                                                    const color = node.communityId !== undefined ? COMMUNITY_PALETTE[node.communityId % COMMUNITY_PALETTE.length] : _graphStyles.NODE_TYPE_COLORS[node.type] || '#64748b';
                                                                    const showLabel = hoveredCommunityNodeId === node.id || draggingCommunityNodeId === node.id;
                                                                    const label = node.name.length > 14 ? `${node.name.slice(0, 13)}...` : node.name;
                                                                    const labelWidth = Math.max(18, Math.min(46, label.length * 3.1 + 6));
                                                                    const labelX = Math.min(96 - labelWidth, Math.max(4, node.x + 2.8));
                                                                    const labelY = Math.max(6, node.y - 6.2);
                                                                    return (0, _jsxdevruntime.jsxDEV)("g", {
                                                                        onPointerDown: (event)=>handleCommunityNodePointerDown(event, node.id),
                                                                        onPointerUp: stopCommunityGraphDrag,
                                                                        onPointerEnter: ()=>setHoveredCommunityNodeId(node.id),
                                                                        onPointerLeave: ()=>setHoveredCommunityNodeId((current)=>current === node.id ? null : current),
                                                                        style: {
                                                                            cursor: draggingCommunityNodeId === node.id ? 'grabbing' : 'grab'
                                                                        },
                                                                        children: [
                                                                            (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                children: `${node.name}${node.communityId !== undefined ? ` / 群体 #${node.communityId}` : ''}`
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1032,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            node.isSeed && (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                cx: node.x,
                                                                                cy: node.y,
                                                                                r: "2.7",
                                                                                fill: "none",
                                                                                stroke: "#f59e0b",
                                                                                strokeWidth: "1",
                                                                                vectorEffect: "non-scaling-stroke"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1034,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                cx: node.x,
                                                                                cy: node.y,
                                                                                r: node.isSeed ? 1.85 : 1.45,
                                                                                fill: color,
                                                                                stroke: "#ffffff",
                                                                                strokeWidth: "0.7",
                                                                                filter: "url(#communityNodeShadow)",
                                                                                vectorEffect: "non-scaling-stroke"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1044,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            showLabel && (0, _jsxdevruntime.jsxDEV)("g", {
                                                                                style: {
                                                                                    pointerEvents: 'none'
                                                                                },
                                                                                children: [
                                                                                    (0, _jsxdevruntime.jsxDEV)("rect", {
                                                                                        x: labelX,
                                                                                        y: labelY,
                                                                                        width: labelWidth,
                                                                                        height: "7.2",
                                                                                        rx: "1.8",
                                                                                        fill: "#ffffff",
                                                                                        stroke: `${color}55`,
                                                                                        strokeWidth: "0.45",
                                                                                        vectorEffect: "non-scaling-stroke"
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1056,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                        x: labelX + 3,
                                                                                        y: labelY + 4.9,
                                                                                        fontSize: "2.65",
                                                                                        fill: "#334155",
                                                                                        children: label
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1067,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1055,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, `${node.id}-${index}`, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1024,
                                                                        columnNumber: 31
                                                                    }, this);
                                                                })
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 961,
                                                            columnNumber: 25
                                                        }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 12
                                                                },
                                                                children: "等待子图数据"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1083,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1082,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 959,
                                                        columnNumber: 21
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 10,
                                                            flexWrap: 'wrap',
                                                            marginTop: 10,
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            seedFlowNodes.length > 0 && (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 5,
                                                                    fontSize: 11,
                                                                    color: '#475569'
                                                                },
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)("span", {
                                                                        style: {
                                                                            width: 10,
                                                                            height: 10,
                                                                            borderRadius: '50%',
                                                                            background: '#2563eb',
                                                                            border: '2px solid #f59e0b'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1090,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    "种子节点"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1089,
                                                                columnNumber: 25
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                type: "secondary",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: "节点可拖拽调整位置，悬浮显示名称；大规模子图默认抽样展示，避免成员列表刷屏。"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1094,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1087,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 922,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 855,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 839,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 838,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                id: "risk-section-risk-paths",
                                children: sortedPaths.length > 0 ? (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8,
                                        ...highlightSection === 'risk-paths' ? {
                                            animation: 'sectionHighlight 1s ease-in-out 2'
                                        } : {}
                                    },
                                    title: (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 13
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                                style: {
                                                    marginRight: 8,
                                                    color: '#f5222d'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1114,
                                                columnNumber: 23
                                            }, void 0),
                                            "风险传导路径 (",
                                            sortedPaths.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1113,
                                        columnNumber: 21
                                    }, void 0),
                                    extra: (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        size: 4,
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "error",
                                                style: {
                                                    fontSize: 10,
                                                    borderRadius: 4
                                                },
                                                children: [
                                                    "高风险 ",
                                                    highCount
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1120,
                                                columnNumber: 23
                                            }, void 0),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "warning",
                                                style: {
                                                    fontSize: 10,
                                                    borderRadius: 4
                                                },
                                                children: [
                                                    "中风险 ",
                                                    mediumCount
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 23
                                            }, void 0),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "success",
                                                style: {
                                                    fontSize: 10,
                                                    borderRadius: 4
                                                },
                                                children: [
                                                    "低风险 ",
                                                    lowCount
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1122,
                                                columnNumber: 23
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1119,
                                        columnNumber: 21
                                    }, void 0),
                                    children: [
                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 10,
                                                flexWrap: 'wrap',
                                                marginBottom: 10
                                            },
                                            children: [
                                                (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                    size: 0,
                                                    style: {
                                                        padding: 2,
                                                        borderRadius: 8,
                                                        background: '#f1f5f9',
                                                        border: '1px solid #e2e8f0'
                                                    },
                                                    children: [
                                                        (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            type: riskPathMode === 'community' ? 'primary' : 'text',
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.ClusterOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1131,
                                                                columnNumber: 31
                                                            }, void 0),
                                                            onClick: ()=>setRiskPathMode('community'),
                                                            style: {
                                                                borderRadius: 6,
                                                                fontSize: 12
                                                            },
                                                            children: "群体间传导"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1128,
                                                            columnNumber: 23
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                            size: "small",
                                                            type: riskPathMode === 'node' ? 'primary' : 'text',
                                                            icon: (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1140,
                                                                columnNumber: 31
                                                            }, void 0),
                                                            onClick: ()=>setRiskPathMode('node'),
                                                            style: {
                                                                borderRadius: 6,
                                                                fontSize: 12
                                                            },
                                                            children: "具体节点路径"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1137,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1127,
                                                    columnNumber: 21
                                                }, this),
                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    type: "secondary",
                                                    style: {
                                                        fontSize: 11
                                                    },
                                                    children: "群体视图看社区之间的风险扩散，节点视图看每条路径的实体链路"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1147,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1126,
                                            columnNumber: 19
                                        }, this),
                                        riskPathMode === 'community' ? (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                                                gap: 12
                                            },
                                            children: [
                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 8,
                                                        background: '#ffffff',
                                                        overflow: 'hidden'
                                                    },
                                                    children: [
                                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '10px 12px',
                                                                borderBottom: '1px solid #e2e8f0',
                                                                background: '#f8fafc'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    strong: true,
                                                                    style: {
                                                                        fontSize: 13
                                                                    },
                                                                    children: "群体社区之间的关系"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1156,
                                                                    columnNumber: 27
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 11,
                                                                        display: 'block'
                                                                    },
                                                                    children: [
                                                                        riskTransmissionGraph.nodes.length,
                                                                        " 个群体 / ",
                                                                        riskTransmissionGraph.edges.length,
                                                                        " 条传导关系"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1157,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1155,
                                                            columnNumber: 25
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                height: 260,
                                                                position: 'relative'
                                                            },
                                                            children: riskTransmissionGraph.nodes.length > 0 ? (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                viewBox: "0 0 100 100",
                                                                preserveAspectRatio: "none",
                                                                style: {
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    display: 'block'
                                                                },
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)("defs", {
                                                                        children: (0, _jsxdevruntime.jsxDEV)("marker", {
                                                                            id: "riskArrow",
                                                                            markerWidth: "8",
                                                                            markerHeight: "8",
                                                                            refX: "7",
                                                                            refY: "4",
                                                                            orient: "auto",
                                                                            markerUnits: "strokeWidth",
                                                                            children: (0, _jsxdevruntime.jsxDEV)("path", {
                                                                                d: "M0,0 L8,4 L0,8 Z",
                                                                                fill: "#64748b"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1166,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1165,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1164,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    riskTransmissionGraph.edges.map((edge, index)=>{
                                                                        const source = riskTransmissionGraph.nodes.find((node)=>node.id === edge.source);
                                                                        const target = riskTransmissionGraph.nodes.find((node)=>node.id === edge.target);
                                                                        if (!source || !target) return null;
                                                                        return (0, _jsxdevruntime.jsxDEV)("line", {
                                                                            x1: source.x,
                                                                            y1: source.y,
                                                                            x2: target.x,
                                                                            y2: target.y,
                                                                            stroke: RISK_LEVEL_COLORS[edge.level] || '#64748b',
                                                                            strokeWidth: Math.min(2.8, 0.8 + edge.count * 0.45),
                                                                            strokeOpacity: "0.72",
                                                                            markerEnd: "url(#riskArrow)",
                                                                            vectorEffect: "non-scaling-stroke",
                                                                            children: (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                children: `${source.label} → ${target.label} / ${edge.count} 条路径`
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                lineNumber: 1186,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        }, `${edge.source}-${edge.target}-${index}`, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1174,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    }),
                                                                    riskTransmissionGraph.nodes.map((node)=>{
                                                                        const color = COMMUNITY_PALETTE[node.id % COMMUNITY_PALETTE.length];
                                                                        const nodeRiskColor = node.highCount > 0 ? RISK_LEVEL_COLORS.high : node.mediumCount > 0 ? RISK_LEVEL_COLORS.medium : color;
                                                                        return (0, _jsxdevruntime.jsxDEV)("g", {
                                                                            children: [
                                                                                (0, _jsxdevruntime.jsxDEV)("title", {
                                                                                    children: `${node.label} / ${node.size} 成员 / ${node.pathCount} 条路径`
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1195,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                    cx: node.x,
                                                                                    cy: node.y,
                                                                                    r: "8.5",
                                                                                    fill: `${color}18`,
                                                                                    stroke: nodeRiskColor,
                                                                                    strokeWidth: "1.4",
                                                                                    vectorEffect: "non-scaling-stroke"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1196,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)("circle", {
                                                                                    cx: node.x,
                                                                                    cy: node.y,
                                                                                    r: "3.2",
                                                                                    fill: color,
                                                                                    stroke: "#ffffff",
                                                                                    strokeWidth: "0.8",
                                                                                    vectorEffect: "non-scaling-stroke"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1197,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                    x: node.x,
                                                                                    y: node.y + 13,
                                                                                    textAnchor: "middle",
                                                                                    fontSize: "3.1",
                                                                                    fill: "#334155",
                                                                                    stroke: "#ffffff",
                                                                                    strokeWidth: "0.65",
                                                                                    paintOrder: "stroke",
                                                                                    children: node.label
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1198,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)("text", {
                                                                                    x: node.x,
                                                                                    y: node.y + 17,
                                                                                    textAnchor: "middle",
                                                                                    fontSize: "2.4",
                                                                                    fill: "#64748b",
                                                                                    stroke: "#ffffff",
                                                                                    strokeWidth: "0.5",
                                                                                    paintOrder: "stroke",
                                                                                    children: [
                                                                                        node.size,
                                                                                        " 成员"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1201,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, node.id, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1194,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1163,
                                                                columnNumber: 29
                                                            }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                },
                                                                children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    type: "secondary",
                                                                    style: {
                                                                        fontSize: 12
                                                                    },
                                                                    children: "暂无可映射的群体传导关系"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1210,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1209,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1161,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1154,
                                                    columnNumber: 23
                                                }, this),
                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8
                                                    },
                                                    children: riskTransmissionGraph.pathRows.slice(0, showAllPaths ? riskTransmissionGraph.pathRows.length : 5).map(({ path, communitySequence })=>(0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                padding: '10px 12px',
                                                                borderRadius: 8,
                                                                background: '#f8fafc',
                                                                border: '1px solid #e2e8f0'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 6,
                                                                        marginBottom: 6,
                                                                        flexWrap: 'wrap'
                                                                    },
                                                                    children: [
                                                                        (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                            color: RISK_LEVEL_COLORS[path.risk_level],
                                                                            style: {
                                                                                fontSize: 10,
                                                                                borderRadius: 4,
                                                                                margin: 0
                                                                            },
                                                                            children: path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1220,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            strong: true,
                                                                            style: {
                                                                                fontSize: 12
                                                                            },
                                                                            children: path.path_id
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1223,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        path.confidence !== undefined && (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                            style: {
                                                                                fontSize: 10,
                                                                                borderRadius: 4,
                                                                                margin: 0
                                                                            },
                                                                            children: [
                                                                                (path.confidence * 100).toFixed(0),
                                                                                "%"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1225,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1219,
                                                                    columnNumber: 29
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 4,
                                                                        flexWrap: 'wrap',
                                                                        marginBottom: 6
                                                                    },
                                                                    children: communitySequence.length > 0 ? communitySequence.map((cid, idx)=>{
                                                                        const color = COMMUNITY_PALETTE[cid % COMMUNITY_PALETTE.length];
                                                                        return (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                                            children: [
                                                                                idx > 0 && (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                    style: {
                                                                                        color: '#94a3b8',
                                                                                        fontSize: 11
                                                                                    },
                                                                                    children: "→"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1233,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                    style: {
                                                                                        margin: 0,
                                                                                        borderRadius: 6,
                                                                                        fontSize: 11,
                                                                                        color,
                                                                                        background: `${color}10`,
                                                                                        border: `1px solid ${color}40`
                                                                                    },
                                                                                    children: [
                                                                                        "群体 #",
                                                                                        cid
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1234,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, `${path.path_id}-${cid}-${idx}`, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1232,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    }) : (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                        type: "secondary",
                                                                        style: {
                                                                            fontSize: 11
                                                                        },
                                                                        children: "该路径暂未映射到群体"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1240,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1228,
                                                                    columnNumber: 29
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    style: {
                                                                        fontSize: 12,
                                                                        color: '#475569'
                                                                    },
                                                                    children: path.path_description
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1243,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, path.path_id, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1218,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1216,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1153,
                                            columnNumber: 21
                                        }, this) : (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 8
                                            },
                                            children: displayedPaths.map((path)=>{
                                                var _path_affected_entities;
                                                return (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        padding: '10px 12px',
                                                        background: '#f8fafc',
                                                        borderRadius: 6,
                                                        borderLeft: `4px solid ${RISK_LEVEL_COLORS[path.risk_level] || '#fa8c16'}`
                                                    },
                                                    children: [
                                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 6,
                                                                marginBottom: 4,
                                                                flexWrap: 'wrap'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                    color: RISK_LEVEL_COLORS[path.risk_level],
                                                                    style: {
                                                                        fontSize: 10,
                                                                        borderRadius: 4,
                                                                        lineHeight: '18px',
                                                                        margin: 0
                                                                    },
                                                                    children: path.risk_level === 'high' ? '高风险' : path.risk_level === 'medium' ? '中风险' : '低风险'
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1261,
                                                                    columnNumber: 29
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                    strong: true,
                                                                    style: {
                                                                        fontSize: 12
                                                                    },
                                                                    children: path.path_id
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1264,
                                                                    columnNumber: 29
                                                                }, this),
                                                                path.confidence !== undefined && (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                    style: {
                                                                        fontSize: 10,
                                                                        borderRadius: 4,
                                                                        lineHeight: '18px',
                                                                        margin: 0,
                                                                        background: '#f0f5ff',
                                                                        border: '1px solid #d6e4ff',
                                                                        color: '#2855D1'
                                                                    },
                                                                    children: [
                                                                        (path.confidence * 100).toFixed(0),
                                                                        "%"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1266,
                                                                    columnNumber: 31
                                                                }, this),
                                                                onJumpToGraph && ((_path_affected_entities = path.affected_entities) === null || _path_affected_entities === void 0 ? void 0 : _path_affected_entities.length) > 0 && (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                    size: "small",
                                                                    type: "link",
                                                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.EyeOutlined, {}, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1274,
                                                                        columnNumber: 39
                                                                    }, void 0),
                                                                    style: {
                                                                        fontSize: 10,
                                                                        padding: 0,
                                                                        height: 20
                                                                    },
                                                                    onClick: ()=>onJumpToGraph(path.affected_entities[0], path.affected_entities[0], 'Entity'),
                                                                    children: "查看图谱"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1271,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1260,
                                                            columnNumber: 27
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)(Text, {
                                                            style: {
                                                                fontSize: 12,
                                                                color: '#475569'
                                                            },
                                                            children: path.path_description
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1282,
                                                            columnNumber: 27
                                                        }, this),
                                                        path.affected_entities && path.affected_entities.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                marginTop: 8,
                                                                overflowX: 'auto',
                                                                paddingBottom: 4
                                                            },
                                                            children: (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 6,
                                                                    minWidth: 'max-content'
                                                                },
                                                                children: [
                                                                    path.affected_entities.slice(0, 12).map((entity, idx)=>{
                                                                        const etype = inferClientEntityType(entity);
                                                                        const color = _graphStyles.NODE_TYPE_COLORS[etype] || '#8c8c8c';
                                                                        const label = _graphStyles.NODE_TYPE_LABELS[etype] || etype;
                                                                        return (0, _jsxdevruntime.jsxDEV)(_react.default.Fragment, {
                                                                            children: [
                                                                                idx > 0 && (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                    style: {
                                                                                        color: '#94a3b8',
                                                                                        fontSize: 14
                                                                                    },
                                                                                    children: "→"
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1292,
                                                                                    columnNumber: 51
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                                    title: `${label}: ${entity}`,
                                                                                    children: (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            borderRadius: 16,
                                                                                            cursor: onJumpToGraph ? 'pointer' : 'default',
                                                                                            border: `1px solid ${color}40`,
                                                                                            background: `${color}10`,
                                                                                            color,
                                                                                            margin: 0,
                                                                                            padding: '3px 9px'
                                                                                        },
                                                                                        onClick: ()=>onJumpToGraph === null || onJumpToGraph === void 0 ? void 0 : onJumpToGraph(entity, entity, etype),
                                                                                        children: entity.length > 14 ? entity.slice(0, 12) + '...' : entity
                                                                                    }, void 0, false, {
                                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                        lineNumber: 1294,
                                                                                        columnNumber: 41
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1293,
                                                                                    columnNumber: 39
                                                                                }, this)
                                                                            ]
                                                                        }, entity, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1291,
                                                                            columnNumber: 37
                                                                        }, this);
                                                                    }),
                                                                    path.affected_entities.length > 12 && (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                        type: "secondary",
                                                                        style: {
                                                                            fontSize: 10,
                                                                            marginLeft: 4
                                                                        },
                                                                        children: [
                                                                            "+",
                                                                            path.affected_entities.length - 12,
                                                                            " 更多"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                        lineNumber: 1309,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1285,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1284,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, path.path_id, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1251,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1249,
                                            columnNumber: 21
                                        }, this),
                                        sortedPaths.length > 5 && (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "link",
                                            size: "small",
                                            onClick: ()=>setShowAllPaths(!showAllPaths),
                                            style: {
                                                marginTop: 8,
                                                padding: 0
                                            },
                                            children: showAllPaths ? '收起，仅显示前 5 条' : `展开全部 ${sortedPaths.length} 条路径`
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1319,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 1106,
                                    columnNumber: 17
                                }, this) : (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8
                                    },
                                    title: (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 13
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_icons.NodeIndexOutlined, {
                                                style: {
                                                    marginRight: 8,
                                                    color: '#f5222d'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1335,
                                                columnNumber: 23
                                            }, void 0),
                                            "风险传导路径"
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1334,
                                        columnNumber: 21
                                    }, void 0),
                                    children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                        type: "secondary",
                                        style: {
                                            fontSize: 12
                                        },
                                        children: isLoading ? '风险路径分析进行中...' : '未检测到风险传导路径'
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1340,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 1330,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1104,
                                columnNumber: 13
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                id: "risk-section-final-report",
                                ref: finalReportRef,
                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        borderRadius: 8,
                                        border: highlightSection === 'final-report' ? '2px solid #2855D1' : undefined,
                                        transition: 'border-color 0.5s ease',
                                        ...highlightSection === 'final-report' ? {
                                            animation: 'sectionHighlight 1s ease-in-out 2'
                                        } : {}
                                    },
                                    title: (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 13
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {
                                                style: {
                                                    marginRight: 8,
                                                    color: '#2855D1'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1359,
                                                columnNumber: 21
                                            }, void 0),
                                            "协同治理社区报告"
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1358,
                                        columnNumber: 19
                                    }, void 0),
                                    extra: (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        size: 4,
                                        className: "no-print",
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                title: "导出 Markdown",
                                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileMarkdownOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1366,
                                                        columnNumber: 50
                                                    }, void 0),
                                                    onClick: handleExportMD
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1366,
                                                    columnNumber: 23
                                                }, void 0)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1365,
                                                columnNumber: 21
                                            }, void 0),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                title: "导出 Word",
                                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.FileWordOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1369,
                                                        columnNumber: 50
                                                    }, void 0),
                                                    onClick: handleExportWord
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1369,
                                                    columnNumber: 23
                                                }, void 0)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1368,
                                                columnNumber: 21
                                            }, void 0),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                title: "导出 PDF",
                                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.FilePdfOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1372,
                                                        columnNumber: 50
                                                    }, void 0),
                                                    onClick: handleExportPDF
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1372,
                                                    columnNumber: 23
                                                }, void 0)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1371,
                                                columnNumber: 21
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1364,
                                        columnNumber: 19
                                    }, void 0),
                                    children: [
                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: 12,
                                                marginBottom: 12
                                            },
                                            children: (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    flex: 1,
                                                    minWidth: 200
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)(Title, {
                                                        level: 5,
                                                        style: {
                                                            margin: '0 0 8px',
                                                            fontSize: 15
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {
                                                                style: {
                                                                    marginRight: 8,
                                                                    color: '#FFC101'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                lineNumber: 1380,
                                                                columnNumber: 23
                                                            }, this),
                                                            "社区治理结论"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1379,
                                                        columnNumber: 21
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)(Paragraph, {
                                                        ellipsis: {
                                                            rows: 4,
                                                            expandable: true
                                                        },
                                                        style: {
                                                            color: '#475569',
                                                            fontSize: 13,
                                                            marginBottom: 0
                                                        },
                                                        children: report.executive_summary
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                        lineNumber: 1383,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1378,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1377,
                                            columnNumber: 17
                                        }, this),
                                        report.integrated_report || report.markdown_report ? (0, _jsxdevruntime.jsxDEV)("div", {
                                            className: "markdown-report",
                                            style: {
                                                fontSize: 13,
                                                lineHeight: 1.75,
                                                color: '#334155',
                                                marginTop: 12,
                                                padding: '14px 16px',
                                                background: '#f8fafc',
                                                borderRadius: 8
                                            },
                                            children: (0, _jsxdevruntime.jsxDEV)(_reactmarkdown.default, {
                                                children: report.integrated_report || report.markdown_report
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1394,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1393,
                                            columnNumber: 19
                                        }, this) : null,
                                        (governancePlan === null || governancePlan === void 0 ? void 0 : governancePlan.actions) && governancePlan.actions.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                marginTop: 12
                                            },
                                            children: [
                                                (0, _jsxdevruntime.jsxDEV)(Text, {
                                                    strong: true,
                                                    style: {
                                                        fontSize: 13,
                                                        display: 'block',
                                                        marginBottom: 8
                                                    },
                                                    children: "协同处置动作"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1400,
                                                    columnNumber: 21
                                                }, this),
                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    },
                                                    children: governancePlan.actions.slice(0, 4).map((action, idx)=>{
                                                        const urgency = URGENCY_TAGS[action.priority] || URGENCY_TAGS.normal;
                                                        return (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: 8,
                                                                padding: '8px 12px',
                                                                background: action.priority === 'urgent' ? '#fff2f0' : '#f8fafc',
                                                                borderRadius: 6,
                                                                border: action.priority === 'urgent' ? '1px solid #ffccc7' : '1px solid #e2e8f0'
                                                            },
                                                            children: [
                                                                (0, _jsxdevruntime.jsxDEV)("span", {
                                                                    style: {
                                                                        fontSize: 18,
                                                                        fontWeight: 700,
                                                                        color: urgency.color,
                                                                        minWidth: 24,
                                                                        textAlign: 'center',
                                                                        lineHeight: 1.2
                                                                    },
                                                                    children: idx + 1
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1417,
                                                                    columnNumber: 29
                                                                }, this),
                                                                (0, _jsxdevruntime.jsxDEV)("div", {
                                                                    style: {
                                                                        flex: 1
                                                                    },
                                                                    children: [
                                                                        (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            strong: true,
                                                                            style: {
                                                                                fontSize: 12
                                                                            },
                                                                            children: action.measure
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1421,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        (0, _jsxdevruntime.jsxDEV)(Text, {
                                                                            style: {
                                                                                fontSize: 11,
                                                                                color: '#94a3b8',
                                                                                display: 'block'
                                                                            },
                                                                            children: [
                                                                                action.target,
                                                                                " · ",
                                                                                action.risk_issue
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1422,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        (0, _jsxdevruntime.jsxDEV)("div", {
                                                                            style: {
                                                                                marginTop: 4,
                                                                                display: 'flex',
                                                                                gap: 4,
                                                                                flexWrap: 'wrap'
                                                                            },
                                                                            children: [
                                                                                (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                    color: urgency.color,
                                                                                    style: {
                                                                                        borderRadius: 4,
                                                                                        fontSize: 10,
                                                                                        margin: 0
                                                                                    },
                                                                                    children: urgency.label
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1426,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                    style: {
                                                                                        borderRadius: 4,
                                                                                        fontSize: 10,
                                                                                        margin: 0
                                                                                    },
                                                                                    children: action.department
                                                                                }, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                                    lineNumber: 1429,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                            lineNumber: 1425,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                                    lineNumber: 1420,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                            lineNumber: 1405,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                    lineNumber: 1401,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                            lineNumber: 1399,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 1349,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1348,
                                columnNumber: 13
                            }, this),
                            error && report && (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                style: {
                                    borderRadius: 8,
                                    border: '1px solid #ffccc7'
                                },
                                className: "no-print",
                                children: (0, _jsxdevruntime.jsxDEV)(Text, {
                                    type: "danger",
                                    style: {
                                        fontSize: 12
                                    },
                                    children: [
                                        "注意: ",
                                        error
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                    lineNumber: 1444,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1443,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                lineNumber: 662,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                title: "历史报告",
                open: historyOpen,
                onClose: ()=>setHistoryOpen(false),
                width: 360,
                children: historyLoading ? (0, _jsxdevruntime.jsxDEV)("div", {
                    style: {
                        textAlign: 'center',
                        padding: 40
                    },
                    children: (0, _jsxdevruntime.jsxDEV)(_antd.Spin, {
                        indicator: (0, _jsxdevruntime.jsxDEV)(_icons.LoadingOutlined, {
                            spin: true
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 1461,
                            columnNumber: 30
                        }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                        lineNumber: 1461,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 1460,
                    columnNumber: 11
                }, this) : historyReports.length === 0 ? (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                    description: "暂无历史报告",
                    image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 1464,
                    columnNumber: 11
                }, this) : (0, _jsxdevruntime.jsxDEV)(_antd.List, {
                    dataSource: historyReports,
                    renderItem: (item)=>{
                        var _item_overall_risk_level;
                        return (0, _jsxdevruntime.jsxDEV)(_antd.List.Item, {
                            style: {
                                cursor: 'pointer',
                                padding: '10px 12px',
                                borderRadius: 6
                            },
                            onClick: ()=>loadHistoryReport(item.report_id),
                            children: (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    width: '100%'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)(Text, {
                                                strong: true,
                                                style: {
                                                    fontSize: 12
                                                },
                                                children: item.report_id
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1475,
                                                columnNumber: 21
                                            }, void 0),
                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: RISK_LEVEL_COLORS[item.overall_risk_level] || '#fa8c16',
                                                style: {
                                                    borderRadius: 4,
                                                    fontSize: 10
                                                },
                                                children: RISK_LEVEL_LABELS[item.overall_risk_level] || ((_item_overall_risk_level = item.overall_risk_level) === null || _item_overall_risk_level === void 0 ? void 0 : _item_overall_risk_level.toUpperCase())
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                                lineNumber: 1476,
                                                columnNumber: 21
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1474,
                                        columnNumber: 19
                                    }, void 0),
                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                        type: "secondary",
                                        style: {
                                            fontSize: 11,
                                            display: 'block'
                                        },
                                        children: item.query_summary || '-'
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1483,
                                        columnNumber: 19
                                    }, void 0),
                                    (0, _jsxdevruntime.jsxDEV)(Text, {
                                        type: "secondary",
                                        style: {
                                            fontSize: 10
                                        },
                                        children: [
                                            item.generated_at ? formatTimestamp(item.generated_at) : '',
                                            " · ",
                                            item.subtasks_completed,
                                            " 个子任务"
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                        lineNumber: 1486,
                                        columnNumber: 19
                                    }, void 0)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                                lineNumber: 1473,
                                columnNumber: 17
                            }, void 0)
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                            lineNumber: 1469,
                            columnNumber: 15
                        }, void 0);
                    }
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                    lineNumber: 1466,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
                lineNumber: 1453,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/RiskReportPanel.tsx",
        lineNumber: 648,
        columnNumber: 5
    }, this);
};
_s(RiskReportPanel, "hAXFpttjM3v2iCcddnTWCAhfrnQ=", false, function() {
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
var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
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
const { Text } = _antd.Typography;
const { TextArea } = _antd.Input;
const WorkspaceContainer = ({ messages, isLoading, pendingRecommendations, onSendMessage, onClearHistory, onEntityHover, onEntityClick, highlightedEntity, graphInjectedEntity, onClearGraphInject })=>{
    _s();
    const [input, setInput] = (0, _react.useState)('');
    const [contextTags, setContextTags] = (0, _react.useState)([]);
    const messagesContainerRef = (0, _react.useRef)(null);
    const messagesEndRef = (0, _react.useRef)(null);
    const inputRef = (0, _react.useRef)(null);
    const uploadedFile = (0, _agentStore.useAgentStore)((s)=>s.uploadedFile);
    const fileUploading = (0, _agentStore.useAgentStore)((s)=>s.fileUploading);
    const uploadFile = (0, _agentStore.useAgentStore)((s)=>s.uploadFile);
    const clearUploadedFile = (0, _agentStore.useAgentStore)((s)=>s.clearUploadedFile);
    const storeError = (0, _agentStore.useAgentStore)((s)=>s.error);
    (0, _react.useEffect)(()=>{
        const container = messagesContainerRef.current;
        if (!container) return;
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceToBottom < 96) {
            var _messagesEndRef_current;
            (_messagesEndRef_current = messagesEndRef.current) === null || _messagesEndRef_current === void 0 || _messagesEndRef_current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [
        messages,
        isLoading
    ]);
    const handleSend = (0, _react.useCallback)(async ()=>{
        const text = input.trim();
        if (!text || isLoading) return;
        let fullQuery = text;
        if (graphInjectedEntity) fullQuery = `[${graphInjectedEntity.name}] ${fullQuery}`;
        if (contextTags.length > 0) fullQuery = `Context: ${contextTags.map((t)=>t.id).join(', ')}. Query: ${fullQuery}`;
        try {
            var _inputRef_current;
            await onSendMessage(fullQuery);
            setInput('');
            (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 || _inputRef_current.focus();
        } catch  {
        // Keep input text on failure
        }
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
                                lineNumber: 117,
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
                                lineNumber: 120,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 116,
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
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                children: "Clear"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                ref: messagesContainerRef,
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
                                    lineNumber: 167,
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
                                    lineNumber: 170,
                                    columnNumber: 19
                                }, void 0)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 166,
                            columnNumber: 17
                        }, void 0)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 163,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                    lineNumber: 155,
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
                                        lineNumber: 181,
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
                                                    lineNumber: 197,
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
                                                            lineNumber: 202,
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
                                                            lineNumber: 203,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                    lineNumber: 201,
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
                                            lineNumber: 209,
                                            columnNumber: 23
                                        }, this) : null
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 194,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, msg.id, true, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 180,
                                columnNumber: 15
                            }, this);
                        }),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                            ref: messagesEndRef
                        }, void 0, false, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 224,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 153,
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
                                    lineNumber: 252,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 251,
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
                                lineNumber: 260,
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
                                lineNumber: 263,
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
                                lineNumber: 277,
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
                                lineNumber: 280,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 239,
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
                        lineNumber: 301,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            marginBottom: 8
                        },
                        children: [
                            uploadedFile ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    background: '#f0f5ff',
                                    borderRadius: 8,
                                    border: '1px solid #d6e4ff'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {
                                        style: {
                                            color: '#2855D1',
                                            fontSize: 14
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 327,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 12,
                                            flex: 1,
                                            color: '#1e40af'
                                        },
                                        children: [
                                            uploadedFile.filename,
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    color: '#64748b',
                                                    marginLeft: 6
                                                },
                                                children: [
                                                    "(",
                                                    uploadedFile.char_count,
                                                    " 字符",
                                                    uploadedFile.truncated ? '，已截断' : '',
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                                lineNumber: 330,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 328,
                                        columnNumber: 15
                                    }, this),
                                    uploadedFile.truncated && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 11,
                                            color: '#fa8c16'
                                        },
                                        children: "内容过长，已自动截取前 50,000 字符"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 335,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "primary",
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                            lineNumber: 340,
                                            columnNumber: 23
                                        }, void 0),
                                        onClick: ()=>{
                                            onSendMessage('请分析该文件中的风险信息');
                                        },
                                        disabled: isLoading,
                                        style: {
                                            fontSize: 12
                                        },
                                        children: "协同治理"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 337,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "text",
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                            lineNumber: 352,
                                            columnNumber: 23
                                        }, void 0),
                                        onClick: clearUploadedFile,
                                        style: {
                                            color: '#94a3b8'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Upload, {
                                accept: ".txt,.md,.docx,.pdf",
                                showUploadList: false,
                                beforeUpload: (file)=>{
                                    uploadFile(file);
                                    return false;
                                },
                                disabled: fileUploading || isLoading,
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                    icon: fileUploading ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LoadingOutlined, {}, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 368,
                                        columnNumber: 39
                                    }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.UploadOutlined, {}, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                        lineNumber: 368,
                                        columnNumber: 61
                                    }, void 0),
                                    size: "small",
                                    type: "text",
                                    disabled: fileUploading || isLoading,
                                    style: {
                                        fontSize: 12,
                                        color: '#64748b'
                                    },
                                    children: fileUploading ? '上传中...' : '上传文本文件 (.txt .md .docx .pdf)'
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 367,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 358,
                                columnNumber: 13
                            }, this),
                            storeError && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    fontSize: 11,
                                    color: '#f5222d',
                                    marginTop: 4,
                                    paddingLeft: 4
                                },
                                children: storeError
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                lineNumber: 379,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 314,
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
                                    disabled: isLoading || fileUploading
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 394,
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
                                        lineNumber: 442,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                                    lineNumber: 417,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                            lineNumber: 393,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 383,
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
                        children: "Enter 发送 · Shift+Enter 换行 · 双击图谱节点添加上下文"
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                        lineNumber: 447,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/components/WorkspaceContainer.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
};
_s(WorkspaceContainer, "h4iZbWV1CrQ/bw64RFWamI9Bh3o=", false, function() {
    return [
        _agentStore.useAgentStore,
        _agentStore.useAgentStore,
        _agentStore.useAgentStore,
        _agentStore.useAgentStore,
        _agentStore.useAgentStore
    ];
});
_c = WorkspaceContainer;
var _default = WorkspaceContainer;
var _c;
$RefreshReg$(_c, "WorkspaceContainer");
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
"src/pages/KnowledgeQA/components/graphStyles.ts": function (module, exports, __mako_require__){
// Shared graph color constants — imported by both EnhancedGraphPanel and LegendPanel
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
    EDGE_COLORS: function() {
        return EDGE_COLORS;
    },
    NODE_TYPE_COLORS: function() {
        return NODE_TYPE_COLORS;
    },
    NODE_TYPE_LABELS: function() {
        return NODE_TYPE_LABELS;
    },
    RELATION_LABELS: function() {
        return RELATION_LABELS;
    },
    RISK_LEVEL_VISUAL: function() {
        return RISK_LEVEL_VISUAL;
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
const NODE_TYPE_COLORS = {
    COMPANY: '#1890ff',
    PERSON: '#722ed1',
    EVENT: '#f5222d',
    SUB_EVENT: '#f5222d',
    TIME: '#8c8c8c',
    RiskFeature: '#52c41a',
    RiskFactor: '#52c41a',
    Action: '#8c8c8c',
    Regulation: '#faad14',
    Law: '#faad14'
};
const NODE_TYPE_LABELS = {
    COMPANY: '企业',
    PERSON: '人物',
    EVENT: '事件',
    SUB_EVENT: '子事件',
    TIME: '时间',
    RiskFeature: '风险特征',
    RiskFactor: '风险因子',
    Action: '操作',
    Regulation: '法规',
    Law: '法律'
};
const RELATION_LABELS = {
    INVEST: '投资',
    GUARANTEE: '担保',
    WORK: '任职',
    CONTROLLER: '控制',
    MENTION: '涉及',
    TRIGGERS: '触发',
    REFLECTS: '反映',
    COMPLIES_WITH: '合规',
    CAUSE: '因果',
    BELONG: '归属'
};
const EDGE_COLORS = {
    INVEST: '#1890ff',
    GUARANTEE: '#faad14',
    WORK: '#722ed1',
    CONTROLLER: '#722ed1',
    MENTION: '#f5222d',
    TRIGGERS: '#f5222d',
    REFLECTS: '#fa8c16',
    COMPLIES_WITH: '#722ed1',
    CAUSE: '#fa541c',
    BELONG: '#52c41a'
};
const RISK_LEVEL_VISUAL = {
    high: {
        border: '#f5222d',
        bg: '#FFF2F0',
        label: '高风险'
    },
    medium: {
        border: '#faad14',
        bg: '#FFFBE6',
        label: '中风险'
    },
    low: {
        border: '#52c41a',
        bg: '#F6FFED',
        label: '低风险'
    }
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
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _jsxdevruntime = __mako_require__("node_modules/react/jsx-dev-runtime.js");
var _react = _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
var _antd = __mako_require__("node_modules/antd/es/index.js");
var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
var _WorkspaceContainer = __mako_require__("src/pages/KnowledgeQA/components/WorkspaceContainer.tsx");
var _EnhancedGraphPanel = __mako_require__("src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx");
var _RiskReportPanel = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/RiskReportPanel.tsx"));
var _ComplianceAnalysisPanel = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/ComplianceAnalysisPanel.tsx"));
var _AgentTracePanel = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/AgentTracePanel.tsx"));
var _LegendPanel = _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/LegendPanel.tsx"));
var _ChatSidebar = __mako_require__("src/pages/KnowledgeQA/components/ChatSidebar.tsx");
var _agentStore = __mako_require__("src/pages/KnowledgeQA/store/agentStore.ts");
var _chatStore = __mako_require__("src/pages/KnowledgeQA/store/chatStore.ts");
var _constants = __mako_require__("src/pages/KnowledgeQA/styles/constants.ts");
var _graphStyles = __mako_require__("src/pages/KnowledgeQA/components/graphStyles.ts");
var prevRefreshReg;
var prevRefreshSig;
prevRefreshReg = self.$RefreshReg$;
prevRefreshSig = self.$RefreshSig$;
self.$RefreshReg$ = (type, id)=>{
    _reactrefresh.register(type, module.id + id);
};
self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
var _s = $RefreshSig$();
const RELATION_TEXT = {
    INVEST: '投资',
    GUARANTEE: '担保',
    WORK: '任职',
    CONTROLLER: '控制',
    MENTION: '涉及',
    TRIGGERS: '触发',
    REFLECTS: '反映',
    COMPLIES_WITH: '合规',
    CAUSE: '因果',
    BELONG: '归属',
    TRANSACTION: '交易',
    WARNING: '预警',
    RELATED: '关联'
};
const ATTRIBUTE_LABELS = {
    entity_id: '实体ID',
    id: '实体ID',
    COMPANY_NM: '公司名称',
    COMPANY_NAME: '公司名称',
    PERSON_NM: '人员姓名',
    PERSON_NAME: '人员姓名',
    name: '名称',
    title: '标题',
    label: '标签',
    STATUS: '状态',
    LEGAL_PERSON: '法定代表人',
    LEGAL_REPRESENTATIVE: '法定代表人',
    REG_CAPITAL: '注册资本',
    ESTABLISH_DATE: '成立日期',
    INDUSTRY: '所属行业',
    ADDRESS: '注册地址',
    CREDIT_CODE: '统一社会信用代码',
    RISK_INFO: '风险信息',
    WARNING_NUM: '预警次数',
    EVENT_TYPE: '事件类型',
    EVENT_DATE: '事件日期',
    AMOUNT: '金额',
    POSITION: '职位',
    role: '角色',
    score: '匹配分数',
    risk_level: '风险等级',
    compliance_score: '合规总分',
    entity_type: '实体类型',
    type: '实体类型'
};
const HIDDEN_ATTRIBUTE_KEYS = new Set([
    'raw',
    'properties',
    'embedding',
    'vector',
    'graph_embedding',
    'semantic_embedding',
    'poster',
    'poster_url'
]);
function formatAttributeValue(value) {
    if (value === undefined || value === null || value === '') return '';
    if (Array.isArray(value)) return value.map(formatAttributeValue).filter(Boolean).join('、');
    if (typeof value === 'object') try {
        const entries = Object.entries(value).filter(([, v])=>v !== undefined && v !== null && v !== '').slice(0, 6);
        return entries.map(([k, v])=>`${ATTRIBUTE_LABELS[k] || k}: ${formatAttributeValue(v)}`).join('；');
    } catch  {
        return '';
    }
    return String(value);
}
function getNodeAttributes(node) {
    const props = node.properties || {};
    const fields = {
        entity_id: node.id,
        entity_type: node.entity_type || node.entityType || node.type,
        ...props,
        risk_level: node.risk_level,
        compliance_score: node.compliance_score,
        score: node.score
    };
    const displayName = node.title || node.zh_name || node.name || node.label || node.id;
    const seen = new Set();
    return Object.entries(fields).filter(([key, value])=>{
        if (HIDDEN_ATTRIBUTE_KEYS.has(key)) return false;
        if (value === undefined || value === null || value === '') return false;
        const text = formatAttributeValue(value);
        if (!text || key !== 'entity_id' && text === String(displayName)) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).map(([key, value])=>({
            key,
            label: ATTRIBUTE_LABELS[key] || key.replace(/_/g, ' '),
            value: formatAttributeValue(value)
        })).slice(0, 18);
}
function extractSubjectEntityIds(query, nodes) {
    if (!query || nodes.length === 0) return [];
    const matched = [];
    for (const node of nodes){
        const nodeId = String(node.id);
        const names = [
            node.title,
            node.name,
            node.zh_name,
            node.zhTitle
        ].filter(Boolean);
        for (const name of names)if (name.length >= 2 && query.includes(name)) {
            matched.push(nodeId);
            break;
        }
    }
    if (matched.length === 0) {
        const bookMatches = query.match(/《([^》]{2,30})》/g);
        if (bookMatches) for (const m of bookMatches){
            const name = m.replace(/[《》]/g, '');
            for (const node of nodes){
                const nodeId = String(node.id);
                const nodeNames = [
                    node.title,
                    node.name,
                    node.zh_name,
                    node.zhTitle
                ].filter(Boolean);
                if (nodeNames.some((n)=>n.includes(name) || name.includes(n))) {
                    if (!matched.includes(nodeId)) matched.push(nodeId);
                }
            }
        }
        if (matched.length === 0) {
            const companyMatches = query.match(/([一-龥]{2,15}(?:有限|股份|集团|科技|实业|投资|控股)?(?:公司|企业|集团|中心|所))/g);
            if (companyMatches) {
                for (const name of companyMatches)for (const node of nodes){
                    const nodeId = String(node.id);
                    const nodeNames = [
                        node.title,
                        node.name,
                        node.zh_name,
                        node.zhTitle
                    ].filter(Boolean);
                    if (nodeNames.some((n)=>n.includes(name) || name.includes(n.slice(0, 10)))) {
                        if (!matched.includes(nodeId)) matched.push(nodeId);
                    }
                }
            }
        }
    }
    return matched;
}
function findNeighborIds(nodeIds, edges) {
    if (nodeIds.length === 0 || edges.length === 0) return [];
    const idSet = new Set(nodeIds.map(String));
    const neighbors = new Set();
    for (const e of edges){
        const src = String(e.source);
        const tgt = String(e.target);
        if (idSet.has(src) && !idSet.has(tgt)) neighbors.add(tgt);
        if (idSet.has(tgt) && !idSet.has(src)) neighbors.add(src);
    }
    return Array.from(neighbors);
}
const KnowledgeQA = ()=>{
    _s();
    const { message } = _antd.App.useApp();
    const { messages, currentSubgraph, alignmentFeatures, isLoading, sendUnifiedMessage, clearHistory, pendingRecommendations, clarifyMessage, activeRightPanel, riskReport, riskStages, riskCommunity, riskEntityCommunityMap, resolvedEntities, riskScores, governancePlan, complianceScores, complianceIndicators, error, retryRiskQuery, agentTraces } = (0, _agentStore.useAgentStore)();
    const { activeSessionId, updateCurrentSession, getActiveSession, createNewSession } = (0, _chatStore.useChatStore)();
    const graphRef = (0, _react.useRef)(null);
    const [highlightedEntity, setHighlightedEntity] = (0, _react.useState)(null);
    const [graphInjectedEntity, setGraphInjectedEntity] = (0, _react.useState)(null);
    const [sidebarCollapsed, setSidebarCollapsed] = (0, _react.useState)(false);
    const [graphStats, setGraphStats] = (0, _react.useState)(null);
    const [drawerNode, setDrawerNode] = (0, _react.useState)(null);
    const [tracePanelVisible, setTracePanelVisible] = (0, _react.useState)(false);
    const [visibleCategories, setVisibleCategories] = (0, _react.useState)(new Set([
        ...Object.keys(_graphStyles.NODE_TYPE_LABELS),
        ...Object.keys(_graphStyles.RELATION_LABELS)
    ]));
    (0, _react.useEffect)(()=>{
        if (_agentStore.useAgentStore.getState().isLoading) return;
        if (!activeSessionId) {
            if (_chatStore.useChatStore.getState().sessions.length === 0) createNewSession();
            return;
        }
        const timer = setTimeout(()=>{
            const activeSession = getActiveSession();
            if (!activeSession) return;
            if (messages.length > 0 || currentSubgraph || riskReport) {
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
        riskReport,
        activeSessionId,
        updateCurrentSession,
        getActiveSession,
        createNewSession
    ]);
    (0, _react.useEffect)(()=>{
        if (_agentStore.useAgentStore.getState().isLoading) return;
        const session = getActiveSession();
        if (!session) return;
        const savedPanel = session.workspaceState.riskReport ? 'risk' : session.workspaceState.graphData ? 'graph' : 'graph';
        const rawGraph = session.workspaceState.graphData;
        const normalizedGraph = rawGraph ? {
            nodes: (0, _agentStore.normalizeSubgraphNodes)(rawGraph.nodes || []),
            edges: (0, _agentStore.normalizeSubgraphEdges)(rawGraph.edges || []),
            paths: rawGraph.paths || []
        } : null;
        _agentStore.useAgentStore.setState({
            messages: session.messages,
            currentSubgraph: normalizedGraph,
            riskReport: session.workspaceState.riskReport || null,
            riskStages: session.workspaceState.riskStages || [],
            riskCommunity: session.workspaceState.riskCommunity || null,
            activeRightPanel: savedPanel === 'analysis' ? 'graph' : savedPanel
        });
        if (normalizedGraph && graphRef.current) {
            graphRef.current.refresh(normalizedGraph, []);
            setTimeout(()=>{
                var _graphRef_current;
                return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView();
            }, 300);
        }
    }, [
        activeSessionId
    ]);
    (0, _react.useEffect)(()=>{
        if (!currentSubgraph) return;
        const doRefresh = ()=>{
            if (!graphRef.current) return false;
            const lastUserMsg = [
                ...messages
            ].reverse().find((m)=>m.role === 'user');
            const query = (lastUserMsg === null || lastUserMsg === void 0 ? void 0 : lastUserMsg.content) || '';
            const subjectIds = extractSubjectEntityIds(query, currentSubgraph.nodes);
            const neighborIds = findNeighborIds(subjectIds, currentSubgraph.edges);
            graphRef.current.refresh(currentSubgraph, alignmentFeatures, subjectIds, neighborIds);
            if (subjectIds.length > 0) setTimeout(()=>{
                var _graphRef_current, _graphRef_current1;
                (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.focusNode(subjectIds[0]);
                (_graphRef_current1 = graphRef.current) === null || _graphRef_current1 === void 0 || _graphRef_current1.dimNonFocused(subjectIds, neighborIds);
            }, 600);
            else setTimeout(()=>{
                var _graphRef_current;
                return (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 ? void 0 : _graphRef_current.fitView();
            }, 500);
            return true;
        };
        if (!doRefresh()) {
            console.log('[KnowledgeQA] graphRef not ready, retrying refresh in 100ms...');
            const retryTimer = setTimeout(()=>{
                if (!doRefresh()) console.warn('[KnowledgeQA] graphRef still not ready after retry — subgraph data may not be rendered');
            }, 100);
            return ()=>clearTimeout(retryTimer);
        }
    }, [
        currentSubgraph,
        alignmentFeatures,
        riskEntityCommunityMap
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
    const handleJumpToGraph = (0, _react.useCallback)((entityId, entityName, entityType)=>{
        _agentStore.useAgentStore.setState({
            activeRightPanel: 'graph'
        });
        if (graphRef.current) graphRef.current.searchAndExpand(entityId, entityType);
    }, []);
    const handleNodeClick = (0, _react.useCallback)((node)=>{
        setDrawerNode(node);
    }, []);
    const handleCanvasClick = (0, _react.useCallback)(()=>{
        setDrawerNode(null);
        setVisibleCategories(new Set([
            ...Object.keys(_graphStyles.NODE_TYPE_LABELS),
            ...Object.keys(_graphStyles.RELATION_LABELS)
        ]));
    }, []);
    const handleDrawerClose = (0, _react.useCallback)(()=>{
        var _graphRef_current;
        setDrawerNode(null);
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.translateCanvas(0, 0);
    }, []);
    const handleDrawerJumpToNode = (0, _react.useCallback)((nodeId, nodeName)=>{
        const subgraph = _agentStore.useAgentStore.getState().currentSubgraph;
        const targetNode = subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes.find((n)=>String(n.id) === nodeId);
        if (targetNode) {
            var _graphRef_current;
            setDrawerNode(targetNode);
            (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.focusNode(nodeId);
        }
    }, []);
    const handleLegendToggle = (0, _react.useCallback)((cat)=>{
        var _graphRef_current;
        setVisibleCategories((prev)=>{
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.toggleCategory(cat);
    }, []);
    const handleLegendHighlight = (0, _react.useCallback)((cat)=>{
        var _graphRef_current;
        (_graphRef_current = graphRef.current) === null || _graphRef_current === void 0 || _graphRef_current.applyHighlight(cat);
    }, []);
    const lastQueryText = (0, _react.useMemo)(()=>{
        const lastUserMsg = [
            ...messages
        ].reverse().find((m)=>m.role === 'user');
        return (lastUserMsg === null || lastUserMsg === void 0 ? void 0 : lastUserMsg.content) || '';
    }, [
        messages
    ]);
    const handleBFFSend = (0, _react.useCallback)(async (query)=>{
        await sendUnifiedMessage(query);
    }, [
        sendUnifiedMessage
    ]);
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
    return (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
        header: {
            title: '协同治理',
            subTitle: '协同治理引擎'
        },
        children: [
            (0, _jsxdevruntime.jsxDEV)("div", {
                style: {
                    display: 'flex',
                    height: 'calc(100vh - 120px)',
                    overflow: 'hidden',
                    background: _constants.DESIGN_TOKENS.BG_CANVAS,
                    margin: '-24px',
                    borderRadius: 0
                },
                children: [
                    (0, _jsxdevruntime.jsxDEV)(_ChatSidebar.ChatSidebar, {
                        collapsed: sidebarCollapsed,
                        onToggle: ()=>setSidebarCollapsed(!sidebarCollapsed)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/index.tsx",
                        lineNumber: 482,
                        columnNumber: 9
                    }, this),
                    (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            overflow: 'hidden'
                        },
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("header", {
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
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
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
                                                children: (0, _jsxdevruntime.jsxDEV)("svg", {
                                                    width: "24",
                                                    height: "24",
                                                    viewBox: "0 0 32 32",
                                                    fill: "none",
                                                    children: [
                                                        (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "16",
                                                            cy: "16",
                                                            r: "12",
                                                            stroke: "#ffffff",
                                                            strokeWidth: "2",
                                                            opacity: "0.3"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 516,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "16",
                                                            cy: "10",
                                                            r: "3",
                                                            fill: "#ffffff"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 517,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "10",
                                                            cy: "20",
                                                            r: "2.5",
                                                            fill: "#10B981"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 518,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("circle", {
                                                            cx: "22",
                                                            cy: "20",
                                                            r: "2.5",
                                                            fill: "#F59E0B"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 519,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("line", {
                                                            x1: "16",
                                                            y1: "13",
                                                            x2: "11",
                                                            y2: "18",
                                                            stroke: "#ffffff",
                                                            strokeWidth: "1.5"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 520,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("line", {
                                                            x1: "16",
                                                            y1: "13",
                                                            x2: "21",
                                                            y2: "18",
                                                            stroke: "#ffffff",
                                                            strokeWidth: "1.5"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 521,
                                                            columnNumber: 19
                                                        }, this),
                                                        (0, _jsxdevruntime.jsxDEV)("line", {
                                                            x1: "12",
                                                            y1: "20",
                                                            x2: "20",
                                                            y2: "20",
                                                            stroke: "#ffffff",
                                                            strokeWidth: "1.5"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                                            lineNumber: 522,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 503,
                                                columnNumber: 15
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("h1", {
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
                                                        lineNumber: 526,
                                                        columnNumber: 17
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("p", {
                                                        style: {
                                                            margin: 0,
                                                            fontSize: 12,
                                                            color: '#94A3B8'
                                                        },
                                                        children: "Knowledge Graph Recommendation Engine"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 525,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 502,
                                        columnNumber: 13
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16
                                        },
                                        children: (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            },
                                            children: [
                                                (0, _jsxdevruntime.jsxDEV)("span", {
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
                                                    lineNumber: 545,
                                                    columnNumber: 17
                                                }, this),
                                                (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#64748B'
                                                    },
                                                    children: apiHealthy === null ? '检测中' : apiHealthy ? 'API 在线' : 'API 离线'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 556,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeQA/index.tsx",
                                            lineNumber: 544,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 543,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 490,
                                columnNumber: 11
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    display: 'flex',
                                    flex: 1,
                                    overflow: 'hidden',
                                    padding: '16px',
                                    gap: '16px'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            width: 'clamp(320px, 32vw, 520px)',
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
                                            (0, _jsxdevruntime.jsxDEV)(_WorkspaceContainer.WorkspaceContainer, {
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
                                                lineNumber: 587,
                                                columnNumber: 15
                                            }, this),
                                            clarifyMessage && (0, _jsxdevruntime.jsxDEV)("div", {
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
                                                    (0, _jsxdevruntime.jsxDEV)("strong", {
                                                        style: {
                                                            fontSize: 12,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5
                                                        },
                                                        children: "Needs Clarification"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 613,
                                                        columnNumber: 19
                                                    }, this),
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 6
                                                        },
                                                        children: clarifyMessage
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 622,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 601,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 574,
                                        columnNumber: 13
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)("div", {
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
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    padding: '10px 16px',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    background: 'rgba(255, 255, 255, 0.5)',
                                                    backdropFilter: 'blur(10px)',
                                                    flexShrink: 0
                                                },
                                                children: [
                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)(_antd.Segmented, {
                                                                options: [
                                                                    {
                                                                        label: '图谱视图',
                                                                        value: 'graph'
                                                                    },
                                                                    {
                                                                        label: '治理报告',
                                                                        value: 'risk'
                                                                    },
                                                                    {
                                                                        label: '合规分析',
                                                                        value: 'compliance'
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
                                                                lineNumber: 653,
                                                                columnNumber: 19
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                title: `Agent 调试日志${agentTraces.length > 0 ? ` (${agentTraces.length})` : ''}`,
                                                                children: (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                    size: "small",
                                                                    type: "text",
                                                                    icon: (0, _jsxdevruntime.jsxDEV)(_icons.BugOutlined, {}, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 674,
                                                                        columnNumber: 29
                                                                    }, void 0),
                                                                    onClick: ()=>setTracePanelVisible(true),
                                                                    style: {
                                                                        color: agentTraces.length > 0 ? '#fa8c16' : '#94a3b8',
                                                                        borderRadius: 6
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 671,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 670,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 652,
                                                        columnNumber: 17
                                                    }, this),
                                                    activeRightPanel === 'graph' && graphStats && (0, _jsxdevruntime.jsxDEV)(_LegendPanel.default, {
                                                        stats: graphStats,
                                                        visibleCategories: visibleCategories,
                                                        onToggle: handleLegendToggle,
                                                        onHighlight: handleLegendHighlight
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 684,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 640,
                                                columnNumber: 15
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    flex: 1,
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                },
                                                children: activeRightPanel === 'risk' ? (0, _jsxdevruntime.jsxDEV)(_RiskReportPanel.default, {
                                                    report: riskReport,
                                                    stages: riskStages,
                                                    community: riskCommunity,
                                                    entityCommunityMap: riskEntityCommunityMap,
                                                    isLoading: isLoading,
                                                    error: error,
                                                    onJumpToGraph: handleJumpToGraph,
                                                    onRetry: retryRiskQuery,
                                                    queryText: lastQueryText,
                                                    currentSubgraph: currentSubgraph,
                                                    resolvedEntities: resolvedEntities,
                                                    riskScores: riskScores,
                                                    governancePlan: governancePlan,
                                                    complianceScores: complianceScores
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 695,
                                                    columnNumber: 19
                                                }, this) : activeRightPanel === 'compliance' ? (0, _jsxdevruntime.jsxDEV)(_ComplianceAnalysisPanel.default, {
                                                    report: riskReport,
                                                    currentSubgraph: currentSubgraph,
                                                    isLoading: isLoading,
                                                    onJumpToGraph: handleJumpToGraph,
                                                    complianceIndicators: complianceIndicators
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 712,
                                                    columnNumber: 19
                                                }, this) : (0, _jsxdevruntime.jsxDEV)(_EnhancedGraphPanel.EnhancedGraphPanel, {
                                                    ref: graphRef,
                                                    subgraph: currentSubgraph,
                                                    alignmentFeatures: alignmentFeatures,
                                                    entityCommunityMap: riskEntityCommunityMap,
                                                    onNodeDoubleClick: handleNodeDoubleClick,
                                                    onNodeHover: (nodeId)=>setHighlightedEntity(nodeId),
                                                    highlightedEntity: highlightedEntity,
                                                    onNodeClick: handleNodeClick,
                                                    onCanvasClick: handleCanvasClick,
                                                    onStatsChange: setGraphStats
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                    lineNumber: 720,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 693,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 628,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 564,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/index.tsx",
                        lineNumber: 488,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "src/pages/KnowledgeQA/index.tsx",
                lineNumber: 471,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                title: null,
                placement: "right",
                width: 380,
                open: drawerNode !== null,
                onClose: handleDrawerClose,
                closable: true,
                styles: {
                    body: {
                        padding: 0
                    }
                },
                maskStyle: {
                    background: 'rgba(0,0,0,0.05)'
                },
                children: drawerNode && (()=>{
                    const subgraph = _agentStore.useAgentStore.getState().currentSubgraph;
                    const nodeType = drawerNode.type || '';
                    const typeColor = _graphStyles.NODE_TYPE_COLORS[nodeType] || '#8c8c8c';
                    const typeLabel = _graphStyles.NODE_TYPE_LABELS[nodeType] || nodeType || '未知';
                    const riskLevel = drawerNode.risk_level;
                    const rv = riskLevel ? _graphStyles.RISK_LEVEL_VISUAL[riskLevel] : null;
                    const connectedEdges = ((subgraph === null || subgraph === void 0 ? void 0 : subgraph.edges) || []).filter((e)=>String(e.source) === String(drawerNode.id) || String(e.target) === String(drawerNode.id));
                    const neighborIds = new Set();
                    connectedEdges.forEach((e)=>{
                        const src = String(e.source);
                        const tgt = String(e.target);
                        if (src !== String(drawerNode.id)) neighborIds.add(src);
                        if (tgt !== String(drawerNode.id)) neighborIds.add(tgt);
                    });
                    const neighborNodes = ((subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes) || []).filter((n)=>neighborIds.has(String(n.id)));
                    const displayName = drawerNode.title || drawerNode.zh_name || drawerNode.name || drawerNode.id;
                    const attributeRows = getNodeAttributes(drawerNode);
                    return (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    padding: '20px 24px 16px',
                                    borderBottom: '1px solid #f1f5f9'
                                },
                                children: [
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.3,
                                            marginBottom: 10
                                        },
                                        children: displayName
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 779,
                                        columnNumber: 17
                                    }, this),
                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            display: 'flex',
                                            gap: 8,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    display: 'inline-block',
                                                    padding: '2px 10px',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: typeColor,
                                                    background: `${typeColor}12`,
                                                    border: `1px solid ${typeColor}30`
                                                },
                                                children: typeLabel
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 783,
                                                columnNumber: 19
                                            }, this),
                                            rv && (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    display: 'inline-block',
                                                    padding: '2px 10px',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: rv.border,
                                                    background: rv.bg,
                                                    border: `1px solid ${rv.border}40`
                                                },
                                                children: rv.label
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 790,
                                                columnNumber: 21
                                            }, this),
                                            drawerNode.rating !== undefined && drawerNode.rating !== null && (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#64748b',
                                                    padding: '2px 6px'
                                                },
                                                children: [
                                                    "评分: ",
                                                    drawerNode.rating
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 798,
                                                columnNumber: 21
                                            }, this),
                                            drawerNode.year && (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#64748b',
                                                    padding: '2px 6px'
                                                },
                                                children: drawerNode.year
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 803,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 782,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 778,
                                columnNumber: 15
                            }, this),
                            (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    padding: '16px 24px'
                                },
                                children: [
                                    drawerNode.overview && (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginBottom: 20
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: '#475569',
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                },
                                                children: "溯源文本"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 814,
                                                columnNumber: 21
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 13,
                                                    color: '#334155',
                                                    lineHeight: 1.7,
                                                    maxHeight: 200,
                                                    overflowY: 'auto',
                                                    background: '#f8fafc',
                                                    borderRadius: 8,
                                                    padding: '10px 12px'
                                                },
                                                children: drawerNode.overview.length > 500 ? drawerNode.overview.slice(0, 500) + '...' : drawerNode.overview
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 817,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 813,
                                        columnNumber: 19
                                    }, this),
                                    attributeRows.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginBottom: 20
                                        },
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: '#475569',
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                },
                                                children: [
                                                    "属性信息 (",
                                                    attributeRows.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 826,
                                                columnNumber: 21
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'grid',
                                                    gap: 8
                                                },
                                                children: attributeRows.map((attr)=>(0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: '92px minmax(0, 1fr)',
                                                            gap: 10,
                                                            alignItems: 'start',
                                                            padding: '8px 10px',
                                                            borderRadius: 8,
                                                            background: '#f8fafc',
                                                            border: '1px solid #eef2f7'
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#64748b',
                                                                    fontWeight: 600
                                                                },
                                                                children: attr.label
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 844,
                                                                columnNumber: 27
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: '#1e293b',
                                                                    lineHeight: 1.6,
                                                                    wordBreak: 'break-word'
                                                                },
                                                                children: attr.value
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 847,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, attr.key, true, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 831,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 829,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 825,
                                        columnNumber: 19
                                    }, this),
                                    neighborNodes.length > 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                        children: [
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: '#475569',
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                },
                                                children: [
                                                    "关联实体 (",
                                                    neighborNodes.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 859,
                                                columnNumber: 21
                                            }, this),
                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 6
                                                },
                                                children: neighborNodes.map((neighbor)=>{
                                                    const nId = String(neighbor.id);
                                                    const nType = neighbor.type || '';
                                                    const nColor = _graphStyles.NODE_TYPE_COLORS[nType] || '#8c8c8c';
                                                    const nTypeLabel = _graphStyles.NODE_TYPE_LABELS[nType] || nType;
                                                    const nName = neighbor.title || neighbor.zh_name || neighbor.name || neighbor.id;
                                                    const relEdge = connectedEdges.find((e)=>String(e.source) === nId || String(e.target) === nId);
                                                    const relType = (relEdge === null || relEdge === void 0 ? void 0 : relEdge.relation) || '相关';
                                                    const relLabel = RELATION_TEXT[relType] || _graphStyles.RELATION_LABELS[relType] || relType;
                                                    return (0, _jsxdevruntime.jsxDEV)("div", {
                                                        onClick: ()=>handleDrawerJumpToNode(nId, String(nName)),
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 10,
                                                            padding: '8px 12px',
                                                            borderRadius: 8,
                                                            cursor: 'pointer',
                                                            transition: 'background 0.15s',
                                                            border: '1px solid #f1f5f9'
                                                        },
                                                        onMouseEnter: (e)=>{
                                                            e.currentTarget.style.background = '#f8fafc';
                                                        },
                                                        onMouseLeave: (e)=>{
                                                            e.currentTarget.style.background = 'transparent';
                                                        },
                                                        children: [
                                                            (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    flexShrink: 0,
                                                                    background: nColor
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 887,
                                                                columnNumber: 29
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    flex: 1,
                                                                    minWidth: 0
                                                                },
                                                                children: [
                                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            fontSize: 13,
                                                                            fontWeight: 600,
                                                                            color: '#1e293b',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        },
                                                                        children: String(nName).length > 18 ? String(nName).slice(0, 16) + '...' : nName
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 892,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            fontSize: 11,
                                                                            color: '#94a3b8'
                                                                        },
                                                                        children: [
                                                                            nTypeLabel,
                                                                            " · ",
                                                                            relLabel
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                        lineNumber: 895,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 891,
                                                                columnNumber: 29
                                                            }, this),
                                                            (0, _jsxdevruntime.jsxDEV)("svg", {
                                                                width: "12",
                                                                height: "12",
                                                                viewBox: "0 0 24 24",
                                                                fill: "none",
                                                                stroke: "#94a3b8",
                                                                strokeWidth: "2",
                                                                children: (0, _jsxdevruntime.jsxDEV)("path", {
                                                                    d: "M9 18l6-6-6-6"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                    lineNumber: 900,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                                lineNumber: 899,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, nId, true, {
                                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                                        lineNumber: 876,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                                lineNumber: 862,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 858,
                                        columnNumber: 19
                                    }, this),
                                    !drawerNode.overview && attributeRows.length === 0 && neighborNodes.length === 0 && (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center',
                                            padding: 40,
                                            color: '#94a3b8',
                                            fontSize: 13
                                        },
                                        children: "暂无更多详情"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeQA/index.tsx",
                                        lineNumber: 911,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeQA/index.tsx",
                                lineNumber: 810,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeQA/index.tsx",
                        lineNumber: 776,
                        columnNumber: 13
                    }, this);
                })()
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/index.tsx",
                lineNumber: 740,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)(_AgentTracePanel.default, {
                traces: agentTraces,
                visible: tracePanelVisible,
                onClose: ()=>setTracePanelVisible(false),
                onClear: ()=>_agentStore.useAgentStore.setState({
                        agentTraces: []
                    })
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/index.tsx",
                lineNumber: 922,
                columnNumber: 7
            }, this),
            (0, _jsxdevruntime.jsxDEV)("style", {
                children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `
            }, void 0, false, {
                fileName: "src/pages/KnowledgeQA/index.tsx",
                lineNumber: 929,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "src/pages/KnowledgeQA/index.tsx",
        lineNumber: 465,
        columnNumber: 5
    }, this);
};
_s(KnowledgeQA, "E2ynosqQ6xu0Tojr2Uj/qOHLYQY=", false, function() {
    return [
        _antd.App.useApp,
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
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
__mako_require__.e(exports, {
    normalizeSubgraphEdges: function() {
        return normalizeSubgraphEdges;
    },
    normalizeSubgraphNodes: function() {
        return normalizeSubgraphNodes;
    },
    useAgentStore: function() {
        return useAgentStore;
    }
});
var _interop_require_wildcard = __mako_require__("@swc/helpers/_/_interop_require_wildcard");
var _reactrefresh = _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
var _zustand = __mako_require__("node_modules/zustand/esm/index.mjs");
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
const VALID_TYPES = new Set([
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
function normalizeSubgraphNodes(rawNodes) {
    return rawNodes.map((n)=>{
        if (n.type && VALID_TYPES.has(n.type)) {
            const props = n.properties || {};
            return {
                ...n,
                properties: props,
                raw: n,
                entityType: n.entityType || n.type,
                entity_type: n.entity_type || n.type,
                label: n.label || n.title || n.name || String(n.id),
                compliance_score: n.compliance_score ?? props.compliance_score
            };
        }
        let nodeType = '';
        if (n.labels && Array.isArray(n.labels) && n.labels.length > 0) {
            for (const label of n.labels){
                const upper = typeof label === 'string' ? label.toUpperCase() : '';
                if (upper === 'COMPANY' || upper === 'SUBJECT') {
                    nodeType = 'COMPANY';
                    break;
                }
                if (upper === 'PERSON') {
                    nodeType = 'PERSON';
                    break;
                }
                if (upper === 'EVENT') {
                    nodeType = 'EVENT';
                    break;
                }
                if (upper === 'SUB_EVENT') {
                    nodeType = 'SUB_EVENT';
                    break;
                }
                if (upper === 'TIME') {
                    nodeType = 'TIME';
                    break;
                }
                if (label === 'RiskFeature' || label === 'RiskFactor' || label === 'Action' || label === 'Regulation' || label === 'Law') {
                    nodeType = label;
                    break;
                }
            }
            if (!nodeType) {
                const firstLabel = String(n.labels[0]);
                if (VALID_TYPES.has(firstLabel)) nodeType = firstLabel;
                else {
                    const upper = firstLabel.toUpperCase();
                    if (VALID_TYPES.has(upper)) nodeType = upper;
                }
            }
        }
        if (!nodeType && typeof n.type === 'string') {
            const upper = String(n.type).toUpperCase();
            nodeType = upper === 'COMPANY' || upper === 'SUBJECT' ? 'COMPANY' : upper === 'PERSON' ? 'PERSON' : upper === 'EVENT' ? 'EVENT' : upper === 'FEATURE' ? 'RiskFeature' : upper === 'REGULATION' ? 'Regulation' : VALID_TYPES.has(n.type) ? n.type : VALID_TYPES.has(upper) ? upper : n.type;
        }
        if (!nodeType && n.entity_type && VALID_TYPES.has(n.entity_type)) nodeType = n.entity_type;
        if (!nodeType) {
            const fallbackName = String(n.name || n.title || n.label || n.id || '');
            const upper = fallbackName.toUpperCase();
            if (/公司|集团|有限|股份|银行|基金|证券|保险|CO|LTD|INC|CORP/i.test(upper)) nodeType = 'COMPANY';
            else if (/风险|事件|违约|违规|监管|处罚/i.test(upper)) nodeType = 'RiskFeature';
            else nodeType = 'COMPANY';
        }
        if (!VALID_TYPES.has(nodeType)) {
            console.warn('[normalizeSubgraphNodes] Resolved type not in VALID_TYPES, forcing COMPANY:', {
                id: n.id,
                name: n.name,
                title: n.title,
                resolvedType: nodeType,
                rawType: n.type,
                rawEntityType: n.entity_type,
                labels: n.labels
            });
            nodeType = 'COMPANY';
        }
        const props = n.properties || {};
        const normalizedType = nodeType;
        return {
            id: String(n.id),
            type: normalizedType,
            entityType: normalizedType,
            entity_type: normalizedType,
            properties: props,
            raw: n,
            label: n.label || n.title || props.title || props.name || props.COMPANY_NM || n.name || String(n.id),
            title: n.title || props.title || props.name || props.COMPANY_NM || n.label || n.id,
            name: n.name || props.name || props.COMPANY_NM || props.title || n.label || n.id,
            zh_name: n.zh_name || props.zh_name || props.name,
            overview: n.overview || props.overview || props.RISK_INFO || '',
            popularity: n.popularity ?? props.popularity,
            rating: n.rating ?? props.rating,
            year: n.year ?? props.year,
            risk_level: (n.risk_level || props.risk_level || '').toString().toLowerCase() || undefined,
            compliance_score: n.compliance_score ?? props.compliance_score
        };
    });
}
function normalizeSubgraphEdges(rawEdges) {
    return rawEdges.map((e)=>({
            id: e.id || e.element_id || e.elementId,
            source: String(e.source || e.start || ''),
            target: String(e.target || e.end || ''),
            relation: e.relation || e.label || e.type || 'RELATED',
            confidence: e.confidence
        }));
}
const BACKEND_STAGE_TO_FRONTEND = {
    intent: 'planning',
    entity_resolution: 'planning',
    subgraph: 'retrieving',
    graph_analytics: 'entity_stats',
    community_detection: 'community',
    risk_analysis: 'analyzing',
    compliance: 'compliance',
    scoring: 'analyzing',
    governance: 'analyzing',
    reporting: 'reporting'
};
function mapBackendStage(backendStage) {
    return BACKEND_STAGE_TO_FRONTEND[backendStage] || 'retrieving';
}
function mergeRiskReport(prev, patch) {
    return {
        ...prev || {},
        ...patch,
        report_id: patch.report_id ?? (prev === null || prev === void 0 ? void 0 : prev.report_id),
        generated_at: patch.generated_at ?? (prev === null || prev === void 0 ? void 0 : prev.generated_at),
        executive_summary: patch.executive_summary ?? (prev === null || prev === void 0 ? void 0 : prev.executive_summary),
        markdown_report: patch.markdown_report ?? (prev === null || prev === void 0 ? void 0 : prev.markdown_report),
        echarts_config: patch.echarts_config ?? (prev === null || prev === void 0 ? void 0 : prev.echarts_config),
        entity_stats: patch.entity_stats ?? (prev === null || prev === void 0 ? void 0 : prev.entity_stats),
        community_info: patch.community_info ?? (prev === null || prev === void 0 ? void 0 : prev.community_info),
        risk_paths: patch.risk_paths ?? (prev === null || prev === void 0 ? void 0 : prev.risk_paths) ?? [],
        anomaly_findings: patch.anomaly_findings ?? (prev === null || prev === void 0 ? void 0 : prev.anomaly_findings) ?? [],
        compliance_matches: patch.compliance_matches ?? (prev === null || prev === void 0 ? void 0 : prev.compliance_matches) ?? [],
        risk_scores: patch.risk_scores ?? (prev === null || prev === void 0 ? void 0 : prev.risk_scores),
        governance_plan: patch.governance_plan ?? (prev === null || prev === void 0 ? void 0 : prev.governance_plan),
        evidence_chains: patch.evidence_chains ?? (prev === null || prev === void 0 ? void 0 : prev.evidence_chains)
    };
}
function compactText(value, fallback = '') {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value);
    } catch  {
        return fallback;
    }
}
function getSubgraphNodeName(node) {
    var _node_properties, _node_properties1;
    return compactText((node === null || node === void 0 ? void 0 : node.title) || (node === null || node === void 0 ? void 0 : node.zh_name) || (node === null || node === void 0 ? void 0 : node.name) || (node === null || node === void 0 ? void 0 : node.label) || (node === null || node === void 0 ? void 0 : (_node_properties = node.properties) === null || _node_properties === void 0 ? void 0 : _node_properties.name) || (node === null || node === void 0 ? void 0 : (_node_properties1 = node.properties) === null || _node_properties1 === void 0 ? void 0 : _node_properties1.COMPANY_NM) || (node === null || node === void 0 ? void 0 : node.id), '未知实体');
}
function buildGraphQaAnswer(query, subgraph) {
    const nodes = (subgraph === null || subgraph === void 0 ? void 0 : subgraph.nodes) || [];
    const edges = (subgraph === null || subgraph === void 0 ? void 0 : subgraph.edges) || [];
    if (nodes.length === 0) return '我暂时没有在图谱里找到明确匹配的实体或关系。可以把主体名称写完整一些，例如使用公司全称，我再帮你查。';
    const nodeById = new Map(nodes.map((node)=>[
            String(node.id),
            node
        ]));
    const degree = new Map();
    edges.forEach((edge)=>{
        const source = String(edge.source);
        const target = String(edge.target);
        degree.set(source, (degree.get(source) || 0) + 1);
        degree.set(target, (degree.get(target) || 0) + 1);
    });
    const center = [
        ...nodes
    ].sort((a, b)=>(degree.get(String(b.id)) || 0) - (degree.get(String(a.id)) || 0))[0];
    const centerId = center ? String(center.id) : '';
    const centerName = center ? getSubgraphNodeName(center) : '查询主体';
    const directEdges = edges.filter((edge)=>String(edge.source) === centerId || String(edge.target) === centerId);
    const related = directEdges.map((edge)=>{
        const otherId = String(edge.source) === centerId ? String(edge.target) : String(edge.source);
        const other = nodeById.get(otherId);
        return {
            name: getSubgraphNodeName(other),
            relation: compactText(edge.relation || edge.type || edge.label, '关联')
        };
    }).filter((item)=>item.name && item.name !== '未知实体');
    const lines = [];
    lines.push(`已根据你的问题查询到相关子图：${nodes.length} 个节点、${edges.length} 条关系。`);
    if (related.length > 0) {
        lines.push(`${centerName} 的直接关联包括：`);
        related.slice(0, 8).forEach((item, index)=>{
            lines.push(`${index + 1}. ${item.name}（${item.relation}）`);
        });
        if (related.length > 8) lines.push(`还有 ${related.length - 8} 个关联实体，可在右侧图谱继续查看。`);
    } else {
        const names = nodes.slice(0, 8).map(getSubgraphNodeName).join('、');
        lines.push(`本次命中的实体包括：${names}。`);
    }
    if (/简称|缩写/.test(query) || /^[\u4e00-\u9fa5]{2,4}$/.test(query.trim())) {
        lines.push('');
        lines.push('如果这是公司简称，可能对应多个图谱实体。你可以补充公司全称、地区或关联对象，我可以进一步精确定位。');
    }
    return lines.join('\n');
}
function buildPartialRiskAnswer(query, report, subgraph) {
    var _subgraph_nodes, _report_subgraph_summary, _subgraph_edges, _report_subgraph_summary1;
    const paths = (report === null || report === void 0 ? void 0 : report.risk_paths) || [];
    const anomalies = (report === null || report === void 0 ? void 0 : report.anomaly_findings) || [];
    const compliance = (report === null || report === void 0 ? void 0 : report.compliance_matches) || [];
    const nodes = (subgraph === null || subgraph === void 0 ? void 0 : (_subgraph_nodes = subgraph.nodes) === null || _subgraph_nodes === void 0 ? void 0 : _subgraph_nodes.length) || (report === null || report === void 0 ? void 0 : (_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) || 0;
    const edges = (subgraph === null || subgraph === void 0 ? void 0 : (_subgraph_edges = subgraph.edges) === null || _subgraph_edges === void 0 ? void 0 : _subgraph_edges.length) || (report === null || report === void 0 ? void 0 : (_report_subgraph_summary1 = report.subgraph_summary) === null || _report_subgraph_summary1 === void 0 ? void 0 : _report_subgraph_summary1.edge_count) || 0;
    const lines = [];
    lines.push('已按“协同治理社区报告”进入分析流程。');
    if (nodes || edges) lines.push(`当前已检索到 ${nodes} 个节点、${edges} 条关系，右侧已切换到治理报告面板。`);
    if (paths.length || anomalies.length || compliance.length) lines.push(`已识别 ${paths.length} 条风险传导路径、${anomalies.length} 个异常发现、${compliance.length} 条合规匹配。`);
    else lines.push('目前证据仍在汇总中，若图谱证据不足，报告会优先展示已确认的主体、群体和关系。');
    if (/简称|缩写|鑫达|华创/.test(query)) lines.push('如果主体名称是简称，建议补充公司全称以提升实体对齐准确度。');
    return lines.join('\n');
}
function extractAmbiguousShortMention(query) {
    var _match_;
    if (/有限公司|有限责任|股份|集团|控股|投资管理|金融服务|证券|银行|保险/.test(query)) return null;
    const match = query.match(/^\s*([\u4e00-\u9fa5]{2,4})(?:公司)?(?:\s|与|和|的|有|关|查|风险|合规)/);
    const mention = match === null || match === void 0 ? void 0 : (_match_ = match[1]) === null || _match_ === void 0 ? void 0 : _match_.trim();
    if (!mention) return null;
    const stopWords = new Set([
        '哪些',
        '公司',
        '关系',
        '关联',
        '查询',
        '风险',
        '合规',
        '这个',
        '那个'
    ]);
    return stopWords.has(mention) ? null : mention;
}
function buildClarifyAnswer(mention) {
    return `你说的“${mention}”可能是公司简称，图谱里可能存在多个相近实体。为了避免把主体识别错，请补充一个更明确的名称，例如公司全称、地区，或直接输入类似“${mention}投资管理有限公司”。`;
}
function buildReportAnswer(report) {
    var _report_risk_scores, _report_risk_scores1, _report_risk_scores2, _report_subgraph_summary, _report_subgraph_summary1;
    const paths = report.risk_paths || [];
    const anomalies = report.anomaly_findings || [];
    const compliance = report.compliance_matches || [];
    const recommendations = report.recommendations || [];
    const scoreLevel = ((_report_risk_scores = report.risk_scores) === null || _report_risk_scores === void 0 ? void 0 : _report_risk_scores.level) || report.overall_risk_level;
    const scoreValue = ((_report_risk_scores1 = report.risk_scores) === null || _report_risk_scores1 === void 0 ? void 0 : _report_risk_scores1.final_overall) ?? ((_report_risk_scores2 = report.risk_scores) === null || _report_risk_scores2 === void 0 ? void 0 : _report_risk_scores2.base_overall);
    const lines = [];
    lines.push(report.executive_summary || '协同治理分析已完成。');
    lines.push('');
    lines.push(`总体研判：${scoreLevel || '待评估'}${scoreValue !== undefined && scoreValue !== null ? `，综合评分 ${scoreValue}` : ''}`);
    lines.push(`图谱证据：${((_report_subgraph_summary = report.subgraph_summary) === null || _report_subgraph_summary === void 0 ? void 0 : _report_subgraph_summary.node_count) ?? '-'} 个节点、${((_report_subgraph_summary1 = report.subgraph_summary) === null || _report_subgraph_summary1 === void 0 ? void 0 : _report_subgraph_summary1.edge_count) ?? '-'} 条关系；识别 ${paths.length} 条风险路径、${anomalies.length} 个异常发现、${compliance.length} 条合规匹配。`);
    if (paths.length > 0) {
        lines.push('');
        lines.push('风险传导路径：');
        paths.slice(0, 4).forEach((p, index)=>{
            const desc = compactText(p.path_description || p.path_text, '暂无路径描述');
            lines.push(`${index + 1}. [${p.risk_level || 'medium'}] ${desc}`);
        });
    }
    if (anomalies.length > 0) {
        lines.push('');
        lines.push('异常关系：');
        anomalies.slice(0, 3).forEach((a, index)=>{
            lines.push(`${index + 1}. ${a.anomaly_type || '异常'}：${compactText(a.evidence, '暂无证据说明')}`);
        });
    }
    if (compliance.length > 0) {
        lines.push('');
        lines.push('合规风险：');
        compliance.slice(0, 3).forEach((c, index)=>{
            const basis = [
                c.regulation,
                c.article
            ].filter(Boolean).join(' ');
            lines.push(`${index + 1}. ${basis || '相关法规'}：${c.violation || c.suggested_action || '需进一步核验'}`);
        });
    }
    if (recommendations.length > 0) {
        lines.push('');
        lines.push('治理建议：');
        recommendations.slice(0, 4).forEach((r, index)=>{
            lines.push(`${index + 1}. ${r.action}（${r.department || '责任部门待定'}，${r.urgency || 'normal'}）`);
        });
    }
    return lines.join('\n').slice(0, 1800);
}
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
        activeRightPanel: 'graph',
        resolvedEntities: [],
        evidenceChains: null,
        riskScores: null,
        governancePlan: null,
        riskReport: null,
        riskStages: [],
        riskCommunity: null,
        riskEntityCommunityMap: null,
        complianceScores: null,
        complianceIndicators: null,
        uploadedFile: null,
        fileUploading: false,
        agentTraces: [],
        lastRiskQuery: '',
        sendMessage: async (query, rewrittenQuery)=>{
            return get().sendUnifiedMessage(rewrittenQuery || query);
        },
        sendRiskQuery: async (query, communityId, fileContent)=>{
            set({
                lastRiskQuery: query
            });
            return get().sendUnifiedMessage(query, 'risk_analysis');
        },
        sendUnifiedMessage: async (query, intentHint)=>{
            if (get().isLoading) return;
            const ambiguousMention = !intentHint ? extractAmbiguousShortMention(query) : null;
            if (ambiguousMention) {
                const userMsg = {
                    id: `user_${Date.now()}`,
                    role: 'user',
                    content: query,
                    timestamp: Date.now()
                };
                const assistantMsg = {
                    id: `asst_${Date.now()}`,
                    role: 'assistant',
                    content: buildClarifyAnswer(ambiguousMention),
                    timestamp: Date.now(),
                    isLoading: false
                };
                set((state)=>({
                        messages: [
                            ...state.messages,
                            userMsg,
                            assistantMsg
                        ],
                        currentRoute: 'graph',
                        activeRightPanel: 'graph',
                        clarifyMessage: assistantMsg.content
                    }));
                return;
            }
            if (!intentHint) {
                const riskKeywords = [
                    '风险',
                    '传导',
                    '合规',
                    '违规',
                    '处罚',
                    '监管',
                    '担保',
                    '关联交易',
                    '资金占用',
                    '内幕',
                    '操纵',
                    '洗钱',
                    '欺诈',
                    '违约',
                    '评级',
                    '预警',
                    '治理报告',
                    '社区报告',
                    '社区风险',
                    '群体风险',
                    '风险报告',
                    '协同治理'
                ];
                if (riskKeywords.some((kw)=>query.includes(kw))) intentHint = 'risk_analysis';
            }
            const expectedIntent = intentHint ?? 'graph_qa';
            const expectsRiskReport = expectedIntent === 'risk_analysis';
            const { sessionId, roundId, messages, uploadedFile } = get();
            set({
                roundId: roundId + 1
            });
            const userMsg = {
                id: `user_${Date.now()}`,
                role: 'user',
                content: query,
                timestamp: Date.now()
            };
            const tempId = `asst_${Date.now()}`;
            const assistantMsg = {
                id: tempId,
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                isLoading: true
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
                    resolvedEntities: [],
                    evidenceChains: null,
                    riskScores: null,
                    governancePlan: null,
                    riskReport: null,
                    riskStages: [],
                    riskCommunity: null,
                    riskEntityCommunityMap: null,
                    complianceScores: null,
                    complianceIndicators: null,
                    currentRoute: expectsRiskReport ? 'risk' : 'graph',
                    activeRightPanel: expectsRiskReport ? 'risk' : 'graph'
                }));
            (0, _agent.sendUnifiedStream)({
                query,
                fileContent: (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.text) ?? null,
                sessionId,
                roundId: roundId + 1,
                maxHop: 3,
                intentHint: intentHint ?? null
            }, {
                onStage: (_stage, data)=>{
                    var _data_data, _data_data1;
                    const stageName = ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.stage_name) || '';
                    const stageAction = ((_data_data1 = data.data) === null || _data_data1 === void 0 ? void 0 : _data_data1.agent_action) || '';
                    const frontendStage = mapBackendStage(data.stage || _stage);
                    set((state)=>({
                            riskStages: [
                                ...state.riskStages,
                                {
                                    stage: frontendStage,
                                    content: stageAction || stageName
                                }
                            ],
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    thinkingStatus: stageAction || stageName
                                } : m)
                        }));
                },
                onEntities: (data)=>{
                    const resolved = data.resolved || [];
                    set({
                        resolvedEntities: resolved
                    });
                },
                onSubgraph: (graph)=>{
                    const rawNodes = graph.nodes || [];
                    const normalized = {
                        nodes: normalizeSubgraphNodes(rawNodes),
                        edges: normalizeSubgraphEdges(graph.edges || []),
                        paths: graph.paths || []
                    };
                    const nodeTypes = [
                        ...new Set(normalized.nodes.map((n)=>n.type))
                    ];
                    console.log(`[agentStore] onSubgraph nodes=${normalized.nodes.length} edges=${normalized.edges.length}`);
                    console.log('[agentStore] onSubgraph details:', {
                        paths: normalized.paths.length,
                        nodeTypes
                    });
                    if (rawNodes.length > 0) {
                        console.log('[agentStore] onSubgraph first raw node keys:', Object.keys(rawNodes[0]));
                        console.log('[agentStore] onSubgraph first raw node:', rawNodes[0]);
                    }
                    if (normalized.nodes.length > 0) {
                        console.log('[agentStore] onSubgraph first normalized node keys:', Object.keys(normalized.nodes[0]));
                        console.log('[agentStore] onSubgraph first normalized node:', normalized.nodes[0]);
                    }
                    const invalid = normalized.nodes.filter((n)=>!VALID_TYPES.has(n.type));
                    if (invalid.length > 0) console.warn('[agentStore] onSubgraph WARNING: nodes with invalid type after normalization:', invalid.map((n)=>({
                            id: n.id,
                            title: n.title,
                            type: n.type,
                            entityType: n.entityType,
                            entity_type: n.entity_type
                        })));
                    set({
                        currentSubgraph: normalized
                    });
                },
                onEntityStats: (stats)=>{
                    set((state)=>({
                            riskReport: mergeRiskReport(state.riskReport, {
                                entity_stats: stats
                            })
                        }));
                },
                onCommunity: (info)=>{
                    var _communities, _this, _this1;
                    console.log('[agentStore] onCommunity:', {
                        communityCount: (_this = info) === null || _this === void 0 ? void 0 : (_communities = _this.communities) === null || _communities === void 0 ? void 0 : _communities.length,
                        method: (_this1 = info) === null || _this1 === void 0 ? void 0 : _this1.selected_method
                    });
                    set((state)=>({
                            riskCommunity: info,
                            riskReport: mergeRiskReport(state.riskReport, {
                                community_info: info
                            })
                        }));
                },
                onEntityCommunityMap: (map)=>{
                    var _entities, _this, _this1;
                    console.log('[agentStore] onEntityCommunityMap:', {
                        entityCount: (_this = map) === null || _this === void 0 ? void 0 : (_entities = _this.entities) === null || _entities === void 0 ? void 0 : _entities.length,
                        unmapped: (_this1 = map) === null || _this1 === void 0 ? void 0 : _this1.unmapped_count
                    });
                    set((state)=>({
                            riskEntityCommunityMap: map
                        }));
                },
                onCandidateRiskPaths: (paths)=>{
                    const arr = Array.isArray(paths) ? paths : [];
                    console.log('[agentStore] onCandidateRiskPaths:', {
                        count: arr.length,
                        firstPath: arr[0]
                    });
                    const subgraphPaths = arr.map((p)=>({
                            pathId: p.path_id || '',
                            nodeIds: p.node_ids || [],
                            edgeIds: p.edge_ids || [],
                            score: p.confidence ?? 0.7
                        }));
                    set((state)=>{
                        var _state_currentSubgraph;
                        const currentPaths = ((_state_currentSubgraph = state.currentSubgraph) === null || _state_currentSubgraph === void 0 ? void 0 : _state_currentSubgraph.paths) || [];
                        const mergedPaths = [
                            ...currentPaths
                        ];
                        for (const sp of subgraphPaths)if (!mergedPaths.some((existing)=>existing.pathId === sp.pathId)) mergedPaths.push(sp);
                        console.log('[agentStore] onCandidateRiskPaths: merged subgraph.paths count =', mergedPaths.length);
                        return {
                            currentSubgraph: state.currentSubgraph ? {
                                ...state.currentSubgraph,
                                paths: mergedPaths
                            } : null
                        };
                    });
                },
                onRiskPaths: (paths)=>{
                    const data = paths;
                    const interpretedArr = Array.isArray(data === null || data === void 0 ? void 0 : data.interpreted_paths) ? data.interpreted_paths : Array.isArray(data) ? data : [];
                    const mergedArr = Array.isArray(data === null || data === void 0 ? void 0 : data.merged_paths) ? data.merged_paths : interpretedArr;
                    set((state)=>({
                            riskReport: mergeRiskReport(state.riskReport, {
                                risk_paths: interpretedArr
                            })
                        }));
                    if (mergedArr.length === 0) return;
                    const subgraphPaths = mergedArr.map((p)=>({
                            pathId: p.path_id || '',
                            nodeIds: p.node_ids || [],
                            edgeIds: p.edge_ids || [],
                            score: p.confidence ?? 0.7
                        }));
                    set((state)=>{
                        var _state_currentSubgraph;
                        const currentPaths = ((_state_currentSubgraph = state.currentSubgraph) === null || _state_currentSubgraph === void 0 ? void 0 : _state_currentSubgraph.paths) || [];
                        const newPaths = [
                            ...currentPaths
                        ];
                        for (const sp of subgraphPaths)if (!newPaths.some((existing)=>existing.pathId === sp.pathId)) newPaths.push(sp);
                        console.log('[agentStore] onRiskPaths: merged into subgraph.paths, count =', newPaths.length);
                        return {
                            currentSubgraph: state.currentSubgraph ? {
                                ...state.currentSubgraph,
                                paths: newPaths
                            } : null
                        };
                    });
                },
                onAnomalyFindings: (anomalies)=>{
                    set((state)=>{
                        var _this;
                        return {
                            riskReport: mergeRiskReport(state.riskReport, {
                                anomaly_findings: Array.isArray(anomalies) ? anomalies : ((_this = anomalies) === null || _this === void 0 ? void 0 : _this.anomalies) ?? []
                            })
                        };
                    });
                },
                onCompliance: (matches)=>{
                    set((state)=>{
                        var _this;
                        return {
                            riskReport: mergeRiskReport(state.riskReport, {
                                compliance_matches: Array.isArray(matches) ? matches : ((_this = matches) === null || _this === void 0 ? void 0 : _this.matches) ?? []
                            })
                        };
                    });
                },
                onComplianceScores: (scores)=>{
                    const scoreMap = scores;
                    console.log('[agentStore] onComplianceScores keys=%d', Object.keys(scoreMap || {}).length);
                    set({
                        complianceScores: scoreMap
                    });
                },
                onComplianceIndicators: (data)=>{
                    var _this;
                    const indicators = ((_this = data) === null || _this === void 0 ? void 0 : _this.indicators) || data || [];
                    console.log('[agentStore] onComplianceIndicators count=%d', Array.isArray(indicators) ? indicators.length : 0);
                    set({
                        complianceIndicators: Array.isArray(indicators) ? indicators : []
                    });
                },
                onScoring: (scores)=>{
                    set((state)=>{
                        var _this;
                        return {
                            riskScores: scores,
                            riskReport: mergeRiskReport(state.riskReport, {
                                risk_scores: scores,
                                overall_risk_level: (_this = scores) === null || _this === void 0 ? void 0 : _this.level
                            })
                        };
                    });
                },
                onGovernance: (plan)=>{
                    set((state)=>({
                            governancePlan: plan,
                            riskReport: mergeRiskReport(state.riskReport, {
                                governance_plan: plan
                            })
                        }));
                },
                onAgentTrace: (trace)=>{
                    set((state)=>({
                            agentTraces: [
                                ...state.agentTraces,
                                trace
                            ]
                        }));
                    console.groupCollapsed(`%c[AgentTrace] ${trace.agent} / ${trace.step}`, 'color:#fa8c16;font-weight:bold');
                    console.log(trace.summary, trace.metrics);
                    console.groupEnd();
                },
                onReport: (report)=>{
                    set((state)=>({
                            riskReport: mergeRiskReport(state.riskReport, report),
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: buildReportAnswer(report),
                                    isLoading: false,
                                    thinkingStatus: undefined,
                                    data: {
                                        echartsConfig: report.echarts_config
                                    }
                                } : m),
                            isLoading: false,
                            currentRoute: 'risk',
                            activeRightPanel: 'risk'
                        }));
                },
                onDone: (data)=>{
                    const finalIntent = (data === null || data === void 0 ? void 0 : data.intent_type) || expectedIntent;
                    const isRisk = finalIntent === 'risk_analysis';
                    set((state)=>({
                            isLoading: false,
                            currentRoute: isRisk ? 'risk' : 'graph',
                            activeRightPanel: isRisk ? 'risk' : 'graph',
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: m.content || (isRisk ? buildPartialRiskAnswer(query, state.riskReport, state.currentSubgraph) : buildGraphQaAnswer(query, state.currentSubgraph)),
                                    isLoading: false,
                                    thinkingStatus: undefined
                                } : m)
                        }));
                },
                onError: (msg)=>{
                    set((state)=>({
                            isLoading: false,
                            error: msg,
                            messages: state.messages.map((m)=>m.id === tempId ? {
                                    ...m,
                                    content: `Error: ${msg}`
                                } : m)
                        }));
                }
            });
        },
        retryRiskQuery: async ()=>{
            const { lastRiskQuery } = get();
            if (lastRiskQuery) await get().sendRiskQuery(lastRiskQuery);
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
                riskReport: null,
                riskStages: [],
                riskCommunity: null,
                riskEntityCommunityMap: null,
                complianceScores: null,
                complianceIndicators: null,
                activeRightPanel: 'graph',
                resolvedEntities: [],
                evidenceChains: null,
                riskScores: null,
                governancePlan: null,
                uploadedFile: null,
                fileUploading: false,
                agentTraces: [],
                lastRiskQuery: ''
            });
        },
        uploadFile: async (file)=>{
            const MAX_SIZE = 10485760;
            if (file.size > MAX_SIZE) {
                set({
                    error: '文件过大（最大 10MB）',
                    fileUploading: false
                });
                return;
            }
            set({
                fileUploading: true,
                error: null
            });
            try {
                const formData = new FormData();
                formData.append('file', file);
                const resp = await fetch('/api/v1/chat/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await resp.json();
                if (result.success) set({
                    uploadedFile: result.data,
                    fileUploading: false
                });
                else set({
                    error: result.message || '文件上传失败',
                    fileUploading: false
                });
            } catch (err) {
                set({
                    error: err.message || '文件上传失败',
                    fileUploading: false
                });
            }
        },
        clearUploadedFile: ()=>set({
                uploadedFile: null
            }),
        setError: (error)=>set({
                error
            }),
        clearRoute: ()=>set({
                currentRoute: null,
                currentSubgraph: null
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