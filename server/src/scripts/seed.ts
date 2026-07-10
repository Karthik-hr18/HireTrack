import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';

dotenv.config();

const seedDatabase = async () => {
  console.log('Starting database seeding...');
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('CRITICAL: ADMIN_EMAIL or ADMIN_PASSWORD environment variables are missing.');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(12);

    // 1. Seed Admin Account
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}. Updating password...`);
      existingAdmin.passwordHash = await bcrypt.hash(adminPassword, salt);
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true; // Auto-verify seeded Admin
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      const adminHash = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: 'Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash: adminHash,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log(`Admin account seeded successfully with email: ${adminEmail}`);
    }

    // 2. Seed 5 Recruiter Accounts
    const recruiterPassword = 'Recruiter@123';
    const recruiterHash = await bcrypt.hash(recruiterPassword, salt);
    for (let i = 1; i <= 5; i++) {
      const recEmail = `recruiter${i}@hiretrack.com`;
      const existingRec = await User.findOne({ email: recEmail });
      if (!existingRec) {
        await User.create({
          name: `Recruiter ${i}`,
          email: recEmail,
          passwordHash: recruiterHash,
          role: 'recruiter',
          isActive: true,
          isEmailVerified: true // Auto-verify seeded Recruiters
        });
        console.log(`Recruiter account seeded: ${recEmail}`);
      } else {
        // Ensure verified flag is set on existing ones too
        existingRec.isEmailVerified = true;
        await existingRec.save();
      }
    }

    // 3. Seed 1 Candidate Account
    const candidateEmail = 'candidate@hiretrack.com';
    const candidatePassword = 'Candidate@123';
    const candidateHash = await bcrypt.hash(candidatePassword, salt);
    const existingCand = await User.findOne({ email: candidateEmail });
    if (!existingCand) {
      await User.create({
        name: 'Candidate Seed',
        email: candidateEmail,
        passwordHash: candidateHash,
        role: 'candidate',
        isActive: true,
        isEmailVerified: true // Auto-verify seeded Candidate
      });
      console.log(`Candidate account seeded: ${candidateEmail}`);
    } else {
      existingCand.isEmailVerified = true;
      await existingCand.save();
    }

    console.log('Seeding script finished successfully.');
  } catch (error) {
    console.error(`Seeding failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();
