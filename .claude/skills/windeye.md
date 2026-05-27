---
name: windeye
description: "WindEye project context and operations. Use when working on any part of the WindEye capital markets risk monitoring platform — backend API, frontend UI, scraper/crawler, knowledge graph, ETL pipeline, or risk analysis."
---

# WindEye — 资本市场风险传导监测平台

## 启动

```powershell
.\start.ps1                              # 一键启动
cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd frontend; $env:PORT='8001'; npm run dev
```
- 前端: `http://localhost:8001` | 后端: `http://localhost:8000` | API 文档: `http://localhost:8000/docs`

## 系统架构总览

```
┌── Frontend (React 19 + Ant Design Pro v6 + UmiJS Max 4) :8001
│   ├── Welcome          风险仪表盘 (ECharts)
│   ├── KnowledgeGraph   四层图谱可视化 (G6 泳道)
│   ├── KnowledgeQA      风险问答 (SSE 流式聊天)
│   ├── KnowledgeBuild   ETL 流水线构建向导
│   ├── DataCollection   多智能体爬虫 UI
│   └── CommunityDiscovery 社区发现 (Louvain/WCC)
│
│   proxy /api/* → :8000  ──────────────────────────────┐
│                                                        ▼
├── Backend (Python FastAPI) :8000
│   ├── main.py          入口，创建 DRAEngine + RiskAnalysisEngine
│   ├── api/router.py    路由工厂 create_routes()，注册所有端点
│   ├── api/graph_routes.py   图谱可视化 API (16 端点)
│   └── api/pipeline_routes.py ETL/爬虫 API (12 端点)
│
│   ┌── 两大核心引擎 ──────────────────────────────────
│   ├── DRAEngine (dra_ma/orchestrator/engine.py)
│   │   └── 四层多智能体 7 阶段 KG Q&A 流水线
│   └── RiskAnalysisEngine (dra_ma/risk_engine/risk_engine.py)
│       └── 5-Agent 风险分析流水线 (Planner→Retriever→Analyst→Compliance→Reporter)
│
│   ┌── 数据采集 ─────────────────────────────────────
│   └── CrawlOrchestrator (data_collection/orchestrator.py)
│       └── 4 Agent 协同爬取 (Requirement→SourceMatch→Quality→Exception)
│
│   ┌── 图谱构建 ─────────────────────────────────────
│   └── PipelineRunner (kg_construction/etl/pipeline_runner.py)
│       └── 7 阶段 ETL (crawl→parse→extract→link→resolve→import→index)
│
├── Neo4j (bolt://localhost:7687)
│   └── 四层 KG: Subject → Event → Feature → Regulation
│
└── DeepSeek API (可选，RISK_DEMO_MODE=true 可绕过)
```

## 关键模块详解

### 入口与基础设施

| 模块 | 文件 | 核心类/函数 | 职责 |
|---|---|---|---|
| **入口** | `backend/main.py` | 顶层代码 | 创建 FastAPI app，实例化 DRAEngine + RiskAnalysisEngine，调用 create_routes() |
| **配置** | `backend/config/settings.py` | `Settings` (dataclass 单例) | 从 `.env` 加载全部配置 (LLM, Neo4j, NER, KG dataset) |
| **中间件** | `backend/api/middleware.py` | `setup_logging()`, `setup_middleware(app)` | CORS、Trace-ID 注入传播、BiDAError 异常处理 |
| **Neo4j 客户端** | `backend/core/database.py` | `Neo4jClient` → `execute_read()`, `from_env()` | **唯一的 Neo4j 访问层**：连接池、重试 (tenacity 3次指数退避)、序列化 |
| **数据模型** | `backend/core/models.py` | 22 个 Pydantic BaseModel | 跨模块数据契约：TraceContext, Entity, Subgraph, AgentInput/Output 等 |
| **异常体系** | `backend/core/exceptions.py` | `BiDAError` 基类 + 子类 | 结构化错误码体系 (DLG_4xx, RET_4xx/5xx, AGT_4xx/5xx 等) |

### 两大核心引擎

