import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, Briefcase, Building2, TrendingUp, Users } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { OverviewView } from './views/OverviewView';
import { JobsInsightsView } from './views/JobsInsightsView';
import { DepartmentInsightsView } from './views/DepartmentInsightsView';
import { ApplicationTrendsView } from './views/ApplicationTrendsView';
import { ManageRecruitersView } from './views/ManageRecruitersView';
import styles from './dashboard.module.css';

type DashboardTab = 'overview' | 'jobs' | 'departments' | 'trends' | 'recruiters';

export const Dashboard: React.FC = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeframe] = useState('30d');
  const { data, loading, error, refetch } = useDashboard(timeframe);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return <DashboardErrorBoundary error={error || 'Failed to sync dashboard'} onRetry={refetch} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView user={user} data={data} />;
      case 'jobs':
        return <JobsInsightsView data={data} />;
      case 'departments':
        return <DepartmentInsightsView data={data} />;
      case 'trends':
        return <ApplicationTrendsView data={data} />;
      case 'recruiters':
        return isAdmin ? <ManageRecruitersView /> : <OverviewView user={user} data={data} />;
      default:
        return <OverviewView user={user} data={data} />;
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* ── PERSISTENT INNER LEFT NAVIGATION SIDEBAR ──────────────────────── */}
      <aside className={styles.dashboardSidebar}>
        <div className={styles.sidebarHeader}>DASHBOARD VIEWS</div>

        <button
          type="button"
          className={`${styles.sidebarNavItem} ${activeTab === 'overview' ? styles.sidebarNavItemActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} className={styles.navIcon} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`${styles.sidebarNavItem} ${activeTab === 'jobs' ? styles.sidebarNavItemActive : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} className={styles.navIcon} />
          <span>Jobs Insights</span>
        </button>

        <button
          type="button"
          className={`${styles.sidebarNavItem} ${activeTab === 'departments' ? styles.sidebarNavItemActive : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={16} className={styles.navIcon} />
          <span>Department Insights</span>
        </button>

        <button
          type="button"
          className={`${styles.sidebarNavItem} ${activeTab === 'trends' ? styles.sidebarNavItemActive : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={16} className={styles.navIcon} />
          <span>Application Trends</span>
        </button>

        {/* ADMIN-ONLY NAVIGATION ITEM: MANAGE RECRUITERS */}
        {isAdmin && (
          <button
            type="button"
            className={`${styles.sidebarNavItem} ${activeTab === 'recruiters' ? styles.sidebarNavItemActive : ''}`}
            onClick={() => setActiveTab('recruiters')}
          >
            <Users size={16} className={styles.navIcon} />
            <span>Manage Recruiters</span>
          </button>
        )}
      </aside>

      {/* ── MAIN DASHBOARD VIEW CONTENT AREA ──────────────────────────────── */}
      <main className={styles.dashboardContentArea}>
        {renderActiveView()}
      </main>
    </div>
  );
};
