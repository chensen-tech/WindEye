globalThis.makoModuleHotUpdate('p__CommunityDiscovery__index', {
    modules: {
        "src/pages/CommunityDiscovery/hooks/useCommunityGraph.ts": function(module, exports, __mako_require__) {
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
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
            var _g6 = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/@antv/g6/es/index.js"));
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
                    // Group nodes by community and apply community colors
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
                    // ── Pre-layout: arrange community centers in a circle, nodes near center ──
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
                            nodeStrength: -200,
                            edgeStrength: 0.08,
                            linkDistance: 120,
                            nodeSpacing: 30,
                            alphaDecay: 0.015
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
                    // Draw convex hulls after force layout stabilizes
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
                            // Move hull behind data nodes
                            const hullItem = graph.findById(`hull-${commId}`);
                            if (hullItem) hullItem.toBack();
                        });
                        graph.paint();
                    };
                    // Try drawing hulls after layout stabilizes
                    const onAfterLayout = ()=>{
                        // Small delay to ensure positions are settled
                        setTimeout(drawHulls, 300);
                    };
                    graph.on('afterlayout', onAfterLayout);
                    // If force layout doesn't fire afterlayout, fallback
                    const fallbackTimer = setTimeout(drawHulls, 3000);
                    // Node click handler
                    graph.on('node:click', (evt)=>{
                        var _evt_item, _onNodeClickRef_current;
                        const model = (_evt_item = evt.item) === null || _evt_item === void 0 ? void 0 : _evt_item.getModel();
                        if (!model) return;
                        // Ignore clicks on hull nodes
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
                    // Canvas click to deselect
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
                // Handle selected community highlight
                (0, _react.useEffect)(()=>{
                    const graph = graphRef.current;
                    if (!graph) return;
                    const allNodes = graph.getNodes();
                    allNodes.forEach((n)=>{
                        const model = n.getModel();
                        if (model.type === 'community-hull') {
                            // Highlight selected hull
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
        }
    }
}, function(runtime) {
    runtime._h = '15969576019971321937';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.10841839381624049583.hot-update.js.map