import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { ActivityLog } from '../models/ActivityLog';
import { applyToJob, getCandidateApplications } from '../controllers/applicationController';

dotenv.config();

describe('Candidate Application Submission & Duplicate Prevention Tests', () => {
  let candidateToken: string;
  let recruiterToken: string;
  let candidateId: string;
  let recruiterId: string;
  let jobId: string;
  let createdAppId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Clean databases
    await User.deleteMany({ email: /@test-app\.com$/ });
    await Job.deleteMany({ title: /Test App Job/ });
    await Application.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create Candidate
    const candidate = await User.create({
      name: 'App Candidate',
      email: 'candidate@test-app.com',
      passwordHash: 'dummy',
      role: 'candidate',
      isActive: true
    });
    candidateId = candidate._id.toString();
    candidateToken = jwt.sign({ id: candidateId, email: candidate.email, role: candidate.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Recruiter
    const recruiter = await User.create({
      name: 'App Recruiter',
      email: 'recruiter@test-app.com',
      passwordHash: 'dummy',
      role: 'recruiter',
      isActive: true
    });
    recruiterId = recruiter._id.toString();
    recruiterToken = jwt.sign({ id: recruiterId, email: recruiter.email, role: recruiter.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Open Job
    const job = await Job.create({
      title: 'Test App Job - Frontend Developer',
      description: 'Test description',
      requirements: 'React expert',
      location: 'Remote',
      status: 'open',
      createdBy: new mongoose.Types.ObjectId(recruiterId)
    });
    jobId = job._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-app\.com$/ });
    await Job.deleteMany({ createdBy: recruiterId });
    await Application.deleteMany({});
    await ActivityLog.deleteMany({});
    await mongoose.connection.close();
  });

  it('1. Submit Application (Candidate) - Should succeed, upload mock PDF, and log stage_changed', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' },
      file: {
        buffer: Buffer.from('%PDF-1.4 mock PDF content'),
        originalname: 'my_resume.pdf',
        mimetype: 'application/pdf'
      },
      body: {
        jobId,
        source: 'linkedin'
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

    await applyToJob(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.stage).toBe('applied');
    expect(responseData.source).toBe('linkedin');
    expect(responseData.resumeUrl).toContain('my_resume.pdf');
    createdAppId = responseData._id.toString();

    // Verify stage_changed activity log was generated
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' });
    expect(log).not.toBeNull();
    expect(log!.metadata.to).toBe('applied');
  });

  it('2. Prevent Duplicate Application - Should return 400 with ACTIVE_APPLICATION_EXISTS', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' },
      file: {
        buffer: Buffer.from('%PDF-1.4 mock PDF content'),
        originalname: 'another_resume.pdf',
        mimetype: 'application/pdf'
      },
      body: { jobId }
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

    await applyToJob(req, res, () => {});

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('ACTIVE_APPLICATION_EXISTS');
  });

  it('3. Get Candidate Applications - Should return list containing the submission', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' }
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

    await getCandidateApplications(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.length).toBe(1);
    expect(responseData[0]._id.toString()).toBe(createdAppId);
    expect(responseData[0].job._id.toString()).toBe(jobId);
  });
});
