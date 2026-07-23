import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { ActivityLog } from '../models/ActivityLog';
import { createJob, getPublicJobs, getManageJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController';

dotenv.config();

describe('Job CRUD & Visibility Gating Tests', () => {
  let adminToken: string;
  let candidateToken: string;
  let adminId: string;
  let candidateId: string;
  let createdJobId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Clean up past test accounts/jobs
    await User.deleteMany({ email: /@test-job\.com$/ });
    await Job.deleteMany({ title: /Test Job/ });

    // Create Admin
    const adminUser = await User.create({
      firebaseUid: 'uid_admin_job',
      name: 'Test Admin',
      email: 'admin@test-job.com',
      role: 'admin',
      isActive: true
    });
    adminId = adminUser._id.toString();

    // Create Candidate
    const candidateUser = await User.create({
      firebaseUid: 'uid_candidate_job',
      name: 'Test Candidate',
      email: 'candidate@test-job.com',
      role: 'candidate',
      isActive: true
    });
    candidateId = candidateUser._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-job\.com$/ });
    await Job.deleteMany({ createdBy: adminId });
    await ActivityLog.deleteMany({ actor: adminId });
    await mongoose.connection.close();
  });

  it('1. Create Job (Admin) - Should succeed and log event', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      body: {
        title: 'Test Job - SDE 1',
        description: 'We are looking for a full stack engineer',
        requirements: 'React, Node.js',
        location: 'Bengaluru'
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

    await createJob(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.title).toBe('Test Job - SDE 1');
    expect(responseData.status).toBe('open');
    expect(responseData.deletedAt).toBeNull();
    createdJobId = responseData._id.toString();

    // Verify activity log was written
    const log = await ActivityLog.findOne({ entityId: createdJobId, action: 'job_created' });
    expect(log).not.toBeNull();
    expect(log!.actor.toString()).toBe(adminId);
  });

  it('2. Get Public Jobs - Should return the newly created open job', async () => {
    const req = {
      query: { page: '1', limit: '10' }
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

    await getPublicJobs(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.jobs.length).toBeGreaterThanOrEqual(1);
    const foundJob = responseData.jobs.find((j: any) => j._id.toString() === createdJobId);
    expect(foundJob).toBeDefined();
    expect(foundJob.status).toBe('open');
  });

  it('3. Update Job (Admin) - Should modify fields and record status update activity log', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId },
      body: {
        title: 'Test Job - SDE 2',
        status: 'closed'
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

    await updateJob(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.title).toBe('Test Job - SDE 2');
    expect(responseData.status).toBe('closed');

    // Verify update log exists and contains status changes
    const log = await ActivityLog.findOne({ entityId: createdJobId, action: 'job_updated' });
    expect(log).not.toBeNull();
    expect(log!.metadata.statusChange).toBeDefined();
    expect(log!.metadata.statusChange.from).toBe('open');
    expect(log!.metadata.statusChange.to).toBe('closed');
  });

  it('4. Get Closed Job - Candidate vs Staff visibility rules', async () => {
    // 4a. Candidates should get 404 on closed jobs
    const reqCandidate = {
      user: { id: candidateId, email: 'candidate@test-job.com', role: 'candidate' },
      params: { id: createdJobId }
    } as any;

    let candidateStatus = 0;
    const resCandidate = {
      status: (status: number) => {
        candidateStatus = status;
        return { json: (data: any) => {} };
      }
    } as any;

    await getJobById(reqCandidate, resCandidate, () => {});
    expect(candidateStatus).toBe(404);

    // 4b. Admins/Recruiters should successfully retrieve closed jobs
    const reqAdmin = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId }
    } as any;

    let adminStatus = 0;
    let adminData: any = null;
    const resAdmin = {
      status: (status: number) => {
        adminStatus = status;
        return {
          json: (data: any) => {
            adminData = data;
          }
        };
      }
    } as any;

    await getJobById(reqAdmin, resAdmin, () => {});
    expect(adminStatus).toBe(200);
    expect(adminData._id.toString()).toBe(createdJobId);
  });

  it('5. Soft Delete Job (Admin) - Should flag deletedAt and hide from listings', async () => {
    const reqDelete = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId }
    } as any;

    let deleteStatus = 0;
    let deleteData: any = null;
    const resDelete = {
      status: (status: number) => {
        deleteStatus = status;
        return {
          json: (data: any) => {
            deleteData = data;
          }
        };
      }
    } as any;

    await deleteJob(reqDelete, resDelete, () => {});
    expect(deleteStatus).toBe(200);
    expect(deleteData.deletedAt).not.toBeNull();

    // Verify it is not returned in public search listings
    const reqList = { query: {} } as any;
    let listData: any = null;
    const resList = {
      status: (status: number) => ({
        json: (data: any) => {
          listData = data;
        }
      })
    } as any;

    await getPublicJobs(reqList, resList, () => {});
    const deletedJobInPublic = listData.jobs.find((j: any) => j._id.toString() === createdJobId);
    expect(deletedJobInPublic).toBeUndefined();
  });
});
