import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchEmployees,
  fetchEmployeeStatsAndTeams,
  fetchEmployeeById,
  EmployeesQueryOptions,
  EmployeesResponse,
  EmployeeStatsResponse,
  EmployeeDetailResponse
} from '../services/employeeService';

export interface JobGroup {
  name: string;
  totalCount: number;
  jobs: Array<{ id: string; title: string; candidateCount: number }>;
}

const BUSINESS_ORDER = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'IT',
  'Legal',
  'General',
];

export const useEmployees = (initialOptions: EmployeesQueryOptions = {}) => {
  const [options, setOptions] = useState<EmployeesQueryOptions>(initialOptions);
  const [employeesData, setEmployeesData] = useState<EmployeesResponse | null>(null);
  const [statsData, setStatsData] = useState<EmployeeStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Initialize expanded groups from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('employeeSidebarExpanded');
    if (stored) {
      try {
        setExpandedGroups(JSON.parse(stored));
      } catch (e) {
        setExpandedGroups(['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'IT']);
      }
    } else {
      setExpandedGroups(['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'IT']);
    }
  }, []);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName];
      sessionStorage.setItem('employeeSidebarExpanded', JSON.stringify(next));
      return next;
    });
  };

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEmployees(options);
      setEmployeesData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees list');
    } finally {
      setLoading(false);
    }
  }, [options]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetchEmployeeStatsAndTeams();
      setStatsData(res);
    } catch (err: any) {
      console.error('Failed to load employee stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Transform jobTeams into sidebar JobGroup format
  const groups: JobGroup[] = useMemo(() => {
    if (!statsData?.jobTeams) return [];
    const groupMap: Record<string, JobGroup> = {};

    statsData.jobTeams.forEach((jt) => {
      const groupName = jt.department || 'General';
      if (!groupMap[groupName]) {
        groupMap[groupName] = { name: groupName, totalCount: 0, jobs: [] };
      }
      const g = groupMap[groupName];
      const count = jt.currentEmployees || 0;
      g.jobs.push({ id: jt.jobId, title: jt.title, candidateCount: count });
      g.totalCount += count;
    });

    const ordered: JobGroup[] = BUSINESS_ORDER.map((name) => groupMap[name]).filter(Boolean);
    const remaining = Object.keys(groupMap)
      .filter((n) => !BUSINESS_ORDER.includes(n))
      .sort()
      .map((n) => groupMap[n]);

    return [...ordered, ...remaining];
  }, [statsData]);

  const updateFilters = (newOptions: Partial<EmployeesQueryOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions, page: 1 }));
  };

  const setPage = (page: number) => {
    setOptions((prev) => ({ ...prev, page }));
  };

  const refetch = () => {
    loadEmployees();
    loadStats();
  };

  return {
    employees: employeesData?.employees || [],
    page: employeesData?.page || 1,
    limit: employeesData?.limit || 25,
    total: employeesData?.total || 0,
    totalPages: employeesData?.totalPages || 1,
    summary: statsData?.summary || {
      totalEmployees: 0,
      activeEmployees: 0,
      onboarding: 0,
      probation: 0,
      resigned: 0,
      openPositions: 0,
      needResourcingCount: 0
    },
    jobTeams: statsData?.jobTeams || [],
    groups,
    expandedGroups,
    toggleGroup,
    options,
    loading,
    statsLoading,
    error,
    updateFilters,
    setPage,
    refetch
  };
};

export const useEmployeeDetail = (id: string | null) => {
  const [detail, setDetail] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmployeeById(id);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  return { detail, loading, error };
};
