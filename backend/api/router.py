"""API route definitions for BiDA-KG backend."""

import json as _json
import logging
from uuid import uuid4

from fastapi import APIRouter, Request, File, UploadFile
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field
from typing import Literal

from core.exceptions import BiDAError
from core.models import ApiSuccessResponse, TraceContext
from core.tracing import get_trace_id

router = APIRouter()
_logger = logging.getLogger("api.router")


# ── Risk Analysis request models ──────────────────────────────────

class RiskAnalyzeRequest(BaseModel):
    query: str = Field(..., description="User query or trigger description.")
    focus_entities: list[str] = Field(default_factory=list, description="Entity names to focus on.")
    max_hop: int = Field(default=3, ge=1, le=5, description="Max analysis hop count.")
    trigger_event: str | None = Field(default=None, description="Trigger event type.")


class ChatRecommendRequest(BaseModel):
    query: str = Field(..., description="Current user query.")
    history: list[str] = Field(default_factory=list, description="Conversation history.")
    session_id: str = Field(default_factory=lambda: f"sess-{uuid4().hex[:10]}", alias="sessionId")
    round_id: int = Field(default=1, alias="roundId")


class RouteRequest(BaseModel):
    query: str = Field(..., description="User query to route.")


class RouteResponse(BaseModel):
    route: Literal["graph", "analysis", "clarify", "risk"]
    clarify_message: str | None = Field(default=None, description="Clarification question when route=clarify")


class AnalyzeRequest(BaseModel):
    query: str = Field(..., description="Analysis request query.")


class RiskStreamRequest(BaseModel):
    query: str = Field(default="", description="User query for risk analysis.")
    focus_entities: list[str] = Field(default_factory=list, alias="focusEntities", description="Pre-extracted focus entities.")
    file_content: str | None = Field(default=None, alias="fileContent", description="Uploaded file text for entity extraction.")
    session_id: str = Field(default="", alias="sessionId")
    round_id: int = Field(default=1, alias="roundId")
    community_id: int | None = Field(default=None, alias="communityId")
    max_hop: int = Field(default=3, ge=1, le=5, alias="maxHop")


class ReportDocxExportRequest(BaseModel):
    report: dict = Field(default_factory=dict, description="Risk report payload to export.")
    report_id: str = Field(default="", alias="reportId")
    query_text: str = Field(default="", alias="queryText")


