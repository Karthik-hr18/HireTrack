import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  department?: string;
  applicantsCount?: number;
  minExperience: number;
  maxExperience: number;
  vacancies: number;
  status: 'open' | 'closed';
  createdBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: String, trim: true },
    location: { type: String, trim: true },
    minExperience: { type: Number, default: 0, required: true },
    maxExperience: { type: Number, default: 0, required: true },
    vacancies: { type: Number, default: 1, required: true },
    status: { type: String, required: true, enum: ['open', 'closed'], default: 'open', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

// Compound index for status/deletedAt to optimize job searches
JobSchema.index({ status: 1, deletedAt: 1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
