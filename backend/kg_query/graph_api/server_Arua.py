from flask import Flask, jsonify, request
from flask_cors import CORS  # type: ignore
from neo4j import GraphDatabase, READ_ACCESS
from neo4j.exceptions import Neo4jError, SessionExpired, ServiceUnavailable
import os
from dotenv import load_dotenv  # type: ignore
import traceback
from datetime import datetime
import time
import atexit
import signal
import sys

# 加载环境变量
load_dotenv()

# ===================================================
# Neo4j 连接管理器
# ===================================================

class Neo4jConnection:
    """Neo4j 连接管理器单例类"""
    _instance = None
    _driver = None
    
    def __new__(cls):
        # 在 Flask 重载器的子进程中，重置单例实例
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
            # 子进程：如果驱动已关闭或无效，重置实例
            if cls._instance is not None and cls._instance._driver is None:
                cls._instance = None
        
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
            cls._instance._driver = None  # 确保初始化为 None
            cls._instance._init_driver()
        return cls._instance
    
    def _init_driver(self):
        # 如果驱动已存在且有效，不重新初始化
        if self._driver is not None:
            try:
                # 快速测试连接是否有效（不指定访问模式，让驱动自动选择）
                with self._driver.session() as session:
                    session.run("RETURN 1 as test").consume()
                return  # 连接有效，不需要重新初始化
            except Exception:
                # 连接无效，需要重新初始化
                if self._driver:
                    try:
                        self._driver.close()
                    except:
                        pass
                self._driver = None
        
        try:
            uri = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "")
            if not password:
                raise RuntimeError("NEO4J_PASSWORD is required")
            
            uri = uri.replace("：", ":")
            if not uri.startswith(('neo4j+s://', 'neo4j+ssc://')):
                print("⚠️  警告: Neo4j Aura 必须使用 neo4j+s:// 或 neo4j+ssc:// 协议")
            
            # 根据 URI 协议决定是否设置 encrypted 参数
            # neo4j+s:// 和 neo4j+ssc:// 已经通过协议指定了加密，不能再设置 encrypted=True
            # 只有 neo4j:// 和 bolt:// 需要显式设置 encrypted
            driver_config = {
                'auth': (user, password),
                'max_connection_lifetime': 60,  # 连接生命周期缩短为60秒，快速释放
                'max_connection_pool_size': 10, # 连接池大小匹配 Aura 免费版上限
                'connection_acquisition_timeout': 30, # 获取连接超时缩短为30秒
                'max_transaction_retry_time': 10, # 事务重试时间（新增，避免过度重试）
            }
            
            # 本地 Neo4j 默认不使用加密，云端 Aura 使用加密协议
            if uri.startswith(('neo4j://', 'bolt://')):
                driver_config['encrypted'] = False  # 本地数据库不使用加密
            
            self._driver = GraphDatabase.driver(uri, **driver_config)
            
            # 测试连接（不指定访问模式，让驱动自动选择，Aura 免费版可能不支持读副本）
            with self._driver.session() as session:
                result = session.run("RETURN 1 as test")
                record = result.single()
                if record is None or record["test"] != 1:
                    raise Exception("连接测试失败")
            
            process_type = "子进程" if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' else "主进程"
            print(f"✅ Neo4j Aura driver initialized successfully ({process_type})")
            print(f"   URI: {uri}")
            print(f"   User: {user}")
            
        except Exception as e:
            print(f"❌ Failed to initialize Neo4j Aura driver: {e}")
            print(f"   错误详情: {traceback.format_exc()}")
            self._driver = None
        
    @property
    def driver(self):
        """获取驱动实例"""
        if self._driver is None:
            self._init_driver()
        return self._driver
    
    def close(self):
        """关闭连接"""
        if self._driver:
            try:
                self._driver.close()
            except Exception as e:
                # 忽略关闭时的错误，避免在解释器关闭时出现问题
                pass
            finally:
                self._driver = None
                print("🔒 Neo4j connection closed")
    
    
    def execute_query(self, query, parameters=None, session_config=None, access_mode=None, max_retries=2):
        """
        优化后的查询执行方法（适配并发连接）
        """
        if not self.driver:
            raise ConnectionError("Neo4j driver not initialized")
        
        last_error = None
        # 会话配置：如果指定了访问模式则使用，否则让驱动自动选择（Aura 免费版可能不支持读副本）
        final_config = session_config or {}
        if access_mode is not None:
            final_config["default_access_mode"] = access_mode
        
        for attempt in range(max_retries):
            try:
                # 驱动失效时，仅重新初始化一次（避免多线程重复初始化）
                if self._driver is None:
                    print(f"⚠️  驱动已失效，重新初始化... (尝试 {attempt + 1}/{max_retries})")
                    # 加锁：避免多线程同时初始化驱动（线程安全）
                    import threading
                    lock = threading.Lock()
                    with lock:
                        if self._driver is None: # 双重检查锁
                            self._init_driver()
                    if self._driver is None:
                        raise ConnectionError("无法重新初始化 Neo4j 驱动")
                
                # 使用会话执行查询，快速释放连接
                with self.driver.session(**final_config) as session:
                    # 执行查询并立即获取结果（缩短会话占用时间）
                    result = session.run(query, parameters or {})
                    records = list(result)  # 立即读取所有结果
                    summary = result.consume() # 显式消费结果，释放会话
                    return records
                        
            except (SessionExpired, ServiceUnavailable) as e:
                last_error = e
                print(f"⚠️  连接错误 (尝试 {attempt + 1}/{max_retries}): {e}")
                # 仅在最后一次尝试失败时关闭驱动
                if attempt == max_retries - 1 and self._driver:
                    try:
                        self._driver.close()
                    except:
                        pass
                    self._driver = None
                # 重试等待时间缩短，避免加剧拥堵
                if attempt < max_retries - 1:
                    wait_time = 1 * (attempt + 1) # 1s, 2s
                    print(f"⏳ 等待 {wait_time} 秒后重试...")
                    time.sleep(wait_time)
                    continue
                    
            except Neo4jError as e:
                print(f"❌ Neo4j query error: {e}")
                raise
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                raise
        
        raise ConnectionError(f"查询失败，已重试 {max_retries} 次: {last_error}")
# ===================================================
# Flask 应用初始化
# ===================================================

app = Flask(__name__)
CORS(app)

# 初始化 Neo4j 连接
neo4j_conn = Neo4jConnection()

# ===================================================
# 辅助函数
# ===================================================

def serialize_props(props):
    """
    将 Neo4j 节点/关系的属性转换为 JSON 可序列化的类型
    """
    if not props:
        return {}
    
    clean_props = dict(props)
    for key, value in clean_props.items():
        # 处理 Neo4j 的日期时间类型
        if hasattr(value, 'isoformat'):
            clean_props[key] = value.isoformat()
        # 处理 Neo4j 的大整数 (Int64)
        elif hasattr(value, '__int__') and not isinstance(value, (int, float, str)):
            clean_props[key] = int(value)
        # 处理列表类型中的不可序列化对象
        elif isinstance(value, list):
            clean_props[key] = [
                item.isoformat() if hasattr(item, 'isoformat') else item 
                for item in value
            ]
    return clean_props

