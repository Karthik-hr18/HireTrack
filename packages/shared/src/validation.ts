import { z } from 'zod';

// Roles
export const UserRole = z.enum(['candidate', 'recruiter', 'admin']);
export type UserRoleType = z.infer<typeof UserRole>;

// Application Sources
export const ApplicationSource = z.enum([
  'careers_page',
  'linkedin',
  'naukri',
  'referral',
  'campus',
  'recruiter_added'
]);
export type ApplicationSourceType = z.infer<typeof ApplicationSource>;

// Pipeline Stages
export const PipelineStage = z.enum([
  'applied',
  'resume_screening',
  'interview_scheduled',
  'interview_completed',
  'final_review',
  'offer',
  'hired',
  'rejected'
]);
export type PipelineStageType = z.infer<typeof PipelineStage>;

// Rejection Reasons
export const RejectionReason = z.enum([
  'skills_mismatch',
  'experience_mismatch',
  'withdrew',
  'salary_expectations',
  'other'
]);
export type RejectionReasonType = z.infer<typeof RejectionReason>;

// Auth Validation
export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address')
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// Admin managing Recruiter accounts
export const CreateRecruiterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
export type CreateRecruiterInput = z.infer<typeof CreateRecruiterSchema>;

export const UpdateRecruiterStatusSchema = z.object({
  isActive: z.boolean()
});
export type UpdateRecruiterStatusInput = z.infer<typeof UpdateRecruiterStatusSchema>;

// Job Validation
export const CreateJobSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().trim().optional(),
  location: z.string().trim().optional()
});
export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  status: z.enum(['open', 'closed']).optional()
});
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;

// Application Validation
export const ApplySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  source: ApplicationSource.default('careers_page')
});
export type ApplyInput = z.infer<typeof ApplySchema>;

export const RejectApplicationSchema = z.object({
  rejectionReason: RejectionReason,
  rejectionNote: z.string().trim().optional()
});
export type RejectApplicationInput = z.infer<typeof RejectApplicationSchema>;

// Interview Validation
export const ScheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  interviewerId: z.string().min(1, 'Interviewer ID is required'),
  scheduledAt: z.string().datetime({ message: 'Invalid datetime format (ISO 8601)' })
});
export type ScheduleInterviewInput = z.infer<typeof ScheduleInterviewSchema>;

// Scorecard Validation
export const SubmitScorecardSchema = z.object({
  recommendation: z.string().trim().min(1, 'Recommendation is required'),
  comments: z.string().trim().min(1, 'Comments are required'),
  ratings: z.record(z.string(), z.number()).optional().nullable()
});
export type SubmitScorecardInput = z.infer<typeof SubmitScorecardSchema>;