**DRAEngine** — `backend/dra_ma/orchestrator/engine.py` → 类 `DRAEngine`
- 7 阶段流水线：Intent解析 → 自适应门控 → 并发束搜索 → 物理跳执行 → 验证 → 共识聚合 → NLG响应
- 四层智能体：Perception(IntentAgent+GatingRouter) → BeamSearch(Planner×3+Probe) → Execution(ExecutorAgent+SmashAgent) → Consensus(Verifier+Aggregator+Reward)
- 四维协作：Vertical(Doer-Healer) / Horizontal(Ensemble Consensus) / Cross-Layer(Semantic Anchor) / Virtual-Real(Probe-Plan)
- 关键机制：
  - **Dynamic Ensemble**: 仅当 top-1 置信度 < 0.85 时唤醒全部 3 个 Planner
  - **SMASH 自愈**: Executor 失败时 SmashAgent.heal() 修复 → reconstruct() 重写
  - **自适应跳终止**: 所有子目标满足 或 step≥hop 时自动冻结束
  - **消融标志**: `no_smash`, `no_ensemble`, `no_semantic_anchor`, `no_probe`
- 主方法: `handle_request(query, history, trace) -> AsyncGenerator` (SSE yield)

**RiskAnalysisEngine** — `backend/dra_ma/risk_engine/risk_engine.py` → 类 `RiskAnalysisEngine`
- 5-Agent 线性流水线：Planner → Retriever → Analyst → Compliance → Reporter
- Demo 模式 (`RISK_DEMO_MODE=true`): 规则驱动，无需 LLM，关键词搜索 + 跨层路径检测 + 异常识别
- Full LLM 模式 (`RISK_DEMO_MODE=false`): PromptLoader 注入 Neo4j Schema，每阶段调 DeepSeek
- 主方法: `analyze_stream(query, focus_entities, max_hop) -> AsyncGenerator`
- Reporter 输出: executive_summary, risk_level, recommendations, risk_paths, anomalies, markdown_report, echarts_config, raw_data

### 数据采集 (Data Collection)

**CrawlOrchestrator** — `backend/data_collection/orchestrator.py` → 类 `CrawlOrchestrator(demo_mode)`
- 5 阶段爬取流水线：需求解析 → 数据源匹配 → 爬虫执行 → 质量评估 → 自动触发 ETL
- 3 种模式: QUICK(无需LLM) / COMPLEX(NL解析) / TEMPLATE(预设模板)
- 5 个预设模板: litigation_events, regulatory_violations, financial_fraud, executive_violations, financial_sentiment
- Demo 模式: `DEMO_SCRAPER_REGISTRY` → `run_risk_event_demo()` 生成真实 mock PDF
- 真实模式: `SCRAPER_REGISTRY` → `run_risk_event_scraper()` 用 Chrome WebDriver
- 主方法: `execute(req: CrawlTaskRequest) -> AsyncGenerator`

**爬虫** — `backend/data_collection/scrapers/`
| 文件 | 函数 | 数据源 |
|---|---|---|
| `risk_event_scraper.py` | `run_risk_event_scraper()` / `run_risk_event_demo()` | 上交所/深交所/北交所 (风险事件 PDF) |
| `risk_sentiment_scraper.py` | `run_risk_sentiment_scraper()` / `run_risk_sentiment_demo()` | 证券之星 (舆情 TXT) |
| `eastmoney_scraper.py` | `run_eastmoney_scraper()` / `run_eastmoney_demo()` | 东方财富 |
| `utils.py` | `create_chrome_driver()`, `find_with_fallback()`, `wait_for_downloads()` | 共享工具 |

### 图谱构建 (KG Construction)

**PipelineRunner** — `backend/kg_construction/etl/pipeline_runner.py` → 类 `PipelineRunner(config)`
- 策略模式: `register_handler(stage, handler)` 注册阶段处理器
- 7 个阶段处理器工厂: `make_crawl_handler()`, `make_parse_handler()`, `make_extract_handler()` (NER/Dify双路径), `make_import_handler()` (Cypher生成+执行), `make_index_handler()`
- 阶段间状态传递: `run.stats["_records"]` / `run.stats["_entities"]`
- 每阶段最多重试 3 次 (指数退避)

