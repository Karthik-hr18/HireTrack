import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  entityType: 'application' | 'job' | 'user';
  entityId: mongoose.Types.ObjectId;
  action: string;
  actor: mongoose.Types.ObjectId;
  metadata?: any;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    entityType: { type: String, required: true, enum: ['application', 'job', 'user'] },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for timeline queries
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
