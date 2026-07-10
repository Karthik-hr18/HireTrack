import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { RegisterSchema } from '@hiretrack/shared';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    const admins = await User.find({
      role: 'admin',
      isActive: true
    }).select('_id name email role');

    return res.status(200).json(admins);
  } catch (error) {
    return next(error);
  }
};

// Admin CRUD Operations for Recruiter Profiles
export const getRecruiters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin authorization required', code: 'FORBIDDEN' });
    }

    const recruiters = await User.find({ role: 'recruiter' })
      .select('_id name email role isActive')
      .sort({ createdAt: -1 });

    return res.status(200).json(recruiters);
  } catch (error) {
    return next(error);
  }
};

export const createRecruiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin authorization required', code: 'FORBIDDEN' });
    }

    // Validate details using RegisterSchema
    const validatedData = RegisterSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email address already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password with cost factor >= 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const newRecruiter = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: 'recruiter', // Explicitly Recruiter role
      isActive: true,
      isEmailVerified: true
    });

    return res.status(201).json({
      _id: newRecruiter._id,
      name: newRecruiter.name,
      email: newRecruiter.email,
      role: newRecruiter.role,
      isActive: newRecruiter.isActive
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRecruiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin authorization required', code: 'FORBIDDEN' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Recruiter ID', code: 'BAD_REQUEST' });
    }

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required', code: 'BAD_REQUEST' });
    }

    const recruiter = await User.findOne({ _id: id, role: 'recruiter' });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found', code: 'NOT_FOUND' });
    }

    // Email collision check
    const emailConflict = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: new mongoose.Types.ObjectId(id) } 
    });
    if (emailConflict) {
      return res.status(400).json({
        message: 'A user with this email address already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    recruiter.name = name;
    recruiter.email = email.toLowerCase();
    await recruiter.save();

    return res.status(200).json({
      _id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      role: recruiter.role,
      isActive: recruiter.isActive
    });
  } catch (error) {
    return next(error);
  }
};

export const toggleRecruiterStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin authorization required', code: 'FORBIDDEN' });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Recruiter ID', code: 'BAD_REQUEST' });
    }

    const recruiter = await User.findOne({ _id: id, role: 'recruiter' });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found', code: 'NOT_FOUND' });
    }

    recruiter.isActive = !recruiter.isActive;
    await recruiter.save();

    return res.status(200).json({
      _id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email,
      role: recruiter.role,
      isActive: recruiter.isActive
    });
  } catch (error) {
    return next(error);
  }
};