**NER 系统** — `backend/kg_construction/extraction/ner.py`
- 三引擎: `_extract_rule()` (7个正则) / `_extract_spacy()` (zh_core_web_sm) / `_extract_llm()` (DeepSeek)
- 公开函数: `extract_entities(text, model) -> list[{mention, type, confidence}]`
- 实体类型: COMPANY, PERSON, INSTITUTION, REGULATION, AMOUNT, DATE, CASE_NUMBER, LOCATION, EVENT
- 由 `NER_MODEL` 环境变量选择: rule/spaCy/llm/hybrid

**本体注册** — `backend/kg_construction/ontology/ontology_registry.py` → 单例 `OntologyRegistry`
- 从 `ontology_{KG_DATASET}.json` 加载，解耦硬编码标签
- 提供: `get_node_label()`, `get_valid_relations()`, `is_directed()`, `get_entity_matching_strategy()`
- 被 DRAEngine 和 RiskAnalysisEngine 共同使用

**数据源配置** — `backend/kg_construction/etl/pipeline_config.py`
- `DATA_SOURCE_CONFIGS`: 5 个数据源定义 (risk_event_sse/szse/bse, risk_sentiment, regulation_docs)
- 每个源: name, data_subdir, input_glob, layer, entity_types, relation_types, extraction_method

### 图谱查询 (KG Query)

**图谱分析** — `backend/kg_query/analytics/graph_analytics.py` → 类 `GraphAnalytics(db_client)`
- 社区发现: WCC (UnionFind) / Louvain (scipy 稀疏矩阵 + 贪婪模块度优化 50轮) / 标签传播 (20轮)
- 中心性: PageRank (幂迭代 damping=0.85) / Betweenness (Brandes BFS)
- 环路检测: DFS 有向环检测
- 全部纯 Python 实现，无 GDS 依赖

**图谱可视化 API** — `backend/api/graph_routes.py` → 独立 `APIRouter(prefix="/api/v1/graph")`
- 16 个端点: 健康检查 / 统计 (按层/汇总/跨层) / 数据检索 / 搜索 / 子图 / 展开 / 社区 / 中心性 / 环路 / 高风险实体
- 自己持有 `Neo4jClient` 实例 (`_db` 全局懒加载)

### 前端页面

| 页面 | 路由 | 组件 | 关键依赖 |
|---|---|---|---|
| **风险仪表盘** | `/welcome` | `Welcome.tsx` | ECharts (南丁格尔玫瑰图/桑基图), 5 个 API 调用 |
| **四层总览** | `/knowledge-graph` | `GeneralPage.tsx` | G6 泳道布局, 4 层彩色背景, 搜索/展开/导出 |
| **风险问答** | `/knowledge-qa` | `KnowledgeQA/index.tsx` | SSE 流式, 三栏布局, G6 + ECharts + Markdown |
| **ETL构建** | `/knowledge-build` | `KnowledgeBuild/index.tsx` | 6 阶段 Steps, 文件上传, 智能采集, G6 预览 |
| **数据采集** | `/data-collection` | `DataCollection/index.tsx` | 3 模式切换, SSE 进度, 模板面板 |
| **社区发现** | `/community-discovery` | `CommunityDiscovery/index.tsx` | 三栏布局, Louvain/WCC/LP, G6 子图 |
| **单层图谱** | `/knowledge-graph/:layer` | `LayerGraphPage.tsx` | G6 dagre 布局, 复用组件 |

### 前端状态管理 (Zustand)

| Store | 文件 | 关键状态 |
|---|---|---|
| `useAgentStore` | `KnowledgeQA/store/agentStore.ts` | messages, currentSubgraph, isLoading, riskReport, riskStages, activeRightPanel |
| `useChatStore` | `KnowledgeQA/store/chatStore.ts` | sessions, activeSessionId (localStorage 持久化) |
| `useCrawlStore` | `DataCollection/store/crawlStore.ts` | mode, sources, keywords, isRunning, progress, result |

