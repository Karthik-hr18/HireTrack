import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { firebaseAuth } from '../config/firebase';

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Valid email address is required', code: 'BAD_REQUEST' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check MongoDB User Collection
    const mongoUser = await User.findOne({ email: cleanEmail });
    if (mongoUser) {
      const isPrivileged = mongoUser.role === 'admin' || mongoUser.role === 'recruiter';
      return res.status(409).json({
        exists: true,
        isPrivileged,
        message: isPrivileged
          ? 'This email is already registered as a privileged account. Please sign in using your existing credentials.'
          : 'This account already exists. Please use Login instead.'
      });
    }

    // 2. Check Firebase Authentication
    try {
      const fbUser = await firebaseAuth.getUserByEmail(cleanEmail);
      if (fbUser) {
        return res.status(409).json({
          exists: true,
          isPrivileged: false,
          message: 'This account already exists. Please use Login instead.'
        });
      }
    } catch (fbErr: any) {
      if (fbErr.code !== 'auth/user-not-found') {
        console.warn('⚠️ Unexpected error checking Firebase user by email:', fbErr.message || fbErr);
      }
    }

    return res.status(200).json({
      exists: false,
      isPrivileged: false,
      message: 'Email is available for registration.'
    });
  } catch (error) {
    return next(error);
  }
};

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: 'Firebase authentication token missing',
        code: 'UNAUTHORIZED'
      });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const cleanEmail = (decodedToken.email || '').trim().toLowerCase();
    const { name } = req.body;

    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user && cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
      if (user) {
        // SECURITY GUARD: Reject re-linking existing admin or recruiter accounts via public registration
        if (user.role === 'admin' || user.role === 'recruiter') {
          return res.status(403).json({
            message: 'This email is already registered as a privileged account. Please sign in using your existing credentials.',
            code: 'FORBIDDEN'
          });
        }
        
        // Link candidate UID only if unlinked
        if (!user.firebaseUid || user.firebaseUid.startsWith('seed_')) {
          user.firebaseUid = decodedToken.uid;
          if (name && name.trim()) user.name = name.trim();
          await user.save();
        } else if (user.firebaseUid !== decodedToken.uid) {
          return res.status(403).json({
            message: 'This account is already permanently linked to another UID.',
            code: 'FORBIDDEN'
          });
        }
      }
    }

    // Auto-create MongoDB User document if first login/register (ALWAYS candidate role for public registrations)
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: cleanEmail,
        name: name ? name.trim() : (decodedToken.name || cleanEmail.split('@')[0]),
        role: 'candidate',
        isActive: true,
        isEmailVerified: Boolean(decodedToken.email_verified)
      });
    } else {
      // Sync verification status & name if updated
      let modified = false;
      if (decodedToken.email_verified && !user.isEmailVerified) {
        user.isEmailVerified = true;
        modified = true;
      }
      if (name && name.trim() && user.name !== name.trim()) {
        user.name = name.trim();
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }

    return res.status(200).json({
      message: 'User synchronized successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
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

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
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

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof res.clearCookie === 'function') {
      res.clearCookie('token');
    }
    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    return next(error);
  }
};
