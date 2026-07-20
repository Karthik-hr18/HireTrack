import { DashboardData } from '../types/dashboard';

const API_URL = import.meta.env.VITE_API_URL || '';

export const fetchDashboardData = async (token: string, timeframe = '30d'): Promise<DashboardData> => {
  const response = await fetch(`${API_URL}/api/analytics/dashboard?timeframe=${timeframe}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to load dashboard metrics');
  }

  return await response.json();
};
