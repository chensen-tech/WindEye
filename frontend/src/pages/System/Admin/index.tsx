import { PageContainer } from '@ant-design/pro-components';
import {
  ApiOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { systemApi } from '@/services/system';

const { Text } = Typography;

const ServiceState: React.FC<{ name: string; value?: any }> = ({ name, value }) => {
  const up = value?.status === 'up';
  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Text>{name}</Text>
      <Tag color={up ? 'success' : value?.status === 'disabled' ? 'default' : 'error'}>
        {up ? `正常 ${value?.latencyMs ?? 0}ms` : value?.status === 'disabled' ? '未启用' : '不可用'}
      </Tag>
    </Space>
  );
};

export default function SystemAdmin() {
  const [dashboard, setDashboard] = useState<any>({});
  const [health, setHealth] = useState<any>({});

  useEffect(() => {
    void Promise.all([systemApi.dashboard(), systemApi.health()]).then(([d, h]) => {
      setDashboard(d.data ?? {});
      setHealth(h.data?.services ?? {});
    });
  }, []);

  const stats = [
    ['用户总数', dashboard.users?.total ?? 0, <UserOutlined key="user" />],
    ['角色数量', dashboard.roles ?? 0, <TeamOutlined key="role" />],
    ['权限数量', dashboard.permissions ?? 0, <SafetyCertificateOutlined key="perm" />],
    ['API 调用', dashboard.api?.total ?? 0, <ApiOutlined key="api" />],
  ] as const;

  return (
    <PageContainer title="系统概览">
      <Row gutter={[16, 16]}>
        {stats.map(([title, value, icon]) => (
          <Col xs={24} sm={12} lg={6} key={title}>
            <Card size="small">
              <Statistic title={title} value={value} prefix={icon} />
            </Card>
          </Col>
        ))}
        <Col xs={24} lg={12}>
          <Card title="服务状态" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <ServiceState name="Neo4j" value={health.neo4j} />
              <ServiceState name="MySQL" value={health.mysql} />
              <ServiceState name="Redis" value={health.redis} />
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="API 运行指标" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="错误数" value={dashboard.api?.errors ?? 0} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="平均耗时"
                  value={dashboard.api?.averageLatencyMs ?? 0}
                  suffix="ms"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
