import mongoose, { Schema, Document } from 'mongoose';

export interface IScorecard extends Document {
  interview: mongoose.Types.ObjectId; // 1:1 relationship with Interview
  recommendation: 'hire' | 'no_hire' | 'pass' | 'reject';
  comments: string;
  ratings: Record<string, number>;
  communication?: number;
  cultureFit?: number;
  salaryExpectation?: number;
  salaryOffered?: number;
  submittedBy: mongoose.Types.ObjectId; // User with role: admin
  createdAt: Date;
  updatedAt: Date;
}

const ScorecardSchema: Schema = new Schema(
  {
    interview: { 
      type: Schema.Types.ObjectId, 
      ref: 'Interview', 
      required: true,
      unique: true // Guarantees 1:1 scorecard relationship
    },
    recommendation: { 
      type: String, 
      required: true, 
      enum: ['hire', 'no_hire', 'pass', 'reject'] 
    },
    comments: { 
      type: String, 
      required: true 
    },
    ratings: { 
      type: Map, 
      of: Number, 
      default: {} 
    },
    communication: { type: Number },
    cultureFit: { type: Number },
    salaryExpectation: { type: Number },
    salaryOffered: { type: Number },
    submittedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  {
    timestamps: true
  }
);

export const Scorecard = mongoose.model<IScorecard>('Scorecard', ScorecardSchema);