def create_routes(app, kg_system, risk_engine=None):
    """Register all API routes on the FastAPI application."""

    # ── Graph visualization routes (migrated from Flask server_Arua.py) ──
    from api.graph_routes import router as graph_router
    app.include_router(graph_router)

    # ── Pipeline management routes ──
    from api.pipeline_routes import router as pipeline_router
    app.include_router(pipeline_router)

    @app.get("/health")
    def health(request: Request) -> dict[str, str]:
        return {"status": "ok", "traceId": getattr(request.state, "trace_id", get_trace_id())}

    # ── Auth endpoints (mock) for Ant Design Pro login flow ──────

    class LoginRequest(BaseModel):
        username: str | None = None
        password: str | None = None
        type: str | None = None
        autoLogin: bool | None = None

    @app.post("/api/login/account")
    async def login_account(req: LoginRequest):
        """Mock login — accept any credentials for development."""
        if not req.username or not req.password:
            return {"status": "error", "type": req.type or "account", "currentAuthority": "guest"}
        return {"status": "ok", "type": req.type or "account", "currentAuthority": "admin"}

    @app.get("/api/currentUser")
    async def current_user():
        return {
            "data": {
                "name": "Admin",
                "avatar": "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
                "userid": "00000001",
                "email": "admin@ant.design",
                "signature": "Risk Management Platform Admin",
                "title": "风控分析师",
                "group": "风控平台",
                "notifyCount": 12,
                "unreadCount": 3,
                "country": "China",
                "access": "admin",
                "phone": "138****8888",
            },
            "success": True,
        }

    @app.post("/api/login/outLogin")
    async def out_login():
        return {"data": {}, "success": True}

    # ── DRA-MA KG Q&A routes ──────────────────────────────────────

    @app.post("/api/v1/chat/recommend", response_model=ApiSuccessResponse)
    async def recommend(payload: ChatRecommendRequest, request: Request) -> ApiSuccessResponse:
        trace = TraceContext(
            sessionId=payload.session_id,
            roundId=payload.round_id,
            traceId=getattr(request.state, "trace_id", get_trace_id()),
        )
        result = await kg_system.handle_request(query=payload.query, history=payload.history, trace=trace)
        return ApiSuccessResponse(**result)

    @app.get("/api/v1/graph/expand")
    def expand_graph(id: str, type: str):
        return kg_system.expand_node(node_id=id, node_type=type)

    @app.get("/api/v1/chat/recommend-stream")
    async def recommend_stream(request: Request, query: str = "", history: str = "{}"):
        _logger.warning("[DEPRECATED] GET /recommend-stream called — forwarding to unified-stream intent_hint=graph_qa")

        session_id = request.query_params.get("sessionId", f"sess-{uuid4().hex[:10]}")
        try:
            round_id = int(request.query_params.get("roundId", "1"))
        except ValueError:
            round_id = 1

        req = UnifiedStreamRequest(
            query=query,
            sessionId=session_id,
            roundId=round_id,
            intentHint="graph_qa",
        )
        return await unified_stream(req, request)

    @app.post("/api/v1/chat/route", response_model=RouteResponse)
    async def route_intent(req: RouteRequest) -> RouteResponse:
        query = req.query
        risk_keywords = ["风险", "异常", "传导", "暴雷", "合规", "违规", "监管", "处罚", "事故", "损失"]
        graph_keywords = ["图谱", "查询", "关系", "关联", "路径", "公司", "企业", "人物", "事件", "节点"]
        risk_report_keywords = [
            "风险报告", "风险分析", "社区风险", "风险社区", "群体风险",
            "传导分析", "合规报告", "社区报告", "治理报告", "协同治理",
            "社区风险报告", "群体风险报告",
        ]

        has_risk = any(kw in query for kw in risk_keywords)
        has_graph = any(kw in query for kw in graph_keywords)
        has_risk_report = any(kw in query for kw in risk_report_keywords)

        # Risk report queries: explicit risk analysis / community risk intent
        if has_risk_report or (has_risk and not has_graph):
            return RouteResponse(route="risk", clarify_message=None)
        if has_graph or (has_risk and has_graph):
            return RouteResponse(route="graph", clarify_message=None)
        return RouteResponse(
            route="clarify",
            clarify_message="请问您是想查询图谱中的实体关系，还是进行协同治理分析？",
        )

    # ── Unified Stream (new main entry point) ───────────────────────

    class UnifiedStreamRequest(BaseModel):
        query: str = Field(default="", description="用户查询")
        file_content: str | None = Field(default=None, alias="fileContent")
        session_id: str = Field(default="", alias="sessionId")
        round_id: int = Field(default=1, alias="roundId")
        max_hop: int = Field(default=3, ge=1, le=5, alias="maxHop")
        intent_hint: str | None = Field(default=None, alias="intentHint")

    @app.post("/api/v1/chat/unified-stream")
    async def unified_stream(req: UnifiedStreamRequest, request: Request):
        """Unified SSE endpoint — single authoritative entry for both graph_qa and risk_analysis.

        Internal pipeline:
          IntentAgent → EntityResolution → DRAEngine → GraphAnalytics → RiskPlugins
        """
        _logger_sse = logging.getLogger("api.router.unified")

        async def event_generator():
            try:
                from dra_ma.orchestrator.unified_engine import UnifiedEngine
                unified = UnifiedEngine(dra_engine=kg_system, demo=False)

                async for line in unified.stream(
                    query=req.query,
                    session_id=req.session_id,
                    round_id=req.round_id,
                    max_hop=req.max_hop,
                    intent_hint=req.intent_hint,
                    file_content=req.file_content,
                ):
                    # UnifiedEngine yields JSON envelope strings — wrap as SSE
                    data = _json.loads(line) if isinstance(line, str) else line
                    event_type = data.get("type", "stage")
                    yield f"event: {event_type}\ndata: {_json.dumps(data, ensure_ascii=False)}\n\n"

            except Exception as exc:
                _logger_sse.exception("[UnifiedStream] Fatal error: %s", exc)
                yield f"event: error\ndata: {_json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
                yield f"event: done\ndata: {{}}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": "*",
            },
        )

    @app.post("/api/v1/chat/upload")
    async def upload_file(file: UploadFile = File(...)):
        MAX_CHARS = 50_000
        try:
            filename = file.filename or "unknown.txt"
            ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

            if ext in ("txt", "md", ""):
                raw = await file.read()
                # Try UTF-8 first, then common Chinese encodings
                for encoding in ("utf-8", "gbk", "gb2312", "gb18030"):
                    try:
                        text = raw.decode(encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                else:
                    text = raw.decode("utf-8", errors="replace")

            elif ext == "pdf":
                import fitz  # PyMuPDF
                raw = await file.read()
                doc = fitz.open(stream=raw, filetype="pdf")
                parts = []
                for page in doc:
                    parts.append(page.get_text())
                doc.close()
                text = "\n".join(parts)

            elif ext == "docx":
                import io, docx
                raw = await file.read()
                doc = docx.Document(io.BytesIO(raw))
                text = "\n".join(p.text for p in doc.paragraphs)

            else:
                return {
                    "success": False,
                    "message": f"不支持的文件类型: .{ext} (支持 .txt .md .docx .pdf)",
                }

            char_count = len(text)
            truncated = char_count > MAX_CHARS
            if truncated:
                text = text[:MAX_CHARS]

            return {
                "success": True,
                "data": {
                    "filename": filename,
                    "text": text,
                    "char_count": char_count,
                    "truncated": truncated,
                },
            }

        except Exception as exc:
            _logger.exception("File upload failed: %s", exc)
            return {"success": False, "message": f"文件解析失败: {str(exc)}"}

    @app.post("/api/v1/chat/analyze", response_class=StreamingResponse)
    async def analyze_risk(req: AnalyzeRequest):
        async def generate():
            try:
                engine = risk_engine
                if engine is None:
                    yield f"event: stage\ndata: {_json.dumps({'content': '协同治理引擎未初始化'}, ensure_ascii=False)}\n\n"
                    yield f"event: done\ndata: {{}}\n\n"
                    return

                async for update in engine.analyze_stream(query=req.query):
                    if "stage" in update:
                        stage_name = update["stage"]
                        content = update.get("content", "")
                        yield f"event: stage\ndata: {_json.dumps({'stage': stage_name, 'content': content}, ensure_ascii=False)}\n\n"
                    elif "entity_stats" in update:
                        yield f"event: entity_stats\ndata: {_json.dumps(update['entity_stats'], ensure_ascii=False)}\n\n"
                    elif "community" in update:
                        yield f"event: community\ndata: {_json.dumps(update['community'], ensure_ascii=False)}\n\n"
                    elif "risk_paths" in update:
                        yield f"event: risk_paths\ndata: {_json.dumps(update['risk_paths'], ensure_ascii=False)}\n\n"
                    elif "output" in update:
                        output = update['output']
                        yield f"event: analysis_text\ndata: {_json.dumps({'chunk': output.get('markdown_report', '')}, ensure_ascii=False)}\n\n"
                        ec = output.get('echarts_config')
                        rd = output.get('raw_data', [])
                        yield f"event: echarts_config\ndata: {_json.dumps(ec, ensure_ascii=False) if ec else 'null'}\n\n"
                        yield f"event: raw_data\ndata: {_json.dumps(rd, ensure_ascii=False)}\n\n"
                        yield f"event: done\ndata: {_json.dumps({'row_count': output.get('subtasks_completed', 0)}, ensure_ascii=False)}\n\n"

            except Exception as exc:
                _logger.exception("[AnalyzeSSE] Stream error: %s", exc)
                yield f"event: error\ndata: {_json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
                yield f"event: done\ndata: {{}}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Access-Control-Allow-Origin": "*"}
        )

    # ── Community-aware Risk Analysis SSE (for KnowledgeQA chat) ──

    async def _match_community_to_query(db, query: str, layer: str | None = None) -> dict | None:
        """Detect communities and return the one most relevant to the query."""
        try:
            from kg_query.analytics.graph_analytics import GraphAnalytics
            analytics = GraphAnalytics(db)
            result = analytics.detect_communities(
                layer=layer, method="louvain", min_community_size=3
            )
            communities = result.get("communities", [])
            if not communities:
                return None

            # Extract keywords from query (simple character-level segmentation)
            query_chars = set(query.replace(" ", ""))
            # Score each community by how many top-entity names overlap with query
            best = None
            best_score = 0
            for comm in communities:
                score = 0
                for ent in comm.get("top_entities", []):
                    name = ent.get("name", "")
                    # Count overlapping characters
                    name_chars = set(name)
                    overlap = len(query_chars & name_chars)
                    score += overlap
                if score > best_score:
                    best_score = score
                    best = comm

            if best and best_score > 0:
                return {
                    "communities": [best],
                    "algorithm": "louvain_match",
                    "matched_community_id": best["community_id"],
                }
            return None
        except Exception as exc:
            _logger.warning("[RiskStream] Community matching failed: %s", exc)
            return None

    async def _build_risk_stream_events(
        engine,
        query: str,
        focus_entities: list[str],
        parsed_max_hop: int,
        parsed_community_id: int | None,
        file_content: str | None,
        _logger_sse,
    ):
        """Shared risk-stream event generator used by both GET and POST endpoints."""
        if engine is None:
            yield f"event: stage\ndata: {_json.dumps({'stage': 'planning', 'content': '协同治理引擎未初始化'}, ensure_ascii=False)}\n\n"
            yield f"event: done\ndata: {{}}\n\n"
            return

        try:
            effective_query = query
            effective_focus_entities = list(focus_entities)

            # If file content provided and no focus_entities, extract them
            if file_content and not effective_focus_entities:
                yield f"event: stage\ndata: {_json.dumps({'stage': 'planning', 'content': '正在分析文件内容，提取关键实体...'}, ensure_ascii=False)}\n\n"
                extraction = await engine._extract_from_file_content_llm(file_content)

                if extraction.get("is_financial_risk_relevant", True):
                    effective_focus_entities = extraction.get("entities", [])
                    risk_signals = extraction.get("risk_signals", [])
                    summary = extraction.get("summary", "")

                    if summary and not query.strip():
                        effective_query = f"请分析以下文档内容的协同治理情况: {summary}"
                    if risk_signals:
                        effective_query += f"\n\n文档中识别到的风险信号: {'; '.join(risk_signals)}"

                    yield f"event: stage\ndata: {_json.dumps({'stage': 'planning', 'content': f'提取到 {len(effective_focus_entities)} 个关键实体: {", ".join(effective_focus_entities[:8])}'}, ensure_ascii=False)}\n\n"
                else:
                    yield f"event: stage\ndata: {_json.dumps({'stage': 'planning', 'content': '文档未识别到明显的金融风控相关内容，将进行通用分析'}, ensure_ascii=False)}\n\n"

            # Phase A: Community detection & selection
            matched_community: dict | None = None

            if parsed_community_id is not None and hasattr(engine, "_db"):
                yield f"event: stage\ndata: {_json.dumps({'stage': 'retrieving', 'content': f'获取社区 #{parsed_community_id} 子图...'}, ensure_ascii=False)}\n\n"
                try:
                    from kg_query.analytics.graph_analytics import GraphAnalytics
                    analytics = GraphAnalytics(engine._db)
                    sub = analytics.get_community_subgraph(parsed_community_id, limit=200)
                    nodes = sub.get("nodes", [])
                    community_focus = [
                        n.get("name") or n.get("properties", {}).get("name", "")
                        for n in nodes
                        if (n.get("name") or n.get("properties", {}).get("name", ""))
                    ][:20]
                    if community_focus:
                        effective_focus_entities = community_focus
                    if nodes:
                        yield f"event: subgraph\ndata: {_json.dumps({'nodes': nodes, 'edges': sub.get('edges', [])}, ensure_ascii=False)}\n\n"
                    yield f"event: community\ndata: {_json.dumps({'community_id': parsed_community_id, 'size': len(nodes), 'top_entities': [{'id': n.get('id',''), 'name': n.get('name','') or n.get('properties',{}).get('name',''), 'label': (n.get('labels') or [''])[0]} for n in nodes[:5]]}, ensure_ascii=False)}\n\n"
                except Exception as exc:
                    _logger_sse.warning("[RiskStream] Community subgraph fetch failed: %s", exc)

            elif hasattr(engine, "_db"):
                yield f"event: stage\ndata: {_json.dumps({'stage': 'retrieving', 'content': '检测图谱社区结构...'}, ensure_ascii=False)}\n\n"
                matched_community = await _match_community_to_query(engine._db, effective_query)
                if matched_community:
                    yield f"event: community\ndata: {_json.dumps(matched_community, ensure_ascii=False)}\n\n"
                    matched_entities = [
                        ent.get("name", "") for ent in matched_community.get("communities", [[]])[0].get("top_entities", [])
                    ]
                    if matched_entities:
                        effective_focus_entities = matched_entities
                    matched_cid = matched_community.get("matched_community_id", matched_community.get("communities", [{}])[0].get("community_id", "?"))
                    matched_size = matched_community.get("communities", [{}])[0].get("size", 0)
                    yield f"event: stage\ndata: {_json.dumps({'stage': 'retrieving', 'content': f'匹配到社区 #{matched_cid} ({matched_size} 个节点)，开始协同治理分析...'}, ensure_ascii=False)}\n\n"

            # Phase B: Run the 5-agent risk analysis pipeline
            async for update in engine.analyze_stream(
                query=effective_query,
                focus_entities=effective_focus_entities,
                max_hop=parsed_max_hop,
            ):
                if "stage" in update:
                    stage_name = update["stage"]
                    if stage_name == "subgraph":
                        sub_data = {
                            "nodes": update.get("nodes", []),
                            "edges": update.get("edges", []),
                        }
                        yield f"event: subgraph\ndata: {_json.dumps(sub_data, ensure_ascii=False)}\n\n"
                    else:
                        yield f"event: stage\ndata: {_json.dumps({'stage': stage_name, 'content': update.get('content', '')}, ensure_ascii=False)}\n\n"
                elif "output" in update:
                    output = update["output"]
                    _save_report(output, effective_query)
                    yield f"event: report\ndata: {_json.dumps(output, ensure_ascii=False)}\n\n"
                    yield f"event: done\ndata: {{}}\n\n"

        except Exception as exc:
            _logger_sse.exception("[RiskStream] Stream error: %s", exc)
            yield f"event: error\ndata: {_json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
            yield f"event: done\ndata: {{}}\n\n"

    @app.get("/api/v1/chat/risk-stream")
    async def chat_risk_stream(
        request: Request,
        query: str = "",
        sessionId: str = "",
        roundId: str = "1",
        communityId: str = "",
        maxHop: str = "3",
    ):
        _logger.warning("[DEPRECATED] GET /risk-stream called — forwarding to unified-stream intent_hint=risk_analysis")

        try:
            parsed_max_hop = int(maxHop)
        except ValueError:
            parsed_max_hop = 3

        try:
            round_id = int(roundId)
        except ValueError:
            round_id = 1

        req = UnifiedStreamRequest(
            query=query,
            sessionId=sessionId,
            roundId=round_id,
            maxHop=parsed_max_hop,
            intentHint="risk_analysis",
        )
        return await unified_stream(req, request)

    @app.post("/api/v1/chat/risk-stream")
    async def chat_risk_stream_post(req_in: RiskStreamRequest, request: Request):
        _logger.warning("[DEPRECATED] POST /risk-stream called — forwarding to unified-stream intent_hint=risk_analysis")

        req = UnifiedStreamRequest(
            query=req_in.query,
            fileContent=req_in.file_content,
            sessionId=req_in.session_id,
            roundId=req_in.round_id,
            maxHop=req_in.max_hop,
            intentHint="risk_analysis",
        )
        return await unified_stream(req, request)

    # ── Chat history persistence ───────────────────────────────────

    class ChatHistoryRecord(BaseModel):
        session_id: str = Field(..., alias="sessionId")
        role: str = Field(default="user")
        content: str = Field(default="")
        message_id: str = Field(default_factory=lambda: f"msg-{uuid4().hex[:10]}", alias="messageId")

    @app.get("/api/v1/chat/history/{session_id}")
    async def get_chat_history(session_id: str):
        """Retrieve chat history for a session from Neo4j."""
        if risk_engine is None or not hasattr(risk_engine, "_db"):
            return {"success": True, "data": {"messages": [], "session_id": session_id}}
        try:
            db = risk_engine._db
            cypher = """
            MATCH (s:ChatSession {session_id: $sid})-[:CONTAINS]->(m:ChatMessage)
            RETURN m ORDER BY m.timestamp ASC
            """
            rows, _ = db.execute_read_with_summary(cypher, {"sid": session_id})
            messages = []
            for row in rows:
                msg = row.get("m", {})
                props = msg.get("properties", msg) if isinstance(msg, dict) else {}
                messages.append({
                    "id": props.get("message_id", ""),
                    "role": props.get("role", "user"),
                    "content": props.get("content", ""),
                    "timestamp": str(props.get("timestamp", "")),
                })
            return {"success": True, "data": {"messages": messages, "session_id": session_id}}
        except Exception as exc:
            _logger.warning("[ChatHistory] GET failed: %s", exc)
            return {"success": True, "data": {"messages": [], "session_id": session_id}}

    @app.post("/api/v1/chat/history")
    async def save_chat_history(records: list[ChatHistoryRecord]):
        """Store chat messages in Neo4j for server-side session persistence."""
        if risk_engine is None or not hasattr(risk_engine, "_db"):
            return {"success": False, "message": "引擎未初始化"}
        try:
            db = risk_engine._db
            for rec in records:
                cypher = """
                MERGE (s:ChatSession {session_id: $sid})
                CREATE (m:ChatMessage {
                    message_id: $mid,
                    role: $role,
                    content: $content,
                    timestamp: datetime()
                })
                CREATE (s)-[:CONTAINS]->(m)
                """
                db.execute_read(cypher, {
                    "sid": rec.session_id,
                    "mid": rec.message_id,
                    "role": rec.role,
                    "content": rec.content[:2000],
                })
            return {"success": True, "message": f"已保存 {len(records)} 条消息"}
        except Exception as exc:
            _logger.exception("[ChatHistory] POST failed: %s", exc)
            return {"success": False, "message": str(exc)}

    # ── Risk Analysis routes ──────────────────────────────────────

    @app.get("/api/v1/risk/analyze-stream")
    async def risk_analyze_stream(request: Request, query: str = "", focus_entities: str = "[]"):
        _logger_sse = logging.getLogger("api.router.risk")

        try:
            parsed_entities: list[str] = _json.loads(focus_entities) or []
        except Exception:
            parsed_entities = []

        async def event_generator():
            try:
                engine = risk_engine
                if engine is None:
                    yield f"event: stage\ndata: {_json.dumps({'content': '协同治理引擎未初始化'}, ensure_ascii=False)}\n\n"
                    yield f"event: done\ndata: {{}}\n\n"
                    return

                async for update in engine.analyze_stream(
                    query=query,
                    focus_entities=parsed_entities,
                ):
                    if "stage" in update:
                        stage_name = update["stage"]
                        if stage_name == "subgraph":
                            sub_data = {
                                "nodes": update.get("nodes", []),
                                "edges": update.get("edges", []),
                            }
                            yield f"event: subgraph\ndata: {_json.dumps(sub_data, ensure_ascii=False)}\n\n"
                        else:
                            yield f"event: stage\ndata: {_json.dumps({'stage': stage_name, 'content': update.get('content', '')}, ensure_ascii=False)}\n\n"
                    elif "entity_stats" in update:
                        yield f"event: entity_stats\ndata: {_json.dumps(update['entity_stats'], ensure_ascii=False)}\n\n"
                    elif "community" in update:
                        yield f"event: community\ndata: {_json.dumps(update['community'], ensure_ascii=False)}\n\n"
                    elif "risk_paths" in update:
                        yield f"event: risk_paths\ndata: {_json.dumps(update['risk_paths'], ensure_ascii=False)}\n\n"
                    elif "output" in update:
                        output = update["output"]
                        _save_report(output, query)
                        yield f"event: report\ndata: {_json.dumps(output, ensure_ascii=False)}\n\n"
                        yield f"event: done\ndata: {{}}\n\n"

            except Exception as exc:
                _logger_sse.exception("[RiskSSE] Stream error: %s", exc)
                yield f"event: error\ndata: {_json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"
                yield f"event: done\ndata: {{}}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Access-Control-Allow-Origin": "*"},
        )

    @app.post("/api/v1/risk/analyze")
    async def risk_analyze(req: RiskAnalyzeRequest):
        if risk_engine is None:
            return {"success": False, "message": "协同治理引擎未初始化"}
        result = await risk_engine.analyze(
            query=req.query,
            focus_entities=req.focus_entities,
            max_hop=req.max_hop,
            trigger_event=req.trigger_event,
        )
        return {"success": True, "data": result}

    # ── Report persistence (Neo4j RiskReport nodes) ─────────────────

    def _save_report(output: dict, query: str) -> str | None:
        """Persist analysis result as a RiskReport node in Neo4j. Returns report_id."""
        if risk_engine is None or not hasattr(risk_engine, "_db"):
            return None
        try:
            report_id = f"RPT-{uuid4().hex[:8].upper()}"
            db = risk_engine._db
            cypher = """
            CREATE (r:RiskReport {
                report_id: $report_id,
                query: $query,
                executive_summary: $summary,
                overall_risk_level: $risk_level,
                risk_path_count: $path_count,
                anomaly_count: $anomaly_count,
                compliance_count: $compliance_count,
                node_count: $node_count,
                edge_count: $edge_count,
                created_at: datetime()
            })
            """
            sub = output.get("subgraph_summary", {}) or {}
            db.execute_read(
                cypher,
                {
                    "report_id": report_id,
                    "query": query[:500],
                    "summary": output.get("executive_summary", "")[:500],
                    "risk_level": output.get("overall_risk_level", "medium"),
                    "path_count": len(output.get("risk_paths", [])),
                    "anomaly_count": len(output.get("anomaly_findings", [])),
                    "compliance_count": len(output.get("compliance_matches", [])),
                    "node_count": sub.get("node_count", 0),
                    "edge_count": sub.get("edge_count", 0),
                },
            )
            logger_save = logging.getLogger("api.router.report")
            logger_save.info("Saved report %s to Neo4j", report_id)
            return report_id
        except Exception as exc:
            logger_save = logging.getLogger("api.router.report")
            logger_save.warning("Failed to save report: %s", exc)
            return None

    @app.get("/api/v1/risk/reports")
    async def list_reports(page: int = 1, risk_level: str = "", limit: int = 20):
        """List saved risk reports from Neo4j."""
        if risk_engine is None:
            return {"success": True, "data": {"reports": [], "total": 0, "page": page}}
        try:
            db = risk_engine._db
            level_filter = "WHERE r.overall_risk_level = $risk_level" if risk_level else ""
            skip = (page - 1) * limit
            cypher = f"""
            MATCH (r:RiskReport) {level_filter}
            RETURN r ORDER BY r.created_at DESC SKIP $skip LIMIT $limit
            """
            count_cypher = "MATCH (r:RiskReport) RETURN count(r) AS total"
            rows, _ = db.execute_read_with_summary(cypher, {"risk_level": risk_level, "skip": skip, "limit": limit})
            count_rows, _ = db.execute_read_with_summary(count_cypher)
            total = count_rows[0].get("total", 0) if count_rows else 0

            reports = []
            for row in rows:
                data = row.get("r", {})
                props = data.get("properties", data) if isinstance(data, dict) else {}
                reports.append({
                    "report_id": props.get("report_id", ""),
                    "query": props.get("query", ""),
                    "executive_summary": props.get("executive_summary", "")[:200],
                    "overall_risk_level": props.get("overall_risk_level", "medium"),
                    "risk_path_count": props.get("risk_path_count", 0),
                    "anomaly_count": props.get("anomaly_count", 0),
                    "compliance_count": props.get("compliance_count", 0),
                    "created_at": str(props.get("created_at", "")),
                })
            return {"success": True, "data": {"reports": reports, "total": total, "page": page}}
        except Exception as exc:
            return {"success": False, "message": f"Failed to list reports: {exc}", "data": {"reports": [], "total": 0, "page": page}}

    @app.post("/api/v1/risk/reports/export-docx")
    async def export_report_docx(req: ReportDocxExportRequest):
        """Export the current risk report as a real DOCX document."""
        try:
            from dra_ma.reporting import DocxExporter

            exporter = DocxExporter()
            report = req.report or {}
            report_id = req.report_id or report.get("report_id") or f"WIND-RPT-{uuid4().hex[:8]}"
            docx_bytes = exporter.export(
                report,
                {
                    "report_id": report_id,
                    "query_text": req.query_text or report.get("query_summary") or "",
                    "generated_at": report.get("generated_at") or "",
                },
            )
            safe_name = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in report_id)
            return Response(
                content=docx_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={
                    "Content-Disposition": f"attachment; filename={safe_name}.docx",
                    "Cache-Control": "no-store",
                },
            )
        except Exception as exc:
            _logger.exception("[ReportExport] DOCX export failed: %s", exc)
            return {"success": False, "message": f"DOCX 导出失败: {exc}"}

    @app.get("/api/v1/risk/reports/{report_id}")
    async def get_report(report_id: str):
        """Get a single saved report by ID."""
        if risk_engine is None:
            return {"success": False, "message": "引擎未初始化"}
        try:
            db = risk_engine._db
            cypher = "MATCH (r:RiskReport {report_id: $id}) RETURN r"
            rows, _ = db.execute_read_with_summary(cypher, {"id": report_id})
            if not rows:
                return {"success": False, "message": "Report not found"}
            props = rows[0].get("r", {})
            props = props.get("properties", props) if isinstance(props, dict) else {}
            return {"success": True, "data": {
                "report_id": props.get("report_id", ""),
                "query": props.get("query", ""),
                "executive_summary": props.get("executive_summary", ""),
                "overall_risk_level": props.get("overall_risk_level", "medium"),
                "risk_path_count": props.get("risk_path_count", 0),
                "anomaly_count": props.get("anomaly_count", 0),
                "compliance_count": props.get("compliance_count", 0),
                "node_count": props.get("node_count", 0),
                "edge_count": props.get("edge_count", 0),
                "created_at": str(props.get("created_at", "")),
            }}
        except Exception as exc:
            return {"success": False, "message": str(exc)}
