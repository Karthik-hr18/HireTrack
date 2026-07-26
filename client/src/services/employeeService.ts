import { ApplicationEntity } from '@hiretrack/shared';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface EmployeeStatsSummary {
  totalEmployees: number;
  activeEmployees: number;
  onboarding: number;
  probation: number;
  resigned: number;
  openPositions: number;
  needResourcingCount: number;
  managers?: string[];
}

export interface JobTeamCardItem {
  jobId: string;
  title: string;
  department: string;
  location: string;
  requiredHeadcount: number;
  currentEmployees: number;
  vacancies: number;
  hiringProgress: number;
  staffingStatus: 'fully_staffed' | 'overstaffed' | 'need_resourcing';
  status: 'open' | 'closed';
}

export interface EmployeesQueryOptions {
  search?: string;
  department?: string;
  managerName?: string;
  jobId?: string;
  employmentType?: string;
  employmentStatus?: string;
  location?: string;
  probation?: boolean;
  needResourcing?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  employees: ApplicationEntity[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeStatsResponse {
  summary: EmployeeStatsSummary;
  jobTeams: JobTeamCardItem[];
}

export interface EmployeeDetailResponse {
  employee: ApplicationEntity;
  timeline: any[];
  interviews: any[];
  scorecards: any[];
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchEmployees = async (options: EmployeesQueryOptions = {}): Promise<EmployeesResponse> => {
  const params = new URLSearchParams();
  if (options.search) params.append('search', options.search);
  if (options.department && options.department !== 'all') params.append('department', options.department);
  if (options.managerName && options.managerName !== 'all') params.append('managerName', options.managerName);
  if (options.jobId && options.jobId !== 'all') params.append('jobId', options.jobId);
  if (options.employmentType && options.employmentType !== 'all') params.append('employmentType', options.employmentType);
  if (options.employmentStatus && options.employmentStatus !== 'all') params.append('employmentStatus', options.employmentStatus);
  if (options.location && options.location !== 'all') params.append('location', options.location);
  if (options.probation) params.append('probation', 'true');
  if (options.needResourcing) params.append('needResourcing', 'true');
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());

  const response = await fetch(`${API_URL}/api/employees?${params.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch employees list');
  }

  return response.json();
};

export const updateEmployeeEmployment = async (id: string, data: any): Promise<any> => {
  const response = await fetch(`${API_URL}/api/employees/${id}/employment`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update employment details');
  }

  return response.json();
};

export const fetchEmployeeStatsAndTeams = async (): Promise<EmployeeStatsResponse> => {
  const response = await fetch(`${API_URL}/api/employees/stats`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch employee statistics');
  }

  return response.json();
};

export const fetchEmployeeById = async (id: string): Promise<EmployeeDetailResponse> => {
  const response = await fetch(`${API_URL}/api/employees/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch employee profile');
  }

  return response.json();
};