def process_neo4j_result(result):
    """
    处理 Neo4j 查询结果，转换为前端需要的格式
    
    Args:
        result: Neo4j 查询结果（可以是 Result 对象或记录列表）
    """
    nodes = {}
    edges = []
    edge_ids = set()

    # 确保 result 是可迭代的
    if not result:
        return {"nodes": [], "edges": []}
    
    # 如果 result 是 Result 对象，转换为列表
    if hasattr(result, '__iter__') and not isinstance(result, (list, tuple)):
        result = list(result)

    for record in result:
        # 跳过非记录对象
        if not hasattr(record, 'get') and not isinstance(record, dict):
            continue
            
        # 处理节点 n 和 m
        for key in ['n', 'm', 'node']:
            try:
                # 尝试多种方式访问记录
                if hasattr(record, 'get'):
                    node = record.get(key)
                elif isinstance(record, dict):
                    node = record.get(key)
                elif hasattr(record, '__getitem__'):
                    node = record[key]
                else:
                    continue
                    
                if node and hasattr(node, 'element_id'):
                    nodes[node.element_id] = {
                        "id": node.element_id,
                        "labels": list(node.labels),
                        "properties": serialize_props(dict(node))
                    }
            except (KeyError, AttributeError, TypeError):
                continue

        # 处理关系 r (兼容单条关系和路径列表)
        for rel_key in ['r', 'rel']:
            try:
                if hasattr(record, 'get'):
                    rels = record.get(rel_key)
                elif isinstance(record, dict):
                    rels = record.get(rel_key)
                elif hasattr(record, '__getitem__'):
                    rels = record[rel_key]
                else:
                    continue
                    
                if not rels:
                    continue
                
                # 如果是多层查询，r 是一个列表；如果是单层，可能是单个关系对象
                rel_list = rels if isinstance(rels, list) else [rels]
                
                for rel in rel_list:
                    if rel and hasattr(rel, 'element_id') and rel.element_id not in edge_ids:
                        edge_data = {
                            "id": rel.element_id,
                            "source": rel.start_node.element_id,
                            "target": rel.end_node.element_id,
                            "label": rel.type,
                            "properties": serialize_props(dict(rel))
                        }
                        edges.append(edge_data)
                        edge_ids.add(rel.element_id)
            except (KeyError, AttributeError, TypeError):
                continue
    
    return {"nodes": list(nodes.values()), "edges": edges}

def safe_int(value, default=100, min_val=1, max_val=1000):
    """安全地将参数转换为整数"""
    try:
        val = int(value)
        return max(min_val, min(val, max_val))
    except (ValueError, TypeError):
        return default

# ===================================================
# 健康检查端点
# ===================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    try:
        with neo4j_conn.driver.session() as session:
            result = session.run("RETURN 1 as status")
            if result.single()["status"] == 1:
                return jsonify({
                    "status": "healthy",
                    "neo4j": "connected",
                    "timestamp": datetime.now().isoformat()
                }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "neo4j": "disconnected",
            "error": str(e)
        }), 503

