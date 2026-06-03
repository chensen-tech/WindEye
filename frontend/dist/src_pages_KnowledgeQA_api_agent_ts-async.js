((typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] = (typeof globalThis !== 'undefined' ? globalThis : self)["makoChunk_ant-design-pro"] || []).push([
        ['src/pages/KnowledgeQA/api/agent.ts'],
{ "src/pages/KnowledgeQA/api/agent.ts": function (module, exports, __mako_require__){
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
                if (callbacks.onStage) {
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
                    else if (data.content) callbacks.onStage(data.content);
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
                                    // 展开第一个群体的详细成员
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
                                    // 单独打印有多个群体归属的桥接实体
                                    const bridges = map.entities.filter((e)=>{
                                        var _e_communities;
                                        return ((_e_communities = e.communities) === null || _e_communities === void 0 ? void 0 : _e_communities.length) >= 2;
                                    });
                                    if (bridges.length > 0) console.log('%c桥接实体 (≥2个群体):', 'color:#fa8c16;font-weight:bold', bridges.map((e)=>e.name));
                                    // 单独打印未归属的实体
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
 }]);
//# sourceMappingURL=src_pages_KnowledgeQA_api_agent_ts-async.js.map