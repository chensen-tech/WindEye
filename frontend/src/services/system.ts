import { request } from '@umijs/max';

export const systemApi = {
  dashboard: () => request('/api/v1/admin/dashboard'),
  health: () => request('/api/v1/admin/health'),
  users: (params: Record<string, any>) =>
    request('/api/v1/admin/users', { params }),
  createUser: (data: Record<string, any>) =>
    request('/api/v1/admin/users', { method: 'POST', data }),
  updateUserStatus: (id: number, status: number) =>
    request(`/api/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      data: { status },
    }),
  roles: () => request('/api/v1/admin/roles'),
  rolePermissions: (id: number) =>
    request(`/api/v1/admin/roles/${id}/permissions`),
  setRolePermissions: (id: number, permissionIds: number[]) =>
    request(`/api/v1/admin/roles/${id}/permissions`, {
      method: 'PUT',
      data: { permissionIds },
    }),
  permissions: () => request('/api/v1/admin/permissions'),
  auditLogs: (params: Record<string, any>) =>
    request('/api/v1/admin/audit-logs', { params }),
  apiLogs: (params: Record<string, any>) =>
    request('/api/v1/admin/api-logs', { params }),
};
