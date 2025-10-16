// Candidate Management Type Definitions
// This file contains all TypeScript interfaces for candidate management

export interface Candidate {
  id: string;
  date: string;
  jobCode: string;
  jobCategory?: string;
  client: string;
  clientName?: string;
  clientSpoc?: string;
  skill: string;
  source?: string;
  currentLocation?: string;
  workLocation?: string;
  location?: string;
  name: string;
  mobile: string;
  email: string;
  status: CandidateStatus;
  status1?: string;
  education?: string;
  totalEx?: string; // Total Experience
  rex?: string; // Relevant Experience
  cctc?: string; // Current CTC
  ectc?: string; // Expected CTC
  notice?: string; // Notice Period
  currentCompany?: string;
  remarks?: string;
  recruiter?: string;
  am?: string; // Account Manager
  createdAt?: string;
  updatedAt?: string;
}

export type CandidateStatus = 'Processed' | 'Not Interested' | 'No Response' | '';

export interface Status {
  id: string;
  name: string;
  dependentOptions: string[];
}

export interface Job {
  id: string;
  jobCode: string;
  title: string;
  client: string;
  clientSpoc?: string;
  skill: string;
  workLocation?: string;
  jobCategory?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  status: JobStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type JobStatus = 'Active' | 'Filled' | 'Closed';

export interface Interview {
  id: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  jobCode: string;
  jobTitle?: string;
  interviewer: string;
  interviewDate: string;
  interviewTime?: string;
  interviewType: InterviewType;
  status: InterviewStatus;
  result: InterviewResult;
  score?: number;
  feedback?: string;
  nextRound?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type InterviewType = 'Phone' | 'Video' | 'In-Person' | 'Technical' | 'HR';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type InterviewResult = 'Pass' | 'Fail' | 'Pending';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'Admin' | 'Recruiter' | 'Manager' | 'HR';

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reportType: ReportType;
  title: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  generatedBy?: string;
  generatedAt: string;
}

export type ReportType = 'Candidate' | 'Job' | 'Interview' | 'Team Performance' | 'Overview';

export interface FileAttachment {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

// Form data interfaces
export interface CandidateFormData {
  date: string;
  jobCode: string;
  client: string;
  clientSpoc: string;
  skill: string;
  source: string;
  currentLocation: string;
  workLocation: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  status1: string;
  education: string;
  totalEx: string;
  rex: string;
  cctc: string;
  ectc: string;
  notice: string;
  currentCompany: string;
  remarks: string;
  jobCategory: string;
  clientName: string;
  location: string;
  recruiter: string;
  am: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter interfaces
export interface CandidateFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: CandidateStatus;
  client?: string;
  recruiter?: string;
  jobCode?: string;
  search?: string;
}

export interface JobFilters {
  status?: JobStatus;
  client?: string;
  jobCategory?: string;
  search?: string;
}

export interface InterviewFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: InterviewStatus;
  result?: InterviewResult;
  interviewer?: string;
  jobCode?: string;
}

// Statistics interfaces
export interface CandidateStats {
  totalCandidates: number;
  processed: number;
  notInterested: number;
  noResponse: number;
  interviewsScheduled: number;
  hired: number;
  successRate: number;
}

export interface RecruitmentStats {
  totalApplications: number;
  totalHires: number;
  totalInterviews: number;
  activeJobs: number;
  clients: number;
  successRate: number;
  avgTimeToHire: number;
}

// Export/Import interfaces
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  filters?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  data: any[];
}

// Validation schemas
export const REQUIRED_CANDIDATE_FIELDS = ['name', 'email', 'mobile'] as const;
export const CANDIDATE_STATUSES = ['Processed', 'Not Interested', 'No Response'] as const;
export const JOB_STATUSES = ['Active', 'Filled', 'Closed'] as const;
export const USER_ROLES = ['Admin', 'Recruiter', 'Manager', 'HR'] as const;