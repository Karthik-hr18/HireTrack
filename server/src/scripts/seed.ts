import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';

dotenv.config();

const seedAdmin = async () => {
  console.log('Starting database seeding...');
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('CRITICAL: ADMIN_EMAIL or ADMIN_PASSWORD environment variables are missing.');
    process.exit(1);
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}. Updating password...`);
      const salt = await bcrypt.genSalt(12);
      existingAdmin.passwordHash = await bcrypt.hash(adminPassword, salt);
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        isActive: true
      });
      console.log(`Admin account seeded successfully with email: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`Seeding failed: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedAdmin();
