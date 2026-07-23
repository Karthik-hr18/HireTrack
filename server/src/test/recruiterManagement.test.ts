import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { getRecruiters, createRecruiter, updateRecruiter, toggleRecruiterStatus } from '../controllers/userController';

dotenv.config();

describe('Admin Recruiter Management Integration Tests', () => {
  let adminToken: string;
  let recruiterToken: string;
  let adminId: string;
  let recruiterId: string;
  let createdRecruiterId: string;

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

    // Clean tables
    await User.deleteMany({ email: /@test-manage-rec\.com$/ });

    // Create Admin
    const admin = await User.create({
      firebaseUid: 'uid_admin_mgmt',
      name: 'Mgmt Admin',
      email: 'admin@test-manage-rec.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    // Create Recruiter
    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_mgmt',
      name: 'Mgmt Recruiter',
      email: 'recruiter@test-manage-rec.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-manage-rec\.com$/ });
    await mongoose.connection.close();
  });

  it('1. Create Recruiter (Admin Access) - Should succeed', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-manage-rec.com', role: 'admin' },
      body: {
        name: 'New Recruiter Profile',
        email: 'newrec@test-manage-rec.com',
        password: 'securePassword123'
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

    await createRecruiter(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.name).toBe('New Recruiter Profile');
    expect(responseData.role).toBe('recruiter');
    expect(responseData.isActive).toBe(true);
    createdRecruiterId = responseData._id.toString();
  });

  it('2. Create Recruiter (Recruiter Access Blocked) - Should fail with 403', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-manage-rec.com', role: 'recruiter' },
      body: {
        name: 'Illegal Recruiter',
        email: 'illegal@test-manage-rec.com',
        password: 'securePassword123'
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

    await createRecruiter(req, res, () => {});

    expect(responseStatus).toBe(403);
    expect(responseData.code).toBe('FORBIDDEN');
  });

  it('3. Retrieve Recruiters List (Admin Access) - Should return recruiter directory', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-manage-rec.com', role: 'admin' }
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

    await getRecruiters(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.length).toBeGreaterThanOrEqual(2); // The original + the newly created one
  });

  it('4. Update Recruiter Details (Admin Access) - Should succeed', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-manage-rec.com', role: 'admin' },
      params: { id: createdRecruiterId },
      body: {
        name: 'Updated Recruiter Name',
        email: 'newrec-updated@test-manage-rec.com'
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

    await updateRecruiter(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.name).toBe('Updated Recruiter Name');
    expect(responseData.email).toBe('newrec-updated@test-manage-rec.com');
  });

  it('5. Toggle Recruiter Active Flag (Admin Access) - Should deactivate profile', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-manage-rec.com', role: 'admin' },
      params: { id: createdRecruiterId }
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

    await toggleRecruiterStatus(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.isActive).toBe(false); // Toggle active state from true to false
  });
});
