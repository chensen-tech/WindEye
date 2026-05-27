// ============================================================================
// BiDA-KG Schema Extensions — 风控业务闭环节点
// Version: 1.0
//
// Usage: Run against Neo4j Browser or cypher-shell:
//   :source schema_extensions.cypher
// ============================================================================

// ---------------------------------------------------------------------------
// Section 1: Unique constraints (primary keys)
// ---------------------------------------------------------------------------

// RiskReport — 自动生成的风险报告
CREATE CONSTRAINT risk_report_id_unique IF NOT EXISTS
FOR (r:RiskReport) REQUIRE r.report_id IS UNIQUE;

// WorkflowTicket — 协同治理工单
CREATE CONSTRAINT ticket_id_unique IF NOT EXISTS
FOR (t:WorkflowTicket) REQUIRE t.ticket_id IS UNIQUE;

// AuditLog — 操作审计日志
CREATE CONSTRAINT audit_log_id_unique IF NOT EXISTS
FOR (a:AuditLog) REQUIRE a.log_id IS UNIQUE;

// ---------------------------------------------------------------------------
// Section 2: Property indexes
// ---------------------------------------------------------------------------

// RiskReport full-text index (title + summary)
CREATE FULLTEXT INDEX reportFtIdx IF NOT EXISTS
FOR (r:RiskReport) ON EACH [r.title, r.summary]
OPTIONS {indexConfig: {`fulltext.analyzer`: 'simple'}};

// WorkflowTicket indexes
CREATE INDEX ticketStatusIdx IF NOT EXISTS
FOR (t:WorkflowTicket) ON (t.status);

CREATE INDEX ticketCreatedIdx IF NOT EXISTS
FOR (t:WorkflowTicket) ON (t.created_at);

// AuditLog timestamp index
CREATE INDEX auditLogTimestampIdx IF NOT EXISTS
FOR (a:AuditLog) ON (a.timestamp);

// ---------------------------------------------------------------------------
// Section 3: Business closure relationship types (documentation)
//
// These relations are discovered dynamically by the DRA-MA Probe at query time.
// No explicit creation needed — they are created at data ingestion time.
//
//   (:WorkflowTicket)-[:REFERENCES]->(:RiskReport)   工单关联报告
//   (:WorkflowTicket)-[:INVOLVES]->(:COMPANY)        工单关联主体
//   (:RiskReport)-[:ANALYZES]->(:COMPANY)            报告分析对象
//   (:AuditLog)-[:LOGGED_BY]->(:WorkflowTicket)      日志关联工单
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Utility: Verify all new constraints and indexes are online
// ---------------------------------------------------------------------------
// SHOW CONSTRAINTS YIELD name, type, entityType, state
// WHERE entityType IN ['RiskReport', 'WorkflowTicket', 'AuditLog']
// RETURN name, type, state;
//
// SHOW INDEXES YIELD name, type, state
// WHERE name IN ['reportFtIdx', 'ticketStatusIdx', 'ticketCreatedIdx', 'auditLogTimestampIdx']
// RETURN name, type, state;
