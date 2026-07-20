import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { WorkspaceHeader } from './components/WorkspaceHeader/WorkspaceHeader';
import { KpiGrid } from './components/KPIs/KpiGrid';
import { RecruitmentFunnel } from './components/RecruitmentFunnel/RecruitmentFunnel';
import { CandidatePipelineDistribution } from './components/CandidatePipeline/CandidatePipelineDistribution';
import { NeedsAttention } from './components/NeedsAttention/NeedsAttention';
import { UpcomingInterviews } from './components/UpcomingInterviews/UpcomingInterviews';
import { JobHealthGrid } from './components/JobHealth/JobHealthGrid';
import { ActivityFeed } from './components/ActivityFeed/ActivityFeed';
import { HiringInsights } from './components/HiringInsights/HiringInsights';
import { SourcingChannels } from './components/SourcingChannels/SourcingChannels';
import styles from './dashboard.module.css';

export const Dashboard: React.FC = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

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

  return (
    <div className={styles.dashboardContainer}>
      {/* ── WORKSPACE HEADER & QUICK ACTIONS ───────────────────────────────── */}
      <WorkspaceHeader
        userName={user.name || 'User'}
        userRole={user.role}
        summary={data.todaySummary}
        quickActions={data.quickActions}
      />

      {/* ── LAYER 1: EXECUTIVE KPIS (8 Stripe-Style Metric Cards) ────────────── */}
      <KpiGrid kpis={data.kpis} />

      {/* ── LAYER 2: RECRUITMENT FUNNEL & CANDIDATE DISTRIBUTION ──────────── */}
      <div className={styles.layerGrid2}>
        <RecruitmentFunnel funnel={data.funnel} />
        <CandidatePipelineDistribution distribution={data.pipelineDistribution} />
      </div>

      {/* ── LAYER 3: ACTION CENTER & UPCOMING SCHEDULE WORKSPACE ───────────── */}
      <div className={styles.layerGrid2}>
        <NeedsAttention items={data.attentionItems} />
        <UpcomingInterviews interviews={data.upcomingInterviews} />
      </div>

      {/* ── LAYER 4: JOB HEALTH MATRIX & LIVE ACTIVITY AUDIT STREAM ────────── */}
      <div className={styles.layerGrid2}>
        <JobHealthGrid jobs={data.jobHealth} />
        <ActivityFeed activities={data.activities} />
      </div>

      {/* ── LAYER 5: OPERATIONAL INSIGHTS & SOURCING CHANNELS ──────────────── */}
      <div className={styles.layerGrid2}>
        <HiringInsights insights={data.insights} />
        <SourcingChannels channels={data.sourcingChannels} />
      </div>
    </div>
  );
};
