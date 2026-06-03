globalThis.makoModuleHotUpdate('p__KnowledgeQA__index', {
    modules: {
        "src/pages/KnowledgeQA/components/NodeContextMenu.tsx": function(module, exports, __mako_require__) {
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
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
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
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EyeOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                        lineNumber: 23,
                        columnNumber: 26
                    }, this),
                    label: 'View Detail'
                },
                {
                    key: 'expand',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ApartmentOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                        lineNumber: 24,
                        columnNumber: 26
                    }, this),
                    label: 'Expand Connections'
                },
                {
                    key: 'report',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FileTextOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeQA/components/NodeContextMenu.tsx",
                        lineNumber: 25,
                        columnNumber: 26
                    }, this),
                    label: 'Generate Risk Report'
                },
                {
                    key: 'copy',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CopyOutlined, {}, void 0, false, {
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
                // Adjust position to stay within viewport
                const adjustedX = Math.min(x, window.innerWidth - 200);
                const adjustedY = Math.min(y, window.innerHeight - (menuItems.length * 36 + 16));
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
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
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
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
                        menuItems.map((item)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
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
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
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
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
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
        }
    }
}, function(runtime) {
    runtime._h = '11171166350643323225';
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

//# sourceMappingURL=p__KnowledgeQA__index-async.17562206047608428965.hot-update.js.map