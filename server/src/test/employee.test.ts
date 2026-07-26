import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { getEmployees, getEmployeeStatsAndTeams, getEmployeeById } from '../controllers/employeeController';

dotenv.config();

describe('Employees Module & Headcount Analytics Tests', () => {
  let adminUser: any;
  let candidateUser: any;
  let testJob: any;
  let hiredApp: any;
  let adminToken: string;
  let candidateToken: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Test aborted: MONGO_URI is not defined.');
    }
    await mongoose.connect(mongoUri, { dbName: 'hiretrack_test' });

    // Cleanup test artifacts
    await User.deleteMany({ email: /@test-employee\.com$/ });
    await Job.deleteMany({ title: /Test Employee Job/ });
    await Application.deleteMany({ phone: '+91 9999999999' });

    // Create Admin User
    adminUser = await User.create({
      firebaseUid: 'test_admin_emp_uid',
      name: 'Employee Test Admin',
      email: 'admin@test-employee.com',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    adminToken = jwt.sign(
      { id: adminUser._id.toString(), email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    // Create Candidate User
    candidateUser = await User.create({
      firebaseUid: 'test_candidate_emp_uid',
      name: 'Hired Candidate',
      email: 'hired@test-employee.com',
      role: 'candidate',
      isActive: true,
      isEmailVerified: true
    });

    candidateToken = jwt.sign(
      { id: candidateUser._id.toString(), email: candidateUser.email, role: candidateUser.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    // Create Test Job with requiredHeadcount = 3
    testJob = await Job.create({
      title: 'Test Employee Job',
      description: 'Role for employee tests',
      requirements: 'TypeScript, Node.js',
      location: 'Bangalore, India',
      department: 'Engineering',
      minExperience: 2,
      maxExperience: 5,
      vacancies: 2,
      requiredHeadcount: 3,
      status: 'open',
      createdBy: adminUser._id
    });

    // Create Hired Application with embedded employment data
    hiredApp = await Application.create({
      candidate: candidateUser._id,
      job: testJob._id,
      source: 'careers_page',
      stage: 'hired',
      resumeUrl: 'https://example.com/resume.pdf',
      phone: '+91 9999999999',
      country: 'India',
      address: 'Bangalore, India',
      experience: 4,
      linkedinUrl: 'https://linkedin.com/in/hired-candidate',
      termsAccepted: true,
      employment: {
        employeeId: 'EMP-9999',
        joiningDate: new Date(),
        managerName: 'Sarah Jenkins',
        office: 'Bangalore HQ',
        workLocation: 'Bangalore, India',
        employmentType: 'full_time',
        employmentStatus: 'active',
        probationEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        shift: 'Day (9 AM - 6 PM)'
      }
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-employee\.com$/ });
    await Job.deleteMany({ title: /Test Employee Job/ });
    await Application.deleteMany({ phone: '+91 9999999999' });
    await mongoose.connection.close();
  });

  it('1. getEmployeeStatsAndTeams - Should calculate summary stats and job headcount staffing status', async () => {
    const req = { query: {} } as any;
    let resStatus = 0;
    let resData: any = null;

    const res = {
      status: (s: number) => {
        resStatus = s;
        return { json: (d: any) => { resData = d; } };
      }
    } as any;

    await getEmployeeStatsAndTeams(req, res, () => {});

    expect(resStatus).toBe(200);
    expect(resData).toHaveProperty('summary');
    expect(resData).toHaveProperty('jobTeams');
    expect(resData.summary.totalEmployees).toBeGreaterThanOrEqual(1);

    const testJobTeam = resData.jobTeams.find((jt: any) => jt.jobId.toString() === testJob._id.toString());
    expect(testJobTeam).toBeDefined();
    expect(testJobTeam.requiredHeadcount).toBe(3);
    expect(testJobTeam.currentEmployees).toBe(1);
    expect(testJobTeam.vacancies).toBe(2);
    expect(testJobTeam.staffingStatus).toBe('need_resourcing');
  });

  it('2. getEmployees - Should list hired applications with filtering, search, and pagination', async () => {
    const req = {
      query: {
        search: 'Hired Candidate',
        department: 'Engineering',
        page: '1',
        limit: '10'
      }
    } as any;

    let resStatus = 0;
    let resData: any = null;

    const res = {
      status: (s: number) => {
        resStatus = s;
        return { json: (d: any) => { resData = d; } };
      }
    } as any;

    await getEmployees(req, res, () => {});

    expect(resStatus).toBe(200);
    expect(resData).toHaveProperty('employees');
    expect(resData.employees.length).toBeGreaterThanOrEqual(1);
    expect(resData.employees[0].employment.employeeId).toBe('EMP-9999');
  });

  it('3. getEmployeeById - Should fetch employee detail profile with candidate & job info', async () => {
    const req = {
      params: { id: hiredApp._id.toString() }
    } as any;

    let resStatus = 0;
    let resData: any = null;

    const res = {
      status: (s: number) => {
        resStatus = s;
        return { json: (d: any) => { resData = d; } };
      }
    } as any;

    await getEmployeeById(req, res, () => {});

    expect(resStatus).toBe(200);
    expect(resData).toHaveProperty('employee');
    expect(resData.employee.candidate.email).toBe('hired@test-employee.com');
    expect(resData.employee.employment.employeeId).toBe('EMP-9999');
  });
});
