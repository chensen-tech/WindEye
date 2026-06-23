import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Checkbox, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { systemApi } from '@/services/system';

export default function SystemRoles() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [role, setRole] = useState<any>();
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    void systemApi.permissions().then((res) => setPermissions(res.data ?? []));
  }, []);

  const columns: ProColumns<any>[] = [
    { title: '角色编码', dataIndex: 'roleCode' },
    { title: '角色名称', dataIndex: 'roleName' },
    { title: '说明', dataIndex: 'description' },
    { title: '用户数', dataIndex: 'userCount', search: false },
    { title: '权限数', dataIndex: 'permissionCount', search: false },
    {
      title: '操作',
      valueType: 'option',
      render: (_, row) => [
        <Button
          key="permissions"
          type="link"
          onClick={async () => {
            const res = await systemApi.rolePermissions(row.id);
            setSelected(res.data?.permissionIds ?? []);
            setRole(row);
          }}
        >
          配置权限
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer title="角色管理">
      <ProTable
        rowKey="id"
        search={false}
        columns={columns}
        request={async () => {
          const res = await systemApi.roles();
          return { data: res.data, success: res.success };
        }}
      />
      <Modal
        title={`配置权限 - ${role?.roleName ?? ''}`}
        open={Boolean(role)}
        width={720}
        onCancel={() => setRole(undefined)}
        onOk={async () => {
          await systemApi.setRolePermissions(role.id, selected);
          message.success('角色权限已更新');
          setRole(undefined);
        }}
      >
        <Checkbox.Group
          value={selected}
          onChange={(values) => setSelected(values.map(Number))}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}
          options={permissions.map((item) => ({
            label: `${item.permName} (${item.permCode})`,
            value: item.id,
          }))}
        />
      </Modal>
    </PageContainer>
  );
}
