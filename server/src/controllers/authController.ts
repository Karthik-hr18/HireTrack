import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { RegisterSchema, LoginSchema } from '@hiretrack/shared';

// Helper to generate JWT
const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: userId, email, role }, jwtSecret, { expiresIn: '24h' });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
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

    // Generate verification token for Option A mock flow
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: 'candidate', // Only candidates can self-register
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken
    });

    // Log verification link to the server console simulating an email dispatch
    const verifyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify?token=${verificationToken}`;
    console.log(`\n======================================================`);
    console.log(`✉️ MOCK EMAIL DISPATCH FOR: ${newUser.email}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log(`======================================================\n`);

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the administrator.',
        code: 'DEACTIVATED'
      });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 4rem;">
          <h1 style="color: #ef4444;">Verification Failed</h1>
          <p style="color: #64748b;">Missing or invalid email verification token.</p>
        </div>
      `);
    }

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 4rem;">
          <h1 style="color: #ef4444;">Link Expired or Invalid</h1>
          <p style="color: #64748b;">This verification link is no longer valid or has already been used.</p>
        </div>
      `);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 4rem; background-color: #0b0f19; color: #f8fafc; min-height: 100vh;">
        <h1 style="color: #10b981; font-size: 2.5rem; margin-bottom: 1rem;">Email Verified Successfully!</h1>
        <p style="color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem;">Your account is now verified. You may return to the HireTrack application and sign in.</p>
        <div style="margin-top: 2rem;">
          <a href="${process.env.CORS_ORIGIN || 'https://hire-track-client.vercel.app'}/login" 
             style="display: inline-block; background-color: #6366f1; color: white; padding: 0.8rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Proceed to Login
          </a>
        </div>
      </div>
    `);
  } catch (error) {
    return next(error);
  }
};
