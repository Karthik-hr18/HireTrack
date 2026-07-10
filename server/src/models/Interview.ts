import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  application: mongoose.Types.ObjectId;
  interviewer: mongoose.Types.ObjectId; // User with role: admin
  scheduledAt: Date;
  status: 'scheduled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    interviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, required: true, enum: ['scheduled', 'completed'], default: 'scheduled' }
  },
  {
    timestamps: true
  }
);

// Index compound
InterviewSchema.index({ interviewer: 1, status: 1 });

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
