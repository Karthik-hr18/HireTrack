import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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

    // Create Verified Candidate
    const candidate = await User.create({
      firebaseUid: 'uid_candidate_app',
      name: 'App Candidate',
      email: 'candidate@test-app.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });
    candidateId = candidate._id.toString();

    // Create Recruiter
    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_app',
      name: 'App Recruiter',
      email: 'recruiter@test-app.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    recruiterId = recruiter._id.toString();

    // Create Open Job requiring min 2 years experience
    const job = await Job.create({
      title: 'Test App Job - Frontend Developer',
      description: 'Test description',
      requirements: 'React expert',
      location: 'Remote',
      status: 'open',
      minExperience: 2,
      maxExperience: 5,
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

  it('1. Submit Application (Verified Candidate with Eligible Experience) - Should succeed', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' },
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
        experience: '3', // Passed as string from multipart form
        linkedinUrl: 'https://linkedin.com/in/testcandidate',
        termsAccepted: 'true'
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
    expect(responseData.phone).toBe('9876543210');
    expect(responseData.experience).toBe(3);
    createdAppId = responseData._id.toString();

    // Verify stage_changed activity log was generated
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' });
    expect(log).not.toBeNull();
    expect(log!.metadata.to).toBe('applied');
  });

  it('2. Ineligible Experience (Fresher/Low Exp) - Should be blocked', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' },
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
        experience: '0', // Fresher
        linkedinUrl: 'https://linkedin.com/in/testcandidate',
        termsAccepted: 'true'
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

    expect(responseStatus).toBe(400);
    expect(responseData.code).toBe('EXPERIENCE_MISMATCH');
    expect(responseData.message).toContain('not eligible');
  });

  it('3. Prevent Duplicate Active Application - Should return 400 with ACTIVE_APPLICATION_EXISTS', async () => {
    const req = {
      user: { id: candidateId, email: 'candidate@test-app.com', role: 'candidate' },
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

  it('4. Recruiter Get All Applications - Should return list of applications', async () => {
    const req = {
      query: { jobId }
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

    await getManageApplications(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.applications.length).toBeGreaterThan(0);
    expect(responseData.total).toBe(1);
  });

  it('5. Recruiter Get Single Application - Should return detail profile & logs', async () => {
    const req = {
      params: { id: createdAppId }
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

    await getApplicationById(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.application._id.toString()).toBe(createdAppId);
    expect(responseData.timeline.length).toBeGreaterThan(0);
  });

  it('6. Recruiter Add Note - Should append note item', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter' },
      params: { id: createdAppId },
      body: { text: 'Candidate has decent communication skills.' }
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

    await addApplicationNote(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.notes.length).toBe(1);
    expect(responseData.notes[0].text).toBe('Candidate has decent communication skills.');

    // Check log
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'note_added' });
    expect(log).not.toBeNull();
  });

  it('7. Recruiter Advance Candidate Stage - Should transition stage forward', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter' },
      params: { id: createdAppId }
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

    await advanceApplication(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.stage).toBe('resume_screening');

    // Check log
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' }).sort({ createdAt: -1 });
    expect(log!.metadata.to).toBe('resume_screening');
  });

  it('8. Recruiter Reject Candidate - Should transition stage to rejected with reason', async () => {
    const req = {
      user: { id: recruiterId, email: 'recruiter@test-app.com', role: 'recruiter' },
      params: { id: createdAppId },
      body: {
        rejectionReason: 'skills_mismatch',
        rejectionNote: 'Lacks React Server Components experience.'
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

    await rejectApplication(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.stage).toBe('rejected');
    expect(responseData.rejectionReason).toBe('skills_mismatch');

    // Check log
    const log = await ActivityLog.findOne({ entityId: createdAppId, action: 'stage_changed' }).sort({ createdAt: -1 });
    expect(log!.metadata.to).toBe('rejected');
    expect(log!.metadata.reason).toBe('skills_mismatch');
  });
});
