import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { Scorecard } from '../models/Scorecard';
import { ActivityLog } from '../models/ActivityLog';

dotenv.config();

const seedDatabase = async () => {
  console.log('Starting full database seeding with 15 jobs and 50 candidates...');
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hiretrack.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
    const salt = await bcrypt.genSalt(12);
    const defaultHash = await bcrypt.hash('Password@123', salt);

    // ── 1. CLEAN COLLECTIONS ─────────────────────────────────────────────────
    console.log('Cleaning collections...');
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Scorecard.deleteMany({});
    await ActivityLog.deleteMany({});
    await User.deleteMany({ role: { $in: ['candidate'] } });

    // ── 2. SEED ADMIN ACCOUNT ────────────────────────────────────────────────
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (admin) {
      admin.firebaseUid = admin.firebaseUid || 'seed_admin_uid';
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
    } else {
      admin = await User.create({
        firebaseUid: 'seed_admin_uid',
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
      { name: 'Karthik Recruiter', email: 'karthikhr676@gmail.com' },
      { name: 'Sarah Jenkins', email: 'sarah.j@hiretrack.io' },
      { name: 'Marcus Vance', email: 'marcus.vance@hiretrack.io' },
      { name: 'Elena Rostova', email: 'elena.r@hiretrack.io' }
    ];

    for (const r of recruiterData) {
      let recruiter = await User.findOne({ email: r.email });
      if (!recruiter) {
        recruiter = await User.create({
          firebaseUid: `seed_recruiter_${r.email}`,
          name: r.name,
          email: r.email,
          role: 'recruiter',
          isActive: true,
          isEmailVerified: true
        });
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
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 10) // Feb
      },
      {
        title: 'Senior Backend Engineer (Java / Microservices)',
        description: 'Design microservice APIs, configure Redis caching, and distributed systems.',
        requirements: '5+ years Spring Boot, SQL, Docker, Redis.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 5,
        maxExperience: 10,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 20) // Feb
      },
      {
        title: 'DevOps & Cloud Infrastructure Specialist',
        description: 'Scale cloud infrastructure, Kubernetes clusters, and deployment pipelines.',
        requirements: '4+ years AWS, Terraform, Docker, Kubernetes.',
        location: 'Bangalore, India',
        department: 'IT',
        minExperience: 4,
        maxExperience: 8,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 5) // Mar
      },
      {
        title: 'Lead Product Designer (UI/UX)',
        description: 'Craft beautiful B2B SaaS dashboards, design systems, and component libraries.',
        requirements: '5+ years Figma, Design Systems, SaaS UX research.',
        location: 'Mumbai, India',
        department: 'Design',
        minExperience: 5,
        maxExperience: 9,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 18) // Mar
      },
      {
        title: 'Associate Product Manager',
        description: 'Drive feature roadmaps, conduct candidate evaluation research, and analyze metrics.',
        requirements: '2+ years SaaS product management experience.',
        location: 'Mumbai, India',
        department: 'Product',
        minExperience: 2,
        maxExperience: 4,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 2) // Apr
      },
      {
        title: 'Senior Account Executive',
        description: 'Manage enterprise client relationships and expand revenue pipelines.',
        requirements: '5+ years B2B SaaS enterprise sales.',
        location: 'Bangalore, India',
        department: 'Sales',
        minExperience: 5,
        maxExperience: 10,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 15) // Apr
      },
      {
        title: 'Growth Marketing Manager',
        description: 'Lead digital acquisition campaigns, SEO strategies, and lead generation.',
        requirements: '3+ years digital marketing & performance analytics.',
        location: 'Remote',
        department: 'Marketing',
        minExperience: 3,
        maxExperience: 7,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 4, 8) // May
      },
      {
        title: 'Financial Planning & Analysis Lead',
        description: 'Manage corporate budget allocation, financial forecasting, and SaaS metrics.',
        requirements: '4+ years corporate FP&A and financial modeling.',
        location: 'Remote',
        department: 'Finance',
        minExperience: 4,
        maxExperience: 8,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 4, 22) // May
      },
      {
        title: 'Senior Technical Recruiter',
        description: 'Source engineering talent, conduct screening calls, and optimize candidate pipeline.',
        requirements: '3+ years technical sourcing in fast-paced SaaS companies.',
        location: 'Bangalore, India',
        department: 'HR',
        minExperience: 3,
        maxExperience: 6,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 4) // Jun
      },
      {
        title: 'Data Platform & Analytics Engineer',
        description: 'Build ETL data pipelines, data warehouse architecture, and reporting models.',
        requirements: '4+ years Python, SQL, Snowflake, dbt, Spark.',
        location: 'Bangalore, India',
        department: 'Engineering',
        minExperience: 4,
        maxExperience: 8,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 15) // Jun
      },
      {
        title: 'Customer Success Manager',
        description: 'Ensure client adoption, conduct onboarding training, and maintain high retention.',
        requirements: '3+ years B2B customer success management.',
        location: 'Mumbai, India',
        department: 'Customer Success',
        minExperience: 3,
        maxExperience: 6,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 5, 28) // Jun
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        description: 'Ensure system uptime, incident response automation, and infrastructure health.',
        requirements: '4+ years Linux systems, Prometheus, Grafana, Go/Python.',
        location: 'Remote',
        department: 'IT',
        minExperience: 4,
        maxExperience: 9,
        status: 'open' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 6, 2) // Jul
      },
      {
        title: 'React Native Mobile Developer',
        description: 'Develop iOS and Android recruiter mobile companion application.',
        requirements: '3+ years React Native & mobile SDK integrations.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 3,
        maxExperience: 6,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 1, 15) // Feb
      },
      {
        title: 'Content Strategy Specialist',
        description: 'Produce high-converting technical blog posts, whitepapers, and case studies.',
        requirements: '2+ years B2B content writing.',
        location: 'Remote',
        department: 'Marketing',
        minExperience: 2,
        maxExperience: 5,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 2, 10) // Mar
      },
      {
        title: 'Operations & Facilities Manager',
        description: 'Oversee office administration, vendor management, and employee workplace setup.',
        requirements: '4+ years office operations experience.',
        location: 'Bangalore, India',
        department: 'Operations',
        minExperience: 4,
        maxExperience: 7,
        status: 'closed' as const,
        createdBy: admin._id,
        createdAt: new Date(now.getFullYear(), 3, 1) // Apr
      }
    ];

    const jobs = await Job.create(jobsData);
    console.log(`Seeded ${jobs.length} jobs.`);

    // ── 5. SEED 50 CANDIDATE USERS & APPLICATIONS ────────────────────────────
    console.log('Seeding 50 candidates and applications...');

    const candidateNames = [
      'Karthik H R', 'Alice Smith', 'Bob Jones', 'John Doe', 'Emily Wilson',
      'Michael Brown', 'Sophia Davies', 'James Taylor', 'Sarah Jenkins', 'David Miller',
      'Vikram Rao', 'Ananya Sharma', 'Rohan Mehta', 'Priya Nair', 'Arjun Kapoor',
      'Neha Gupta', 'Siddharth Joshi', 'Tanvi Reddy', 'Aditya Verma', 'Meera Kulkarni',
      'Aarav Kumar', 'Diya Patel', 'Ishaan Sengupta', 'Kavya Deshmukh', 'Kabir Malhotra',
      'Riya Bansal', 'Yash Nambiar', 'Shreya Saxena', 'Varun Iyer', 'Pooja Agarwal',
      'Manish Hegde', 'Divya Menon', 'Rahul Bose', 'Sneha Pillai', 'Tarun Chawla',
      'Deepika Das', 'Gautam Singhal', 'Swati Roy', 'Nikhil Bhat', 'Bhavna Kulkarni',
      'Amitabh Tripathi', 'Krutika Shah', 'Harshwardhan Patil', 'Simran Gill', 'Sameer Quadri',
      'Sonali Thakur', 'Abhinav Sen', 'Ritu Mukherji', 'Kunal Merchant', 'Nisha Fernandez'
    ];

    const sources = ['linkedin', 'careers_page', 'referral', 'indeed', 'naukri'];

    const stages: Array<'applied' | 'resume_screening' | 'technical_interview_scheduled' | 'technical_interview_completed' | 'hr_interview_scheduled' | 'hr_interview_completed' | 'offer' | 'hired' | 'rejected'> = [
      'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', 'applied', // 15
      'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', 'resume_screening', // 10
      'technical_interview_scheduled', 'technical_interview_scheduled', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', 'technical_interview_completed', // 10
      'hr_interview_scheduled', 'hr_interview_scheduled', 'hr_interview_completed', 'hr_interview_completed', 'hr_interview_completed', 'hr_interview_completed', // 6
      'offer', 'offer', 'offer', 'offer', // 4
      'hired', 'hired', 'hired', // 3
      'rejected', 'rejected' // 2
    ];

    // Distribute creation dates over 6 months (Feb 2026 to Jul 2026)
    const monthOffsets = [
      0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
    ]; // 0=Feb, 1=Mar, 2=Apr, 3=May, 4=Jun, 5=Jul

    const resumeAssetUrl = '/assets/Karthik_HR_Resume_OnePage.pdf';

    for (let i = 0; i < 50; i++) {
      const name = candidateNames[i];
      const email = `${name.toLowerCase().replace(/ /g, '.')}@example.com`;

      const candidateUser = await User.create({
        firebaseUid: `seed_candidate_${email}`,
        name,
        email,
        role: 'candidate',
        isActive: true,
        isEmailVerified: true
      });

      const job = jobs[i % jobs.length];
      const stage = stages[i];
      const source = sources[i % sources.length];
      const monthIdx = monthOffsets[i];
      
      const appDate = new Date(now.getFullYear(), 1 + monthIdx, 5 + (i % 22));

      const app = await Application.create({
        candidate: candidateUser._id,
        job: job._id,
        source,
        stage,
        resumeUrl: resumeAssetUrl,
        phone: `+91 98765${10000 + i}`,
        country: 'India',
        address: 'Bangalore, Karnataka, India',
        experience: 2 + (i % 6),
        linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/ /g, '-')}`,
        githubUrl: `https://github.com/${name.toLowerCase().replace(/ /g, '-')}`,
        termsAccepted: true,
        createdAt: appDate,
        updatedAt: new Date(appDate.getTime() + (i % 5) * 24 * 60 * 60 * 1000),
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

    console.log('Seeded 50 applications successfully!');
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
