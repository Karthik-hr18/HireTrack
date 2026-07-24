import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { ActivityLog } from '../models/ActivityLog';
import { createJob, getPublicJobs, getManageJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController';

dotenv.config();

describe('Job CRUD & Visibility Gating Tests', () => {
  let adminId: string;
  let candidateId: string;
  let createdJobId: string;

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

    await createJob(req, res, () => {});

    expect(responseStatus).toBe(201);
    expect(responseData).toHaveProperty('_id');
    expect(responseData.title).toBe('Test Job - SDE 1');
    expect(responseData.status).toBe('open');
    expect(responseData.deletedAt).toBeNull();
    createdJobId = (responseData._id as { toString(): string }).toString();

    // Verify activity log was written
    const log = await ActivityLog.findOne({ entityId: createdJobId, action: 'job_created' });
    expect(log).not.toBeNull();
    expect(log!.actor.toString()).toBe(adminId);
  });

  it('2. Get Public Jobs - Should return the newly created open job', async () => {
    const req = {
      query: { page: '1', limit: '10' }
    } as unknown as Request;

    let responseStatus = 0;
    let responseData: { jobs: Array<{ _id: { toString(): string }; status: string }> } = { jobs: [] };

    const res = {
      status: (status: number) => {
        responseStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            responseData = data as { jobs: Array<{ _id: { toString(): string }; status: string }> };
          }
        };
      }
    } as unknown as Response;

    await getPublicJobs(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.jobs.length).toBeGreaterThanOrEqual(1);
    const foundJob = responseData.jobs.find((j) => j._id.toString() === createdJobId);
    expect(foundJob).toBeDefined();
    expect(foundJob!.status).toBe('open');
  });

  it('3. Update Job (Admin) - Should modify fields and record status update activity log', async () => {
    const req = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId },
      body: {
        title: 'Test Job - SDE 2',
        status: 'closed'
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

    await updateJob(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.title).toBe('Test Job - SDE 2');
    expect(responseData.status).toBe('closed');

    // Verify update log exists and contains status changes
    const log = await ActivityLog.findOne({ entityId: createdJobId, action: 'job_updated' });
    expect(log).not.toBeNull();
    const metadata = log!.metadata as Record<string, unknown>;
    const statusChange = metadata.statusChange as { from: string; to: string };
    expect(statusChange).toBeDefined();
    expect(statusChange.from).toBe('open');
    expect(statusChange.to).toBe('closed');
  });

  it('4. Get Closed Job - Candidate vs Staff visibility rules', async () => {
    // 4a. Candidates should get 404 on closed jobs
    const reqCandidate = {
      user: { id: candidateId, email: 'candidate@test-job.com', role: 'candidate' },
      params: { id: createdJobId }
    } as unknown as Request;

    let candidateStatus = 0;
    const resCandidate = {
      status: (status: number) => {
        candidateStatus = status;
        return { json: (data: Record<string, unknown>) => {} };
      }
    } as unknown as Response;

    await getJobById(reqCandidate, resCandidate, () => {});
    expect(candidateStatus).toBe(404);

    // 4b. Admins/Recruiters should successfully retrieve closed jobs
    const reqAdmin = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId }
    } as unknown as Request;

    let adminStatus = 0;
    let adminData: Record<string, unknown> = {};
    const resAdmin = {
      status: (status: number) => {
        adminStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            adminData = data;
          }
        };
      }
    } as unknown as Response;

    await getJobById(reqAdmin, resAdmin, () => {});
    expect(adminStatus).toBe(200);
    expect((adminData._id as { toString(): string }).toString()).toBe(createdJobId);
  });

  it('5. Soft Delete Job (Admin) - Should flag deletedAt and hide from listings', async () => {
    const reqDelete = {
      user: { id: adminId, email: 'admin@test-job.com', role: 'admin' },
      params: { id: createdJobId }
    } as unknown as Request;

    let deleteStatus = 0;
    let deleteData: Record<string, unknown> = {};
    const resDelete = {
      status: (status: number) => {
        deleteStatus = status;
        return {
          json: (data: Record<string, unknown>) => {
            deleteData = data;
          }
        };
      }
    } as unknown as Response;

    await deleteJob(reqDelete, resDelete, () => {});
    expect(deleteStatus).toBe(200);
    expect(deleteData.deletedAt).not.toBeNull();

    // Verify it is not returned in public search listings
    const reqList = { query: {} } as unknown as Request;
    let listData: { jobs: Array<Record<string, unknown>> } = { jobs: [] };
    const resList = {
      status: (status: number) => ({
        json: (data: Record<string, unknown>) => {
          listData = data as { jobs: Array<Record<string, unknown>> };
        }
      })
    } as unknown as Response;

    await getPublicJobs(reqList, resList, () => {});
    const deletedJobInPublic = (listData.jobs as Array<{ _id: { toString(): string } }>).find((j) => j._id.toString() === createdJobId);
    expect(deletedJobInPublic).toBeUndefined();
  });
});
