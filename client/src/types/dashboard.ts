export interface KPIItem {
  key: string;
  label: string;
  value: string | number;
  changePercent?: number; // e.g. +12
  changeLabel?: string;  // e.g. "vs last month" or "Target: 20d"
  status?: 'healthy' | 'attention' | 'critical' | 'info';
  iconName: string;
}

export interface FunnelStage {
  stageKey: string;
  label: string;
  count: number;
  conversionPercent: number;
  dropoffPercent: number;
}

export interface CandidatePipelineDistribution {
  stageKey: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  count: number;
  severity: 'critical' | 'attention' | 'info' | 'success';
  subtitle: string;
  actionUrl: string;
}

export interface InterviewScheduleItem {
  id: string;
  interviewId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  type: 'technical' | 'hr';
  scheduledAt: string;
  interviewerName: string;
  status: string;
}

export interface JobHealthItem {
  id: string;
  title: string;
  department: string;
  location: string;
  applicantsCount: number;
  interviewsCount: number;
  offersCount: number;
  hiresCount: number;
  status: 'healthy' | 'needs_sourcing' | 'critical';
  rating: number; // 1 to 5 stars
  daysWithoutApplicant: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  candidateName: string;
  jobTitle?: string;
  timeAgo: string;
}

export interface HiringInsight {
  id: string;
  text: string;
  type: 'positive' | 'warning' | 'info';
}

export interface SourcingChannel {
  channel: string;
  count: number;
  percentage: number;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  url?: string;
  actionKey?: string;
  primary?: boolean;
}

export interface DashboardData {
  userRole: 'admin' | 'recruiter' | 'candidate';
  userName: string;
  todaySummary: {
    interviewsTodayCount: number;
    awaitingReviewCount: number;
    offersPendingCount: number;
  };
  kpis: KPIItem[];
  funnel: FunnelStage[];
  pipelineDistribution: CandidatePipelineDistribution[];
  attentionItems: AttentionItem[];
  upcomingInterviews: InterviewScheduleItem[];
  jobHealth: JobHealthItem[];
  activities: ActivityItem[];
  insights: HiringInsight[];
  sourcingChannels: SourcingChannel[];
  quickActions: QuickActionItem[];
}
