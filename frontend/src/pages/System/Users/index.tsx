import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Select, Space, Tag, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { systemApi } from '@/services/system';

export default function SystemUsers() {
  const actionRef = useRef<ActionType | null>(null);
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    void systemApi.roles().then((res) => setRoles(res.data ?? []));
  }, []);

  const columns: ProColumns<any>[] = [
    { title: '用户名', dataIndex: 'username' },
    { title: '姓名', dataIndex: 'realName', search: false },
    { title: '部门', dataIndex: 'department', search: false },
    {
      title: '角色',
      dataIndex: 'roles',
      search: false,
      render: (_, row) => row.roles?.map((role: any) => (
        <Tag key={role.id}>{role.roleName}</Tag>
      )),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        0: { text: '禁用', status: 'Default' },
        1: { text: '启用', status: 'Success' },
        2: { text: '锁定', status: 'Error' },
      },
    },
    { title: '最近登录', dataIndex: 'lastLoginAt', valueType: 'dateTime', search: false },
    {
      title: '操作',
      valueType: 'option',
      render: (_, row) => [
        <Button
          key="status"
          type="link"
          size="small"
          onClick={async () => {
            await systemApi.updateUserStatus(row.id, row.status === 1 ? 0 : 1);
            message.success(row.status === 1 ? '用户已禁用' : '用户已启用');
            actionRef.current?.reload();
          }}
        >
          {row.status === 1 ? '禁用' : '启用'}
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer title="用户管理">
      <ProTable
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await systemApi.users({
            page: params.current,
            pageSize: params.pageSize,
            keyword: params.username,
            status: params.status,
          });
          return { data: res.data, total: res.total, success: res.success };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新建用户
          </Button>,
        ]}
      />
      <Modal
        title="新建用户"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          await systemApi.createUser(values);
          message.success('用户已创建');
          form.resetFields();
          setOpen(false);
          actionRef.current?.reload();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true, min: 8 }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Space style={{ width: '100%' }} align="start">
            <Form.Item name="realName" label="姓名"><Input /></Form.Item>
            <Form.Item name="department" label="部门"><Input /></Form.Item>
          </Space>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select
              mode="multiple"
              options={roles.map((role) => ({ label: role.roleName, value: role.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
