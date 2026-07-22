import React from 'react';
import { WorkspaceHeader } from '../components/WorkspaceHeader/WorkspaceHeader';
import { KpiGrid } from '../components/KPIs/KpiGrid';
import { CandidatePipelineDistribution } from '../components/CandidatePipeline/CandidatePipelineDistribution';
import { NeedsAttention } from '../components/NeedsAttention/NeedsAttention';
import { UpcomingInterviews } from '../components/UpcomingInterviews/UpcomingInterviews';
import { JobHealthGrid } from '../components/JobHealth/JobHealthGrid';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { SourcingChannels } from '../components/SourcingChannels/SourcingChannels';
import styles from '../dashboard.module.css';

interface OverviewViewProps {
  user: any;
  data: any;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user, data }) => {
  return (
    <div className={styles.overviewViewContainer}>
      {/* ── WORKSPACE HEADER & QUICK ACTIONS ────────────────────────────── */}
      <WorkspaceHeader
        userName={user?.name || 'Recruiter'}
        userRole={user?.role || 'recruiter'}
        summary={data.todaySummary}
        quickActions={data.quickActions}
      />

      {/* ── KPI GRID ────────────────────────────────────────────────────── */}
      <KpiGrid kpis={data.kpis} />

      {/* ── ROW 2: CANDIDATE PIPELINE DONUT & PRIORITY ACTIONS ───────────── */}
      <div className={styles.layerGrid2Equal} style={{ marginBottom: 20 }}>
        <CandidatePipelineDistribution distribution={data.pipelineDistribution} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <NeedsAttention items={data.attentionItems} />
          <UpcomingInterviews interviews={data.upcomingInterviews} />
        </div>
      </div>

      {/* ── ROW 3: JOB HEALTH MATRIX & AUDIT STREAM + CHANNELS ───────────── */}
      <div className={styles.layerGrid2Equal}>
        <JobHealthGrid jobs={data.jobHealth} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ActivityFeed activities={data.activities} />
          <SourcingChannels channels={data.sourcingChannels} />
        </div>
      </div>
    </div>
  );
};
