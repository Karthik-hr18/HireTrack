import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { User } from '../models/User';
import { UserRoleType } from '@hiretrack/shared';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is missing or invalid',
        code: 'UNAUTHORIZED'
      });
    }

    // Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({
        message: 'Invalid or expired Firebase authentication token',
        code: 'UNAUTHORIZED'
      });
    }

    const cleanEmail = (decodedToken.email || '').trim().toLowerCase();

    // Look up existing MongoDB user by firebaseUid or fallback by email
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user && cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    // Auto-create MongoDB User document on first login if not found
    if (!user && cleanEmail) {
      const name = decodedToken.name || cleanEmail.split('@')[0];
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: cleanEmail,
        name: name,
        role: 'candidate',
        isActive: true,
        isEmailVerified: Boolean(decodedToken.email_verified)
      });
    }

    if (!user) {
      return res.status(401).json({
        message: 'User account not found',
        code: 'UNAUTHORIZED'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated',
        code: 'DEACTIVATED'
      });
    }

    // Keep MongoDB isEmailVerified synced with Firebase email_verified
    if (decodedToken.email_verified && !user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    // Attach user session object with MongoDB ObjectId as 'id'
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failure',
      code: 'UNAUTHORIZED'
    });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const cleanEmail = (decodedToken.email || '').trim().toLowerCase();

    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user && cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
    }

    if (user && user.isActive) {
      if (decodedToken.email_verified && !user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      };
    }
    return next();
  } catch (error) {
    return next();
  }
};

export const authorize = (...roles: UserRoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'User authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You are not authorized to access this resource',
        code: 'FORBIDDEN'
      });
    }

    return next();
  };
};

export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      message: 'Email verification is required before completing this action. Please verify your email address.',
      code: 'EMAIL_UNVERIFIED'
    });
  }

  return next();
};
