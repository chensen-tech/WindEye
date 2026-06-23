-- WindEye 用户权限与审计日志系统 — 数据库初始化脚本
-- 使用方法: mysql -u root -p < schema.sql
-- 或: mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS windeye DEFAULT CHARSET utf8mb4;"
--      mysql -u root -p windeye < schema.sql

CREATE DATABASE IF NOT EXISTS windeye DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE windeye;

-- ============================================================
-- 1. sys_user — 系统用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_user (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    username            VARCHAR(64)     NOT NULL,
    password_hash       VARCHAR(256)    NOT NULL COMMENT 'bcrypt hash',
    real_name           VARCHAR(64)     DEFAULT NULL COMMENT '真实姓名',
    email               VARCHAR(128)    DEFAULT NULL,
    phone               VARCHAR(32)     DEFAULT NULL,
    avatar              VARCHAR(512)    DEFAULT NULL,
    department          VARCHAR(128)    DEFAULT NULL COMMENT '部门',
    status              TINYINT         NOT NULL DEFAULT 1 COMMENT '1=active 0=disabled 2=locked',
    failed_login_count  TINYINT         NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
    locked_until        DATETIME        DEFAULT NULL COMMENT '锁定到期时间',
    last_login_at       DATETIME        DEFAULT NULL,
    last_login_ip       VARCHAR(64)     DEFAULT NULL,
    password_updated_at DATETIME        DEFAULT NULL COMMENT '最近修改密码时间',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          BIGINT          DEFAULT NULL COMMENT '创建者 user_id',
    updated_by          BIGINT          DEFAULT NULL COMMENT '修改者 user_id',
    deleted             TINYINT         NOT NULL DEFAULT 0 COMMENT '0=正常 1=已删除',

    UNIQUE INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================================
-- 2. sys_role — 角色表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_role (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    role_code   VARCHAR(64)     NOT NULL COMMENT 'admin / analyst / auditor / readonly',
    role_name   VARCHAR(128)    NOT NULL COMMENT '管理员 / 分析师 / 审核员 / 只读用户',
    description TEXT            DEFAULT NULL,
    sort_order  INT             NOT NULL DEFAULT 0,
    status      TINYINT         NOT NULL DEFAULT 1 COMMENT '1=active 0=disabled',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================================
-- 3. sys_permission — 权限表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_permission (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    perm_code       VARCHAR(128)    NOT NULL COMMENT 'module:resource:action',
    perm_name       VARCHAR(256)    NOT NULL COMMENT '权限中文名称',
    perm_type       VARCHAR(16)     NOT NULL COMMENT 'page / button / api / data',
    parent_id       BIGINT          DEFAULT NULL COMMENT '父权限ID，用于树形结构',
    resource_path   VARCHAR(512)    DEFAULT NULL COMMENT 'API路径或前端路由',
    http_method     VARCHAR(32)     DEFAULT NULL COMMENT 'GET/POST/PUT/PATCH/DELETE/*',
    sort_order      INT             NOT NULL DEFAULT 0,
    status          TINYINT         NOT NULL DEFAULT 1 COMMENT '1=active 0=disabled',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_perm_code (perm_code),
    INDEX idx_perm_type (perm_type),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ============================================================
-- 4. sys_role_permission — 角色-权限关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_role_permission (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    role_id         BIGINT      NOT NULL,
    permission_id   BIGINT      NOT NULL,
    created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_role_perm (role_id, permission_id),
    INDEX idx_rp_role_id (role_id),
    INDEX idx_rp_perm_id (permission_id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES sys_permission(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

-- ============================================================
-- 5. sys_user_role — 用户-角色关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_user_role (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    role_id     BIGINT      NOT NULL,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_user_role (user_id, role_id),
    INDEX idx_ur_user_id (user_id),
    INDEX idx_ur_role_id (role_id),
    FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';

-- ============================================================
-- 6. sys_operation_log — 操作审计日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_operation_log (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    trace_id        VARCHAR(64)     DEFAULT NULL COMMENT '关联 API 调用日志',
    user_id         BIGINT          DEFAULT NULL COMMENT '操作人 user_id',
    username        VARCHAR(64)     DEFAULT NULL COMMENT '冗余字段，保留历史用户名',
    operation_type  VARCHAR(64)     NOT NULL COMMENT 'LOGIN/LOGOUT/CREATE_USER/...',
    operation_name  VARCHAR(128)    DEFAULT NULL COMMENT '操作中文描述',
    resource_type   VARCHAR(64)     DEFAULT NULL COMMENT 'user/role/permission/report/config/data',
    resource_id     VARCHAR(128)    DEFAULT NULL COMMENT '操作对象标识',
    request_method  VARCHAR(16)     DEFAULT NULL,
    request_path    VARCHAR(512)    DEFAULT NULL,
    ip_address      VARCHAR(64)     DEFAULT NULL,
    user_agent      VARCHAR(512)    DEFAULT NULL,
    before_data     JSON            DEFAULT NULL COMMENT '变更前快照（脱敏后）',
    after_data      JSON            DEFAULT NULL COMMENT '变更后快照（脱敏后）',
    result          VARCHAR(16)     NOT NULL DEFAULT 'SUCCESS' COMMENT 'SUCCESS / FAILURE',
    error_message   TEXT            DEFAULT NULL,
    duration_ms     INT             DEFAULT NULL COMMENT '操作耗时',
    created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_ol_user_id (user_id),
    INDEX idx_ol_operation_type (operation_type),
    INDEX idx_ol_created_at (created_at),
    INDEX idx_ol_trace_id (trace_id),
    INDEX idx_ol_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志表';

-- ============================================================
-- 7. sys_api_log — API 调用日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_api_log (
    id                BIGINT          AUTO_INCREMENT PRIMARY KEY,
    trace_id          VARCHAR(64)     DEFAULT NULL,
    user_id           BIGINT          DEFAULT NULL,
    username          VARCHAR(64)     DEFAULT NULL,
    method            VARCHAR(16)     NOT NULL COMMENT 'GET/POST/PUT/PATCH/DELETE',
    path              VARCHAR(512)    NOT NULL COMMENT '请求路径',
    query_string      VARCHAR(1024)   DEFAULT NULL,
    status_code       INT             NOT NULL,
    success           TINYINT         NOT NULL DEFAULT 1 COMMENT '0=错误(4xx/5xx) 1=成功',
    latency_ms        INT             NOT NULL COMMENT '请求耗时（毫秒）',
    ip_address        VARCHAR(64)     DEFAULT NULL,
    user_agent        VARCHAR(512)    DEFAULT NULL,
    request_summary   JSON            DEFAULT NULL COMMENT '请求摘要（脱敏后）',
    response_summary  JSON            DEFAULT NULL COMMENT '响应摘要',
    error_code        VARCHAR(64)     DEFAULT NULL COMMENT '业务错误码',
    error_message     TEXT            DEFAULT NULL COMMENT '错误信息',
    created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_al_trace_id (trace_id),
    INDEX idx_al_user_id (user_id),
    INDEX idx_al_path (path(255)),
    INDEX idx_al_status_code (status_code),
    INDEX idx_al_created_at (created_at),
    INDEX idx_al_latency_ms (latency_ms),
    INDEX idx_al_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API调用日志表';

-- ============================================================
-- 8. sys_config — 系统配置表
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_config (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    config_key      VARCHAR(128)    NOT NULL,
    config_value    TEXT            NOT NULL,
    description     VARCHAR(512)    DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- ============================================================
-- 初始数据：角色
-- ============================================================
INSERT INTO sys_role (role_code, role_name, description, sort_order) VALUES
('admin',    '管理员',   '全部系统权限，可管理用户、角色、配置', 1),
('analyst',  '分析师',   '可查询图谱、运行分析、导出报告、上传数据', 2),
('auditor',  '审核员',   '只读访问全部数据，可查看操作日志和API日志', 3),
('readonly', '只读用户', '只读访问图谱查询和报告查看，不可导出', 4)
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- ============================================================
-- 初始数据：系统配置
-- ============================================================
INSERT INTO sys_config (config_key, config_value, description) VALUES
('jwt.access_expire_minutes', '120', 'JWT access token 过期时间（分钟）'),
('jwt.refresh_expire_days', '7', 'JWT refresh token 过期时间（天）'),
('login.max_fail_count', '5', '登录失败最大次数'),
('login.lock_duration_minutes', '30', '账号锁定时长（分钟）'),
('password.min_length', '8', '密码最小长度'),
('password.expire_days', '90', '密码过期天数'),
('password.history_count', '5', '密码历史不可重复数量'),
('log.retention_days', '180', '日志留存天数'),
('log.slow_request_ms', '3000', '慢请求阈值（毫秒）'),
('audit.api_log_enabled', 'true', '是否启用 API 调用日志'),
('audit.operation_log_enabled', 'true', '是否启用操作审计日志')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value);
