export type Permission =
  | 'dashboard.view'
  | 'users.view'
  | 'users.manage'
  | 'users.activate'
  | 'users.ban'
  | 'deposits.view'
  | 'deposits.approve'
  | 'withdrawals.view'
  | 'withdrawals.approve'
  | 'investments.view'
  | 'investments.manage'
  | 'plan.view'
  | 'plan.edit'
  | 'rewards.view'
  | 'rewards.edit'
  | 'deposit_methods.view'
  | 'deposit_methods.manage'
  | 'support.view'
  | 'support.manage'
  | 'audit_logs.view'
  | 'admins.view'
  | 'admins.manage';

export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE',
  'USER_MANAGER',
  'PLAN_EDITOR',
  'SUPPORT',
  'VIEWER',
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard.view',
    'users.view',
    'users.manage',
    'users.activate',
    'users.ban',
    'deposits.view',
    'deposits.approve',
    'withdrawals.view',
    'withdrawals.approve',
    'investments.view',
    'investments.manage',
    'plan.view',
    'plan.edit',
    'rewards.view',
    'rewards.edit',
    'deposit_methods.view',
    'deposit_methods.manage',
    'support.view',
    'support.manage',
    'audit_logs.view',
    'admins.view',
    'admins.manage',
  ],
  ADMIN: [
    'dashboard.view',
    'users.view',
    'users.manage',
    'users.activate',
    'deposits.view',
    'deposits.approve',
    'withdrawals.view',
    'withdrawals.approve',
    'investments.view',
    'investments.manage',
    'plan.view',
    'rewards.view',
    'deposit_methods.view',
    'support.view',
    'support.manage',
    'audit_logs.view',
  ],
  FINANCE: [
    'dashboard.view',
    'deposits.view',
    'deposits.approve',
    'withdrawals.view',
    'withdrawals.approve',
    'investments.view',
  ],
  USER_MANAGER: [
    'dashboard.view',
    'users.view',
    'users.manage',
    'users.activate',
    'users.ban',
    'support.view',
    'support.manage',
  ],
  PLAN_EDITOR: [
    'dashboard.view',
    'plan.view',
    'plan.edit',
    'rewards.view',
    'rewards.edit',
    'investments.view',
  ],
  SUPPORT: [
    'dashboard.view',
    'users.view',
    'support.view',
    'support.manage',
  ],
  VIEWER: [
    'dashboard.view',
    'users.view',
    'deposits.view',
    'withdrawals.view',
    'investments.view',
    'plan.view',
    'rewards.view',
  ],
};

export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export function hasPermission(role: string, permission: Permission): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[role as AdminRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function getRolePermissions(role: string): Permission[] {
  if (role === 'SUPER_ADMIN') return ROLE_PERMISSIONS.SUPER_ADMIN;
  return ROLE_PERMISSIONS[role as AdminRole] || [];
}
