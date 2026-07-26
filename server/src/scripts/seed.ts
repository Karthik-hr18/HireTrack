import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { firebaseAuth } from '../config/firebase';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { Scorecard } from '../models/Scorecard';
import { ActivityLog } from '../models/ActivityLog';

dotenv.config();

const getOrCreateFirebaseUser = async (email: string, defaultPassword: string, displayName: string): Promise<string> => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const existing = await firebaseAuth.getUserByEmail(cleanEmail);
    console.log(`ℹ️ Firebase Auth user already exists for ${cleanEmail} (uid: ${existing.uid}). Synchronizing password & profile...`);
    await firebaseAuth.updateUser(existing.uid, {
      password: defaultPassword,
      displayName,
      emailVerified: true
    });
    return existing.uid;
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj.code === 'auth/user-not-found') {
      try {
        const newUser = await firebaseAuth.createUser({
          email: cleanEmail,
          password: defaultPassword,
          displayName,
          emailVerified: true
        });
        console.log(`✅ Created new Firebase Auth user for ${cleanEmail} (uid: ${newUser.uid}).`);
        return newUser.uid;
      } catch (createErr: unknown) {
        console.warn(`⚠️ Warning creating Firebase user for ${cleanEmail}: ${(createErr as Error).message}`);
        return `seed_uid_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      }
    }
    console.warn(`⚠️ Warning fetching Firebase user for ${cleanEmail}: ${errorObj.message}`);
    return `seed_uid_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  }
};

