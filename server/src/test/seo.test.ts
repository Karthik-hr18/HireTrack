import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { generateSitemapXml } from '../controllers/sitemapController';

dotenv.config();

describe('SEO Dynamic Sitemap XML Integration Tests', () => {
  let userId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Clean tables
    await User.deleteMany({ email: /@test-seo\.com$/ });
    await Job.deleteMany({ title: /Test SEO Job/ });

    // Create Recruiter (owner of job)
    const recruiter = await User.create({
      firebaseUid: 'uid_recruiter_seo',
      name: 'SEO Recruiter',
      email: 'recruiter@test-seo.com',
      role: 'recruiter',
      isActive: true,
      isEmailVerified: true
    });
    userId = recruiter._id.toString();

    // Create open Job
    await Job.create({
      title: 'Test SEO Job 1',
      description: 'Detail content',
      requirements: 'Requirements',
      location: 'Remote',
      status: 'open',
      minExperience: 2,
      maxExperience: 5,
      createdBy: new mongoose.Types.ObjectId(userId)
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-seo\.com$/ });
    await Job.deleteMany({ createdBy: userId });
    await mongoose.connection.close();
  });

  it('1. Generate Sitemap XML - Should return valid XML layout', async () => {
    const req = {
      secure: true,
      get: (header: string) => {
        if (header === 'host') return 'hiretrack.onrender.com';
        return undefined;
      }
    } as any;

    let responseStatus = 0;
    let responseData = '';
    let responseHeaders: Record<string, string> = {};

    const res = {
      header: (name: string, value: string) => {
        responseHeaders[name] = value;
      },
      status: (status: number) => {
        responseStatus = status;
        return {
          send: (data: string) => {
            responseData = data;
          }
        };
      }
    } as any;

    await generateSitemapXml(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseHeaders['Content-Type']).toBe('application/xml');
    expect(responseData).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(responseData).toContain('<urlset');
    expect(responseData).toContain('https://hiretrack.onrender.com/jobs/');
  });
});
