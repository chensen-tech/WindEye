globalThis.makoModuleHotUpdate('p__KnowledgeBuild__index', {
    modules: {
        "src/pages/KnowledgeBuild/index.tsx": function(module, exports, __mako_require__) {
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
            var _icons = __mako_require__("node_modules/@ant-design/icons/es/index.js");
            var _procomponents = __mako_require__("node_modules/@ant-design/pro-components/es/index.js");
            var _antd = __mako_require__("node_modules/antd/es/index.js");
            var _react = /*#__PURE__*/ _interop_require_wildcard._(__mako_require__("node_modules/react/index.js"));
            var _graphConfig = __mako_require__("src/pages/graphConfig.ts");
            var _crawlStore = __mako_require__("src/pages/DataCollection/store/crawlStore.ts");
            var _useCrawlSSE = __mako_require__("src/pages/DataCollection/hooks/useCrawlSSE.ts");
            var _QuickInputPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/DataCollection/components/QuickInputPanel.tsx"));
            var _ComplexInputPanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/DataCollection/components/ComplexInputPanel.tsx"));
            var _TemplatePanel = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/DataCollection/components/TemplatePanel.tsx"));
            var _CrawlProgress = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/DataCollection/components/CrawlProgress.tsx"));
            var _CrawlResult = /*#__PURE__*/ _interop_require_default._(__mako_require__("src/pages/DataCollection/components/CrawlResult.tsx"));
            var prevRefreshReg;
            var prevRefreshSig;
            prevRefreshReg = self.$RefreshReg$;
            prevRefreshSig = self.$RefreshSig$;
            self.$RefreshReg$ = (type, id)=>{
                _reactrefresh.register(type, module.id + id);
            };
            self.$RefreshSig$ = _reactrefresh.createSignatureFunctionForTransform;
            var _s = $RefreshSig$();
            const RadioGroup = _antd.Radio.Group;
            const RadioButton = _antd.Radio.Button;
            const { Dragger } = _antd.Upload;
            // ─── Constants ───────────────────────────────────────────────────────
            const STAGES = [
                {
                    key: 'data_import',
                    title: '数据导入',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloudUploadOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 168,
                        columnNumber: 46
                    }, this),
                    description: '上传PDF/爬取数据'
                },
                {
                    key: 'subject_extraction',
                    title: '主体提取',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 169,
                        columnNumber: 53
                    }, this),
                    description: 'NER实体识别'
                },
                {
                    key: 'event_extraction',
                    title: '事件提取',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 170,
                        columnNumber: 51
                    }, this),
                    description: '事件抽取与时序'
                },
                {
                    key: 'feature_extraction',
                    title: '风险特征',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExclamationCircleOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 171,
                        columnNumber: 53
                    }, this),
                    description: '风险因子提取'
                },
                {
                    key: 'regulation_linking',
                    title: '法规链接',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LinkOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 172,
                        columnNumber: 53
                    }, this),
                    description: '法规条款匹配'
                },
                {
                    key: 'kg_import',
                    title: '图谱导入',
                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BuildOutlined, {}, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 173,
                        columnNumber: 44
                    }, this),
                    description: 'Neo4j写入'
                }
            ];
            const CRAWLER_SOURCES = [
                {
                    value: 'risk_event_sse',
                    label: '上交所风险事件',
                    description: '上交所股票交易异常波动/诉讼仲裁/风险警示公告 PDF'
                },
                {
                    value: 'risk_event_szse',
                    label: '深交所风险事件',
                    description: '深交所自律监管措施公告 PDF'
                },
                {
                    value: 'risk_event_bse',
                    label: '北交所风险事件',
                    description: '北交所纪律处分公告 PDF'
                },
                {
                    value: 'risk_sentiment',
                    label: '财经舆情',
                    description: '证券之星财经新闻舆情 TXT 文件'
                }
            ];
            const NODE_TYPE_COLORS = {
                COMPANY: '#FFC101',
                PERSON: '#1890FF',
                PFCOMPANY: '#722ED1',
                PFUND: '#008000',
                SECURITY: '#F5222D',
                EVENT: '#FF6B6B',
                TIME: '#52C41A',
                RiskFeature: '#4CAF50',
                RiskFactor: '#9C27B0',
                Regulation: '#FFC101',
                Law: '#1890FF',
                Action: '#45B7D1'
            };
            // ─── Component ───────────────────────────────────────────────────────
            const KnowledgeBuild = ()=>{
                var _STAGES_find, _STAGES_find1, _STAGES_find2, _STAGES_stageIndex;
                _s();
                const { message: msg } = _antd.App.useApp();
                // Build state
                const [buildStatus, setBuildStatus] = (0, _react.useState)('idle');
                const [buildId, setBuildId] = (0, _react.useState)(null);
                const [activeStage, setActiveStage] = (0, _react.useState)('data_import');
                const [overallProgress, setOverallProgress] = (0, _react.useState)(0);
                const [abortRef] = (0, _react.useState)({
                    controller: null
                });
                // Stage data
                const [dataSources, setDataSources] = (0, _react.useState)([]);
                const [subjects, setSubjects] = (0, _react.useState)([]);
                const [events, setEvents] = (0, _react.useState)([]);
                const [features, setFeatures] = (0, _react.useState)([]);
                const [regulations, setRegulations] = (0, _react.useState)([]);
                const [importPreview, setImportPreview] = (0, _react.useState)(null);
                const [importResult, setImportResult] = (0, _react.useState)(null);
                const [stageLogs, setStageLogs] = (0, _react.useState)([]);
                const [buildHistory, setBuildHistory] = (0, _react.useState)([]);
                // UI state
                const [uploadedFiles, setUploadedFiles] = (0, _react.useState)([]);
                const [selectedCrawlers, setSelectedCrawlers] = (0, _react.useState)([]);
                const [scanLoading, setScanLoading] = (0, _react.useState)(false);
                const [scannedFiles, setScannedFiles] = (0, _react.useState)({});
                const [pipelineRunning, setPipelineRunning] = (0, _react.useState)(false);
                const [running, setRunning] = (0, _react.useState)(false);
                const [eventViewMode, setEventViewMode] = (0, _react.useState)('table');
                const [selectedEvent, setSelectedEvent] = (0, _react.useState)(null);
                const [editingSubject, setEditingSubject] = (0, _react.useState)(null);
                const [conflictVisible, setConflictVisible] = (0, _react.useState)(false);
                const [importing, setImporting] = (0, _react.useState)(false);
                const [importTab, setImportTab] = (0, _react.useState)('upload');
                // ─── Crawl store / SSE (from DataCollection) ──────────────────────
                const crawlMode = (0, _crawlStore.useCrawlStore)((s)=>s.mode);
                const crawlRunning = (0, _crawlStore.useCrawlStore)((s)=>s.isRunning);
                const crawlResult = (0, _crawlStore.useCrawlStore)((s)=>s.result);
                const crawlDataType = (0, _crawlStore.useCrawlStore)((s)=>s.dataType);
                const crawlSources = (0, _crawlStore.useCrawlStore)((s)=>s.sources);
                const crawlKeywords = (0, _crawlStore.useCrawlStore)((s)=>s.keywords);
                const crawlMaxPages = (0, _crawlStore.useCrawlStore)((s)=>s.maxPages);
                const crawlNlQuery = (0, _crawlStore.useCrawlStore)((s)=>s.nlQuery);
                const crawlParsedIntent = (0, _crawlStore.useCrawlStore)((s)=>s.parsedIntent);
                const crawlTemplateId = (0, _crawlStore.useCrawlStore)((s)=>s.templateId);
                const crawlSetMode = (0, _crawlStore.useCrawlStore)((s)=>s.setMode);
                const { startCrawl, cancelCrawl } = (0, _useCrawlSSE.useCrawlSSE)();
                const handleStartCrawl = ()=>{
                    const payload = {
                        mode: crawlMode === 'template' ? 'template' : crawlMode === 'complex' ? 'complex' : 'quick',
                        data_type: crawlDataType,
                        sources: crawlSources.length > 0 ? crawlSources : undefined,
                        keywords: crawlKeywords.length > 0 ? crawlKeywords : undefined,
                        max_pages: crawlMaxPages
                    };
                    if (crawlMode === 'complex') {
                        payload.natural_language_query = crawlNlQuery;
                        if (crawlParsedIntent) {
                            payload.sources = crawlParsedIntent.sources;
                            payload.keywords = crawlParsedIntent.keywords;
                            payload.max_pages = crawlParsedIntent.max_pages;
                        }
                    }
                    if (crawlMode === 'template') payload.template_id = crawlTemplateId;
                    // Switch right panel to show crawl progress
                    setActiveStage('data_import');
                    startCrawl(payload);
                };
                // G6 refs
                const graphContainer = (0, _react.useRef)(null);
                const graphRef = (0, _react.useRef)(null);
                // ─── Stage index helpers ──────────────────────────────────────────
                const stageIndex = STAGES.findIndex((s)=>s.key === activeStage);
                const completedStages = STAGES.filter((s)=>{
                    const idx = STAGES.findIndex((x)=>x.key === s.key);
                    return idx < stageIndex || idx === stageIndex && buildStatus === 'completed';
                }).map((s)=>s.key);
                // ─── Logging ─────────────────────────────────────────────────────
                const addLog = (stage, message, level = 'info')=>{
                    const now = new Date().toLocaleTimeString();
                    setStageLogs((prev)=>[
                            ...prev,
                            {
                                time: now,
                                stage,
                                message,
                                level
                            }
                        ]);
                };
                const handleScanFiles = async ()=>{
                    if (selectedCrawlers.length === 0) {
                        msg.warning('请先选择数据源');
                        return;
                    }
                    setScanLoading(true);
                    const results = {};
                    for (const source of selectedCrawlers)try {
                        const res = await fetch(`/api/v1/pipeline/files/${source}`);
                        const data = await res.json();
                        if (data.files) results[source] = data.files;
                    } catch  {
                        results[source] = [];
                    }
                    setScannedFiles(results);
                    setScanLoading(false);
                    const total = Object.values(results).reduce((a, b)=>a + b.length, 0);
                    if (total === 0) msg.info('所选数据源中没有待处理文件');
                    else msg.success(`扫描完成: 共 ${total} 个文件`);
                };
                // ─── Map real pipeline results to rendering state ────────────────────
                const populateStageResults = (stages)=>{
                    var _extractStage_stats, _extractStage_stats1;
                    // Extract entities from the extract stage
                    const extractStage = stages.extract || stages.parse || {};
                    const entities = extractStage.entities || extractStage.records || [];
                    const newSubjects = [];
                    const newEvents = [];
                    const seenIds = new Set();
                    for(let i = 0; i < entities.length; i++){
                        const ent = entities[i];
                        const name = ent.name || ent.mention || ent.title || `实体_${i}`;
                        const entType = ent.type || ent.label || ent.entity_type || 'Unknown';
                        const id = ent.id || ent.kg_id || `ent_${i}`;
                        if (seenIds.has(id)) continue;
                        seenIds.add(id);
                        // Classify into subject, event, or feature based on type
                        if (entType === 'EVENT' || entType === 'Event' || entType === 'event') newEvents.push({
                            id: String(id),
                            title: name,
                            eventType: ent.event_type || entType,
                            subjects: ent.subjects || ent.entities || [],
                            time: ent.time || ent.date || '',
                            riskLevel: ent.risk_level || (ent.confidence > 0.7 ? 'medium' : 'low'),
                            description: ent.description || ent.text || ''
                        });
                        else newSubjects.push({
                            id: String(id),
                            name,
                            type: entType,
                            confidence: ent.confidence || ent.score || 0.5,
                            sourceDoc: ent.source || ent.source_doc || '',
                            properties: ent.properties || ent.attributes || {}
                        });
                    }
                    setSubjects(newSubjects);
                    setEvents(newEvents);
                    // Features and regulations — derive from stats if available
                    const featuresList = ((_extractStage_stats = extractStage.stats) === null || _extractStage_stats === void 0 ? void 0 : _extractStage_stats.features) || extractStage.features || [];
                    const newFeatures = featuresList.map((f, i)=>({
                            id: f.id || `feat_${i}`,
                            name: f.name || f.feature_name || `风险特征_${i}`,
                            featureType: f.type || f.feature_type || '1',
                            riskLevel: f.risk_level || 'medium',
                            relatedSubjects: f.subjects || f.entities || [],
                            evidence: f.evidence || f.description || '',
                            confidence: f.confidence || f.score || 0.7
                        }));
                    setFeatures(newFeatures);
                    const regsList = ((_extractStage_stats1 = extractStage.stats) === null || _extractStage_stats1 === void 0 ? void 0 : _extractStage_stats1.regulations) || extractStage.regulations || [];
                    const newRegs = regsList.map((r, i)=>({
                            id: r.id || `reg_${i}`,
                            regulationName: r.regulation || r.name || '未知法规',
                            article: r.article || '',
                            articleText: r.text || r.article_text || '',
                            matchedFeature: r.matched_feature || '',
                            score: r.confidence || r.score || 0.7,
                            violation: r.violation || ''
                        }));
                    setRegulations(newRegs);
                    // Import results
                    const importStage = stages.import || {};
                    if (importStage.records_processed > 0 || importStage.stats) {
                        var _importStage_stats, _importStage_stats1;
                        const stats = {
                            nodes: {
                                subjects: newSubjects.length,
                                events: newEvents.length,
                                features: newFeatures.length,
                                regulations: newRegs.length
                            },
                            edges: ((_importStage_stats = importStage.stats) === null || _importStage_stats === void 0 ? void 0 : _importStage_stats.edges) || {},
                            durationSeconds: 0,
                            conflicts: ((_importStage_stats1 = importStage.stats) === null || _importStage_stats1 === void 0 ? void 0 : _importStage_stats1.conflicts) || 0
                        };
                        setImportResult(stats);
                    }
                    const totalEntities = newSubjects.length + newEvents.length + newFeatures.length + newRegs.length;
                    if (totalEntities > 0) addLog('kg_import', `数据加载完成: ${newSubjects.length} 主体, ${newEvents.length} 事件, ${newFeatures.length} 特征, ${newRegs.length} 法规`, 'success');
                };
                const handleStartBuild = ()=>{
                    if (uploadedFiles.length === 0 && selectedCrawlers.length === 0) {
                        msg.warning('请先上传PDF文件或选择爬虫数据源');
                        return;
                    }
                    handleRunPipeline();
                };
                const handleRunPipeline = async ()=>{
                    if (selectedCrawlers.length === 0) {
                        msg.warning('请先选择数据源');
                        return;
                    }
                    const source = selectedCrawlers[0];
                    setPipelineRunning(true);
                    setBuildStatus('running');
                    setRunning(true);
                    setStageLogs([]);
                    setOverallProgress(0);
                    setActiveStage('data_import');
                    setSubjects([]);
                    setEvents([]);
                    setFeatures([]);
                    setRegulations([]);
                    setImportPreview(null);
                    setImportResult(null);
                    addLog('data_import', `正在为 ${source} 启动 ETL 流水线...`, 'info');
                    const startTime = Date.now();
                    let lastStage = '';
                    try {
                        const res = await fetch(`/api/v1/pipeline/run?source=${encodeURIComponent(source)}`, {
                            method: 'POST'
                        });
                        const data = await res.json();
                        addLog('data_import', `流水线已触发: ${data.message}`, 'success');
                        setOverallProgress(10);
                        // Stage name mapping for UI display
                        const STAGE_PROGRESS = {
                            crawl: {
                                label: '数据采集',
                                pct: 15
                            },
                            parse: {
                                label: '文档解析',
                                pct: 25
                            },
                            extract: {
                                label: '实体抽取',
                                pct: 40
                            },
                            link: {
                                label: '实体链接',
                                pct: 55
                            },
                            resolve: {
                                label: '实体消歧',
                                pct: 65
                            },
                            import: {
                                label: '图谱导入',
                                pct: 80
                            },
                            index: {
                                label: '索引构建',
                                pct: 93
                            }
                        };
                        // Poll for pipeline status
                        const pollInterval = setInterval(async ()=>{
                            try {
                                const statusRes = await fetch('/api/v1/pipeline/status');
                                const statusData = await statusRes.json();
                                if (statusData.status === 'idle') {
                                    clearInterval(pollInterval);
                                    setPipelineRunning(false);
                                    setRunning(false);
                                    setBuildStatus('completed');
                                    setOverallProgress(100);
                                    setActiveStage('kg_import');
                                    addLog('kg_import', 'ETL 流水线执行完成', 'success');
                                    // Fetch real entity data from the pipeline
                                    try {
                                        const entitiesRes = await fetch(`/api/v1/pipeline/entities/${encodeURIComponent(source)}`);
                                        const entitiesData = await entitiesRes.json();
                                        if (entitiesData.success) {
                                            const stages = entitiesData.data.stages || {};
                                            populateStageResults(stages);
                                        }
                                    } catch  {
                                        addLog('kg_import', '实体数据获取失败，仅显示统计信息', 'warning');
                                    }
                                    const duration = (Date.now() - startTime) / 1000;
                                    msg.success(`图谱构建完成! 耗时 ${duration.toFixed(1)}s`);
                                    // Save to history
                                    const record = {
                                        buildId: `build_${Date.now()}`,
                                        createdAt: new Date().toISOString(),
                                        dataSource: source,
                                        status: 'completed',
                                        entityCount: subjects.length || 0,
                                        edgeCount: 0,
                                        duration
                                    };
                                    setBuildHistory((prev)=>[
                                            record,
                                            ...prev
                                        ]);
                                    // Refresh scan results
                                    setScannedFiles({});
                                } else if (statusData.current_run) {
                                    const run = statusData.current_run;
                                    const stage = run.stage || '';
                                    if (stage && stage !== lastStage) {
                                        lastStage = stage;
                                        const info = STAGE_PROGRESS[stage];
                                        if (info) {
                                            setOverallProgress(info.pct);
                                            setActiveStage(stage);
                                            addLog(stage, `阶段: ${info.label}`, 'info');
                                        }
                                    }
                                    if (run.status === 'failed') {
                                        clearInterval(pollInterval);
                                        setPipelineRunning(false);
                                        setRunning(false);
                                        setBuildStatus('failed');
                                        addLog(stage || 'data_import', `流水线阶段失败: ${stage}`, 'error');
                                        msg.error('流水线执行失败');
                                    }
                                }
                            } catch  {
                            // Ignore polling errors
                            }
                        }, 1500);
                        // Safety timeout: stop polling after 10 minutes
                        setTimeout(()=>{
                            clearInterval(pollInterval);
                            if (pipelineRunning) {
                                setPipelineRunning(false);
                                setRunning(false);
                                addLog('kg_import', '流水线超时，请检查后端状态', 'warning');
                            }
                        }, 600000);
                    } catch (err) {
                        setPipelineRunning(false);
                        setRunning(false);
                        setBuildStatus('failed');
                        addLog('data_import', `流水线触发失败: ${err.message}`, 'error');
                        msg.error('构建失败: ' + err.message);
                    }
                };
                // ── Stage 2-5: Dify extraction API ──────────────────────────────
                const [extracting, setExtracting] = (0, _react.useState)({});
                const runExtraction = async (stage)=>{
                    const source = selectedCrawlers[0];
                    if (!source) {
                        msg.warning('请先在数据导入中选择数据源');
                        return;
                    }
                    setExtracting((prev)=>({
                            ...prev,
                            [stage]: true
                        }));
                    addLog(stage, `正在调用 Dify 工作流 API (${stage})...`, 'info');
                    try {
                        const res = await fetch(`/api/v1/pipeline/extract/${stage}?source=${encodeURIComponent(source)}`, {
                            method: 'POST'
                        });
                        const data = await res.json();
                        if (!data.success) throw new Error(data.message || '提取失败');
                        const nodes = data.nodes || [];
                        const edges = data.edges || [];
                        addLog(stage, `${stage} 完成: ${nodes.length} 节点, ${edges.length} 关系`, 'success');
                        // Map nodes/edges to stage-specific state
                        if (stage === 'subject_extraction') {
                            const newSubjects = nodes.map((n, i)=>{
                                var _n_properties, _n_properties1;
                                return {
                                    id: n.id || `subj_${i}`,
                                    name: n.label || ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || '',
                                    type: n.type || 'Unknown',
                                    confidence: ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.confidence) || 0.85,
                                    sourceDoc: source,
                                    properties: n.properties || {}
                                };
                            });
                            setSubjects(newSubjects);
                        } else if (stage === 'event_extraction') {
                            const newEvents = nodes.map((n, i)=>{
                                var _n_properties, _n_properties1, _n_properties2, _n_properties3, _n_properties4;
                                return {
                                    id: n.id || `evt_${i}`,
                                    title: n.label || ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.title) || '',
                                    eventType: n.type || 'Event',
                                    subjects: ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.subjects) || [],
                                    time: ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.time) || '',
                                    riskLevel: ((_n_properties3 = n.properties) === null || _n_properties3 === void 0 ? void 0 : _n_properties3.risk_level) || 'medium',
                                    description: ((_n_properties4 = n.properties) === null || _n_properties4 === void 0 ? void 0 : _n_properties4.description) || ''
                                };
                            });
                            setEvents(newEvents);
                        } else if (stage === 'feature_extraction') {
                            const newFeatures = nodes.map((n, i)=>{
                                var _n_properties, _n_properties1, _n_properties2, _n_properties3, _n_properties4, _n_properties5;
                                return {
                                    id: n.id || `feat_${i}`,
                                    name: n.label || ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || '',
                                    featureType: ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.feature_type) || '1',
                                    riskLevel: ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.risk_level) || 'medium',
                                    relatedSubjects: ((_n_properties3 = n.properties) === null || _n_properties3 === void 0 ? void 0 : _n_properties3.subjects) || [],
                                    evidence: ((_n_properties4 = n.properties) === null || _n_properties4 === void 0 ? void 0 : _n_properties4.evidence) || '',
                                    confidence: ((_n_properties5 = n.properties) === null || _n_properties5 === void 0 ? void 0 : _n_properties5.confidence) || 0.7
                                };
                            });
                            setFeatures(newFeatures);
                        } else if (stage === 'regulation_linking') {
                            const newRegs = nodes.map((n, i)=>{
                                var _n_properties, _n_properties1, _n_properties2, _n_properties3, _n_properties4, _n_properties5;
                                return {
                                    id: n.id || `reg_${i}`,
                                    regulationName: n.label || ((_n_properties = n.properties) === null || _n_properties === void 0 ? void 0 : _n_properties.name) || '',
                                    article: ((_n_properties1 = n.properties) === null || _n_properties1 === void 0 ? void 0 : _n_properties1.article) || '',
                                    articleText: ((_n_properties2 = n.properties) === null || _n_properties2 === void 0 ? void 0 : _n_properties2.article_text) || '',
                                    matchedFeature: ((_n_properties3 = n.properties) === null || _n_properties3 === void 0 ? void 0 : _n_properties3.matched_feature) || '',
                                    score: ((_n_properties4 = n.properties) === null || _n_properties4 === void 0 ? void 0 : _n_properties4.score) || 0.7,
                                    violation: ((_n_properties5 = n.properties) === null || _n_properties5 === void 0 ? void 0 : _n_properties5.violation) || ''
                                };
                            });
                            setRegulations(newRegs);
                        }
                        // Build G6 preview from all accumulated data
                        const allNodes = [];
                        const allEdges = [];
                        for (const n of nodes)allNodes.push({
                            id: n.id,
                            label: n.label,
                            color: NODE_TYPE_COLORS[n.type] || '#888',
                            type: n.type,
                            properties: n.properties
                        });
                        for (const e of edges)allEdges.push({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            label: e.label,
                            sourceName: e.sourceName,
                            targetName: e.targetName
                        });
                        setImportPreview((prev)=>({
                                nodes: [
                                    ...(prev === null || prev === void 0 ? void 0 : prev.nodes) || [],
                                    ...allNodes
                                ],
                                edges: [
                                    ...(prev === null || prev === void 0 ? void 0 : prev.edges) || [],
                                    ...allEdges
                                ]
                            }));
                        if (data.cypher_statements > 0) addLog(stage, `生成 ${data.cypher_statements} 条 Cypher 语句`, 'info');
                    } catch (err) {
                        addLog(stage, `提取失败: ${err.message}`, 'error');
                        msg.error(`提取失败: ${err.message}`);
                    } finally{
                        setExtracting((prev)=>({
                                ...prev,
                                [stage]: false
                            }));
                    }
                };
                const handleReset = ()=>{
                    var _abortRef_controller;
                    (_abortRef_controller = abortRef.controller) === null || _abortRef_controller === void 0 || _abortRef_controller.abort();
                    setBuildStatus('idle');
                    setBuildId(null);
                    setActiveStage('data_import');
                    setOverallProgress(0);
                    setDataSources([]);
                    setSubjects([]);
                    setEvents([]);
                    setFeatures([]);
                    setRegulations([]);
                    setImportPreview(null);
                    setImportResult(null);
                    setStageLogs([]);
                    setRunning(false);
                    setPipelineRunning(false);
                    setUploadedFiles([]);
                    setSelectedCrawlers([]);
                    setScannedFiles({});
                    setImportTab('upload');
                    _crawlStore.useCrawlStore.getState().reset();
                    msg.info('已重置');
                };
                // ─── G6 preview for stage 6 ───────────────────────────────────────
                (0, _react.useEffect)(()=>{
                    if (activeStage !== 'kg_import' || !importPreview || !graphContainer.current) return;
                    let G6Module;
                    __mako_require__.ensure2("node_modules/@antv/g6/es/index.js").then(__mako_require__.dr(interop, __mako_require__.bind(__mako_require__, "node_modules/@antv/g6/es/index.js"))).then((mod)=>{
                        G6Module = mod.default || mod;
                        if (graphRef.current) {
                            graphRef.current.destroy();
                            graphRef.current = null;
                        }
                        const width = graphContainer.current.clientWidth || 700;
                        const height = 450;
                        const g6Nodes = importPreview.nodes.map((n)=>{
                            var _n_label;
                            return {
                                id: n.id,
                                label: ((_n_label = n.label) === null || _n_label === void 0 ? void 0 : _n_label.length) > 20 ? n.label.slice(0, 20) + '...' : n.label,
                                style: {
                                    fill: n.color || '#888',
                                    stroke: n.color || '#888'
                                },
                                labelCfg: {
                                    style: {
                                        fill: '#333',
                                        fontSize: 10
                                    }
                                }
                            };
                        });
                        const g6Edges = importPreview.edges.map((e)=>{
                            const key = `${e.sourceLayer ?? 0}-${e.targetLayer ?? 0}`;
                            const styleConfig = _graphConfig.EDGE_STYLE_MAP[key] || _graphConfig.EDGE_STYLE_MAP.default;
                            return {
                                id: e.id,
                                source: e.source,
                                target: e.target,
                                label: e.label,
                                style: {
                                    stroke: styleConfig.stroke,
                                    lineWidth: styleConfig.lineWidth,
                                    endArrow: {
                                        path: G6Module.Arrow.triangle(6, 8, 0),
                                        fill: styleConfig.stroke
                                    }
                                }
                            };
                        });
                        const graph = new G6Module.Graph({
                            container: graphContainer.current,
                            width,
                            height,
                            fitView: true,
                            fitViewPadding: 30,
                            layout: {
                                type: 'force',
                                preventOverlap: true,
                                nodeStrength: -300,
                                edgeStrength: 0.2,
                                linkDistance: 120
                            },
                            defaultNode: {
                                size: 35,
                                type: 'circle'
                            },
                            defaultEdge: {
                                style: {
                                    lineWidth: 1.5
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
                        graph.data({
                            nodes: g6Nodes,
                            edges: g6Edges
                        });
                        graph.render();
                        graphRef.current = graph;
                    });
                    return ()=>{
                        if (graphRef.current) {
                            graphRef.current.destroy();
                            graphRef.current = null;
                        }
                    };
                }, [
                    activeStage,
                    importPreview
                ]);
                // ─── Render: stage stepper ────────────────────────────────────────
                const renderStepper = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                        size: "small",
                        style: {
                            marginBottom: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Steps, {
                                size: "small",
                                current: stageIndex,
                                status: buildStatus === 'failed' ? 'error' : 'process',
                                items: STAGES.map((s)=>({
                                        title: s.title,
                                        description: s.description,
                                        icon: completedStages.includes(s.key) ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CheckCircleOutlined, {
                                            style: {
                                                color: '#52c41a'
                                            }
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 724,
                                            columnNumber: 51
                                        }, void 0) : s.icon
                                    }))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 717,
                                columnNumber: 7
                            }, this),
                            buildStatus !== 'idle' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginTop: 12
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                    percent: overallProgress,
                                    status: buildStatus === 'failed' ? 'exception' : buildStatus === 'paused' ? 'normal' : 'active',
                                    size: "small"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 729,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 728,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 716,
                        columnNumber: 5
                    }, this);
                // ─── Render: left panel ───────────────────────────────────────────
                const renderLeftPanel = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        style: {
                            height: '100%',
                            overflow: 'auto'
                        },
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                title: "数据导入",
                                style: {
                                    marginBottom: 12
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tabs, {
                                    activeKey: importTab,
                                    onChange: (key)=>{
                                        setImportTab(key);
                                    },
                                    size: "small",
                                    items: [
                                        {
                                            key: 'upload',
                                            label: '文件上传',
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginBottom: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    marginBottom: 6,
                                                                    fontWeight: 500,
                                                                    fontSize: 13
                                                                },
                                                                children: "PDF 文档上传"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 751,
                                                                columnNumber: 21
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(Dragger, {
                                                                multiple: true,
                                                                accept: ".pdf,.docx,.txt",
                                                                fileList: uploadedFiles,
                                                                onChange: ({ fileList })=>setUploadedFiles(fileList),
                                                                beforeUpload: ()=>false,
                                                                disabled: running || pipelineRunning,
                                                                style: {
                                                                    borderRadius: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                                                        className: "ant-upload-drag-icon",
                                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.InboxOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                            lineNumber: 761,
                                                                            columnNumber: 59
                                                                        }, void 0)
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 761,
                                                                        columnNumber: 23
                                                                    }, void 0),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                                                        className: "ant-upload-text",
                                                                        children: "点击或拖拽文件到此区域上传"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 762,
                                                                        columnNumber: 23
                                                                    }, void 0),
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("p", {
                                                                        className: "ant-upload-hint",
                                                                        children: "支持 PDF、DOCX、TXT 格式"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 763,
                                                                        columnNumber: 23
                                                                    }, void 0)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 752,
                                                                columnNumber: 21
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 750,
                                                        columnNumber: 19
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginBottom: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    marginBottom: 6,
                                                                    fontWeight: 500,
                                                                    fontSize: 13
                                                                },
                                                                children: [
                                                                    "已爬取数据源",
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                        color: "blue",
                                                                        style: {
                                                                            marginLeft: 6,
                                                                            fontSize: 11
                                                                        },
                                                                        children: "选择后扫描文件并运行 ETL"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 770,
                                                                        columnNumber: 23
                                                                    }, void 0)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 21
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                                                mode: "multiple",
                                                                placeholder: "选择数据源...",
                                                                value: selectedCrawlers,
                                                                onChange: (vals)=>{
                                                                    setSelectedCrawlers(vals);
                                                                    setScannedFiles({});
                                                                },
                                                                disabled: running || pipelineRunning,
                                                                style: {
                                                                    width: '100%'
                                                                },
                                                                options: CRAWLER_SOURCES.map((s)=>({
                                                                        value: s.value,
                                                                        label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                                            title: s.description,
                                                                            children: s.label
                                                                        }, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                            lineNumber: 782,
                                                                            columnNumber: 27
                                                                        }, void 0)
                                                                    }))
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 772,
                                                                columnNumber: 21
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    marginTop: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                            lineNumber: 790,
                                                                            columnNumber: 31
                                                                        }, void 0),
                                                                        size: "small",
                                                                        loading: scanLoading,
                                                                        onClick: handleScanFiles,
                                                                        disabled: running || pipelineRunning || selectedCrawlers.length === 0,
                                                                        children: "扫描已爬取文件"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 789,
                                                                        columnNumber: 23
                                                                    }, void 0),
                                                                    Object.keys(scannedFiles).length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                        style: {
                                                                            marginTop: 8
                                                                        },
                                                                        children: [
                                                                            Object.entries(scannedFiles).map(([source, files])=>{
                                                                                var _CRAWLER_SOURCES_find;
                                                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                    style: {
                                                                                        marginBottom: 4
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                            style: {
                                                                                                fontSize: 12,
                                                                                                fontWeight: 500,
                                                                                                color: '#64748b',
                                                                                                marginBottom: 4
                                                                                            },
                                                                                            children: [
                                                                                                ((_CRAWLER_SOURCES_find = CRAWLER_SOURCES.find((s)=>s.value === source)) === null || _CRAWLER_SOURCES_find === void 0 ? void 0 : _CRAWLER_SOURCES_find.label) || source,
                                                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                                                    color: "blue",
                                                                                                    style: {
                                                                                                        marginLeft: 6
                                                                                                    },
                                                                                                    children: [
                                                                                                        files.length,
                                                                                                        " 个文件"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                                    lineNumber: 804,
                                                                                                    columnNumber: 33
                                                                                                }, void 0)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                            lineNumber: 802,
                                                                                            columnNumber: 31
                                                                                        }, void 0),
                                                                                        files.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                            style: {
                                                                                                maxHeight: 100,
                                                                                                overflow: 'auto',
                                                                                                background: '#f8fafc',
                                                                                                borderRadius: 4,
                                                                                                padding: '4px 8px'
                                                                                            },
                                                                                            children: files.map((f, i)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                                                    style: {
                                                                                                        fontSize: 11,
                                                                                                        color: '#94a3b8',
                                                                                                        fontFamily: 'monospace',
                                                                                                        display: 'flex',
                                                                                                        justifyContent: 'space-between'
                                                                                                    },
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                                            style: {
                                                                                                                overflow: 'hidden',
                                                                                                                textOverflow: 'ellipsis',
                                                                                                                whiteSpace: 'nowrap',
                                                                                                                maxWidth: '70%'
                                                                                                            },
                                                                                                            children: f.name
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                                            lineNumber: 810,
                                                                                                            columnNumber: 39
                                                                                                        }, void 0),
                                                                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                                                            children: f.size_display
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                                            lineNumber: 811,
                                                                                                            columnNumber: 39
                                                                                                        }, void 0)
                                                                                                    ]
                                                                                                }, i, true, {
                                                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                                    lineNumber: 809,
                                                                                                    columnNumber: 37
                                                                                                }, void 0))
                                                                                        }, void 0, false, {
                                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                            lineNumber: 807,
                                                                                            columnNumber: 33
                                                                                        }, void 0)
                                                                                    ]
                                                                                }, source, true, {
                                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                    lineNumber: 801,
                                                                                    columnNumber: 29
                                                                                }, void 0);
                                                                            }),
                                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                                danger: true,
                                                                                size: "small",
                                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ClearOutlined, {}, void 0, false, {
                                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                    lineNumber: 821,
                                                                                    columnNumber: 35
                                                                                }, void 0),
                                                                                onClick: async ()=>{
                                                                                    for (const source of Object.keys(scannedFiles))await fetch(`/api/v1/pipeline/files/${source}`, {
                                                                                        method: 'DELETE'
                                                                                    });
                                                                                    setScannedFiles({});
                                                                                    msg.success('已清空所有文件');
                                                                                },
                                                                                style: {
                                                                                    marginTop: 4
                                                                                },
                                                                                children: "清空所有文件"
                                                                            }, void 0, false, {
                                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                                lineNumber: 818,
                                                                                columnNumber: 27
                                                                            }, void 0)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 799,
                                                                        columnNumber: 25
                                                                    }, void 0)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 788,
                                                                columnNumber: 21
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 767,
                                                        columnNumber: 19
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                        style: {
                                                            width: '100%',
                                                            justifyContent: 'flex-end'
                                                        },
                                                        children: [
                                                            buildStatus === 'idle' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                                                children: [
                                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        type: "primary",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PlayCircleOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                            lineNumber: 843,
                                                                            columnNumber: 33
                                                                        }, void 0),
                                                                        onClick: handleStartBuild,
                                                                        disabled: uploadedFiles.length === 0 && selectedCrawlers.length === 0,
                                                                        children: "开始构建"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 841,
                                                                        columnNumber: 25
                                                                    }, void 0),
                                                                    selectedCrawlers.length > 0 && Object.values(scannedFiles).some((f)=>f.length > 0) && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                        type: "primary",
                                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                            lineNumber: 852,
                                                                            columnNumber: 35
                                                                        }, void 0),
                                                                        onClick: handleRunPipeline,
                                                                        loading: pipelineRunning,
                                                                        style: {
                                                                            background: '#52c41a',
                                                                            borderColor: '#52c41a'
                                                                        },
                                                                        children: "运行 ETL 流水线"
                                                                    }, void 0, false, {
                                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                        lineNumber: 850,
                                                                        columnNumber: 27
                                                                    }, void 0)
                                                                ]
                                                            }, void 0, true),
                                                            (buildStatus === 'completed' || buildStatus === 'failed') && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ReloadOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 863,
                                                                    columnNumber: 37
                                                                }, void 0),
                                                                onClick: handleReset,
                                                                children: "重新构建"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 863,
                                                                columnNumber: 23
                                                            }, void 0),
                                                            (buildStatus === 'running' || pipelineRunning) && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                danger: true,
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseCircleOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 866,
                                                                    columnNumber: 44
                                                                }, void 0),
                                                                onClick: handleReset,
                                                                children: "取消"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 866,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 838,
                                                        columnNumber: 19
                                                    }, void 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 749,
                                                columnNumber: 17
                                            }, void 0)
                                        },
                                        {
                                            key: 'crawl',
                                            label: '智能采集',
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginBottom: 12
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Radio.Group, {
                                                            value: crawlMode,
                                                            onChange: (e)=>crawlSetMode(e.target.value),
                                                            size: "small",
                                                            optionType: "button",
                                                            buttonStyle: "solid",
                                                            children: [
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Radio.Button, {
                                                                    value: "quick",
                                                                    children: "快速采集"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 885,
                                                                    columnNumber: 23
                                                                }, void 0),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Radio.Button, {
                                                                    value: "complex",
                                                                    children: "智能采集"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 886,
                                                                    columnNumber: 23
                                                                }, void 0),
                                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Radio.Button, {
                                                                    value: "template",
                                                                    children: "模板采集"
                                                                }, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 887,
                                                                    columnNumber: 23
                                                                }, void 0)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 878,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 877,
                                                        columnNumber: 19
                                                    }, void 0),
                                                    crawlMode === 'quick' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_QuickInputPanel.default, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 891,
                                                        columnNumber: 45
                                                    }, void 0),
                                                    crawlMode === 'complex' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_ComplexInputPanel.default, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 892,
                                                        columnNumber: 47
                                                    }, void 0),
                                                    crawlMode === 'template' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            textAlign: 'center',
                                                            padding: '12px 0'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_TemplatePanel.default, {}, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 895,
                                                                columnNumber: 23
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    marginTop: 8,
                                                                    color: 'var(--ant-color-text-secondary)',
                                                                    fontSize: 12
                                                                },
                                                                children: "点击模板即可自动填充采集参数"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 896,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 894,
                                                        columnNumber: 21
                                                    }, void 0),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 16,
                                                            textAlign: 'right'
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                            children: crawlRunning ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                danger: true,
                                                                size: "small",
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseCircleOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 905,
                                                                    columnNumber: 59
                                                                }, void 0),
                                                                onClick: cancelCrawl,
                                                                children: "取消采集"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 905,
                                                                columnNumber: 25
                                                            }, void 0) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                type: "primary",
                                                                size: "small",
                                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloudDownloadOutlined, {}, void 0, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 912,
                                                                    columnNumber: 33
                                                                }, void 0),
                                                                onClick: handleStartCrawl,
                                                                children: "开始采集"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 909,
                                                                columnNumber: 25
                                                            }, void 0)
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 903,
                                                            columnNumber: 21
                                                        }, void 0)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 902,
                                                        columnNumber: 19
                                                    }, void 0),
                                                    crawlRunning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 8
                                                        },
                                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: "processing",
                                                            children: "采集进行中..."
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 923,
                                                            columnNumber: 23
                                                        }, void 0)
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 922,
                                                        columnNumber: 21
                                                    }, void 0),
                                                    crawlResult && !crawlRunning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            marginTop: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                                color: "success",
                                                                children: "采集完成"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 928,
                                                                columnNumber: 23
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                                style: {
                                                                    marginTop: 4,
                                                                    fontSize: 12,
                                                                    color: '#64748b'
                                                                },
                                                                children: [
                                                                    crawlResult.total_files_downloaded,
                                                                    " 文件 · ",
                                                                    crawlResult.total_records,
                                                                    " 记录 · 质量 ",
                                                                    Math.round(crawlResult.quality_score * 100),
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 929,
                                                                columnNumber: 23
                                                            }, void 0),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                                size: "small",
                                                                type: "link",
                                                                onClick: ()=>{
                                                                    handleScanFiles();
                                                                    setImportTab('upload');
                                                                },
                                                                style: {
                                                                    marginTop: 4
                                                                },
                                                                children: "切换到文件上传，扫描并运行 ETL 流水线 →"
                                                            }, void 0, false, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 932,
                                                                columnNumber: 23
                                                            }, void 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 927,
                                                        columnNumber: 21
                                                    }, void 0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 876,
                                                columnNumber: 17
                                            }, void 0)
                                        }
                                    ]
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 740,
                                    columnNumber: 9
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 739,
                                columnNumber: 7
                            }, this),
                            buildStatus !== 'idle' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                title: "流水线状态",
                                style: {
                                    marginBottom: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                        gutter: [
                                            12,
                                            8
                                        ],
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                    title: "主体实体",
                                                    value: subjects.length,
                                                    valueStyle: {
                                                        fontSize: 18
                                                    },
                                                    suffix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#FFC101",
                                                        children: "个"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 957,
                                                        columnNumber: 101
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 957,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 956,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                    title: "事件",
                                                    value: events.length,
                                                    valueStyle: {
                                                        fontSize: 18
                                                    },
                                                    suffix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#FF6B6B",
                                                        children: "个"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 960,
                                                        columnNumber: 97
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 960,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 959,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                    title: "风险特征",
                                                    value: features.length,
                                                    valueStyle: {
                                                        fontSize: 18
                                                    },
                                                    suffix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#4CAF50",
                                                        children: "个"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 963,
                                                        columnNumber: 101
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 963,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 962,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                    title: "法规匹配",
                                                    value: regulations.length,
                                                    valueStyle: {
                                                        fontSize: 18
                                                    },
                                                    suffix: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#45B7D1",
                                                        children: "条"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 966,
                                                        columnNumber: 104
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 966,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 965,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 955,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            marginTop: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                    marginBottom: 6
                                                },
                                                children: "执行日志"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 970,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    maxHeight: 160,
                                                    overflow: 'auto'
                                                },
                                                children: stageLogs.slice(-8).reverse().map((log, i)=>{
                                                    var _STAGES_find;
                                                    return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                        style: {
                                                            fontSize: 12,
                                                            color: '#94a3b8',
                                                            marginBottom: 2,
                                                            fontFamily: 'monospace'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                                style: {
                                                                    color: log.level === 'error' ? '#f5222d' : log.level === 'success' ? '#52c41a' : log.level === 'warning' ? '#faad14' : '#666'
                                                                },
                                                                children: [
                                                                    "[",
                                                                    log.time,
                                                                    "] ",
                                                                    (_STAGES_find = STAGES.find((s)=>s.key === log.stage)) === null || _STAGES_find === void 0 ? void 0 : _STAGES_find.title,
                                                                    ":"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 974,
                                                                columnNumber: 19
                                                            }, this),
                                                            ' ',
                                                            log.message
                                                        ]
                                                    }, i, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 973,
                                                        columnNumber: 17
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 971,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 969,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 954,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                title: "历史构建记录",
                                style: {
                                    marginBottom: 12
                                },
                                children: buildHistory.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                    description: "暂无历史记录",
                                    image: _antd.Empty.PRESENTED_IMAGE_SIMPLE
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 988,
                                    columnNumber: 11
                                }, this) : buildHistory.slice(0, 5).map((rec)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            padding: '8px 0',
                                            borderBottom: '1px solid #f0f0f0',
                                            cursor: 'pointer'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                        style: {
                                                            fontSize: 13,
                                                            fontWeight: 500
                                                        },
                                                        children: rec.buildId
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 993,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: rec.status === 'completed' ? 'success' : 'error',
                                                        children: rec.status === 'completed' ? '完成' : '失败'
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 994,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 992,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#94a3b8',
                                                    marginTop: 2
                                                },
                                                children: [
                                                    new Date(rec.createdAt).toLocaleString(),
                                                    " | ",
                                                    rec.dataSource,
                                                    " | ",
                                                    rec.entityCount,
                                                    "节点 ",
                                                    rec.edgeCount,
                                                    "关系 | 耗时",
                                                    rec.duration,
                                                    "s"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 998,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, rec.buildId, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 991,
                                        columnNumber: 13
                                    }, this))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 986,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 737,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 1 - Data Import ─────────────────────────────────
                const renderDataImport = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: importTab === 'crawl' && (crawlRunning || crawlResult) ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                            children: [
                                crawlRunning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    title: "采集进度",
                                    size: "small",
                                    style: {
                                        marginBottom: 16
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_CrawlProgress.default, {}, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1016,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1015,
                                    columnNumber: 13
                                }, this),
                                crawlResult && !crawlRunning && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    title: "采集结果",
                                    size: "small",
                                    style: {
                                        marginBottom: 16
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_CrawlResult.default, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1021,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                marginTop: 16,
                                                textAlign: 'center'
                                            },
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        type: "primary",
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.SearchOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1026,
                                                            columnNumber: 27
                                                        }, void 0),
                                                        onClick: ()=>{
                                                            handleScanFiles();
                                                            setImportTab('upload');
                                                        },
                                                        children: "扫描已爬取文件"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1024,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloudUploadOutlined, {}, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1035,
                                                            columnNumber: 27
                                                        }, void 0),
                                                        onClick: ()=>setImportTab('upload'),
                                                        children: "切换到文件上传"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1034,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1023,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1022,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1020,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        marginBottom: 16,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                            style: {
                                                fontSize: 16,
                                                fontWeight: 600
                                            },
                                            children: importTab === 'crawl' ? '智能采集' : '数据导入结果'
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1048,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: "blue",
                                                    children: [
                                                        "文档数: ",
                                                        dataSources.length
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1052,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: "green",
                                                    children: [
                                                        "总页数: ",
                                                        dataSources.reduce((a, b)=>a + (b.pages || 0), 0)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1053,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: "purple",
                                                    children: [
                                                        "总字符: ",
                                                        dataSources.reduce((a, b)=>a + (b.recordCount || 0), 0).toLocaleString()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1054,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1051,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1047,
                                    columnNumber: 11
                                }, this),
                                dataSources.length === 0 ? pipelineRunning ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        background: '#f6ffed',
                                        border: '1px solid #b7eb8f'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LoadingOutlined, {
                                                style: {
                                                    fontSize: 32,
                                                    color: '#52c41a',
                                                    marginBottom: 12
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1062,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                },
                                                children: "ETL 流水线执行中"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1063,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#64748b',
                                                    marginTop: 4
                                                },
                                                children: "后端正在执行 parse → extract → link → resolve → import → index 各阶段"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1064,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                style: {
                                                    fontSize: 12,
                                                    color: '#94a3b8',
                                                    marginTop: 2
                                                },
                                                children: "处理完成后文件将自动清理"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1067,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1061,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1060,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                    description: importTab === 'crawl' ? '请先在左侧"智能采集"标签页中配置采集参数，然后点击"开始采集"' : '尚未导入数据。请先在左侧上传PDF文件或选择爬虫数据源，然后点击【开始构建】或扫描文件后点击【运行 ETL 流水线】。',
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: importTab === 'crawl' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloudDownloadOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1076,
                                                columnNumber: 50
                                            }, void 0),
                                            onClick: ()=>setImportTab('crawl'),
                                            children: "去智能采集"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1076,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PlayCircleOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1080,
                                                columnNumber: 50
                                            }, void 0),
                                            onClick: handleStartBuild,
                                            children: "开始构建"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1080,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1074,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1073,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                    dataSource: dataSources,
                                    rowKey: "id",
                                    size: "small",
                                    pagination: false,
                                    columns: [
                                        {
                                            title: '文件名',
                                            dataIndex: 'name',
                                            key: 'name',
                                            render: (t, r)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.FilePdfOutlined, {
                                                            style: {
                                                                color: '#f5222d'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1092,
                                                            columnNumber: 110
                                                        }, void 0),
                                                        t
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1092,
                                                    columnNumber: 103
                                                }, void 0)
                                        },
                                        {
                                            title: '类型',
                                            dataIndex: 'type',
                                            key: 'type',
                                            width: 80,
                                            render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    children: t === 'pdf' ? 'PDF' : t === 'crawl' ? '爬虫' : '已有'
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1093,
                                                    columnNumber: 98
                                                }, void 0)
                                        },
                                        {
                                            title: '大小',
                                            dataIndex: 'size',
                                            key: 'size',
                                            width: 100,
                                            render: (s)=>s ? `${(s / 1024 / 1024).toFixed(1)} MB` : '-'
                                        },
                                        {
                                            title: '页数',
                                            dataIndex: 'pages',
                                            key: 'pages',
                                            width: 80,
                                            render: (p)=>p ? `${p} 页` : '-'
                                        },
                                        {
                                            title: '解析字符',
                                            dataIndex: 'recordCount',
                                            key: 'recordCount',
                                            width: 100,
                                            render: (c)=>c ? c.toLocaleString() : '-'
                                        },
                                        {
                                            title: '状态',
                                            dataIndex: 'status',
                                            key: 'status',
                                            width: 100,
                                            render: (s)=>{
                                                var _map_s, _map_s1;
                                                const map = {
                                                    pending: {
                                                        color: 'default',
                                                        text: '待解析'
                                                    },
                                                    parsing: {
                                                        color: 'processing',
                                                        text: '解析中'
                                                    },
                                                    done: {
                                                        color: 'success',
                                                        text: '已完成'
                                                    },
                                                    error: {
                                                        color: 'error',
                                                        text: '失败'
                                                    }
                                                };
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: (_map_s = map[s]) === null || _map_s === void 0 ? void 0 : _map_s.color,
                                                    children: ((_map_s1 = map[s]) === null || _map_s1 === void 0 ? void 0 : _map_s1.text) || s
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1099,
                                                    columnNumber: 26
                                                }, void 0);
                                            }
                                        }
                                    ]
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1086,
                                    columnNumber: 13
                                }, this),
                                dataSources.length > 0 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Collapse, {
                                    style: {
                                        marginTop: 12
                                    },
                                    size: "small",
                                    items: [
                                        {
                                            key: 'preview',
                                            label: '文本分段预览',
                                            children: dataSources.map((ds)=>{
                                                var _ds_recordCount;
                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        marginBottom: 12
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontWeight: 500,
                                                                marginBottom: 4
                                                            },
                                                            children: ds.name
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1109,
                                                            columnNumber: 19
                                                        }, void 0),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                background: '#f8fafc',
                                                                padding: 10,
                                                                borderRadius: 6,
                                                                fontSize: 12,
                                                                color: '#64748b',
                                                                maxHeight: 120,
                                                                overflow: 'auto',
                                                                whiteSpace: 'pre-wrap',
                                                                fontFamily: 'monospace'
                                                            },
                                                            children: [
                                                                "【演示数据】该文档为上市公司",
                                                                ds.name.includes('年报') ? '年度报告' : ds.name.includes('公告') ? '临时公告' : '基金季报',
                                                                "，包含公司基本信息、财务数据、重大事项披露等内容。系统已通过OCR/PDF解析提取全文文本，共识别 ",
                                                                (_ds_recordCount = ds.recordCount) === null || _ds_recordCount === void 0 ? void 0 : _ds_recordCount.toLocaleString(),
                                                                " 个字符，涵盖主体信息、事件描述、风险指标等关键字段..."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1110,
                                                            columnNumber: 19
                                                        }, void 0)
                                                    ]
                                                }, ds.id, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1108,
                                                    columnNumber: 17
                                                }, void 0);
                                            })
                                        }
                                    ]
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1106,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1010,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 2 - Subject Extraction ─────────────────────────
                const subjectColumns = [
                    {
                        title: '实体名称',
                        dataIndex: 'name',
                        key: 'name',
                        width: 180,
                        ellipsis: true,
                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("strong", {
                                children: t
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1124,
                                columnNumber: 105
                            }, this)
                    },
                    {
                        title: '类型',
                        dataIndex: 'type',
                        key: 'type',
                        width: 100,
                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                color: NODE_TYPE_COLORS[t] || '#888',
                                children: t
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1125,
                                columnNumber: 87
                            }, this)
                    },
                    {
                        title: '置信度',
                        dataIndex: 'confidence',
                        key: 'confidence',
                        width: 120,
                        render: (v)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                percent: Math.round(v * 100),
                                size: "small",
                                strokeColor: v > 0.9 ? '#52c41a' : v > 0.8 ? '#faad14' : '#f5222d'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1126,
                                columnNumber: 100
                            }, this)
                    },
                    {
                        title: '来源文档',
                        dataIndex: 'sourceDoc',
                        key: 'sourceDoc',
                        width: 130,
                        ellipsis: true
                    },
                    {
                        title: '关键属性',
                        key: 'props',
                        width: 200,
                        ellipsis: true,
                        render: (_, r)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                size: 4,
                                wrap: true,
                                children: [
                                    Object.entries(r.properties).slice(0, 2).map(([k, v])=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                            style: {
                                                fontSize: 11
                                            },
                                            children: [
                                                k,
                                                ": ",
                                                String(v).slice(0, 15)
                                            ]
                                        }, k, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1130,
                                            columnNumber: 67
                                        }, this)),
                                    Object.keys(r.properties).length > 2 && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                        children: "..."
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1131,
                                        columnNumber: 50
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1129,
                                columnNumber: 7
                            }, this)
                    },
                    {
                        title: '操作',
                        key: 'actions',
                        width: 80,
                        render: (_, r)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                type: "link",
                                size: "small",
                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EditOutlined, {}, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1137,
                                    columnNumber: 48
                                }, void 0),
                                onClick: ()=>setEditingSubject(r),
                                disabled: running,
                                children: "修正"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1137,
                                columnNumber: 9
                            }, this)
                    }
                ];
                const renderSubjectExtraction = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginBottom: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 16,
                                            fontWeight: 600
                                        },
                                        children: "主体实体提取结果"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1145,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                type: "primary",
                                                size: "small",
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1150,
                                                    columnNumber: 19
                                                }, void 0),
                                                loading: extracting['subject_extraction'],
                                                onClick: ()=>runExtraction('subject_extraction'),
                                                disabled: selectedCrawlers.length === 0 || pipelineRunning,
                                                children: "Dify 提取"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1147,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                size: "small",
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExportOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1157,
                                                    columnNumber: 38
                                                }, void 0),
                                                disabled: subjects.length === 0,
                                                children: "导出CSV"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1157,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1146,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1144,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                gutter: 12,
                                style: {
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "实体总数",
                                                value: subjects.length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#1890ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1162,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1162,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1162,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "COMPANY",
                                                value: subjects.filter((s)=>s.type === 'COMPANY').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#FFC101'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1163,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1163,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1163,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "PERSON",
                                                value: subjects.filter((s)=>s.type === 'PERSON').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#1890FF'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1164,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1164,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1164,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "PFCOMPANY/PFUND",
                                                value: subjects.filter((s)=>s.type === 'PFCOMPANY' || s.type === 'PFUND').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#722ED1'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1165,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1165,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1165,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1161,
                                columnNumber: 7
                            }, this),
                            subjects.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: buildStatus === 'idle' ? '请先启动构建流水线' : '提取中...'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1169,
                                columnNumber: 9
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                dataSource: subjects,
                                columns: subjectColumns,
                                rowKey: "id",
                                size: "small",
                                expandable: {
                                    expandedRowRender: (r)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("pre", {
                                            style: {
                                                fontSize: 11,
                                                margin: 0,
                                                maxHeight: 200,
                                                overflow: 'auto'
                                            },
                                            children: JSON.stringify(r.properties, null, 2)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1172,
                                            columnNumber: 37
                                        }, void 0)
                                }
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1171,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Modal, {
                                title: "修正实体",
                                open: !!editingSubject,
                                onCancel: ()=>setEditingSubject(null),
                                onOk: ()=>{
                                    msg.success('已保存修正');
                                    setEditingSubject(null);
                                },
                                okText: "保存",
                                cancelText: "取消",
                                children: editingSubject && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form, {
                                    layout: "vertical",
                                    size: "small",
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                            label: "实体名称",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Input, {
                                                defaultValue: editingSubject.name
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1180,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1180,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                            label: "实体类型",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Select, {
                                                defaultValue: editingSubject.type,
                                                options: Object.entries(NODE_TYPE_COLORS).map(([k, v])=>({
                                                        value: k,
                                                        label: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                            color: v,
                                                            children: k
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1182,
                                                            columnNumber: 136
                                                        }, void 0)
                                                    }))
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1182,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1181,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Form.Item, {
                                            label: "置信度",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Slider, {
                                                defaultValue: editingSubject.confidence,
                                                min: 0,
                                                max: 1,
                                                step: 0.01
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1184,
                                                columnNumber: 36
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1184,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1179,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1177,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1143,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 3 - Event Extraction ───────────────────────────
                const renderEventExtraction = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginBottom: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 16,
                                            fontWeight: 600
                                        },
                                        children: "事件提取结果"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1195,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                type: "primary",
                                                size: "small",
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1200,
                                                    columnNumber: 19
                                                }, void 0),
                                                loading: extracting['event_extraction'],
                                                onClick: ()=>runExtraction('event_extraction'),
                                                disabled: selectedCrawlers.length === 0 || pipelineRunning,
                                                children: "Dify 提取"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1197,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(RadioGroup, {
                                                value: eventViewMode,
                                                onChange: (e)=>setEventViewMode(e.target.value),
                                                size: "small",
                                                optionType: "button",
                                                buttonStyle: "solid",
                                                children: [
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(RadioButton, {
                                                        value: "table",
                                                        children: "表格视图"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1208,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(RadioButton, {
                                                        value: "timeline",
                                                        children: "时间线视图"
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1209,
                                                        columnNumber: 13
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1207,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1196,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1194,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                gutter: 12,
                                style: {
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "事件总数",
                                                value: events.length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#FF6B6B'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1215,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1215,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1215,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "高风险事件",
                                                value: events.filter((e)=>e.riskLevel === 'high').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#f5222d'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1216,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1216,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1216,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "关联主体",
                                                value: new Set(events.flatMap((e)=>e.subjects)).size,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#1890ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1217,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1217,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1217,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1214,
                                columnNumber: 7
                            }, this),
                            events.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: buildStatus === 'idle' ? '请先启动构建流水线' : '提取中...'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1221,
                                columnNumber: 9
                            }, this) : eventViewMode === 'table' ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                dataSource: events,
                                rowKey: "id",
                                size: "small",
                                columns: [
                                    {
                                        title: '事件标题',
                                        dataIndex: 'title',
                                        key: 'title',
                                        width: 240,
                                        ellipsis: true
                                    },
                                    {
                                        title: '事件类型',
                                        dataIndex: 'eventType',
                                        key: 'eventType',
                                        width: 100,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: t === '违规风险' ? 'red' : t === '减持风险' ? 'orange' : 'blue',
                                                children: t
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1225,
                                                columnNumber: 105
                                            }, void 0)
                                    },
                                    {
                                        title: '涉及主体',
                                        dataIndex: 'subjects',
                                        key: 'subjects',
                                        width: 180,
                                        render: (s)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                                size: 4,
                                                wrap: true,
                                                children: s.map((n)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#FFC101",
                                                        children: n.length > 8 ? n.slice(0, 8) + '...' : n
                                                    }, n, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1226,
                                                        columnNumber: 140
                                                    }, void 0))
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1226,
                                                columnNumber: 105
                                            }, void 0)
                                    },
                                    {
                                        title: '时间',
                                        dataIndex: 'time',
                                        key: 'time',
                                        width: 110
                                    },
                                    {
                                        title: '风险等级',
                                        dataIndex: 'riskLevel',
                                        key: 'riskLevel',
                                        width: 90,
                                        render: (l)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Badge, {
                                                status: l === 'high' ? 'error' : 'warning',
                                                text: l === 'high' ? '高' : '中'
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1228,
                                                columnNumber: 104
                                            }, void 0)
                                    },
                                    {
                                        title: '操作',
                                        key: 'actions',
                                        width: 60,
                                        render: (_, r)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                type: "link",
                                                size: "small",
                                                onClick: ()=>setSelectedEvent(r),
                                                children: "详情"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1229,
                                                columnNumber: 92
                                            }, void 0)
                                    }
                                ]
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1223,
                                columnNumber: 9
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Timeline, {
                                items: [
                                    ...events
                                ].sort((a, b)=>b.time.localeCompare(a.time)).map((e)=>({
                                        color: e.riskLevel === 'high' ? 'red' : 'orange',
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    },
                                                    onClick: ()=>setSelectedEvent(e),
                                                    children: e.title
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1237,
                                                    columnNumber: 17
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: '#94a3b8'
                                                    },
                                                    children: [
                                                        e.time,
                                                        " | ",
                                                        e.eventType,
                                                        " | 涉及: ",
                                                        e.subjects.join(', ')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1238,
                                                    columnNumber: 17
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1236,
                                            columnNumber: 15
                                        }, void 0)
                                    }))
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1232,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Drawer, {
                                title: "事件详情",
                                open: !!selectedEvent,
                                onClose: ()=>setSelectedEvent(null),
                                width: 500,
                                children: selectedEvent && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                    column: 1,
                                    size: "small",
                                    bordered: true,
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "事件标题",
                                            children: selectedEvent.title
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1251,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "事件类型",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: selectedEvent.eventType === '违规风险' ? 'red' : selectedEvent.eventType === '减持风险' ? 'orange' : 'blue',
                                                children: selectedEvent.eventType
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1252,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1252,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "发生时间",
                                            children: selectedEvent.time
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1253,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "风险等级",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Badge, {
                                                status: selectedEvent.riskLevel === 'high' ? 'error' : 'warning',
                                                text: selectedEvent.riskLevel === 'high' ? '高风险' : '中风险'
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1254,
                                                columnNumber: 45
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1254,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "涉及主体",
                                            children: selectedEvent.subjects.map((s)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                    color: "#FFC101",
                                                    children: s
                                                }, s, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1255,
                                                    columnNumber: 80
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1255,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                            label: "事件描述",
                                            children: selectedEvent.description
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1256,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1250,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1248,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1193,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 4 - Feature Extraction ─────────────────────────
                const renderFeatureExtraction = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginBottom: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 16,
                                            fontWeight: 600
                                        },
                                        children: "风险特征提取结果"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1267,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            size: "small",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1272,
                                                columnNumber: 19
                                            }, void 0),
                                            loading: extracting['feature_extraction'],
                                            onClick: ()=>runExtraction('feature_extraction'),
                                            disabled: selectedCrawlers.length === 0 || pipelineRunning,
                                            children: "Dify 提取"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1269,
                                            columnNumber: 11
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1268,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1266,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                gutter: 12,
                                style: {
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "特征总数",
                                                value: features.length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#4CAF50'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1283,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1283,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1283,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "财务预警",
                                                value: features.filter((f)=>f.featureType === '1').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#faad14'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1284,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1284,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1284,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "法律诉讼",
                                                value: features.filter((f)=>f.featureType === '2').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#f5222d'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1285,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1285,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1285,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 6,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "股权变动",
                                                value: features.filter((f)=>f.featureType === '3').length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#1890ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1286,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1286,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1286,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1282,
                                columnNumber: 7
                            }, this),
                            features.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: buildStatus === 'idle' ? '请先启动构建流水线' : '提取中...'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1290,
                                columnNumber: 9
                            }, this) : features.map((f)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                    size: "small",
                                    style: {
                                        marginBottom: 12
                                    },
                                    title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ExclamationCircleOutlined, {
                                                style: {
                                                    color: f.riskLevel === 'high' ? '#f5222d' : '#faad14'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1295,
                                                columnNumber: 15
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                children: f.name
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1296,
                                                columnNumber: 15
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: f.featureType === '1' ? 'gold' : f.featureType === '2' ? 'red' : 'blue',
                                                children: _graphConfig.FACTOR_TYPE_MAP[f.featureType] || f.featureType
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1297,
                                                columnNumber: 15
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: f.riskLevel === 'high' ? 'error' : 'warning',
                                                children: f.riskLevel === 'high' ? '高风险' : '中风险'
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1298,
                                                columnNumber: 15
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1294,
                                        columnNumber: 13
                                    }, void 0),
                                    extra: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                children: [
                                                    f.relatedSubjects.length,
                                                    " 个关联主体"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1302,
                                                columnNumber: 15
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                children: [
                                                    "置信度 ",
                                                    Math.round(f.confidence * 100),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1303,
                                                columnNumber: 15
                                            }, void 0),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                size: "small",
                                                icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.EditOutlined, {}, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1304,
                                                    columnNumber: 42
                                                }, void 0),
                                                disabled: running,
                                                children: "调整"
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1304,
                                                columnNumber: 15
                                            }, void 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1301,
                                        columnNumber: 13
                                    }, void 0),
                                    children: [
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                marginBottom: 8
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontWeight: 500,
                                                        fontSize: 13
                                                    },
                                                    children: "关联主体: "
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1308,
                                                    columnNumber: 15
                                                }, this),
                                                f.relatedSubjects.map((s)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                        color: "#FFC101",
                                                        children: s
                                                    }, s, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1309,
                                                        columnNumber: 45
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1307,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontWeight: 500,
                                                        fontSize: 13
                                                    },
                                                    children: "证据片段: "
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1312,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        color: '#64748b',
                                                        fontSize: 13,
                                                        background: '#f8fafc',
                                                        padding: '6px 10px',
                                                        borderRadius: 4,
                                                        display: 'inline-block',
                                                        marginTop: 4
                                                    },
                                                    children: [
                                                        f.evidence.split('').map((c, i)=>{
                                                            const keywords = [
                                                                '流动性缺口',
                                                                '担保代偿',
                                                                '违约',
                                                                '离职',
                                                                '处罚',
                                                                '赎回'
                                                            ];
                                                            const highlighted = keywords.some((kw)=>f.evidence.slice(i, i + kw.length) === kw);
                                                            if (highlighted) {
                                                                const kw = keywords.find((kw)=>f.evidence.slice(i, i + kw.length) === kw);
                                                                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("mark", {
                                                                    style: {
                                                                        background: '#FFF2B2',
                                                                        padding: '0 2px'
                                                                    },
                                                                    children: kw
                                                                }, i, false, {
                                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                    lineNumber: 1319,
                                                                    columnNumber: 28
                                                                }, this);
                                                            }
                                                            return null;
                                                        }),
                                                        f.evidence
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1313,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1311,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, f.id, true, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1293,
                                    columnNumber: 11
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1265,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 5 - Regulation Linking ─────────────────────────
                const renderRegulationLinking = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginBottom: 16,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                        style: {
                                            fontSize: 16,
                                            fontWeight: 600
                                        },
                                        children: "法规链接结果"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1336,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                            type: "primary",
                                            size: "small",
                                            icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.ThunderboltOutlined, {}, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1341,
                                                columnNumber: 19
                                            }, void 0),
                                            loading: extracting['regulation_linking'],
                                            onClick: ()=>runExtraction('regulation_linking'),
                                            disabled: selectedCrawlers.length === 0 || pipelineRunning,
                                            children: "Dify 提取"
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1338,
                                            columnNumber: 11
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1337,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1335,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                gutter: 12,
                                style: {
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "匹配法规",
                                                value: regulations.length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#45B7D1'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1352,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1352,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1352,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "匹配条款",
                                                value: regulations.length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#1890ff'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1353,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1353,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1353,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                        span: 8,
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                            size: "small",
                                            children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Statistic, {
                                                title: "违规认定",
                                                value: regulations.filter((r)=>r.violation).length,
                                                valueStyle: {
                                                    fontSize: 20,
                                                    color: '#f5222d'
                                                }
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1354,
                                                columnNumber: 42
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1354,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1354,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1351,
                                columnNumber: 7
                            }, this),
                            regulations.length === 0 ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: buildStatus === 'idle' ? '请先启动构建流水线' : '匹配中...'
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1358,
                                columnNumber: 9
                            }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Table, {
                                dataSource: regulations,
                                rowKey: "id",
                                size: "small",
                                columns: [
                                    {
                                        title: '法规名称',
                                        dataIndex: 'regulationName',
                                        key: 'regulationName',
                                        width: 140,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("strong", {
                                                children: t
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1361,
                                                columnNumber: 115
                                            }, void 0)
                                    },
                                    {
                                        title: '条款',
                                        dataIndex: 'article',
                                        key: 'article',
                                        width: 80,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "blue",
                                                children: t
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1362,
                                                columnNumber: 98
                                            }, void 0)
                                    },
                                    {
                                        title: '条款原文',
                                        dataIndex: 'articleText',
                                        key: 'articleText',
                                        width: 260,
                                        ellipsis: true,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tooltip, {
                                                title: t,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    style: {
                                                        fontSize: 12
                                                    },
                                                    children: [
                                                        t.slice(0, 40),
                                                        "..."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1363,
                                                    columnNumber: 144
                                                }, void 0)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1363,
                                                columnNumber: 125
                                            }, void 0)
                                    },
                                    {
                                        title: '匹配特征',
                                        dataIndex: 'matchedFeature',
                                        key: 'matchedFeature',
                                        width: 120,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "green",
                                                children: t
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1364,
                                                columnNumber: 115
                                            }, void 0)
                                    },
                                    {
                                        title: '匹配分数',
                                        dataIndex: 'score',
                                        key: 'score',
                                        width: 120,
                                        render: (v)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Progress, {
                                                percent: Math.round(v * 100),
                                                size: "small",
                                                strokeColor: v > 0.9 ? '#52c41a' : '#faad14'
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1365,
                                                columnNumber: 97
                                            }, void 0)
                                    },
                                    {
                                        title: '违规认定',
                                        dataIndex: 'violation',
                                        key: 'violation',
                                        width: 200,
                                        ellipsis: true,
                                        render: (t)=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                style: {
                                                    color: '#f5222d',
                                                    fontSize: 12
                                                },
                                                children: t
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1366,
                                                columnNumber: 121
                                            }, void 0)
                                    }
                                ]
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1360,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1334,
                        columnNumber: 5
                    }, this);
                // ─── Render: Stage 6 - KG Import ──────────────────────────────────
                const renderKGImport = ()=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                        children: [
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                style: {
                                    marginBottom: 16
                                },
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                    style: {
                                        fontSize: 16,
                                        fontWeight: 600
                                    },
                                    children: "图谱导入"
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1376,
                                    columnNumber: 9
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1375,
                                columnNumber: 7
                            }, this),
                            importResult ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_jsxdevruntime.Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        style: {
                                            marginBottom: 12,
                                            background: '#f6ffed',
                                            border: '1px solid #b7eb8f'
                                        },
                                        children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CheckCircleOutlined, {
                                                    style: {
                                                        fontSize: 24,
                                                        color: '#52c41a'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1383,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 16,
                                                                fontWeight: 600,
                                                                color: '#52c41a'
                                                            },
                                                            children: "导入完成"
                                                        }, void 0, false, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1385,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                                            style: {
                                                                fontSize: 13,
                                                                color: '#64748b'
                                                            },
                                                            children: [
                                                                "共导入 ",
                                                                importResult.nodes.subjects + importResult.nodes.events + importResult.nodes.features + importResult.nodes.regulations,
                                                                " 个节点, ",
                                                                Object.values(importResult.edges).reduce((a, b)=>a + b, 0),
                                                                " 条关系，耗时 ",
                                                                importResult.durationSeconds,
                                                                " 秒"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                            lineNumber: 1386,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1384,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1382,
                                            columnNumber: 13
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1381,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                                        gutter: 12,
                                        style: {
                                            marginBottom: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                    size: "small",
                                                    title: "节点统计",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                                        column: 1,
                                                        size: "small",
                                                        children: [
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                                label: "主体节点",
                                                                children: [
                                                                    importResult.nodes.subjects,
                                                                    " 个"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 1397,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                                label: "事件节点",
                                                                children: [
                                                                    importResult.nodes.events,
                                                                    " 个"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 1398,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                                label: "特征节点",
                                                                children: [
                                                                    importResult.nodes.features,
                                                                    " 个"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 1399,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                                label: "法规节点",
                                                                children: [
                                                                    importResult.nodes.regulations,
                                                                    " 个"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 1400,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1396,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1395,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1394,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                                span: 12,
                                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                                    size: "small",
                                                    title: "关系统计",
                                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions, {
                                                        column: 1,
                                                        size: "small",
                                                        children: Object.entries(importResult.edges).map(([k, v])=>/*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Descriptions.Item, {
                                                                label: k,
                                                                children: [
                                                                    v,
                                                                    " 条"
                                                                ]
                                                            }, k, true, {
                                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                                lineNumber: 1408,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1406,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1405,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1404,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1393,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                children: !importPreview ? /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                    description: buildStatus === 'idle' ? '请先启动构建流水线' : '预览生成中...'
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1418,
                                    columnNumber: 13
                                }, this) : /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    style: {
                                        marginBottom: 12,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                        children: [
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "blue",
                                                children: [
                                                    "待导入节点: ",
                                                    importPreview.nodes.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1422,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Tag, {
                                                color: "green",
                                                children: [
                                                    "待导入关系: ",
                                                    importPreview.edges.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                lineNumber: 1423,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1421,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1420,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1416,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                size: "small",
                                title: "图谱预览",
                                style: {
                                    marginBottom: 12
                                },
                                extra: importPreview && !importResult && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                        type: "primary",
                                        size: "small",
                                        icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.BuildOutlined, {}, void 0, false, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1435,
                                            columnNumber: 57
                                        }, void 0),
                                        loading: importing,
                                        onClick: async ()=>{
                                            if (!importPreview) return;
                                            const source = selectedCrawlers[0];
                                            if (!source) {
                                                msg.warning('请先在数据导入中选择数据源');
                                                return;
                                            }
                                            setImporting(true);
                                            addLog('kg_import', '正在导入图谱到 Neo4j...', 'info');
                                            const startTime = Date.now();
                                            try {
                                                const res = await fetch(`/api/v1/pipeline/dify/import?source=${encodeURIComponent(source)}&dry_run=false`, {
                                                    method: 'POST'
                                                });
                                                const data = await res.json();
                                                if (!data.success && !data.nodes) throw new Error(data.detail || '导入失败');
                                                const durationSeconds = (Date.now() - startTime) / 1000;
                                                const stats = {
                                                    nodes: {
                                                        subjects: subjects.length,
                                                        events: events.length,
                                                        features: features.length,
                                                        regulations: regulations.length
                                                    },
                                                    edges: {
                                                        INVOLVES: events.length,
                                                        REFLECTS: features.length,
                                                        COMPLIES_WITH: regulations.length
                                                    },
                                                    durationSeconds,
                                                    conflicts: 0
                                                };
                                                setImportResult(stats);
                                                setOverallProgress(100);
                                                setBuildStatus('completed');
                                                addLog('kg_import', `图谱导入完成! ${data.nodes || stats.nodes.subjects + stats.nodes.events + stats.nodes.features + stats.nodes.regulations} 节点, ${data.edges || 0} 关系, 耗时 ${durationSeconds.toFixed(1)}s`, 'success');
                                                msg.success('图谱已成功导入 Neo4j!');
                                                const record = {
                                                    buildId: buildId || `build_${Date.now()}`,
                                                    createdAt: new Date().toISOString(),
                                                    dataSource: source,
                                                    status: 'completed',
                                                    entityCount: stats.nodes.subjects + stats.nodes.events + stats.nodes.features + stats.nodes.regulations,
                                                    edgeCount: Object.values(stats.edges).reduce((a, b)=>a + b, 0),
                                                    duration: durationSeconds
                                                };
                                                setBuildHistory((prev)=>[
                                                        record,
                                                        ...prev
                                                    ]);
                                            } catch (err) {
                                                addLog('kg_import', `导入失败: ${err.message}`, 'error');
                                                msg.error(`导入失败: ${err.message}`);
                                            } finally{
                                                setImporting(false);
                                            }
                                        },
                                        children: "确认导入"
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1435,
                                        columnNumber: 15
                                    }, void 0)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1434,
                                    columnNumber: 13
                                }, void 0),
                                children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("div", {
                                    ref: graphContainer,
                                    style: {
                                        width: '100%',
                                        height: 400,
                                        background: '#fafafa',
                                        borderRadius: 8
                                    }
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1490,
                                    columnNumber: 9
                                }, this)
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1431,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                        lineNumber: 1374,
                        columnNumber: 5
                    }, this);
                // ─── Stage router ──────────────────────────────────────────────────
                const renderStageContent = ()=>{
                    switch(activeStage){
                        case 'data_import':
                            return renderDataImport();
                        case 'subject_extraction':
                            return renderSubjectExtraction();
                        case 'event_extraction':
                            return renderEventExtraction();
                        case 'feature_extraction':
                            return renderFeatureExtraction();
                        case 'regulation_linking':
                            return renderRegulationLinking();
                        case 'kg_import':
                            return renderKGImport();
                        default:
                            return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Empty, {
                                description: "未知阶段"
                            }, void 0, false, {
                                fileName: "src/pages/KnowledgeBuild/index.tsx",
                                lineNumber: 1504,
                                columnNumber: 23
                            }, this);
                    }
                };
                // ─── Main render ───────────────────────────────────────────────────
                return /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_procomponents.PageContainer, {
                    children: [
                        renderStepper(),
                        /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Row, {
                            gutter: 16,
                            style: {
                                height: 'calc(100vh - 240px)'
                            },
                            children: [
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 7,
                                    style: {
                                        height: '100%'
                                    },
                                    children: renderLeftPanel()
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1515,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Col, {
                                    span: 17,
                                    style: {
                                        height: '100%',
                                        overflow: 'auto'
                                    },
                                    children: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Card, {
                                        size: "small",
                                        title: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                            children: [
                                                (_STAGES_find = STAGES.find((s)=>s.key === activeStage)) === null || _STAGES_find === void 0 ? void 0 : _STAGES_find.icon,
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)("span", {
                                                    children: [
                                                        (_STAGES_find1 = STAGES.find((s)=>s.key === activeStage)) === null || _STAGES_find1 === void 0 ? void 0 : _STAGES_find1.title,
                                                        " - ",
                                                        (_STAGES_find2 = STAGES.find((s)=>s.key === activeStage)) === null || _STAGES_find2 === void 0 ? void 0 : _STAGES_find2.description
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1526,
                                                    columnNumber: 17
                                                }, void 0),
                                                running && activeStage === ((_STAGES_stageIndex = STAGES[stageIndex]) === null || _STAGES_stageIndex === void 0 ? void 0 : _STAGES_stageIndex.key) && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.LoadingOutlined, {
                                                    spin: true
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1527,
                                                    columnNumber: 72
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1524,
                                            columnNumber: 15
                                        }, void 0),
                                        extra: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Space, {
                                            children: [
                                                buildStatus === 'idle' && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    type: "primary",
                                                    size: "small",
                                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.PlayCircleOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1533,
                                                        columnNumber: 61
                                                    }, void 0),
                                                    onClick: handleStartBuild,
                                                    disabled: uploadedFiles.length === 0 && selectedCrawlers.length === 0,
                                                    children: "开始构建"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1533,
                                                    columnNumber: 19
                                                }, void 0),
                                                (buildStatus === 'running' || pipelineRunning) && /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    danger: true,
                                                    size: "small",
                                                    icon: /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_icons.CloseCircleOutlined, {}, void 0, false, {
                                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                        lineNumber: 1538,
                                                        columnNumber: 53
                                                    }, void 0),
                                                    onClick: handleReset,
                                                    children: "取消"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1538,
                                                    columnNumber: 19
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    onClick: ()=>{
                                                        const idx = STAGES.findIndex((s)=>s.key === activeStage);
                                                        if (idx > 0) setActiveStage(STAGES[idx - 1].key);
                                                    },
                                                    disabled: stageIndex === 0 || running || pipelineRunning,
                                                    children: "上一阶段"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1540,
                                                    columnNumber: 17
                                                }, void 0),
                                                /*#__PURE__*/ (0, _jsxdevruntime.jsxDEV)(_antd.Button, {
                                                    size: "small",
                                                    onClick: ()=>{
                                                        const idx = STAGES.findIndex((s)=>s.key === activeStage);
                                                        if (idx < STAGES.length - 1) setActiveStage(STAGES[idx + 1].key);
                                                    },
                                                    disabled: stageIndex === STAGES.length - 1 || running || pipelineRunning,
                                                    children: "下一阶段"
                                                }, void 0, false, {
                                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                                    lineNumber: 1544,
                                                    columnNumber: 17
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                                            lineNumber: 1531,
                                            columnNumber: 15
                                        }, void 0),
                                        style: {
                                            height: '100%'
                                        },
                                        bodyStyle: {
                                            height: 'calc(100% - 48px)',
                                            overflow: 'auto'
                                        },
                                        children: renderStageContent()
                                    }, void 0, false, {
                                        fileName: "src/pages/KnowledgeBuild/index.tsx",
                                        lineNumber: 1521,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                                    lineNumber: 1520,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "src/pages/KnowledgeBuild/index.tsx",
                            lineNumber: 1513,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "src/pages/KnowledgeBuild/index.tsx",
                    lineNumber: 1510,
                    columnNumber: 5
                }, this);
            };
            _s(KnowledgeBuild, "uWxd35iWGU0Zi/P2Fh2wkLlQnEA=", false, function() {
                return [
                    _antd.App.useApp,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _crawlStore.useCrawlStore,
                    _useCrawlSSE.useCrawlSSE
                ];
            });
            _c = KnowledgeBuild;
            var _default = KnowledgeBuild;
            var _c;
            $RefreshReg$(_c, "KnowledgeBuild");
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
    runtime._h = '4319193577417265863';
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

//# sourceMappingURL=p__KnowledgeBuild__index-async.10367848686944329404.hot-update.js.map