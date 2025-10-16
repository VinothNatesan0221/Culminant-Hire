export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: {
    [key: string]: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  createdBy: string;
  permissions: RolePermissions['permissions'];
}

export const SYSTEM_PERMISSIONS: Permission[] = [
  // Dashboard Permissions
  { id: 'dashboard', name: 'Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
  
  // Candidate Management
  { id: 'candidates', name: 'Candidates', description: 'Manage candidate records', category: 'Candidates' },
  { id: 'candidate_export', name: 'Export Candidates', description: 'Export candidate data', category: 'Candidates' },
  { id: 'candidate_bulk_upload', name: 'Bulk Upload Candidates', description: 'Upload multiple candidates', category: 'Candidates' },
  
  // Job Management
  { id: 'jobs', name: 'Jobs', description: 'Manage job postings', category: 'Jobs' },
  { id: 'job_export', name: 'Export Jobs', description: 'Export job data', category: 'Jobs' },
  
  // Interview Management
  { id: 'interviews', name: 'Interviews', description: 'Manage interviews', category: 'Interviews' },
  { id: 'interview_schedule', name: 'Schedule Interviews', description: 'Schedule new interviews', category: 'Interviews' },
  
  // Team Management
  { id: 'team', name: 'Team Members', description: 'Manage team members', category: 'Team' },
  
  // Time Tracking
  { id: 'time_tracking', name: 'Time Tracking', description: 'Access time tracking features', category: 'Time' },
  
  // Admin Functions
  { id: 'users', name: 'User Management', description: 'Manage system users', category: 'Admin' },
  { id: 'roles', name: 'Role Management', description: 'Manage roles and permissions', category: 'Admin' },
  { id: 'announcements', name: 'Announcements', description: 'Manage system announcements', category: 'Admin' },
  { id: 'email_logs', name: 'Email Logs', description: 'View email logs', category: 'Admin' },
  
  // Reports
  { id: 'reports', name: 'Reports', description: 'Access reporting features', category: 'Reports' }
];

export const DEFAULT_ROLES: CustomRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    isSystem: true,
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    permissions: SYSTEM_PERMISSIONS.reduce((acc, perm) => ({
      ...acc,
      [perm.id]: { view: true, add: true, edit: true, delete: true }
    }), {})
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management level access',
    isSystem: true,
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    permissions: {
      dashboard: { view: true, add: false, edit: false, delete: false },
      candidates: { view: true, add: true, edit: true, delete: false },
      candidate_export: { view: true, add: false, edit: false, delete: false },
      candidate_bulk_upload: { view: true, add: true, edit: false, delete: false },
      jobs: { view: true, add: true, edit: true, delete: false },
      job_export: { view: true, add: false, edit: false, delete: false },
      interviews: { view: true, add: true, edit: true, delete: false },
      interview_schedule: { view: true, add: true, edit: false, delete: false },
      team: { view: true, add: false, edit: false, delete: false },
      time_tracking: { view: true, add: false, edit: false, delete: false },
      reports: { view: true, add: false, edit: false, delete: false }
    }
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    description: 'Recruitment focused access',
    isSystem: true,
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    permissions: {
      dashboard: { view: true, add: false, edit: false, delete: false },
      candidates: { view: true, add: true, edit: true, delete: false },
      candidate_export: { view: true, add: false, edit: false, delete: false },
      jobs: { view: true, add: false, edit: false, delete: false },
      interviews: { view: true, add: true, edit: true, delete: false },
      interview_schedule: { view: true, add: true, edit: false, delete: false },
      time_tracking: { view: true, add: false, edit: false, delete: false }
    }
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    permissions: {
      dashboard: { view: true, add: false, edit: false, delete: false },
      candidates: { view: true, add: false, edit: false, delete: false },
      jobs: { view: true, add: false, edit: false, delete: false },
      interviews: { view: true, add: false, edit: false, delete: false },
      team: { view: true, add: false, edit: false, delete: false }
    }
  }
];