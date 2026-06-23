/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.CurrentUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const permissions = new Set(currentUser?.permissions ?? []);
  const has = (code: string) => permissions.has(code);
  const isAdmin = currentUser?.access === 'admin';
  return {
    canAdmin: Boolean(currentUser && isAdmin),
    canViewSystem: isAdmin || has('system:monitor:view'),
    canManageUsers: isAdmin || has('admin:user:view'),
    canManageRoles: isAdmin || has('admin:role:view'),
    canViewAuditLogs: isAdmin || has('audit:operation-log:view'),
    canViewApiLogs: isAdmin || has('audit:api-log:view'),
  };
}
