import mongoose, { Schema, Document } from 'mongoose';
import { UserRoleType } from '@hiretrack/shared';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  role: UserRoleType;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
    isActive: { type: Boolean, required: true, default: true },
    isEmailVerified: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
