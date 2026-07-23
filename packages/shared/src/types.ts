import { UserRoleType, PipelineStageType, ApplicationSourceType, RejectionReasonType } from './validation';

export interface UserSummary {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

export interface JobEntity {
  _id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  department?: string;
  minExperience: number;
  maxExperience: number;
  vacancies: number;
  status: 'open' | 'closed';
  createdBy?: UserSummary | string;
  candidateCount?: number;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ApplicationEntity {
  _id: string;
  job: JobEntity | string;
  candidateName?: string;
  candidateEmail?: string;
  candidate?: UserSummary | string;
  source: ApplicationSourceType;
  stage: PipelineStageType;
  phone: string;
  country: string;
  address: string;
  experience: number;
  resumeUrl: string;
  linkedinUrl: string;
  githubUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  currentCompany?: string;
  currentTitle?: string;
  rejectionReason?: RejectionReasonType;
  rejectionNote?: string;
  referrerName?: string;
  referrerEmail?: string;
  referralNotes?: string;
  interviews?: InterviewEntity[];
  scorecards?: ScorecardEntity[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InterviewEntity {
  _id: string;
  application: ApplicationEntity | string;
  interviewer: UserSummary | string;
  scheduledAt: Date | string;
  type: 'technical' | 'hr';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ScorecardEntity {
  _id: string;
  interview?: string;
  application: ApplicationEntity | string;
  evaluator: UserSummary | string;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire' | string;
  comments: string;
  communication?: number;
  cultureFit?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MetricCard {
  key: string;
  label: string;
  value: string | number;
  changePercent?: number;
  changeLabel?: string;
  status?: 'healthy' | 'warning' | 'neutral';
  iconName?: string;
}

export interface MonthlyTrendData {
  month: string;
  apps?: number;
  applications?: number;
  hires?: number;
}
