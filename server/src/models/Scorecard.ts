import mongoose, { Schema, Document } from 'mongoose';

export interface IScorecard extends Document {
  interview: mongoose.Types.ObjectId;
  recommendation: string;
  comments: string;
  ratings?: Record<string, number> | null;
  submittedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ScorecardSchema: Schema = new Schema(
  {
    interview: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    recommendation: { type: String, required: true },
    comments: { type: String, required: true },
    ratings: { type: Schema.Types.Mixed, default: null },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Immutable, no update
  }
);

export const Scorecard = mongoose.model<IScorecard>('Scorecard', ScorecardSchema);
