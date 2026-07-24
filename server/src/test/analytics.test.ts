import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { getDashboardMetrics } from '../controllers/analyticsController';

dotenv.config();

describe('Executive Analytics & Stale Application Alerting Tests', () => {
  let adminId: string;
  let recruiterId: string;
  let candidateId: string;
  let jobId: string;
  let applicationId: string;

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
    await User.deleteMany({ email: /@test-analytics\.com$/ });
    await Job.deleteMany({ title: 'Analytics Test Engineer' });
    await Application.deleteMany({});

    // Seed test users
    const admin = await User.create({
      firebaseUid: 'uid_admin_analytics',
      name: 'Analytics Admin',
      email: 'admin@test-analytics.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_analytics',
      name: 'Analytics Recruiter',
      email: 'recruiter@test-analytics.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    const candidate = await User.create({
      firebaseUid: 'uid_candidate_analytics',
      name: 'Analytics Candidate',
      email: 'candidate@test-analytics.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();

    const job = await Job.create({
      title: 'Analytics Test Engineer',
      description: 'Role details',
      requirements: 'Qualifications',
      location: 'Remote',
      status: 'open',
      minExperience: 1,
      maxExperience: 4,
      createdBy: recruiter._id
    });
    jobId = job._id.toString();

    // Create a stale application (> 7 days old without activity)
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const app = new Application({
      candidate: candidate._id,
      job: job._id,
      source: 'careers_page',
      stage: 'resume_screening',
      resumeUrl: 'https://cloudinary.com/dummy.pdf',
      resumeSnapshotAt: new Date(),
      phone: '9876543210',
      country: 'India',
      address: 'Test Addr',
      experience: 2,
      linkedinUrl: 'https://linkedin.com/in/testcandidate',
      termsAccepted: true
    });
    await app.save();
    applicationId = app._id.toString();

    // Bypass timestamps update by setting manually and saving
    app.createdAt = tenDaysAgo;
    app.updatedAt = tenDaysAgo;
    await app.save();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-analytics\.com$/ });
    await Job.deleteMany({ createdBy: recruiterId });
    await Application.deleteMany({});
    await mongoose.connection.close();
  });

  it('1. Retrieve Dashboard Metrics (Admin Access) - Should succeed', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-analytics.com', role: 'admin', isEmailVerified: true }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: Record<string, unknown> = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData).toHaveProperty('totalActiveJobs');
    expect(responseData).toHaveProperty('totalApplications');
    expect(responseData).toHaveProperty('stageDistribution');
    expect(responseData).toHaveProperty('needsAttention');
    expect(responseData.totalActiveJobs).toBe(1);
    expect(responseData.totalApplications).toBe(1);
    const stageDist = responseData.stageDistribution as Record<string, number>;
    expect(stageDist.resume_screening).toBe(1);
    const needsAttn = responseData.needsAttention as unknown[];
    expect(needsAttn.length).toBe(1); // Stale application is caught
  });

  it('2. Retrieve Dashboard Metrics (Recruiter Access) - Should succeed', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-analytics.com', role: 'recruiter', isEmailVerified: true }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: Record<string, unknown> = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.totalActiveJobs).toBe(1);
  });

  it('3. Retrieve Dashboard Metrics (Candidate Access Gated) - Should fail with 403', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-analytics.com', role: 'candidate', isEmailVerified: true }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: Record<string, unknown> = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(403);
    expect(responseData.code).toBe('FORBIDDEN');
  });
});