### 前端 API 通信

| 文件 | 函数 | 协议 |
|---|---|---|
| `KnowledgeQA/api/agent.ts` | `sendChatStream()`, `sendRiskStream()`, `healthCheck()` | EventSource / fetch+ReadableStream SSE |
| `services/dashboard.ts` | `fetchSummaryStats()`, `fetchRiskDistribution()` 等 7 个 | fetch → `/api/v1/graph/*` |
| `DataCollection/hooks/useCrawlSSE.ts` | `useCrawlSSE()` hook | fetch+ReadableStream SSE → `/api/v1/pipeline/crawl/run` |
| `services/ant-design-pro/api.ts` | `login()`, `logout()`, `currentUser()` | Umi `request` plugin |
| `services/data-collection/index.ts` | `fetchTemplates()`, `fetchSources()`, `parseNL()` | Umi `request` plugin |

## 三条核心数据流

### 1. KG 问答 (DRAEngine 7 阶段)

```
用户输入 → agentStore.sendMessage() → sendChatStream()
  → GET /api/v1/chat/recommend-stream
  → DRAEngine.handle_request():
    Stage 1: IntentAgent.parse() 提取实体/跳数/答案类型
    Stage 2: GatingRouter.route() 决定 1-hop 快路径 vs 多跳全流水线
    Stage 3: 并发束搜索 (Probe 扫描 Schema → Planner×3 评分 → Executor 执行)
    Stage 4: SmashAgent.heal()/reconstruct() 自愈修复
    Stage 5: VerifierAgent.verify() 事实校验
    Stage 6: AggregatorAgent.aggregate() 共识聚合
    Stage 7: NLG 生成 + 图谱可视化数据构造
  → SSE events: stage → cards → graph → review → done
  → 前端渲染: EnhancedGraphPanel (G6) + ChatSidebar + EntityMessageBubble
```

### 2. 风险分析 (RiskAnalysisEngine 5-Agent)

```
用户输入 → agentStore.sendRiskQuery() → sendRiskStream()
  → GET /api/v1/chat/risk-stream
  → Phase A (可选): GraphAnalytics.detect_communities(method="louvain")
           匹配最佳社区 → 提取关注实体
  → Phase B: RiskAnalysisEngine.analyze_stream():
    Stage 1: Planner → LLM 分解查询为子任务
    Stage 2: Retriever → 发现 Neo4j Schema → 生成 Cypher → 执行 → 返回子图
    Stage 3: Analyst → 识别风险路径和异常模式
    Stage 4: Compliance → 匹配法规层节点
    Stage 5: Reporter → 生成结构化报告 (markdown + echarts_config + raw_data)
  → SSE events: community → stage → subgraph → report → done
  → _save_report() 持久化 :RiskReport 节点到 Neo4j
  → 前端渲染: RiskReportPanel (Markdown + ECharts) + EnhancedGraphPanel (G6)
```

### 3. 数据采集 + ETL

```
用户配置 → useCrawlSSE.startCrawl(payload)
  → POST /api/v1/pipeline/crawl/run (SSE)
  → CrawlOrchestrator.execute():
    Stage 1: RequirementParsingAgent (quick/complex/template)
    Stage 2: SourceMatchingAgent → 匹配爬虫配置
    Stage 3: 执行爬虫 (DEMO 或 REAL 模式) → 文件写入 data/risk_events/{source}/
    Stage 4: QualityAssessmentAgent 评分
    Stage 5: 自动触发 ETL
  → 用户触发 ETL: POST /api/v1/pipeline/run?source=risk_event_sse
  → PipelineRunner.run():
    parse → extract(NER/Dify) → link → resolve → import(Cypher→Neo4j) → index
  → 阶段间通过 run.stats["_records"]/_entities 传递状态
```

## 环境变量 (.env)

