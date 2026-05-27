globalThis.makoModuleHotUpdate('p__CommunityDiscovery__index', {
    modules: {
        "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx": function(module, exports, __mako_require__) {
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
            var _react = /*#__PURE__*/ _interop_require_default._(__mako_require__("node_modules/react/index.js"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const LAYER_OPTIONS = [
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
            ];
            const ALGORITHM_OPTIONS = [
                {
                    value: 'wcc',
                    label: '连通分量 (WCC)'
                },
                {
                    value: 'louvain',
                    label: 'Louvain 模块度'
                },
                {
                    value: 'label_propagation',
                    label: '标签传播'
                }
            ];
            const DiscoveryConfig = ({ loading, onDiscover, onReset, result })=>{
                _s();
                const [form] = _antd.Form.useForm();
                const handleDiscover = ()=>{
                    const values = form.getFieldsValue();
                    onDiscover({
                        layer: values.layer || 'all',
                        method: values.method || 'wcc',
                        minSize: values.minSize ?? 3,
                        maxNodes: values.maxNodes ?? 5000
                    });
                };
                const handleReset = ()=>{
                    form.resetFields();
                    onReset();
                };
                const avgSize = result && result.communities.length > 0 ? Math.round(result.communities.reduce((s, c)=>s + c.size, 0) / result.communities.length) : 0;
                const maxSize = result && result.communities.length > 0 ? result.communities[0].size : 0;
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                    size: "small",
                    styles: {
                        body: {
                            padding: '8px 16px'
                        }
                    },
                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap'
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form, {
                                form: form,
                                layout: "inline",
                                size: "small",
                                initialValues: {
                                    layer: 'all',
                                    method: 'wcc',
                                    minSize: 3,
                                    maxNodes: 5000
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexWrap: 'wrap'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        label: "检索层级",
                                        name: "layer",
                                        style: {
                                            marginBottom: 0
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                            options: LAYER_OPTIONS,
                                            style: {
                                                width: 100
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                            lineNumber: 84,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 83,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        label: "发现算法",
                                        name: "method",
                                        style: {
                                            marginBottom: 0
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Radio.Group, {
                                            options: ALGORITHM_OPTIONS,
                                            optionType: "button",
                                            buttonStyle: "solid",
                                            size: "small"
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                            lineNumber: 88,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 87,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        label: "最小规模",
                                        name: "minSize",
                                        style: {
                                            marginBottom: 0
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                            min: 1,
                                            max: 50,
                                            style: {
                                                width: 64
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                            lineNumber: 97,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 96,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                        label: "最大节点",
                                        name: "maxNodes",
                                        style: {
                                            marginBottom: 0
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.InputNumber, {
                                            min: 100,
                                            max: 10000,
                                            step: 100,
                                            style: {
                                                width: 80
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                            lineNumber: 101,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 100,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        size: 4,
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                type: "primary",
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                                    lineNumber: 107,
                                                    columnNumber: 21
                                                }, void 0),
                                                loading: loading,
                                                onClick: handleDiscover,
                                                children: "开始发现"
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                                lineNumber: 105,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 21
                                                }, void 0),
                                                onClick: handleReset,
                                                children: "重置"
                                            }, void 0, false, {
                                                fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                                lineNumber: 113,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 104,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                lineNumber: 76,
                                columnNumber: 9
                            }, this),
                            result && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            height: 24,
                                            borderLeft: '1px solid #e8e8e8',
                                            margin: '0 4px'
                                        }
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "群体总数",
                                        value: result.communities_count,
                                        loading: loading
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 125,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "模块度",
                                        value: result.modularity !== undefined ? result.modularity.toFixed(3) : '-',
                                        loading: loading
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "平均规模",
                                        value: avgSize,
                                        loading: loading
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                        title: "最大规模",
                                        value: maxSize,
                                        loading: loading
                                    }, void 0, false, {
                                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                        lineNumber: 75,
                        columnNumber: 7
                    }, this)
                }, void 0, false, {
                    fileName: "src/pages/CommunityDiscovery/components/DiscoveryConfig.tsx",
                    lineNumber: 74,
                    columnNumber: 5
                }, this);
            };
            _s(DiscoveryConfig, "rI7DrJIrFu7YmlGWYiMFTzs8jF0=", false, function() {
                return [
                    _antd.Form.useForm
                ];
            });
            _c = DiscoveryConfig;
            var _default = DiscoveryConfig;
            var _c;
            $RefreshReg$(_c, "DiscoveryConfig");
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
    runtime._h = '9831507095799633632';
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

//# sourceMappingURL=p__CommunityDiscovery__index-async.9007128837023350078.hot-update.js.map