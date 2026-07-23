import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { syncUser, getMe, logout } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { firebaseAuth } from '../config/firebase';

dotenv.config();

describe('Firebase Auth & RBAC Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Mock firebaseAuth.verifyIdToken
    vi.spyOn(firebaseAuth, 'verifyIdToken').mockImplementation(async (token: string) => {
      if (token === 'valid_firebase_candidate_token') {
        return {
          uid: 'fb_candidate_uid_123',
          email: 'candidate@test-hiretrack.com',
          name: 'Test Candidate',
          email_verified: true
        } as any;
      }
      if (token === 'valid_firebase_admin_token') {
        return {
          uid: 'fb_admin_uid_456',
          email: 'admin@test-hiretrack.com',
          name: 'Test Admin',
          email_verified: true
        } as any;
      }
      throw new Error('Invalid Firebase token');
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-hiretrack\.com$/ });
    await mongoose.connection.close();
    vi.restoreAllMocks();
  });

  it('1. Sync Candidate User - Should auto-create MongoDB user record on first Firebase login', async () => {
    await User.deleteOne({ email: 'candidate@test-hiretrack.com' });

    const req = {
      headers: { authorization: 'Bearer valid_firebase_candidate_token' },
      body: { name: 'Test Candidate', role: 'candidate' }
    } as any;

    let status = 0;
    let data: any = null;
    const res = {
      status: (s: number) => {
        status = s;
        return { json: (d: any) => { data = d; } };
      }
    } as any;

    await syncUser(req, res, () => {});

    expect(status).toBe(200);
    expect(data.user).toHaveProperty('id');
    expect(data.user.firebaseUid).toBe('fb_candidate_uid_123');
    expect(data.user.email).toBe('candidate@test-hiretrack.com');
    expect(data.user.role).toBe('candidate');

    const userInDb = await User.findOne({ email: 'candidate@test-hiretrack.com' });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.firebaseUid).toBe('fb_candidate_uid_123');
  });

  it('2. Authenticate & Authorize Middleware - Should authenticate Firebase token and enforce RBAC', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_firebase_candidate_token' }
    } as any;

    let authCalled = false;
    await authenticate(req, {} as any, () => {
      authCalled = true;
    });

    expect(authCalled).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('candidate');

    // Authorize candidate role (should succeed)
    let candidateAuthCalled = false;
    authorize('candidate')(req, {} as any, () => {
      candidateAuthCalled = true;
    });
    expect(candidateAuthCalled).toBe(true);

    // Authorize admin role for candidate user (should fail with 403)
    let forbiddenStatus = 0;
    let forbiddenData: any = null;
    const adminRes = {
      status: (s: number) => {
        forbiddenStatus = s;
        return { json: (d: any) => { forbiddenData = d; } };
      }
    } as any;

    authorize('admin')(req, adminRes, () => {});
    expect(forbiddenStatus).toBe(403);
    expect(forbiddenData.code).toBe('FORBIDDEN');
  });

  it('3. Get Current User (GET /api/auth/me) - Should return profile info for authenticated user', async () => {
    const userInDb = await User.findOne({ email: 'candidate@test-hiretrack.com' });
    const req = {
      user: {
        id: userInDb!._id.toString(),
        email: userInDb!.email,
        role: userInDb!.role,
        isEmailVerified: userInDb!.isEmailVerified
      }
    } as any;

    let status = 0;
    let data: any = null;
    const res = {
      status: (s: number) => {
        status = s;
        return { json: (d: any) => { data = d; } };
      }
    } as any;

    await getMe(req, res, () => {});

    expect(status).toBe(200);
    expect(data.user.email).toBe('candidate@test-hiretrack.com');
    expect(data.user.firebaseUid).toBe('fb_candidate_uid_123');
  });

  it('4. Logout Endpoint - Should handle logout gracefully', async () => {
    let status = 0;
    let data: any = null;
    const res = {
      status: (s: number) => {
        status = s;
        return { json: (d: any) => { data = d; } };
      }
    } as any;

    await logout({} as any, res, () => {});
    expect(status).toBe(200);
    expect(data.message).toBe('Successfully logged out');
  });
});
