import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types/dashboard';
import { fetchDashboardData } from '../services/dashboard.service';

export const useDashboard = (timeframe = '30d') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError('Authentication token missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchDashboardData(token, timeframe);
      setData(dashboardData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, timeframe]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
    refetch: loadDashboard
  };
};
