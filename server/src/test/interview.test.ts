import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { ActivityLog } from '../models/ActivityLog';
import { scheduleInterview, getAdminInterviews } from '../controllers/interviewController';

dotenv.config();

describe('Interview Scheduler Integration Tests', () => {
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

    // Seed test users
    const admin = await User.create({
      firebaseUid: 'test_int_admin_uid',
      name: 'Int Admin',
      email: 'admin@test-int.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    const recruiter = await User.create({
      firebaseUid: 'test_int_recruiter_uid',
      name: 'Int Recruiter',
      email: 'recruiter@test-int.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    const candidate = await User.create({
      firebaseUid: 'test_int_candidate_uid',
      name: 'Int Candidate',
      email: 'candidate@test-int.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();

    const job = await Job.create({
      title: 'DevOps Engineer',
      description: 'Cloud Infrastructure',
      requirements: 'Kubernetes, AWS',
      location: 'Remote',
      minExperience: 3,
      maxExperience: 7,
      status: 'open',
      createdBy: admin._id
    });
    jobId = job._id.toString();

    const app = await Application.create({
      candidate: candidate._id,
      job: job._id,
      source: 'careers_page',
      stage: 'resume_screening',
      resumeUrl: 'https://cloudinary.com/dummy.pdf',
      resumeSnapshotAt: new Date(),
      phone: '9876543210',
      country: 'India',
      address: 'Test Addr',
      experience: 4,
      linkedinUrl: 'https://linkedin.com/in/testcandidate',
      termsAccepted: true
    });
    applicationId = app._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-int\.com$/ });
    await Job.deleteMany({ _id: jobId });
    await Application.deleteMany({ _id: applicationId });
    await Interview.deleteMany({ application: applicationId });
    await ActivityLog.deleteMany({ actor: { $in: [adminId, recruiterId, candidateId] } });
    await mongoose.connection.close();
  });

  it('1. Schedule Technical Interview (Valid Admin Interviewer) - Should succeed & auto-advance stage', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-int.com', role: 'recruiter', isEmailVerified: true },
      body: {
        applicationId,
        interviewerId: adminId,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'technical'
      }
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

    await scheduleInterview(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.status).toBe('scheduled');
    expect(responseData.type).toBe('technical');
    const interviewerObj = responseData.interviewer as { _id: { toString(): string } };
    expect(interviewerObj._id.toString()).toBe(adminId);
    interviewId = (responseData._id as { toString(): string }).toString();

    // Verify application stage auto-advanced to technical_interview_scheduled
    const updatedApp = await Application.findById(applicationId);
    expect(updatedApp!.stage).toBe('technical_interview_scheduled');

    // Verify timeline activity log
    const log = await ActivityLog.findOne({ entityId: applicationId, action: 'stage_changed' }).sort({ createdAt: -1 });
    expect((log!.metadata as Record<string, unknown>).to).toBe('technical_interview_scheduled');
  });

  it('2. Schedule Interview (Invalid Interviewer Role) - Should fail with 400', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-int.com', role: 'recruiter', isEmailVerified: true },
      body: {
        applicationId,
        interviewerId: candidateId, // Candidate is not allowed to conduct interviews
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'technical'
      }
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

    // Reset candidate stage to screening so it passes first gate checks
    await Application.findByIdAndUpdate(applicationId, { stage: 'resume_screening' });

    await scheduleInterview(req, res, () => {});

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('BAD_REQUEST');
    expect((responseData.message as string)).toContain('Admin interviewers');
  });

  it('3. Admin Retrieve Assigned Interviews - Should return queue list matching Admin ID', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-int.com', role: 'admin', isEmailVerified: true },
      query: { status: 'scheduled' }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: Array<{ _id: { toString(): string } }> = [];

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: Array<{ _id: { toString(): string } }>) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getAdminInterviews(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.length).toBe(1);
    expect(responseData[0]._id.toString()).toBe(interviewId);
  });
});