# ===================================================
# 统计路由函数subject-statistics、event-statistics、layer-statistics
# ===================================================

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """获取数据库全局节点统计信息（包括所有层级的节点类型）"""
    query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['COMPANY', 'PERSON', 'PFCOMPANY', 'PFUND', 'SECURITY', 'EVENT', 'TIME', 'FEATURE', 'LAW', 'Event', 'Feature', 'Law', 'Subject'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'COMPANY' IN labels(n) THEN 1 END) AS company_count,
        count(CASE WHEN 'PERSON' IN labels(n) THEN 1 END) AS person_count,
        count(CASE WHEN 'PFCOMPANY' IN labels(n) THEN 1 END) AS pfcompany_count,
        count(CASE WHEN 'PFUND' IN labels(n) THEN 1 END) AS pfund_count,
        count(CASE WHEN 'SECURITY' IN labels(n) THEN 1 END) AS security_count,
        count(CASE WHEN 'EVENT' IN labels(n) OR 'Event' IN labels(n) THEN 1 END) AS event_count,
        count(CASE WHEN 'TIME' IN labels(n) THEN 1 END) AS time_count,
        count(CASE WHEN 'FEATURE' IN labels(n) OR 'Feature' IN labels(n) THEN 1 END) AS feature_count,
        count(CASE WHEN 'LAW' IN labels(n) OR 'Law' IN labels(n) THEN 1 END) AS law_count
    """
    try:
        result = neo4j_conn.execute_query(query)
        if result and len(result) > 0:
            record = result[0]
            # Neo4j 记录对象需要用 dict() 转换或通过键访问
            data = dict(record)
            return jsonify({
                "total": data.get("total_nodes", 0),
                "details": [
                    {"label": "企业", "value": data.get("company_count", 0), "type": "COMPANY"},
                    {"label": "自然人", "value": data.get("person_count", 0), "type": "PERSON"},
                    {"label": "基金公司", "value": data.get("pfcompany_count", 0), "type": "PFCOMPANY"},
                    {"label": "基金", "value": data.get("pfund_count", 0), "type": "PFUND"},
                    {"label": "证券", "value": data.get("security_count", 0), "type": "SECURITY"},
                    {"label": "事件", "value": data.get("event_count", 0), "type": "EVENT"},
                    {"label": "时间", "value": data.get("time_count", 0), "type": "TIME"},
                    {"label": "特征", "value": data.get("feature_count", 0), "type": "FEATURE"},
                    {"label": "法规", "value": data.get("law_count", 0), "type": "LAW"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/subject-statistics', methods=['GET'])
def get_subject_statistics():
    """获取主体层中各类节点的统计信息（企业、自然人、私募公司、私募基金、证券）"""
    query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['COMPANY','PERSON','PFCOMPANY','PFUND','SECURITY'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'COMPANY' IN labels(n) THEN 1 END) AS company_count,
        count(CASE WHEN 'PERSON' IN labels(n) THEN 1 END) AS person_count,
        count(CASE WHEN 'PFCOMPANY' IN labels(n) THEN 1 END) AS pfcompany_count,
        count(CASE WHEN 'PFUND' IN labels(n) THEN 1 END) AS pfund_count,
        count(CASE WHEN 'SECURITY' IN labels(n) THEN 1 END) AS security_count
    """
    try:
        result = neo4j_conn.execute_query(query)
        if result and len(result) > 0:
            record = result[0]
            data = dict(record)
            return jsonify({
                "total": data.get("total_nodes", 0),
                "details": [
                    {"label": "企业", "value": data.get("company_count", 0), "type": "COMPANY"},
                    {"label": "自然人", "value": data.get("person_count", 0), "type": "PERSON"},
                    {"label": "私募公司", "value": data.get("pfcompany_count", 0), "type": "PFCOMPANY"},
                    {"label": "私募基金", "value": data.get("pfund_count", 0), "type": "PFUND"},
                    {"label": "证券", "value": data.get("security_count", 0), "type": "SECURITY"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Subject statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/event-statistics', methods=['GET'])
def get_event_statistics():
    """获取事件层中各类节点的统计信息(COMPANY、PERSON、TIME、EVENT、REGULATOR)"""
    query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['Event'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'COMPANY' IN labels(n) THEN 1 END) AS company_count,
        count(CASE WHEN 'PERSON' IN labels(n) THEN 1 END) AS person_count,
        count(CASE WHEN 'TIME' IN labels(n) THEN 1 END) AS time_count,
        count(CASE WHEN 'EVENT' IN labels(n) THEN 1 END) AS event_count,
        count(CASE WHEN 'REGULATOR' IN labels(n) THEN 1 END) AS regulator_count
    """
    try:
        result = neo4j_conn.execute_query(query)
        if result and len(result) > 0:
            record = result[0]
            data = dict(record)
            return jsonify({
                "total": data.get("total_nodes", 0),
                "details": [
                    {"label": "企业", "value": data.get("company_count", 0), "type": "COMPANY"},
                    {"label": "自然人", "value": data.get("person_count", 0), "type": "PERSON"},
                    {"label": "时间", "value": data.get("time_count", 0), "type": "TIME"},
                    {"label": "事件", "value": data.get("event_count", 0), "type": "EVENT"},
                    {"label": "监管机构", "value": data.get("regulator_count", 0), "type": "REGULATOR"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Event statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/feature-statistics', methods=['GET'])
def get_feature_statistics():
    """获取特征层中各类节点的统计信息(Riskfeature、Riskfactor)"""
    query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['Feature'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'Riskfeature' IN labels(n) THEN 1 END) AS riskfeature_count,
        count(CASE WHEN 'Riskfactor' IN labels(n) THEN 1 END) AS riskfactor_count
    """
    try:
        result = neo4j_conn.execute_query(query)
        if result and len(result) > 0:
            record = result[0]
            data = dict(record)
            return jsonify({
                "total": data.get("total_nodes", 0),
                "details": [
                    {"label": "风险特征", "value": data.get("riskfeature_count", 0), "type": "Riskfeature"},
                    {"label": "风险因子", "value": data.get("riskfactor_count", 0), "type": "Riskfactor"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Feature statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/regulation-statistics', methods=['GET'])
def get_regulation_statistics():
    """获取法规层中各类节点的统计信息(Regulation、Law)"""
    query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['Regulation'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'Regulation' IN labels(n) THEN 1 END) AS regulation_count,
        count(CASE WHEN 'Law' IN labels(n) THEN 1 END) AS law_count
    """
    try:
        result = neo4j_conn.execute_query(query)
        if result and len(result) > 0:
            record = result[0]
            data = dict(record)
            return jsonify({
                "total": data.get("total_nodes", 0),
                "details": [
                    {"label": "法规", "value": data.get("regulation_count", 0), "type": "Regulation"},
                    {"label": "法律", "value": data.get("law_count", 0), "type": "Law"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Regulation statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/layer-statistics', methods=['GET'])
def get_layer_statistics():
    """获取各层级的节点统计信息（公司、事件、时间、风险特征、风险因子、法规）"""
    # 查询节点统计
    node_query = """
    MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN ['COMPANY','EVENT','TIME','RiskFeature','RiskFactor','Action'])
    RETURN 
        count(n) AS total_nodes,
        count(CASE WHEN 'COMPANY' IN labels(n) THEN 1 END) AS company_count,
        count(CASE WHEN 'EVENT' IN labels(n) THEN 1 END) AS event_count,
        count(CASE WHEN 'TIME' IN labels(n) THEN 1 END) AS time_count,
        count(CASE WHEN 'RiskFeature' IN labels(n) THEN 1 END) AS riskfeature_count,
        count(CASE WHEN 'RiskFactor' IN labels(n) THEN 1 END) AS riskfactor_count,
        count(CASE WHEN 'Action' IN labels(n) THEN 1 END) AS action_count
    """
    
    # 查询总关系数
    rel_query = """
    MATCH ()-[r]->()
    RETURN count(r) AS total_relationships
    """
    
    try:
        node_result = neo4j_conn.execute_query(node_query)
        rel_result = neo4j_conn.execute_query(rel_query)
        
        if node_result and len(node_result) > 0:
            node_data = dict(node_result[0])
            rel_data = dict(rel_result[0]) if rel_result and len(rel_result) > 0 else {}
            
            return jsonify({
                "total": node_data.get("total_nodes", 0),
                "total_relationships": rel_data.get("total_relationships", 0),
                "details": [
                    {"label": "公司", "value": node_data.get("company_count", 0), "type": "COMPANY"},
                    {"label": "事件", "value": node_data.get("event_count", 0), "type": "EVENT"},
                    {"label": "时间", "value": node_data.get("time_count", 0), "type": "TIME"},
                    {"label": "风险特征", "value": node_data.get("riskfeature_count", 0), "type": "RiskFeature"},
                    {"label": "风险因子", "value": node_data.get("riskfactor_count", 0), "type": "RiskFactor"},
                    {"label": "法规行为", "value": node_data.get("action_count", 0), "type": "Action"}
                ]
            }), 200
        return jsonify({"error": "No data found"}), 404
    except Exception as e:
        app.logger.error(f"Layer statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/detailed-statistics', methods=['GET'])
def get_detailed_statistics():
    """获取四个层次的详细统计信息（节点总数、节点类型数、节点类型列表、关系总数、关系类型数、关系类型列表）"""
    try:
        layers_stats = []
        
        # 主体层统计 (Subject)
        # 分两个查询：一个查节点，一个查关系
        subject_node_query = """
        MATCH (n)
        WHERE 'Subject' IN labels(n)
        RETURN 
            count(n) AS node_count,
            collect(DISTINCT labels(n)) AS node_types
        """
        subject_rel_query = """
        MATCH (n)-[r]-(m)
        WHERE 'Subject' IN labels(n) AND 'Subject' IN labels(m)
        RETURN 
            count(DISTINCT r) AS rel_count,
            collect(DISTINCT type(r)) AS rel_types
        """
        
        subject_node_result = neo4j_conn.execute_query(subject_node_query)
        subject_rel_result = neo4j_conn.execute_query(subject_rel_query)
        
        if subject_node_result and len(subject_node_result) > 0:
            node_data = dict(subject_node_result[0])
            rel_data = dict(subject_rel_result[0]) if subject_rel_result and len(subject_rel_result) > 0 else {}
            
            # 展平节点类型列表
            node_types = []
            for labels_list in node_data.get("node_types", []):
                node_types.extend([label for label in labels_list if label != 'Subject'])
            node_types = list(set(node_types))
            
            layers_stats.append({
                "layer": "主体层",
                "layer_code": "Subject",
                "node_count": node_data.get("node_count", 0),
                "node_type_count": len(node_types),
                "node_types": node_types,
                "rel_count": rel_data.get("rel_count", 0),
                "rel_type_count": len(rel_data.get("rel_types", [])),
                "rel_types": rel_data.get("rel_types", [])
            })
        
        # 事件层统计 (Event)
        event_node_query = """
        MATCH (n)
        WHERE 'Event' IN labels(n)
        RETURN 
            count(n) AS node_count,
            collect(DISTINCT labels(n)) AS node_types
        """
        event_rel_query = """
        MATCH (n)-[r]-(m)
        WHERE 'Event' IN labels(n) AND 'Event' IN labels(m)
        RETURN 
            count(DISTINCT r) AS rel_count,
            collect(DISTINCT type(r)) AS rel_types
        """
        
        event_node_result = neo4j_conn.execute_query(event_node_query)
        event_rel_result = neo4j_conn.execute_query(event_rel_query)
        
        if event_node_result and len(event_node_result) > 0:
            node_data = dict(event_node_result[0])
            rel_data = dict(event_rel_result[0]) if event_rel_result and len(event_rel_result) > 0 else {}
            
            node_types = []
            for labels_list in node_data.get("node_types", []):
                node_types.extend([label for label in labels_list if label != 'Event'])
            node_types = list(set(node_types))
            
            layers_stats.append({
                "layer": "事件层",
                "layer_code": "Event",
                "node_count": node_data.get("node_count", 0),
                "node_type_count": len(node_types),
                "node_types": node_types,
                "rel_count": rel_data.get("rel_count", 0),
                "rel_type_count": len(rel_data.get("rel_types", [])),
                "rel_types": rel_data.get("rel_types", [])
            })
        
        # 特征层统计 (Feature)
        feature_node_query = """
        MATCH (n)
        WHERE 'Feature' IN labels(n)
        RETURN 
            count(n) AS node_count,
            collect(DISTINCT labels(n)) AS node_types
        """
        feature_rel_query = """
        MATCH (n)-[r]-(m)
        WHERE 'Feature' IN labels(n) AND 'Feature' IN labels(m)
        RETURN 
            count(DISTINCT r) AS rel_count,
            collect(DISTINCT type(r)) AS rel_types
        """
        
        feature_node_result = neo4j_conn.execute_query(feature_node_query)
        feature_rel_result = neo4j_conn.execute_query(feature_rel_query)
        
        if feature_node_result and len(feature_node_result) > 0:
            node_data = dict(feature_node_result[0])
            rel_data = dict(feature_rel_result[0]) if feature_rel_result and len(feature_rel_result) > 0 else {}
            
            node_types = []
            for labels_list in node_data.get("node_types", []):
                node_types.extend([label for label in labels_list if label != 'Feature'])
            node_types = list(set(node_types))
            
            layers_stats.append({
                "layer": "特征层",
                "layer_code": "Feature",
                "node_count": node_data.get("node_count", 0),
                "node_type_count": len(node_types),
                "node_types": node_types,
                "rel_count": rel_data.get("rel_count", 0),
                "rel_type_count": len(rel_data.get("rel_types", [])),
                "rel_types": rel_data.get("rel_types", [])
            })
        
        # 法规层统计 (Regulation)
        regulation_node_query = """
        MATCH (n)
        WHERE 'Regulation' IN labels(n)
        RETURN 
            count(n) AS node_count,
            collect(DISTINCT labels(n)) AS node_types
        """
        regulation_rel_query = """
        MATCH (n)-[r]-(m)
        WHERE 'Regulation' IN labels(n) AND 'Regulation' IN labels(m)
        RETURN 
            count(DISTINCT r) AS rel_count,
            collect(DISTINCT type(r)) AS rel_types
        """
        
        regulation_node_result = neo4j_conn.execute_query(regulation_node_query)
        regulation_rel_result = neo4j_conn.execute_query(regulation_rel_query)
        
        if regulation_node_result and len(regulation_node_result) > 0:
            node_data = dict(regulation_node_result[0])
            rel_data = dict(regulation_rel_result[0]) if regulation_rel_result and len(regulation_rel_result) > 0 else {}
            
            node_types = []
            for labels_list in node_data.get("node_types", []):
                node_types.extend([label for label in labels_list if label != 'Regulation'])
            node_types = list(set(node_types))
            
            layers_stats.append({
                "layer": "法规层",
                "layer_code": "Regulation",
                "node_count": node_data.get("node_count", 0),
                "node_type_count": len(node_types),
                "node_types": node_types,
                "rel_count": rel_data.get("rel_count", 0),
                "rel_type_count": len(rel_data.get("rel_types", [])),
                "rel_types": rel_data.get("rel_types", [])
            })
        
        return jsonify({
            "success": True,
            "layers": layers_stats
        }), 200
        
    except Exception as e:
        app.logger.error(f"Detailed statistics error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/test-db', methods=['GET'])
def test_database():
    """测试数据库连接并返回节点标签统计"""
    try:
        # 查询所有节点的标签
        query = """
        MATCH (n)
        RETURN DISTINCT labels(n) AS labels, count(n) AS count
        ORDER BY count DESC
        LIMIT 20
        """
        result = neo4j_conn.execute_query(query)
        
        labels_info = []
        for record in result:
            labels_info.append({
                "labels": dict(record).get("labels", []),
                "count": dict(record).get("count", 0)
            })
        
        # 查询总节点数和总关系数
        total_query = """
        MATCH (n)
        OPTIONAL MATCH ()-[r]->()
        RETURN count(DISTINCT n) AS total_nodes, count(DISTINCT r) AS total_rels
        """
        total_result = neo4j_conn.execute_query(total_query)
        total_data = dict(total_result[0]) if total_result and len(total_result) > 0 else {}
        
        return jsonify({
            "success": True,
            "total_nodes": total_data.get("total_nodes", 0),
            "total_relationships": total_data.get("total_rels", 0),
            "label_distribution": labels_info
        }), 200
    except Exception as e:
        app.logger.error(f"Test DB error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

# ===================================================
# 查询路由函数
# ===================================================

@app.route("/api/graph", methods=["GET"])
def get_graph():
    """
    获取图谱数据
    - layer=all 或未指定: 查询所有层的节点和跨层级关系(GeneralPage)
    - layer=Subject: 只查询主体层节点和主体类型之间的关系(SubjectPage)
    - layer=Event: 只查询事件层节点和事件类型之间的关系(EventPage)
    - layer=Feature: 只查询特征层节点和特征类型之间的关系(FeaturePage)
    - layer=Regulation: 只查询法规层节点和法规类型之间的关系(RegulationPage)
    """
    relation_type = request.args.get('relationType', '').strip()
    layer = request.args.get('layer', 'all').strip()  # 默认查询所有层
    limit = safe_int(request.args.get('limit', 100), default=100, max_val=500)
    
    try:
        rel_filter = f":`{relation_type}`" if relation_type else ""
        
        if layer == 'Subject':
            # SubjectPage: 先区分Subject层，再查询具体节点类型之间的关系
            query = f"""
            MATCH (n)-[r{rel_filter}]-(m)
            WHERE n <> m
              AND any(label IN labels(n) WHERE label IN [
                'COMPANY', 'PERSON', 'PFCOMPANY', 'PFUND', 'SECURITY'
              ])
              AND any(label IN labels(m) WHERE label IN [
                'COMPANY', 'PERSON', 'PFCOMPANY', 'PFUND', 'SECURITY'
              ])
            RETURN n, r, m
            LIMIT {limit}
            """
        elif layer == 'Event':
            # EventPage: 先区分Event层，再查询具体节点类型之间的关系
            query = f"""
            MATCH (n)-[r{rel_filter}]-(m)
            WHERE n <> m
              AND 'Event' IN labels(n)
              AND 'Event' IN labels(m)
              AND any(label IN labels(n) WHERE label IN [
                'COMPANY', 'PERSON', 'TIME', 'EVENT', 'REGULATOR'
              ])
              AND any(label IN labels(m) WHERE label IN [
                'COMPANY', 'PERSON', 'TIME', 'EVENT', 'REGULATOR'
              ])
            RETURN n, r, m
            LIMIT {limit}
            """
        elif layer == 'Feature':
            # FeaturePage: 只查询特征层节点，以及特征类型之间的关系
            query = f"""
            MATCH (n)-[r{rel_filter}]-(m)
            WHERE n <> m
              AND any(label IN labels(n) WHERE label IN [
                'Riskfeature', 'Riskfactor', 'Feature'
              ])
              AND any(label IN labels(m) WHERE label IN [
                'Riskfeature', 'Riskfactor', 'Feature'
              ])
            RETURN n, r, m
            LIMIT {limit}
            """
        elif layer == 'Regulation':
            # RegulationPage: 只查询法规层节点，以及法规类型之间的关系
            query = f"""
            MATCH (n)-[r{rel_filter}]-(m)
            WHERE n <> m
              AND any(label IN labels(n) WHERE label IN [
                'Regulation', 'Law'
              ])
              AND any(label IN labels(m) WHERE label IN [
                'Regulation', 'Law'
              ])
            RETURN n, r, m
            LIMIT {limit}
            """
        else:
            # GeneralPage: 简化查询，直接获取所有有关系的节点
            query = f"""
            MATCH (n)-[r{rel_filter}]-(m)
            WHERE n <> m
              AND (
                'Subject' IN labels(n) OR 'Event' IN labels(n) OR 'Feature' IN labels(n) OR 'Regulation' IN labels(n)
                OR 'COMPANY' IN labels(n) OR 'EVENT' IN labels(n) OR 'RiskFeature' IN labels(n) OR 'Action' IN labels(n)
              )
              AND (
                'Subject' IN labels(m) OR 'Event' IN labels(m) OR 'Feature' IN labels(m) OR 'Regulation' IN labels(m)
                OR 'COMPANY' IN labels(m) OR 'EVENT' IN labels(m) OR 'RiskFeature' IN labels(m) OR 'Action' IN labels(m)
              )
            RETURN DISTINCT n, r, m
            LIMIT {limit}
            """
        
        result = neo4j_conn.execute_query(query)
        app.logger.info(f"Graph query - layer:{layer}, relationType:{relation_type or 'all'}, limit:{limit}, result_count:{len(result)}")
        
        return jsonify(process_neo4j_result(result)), 200
    except Exception as e:
        app.logger.error(f"Graph query error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/search", methods=["GET"])
def search_graph():
    """
    高级搜索接口：支持关键词搜索或根据筛选条件查询
    - layer=all 或未指定: 查询所有层的节点和跨层级关系（GeneralPage）
    - layer=Subject: 只查询主体层节点和主体类型之间的关系（SubjectPage）
    - layer=Event: 只查询事件层节点和事件类型之间的关系（EventPage）
    - layer=Feature: 只查询特征层节点和特征类型之间的关系（FeaturePage）
    - layer=Regulation: 只查询法规层节点和法规类型之间的关系（RegulationPage）
    """
    keyword = request.args.get('q', '').strip()
    target_node_type = request.args.get('nodeType', '').strip()
    rel_type = request.args.get('relType', '').strip()
    layer = request.args.get('layer', 'all').strip()  # 默认查询所有层
    layers = safe_int(request.args.get('layers', 1), default=1, max_val=3)
    limit = safe_int(request.args.get('limit', 100), default=100, max_val=500)

    try:
        # 根据层级确定节点标签过滤条件
        if layer == 'Subject':
            # SubjectPage: 只查询主体层节点
            layer_labels = ['COMPANY', 'PERSON', 'PFCOMPANY', 'PFUND', 'SECURITY', 'Subject']
            default_center_label = 'Subject'
        elif layer == 'Event':
            # EventPage: 只查询事件层节点
            layer_labels = ['COMPANY', 'PERSON', 'TIME', 'EVENT', 'REGULATOR', 'Event']
            default_center_label = 'Event'
        elif layer == 'Feature':
            # FeaturePage: 只查询特征层节点
            layer_labels = ['Riskfeature', 'Riskfactor', 'Feature']
            default_center_label = 'Feature'
        elif layer == 'Regulation':
            # RegulationPage: 只查询法规层节点
            layer_labels = ['Regulation', 'Law']
            default_center_label = 'Regulation'
        else:
            # GeneralPage: 查询所有层的节点
            layer_labels = ['Subject','Event','Feature', 'Regulation']
            default_center_label = 'General'
        
        # 构建动态约束
        rel_constraint = f":{rel_type}" if rel_type else ""
        node_label_constraint = f":{target_node_type}" if target_node_type else ""
        
        # 构建层级过滤条件（用于路径查询）
        layer_filter = " AND any(label IN labels(node) WHERE label IN " + str(layer_labels).replace("'", "`") + ")"
        layer_filter_m = " AND any(label IN labels(m) WHERE label IN " + str(layer_labels).replace("'", "`") + ")"
        
        # 如果没有关键词，但有其他筛选条件，随机选择符合条件的节点作为起点
        if not keyword:
            # 如果没有筛选条件，返回空结果
            if not target_node_type and not rel_type:
                return jsonify({"nodes": [], "edges": []}), 200
            
            # 随机选择一个符合条件的中心节点（根据层级选择）
            layer_labels_str = ', '.join([f"'{l}'" for l in layer_labels])
            if rel_type:
                # 如果指定了关系类型，优先选择有该关系类型的节点
                center_query = f"""
                MATCH (n)-[r:{rel_type}]-(m)
                WHERE EXISTS((n)--())
                  AND any(label IN labels(n) WHERE label IN [{layer_labels_str}])
                WITH DISTINCT n, rand() AS r
                ORDER BY r
                LIMIT 1
                RETURN n
                """
            elif target_node_type:
                # 如果指定了节点类型，选择该类型的节点
                center_query = f"""
                MATCH (n:{target_node_type})
                WHERE EXISTS((n)--())
                  AND any(label IN labels(n) WHERE label IN [{layer_labels_str}])
                WITH n, rand() AS r
                ORDER BY r
                LIMIT 1
                RETURN n
                """
            else:
                # 否则随机选择指定层级的节点
                center_query = f"""
                MATCH (n)
                WHERE any(label IN labels(n) WHERE label IN [{layer_labels_str}])
                  AND EXISTS((n)--())
                WITH n, rand() AS r
                ORDER BY r
                LIMIT 1
                RETURN n
                """
            
            center_result = neo4j_conn.execute_query(center_query)
            if not center_result or len(center_result) == 0:
                return jsonify({"nodes": [], "edges": []}), 200
            
            center_node = center_result[0]['n']
            center_node_id = center_node.element_id
            
            # 以随机中心节点为起点查询（添加层级过滤）
            layer_labels_cypher = ', '.join([f"'{l}'" for l in layer_labels])
            query = f"""
            MATCH (n)
            WHERE elementId(n) = $center_id
            WITH n
            MATCH path = (n)-[r{rel_constraint}*1..{layers}]-(m{node_label_constraint})
            WHERE any(label IN labels(m) WHERE label IN [{layer_labels_cypher}])
            UNWIND nodes(path) AS node
            WITH node, path
            WHERE any(label IN labels(node) WHERE label IN [{layer_labels_cypher}])
            UNWIND relationships(path) AS rel
            RETURN DISTINCT node, rel
            LIMIT {limit}
            """
            
            app.logger.info(f"🎲 [筛选查询] layer:{layer}, 中心节点ID: {center_node_id}, 节点类型: {target_node_type or '全部'}, 关系类型: {rel_type or '全部'}, 层级: {layers}, 限制: {limit}")
            
            result = neo4j_conn.execute_query(query, {"center_id": center_node_id})
        else:
            # 有关键词，使用关键词搜索
            if layer == 'all' or layer == '':
                # GeneralPage: 通过公司名称搜索，展示完整的 5 层路径（COMPANY → EVENT → RiskFeature → RiskFactor → Action）
                rel_filter = f":`{rel_type}`" if rel_type else ""
                query = f"""
                MATCH (company:COMPANY)
                WHERE (company.COMPANY_NM CONTAINS $keyword OR company.name CONTAINS $keyword)
                WITH collect(company) AS companies
                UNWIND companies AS company
                MATCH (company)-[r1{rel_filter}]-(event)
                WHERE event <> company
                  AND 'EVENT' IN labels(event)
                WITH 
                  companies,
                  collect(DISTINCT event) AS events,
                  collect(DISTINCT {{ n: company, r: r1, m: event }}) AS rel_company_event
                UNWIND events AS event
                MATCH (event)-[r2{rel_filter}]-(rf)
                WHERE rf <> event
                  AND 'RiskFeature' IN labels(rf) 
                WITH 
                  companies,
                  events,
                  collect(DISTINCT rf) AS riskFeatures,
                  rel_company_event,
                  collect(DISTINCT {{ n: event, r: r2, m: rf }}) AS rel_event_rf
                UNWIND riskFeatures AS rf
                MATCH (rf)-[r3{rel_filter}]-(rfa)
                WHERE rfa <> rf
                  AND 'RiskFactor' IN labels(rfa)
                WITH 
                  companies,
                  events,
                  riskFeatures,
                  collect(DISTINCT rfa) AS riskFactors,
                  rel_company_event,
                  rel_event_rf,
                  collect(DISTINCT {{ n: rf, r: r3, m: rfa }}) AS rel_rf_rfa
                UNWIND riskFactors AS rfa
                MATCH (rfa)-[r4{rel_filter}]-(act)
                WHERE act <> rfa
                  AND 'Action' IN labels(act)
                WITH 
                  rel_company_event,
                  rel_event_rf,
                  rel_rf_rfa,
                  collect(DISTINCT {{ n: rfa, r: r4, m: act }}) AS rel_rfa_act
                // 合并所有关系并展开为 (n, r, m)
                // 使用 coalesce 处理空列表，避免合并时出错
                UNWIND (coalesce(rel_company_event, []) + coalesce(rel_event_rf, []) + coalesce(rel_rf_rfa, []) + coalesce(rel_rfa_act, [])) AS rel
                RETURN DISTINCT rel.n AS n, rel.r AS r, rel.m AS m
                LIMIT {limit}
                """
                
                app.logger.info(f"🔍 [GeneralPage 公司搜索] keyword:{keyword}, relType:{rel_type or '全部'}, limit:{limit}")
                
                result = neo4j_conn.execute_query(query, {"keyword": keyword})
            else:
                # 其他页面的关键词搜索（保持原有逻辑）
                layer_labels_cypher = ', '.join([f"'{l}'" for l in layer_labels])
                query = f"""
                MATCH (n)
                WHERE (n.PERSON_NM CONTAINS $keyword OR n.COMPANY_NM CONTAINS $keyword OR n.name CONTAINS $keyword)
                  AND any(label IN labels(n) WHERE label IN [{layer_labels_cypher}])
                WITH n
                MATCH path = (n)-[r{rel_constraint}*1..{layers}]-(m{node_label_constraint})
                WHERE any(label IN labels(m) WHERE label IN [{layer_labels_cypher}])
                UNWIND nodes(path) AS node
                WITH node, path
                WHERE any(label IN labels(node) WHERE label IN [{layer_labels_cypher}])
                UNWIND relationships(path) AS rel
                RETURN DISTINCT node, rel
                LIMIT {limit}
                """
                
                app.logger.info(f"🔍 [关键词搜索] layer:{layer}, keyword:{keyword}, nodeType:{target_node_type or '全部'}, relType:{rel_type or '全部'}, layers:{layers}, limit:{limit}")
                
                result = neo4j_conn.execute_query(query, {"keyword": keyword})
        
        return jsonify(process_neo4j_result(result)), 200

    except Exception as e:
        app.logger.error(f"Search error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/search-all-layers", methods=["GET"])
def search_all_layers():
    """
    全层级搜索接口：根据节点名称查询，向上追溯所有上层，向下查询所有下层，每层支持横向穿透
    - q: 节点名称关键词
    - layers: 穿透层级（1-4层）
    """
    keyword = request.args.get('q', '').strip()
    layers = safe_int(request.args.get('layers', 1), default=1, max_val=4)
    limit = safe_int(request.args.get('limit', 200), default=200, max_val=500)

    if not keyword:
        return jsonify({"nodes": [], "edges": []}), 200

    try:
        # 横向穿透：在同层内穿透（可经过其他层），纵向穿透：向所有其他层扩展
        full_query = f"""
        // 1. 找到中心节点
        MATCH (center)
        WHERE (center.name CONTAINS $keyword 
           OR center.title CONTAINS $keyword
           OR center.COMPANY_NM CONTAINS $keyword
           OR center.id CONTAINS $keyword
           OR center.factor_nm CONTAINS $keyword
           OR center.feature_nm CONTAINS $keyword)
        WITH center
        LIMIT 10
        
        // 2. 获取中心节点的层级标签
        WITH center,
             [label IN labels(center) WHERE label IN ['Subject', 'Event', 'Feature', 'Regulation']][0] AS center_layer
        
        // 3. 横向穿透：找到同层的其他节点（最短路径<=N跳）
        OPTIONAL MATCH peer_path = (center)-[*1..{layers}]-(peer)
        WHERE center <> peer
          AND any(label IN labels(peer) WHERE label = center_layer)
        WITH center, center_layer, peer, peer_path
        WITH center, center_layer, peer,
             min(length(peer_path)) AS min_path_len
        WHERE min_path_len <= {layers}
        WITH center, center_layer,
             [center] + collect(DISTINCT peer) AS base_nodes
        
        // 4. 从每个基础节点纵向追溯
        UNWIND base_nodes AS base_node
        OPTIONAL MATCH vertical_path = (base_node)-[*1]-(vertical_node)
        WHERE base_node <> vertical_node
          AND NOT any(label IN labels(vertical_node) WHERE label = center_layer)
        WITH base_nodes, center_layer, vertical_node, vertical_path
        
        // 从vertical_node继续向下：排除其他主事件（title包含'主事件'且不为NULL）
        OPTIONAL MATCH deep_path = (vertical_node)-[*1..10]-(deep_node)
        WHERE vertical_node <> deep_node
          AND NOT any(label IN labels(deep_node) WHERE label = center_layer)
          AND NOT (deep_node.title IS NOT NULL AND deep_node.title CONTAINS '主事件')
        WITH base_nodes,
             collect(DISTINCT vertical_node) + collect(DISTINCT deep_node) AS vertical_nodes,
             collect(DISTINCT vertical_path) + collect(DISTINCT deep_path) AS vertical_paths
        
        // 5. 收集横向穿透的路径
        UNWIND base_nodes AS bn1
        UNWIND base_nodes AS bn2
        OPTIONAL MATCH horizontal_path = shortestPath((bn1)-[*1..{layers}]-(bn2))
        WHERE bn1 <> bn2
        WITH base_nodes, vertical_nodes, vertical_paths,
             collect(DISTINCT horizontal_path) AS horizontal_paths
        
        // 6. 合并节点和路径
        WITH base_nodes + vertical_nodes AS all_nodes,
             horizontal_paths + vertical_paths AS all_paths
        
        UNWIND all_nodes AS node
        WITH collect(DISTINCT node)[0..{limit}] AS final_nodes, all_paths
        
        UNWIND all_paths AS path
        WITH final_nodes, path
        WHERE path IS NOT NULL
        UNWIND relationships(path) AS rel
        WITH final_nodes, collect(DISTINCT rel) AS all_rels
        
        UNWIND all_rels AS rel
        WITH final_nodes, rel
        WHERE startNode(rel) IN final_nodes AND endNode(rel) IN final_nodes
        WITH final_nodes, collect(DISTINCT rel) AS final_rels
        
        RETURN final_nodes AS nodes, final_rels AS edges
        """
        
        result = neo4j_conn.execute_query(full_query, {"keyword": keyword})
        
        if not result or len(result) == 0:
            return jsonify({"nodes": [], "edges": []}), 200
        
        record = dict(result[0])
        nodes_data = record.get('nodes', [])
        edges_data = record.get('edges', [])
        
        # 格式化节点数据
        nodes = []
        for node in nodes_data:
            if node is None:
                continue
            node_dict = dict(node)
            nodes.append({
                "id": node.element_id,
                "labels": list(node.labels),
                "properties": node_dict
            })
        
        # 格式化关系数据
        edges = []
        for edge in edges_data:
            if edge is None:
                continue
            edges.append({
                "id": edge.element_id,
                "source": edge.start_node.element_id,
                "target": edge.end_node.element_id,
                "label": edge.type,
                "properties": dict(edge)
            })
        
        return jsonify({"nodes": nodes, "edges": edges}), 200
        
    except Exception as e:
        app.logger.error(f"Search all layers error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/subgraph/<node_id>', methods=['GET'])
def get_subgraph(node_id):
    """
    获取指定节点的子图
    - layer=Subject: 查询与主体层节点的关系
    - layer=Event: 查询与事件层节点的关系
    - layer=Feature: 查询与特征层节点的关系
    - layer=Regulation: 查询与法规层节点的关系
    - layer=all 或未指定: 查询与所有层节点的关系（GeneralPage）
    """
    layer = request.args.get('layer', 'all').strip()
    limit = safe_int(request.args.get('limit', 50), default=50, max_val=200)
    
    app.logger.info(f"Subgraph request - node_id:{node_id}, layer:{layer}, limit:{limit}")
    
    try:
        if layer == 'Subject':
            # SubjectPage: 查询与主体层节点的关系
            query = """
            MATCH (n)-[r]-(m)
            WHERE elementId(n) = $id
              AND any(label IN labels(m) WHERE label IN [
                'COMPANY', 'PERSON', 'PFCOMPANY', 'PFUND', 'SECURITY', 'Subject'
              ])
            RETURN n, r, m
            LIMIT $limit
            """
        elif layer == 'Event':
            # EventPage: 查询与事件层节点的关系
            query = """
            MATCH (n)-[r]-(m)
            WHERE elementId(n) = $id
              AND any(label IN labels(m) WHERE label IN [
                'COMPANY', 'PERSON', 'TIME', 'EVENT', 'REGULATOR', 'Event'
              ])
            RETURN n, r, m
            LIMIT $limit
            """
        elif layer == 'Feature':
            # FeaturePage: 查询与特征层节点的关系
            query = """
            MATCH (n)-[r]-(m)
            WHERE elementId(n) = $id
              AND any(label IN labels(m) WHERE label IN [
                'Riskfeature', 'Riskfactor', 'Feature'
              ])
            RETURN n, r, m
            LIMIT $limit
            """
        elif layer == 'Regulation':
            # RegulationPage: 查询与法规层节点的关系
            query = """
            MATCH (n)-[r]-(m)
            WHERE elementId(n) = $id
              AND any(label IN labels(m) WHERE label IN [
                'Regulation', 'Law'
              ])
            RETURN n, r, m
            LIMIT $limit
            """
        else:
            # GeneralPage: 查询与所有层节点的关系
            query = """
            MATCH (n)-[r]-(m)
            WHERE elementId(n) = $id
              AND any(label IN labels(m) WHERE label IN [
                'Subject', 'Event', 'Feature', 'Regulation'
              ])
            RETURN n, r, m
            LIMIT $limit
            """
        
        result = neo4j_conn.execute_query(query, {"id": node_id, "limit": limit})
        return jsonify(process_neo4j_result(result)), 200
            
    except Exception as e:
        app.logger.error(f"Subgraph error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

# ===================================================
# 登录相关 Mock API（用于前端框架）
# ===================================================

@app.route('/api/currentUser', methods=['GET'])
def get_current_user():
    """获取当前用户信息（Mock）"""
    return jsonify({
        "success": True,
        "data": {
            "name": "Neo4j User",
            "avatar": "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
            "userid": "00000001",
            "email": "user@neo4j.com",
            "signature": "知识图谱管理员",
            "title": "管理员",
            "group": "Neo4j-Group",
            "tags": [
                {"key": "0", "label": "很有想法的"},
                {"key": "1", "label": "专注设计"},
                {"key": "2", "label": "辣~"},
                {"key": "3", "label": "大长腿"},
                {"key": "4", "label": "川妹子"},
                {"key": "5", "label": "海纳百川"}
            ],
            "notifyCount": 12,
            "unreadCount": 11,
            "country": "China",
            "access": "admin",
            "geographic": {
                "province": {"label": "浙江省", "key": "330000"},
                "city": {"label": "杭州市", "key": "330100"}
            },
            "address": "西湖区工专路 77 号",
            "phone": "0752-268888888"
        }
    }), 200

@app.route('/api/login/account', methods=['POST'])
def login_account():
    """用户登录（Mock）"""
    data = request.get_json() or {}
    username = data.get('username', '')
    password = data.get('password', '')
    
    # Mock 登录验证（任何用户名密码都可以登录）
    if username and password:
        return jsonify({
            "success": True,
            "data": {
                "status": "ok",
                "type": "account",
                "currentAuthority": "admin"
            }
        }), 200
    else:
        return jsonify({
            "success": False,
            "errorMessage": "用户名或密码不能为空"
        }), 400

@app.route('/api/login/outLogin', methods=['POST'])
def logout():
    """用户登出（Mock）"""
    return jsonify({
        "success": True,
        "data": {}
    }), 200


# ===================================================
# 知识图谱构建 API (写操作)
# ===================================================

@app.route('/api/node', methods=['POST'])
def create_node():
    """创建节点"""
    data = request.get_json() or {}
    labels = data.get('labels', [])
    properties = data.get('properties', {})

    if not labels or not properties:
        return jsonify({"success": False, "error": "labels and properties are required"}), 400

    try:
        db = Neo4jConnection()
        label_str = ':'.join(labels)
        props_str = ', '.join([f"n.{k} = ${k}" for k in properties.keys()])
        query = f"MERGE (n:{label_str} {{id: $id}}) SET {props_str} RETURN n"
        params = {**properties}
        if 'id' not in params:
            import uuid
            params['id'] = str(uuid.uuid4())

        records = db.execute_query(query, params)
        return jsonify({"success": True, "message": "Node created", "node_id": params.get('id')}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/node/<node_id>', methods=['PUT'])
def update_node(node_id):
    """更新节点属性"""
    data = request.get_json() or {}
    properties = data.get('properties', {})

    if not properties:
        return jsonify({"success": False, "error": "properties are required"}), 400

    try:
        db = Neo4jConnection()
        set_clauses = [f"n.{k} = ${k}" for k in properties.keys()]
        query = f"MATCH (n {{id: $node_id}}) SET {', '.join(set_clauses)} RETURN n"
        params = {"node_id": node_id, **properties}

        records = db.execute_query(query, params)
        if not records:
            return jsonify({"success": False, "error": "Node not found"}), 404
        return jsonify({"success": True, "message": "Node updated"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/node/<node_id>', methods=['DELETE'])
def delete_node(node_id):
    """删除节点及其所有关系"""
    try:
        db = Neo4jConnection()
        query = "MATCH (n {id: $node_id}) DETACH DELETE n"
        db.execute_query(query, {"node_id": node_id})
        return jsonify({"success": True, "message": "Node deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/edge', methods=['POST'])
def create_edge():
    """创建关系（边）"""
    data = request.get_json() or {}
    source_id = data.get('source_id')
    target_id = data.get('target_id')
    rel_type = data.get('rel_type')
    properties = data.get('properties', {})

    if not source_id or not target_id or not rel_type:
        return jsonify({"success": False, "error": "source_id, target_id, and rel_type are required"}), 400

    try:
        db = Neo4jConnection()
        if properties:
            props_str = '{' + ', '.join([f"{k}: ${k}" for k in properties.keys()]) + '}'
            query = f"MATCH (a {{id: $source_id}}), (b {{id: $target_id}}) MERGE (a)-[r:{rel_type}]->(b) SET r = {props_str} RETURN r"
        else:
            query = f"MATCH (a {{id: $source_id}}), (b {{id: $target_id}}) MERGE (a)-[r:{rel_type}]->(b) RETURN r"

        params = {"source_id": source_id, "target_id": target_id, **properties}
        records = db.execute_query(query, params)
        return jsonify({"success": True, "message": "Edge created"}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/nodes/batch', methods=['POST'])
def batch_create_nodes():
    """批量创建节点"""
    data = request.get_json() or {}
    nodes = data.get('nodes', [])

    if not nodes:
        return jsonify({"success": False, "error": "nodes array is required"}), 400

    try:
        db = Neo4jConnection()
        import uuid
        created = 0
        for node in nodes:
            labels = node.get('labels', [])
            properties = node.get('properties', {})
            if not labels or not properties:
                continue

            label_str = ':'.join(labels)
            props_str = ', '.join([f"n.{k} = ${k}" for k in properties.keys()])
            query = f"MERGE (n:{label_str} {{id: $id}}) SET {props_str}"
            params = {**properties}
            if 'id' not in params:
                params['id'] = str(uuid.uuid4())

            db.execute_query(query, params)
            created += 1

        return jsonify({"success": True, "message": f"{created} nodes created"}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===================================================
# 错误处理器
# ===================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ===================================================
# 应用生命周期管理
# ===================================================

def cleanup_neo4j_connection():
    """清理 Neo4j 连接的辅助函数"""
    try:
        if neo4j_conn and neo4j_conn._driver:
            neo4j_conn.close()
    except Exception:
        pass  # 忽略清理时的错误

# 注册退出时的清理函数
atexit.register(cleanup_neo4j_connection)

# 注册信号处理器（用于优雅关闭）
def signal_handler(signum, frame):
    """处理退出信号"""
    cleanup_neo4j_connection()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@app.teardown_appcontext
def shutdown_session(exception=None):
    """应用关闭时清理资源"""
    # 不在每个请求结束时关闭连接，保持连接池活跃
    pass

# ===================================================
# 启动服务
# ===================================================

if __name__ == "__main__":
    # 应用启动时初始化
    print("=" * 50)
    print("🚀 Neo4j 知识图谱后端服务启动")
    print("📍 地址: http://localhost:5000")
    print("=" * 50)
    
    # 检查 Neo4j 连接
    if neo4j_conn.driver is None:
        print("❌ Neo4j 连接失败，无法启动服务")
        sys.exit(1)
    
    # 在重载器父进程中，注册清理函数
    # Flask 的重载器会创建子进程，父进程在重载时会关闭
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        # 这是父进程（重载器进程），在重载时关闭连接
        atexit.register(cleanup_neo4j_connection)
    # 子进程的连接会在单例类中自动初始化
    
    try:
        app.run(
            host="0.0.0.0", 
            port=5000, 
            debug=True,
            threaded=True,
            use_reloader=True
        )
    except KeyboardInterrupt:
        print("\n⚠️  收到中断信号，正在关闭...")
    finally:
        # 确保应用退出时关闭数据库连接
        cleanup_neo4j_connection()
