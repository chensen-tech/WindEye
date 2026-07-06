export const isDevAuthBypassEnabled =
  process.env.NODE_ENV === 'development' || process.env.UMI_ENV === 'dev';

export const devAuthUser: API.CurrentUser = {
  userid: 'dev-admin',
  name: '开发管理员',
  access: 'admin',
  department: 'WindEye Dev',
  roles: [
    {
      id: 1,
      roleCode: 'admin',
      roleName: '管理员',
    },
  ],
  permissions: [
    'system:monitor:view',
    'admin:user:view',
    'admin:role:view',
    'audit:operation-log:view',
    'audit:api-log:view',
  ],
};