const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force-seed')) {
    console.log('⚠️ Notice: Database seeding is automatically skipped in production to protect user data.');
    process.exit(0);
  }

  const allowSeed = process.env.ALLOW_SEED === 'true' || process.argv.includes('--force-seed');
  if (!allowSeed) {
    console.log('⚠️ Notice: Seeding requires ALLOW_SEED=true environment variable or --force-seed flag.');
    console.log('Database seeding skipped to protect registered user data.');
    process.exit(0);
  }

  console.log('Starting database seeding with sample jobs and candidates...');
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hiretrack.io';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';

  try {
    // ── 1. CLEAN COLLECTIONS (ONLY WHEN EXPLICITLY ALLOWED) ────────────────
    console.log('Cleaning test sample collections...');
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Scorecard.deleteMany({});
    await ActivityLog.deleteMany({});
    await User.deleteMany({ role: { $in: ['candidate'] }, email: /@example\.com$/ });

    // ── 2. SEED ADMIN ACCOUNT ────────────────────────────────────────────────
    const adminFirebaseUid = await getOrCreateFirebaseUser(adminEmail, adminPassword, 'Administrator');
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (admin) {
      admin.firebaseUid = adminFirebaseUid;
      admin.role = 'admin';
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
    } else {
      admin = await User.create({
        firebaseUid: adminFirebaseUid,
        name: 'Administrator',
        email: adminEmail.toLowerCase(),
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
    }

    // ── 3. SEED RECRUITERS ───────────────────────────────────────────────────
    const recruiters = [];
    const recruiterData = [
      { name: 'Sarah Jenkins', email: 'sarah.j@hiretrack.io' },
      { name: 'Marcus Vance', email: 'marcus.vance@hiretrack.io' },
      { name: 'Elena Rostova', email: 'elena.r@hiretrack.io' }
    ];

    for (const r of recruiterData) {
      const recruiterUid = await getOrCreateFirebaseUser(r.email, 'RecruiterPass123!', r.name);
      let recruiter = await User.findOne({ email: r.email.toLowerCase() });
      if (!recruiter) {
        recruiter = await User.create({
          firebaseUid: recruiterUid,
          name: r.name,
          email: r.email.toLowerCase(),
          role: 'recruiter',
          isActive: true,
          isEmailVerified: true
        });
      } else {
        recruiter.firebaseUid = recruiterUid;
        await recruiter.save();
      }
      recruiters.push(recruiter);
    }

    // ── 4. SEED 15 DIVERSE JOBS ACROSS DEPARTMENTS & DATES ───────────────────
    console.log('Seeding 15 jobs...');
    const now = new Date();
    
    const jobsData = [
      {
        title: 'Full-Stack Software Engineer (React / Node)',
        description: 'Build scale collaborative client dashboards and real-time backend API logic.',
        requirements: '3+ years TypeScript, React, Node.js, and MongoDB.',
        location: 'Bangalore, India',
        department: 'Engineering',
        minExperience: 3,
        maxExperience: 6,
        vacancies: 2,
        requiredHeadcount: 8,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 10)
      },
      {
        title: 'Senior Backend Engineer (Java / Microservices)',
        description: 'Design microservice APIs, configure Redis caching, and distributed systems.',
        requirements: '5+ years Spring Boot, SQL, Docker, Redis.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 5,
        maxExperience: 10,
        vacancies: 0,
        requiredHeadcount: 5,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 20)
      },
      {
        title: 'DevOps & Cloud Infrastructure Specialist',
        description: 'Scale cloud infrastructure, Kubernetes clusters, and deployment pipelines.',
        requirements: '4+ years AWS, Terraform, Docker, Kubernetes.',
        location: 'Bangalore, India',
        department: 'IT',
        minExperience: 4,
        maxExperience: 8,
        vacancies: 0,
        requiredHeadcount: 2,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 5)
      },
      {
        title: 'Lead Product Designer (UI/UX)',
        description: 'Craft beautiful B2B SaaS dashboards, design systems, and component libraries.',
        requirements: '5+ years Figma, Design Systems, SaaS UX research.',
        location: 'Mumbai, India',
        department: 'Design',
        minExperience: 5,
        maxExperience: 9,
        vacancies: 1,
        requiredHeadcount: 4,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 18)
      },
      {
        title: 'Associate Product Manager',
        description: 'Drive feature roadmaps, conduct candidate evaluation research, and analyze metrics.',
        requirements: '2+ years SaaS product management experience.',
        location: 'Mumbai, India',
        department: 'Product',
        minExperience: 2,
        maxExperience: 4,
        vacancies: 1,
        requiredHeadcount: 3,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 2)
      },
      {
        title: 'Senior Account Executive',
        description: 'Manage enterprise client relationships and expand revenue pipelines.',
        requirements: '5+ years B2B SaaS enterprise sales.',
        location: 'Bangalore, India',
        department: 'Sales',
        minExperience: 5,
        maxExperience: 10,
        vacancies: 2,
        requiredHeadcount: 6,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 15)
      },
      {
        title: 'Growth Marketing Manager',
        description: 'Lead digital acquisition campaigns, SEO strategies, and lead generation.',
        requirements: '3+ years digital marketing & performance analytics.',
        location: 'Remote',
        department: 'Marketing',
        minExperience: 3,
        maxExperience: 7,
        vacancies: 1,
        requiredHeadcount: 3,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 4, 8)
      },
      {
        title: 'Financial Planning & Analysis Lead',
        description: 'Manage corporate budget allocation, financial forecasting, and SaaS metrics.',
        requirements: '4+ years corporate FP&A and financial modeling.',
        location: 'Remote',
        department: 'Finance',
        minExperience: 4,
        maxExperience: 8,
        vacancies: 1,
        requiredHeadcount: 2,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 4, 22)
      },
      {
        title: 'Senior Technical Recruiter',
        description: 'Source engineering talent, conduct screening calls, and optimize candidate pipeline.',
        requirements: '3+ years technical sourcing in fast-paced SaaS companies.',
        location: 'Bangalore, India',
        department: 'HR',
        minExperience: 3,
        maxExperience: 6,
        vacancies: 1,
        requiredHeadcount: 3,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 4)
      },
      {
        title: 'Data Platform & Analytics Engineer',
        description: 'Build ETL data pipelines, data warehouse architecture, and reporting models.',
        requirements: '4+ years Python, SQL, Snowflake, dbt, Spark.',
        location: 'Bangalore, India',
        department: 'Engineering',
        minExperience: 4,
        maxExperience: 8,
        vacancies: 1,
        requiredHeadcount: 4,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 15)
      },
      {
        title: 'Customer Success Manager',
        description: 'Ensure client adoption, conduct onboarding training, and maintain high retention.',
        requirements: '3+ years B2B customer success management.',
        location: 'Mumbai, India',
        department: 'Customer Success',
        minExperience: 3,
        maxExperience: 6,
        vacancies: 2,
        requiredHeadcount: 5,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 28)
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        description: 'Ensure system uptime, incident response automation, and infrastructure health.',
        requirements: '4+ years Linux systems, Prometheus, Grafana, Go/Python.',
        location: 'Remote',
        department: 'IT',
        minExperience: 4,
        maxExperience: 9,
        vacancies: 1,
        requiredHeadcount: 3,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 6, 2)
      },
      {
        title: 'React Native Mobile Developer',
        description: 'Develop iOS and Android recruiter mobile companion application.',
        requirements: '3+ years React Native & mobile SDK integrations.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 3,
        maxExperience: 6,
        vacancies: 0,
        requiredHeadcount: 4,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 15)
      },
      {
        title: 'Content Strategy Specialist',
        description: 'Produce high-converting technical blog posts, whitepapers, and case studies.',
        requirements: '2+ years B2B content writing.',
        location: 'Remote',
        department: 'Marketing',
        minExperience: 2,
        maxExperience: 5,
        vacancies: 0,
        requiredHeadcount: 2,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 10)
      },
      {
        title: 'Operations & Facilities Manager',
        description: 'Oversee office administration, vendor management, and employee workplace setup.',
        requirements: '4+ years office operations experience.',
        location: 'Bangalore, India',
        department: 'Operations',
        minExperience: 4,
        maxExperience: 7,
        vacancies: 0,
        requiredHeadcount: 2,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 1)
      }
    ];

    const jobs = await Job.create(jobsData);
    console.log(`Seeded ${jobs.length} jobs.`);

    // ── 5. SEED USERS & APPLICATIONS (INCLUDING ~36 HIRED EMPLOYEES) ─────────────
    console.log('Seeding candidate applications and hired employee records...');

    const candidateNames = [
      'Alex Morgan', 'Alice Smith', 'Bob Jones', 'John Doe', 'Emily Wilson',
      'Michael Brown', 'Sophia Davies', 'James Taylor', 'Sarah Jenkins', 'David Miller',
      'Vikram Rao', 'Ananya Sharma', 'Rohan Mehta', 'Priya Nair', 'Arjun Kapoor',
      'Neha Gupta', 'Siddharth Joshi', 'Tanvi Reddy', 'Aditya Verma', 'Meera Kulkarni',
      'Aarav Kumar', 'Diya Patel', 'Ishaan Sengupta', 'Kavya Deshmukh', 'Kabir Malhotra',
      'Riya Bansal', 'Yash Nambiar', 'Shreya Saxena', 'Varun Iyer', 'Pooja Agarwal',
      'Manish Hegde', 'Divya Menon', 'Rahul Bose', 'Sneha Pillai', 'Tarun Chawla',
      'Deepika Das', 'Gautam Singhal', 'Swati Roy', 'Nikhil Bhat', 'Bhavna Kulkarni',
      'Amitabh Tripathi', 'Krutika Shah', 'Harshwardhan Patil', 'Simran Gill', 'Sameer Quadri',
      'Sonali Thakur', 'Abhinav Sen', 'Ritu Mukherji', 'Kunal Merchant', 'Nisha Fernandez',
      'Tushar Joshi', 'Kavita Das', 'Manav Sharma', 'Sonia Rao', 'Karthik HR'
    ];

    const sources = ['linkedin', 'careers_page', 'referral', 'indeed', 'naukri'];

    // Specific stage assignment to reach realistic staffing targets across jobs:
    // Job 0 (Full-Stack): 6 hired (Required 8) -> Need Resourcing
    // Job 1 (Senior Backend): 5 hired (Required 5) -> Fully Staffed
    // Job 2 (DevOps): 3 hired (Required 2) -> Overstaffed
    // Job 3 (Lead Designer): 3 hired (Required 4) -> Need Resourcing
    // Job 4 (APM): 2 hired (Required 3) -> Need Resourcing
    // Job 5 (Sales AE): 4 hired (Required 6) -> Need Resourcing
    // Job 6 (Growth Mkt): 2 hired (Required 3)
    // Job 7 (FP&A Lead): 1 hired (Required 2)
    // Job 8 (Recruiter): 2 hired (Required 3)
    // Job 9 (Data Engineer): 3 hired (Required 4)
    // Job 10 (CSM): 3 hired (Required 5)
    // Job 11 (SRE): 2 hired (Required 3)
    // Job 12 (Mobile Closed): 4 hired (Required 4)
    // Job 13 (Content Closed): 2 hired (Required 2)
    // Job 14 (Operations Closed): 2 hired (Required 2)
    // Total Hired Employees = 6+5+3+3+2+4+2+1+2+3+3+2+4+2+2 = 45 Hired Employees!

    const stages: Array<'applied' | 'resume_screening' | 'technical_interview_scheduled' | 'technical_interview_completed' | 'hr_interview_scheduled' | 'hr_interview_completed' | 'offer' | 'hired' | 'rejected'> = [
      // Hired applications for Job 0 (Full-Stack) - 6 hired
      'hired', 'hired', 'hired', 'hired', 'hired', 'hired',
      // Hired applications for Job 1 (Senior Backend) - 5 hired
      'hired', 'hired', 'hired', 'hired', 'hired',
      // Hired applications for Job 2 (DevOps) - 3 hired
      'hired', 'hired', 'hired',
      // Hired applications for Job 3 (Design) - 3 hired
      'hired', 'hired', 'hired',
      // Hired applications for Job 4 (APM) - 2 hired
      'hired', 'hired',
      // Hired applications for Job 5 (Sales) - 4 hired
      'hired', 'hired', 'hired', 'hired',
      // Hired applications for Job 6 (Growth) - 2 hired
      'hired', 'hired',
      // Hired applications for Job 7 (Finance) - 1 hired
      'hired',
      // Hired applications for Job 8 (HR) - 2 hired
      'hired', 'hired',
      // Hired applications for Job 9 (Data Eng) - 3 hired
      'hired', 'hired', 'hired',
      // Hired applications for Job 10 (CSM) - 3 hired
      'hired', 'hired', 'hired',
      // Hired applications for Job 11 (SRE) - 2 hired
      'hired', 'hired',
      // Hired applications for Job 12 (Mobile Closed) - 4 hired
      'hired', 'hired', 'hired', 'hired',
      // Hired applications for Job 13 (Content Closed) - 2 hired
      'hired', 'hired',
      // Hired applications for Job 14 (Operations Closed) - 2 hired
      'hired', 'hired',
      // Active pipeline candidates (Non-hired)
      'applied', 'applied', 'applied', 'resume_screening', 'technical_interview_scheduled', 'technical_interview_completed', 'hr_interview_scheduled', 'offer', 'rejected', 'rejected'
    ];

    // Job index mapping for explicit headcount matching
    const jobIndexMapping = [
      0,0,0,0,0,0, // 6 for Job 0
      1,1,1,1,1,   // 5 for Job 1
      2,2,2,       // 3 for Job 2
      3,3,3,       // 3 for Job 3
      4,4,         // 2 for Job 4
      5,5,5,5,     // 4 for Job 5
      6,6,         // 2 for Job 6
      7,           // 1 for Job 7
      8,8,         // 2 for Job 8
      9,9,9,       // 3 for Job 9
      10,10,10,    // 3 for Job 10
      11,11,       // 2 for Job 11
      12,12,12,12, // 4 for Job 12
      13,13,       // 2 for Job 13
      14,14,       // 2 for Job 14
      0, 1, 3, 5, 0, 1, 2, 4, 0, 1 // Active candidates
    ];

    const resumeAssetUrl = '/assets/sample_resume.pdf';

    for (let i = 0; i < stages.length && i < candidateNames.length; i++) {
      const name = candidateNames[i];
      const email = i === 0 ? 'karthikhrvidyanidhi676@gmail.com' : `${name.toLowerCase().replace(/ /g, '.')}@example.com`;
      const candidateUid = i === 0 
        ? await getOrCreateFirebaseUser(email, 'Karthik@64', name)
        : `seed_candidate_${email}`;

      const candidateUser = await User.create({
        firebaseUid: candidateUid,
        name,
        email,
        role: 'candidate',
        isActive: true,
        isEmailVerified: true
      });

      const targetJobIdx = jobIndexMapping[i] !== undefined ? jobIndexMapping[i] : (i % jobs.length);
      const job = jobs[targetJobIdx];
      const stage = stages[i];
      const source = sources[i % sources.length];
      
      const appDate = new Date(now.getFullYear(), (i % 6), 1 + (i % 25));

      // Build embedded employment data for hired applications
      let employmentData: any = undefined;
      if (stage === 'hired') {
        const statuses = ['active', 'active', 'active', 'active', 'onboarding', 'probation', 'resigned'];
        const empStatus = statuses[i % statuses.length];
        const empType = i % 8 === 0 ? 'contract' : 'full_time';

        employmentData = {
          employeeId: `EMP-${1000 + i}`,
          joiningDate: appDate,
          managerName: job.createdBy ? 'Hiring Manager' : 'Sarah Jenkins',
          office: i % 2 === 0 ? 'Bangalore HQ' : 'Mumbai Tech Center',
          workLocation: job.location || 'Main Office',
          employmentType: empType,
          employmentStatus: empStatus,
          probationEndDate: new Date(appDate.getTime() + 90 * 24 * 60 * 60 * 1000),
          shift: 'Day (9 AM - 6 PM)'
        };
      }

      const app = await Application.create({
        candidate: candidateUser._id,
        job: job._id,
        source,
        stage,
        resumeUrl: resumeAssetUrl,
        phone: `+91 98765${10000 + i}`,
        country: 'India',
        address: job.location || 'Bangalore, Karnataka, India',
        experience: 2 + (i % 7),
        linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/ /g, '-')}`,
        githubUrl: `https://github.com/${name.toLowerCase().replace(/ /g, '-')}`,
        termsAccepted: true,
        employment: employmentData,
        createdAt: appDate,
        updatedAt: new Date(appDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        rejectionReason: stage === 'rejected' ? 'skills_mismatch' : null,
        rejectionNote: stage === 'rejected' ? 'Evaluation score below threshold for role seniority requirements.' : null
      });

      // Update applicant count on job
      await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

      // Create activity log
      await ActivityLog.create({
        entityType: 'application',
        entityId: app._id,
        action: 'applied',
        actor: candidateUser._id,
        metadata: { stage: 'applied', candidateName: name, jobTitle: job.title },
        createdAt: appDate
      });

      // Scheduled or Completed Interviews
      if (
        stage === 'technical_interview_scheduled' ||
        stage === 'technical_interview_completed' ||
        stage === 'hr_interview_scheduled' ||
        stage === 'hr_interview_completed' ||
        stage === 'offer' ||
        stage === 'hired'
      ) {
        const interviewType = (stage.includes('hr') || stage === 'offer' || stage === 'hired') ? 'hr' : 'technical';
        const isPast = stage.includes('completed') || stage === 'offer' || stage === 'hired';

        const interviewDate = isPast 
          ? new Date(appDate.getTime() + 3 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + (i + 1) * 12 * 60 * 60 * 1000);

        const iv = await Interview.create({
          application: app._id,
          interviewer: admin._id,
          scheduledAt: interviewDate,
          status: isPast ? 'completed' : 'scheduled',
          type: interviewType
        });

        if (isPast) {
          await Scorecard.create({
            interview: iv._id,
            recommendation: stage === 'hired' ? 'hire' : 'pass',
            comments: 'Candidate demonstrated exceptional problem solving, strong system design concepts, and stellar communication.',
            ratings: { 'Technical Ability': 5, 'Communication': 5, 'Problem Solving': 4 },
            communication: 5,
            cultureFit: 5,
            submittedBy: admin._id
          });
        }
      }
    }

    console.log(`Seeded ${stages.length} applications with employee records successfully!`);
    console.log('Database seeding finished successfully.');
  } catch (error) {
    console.error(`Seeding failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();
