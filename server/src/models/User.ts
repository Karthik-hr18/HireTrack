import mongoose, { Schema, Document } from 'mongoose';
import { UserRoleType } from '@hiretrack/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRoleType;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['candidate', 'recruiter', 'admin'] },
    isActive: { type: Boolean, required: true, default: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    emailVerificationToken: { type: String, default: null },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
