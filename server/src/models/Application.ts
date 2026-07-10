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
  resumeSnapshotAt: Date;
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
        'interview_scheduled',
        'interview_completed',
        'final_review',
        'offer',
        'hired',
        'rejected'
      ],
      default: 'applied'
    },
    resumeUrl: { type: String, required: true },
    resumeSnapshotAt: { type: Date, required: true, default: Date.now },
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
