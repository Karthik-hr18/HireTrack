import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { firebaseAuth } from '../config/firebase';

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
    const { name, role } = req.body;

    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user && cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.firebaseUid = decodedToken.uid;
        if (name && name.trim()) user.name = name.trim();
        await user.save();
      }
    }

    // Auto-create MongoDB User document if first login/register
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: cleanEmail,
        name: name ? name.trim() : (decodedToken.name || cleanEmail.split('@')[0]),
        role: role || 'candidate',
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
