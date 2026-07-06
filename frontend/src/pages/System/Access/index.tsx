import {
  ApiOutlined,
  AuditOutlined,
  DashboardOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import React from 'react';

const { Text, Title } = Typography;

const permissionNames: Record<string, string> = {
  'system:monitor:view': '查看系统概览',
  'admin:user:view': '查看用户',
  'admin:user:create': '创建用户',
  'admin:user:update': '修改用户',
  'admin:user:disable': '启用或禁用用户',
  'admin:user:delete': '删除用户',
  'admin:role:view': '查看角色与权限',
  'admin:role:assign': '分配角色权限',
  'graph:search:view': '查询知识图谱',
  'graph:search:export': '导出图谱',
  'graph:expand:view': '展开图谱节点',
  'governance:report:create': '生成治理报告',
  'governance:report:export': '导出治理报告',
  'audit:operation-log:view': '查看操作日志',
  'audit:api-log:view': '查看 API 日志',
  'data:upload': '上传数据',
  'pipeline:manage': '管理采集流水线',
};

const operations = [
  {
    title: '用户管理',
    description: '创建账号、分配角色、启用或禁用用户',
    icon: <UserOutlined />,
    path: '/system/users',
    color: '#2563eb',
  },
  {
    title: '角色管理',
    description: '查看角色并配置角色权限集合',
    icon: <TeamOutlined />,
    path: '/system/roles',
    color: '#0f766e',
  },
  {
    title: '权限清单',
    description: '检查页面、按钮、API 和数据权限',
    icon: <KeyOutlined />,
    path: '/system/permissions',
    color: '#7c3aed',
  },
  {
    title: '操作审计',
    description: '追踪用户操作与数据变更记录',
    icon: <AuditOutlined />,
    path: '/system/audit-logs',
    color: '#b45309',
  },
  {
    title: 'API 日志',
    description: '查看调用状态、耗时、错误和 Trace ID',
    icon: <ApiOutlined />,
    path: '/system/api-logs',
    color: '#be123c',
  },
  {
    title: '系统概览',
    description: '查看服务状态和权限系统运行指标',
    icon: <DashboardOutlined />,
    path: '/system/admin',
    color: '#334155',
  },
];

export default function AccessOverview() {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const permissions = currentUser?.permissions ?? [];
  const roles = currentUser?.roles ?? [];

  return (
    <PageContainer
      title="权限概览"
      subTitle="当前账号身份、授权范围与管理入口"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card size="small" title="当前账号">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="用户">
                {currentUser?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="账号 ID">
                {currentUser?.userid || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                {currentUser?.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="身份">
                <Tag color={currentUser?.access === 'admin' ? 'red' : 'blue'}>
                  {currentUser?.access === 'admin' ? '管理员' : currentUser?.access || '普通用户'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                {roles.length ? (
                  <Space size={[4, 4]} wrap>
                    {roles.map((role) => (
                      <Tag key={role.id} color="geekblue">
                        {role.roleName}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">开发模式身份</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card
            size="small"
            title="已授予权限"
            extra={<Tag color="blue">{permissions.length} 项</Tag>}
          >
            {permissions.length ? (
              <Space size={[8, 8]} wrap>
                {permissions.map((permission) => (
                  <Tag key={permission} color="processing">
                    {permissionNames[permission] || permission}
                    <Text type="secondary" style={{ marginLeft: 6, fontSize: 11 }}>
                      {permission}
                    </Text>
                  </Tag>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="当前账号尚未加载权限码"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24, marginBottom: 12 }}>
        权限管理操作
      </Title>
      <Row gutter={[16, 16]}>
        {operations.map((item) => (
          <Col xs={24} sm={12} xl={8} key={item.path}>
            <Card size="small" hoverable onClick={() => history.push(item.path)}>
              <Space align="start" size={12}>
                <span style={{ color: item.color, fontSize: 22 }}>{item.icon}</span>
                <div>
                  <Text strong>{item.title}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.description}
                    </Text>
                  </div>
                  <Button type="link" size="small" style={{ padding: 0, marginTop: 4 }}>
                    进入
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
