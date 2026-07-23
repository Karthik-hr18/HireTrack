import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { Scorecard } from '../models/Scorecard';
import { ActivityLog } from '../models/ActivityLog';
import { submitScorecard } from '../controllers/scorecardController';

dotenv.config();

describe('Scorecard Submission & Collapsed Hiring Decision Tests', () => {
  let adminToken: string;
  let unauthorizedAdminToken: string;
  let recruiterToken: string;
  let adminId: string;
  let unauthorizedAdminId: string;
  let recruiterId: string;
  let candidateId: string;
  let jobId: string;
  let application1Id: string;
  let application2Id: string;
  let application3Id: string;
  let interview1Id: string;
  let interview2Id: string;
  let interview3Id: string;

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
    await User.deleteMany({ email: /@test-scorecard\.com$/ });
    await Job.deleteMany({ title: /Test Scorecard Job/ });
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Scorecard.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create Assigned Admin Interviewer
    const admin = await User.create({
      firebaseUid: 'uid_admin_scorecard',
      name: 'Scorecard Admin',
      email: 'admin@test-scorecard.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    adminId = admin._id.toString();

    // Create Unauthorized Admin
    const unauth = await User.create({
      firebaseUid: 'uid_unauth_admin_scorecard',
      name: 'Unauth Admin',
      email: 'unauth@test-scorecard.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    unauthorizedAdminId = unauth._id.toString();

    // Create Recruiter
    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_scorecard',
      name: 'Scorecard Recruiter',
      email: 'recruiter@test-scorecard.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    // Create Candidate
    const candidate = await User.create({
      firebaseUid: 'uid_candidate_scorecard',
      name: 'Scorecard Candidate',
      email: 'candidate@test-scorecard.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();

    // Create Job
    const job = await Job.create({
      title: 'Test Scorecard Job',
      description: 'Job description',
      requirements: 'Requirements',
      location: 'Remote',
      status: 'open',
      minExperience: 1,
      maxExperience: 3,
      createdBy: new mongoose.Types.ObjectId(recruiterId)
    });
    jobId = job._id.toString();

    // Create Application 1 (For Technical Pass Path)
    const app1 = await Application.create({
      candidate: new mongoose.Types.ObjectId(candidateId),
      job: new mongoose.Types.ObjectId(jobId),
      source: 'careers_page',
      stage: 'technical_interview_scheduled',
      resumeUrl: 'https://cloudinary.com/dummy1.pdf',
      resumeSnapshotAt: new Date(),
      phone: '9876543210',
      country: 'India',
      address: 'Test Addr',
      experience: 2,
      linkedinUrl: 'https://linkedin.com/in/testcandidate',
      termsAccepted: true
    });
    application1Id = app1._id.toString();

    // Create Technical Interview
    const int1 = await Interview.create({
      application: new mongoose.Types.ObjectId(application1Id),
      interviewer: new mongoose.Types.ObjectId(adminId),
      scheduledAt: new Date(),
      type: 'technical',
      status: 'scheduled'
    });
    interview1Id = int1._id.toString();

    // Create Application 2 (For HR Hire Path)
    const app2 = await Application.create({
      candidate: new mongoose.Types.ObjectId(candidateId),
      job: new mongoose.Types.ObjectId(jobId),
      source: 'careers_page',
      stage: 'hr_interview_scheduled',
      resumeUrl: 'https://cloudinary.com/dummy2.pdf',
      resumeSnapshotAt: new Date(),
      phone: '9876543210',
      country: 'India',
      address: 'Test Addr',
      experience: 2,
      linkedinUrl: 'https://linkedin.com/in/testcandidate',
      termsAccepted: true
    });
    application2Id = app2._id.toString();

    // Create HR Interview
    const int2 = await Interview.create({
      application: new mongoose.Types.ObjectId(application2Id),
      interviewer: new mongoose.Types.ObjectId(adminId),
      scheduledAt: new Date(),
      type: 'hr',
      status: 'scheduled'
    });
    interview2Id = int2._id.toString();

    // Create Application 3 (For HR Reject Path)
    const app3 = await Application.create({
      candidate: new mongoose.Types.ObjectId(candidateId),
      job: new mongoose.Types.ObjectId(jobId),
      source: 'careers_page',
      stage: 'hr_interview_scheduled',
      resumeUrl: 'https://cloudinary.com/dummy3.pdf',
      resumeSnapshotAt: new Date(),
      phone: '9876543210',
      country: 'India',
      address: 'Test Addr',
      experience: 2,
      linkedinUrl: 'https://linkedin.com/in/testcandidate',
      termsAccepted: true
    });
    application3Id = app3._id.toString();

    const int3 = await Interview.create({
      application: new mongoose.Types.ObjectId(application3Id),
      interviewer: new mongoose.Types.ObjectId(adminId),
      scheduledAt: new Date(),
      type: 'hr',
      status: 'scheduled'
    });
    interview3Id = int3._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-scorecard\.com$/ });
    await Job.deleteMany({ createdBy: recruiterId });
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Scorecard.deleteMany({});
    await ActivityLog.deleteMany({});
    await mongoose.connection.close();
  });

  it('1. Technical Interview Scorecard (Recommendation: Pass) - Should transition application to technical_interview_completed', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-scorecard.com', role: 'admin' },
      params: { id: interview1Id },
      body: {
        recommendation: 'pass',
        comments: 'Excellent coding structure and algorithm optimization skills.'
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

    await submitScorecard(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.recommendation).toBe('pass');

    // Verify interview status updated to completed
    const updatedInt = await Interview.findById(interview1Id);
    expect(updatedInt!.status).toBe('completed');

    // Verify application stage transitioned to technical_interview_completed
    const updatedApp = await Application.findById(application1Id);
    expect(updatedApp!.stage).toBe('technical_interview_completed');
  });

  it('2. HR Interview Scorecard (Recommendation: Hire) - Should transition application to offer', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-scorecard.com', role: 'admin' },
      params: { id: interview2Id },
      body: {
        recommendation: 'hire',
        comments: 'Great cultural fit, verified expectations.',
        communication: 5,
        cultureFit: 5,
        salaryExpectation: 95000,
        salaryOffered: 100000
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

    await submitScorecard(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData.recommendation).toBe('hire');
    expect(responseData.communication).toBe(5);

    // Verify application stage transitioned to offer
    const updatedApp = await Application.findById(application2Id);
    expect(updatedApp!.stage).toBe('offer');
  });

  it('3. HR Interview Scorecard (Recommendation: Reject) - Should transition application to rejected', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-scorecard.com', role: 'admin' },
      params: { id: interview3Id },
      body: {
        recommendation: 'reject',
        comments: 'Expectations do not align with company budget.',
        communication: 3,
        cultureFit: 2,
        salaryExpectation: 150000,
        salaryOffered: 100000
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

    await submitScorecard(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData.recommendation).toBe('reject');

    // Verify application stage transitioned to rejected
    const updatedApp = await Application.findById(application3Id);
    expect(updatedApp!.stage).toBe('rejected');
    expect(updatedApp!.rejectionReason).toBe('skills_mismatch');
  });

  it('4. Submit Scorecard (Recruiter) - Should block with 403 Forbidden', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-scorecard.com', role: 'recruiter' },
      params: { id: interview1Id },
      body: {
        recommendation: 'pass',
        comments: 'Recruiter should be blocked.'
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

    await submitScorecard(req, res, () => {});

    expect(responseStatus).toBe(403);
    expect(responseData.code).toBe('FORBIDDEN');
  });
});
