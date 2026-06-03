globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx": function(module, exports, __mako_require__) {
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
            var _g6 = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
            var _axios = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/axios/index.js"));
            var _NodeContextMenu = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/NodeContextMenu.tsx"));
            var _GraphToolbar = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/KnowledgeQA/components/GraphToolbar.tsx"));
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
                // Expand API returns {id, label, type} with type as a raw Neo4j label — prefer it
                let rawType = raw.type || labels[0] || 'Unknown';
                // Map Neo4j labels to frontend type constants
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
                // Subject-layer types (from spec — primary display types)
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
                // Cross-layer types (existing)
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
                // Compute degree centrality for node sizing
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
                // Build path node id set and edge id set for path highlighting
                const pathNodeIds = new Set();
                const pathEdgeKeys = new Set();
                const pathEdgeIds = new Set();
                for (const path of subgraph.paths || []){
                    for (const nid of path.nodeIds || [])pathNodeIds.add(String(nid));
                    // Prefer explicit edge_ids when available
                    if (path.edgeIds && path.edgeIds.length > 0) for (const eid of path.edgeIds)pathEdgeIds.add(String(eid));
                    // Fallback: infer edges from adjacent node pairs
                    const nids = path.nodeIds || [];
                    for(let i = 0; i < nids.length - 1; i++){
                        pathEdgeKeys.add(`${nids[i]}${PATH_EDGE_KEY_SEP}${nids[i + 1]}`);
                        pathEdgeKeys.add(`${nids[i + 1]}${PATH_EDGE_KEY_SEP}${nids[i]}`);
                        pathEdgeKeys.add(`${nids[i]}→${nids[i + 1]}`);
                        pathEdgeKeys.add(`${nids[i + 1]}→${nids[i]}`);
                    }
                }
                // Build node → community mapping from entityCommunityMap
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
                // Resolve node type from unified format: type > entityType > entity_type > labels > heuristics
                const resolveNodeType = (node)=>{
                    const t = node.type;
                    if (t && VALID_NODE_TYPES.has(t)) return t;
                    // Try uppercase variant (e.g. "Company" → "COMPANY")
                    if (t) {
                        const upper = t.toUpperCase();
                        if (upper === 'COMPANY' || upper === 'SUBJECT') return 'COMPANY';
                        if (upper === 'PERSON') return 'PERSON';
                        if (upper === 'EVENT') return 'EVENT';
                        if (upper === 'SUB_EVENT') return 'SUB_EVENT';
                        if (upper === 'TIME') return 'TIME';
                        if (VALID_NODE_TYPES.has(upper)) return upper;
                    }
                    // Unified format: check entityType then entity_type
                    const entType = node.entityType;
                    if (entType && VALID_NODE_TYPES.has(entType)) return entType;
                    const entType2 = node.entity_type;
                    if (entType2 && VALID_NODE_TYPES.has(entType2)) return entType2;
                    // Neo4j format: type info is in `labels` array
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
                        // Last resort: check first label after uppercasing
                        const first = String(labels[0]);
                        if (VALID_NODE_TYPES.has(first)) return first;
                        const upperFirst = first.toUpperCase();
                        if (VALID_NODE_TYPES.has(upperFirst)) return upperFirst;
                    }
                    // Absolute fallback: return 'COMPANY' to prevent silent node filtering
                    return 'COMPANY';
                };
                // Resolve edge relation from either frontend format (relation) or Neo4j/DRAEngine (label/type)
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
                    // Risk-level color mapping
                    const riskLevel = node.risk_level;
                    const complianceScore = node.compliance_score ?? ((_this = node.properties) === null || _this === void 0 ? void 0 : _this.compliance_score);
                    const riskVisual = riskLevel ? _graphStyles.RISK_LEVEL_VISUAL[riskLevel] : null;
                    const fillColor = (riskVisual === null || riskVisual === void 0 ? void 0 : riskVisual.bg) || visual.fill;
                    const strokeColor = (riskVisual === null || riskVisual === void 0 ? void 0 : riskVisual.border) || visual.stroke;
                    // Degree-based size
                    const deg = degreeMap.get(nodeIdStr) || 1;
                    const nodeSize = scaleSize(deg);
                    const isPathNode = pathNodeIds.has(nodeIdStr);
                    const isSubject = subjectIdSet.has(nodeIdStr);
                    const isNeighbor = neighborIdSet.has(nodeIdStr);
                    // Community coloring
                    const nodeName = String(node.title || node.name || node.zh_name || '');
                    const communityMatch = nodeCommunityMap.get(nodeName) || nodeCommunityMap.get(String(node.id));
                    const communityIds = (communityMatch === null || communityMatch === void 0 ? void 0 : communityMatch.communityIds) || [];
                    const communityRoles = (communityMatch === null || communityMatch === void 0 ? void 0 : communityMatch.roles) || [];
                    const isBridge = communityRoles.includes('bridge') || communityIds.length >= 2;
                    const primaryCommunityId = communityIds.length > 0 ? communityIds[0] : null;
                    const communityColor = primaryCommunityId != null ? getCommunityColor(primaryCommunityId) : null;
                    // Community-based fill/stroke — bridge nodes get a special dual-color effect
                    const communityFill = communityColor && !isSubject && !isPathNode ? communityColor.bg : undefined;
                    const communityStroke = communityColor ? communityColor.stroke : undefined;
                    // Keep entity type color visible; path state uses glow instead of replacing all borders.
                    const borderColor = isSubject ? '#2855D1' : isNeighbor ? '#1890FF' : isPathNode ? strokeColor : isBridge ? communityStroke || strokeColor : communityStroke || strokeColor;
                    const borderWidth = isSubject ? 4 : isNeighbor ? 2 : isPathNode ? 2.5 : isBridge ? 3 : 2;
                    const finalSize = isSubject ? nodeSize * 1.3 : isBridge ? nodeSize * 1.2 : isNeighbor ? nodeSize * 1.1 : nodeSize;
                    // Bridge nodes: dashed border with community color
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
                    // Confidence-based width scaling: strong >0.8 = +1px, weak <0.5 = -0.5px + lower opacity
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
            const EnhancedGraphPanel = /*#__PURE__*/ _s((0, _react.forwardRef)(_c = _s(({ subgraph, alignmentFeatures, entityCommunityMap, onNodeDoubleClick, onNodeClick, onCanvasClick, onStatsChange, highlightedEntity }, ref)=>{
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
                // Interactive filtering state
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
                // ── Toolbar handlers ──
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
                                // Custom concentric layout algorithm
                                const nodes = g.getNodes();
                                const edges = g.getEdges();
                                if (nodes.length === 0) break;
                                // Build adjacency map
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
                                // Find subject node(s) — highest degree nodes
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
                                if (subjectIds.size === 0 && nodes.length > 0) // Pick highest-degree node as center
                                nodes.forEach((n)=>{
                                    var _adj_get;
                                    const id = n.getID();
                                    if ((((_adj_get = adj.get(id)) === null || _adj_get === void 0 ? void 0 : _adj_get.size) || 0) === maxDeg) subjectIds.add(id);
                                });
                                // BFS to compute hop distances from any subject node
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
                                // Unreachable nodes get max hop + 1
                                const maxHop = hop.size > 0 ? Math.max(...hop.values()) : 0;
                                nodes.forEach((n)=>{
                                    if (!hop.has(n.getID())) hop.set(n.getID(), maxHop + 1);
                                });
                                // Group nodes by community
                                const nodeComm = new Map();
                                nodes.forEach((n)=>{
                                    const model = n.getModel();
                                    const cids = model._communityIds;
                                    nodeComm.set(n.getID(), cids && cids.length > 0 ? cids[0] : 0);
                                });
                                // Group nodes by ring (hop % 4 mapping: 0→center, 1→r1, 2→r2, 3+→r3)
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
                                // Place nodes ring by ring
                                for(let ring = 0; ring <= 3; ring++){
                                    const members = rings.get(ring) || [];
                                    if (members.length === 0) continue;
                                    // Sort by community so same-community nodes cluster together
                                    members.sort((a, b)=>a.comm - b.comm);
                                    const r = radii[ring];
                                    members.forEach((m, i)=>{
                                        const angle = 2 * Math.PI * i / members.length - Math.PI / 2;
                                        m.x = center.x + r * Math.cos(angle);
                                        m.y = center.y + r * Math.sin(angle);
                                    });
                                    // Place ring 0 (center) at the center
                                    if (ring === 0) members.forEach((m)=>{
                                        m.x = center.x;
                                        m.y = center.y;
                                    });
                                }
                                // Apply positions
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
                // ── Context menu handlers ──
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
                    // Dispatch a custom event that the parent can listen to for switching to risk tab
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
                            // Pulse animation: outer ring glow for high-risk nodes (pulsing shadowBlur)
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
                            // Path flow animation
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
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                    style: styles.root,
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: styles.graphArea,
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                ref: containerRef,
                                style: styles.graphCanvas
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeQA/components/EnhancedGraphPanel.tsx",
                                lineNumber: 1197,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
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
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_GraphToolbar.default, {
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
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_NodeContextMenu.default, {
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
        }
    }
}, function(runtime) {
    runtime._h = '10500530292657447461';
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

//# sourceMappingURL=p__KnowledgeQA__index-async.11171166350643323225.hot-update.js.map