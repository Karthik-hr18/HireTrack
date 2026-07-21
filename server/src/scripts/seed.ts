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
  console.log('Starting full database seeding...');
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
      console.log(`Admin account already exists: ${adminEmail}. Updating password...`);
      admin.passwordHash = await bcrypt.hash(adminPassword, salt);
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
    } else {
      admin = await User.create({
        name: 'Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash: await bcrypt.hash(adminPassword, salt),
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log(`Admin account seeded successfully: ${adminEmail}`);
    }

    // ── 3. SEED RECRUITERS ───────────────────────────────────────────────────
    const recruiters = [];
    for (let i = 1; i <= 3; i++) {
      const recEmail = `recruiter${i}@hiretrack.com`;
      let recruiter = await User.findOne({ email: recEmail });
      if (!recruiter) {
        recruiter = await User.create({
          name: `Recruiter ${i}`,
          email: recEmail,
          passwordHash: defaultHash,
          role: 'recruiter',
          isActive: true,
          isEmailVerified: true
        });
        console.log(`Recruiter account seeded: ${recEmail}`);
      }
      recruiters.push(recruiter);
    }

    // ── 4. SEED JOBS ─────────────────────────────────────────────────────────
    console.log('Seeding jobs...');
    const jobsData = [
      {
        title: 'Full-Stack Software Engineer (React / Node)',
        description: 'We are looking for a Full-Stack Software Engineer to build and scale collaborative client dashboards and real-time backend API logic.',
        requirements: '2+ years experience. Strong TypeScript, React, and Node.js skills.',
        location: 'Bangalore, India',
        department: 'Engineering',
        minExperience: 2,
        maxExperience: 5,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'Senior Backend Engineer (Java / Microservices)',
        description: 'Join our backend infrastructure team to design microservice APIs, configure Redis caching layers, and implement distributed system workflows.',
        requirements: '5+ years experience. Depth in Spring Boot, SQL, Docker, and caching patterns.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 5,
        maxExperience: 10,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'DevOps & Infrastructure Specialist',
        description: 'Scale our cloud infrastructure, configure build-and-test deployment pipelines, and optimize container networking rules.',
        requirements: '3+ years experience. AWS, Docker, Kubernetes, and CI/CD pipelines.',
        location: 'Bangalore, India',
        department: 'IT',
        minExperience: 3,
        maxExperience: 8,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'Associate Product Manager',
        description: 'Own the roadmap for candidate evaluation features, collaborate with engineering, and research user metrics.',
        requirements: '1+ year experience. Analytical mindset and data-focused communication skills.',
        location: 'Mumbai, India',
        department: 'Product',
        minExperience: 1,
        maxExperience: 3,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'Senior Account Executive',
        description: 'Manage key customer relationships, drive enterprise sales pipelines, and consult on hiring platforms.',
        requirements: '4+ years SaaS sales experience.',
        location: 'Bangalore, India',
        department: 'Sales',
        minExperience: 4,
        maxExperience: 8,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze operational metrics, forecast budget allocation, and assist finance leaders.',
        requirements: '2+ years corporate finance experience.',
        location: 'Remote',
        department: 'Finance',
        minExperience: 2,
        maxExperience: 5,
        status: 'open' as const,
        createdBy: admin._id
      },
      {
        title: 'React Native Developer',
        description: 'Build native iOS and Android experiences for our hiring client dashboard.',
        requirements: '3+ years experience with React Native and native mobile design rules.',
        location: 'Remote',
        department: 'Engineering',
        minExperience: 3,
        maxExperience: 6,
        status: 'closed' as const,
        createdBy: admin._id
      }
    ];

    const jobs = await Job.create(jobsData);
    console.log(`Seeded ${jobs.length} jobs.`);

    // ── 5. SEED CANDIDATE USERS ──────────────────────────────────────────────
    console.log('Seeding candidates...');
    const candidatesData = [
      { name: 'John Doe', email: 'john.doe@gmail.com' },
      { name: 'Alice Smith', email: 'alice.smith@yahoo.com' },
      { name: 'Bob Jones', email: 'bob.jones@outlook.com' },
      { name: 'Emma Watson', email: 'emma.w@gmail.com' },
      { name: 'David Miller', email: 'david.miller@hiretrack.com' },
      { name: 'Sarah Jenkins', email: 'sarah.j@gmail.com' },
      { name: 'James Taylor', email: 'james.t@outlook.com' },
      { name: 'Sophia Davies', email: 'sophia.d@gmail.com' },
      { name: 'Michael Brown', email: 'michael.b@yahoo.com' },
      { name: 'Emily Wilson', email: 'emily.wilson@gmail.com' }
    ];

    const candidates = [];
    for (const cand of candidatesData) {
      const user = await User.create({
        name: cand.name,
        email: cand.email,
        passwordHash: defaultHash,
        role: 'candidate',
        isActive: true,
        isEmailVerified: true
      });
      candidates.push(user);
    }
    console.log(`Seeded ${candidates.length} candidate accounts.`);

    // ── 6. SEED APPLICATIONS ACCROSS ALL STAGES ──────────────────────────────
    console.log('Seeding applications, timeline activities, interviews, and scorecards...');

    const stages: Array<'applied' | 'resume_screening' | 'technical_interview_scheduled' | 'technical_interview_completed' | 'hr_interview_scheduled' | 'hr_interview_completed' | 'offer' | 'hired' | 'rejected'> = [
      'applied',
      'resume_screening',
      'technical_interview_scheduled',
      'technical_interview_completed',
      'hr_interview_scheduled',
      'hr_interview_completed',
      'offer',
      'hired',
      'rejected'
    ];

    // Seed 12 applications
    for (let i = 0; i < 12; i++) {
      const candidate = candidates[i % candidates.length];
      const job = jobs[i % jobs.length];
      const stage = stages[i % stages.length];

      // Formulate realistic experience parameters based on candidate loop
      const candidateExp = (i % 5) + 2; // Experience between 2 and 6 years

      const app = await Application.create({
        candidate: candidate._id,
        job: job._id,
        source: 'linkedin',
        stage: stage,
        resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample_resume.pdf',
        phone: `+91 90000000${i}`,
        country: 'India',
        address: 'MG Road, Bangalore, Karnataka',
        experience: candidateExp,
        linkedinUrl: `https://linkedin.com/in/${candidate.name.toLowerCase().replace(' ', '-')}`,
        githubUrl: `https://github.com/${candidate.name.toLowerCase().replace(' ', '-')}`,
        termsAccepted: true,
        rejectionReason: stage === 'rejected' ? 'skills_mismatch' : null,
        rejectionNote: stage === 'rejected' ? 'Candidate lacked core distributed system design knowledge.' : null
      });

      // A. Create initial timeline ActivityLog for Application Submission
      await ActivityLog.create({
        entityType: 'application',
        entityId: app._id,
        action: 'applied',
        actor: candidate._id,
        metadata: { stage: 'applied' }
      });

      // B. Create activity logs representing progress history based on target stage
      if (stage !== 'applied') {
        await ActivityLog.create({
          entityType: 'application',
          entityId: app._id,
          action: 'stage_changed',
          actor: recruiters[i % recruiters.length]._id,
          metadata: { from: 'applied', to: 'resume_screening' }
        });
      }

      // C. Handle Scheduled Interviews
      if (stage === 'technical_interview_scheduled' || stage === 'hr_interview_scheduled') {
        const interviewType = stage === 'technical_interview_scheduled' ? 'technical' : 'hr';
        
        const interview = await Interview.create({
          application: app._id,
          interviewer: admin._id, // Assign to Admin so they see it in their Dashboard
          scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // scheduled in the future
          status: 'scheduled',
          type: interviewType
        });

        await ActivityLog.create({
          entityType: 'application',
          entityId: app._id,
          action: 'interview_scheduled',
          actor: recruiters[i % recruiters.length]._id,
          metadata: { interviewId: interview._id, type: interviewType }
        });
      }

      // D. Handle Completed Interviews / Offers / Hires
      if (
        stage === 'technical_interview_completed' || 
        stage === 'hr_interview_completed' || 
        stage === 'offer' || 
        stage === 'hired'
      ) {
        // Technical completed interview
        const techInterview = await Interview.create({
          application: app._id,
          interviewer: admin._id,
          scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // in the past
          status: 'completed',
          type: 'technical'
        });

        const techScorecard = await Scorecard.create({
          interview: techInterview._id,
          recommendation: 'pass',
          comments: 'Excellent coding round. Explained Big O complexity clearly and wrote highly modular clean code.',
          ratings: { 'Problem Solving': 5, 'Coding Quality': 4, 'System Design': 4 },
          communication: 5,
          cultureFit: 4,
          submittedBy: admin._id
        });

        await ActivityLog.create({
          entityType: 'application',
          entityId: app._id,
          action: 'stage_changed',
          actor: recruiters[i % recruiters.length]._id,
          metadata: { from: 'resume_screening', to: 'technical_interview_scheduled' }
        });

        await ActivityLog.create({
          entityType: 'application',
          entityId: app._id,
          action: 'scorecard_submitted',
          actor: admin._id,
          metadata: { interviewId: techInterview._id, scorecardId: techScorecard._id }
        });

        // HR interview completed for higher stages
        if (stage === 'hr_interview_completed' || stage === 'offer' || stage === 'hired') {
          const hrInterview = await Interview.create({
            application: app._id,
            interviewer: admin._id,
            scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
            status: 'completed',
            type: 'hr'
          });

          const hrScorecard = await Scorecard.create({
            interview: hrInterview._id,
            recommendation: 'hire',
            comments: 'Cultural fit is outstanding. Highly collaborative and eager to study Spring Boot patterns.',
            ratings: { 'Team Collaboration': 5, 'Values Alignment': 5 },
            communication: 5,
            cultureFit: 5,
            submittedBy: admin._id
          });

          await ActivityLog.create({
            entityType: 'application',
            entityId: app._id,
            action: 'stage_changed',
            actor: recruiters[i % recruiters.length]._id,
            metadata: { from: 'technical_interview_completed', to: 'hr_interview_scheduled' }
          });

          await ActivityLog.create({
            entityType: 'application',
            entityId: app._id,
            action: 'scorecard_submitted',
            actor: admin._id,
            metadata: { interviewId: hrInterview._id, scorecardId: hrScorecard._id }
          });
        }

        // Final Offer/Hired logs
        if (stage === 'offer') {
          await ActivityLog.create({
            entityType: 'application',
            entityId: app._id,
            action: 'stage_changed',
            actor: admin._id,
            metadata: { from: 'hr_interview_completed', to: 'offer' }
          });
        }

        if (stage === 'hired') {
          await ActivityLog.create({
            entityType: 'application',
            entityId: app._id,
            action: 'stage_changed',
            actor: admin._id,
            metadata: { from: 'offer', to: 'hired' }
          });
        }
      }

      // E. Rejected Logs
      if (stage === 'rejected') {
        await ActivityLog.create({
          entityType: 'application',
          entityId: app._id,
          action: 'rejected',
          actor: recruiters[i % recruiters.length]._id,
          metadata: { reason: 'skills_mismatch' }
        });
      }
    }

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
