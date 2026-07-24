import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { ActivityLog } from '../models/ActivityLog';
import {
  applyToJob,
  getManageApplications,
  getApplicationById,
  advanceApplication,
  rejectApplication,
  addApplicationNote
} from '../controllers/applicationController';

dotenv.config();

describe('Application Lifecycle & Pipeline State Machine Integration Tests', () => {
  let adminId: string;
  let recruiterId: string;
  let candidateId: string;
  let jobId: string;
  let createdAppId: string;

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

    // Seed test users & job
    const admin = await User.create({
      firebaseUid: 'test_app_admin_uid',
      name: 'App Admin',
      email: 'admin@test-app.com',
      role: 'admin',
      isActive: true
    });
    adminId = admin._id.toString();

    const recruiter = await User.create({
      firebaseUid: 'test_app_recruiter_uid',
      name: 'App Recruiter',
      email: 'recruiter@test-app.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    const candidate = await User.create({
      firebaseUid: 'test_app_candidate_uid',
      name: 'App Candidate',
      email: 'candidate@test-app.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();

    const job = await Job.create({
      title: 'Full Stack Engineer',
      description: 'Build Node & React apps',
      requirements: 'TypeScript, MongoDB',
      location: 'Remote',
      minExperience: 2,
      maxExperience: 5,
      status: 'open',
      createdBy: admin._id
    });
    jobId = job._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-app\.com$/ });
    await Job.deleteMany({ _id: jobId });
    await Application.deleteMany({ candidate: candidateId });
    await ActivityLog.deleteMany({ actor: { $in: [adminId, recruiterId, candidateId] } });
    await mongoose.connection.close();
  });

  it('1. Submit Application - Should create candidate application and trigger stage_changed log', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate', isEmailVerified: true },
      file: {
        buffer: Buffer.from('%PDF-1.4 mock PDF content'),
        originalname: 'my_resume.pdf',
        mimetype: 'application/pdf'
      },
      body: {
        jobId,
        source: 'linkedin',
        phone: '9876543210',
        country: 'India',
        address: '123 Main St, Bengaluru',
        experience: '3', 
        linkedinUrl: 'https://linkedin.com/in/testcandidate',
        termsAccepted: 'true'
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

    await applyToJob(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.stage).toBe('applied');
    expect(responseData.phone).toBe('9876543210');
    expect(responseData.experience).toBe(3);
    createdAppId = (responseData._id as { toString(): string }).toString();

    // Verify stage_changed activity log was generated
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' });
    expect(log).not.toBeNull();
    expect((log!.metadata as Record<string, unknown>).to).toBe('applied');
  });

  it('2. Ineligible Experience (Fresher/Low Exp) - Should be blocked', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate', isEmailVerified: true },
      file: {
        buffer: Buffer.from('%PDF-1.4 mock PDF content'),
        originalname: 'my_resume.pdf',
        mimetype: 'application/pdf'
      },
      body: {
        jobId,
        source: 'linkedin',
        phone: '9876543210',
        country: 'India',
        address: '123 Main St, Bengaluru',
        experience: '0', 
        linkedinUrl: 'https://linkedin.com/in/testcandidate',
        termsAccepted: 'true'
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

    await applyToJob(req, res, () => {});

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('EXPERIENCE_MISMATCH');
    expect((responseData.message as string)).toContain('not eligible');
  });

  it('3. Prevent Duplicate Active Application - Should return 400 with ACTIVE_APPLICATION_EXISTS', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate', isEmailVerified: true },
      file: {
        buffer: Buffer.from('%PDF-1.4 mock PDF content'),
        originalname: 'another_resume.pdf',
        mimetype: 'application/pdf'
      },
      body: {
        jobId,
        source: 'linkedin',
        phone: '9876543210',
        country: 'India',
        address: '123 Main St, Bengaluru',
        experience: '4',
        linkedinUrl: 'https://linkedin.com/in/testcandidate',
        termsAccepted: 'true'
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

    await applyToJob(req, res, () => {});

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('ACTIVE_APPLICATION_EXISTS');
  });

  it('4. Recruiter Get All Applications - Should return list of applications', async () => {
    const req = {
      query: { jobId }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: { applications?: unknown[]; total?: number } = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: { applications?: unknown[]; total?: number }) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getManageApplications(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.applications?.length).toBeGreaterThan(0);
    expect(responseData.total).toBe(1);
  });

  it('5. Recruiter Get Single Application - Should return detail profile & logs', async () => {
    const req = {
      params: { id: createdAppId }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: { application?: { _id: { toString(): string } }; timeline?: unknown[] } = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: { application?: { _id: { toString(): string } }; timeline?: unknown[] }) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await getApplicationById(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.application?._id.toString()).toBe(createdAppId);
    expect(responseData.timeline?.length).toBeGreaterThan(0);
  });

  it('6. Recruiter Add Note - Should append note item', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter', isEmailVerified: true },
      params: { id: createdAppId },
      body: { text: 'Candidate has decent communication skills.' }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: { notes?: Array<{ text: string }> } = {};

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: { notes?: Array<{ text: string }> }) => {
            responseData = data;
          }
        };
      }
    } as unknown as Response;

    await addApplicationNote(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.notes?.length).toBe(1);
    expect(responseData.notes?.[0].text).toBe('Candidate has decent communication skills.');

    // Check log
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'note_added' });
    expect(log).not.toBeNull();
  });

  it('7. Recruiter Advance Candidate Stage - Should transition stage forward', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter', isEmailVerified: true },
      params: { id: createdAppId }
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

    await advanceApplication(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.stage).toBe('resume_screening');
  });

  it('8. Recruiter Reject Candidate - Should transition stage to rejected with reason', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter', isEmailVerified: true },
      params: { id: createdAppId },
      body: {
        rejectionReason: 'skills_mismatch',
        rejectionNote: 'Lacks React Server Components experience.'
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

    await rejectApplication(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.stage).toBe('rejected');

    // Check log
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' }).sort({ createdAt: -1 });
    const meta = log!.metadata as Record<string, unknown>;
    expect(meta.to).toBe('rejected');
    expect(meta.reason).toBe('skills_mismatch');
  });
});
