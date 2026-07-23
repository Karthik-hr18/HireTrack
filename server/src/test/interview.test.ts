import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { ActivityLog } from '../models/ActivityLog';
import { scheduleInterview, getAdminInterviews } from '../controllers/interviewController';

dotenv.config();

describe('Interview Scheduler Integration Tests', () => {
  let adminToken: string;
  let recruiterToken: string;
  let candidateToken: string;
  let adminId: string;
  let recruiterId: string;
  let candidateId: string;
  let jobId: string;
  let applicationId: string;
  let interviewId: string;

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
    await User.deleteMany({ email: /@test-int\.com$/ });
    await Job.deleteMany({ title: /Test Int Job/ });
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create Admin (Interviewer)
    const admin = await User.create({
      firebaseUid: 'uid_admin_int',
      name: 'Int Admin',
      email: 'admin@test-int.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    // Create Recruiter (Scheduler)
    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_int',
      name: 'Int Recruiter',
      email: 'recruiter@test-int.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    // Create Candidate
    const candidate = await User.create({
      firebaseUid: 'uid_candidate_int',
      name: 'Int Candidate',
      email: 'candidate@test-int.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();
    candidateToken = jwt.sign({ id: candidateId, email: candidate.email, role: candidate.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Job
    const job = await Job.create({
      title: 'Test Int Job - Product Manager',
      description: 'Role details',
      requirements: 'Qualifications',
      location: 'Remote',
      status: 'open',
      minExperience: 1,
      maxExperience: 4,
      createdBy: new mongoose.Types.ObjectId(recruiterId)
    });
    jobId = job._id.toString();

    // Create Application
    const application = await Application.create({
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
    applicationId = application._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-int\.com$/ });
    await Job.deleteMany({ createdBy: recruiterId });
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await ActivityLog.deleteMany({});
    await mongoose.connection.close();
  });

  it('1. Schedule Technical Interview (Valid Admin Interviewer) - Should succeed & auto-advance stage', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-int.com', role: 'recruiter' },
      body: {
        applicationId,
        interviewerId: adminId,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'technical'
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

    await scheduleInterview(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.status).toBe('scheduled');
    expect(responseData.type).toBe('technical');
    expect(responseData.interviewer._id.toString()).toBe(adminId);
    interviewId = responseData._id.toString();

    // Verify application stage auto-advanced to technical_interview_scheduled
    const updatedApp = await Application.findById(applicationId);
    expect(updatedApp!.stage).toBe('technical_interview_scheduled');

    // Verify timeline activity log
    const log = await ActivityLog.findOne({ entityId: applicationId, action: 'stage_changed' }).sort({ createdAt: -1 });
    expect(log!.metadata.to).toBe('technical_interview_scheduled');
  });

  it('2. Schedule Interview (Invalid Interviewer Role) - Should fail with 400', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-int.com', role: 'recruiter' },
      body: {
        applicationId,
        interviewerId: candidateId, // Candidate is not allowed to conduct interviews
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'technical'
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

    // Reset candidate stage to screening so it passes first gate checks
    await Application.findByIdAndUpdate(applicationId, { stage: 'resume_screening' });

    await scheduleInterview(req, res, () => {});

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('BAD_REQUEST');
    expect(responseData.message).toContain('Admin interviewers');
  });

  it('3. Admin Retrieve Assigned Interviews - Should return queue list matching Admin ID', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-int.com', role: 'admin' },
      query: { status: 'scheduled' }
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

    await getAdminInterviews(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.length).toBe(1);
    expect(responseData[0]._id.toString()).toBe(interviewId);
  });
});
