import React from 'react';
import { WorkspaceHeader } from '../components/WorkspaceHeader/WorkspaceHeader';
import { KpiGrid } from '../components/KPIs/KpiGrid';
import { RecruitmentFunnel } from '../components/RecruitmentFunnel/RecruitmentFunnel';
import { CandidatePipelineDistribution } from '../components/CandidatePipeline/CandidatePipelineDistribution';
import { NeedsAttention } from '../components/NeedsAttention/NeedsAttention';
import { UpcomingInterviews } from '../components/UpcomingInterviews/UpcomingInterviews';
import { JobHealthGrid } from '../components/JobHealth/JobHealthGrid';
import { ActivityFeed } from '../components/ActivityFeed/ActivityFeed';
import { HiringInsights } from '../components/HiringInsights/HiringInsights';
import { SourcingChannels } from '../components/SourcingChannels/SourcingChannels';
import styles from '../dashboard.module.css';

interface OverviewViewProps {
  user: any;
  data: any;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ user, data }) => {
  return (
    <div className={styles.overviewViewContainer}>
      {/* Workspace Header & Quick Actions */}
      <WorkspaceHeader
        userName={user?.name || 'Recruiter'}
        userRole={user?.role || 'recruiter'}
        summary={data.todaySummary}
        quickActions={data.quickActions}
      />

      {/* Layer 1: KPI Grid */}
      <KpiGrid kpis={data.kpis} />

      {/* Layer 2: Recruitment Funnel & Candidate Distribution */}
      <div className={styles.layerGrid2}>
        <RecruitmentFunnel funnel={data.funnel} />
        <CandidatePipelineDistribution distribution={data.pipelineDistribution} />
      </div>

      {/* Layer 3: Needs Attention & Upcoming Interviews */}
      <div className={styles.layerGrid2}>
        <NeedsAttention items={data.attentionItems} />
        <UpcomingInterviews interviews={data.upcomingInterviews} />
      </div>

      {/* Layer 4: Job Health & Activity Feed */}
      <div className={styles.layerGrid2}>
        <JobHealthGrid jobs={data.jobHealth} />
        <ActivityFeed activities={data.activities} />
      </div>

      {/* Layer 5: Operational Insights & Sourcing Channels */}
      <div className={styles.layerGrid2}>
        <HiringInsights insights={data.insights} />
        <SourcingChannels channels={data.sourcingChannels} />
      </div>
    </div>
  );
};
