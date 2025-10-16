import { RolePermissions } from '@/types';

export const rolePermissions: Record<string, RolePermissions> = {
  admin: {
    jobs: { create: true, view: true, edit: true, delete: true },
    candidates: { create: true, view: true, edit: true, delete: true },
    team: { create: true, view: true, edit: true, delete: true },
    users: { create: true, view: true, edit: true, delete: true },
    timeTracking: { viewOwn: true, viewTeam: true, viewAll: true },
    dashboard: { viewOwn: true, viewTeam: true, viewAll: true }
  },
  'team-leader': {
    jobs: { create: true, view: true, edit: true, delete: false },
    candidates: { create: true, view: true, edit: true, delete: false },
    team: { create: false, view: true, edit: true, delete: false },
    users: { create: false, view: true, edit: false, delete: false },
    timeTracking: { viewOwn: true, viewTeam: true, viewAll: false },
    dashboard: { viewOwn: true, viewTeam: true, viewAll: false }
  },
  'account-manager': {
    jobs: { create: true, view: true, edit: true, delete: false },
    candidates: { create: true, view: true, edit: true, delete: false },
    team: { create: false, view: true, edit: false, delete: false },
    users: { create: false, view: true, edit: false, delete: false },
    timeTracking: { viewOwn: true, viewTeam: false, viewAll: false },
    dashboard: { viewOwn: true, viewTeam: false, viewAll: false }
  },
  recruiter: {
    jobs: { create: false, view: true, edit: false, delete: false },
    candidates: { create: true, view: true, edit: true, delete: false },
    team: { create: false, view: true, edit: false, delete: false },
    users: { create: false, view: false, edit: false, delete: false },
    timeTracking: { viewOwn: true, viewTeam: false, viewAll: false },
    dashboard: { viewOwn: true, viewTeam: false, viewAll: false }
  }
};

export const hasPermission = (userRole: string, module: keyof RolePermissions, action: string): boolean => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  
  const modulePermissions = permissions[module] as any;
  return modulePermissions?.[action] || false;
};

export const getViewScope = (userRole: string, module: 'timeTracking' | 'dashboard'): 'own' | 'team' | 'all' => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return 'own';
  
  const modulePermissions = permissions[module];
  if (modulePermissions.viewAll) return 'all';
  if (modulePermissions.viewTeam) return 'team';
  return 'own';
};