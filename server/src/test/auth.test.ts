import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { User } from '../models/User';
import { syncUser, getMe, logout, checkEmail } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { firebaseAuth } from '../config/firebase';

dotenv.config();

describe('Firebase Auth & Security Hardening Tests', () => {
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

    // Mock firebaseAuth methods
    vi.spyOn(firebaseAuth, 'verifyIdToken').mockImplementation(async (token: string) => {
      if (token === 'valid_firebase_candidate_token') {
        return {
          uid: 'fb_candidate_uid_123',
          email: 'candidate@test-hiretrack.com',
          name: 'Test Candidate',
          email_verified: true
        } as unknown as DecodedIdToken;
      }
      if (token === 'valid_firebase_admin_token') {
        return {
          uid: 'fb_admin_uid_456',
          email: 'admin@test-hiretrack.com',
          name: 'Test Admin',
          email_verified: true
        } as unknown as DecodedIdToken;
      }
      throw new Error('Invalid Firebase token');
    });

    vi.spyOn(firebaseAuth, 'getUserByEmail').mockImplementation(async (email: string) => {
      if (email === 'admin@test-hiretrack.com' || email === 'recruiter@test-hiretrack.com') {
        return { uid: 'existing_fb_uid', email } as unknown as UserRecord;
      }
      const err = new Error('User not found');
      Object.assign(err, { code: 'auth/user-not-found' });
      throw err;
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-hiretrack\.com$/ });
    await mongoose.connection.close();
    vi.restoreAllMocks();
  });

  it('1. Sync Candidate User - Should auto-create MongoDB user record on first Firebase login', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_firebase_candidate_token' },
      body: { name: 'Test Candidate' }
    } as unknown as Request;

    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await syncUser(req, res, () => {});

    expect(status).toBe(200);
    const userObj = data.user as Record<string, unknown>;
    expect(userObj.email).toBe('candidate@test-hiretrack.com');
    expect(userObj.role).toBe('candidate');

    const dbUser = await User.findOne({ email: 'candidate@test-hiretrack.com' });
    expect(dbUser).toBeDefined();
    expect(dbUser?.firebaseUid).toBe('fb_candidate_uid_123');
  });

  it('2. Pre-Registration Verification Check - Should reject registration for existing privileged accounts', async () => {
    await User.create({
      firebaseUid: 'existing_fb_uid',
      name: 'Test Admin',
      email: 'admin@test-hiretrack.com',
      role: 'admin',
      isActive: true
    });

    const req = { body: { email: 'admin@test-hiretrack.com' } } as unknown as Request;
    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await checkEmail(req, res, () => {});

    expect(status).toBe(409);
    expect(data.exists).toBe(true);
    expect(data.isPrivileged).toBe(true);
    expect(data.message as string).toContain('privileged account');
  });

  it('3. Pre-Registration Verification Check - Should reject registration for existing candidate accounts', async () => {
    const req = { body: { email: 'candidate@test-hiretrack.com' } } as unknown as Request;
    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await checkEmail(req, res, () => {});

    expect(status).toBe(409);
    expect(data.exists).toBe(true);
    expect(data.isPrivileged).toBe(false);
    expect(data.message as string).toContain('Please use Login instead');
  });

  it('4. Pre-Registration Verification Check - Should allow registration for brand new email', async () => {
    const req = { body: { email: 'newcandidate@test-hiretrack.com' } } as unknown as Request;
    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await checkEmail(req, res, () => {});

    expect(status).toBe(200);
    expect(data.exists).toBe(false);
  });

  it('5. Admin Authenticated Sync - Should sync and preserve Admin role for verified token', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_firebase_admin_token' },
      body: { name: 'Test Admin' }
    } as unknown as Request;

    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await syncUser(req, res, () => {});

    expect(status).toBe(200);
    const userObj = data.user as Record<string, unknown>;
    expect(userObj.role).toBe('admin');
    expect(userObj.firebaseUid).toBe('fb_admin_uid_456');
  });

  it('6. Authenticate & Authorize Middleware - Should authenticate Firebase token and enforce RBAC', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_firebase_candidate_token' }
    } as unknown as Request;

    let authCalled = false;
    await authenticate(req, {} as unknown as Response, () => {
      authCalled = true;
    });

    expect(authCalled).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user?.role).toBe('candidate');

    // Authorize candidate role (should succeed)
    let candidateAuthCalled = false;
    authorize('candidate')(req, {} as unknown as Response, () => {
      candidateAuthCalled = true;
    });
    expect(candidateAuthCalled).toBe(true);

    // Authorize admin role for candidate user (should fail with 403)
    let forbiddenStatus = 0;
    let forbiddenData: Record<string, unknown> = {};
    const adminRes = {
      status: (s: number) => {
        forbiddenStatus = s;
        return {
          json: (d: Record<string, unknown>) => {
            forbiddenData = d;
          }
        };
      }
    } as unknown as Response;

    authorize('admin')(req, adminRes, () => {});
    expect(forbiddenStatus).toBe(403);
    expect(forbiddenData.code).toBe('FORBIDDEN');
  });

  it('7. Get Current User (GET /api/auth/me) - Should return profile info for authenticated user', async () => {
    const userInDb = await User.findOne({ email: 'candidate@test-hiretrack.com' });
    const req = {
      user: {
        id: userInDb!._id.toString(),
        email: userInDb!.email,
        role: userInDb!.role,
        isEmailVerified: userInDb!.isEmailVerified
      }
    } as unknown as Request;

    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await getMe(req, res, () => {});

    expect(status).toBe(200);
    const userObj = data.user as Record<string, unknown>;
    expect(userObj.email).toBe('candidate@test-hiretrack.com');
    expect(userObj.firebaseUid).toBe('fb_candidate_uid_123');
  });

  it('8. Logout Endpoint - Should handle logout gracefully', async () => {
    let status = 0;
    let data: Record<string, unknown> = {};
    const res = {
      status: (s: number) => {
        status = s;
        return {
          json: (d: Record<string, unknown>) => {
            data = d;
          }
        };
      }
    } as unknown as Response;

    await logout({} as unknown as Request, res, () => {});
    expect(status).toBe(200);
    expect(data.message).toBe('Successfully logged out');
  });
});
