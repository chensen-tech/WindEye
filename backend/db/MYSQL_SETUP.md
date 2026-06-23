# WindEye MySQL 初始化

当前用户、权限和审计功能使用以下 8 张核心表：

| 表名 | 用途 |
|------|------|
| `sys_user` | 用户账号、密码哈希、状态、登录信息 |
| `sys_role` | 管理员、分析师、审核员、只读用户 |
| `sys_permission` | 页面、按钮、API、数据权限 |
| `sys_user_role` | 用户与角色的多对多关联 |
| `sys_role_permission` | 角色与权限的多对多关联 |
| `sys_operation_log` | 登录、用户修改、角色授权等操作审计 |
| `sys_api_log` | API 路径、状态码、耗时、Trace ID、错误信息 |
| `sys_config` | Token、密码、锁定和日志留存配置 |

## 一键初始化

在 `backend` 目录运行：

```powershell
python -m db.initialize --database user --user root
```

脚本会隐藏输入：

1. MySQL 登录密码。
2. WindEye 管理员初始密码。
3. 管理员初始密码确认。

脚本可重复执行，不会重复创建角色或权限。重复执行时会更新管理员密码和权限矩阵。

## 后端连接配置

初始化成功后，在 `backend/.env` 中加入：

```env
MYSQL_ENABLED=true
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码
MYSQL_DATABASE=user

AUTH_MODE=enforce
JWT_SECRET=至少32字节的随机字符串
REDIS_ENABLED=false

AUDIT_API_LOG_ENABLED=true
AUDIT_OPERATION_LOG_ENABLED=true
```

重启后端后，前端的用户管理、角色管理、权限清单、操作日志和 API 日志将自动使用 MySQL，不再使用开发模式内存数据。
