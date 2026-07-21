import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationSourceType, PipelineStageType, RejectionReasonType } from '@hiretrack/shared';

export interface IApplicationNote {
  author: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IApplication extends Document {
  candidate: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  source: ApplicationSourceType;
  stage: PipelineStageType;
  resumeUrl: string;
  cloudinaryPublicId?: string;
  cloudinaryAssetId?: string;
  cloudinaryResourceType?: string;
  cloudinaryType?: string;
  resumeSnapshotAt: Date;
  phone: string;
  country: string;
  address: string;
  experience: number;
  linkedinUrl: string;
  githubUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  currentCompany?: string;
  currentTitle?: string;
  termsAccepted: boolean;
  rejectionReason?: RejectionReasonType | null;
  rejectionNote?: string | null;
  notes: IApplicationNote[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationNoteSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

const ApplicationSchema: Schema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    source: {
      type: String,
      required: true,
      enum: ['careers_page', 'linkedin', 'naukri', 'referral', 'campus', 'recruiter_added'],
      index: true
    },
    stage: {
      type: String,
      required: true,
      enum: [
        'applied',
        'resume_screening',
        'technical_interview_scheduled',
        'technical_interview_completed',
        'hr_interview_scheduled',
        'hr_interview_completed',
        'offer',
        'hired',
        'rejected',
        'interview_scheduled',
        'interview_completed',
        'final_review'
      ],
      default: 'applied'
    },
    resumeUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryAssetId: { type: String },
    cloudinaryResourceType: { type: String, default: 'raw' },
    cloudinaryType: { type: String, default: 'upload' },
    resumeSnapshotAt: { type: Date, required: true, default: Date.now },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    experience: { type: Number, required: true, default: 0 },
    linkedinUrl: { type: String, required: true },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    currentTitle: { type: String, default: '' },
    termsAccepted: { type: Boolean, required: true },
    rejectionReason: {
      type: String,
      enum: ['skills_mismatch', 'experience_mismatch', 'withdrew', 'salary_expectations', 'other'],
      default: null
    },
    rejectionNote: { type: String, default: null },
    notes: [ApplicationNoteSchema]
  },
  {
    timestamps: true
  }
);

// Indexes
ApplicationSchema.index({ job: 1, stage: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
