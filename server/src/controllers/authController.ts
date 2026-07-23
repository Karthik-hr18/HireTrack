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

// Cookie options for secure session handling
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

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

    // Generate email verification token (32-byte hex)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL

    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: 'candidate', // Only candidates can self-register
      isActive: true,
      isEmailVerified: false,
      emailVerificationTokenHash,
      emailVerificationExpiresAt
    });

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    // Set httpOnly, Secure, SameSite cookie if res.cookie function is available
    if (typeof res.cookie === 'function') {
      res.cookie('token', token, getCookieOptions());
    }

    return res.status(201).json({
      token,
      verificationToken, // Returned for dev/test verification
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

    // Set httpOnly, Secure, SameSite cookie if res.cookie function is available
    if (typeof res.cookie === 'function') {
      res.cookie('token', token, getCookieOptions());
    }

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

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof res.clearCookie === 'function') {
      res.clearCookie('token', getCookieOptions());
    }
    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    return next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.body.token || req.query.token) as string;
    if (!token) {
      return res.status(400).json({
        message: 'Verification token is required',
        code: 'BAD_REQUEST'
      });
    }

    const emailVerificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationTokenHash,
      emailVerificationExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Verification token is invalid or has expired',
        code: 'BAD_REQUEST'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: 'Email address has been successfully verified',
      user: {
        id: user._id,
        email: user.email,
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required', code: 'BAD_REQUEST' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Always return 200 for user enumeration protection
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been dispatched.'
      });
    }

    // Generate random 32-byte hex token and hash at rest with SHA-256
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes TTL

    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpiresAt = resetTokenExpiresAt;
    await user.save();

    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been dispatched.',
      resetToken // Returned in response payload for dev/test verification
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'Token and a valid new password (min 6 characters) are required',
        code: 'BAD_REQUEST'
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Password reset token is invalid or has expired',
        code: 'BAD_REQUEST'
      });
    }

    // Hash new password with bcrypt (cost factor 12)
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Invalidate reset token after single use
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    return res.status(200).json({
      message: 'Password has been successfully updated. Please log in with your new credentials.'
    });
  } catch (error) {
    return next(error);
  }
};
