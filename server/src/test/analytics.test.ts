import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { getDashboardMetrics } from '../controllers/analyticsController';

dotenv.config();

describe('Dashboard Analytics Integration Tests', () => {
  let adminToken: string;
  let recruiterToken: string;
  let candidateToken: string;
  let adminId: string;
  let recruiterId: string;
  let candidateId: string;
  let jobId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Clean tables
    await User.deleteMany({ email: /@test-analytics\.com$/ });
    await Job.deleteMany({ title: /Test Analytics Job/ });
    await Application.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Analytics Admin',
      email: 'admin@test-analytics.com',
      passwordHash: 'dummy',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ id: adminId, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Recruiter
    const recruiter = await User.create({
      name: 'Analytics Recruiter',
      email: 'recruiter@test-analytics.com',
      passwordHash: 'dummy',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();
    recruiterToken = jwt.sign({ id: recruiterId, email: recruiter.email, role: recruiter.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Candidate
    const candidate = await User.create({
      name: 'Analytics Candidate',
      email: 'candidate@test-analytics.com',
      passwordHash: 'dummy',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();
    candidateToken = jwt.sign({ id: candidateId, email: candidate.email, role: candidate.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create open Job
    const job = await Job.create({
      title: 'Test Analytics Job',
      description: 'Role info',
      requirements: 'Requirements',
      location: 'Remote',
      status: 'open',
      minExperience: 1,
      maxExperience: 3,
      createdBy: new mongoose.Types.ObjectId(recruiterId)
    });
    jobId = job._id.toString();

    // Create Stale Application (updated 10 days ago) for Needs Attention test
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const app = new Application({
      candidate: new mongoose.Types.ObjectId(candidateId),
      job: new mongoose.Types.ObjectId(jobId),
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
      user: { id: adminId, email: 'admin@test-analytics.com', role: 'admin' }
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

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData).toHaveProperty('totalActiveJobs');
    expect(responseData).toHaveProperty('totalApplications');
    expect(responseData).toHaveProperty('stageDistribution');
    expect(responseData).toHaveProperty('needsAttention');
    expect(responseData.totalActiveJobs).toBe(1);
    expect(responseData.totalApplications).toBe(1);
    expect(responseData.stageDistribution.resume_screening).toBe(1);
    expect(responseData.needsAttention.length).toBe(1); // Stale application is caught
  });

  it('2. Retrieve Dashboard Metrics (Recruiter Access) - Should succeed', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-analytics.com', role: 'recruiter' }
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

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.totalActiveJobs).toBe(1);
  });

  it('3. Retrieve Dashboard Metrics (Candidate Access Gated) - Should fail with 403', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-analytics.com', role: 'candidate' }
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

    await getDashboardMetrics(req, res, () => {});

    expect(responseStatus).toBe(403);
    expect(responseData.code).toBe('FORBIDDEN');
  });
});
