export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'team-leader' | 'account-manager';
  teamId?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string[];
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  resume?: string;
  notes?: string;
  createdBy: string;
  teamId: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  code: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Active' | 'Paused' | 'Closed';
  description: string;
  requirements: string[];
  salary?: string;
  createdBy: string;
  teamId: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface RolePermissions {
  jobs: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  candidates: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  team: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  users: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  timeTracking: {
    viewOwn: boolean;
    viewTeam: boolean;
    viewAll: boolean;
  };
  dashboard: {
    viewOwn: boolean;
    viewTeam: boolean;
    viewAll: boolean;
  };
}