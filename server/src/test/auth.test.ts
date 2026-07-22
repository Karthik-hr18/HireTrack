import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { connectDB } from '../config/db';

// Load environment variables for the test process
dotenv.config();

describe('Auth & RBAC Integration Tests', () => {
  beforeAll(async () => {
    // Connect to MongoDB Atlas or local MongoDB (using 'hiretrack_test' DB namespace)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });
  });

  afterAll(async () => {
    // Cleanup users created during tests and close connection
    await User.deleteMany({ email: /@test-hiretrack\.com$/ });
    await mongoose.connection.close();
  });

  const testCandidate = {
    name: 'Test Candidate',
    email: 'candidate@test-hiretrack.com',
    password: 'password123'
  };

  it('1. Register Candidate - Should create user, hash password and return token', async () => {
    // Clean up if user already exists from a crashed run
    await User.deleteOne({ email: testCandidate.email });

    // Mock Express Req, Res, Next
    const req = {
      body: testCandidate
    } as any;

    let responseStatus = 0;
    let responseData: any = null;

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: any) => {
            responseData = data;
          }
        };
      }
    } as any;

    const next = () => {};

    await register(req, res, next);

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('token');
    expect(responseData.user).toHaveProperty('id');
    expect(responseData.user.name).toBe(testCandidate.name);
    expect(responseData.user.email).toBe(testCandidate.email);
    expect(responseData.user.role).toBe('candidate');

    // Confirm database record matches
    const userInDb = await User.findOne({ email: testCandidate.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.name).toBe(testCandidate.name);
    expect(userInDb!.role).toBe('candidate');
    // Verify password is hashed
    const match = await bcrypt.compare(testCandidate.password, userInDb!.passwordHash);
    expect(match).toBe(true);
  });

  it('2. Register Existing User - Should return 400 with EMAIL_EXISTS code', async () => {
    const req = {
      body: testCandidate
    } as any;

    let responseStatus = 0;
    let responseData: any = null;

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: any) => {
            responseData = data;
          }
        };
      }
    } as any;

    const next = () => {};

    await register(req, res, next);

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('EMAIL_EXISTS');
  });

  it('3. Login Candidate - Should verify credentials and return JWT', async () => {
    const req = {
      body: {
        email: testCandidate.email,
        password: testCandidate.password
      }
    } as any;

    let responseStatus = 0;
    let responseData: any = null;

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: any) => {
            responseData = data;
          }
        };
      }
    } as any;

    const next = () => {};

    await login(req, res, next);

    expect(responseStatus).toBe(200);
    expect(responseData).toHaveProperty('token');
    expect(responseData.user.email).toBe(testCandidate.email);
    expect(responseData.user.role).toBe('candidate');
  });

  it('4. RBAC Middleware - Authenticate and Authorize Candidate vs Admin resources', async () => {
    // Generate valid Candidate token
    const user = await User.findOne({ email: testCandidate.email });
    const candidateToken = jwt.sign(
      { id: user!._id.toString(), email: user!.email, role: user!.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    // Mock authenticate middleware
    const req = {
      headers: {
        authorization: `Bearer ${candidateToken}`
      }
    } as any;

    const res = {
      status: (status: number) => ({
        json: (data: any) => {}
      })
    } as any;

    let authCalled = false;
    const next = () => {
      authCalled = true;
    };

    await authenticate(req, res, next);

    expect(authCalled).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('candidate');

    // Test authorize middleware for candidate role (should succeed)
    let candidateAuthCalled = false;
    const candidateNext = () => {
      candidateAuthCalled = true;
    };
    authorize('candidate')(req, res, candidateNext);
    expect(candidateAuthCalled).toBe(true);

    // Test authorize middleware for admin role (should fail)
    let adminAuthCalled = false;
    let authErrorStatus = 0;
    let authErrorData: any = null;
    const adminNext = () => {
      adminAuthCalled = true;
    };
    const adminRes = {
      status: (status: number) => {
        authErrorStatus = status;
        return {
          json: (data: any) => {
            authErrorData = data;
          }
        };
      }
    } as any;

    authorize('admin')(req, adminRes, adminNext);
    expect(adminAuthCalled).toBe(false);
    expect(authErrorStatus).toBe(403);
    expect(authErrorData.code).toBe('FORBIDDEN');
  });

  it('5. Password Reset Flow - Should generate token, reset password, and enforce single-use TTL', async () => {
    let forgotData: any = null;
    const forgotReq = { body: { email: testCandidate.email } } as any;
    const forgotRes = {
      status: (s: number) => ({ json: (d: any) => { forgotData = d; } })
    } as any;

    await forgotPassword(forgotReq, forgotRes, () => {});
    expect(forgotData).toHaveProperty('resetToken');
    const token = forgotData.resetToken;

    // Reset password with token
    let resetStatus = 0;
    const resetReq = { body: { token, newPassword: 'newpassword123' } } as any;
    const resetRes = {
      status: (s: number) => {
        resetStatus = s;
        return { json: (d: any) => {} };
      }
    } as any;

    await resetPassword(resetReq, resetRes, () => {});
    expect(resetStatus).toBe(200);

    // Single-use check: reusing same token must fail
    let reuseStatus = 0;
    const reuseRes = {
      status: (s: number) => {
        reuseStatus = s;
        return { json: (d: any) => {} };
      }
    } as any;

    await resetPassword(resetReq, reuseRes, () => {});
    expect(reuseStatus).toBe(400);
  });
});
