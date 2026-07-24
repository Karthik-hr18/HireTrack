import React from 'react';
import { WorkspaceHeader } from '../components/WorkspaceHeader/WorkspaceHeader';
import { KpiGrid } from '../components/KPIs/KpiGrid';
import { NeedsAttention } from '../components/NeedsAttention/NeedsAttention';
import { UpcomingInterviews } from '../components/UpcomingInterviews/UpcomingInterviews';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { RecentApplications } from '../components/RecentApplications/RecentApplications';
import styles from '../dashboard.module.css';

import { DashboardData } from '../../../types/dashboard';

interface OverviewViewProps {
  user: { name?: string; email?: string; role?: string } | null;
  data: DashboardData | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user, data }) => {
  return (
    <div className={styles.overviewViewContainer}>
      {/* ── 1. HERO WORKSPACE HEADER & QUICK ACTIONS ────────────────────── */}
      <WorkspaceHeader
        userName={user?.name || 'Recruiter'}
        userRole={user?.role || 'recruiter'}
        summary={data?.todaySummary || { interviewsTodayCount: 0, awaitingReviewCount: 0, offersPendingCount: 0 }}
        quickActions={data?.quickActions || []}
      />

      {/* ── 2. EXECUTIVE OPERATIONAL KPI SUMMARY CARDS ─────────────────── */}
      <KpiGrid kpis={data?.kpis || []} />

      {/* ── 3. OPERATIONAL ROW 2: PRIORITY ACTIONS & TODAY'S INTERVIEWS ─── */}
      <div className={styles.layerGrid2Equal}>
        <NeedsAttention items={data?.attentionItems || []} />
        <UpcomingInterviews interviews={data?.upcomingInterviews || []} />
      </div>

      {/* ── 4. OPERATIONAL ROW 3: LIVE AUDIT FEED & RECENT APPLICATIONS ─── */}
      <div className={styles.layerGrid2Equal}>
        <ActivityFeed activities={data?.activities || []} />
        <RecentApplications data={data} />
      </div>
    </div>
  );
};
