import { useState, useEffect, useCallback } from 'react';
import {
  fetchEmployees,
  fetchEmployeeStatsAndTeams,
  fetchEmployeeById,
  EmployeesQueryOptions,
  EmployeesResponse,
  EmployeeStatsResponse,
  EmployeeDetailResponse
} from '../services/employeeService';

export const useEmployees = (initialOptions: EmployeesQueryOptions = {}) => {
  const [options, setOptions] = useState<EmployeesQueryOptions>(initialOptions);
  const [employeesData, setEmployeesData] = useState<EmployeesResponse | null>(null);
  const [statsData, setStatsData] = useState<EmployeeStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