| 变量 | 默认值 | 作用 |
|---|---|---|
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j 连接 |
| `NEO4J_USER` / `NEO4J_PASSWORD` | — | Neo4j 认证 |
| `LLM_API_KEY` | — | DeepSeek API key |
| `LLM_BASE_URL` | `https://api.deepseek.com/v1` | LLM 端点 |
| `LLM_MODEL` | `deepseek-v4-flash` | LLM 模型 |
| `RISK_DEMO_MODE` | `true` | true=规则分析(无LLM成本) / false=5-Agent LLM |
| `CRAWL_DEMO_MODE` | `false` | true=Mock文件 / false=Chrome WebDriver 真实爬取 |
| `NER_MODEL` | `llm` | NER 引擎: rule / spaCy / llm / hybrid |
| `KG_DATASET` | `finance` | 本体配置文件名 `ontology_{KG_DATASET}.json` |

## 关键设计模式

| 模式 | 位置 | 说明 |
|---|---|---|
| **双引擎架构** | DRAEngine + RiskAnalysisEngine | 独立智能体拓扑，共享 Neo4j，互不依赖 |
| **Async Generator + SSE** | 所有流式端点 | `async def gen()` yield dict → `StreamingResponse(text/event-stream)` |
| **动态集束 (Dynamic Ensemble)** | DRAEngine | 置信度 < 0.85 时唤醒全部 3 个 Planner，降低 LLM 成本 |
| **SMASH 自愈闭环** | DRAEngine Layer 2-3 | Executor 失败 → SmashAgent 修复 → 重试 |
| **策略模式 (Stage Registration)** | PipelineRunner | `register_handler(stage, fn)` 注册阶段处理器 |
| **双提取路径** | ETL extraction | NER (本地 regex/spaCy/LLM) 或 Dify (外部工作流 API) |
| **本体驱动 Cypher** | OntologyRegistry | 动态读取 JSON 配置构造 Cypher 标签/关系，解耦硬编码 |
| **Zustand + persist** | 前端 chatStore | localStorage 自动持久化会话 |
| **BFF 意图路由** | router.py route_intent | 关键词分类：图谱查询 vs 风险分析 vs 澄清 |

## 常用命令

```powershell
# 启动
cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd frontend; $env:PORT='8001'; npm run dev

# 依赖
cd backend; pip install -r requirements.txt
cd frontend; npm install

# 测试
cd backend; python -m pytest tests/ -v
cd frontend; npm test

# 类型/代码检查
cd frontend; npx tsc --noEmit; npm run lint

# 测试 Demo 爬虫
cd backend; python -c "from data_collection.scrapers.risk_event_scraper import run_risk_event_demo; print(run_risk_event_demo({'source':'sse','max_pages':1}))"
```

## 编码约定

**Python**: `from __future__ import annotations`, 类型标注, `logging.getLogger(__name__)`, Neo4j 通过 `Neo4jClient` 不直接用 driver, Pydantic 模型, 配置从 `settings` + `.env`

**TypeScript/React**: 避免 `any`, Zustand 共享状态 / useState 组件局部状态, G6 实例用 refs 绑定生命周期, SSE 流用 fetch+ReadableStream / EventSource, 颜色用 `LAYER_THEME` 常量 (Subject=#2563EB, Event=#DC2626, Feature=#EA580C, Regulation=#7C3AED)

## 故障排查

| 症状 | 原因 | 修复 |
|---|---|---|
| 爬虫下载 0 文件 | `CRAWL_DEMO_MODE=true` | 设为 `false` 并安装 chromedriver |
| 前端连不上后端 | 代理/端口问题 | 后端 :8000，前端 :8001，代理见 `config/proxy.ts` |
| Neo4j 连接拒绝 | Neo4j 未启动 | 启动 Neo4j Desktop 或 `neo4j start` |
| 风险分析结果泛化 | `RISK_DEMO_MODE=true` | 设为 `false` 启用完整 LLM 流水线 |
| `reportCount is not defined` | Welcome.tsx 缺少派生变量 | 添加 `const reportCount = recentReports.length` |
| 图谱为空 | Neo4j 无数据 | 运行 ETL 流水线或导入样例数据 |
| chromedriver 找不到 | 未安装 / PATH 不对 | 放到 `D:\chromedriver-win64\` 或加到 PATH |
