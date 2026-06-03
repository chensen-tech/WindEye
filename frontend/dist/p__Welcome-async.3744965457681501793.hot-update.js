globalThis.makoModuleHotUpdate('p__Welcome', {
    modules: {
        "src/services/dashboard.ts": function(module, exports, __mako_require__) {
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
            var _reactrefresh = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react-refresh/runtime.js"));
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
        }
    }
}, function(runtime) {
    runtime._h = '17562206047608428965';
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

//# sourceMappingURL=p__Welcome-async.3744965457681501793.hot-update.js.map