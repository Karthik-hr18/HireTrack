import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { firebaseAuth } from '../config/firebase';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

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

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let emailToVerify: string | undefined;
    let userName = 'Candidate';

    if (req.user) {
      emailToVerify = req.user.email;
      const u = await User.findById(req.user.id);
      if (u) userName = u.name;
    } else if (req.body.email) {
      emailToVerify = (req.body.email as string).trim().toLowerCase();
    }

    if (!emailToVerify) {
      return res.status(400).json({ message: 'Email address is required', code: 'BAD_REQUEST' });
    }

    console.log(`▶️ Generating email verification link for: ${emailToVerify}`);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const actionCodeSettings = {
      url: `${clientUrl}/verify-email`,
      handleCodeInApp: true
    };

    let verificationLink: string;
    try {
      verificationLink = await firebaseAuth.generateEmailVerificationLink(emailToVerify, actionCodeSettings);
    } catch (linkErr: any) {
      console.warn(`⚠️ Custom action code URL failed (code: ${linkErr.code}, message: ${linkErr.message}). Generating default Firebase verification link...`);
      try {
        verificationLink = await firebaseAuth.generateEmailVerificationLink(emailToVerify);
      } catch (fallbackErr: any) {
        console.error(`❌ Fallback verification link generation failed (code: ${fallbackErr.code}, message: ${fallbackErr.message})`);
        throw fallbackErr;
      }
    }

    console.log(`✅ Verification link generated for ${emailToVerify}. Dispatching custom HTML email...`);
    await sendVerificationEmail(emailToVerify, userName, verificationLink);
    console.log(`✉️ Custom verification email successfully dispatched to ${emailToVerify}!`);

    return res.status(200).json({
      message: `Custom verification email dispatched to ${emailToVerify}!`
    });
  } catch (error: any) {
    console.error('❌ Error in resendVerification:', error.code || error.message || error);
    return res.status(400).json({ message: error.message || 'Failed to resend verification email' });
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required', code: 'BAD_REQUEST' });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`▶️ Generating password reset link for: ${cleanEmail}`);
    const existingUser = await User.findOne({ email: cleanEmail });
    const userName = existingUser ? existingUser.name : cleanEmail.split('@')[0];

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const actionCodeSettings = {
      url: `${clientUrl}/reset-password`,
      handleCodeInApp: true
    };

    let resetLink: string;
    try {
      resetLink = await firebaseAuth.generatePasswordResetLink(cleanEmail, actionCodeSettings);
    } catch (linkErr: any) {
      console.warn(`⚠️ Custom action code URL failed (code: ${linkErr.code}, message: ${linkErr.message}). Generating default Firebase reset link...`);
      try {
        resetLink = await firebaseAuth.generatePasswordResetLink(cleanEmail);
      } catch (fallbackErr: any) {
        console.error(`❌ Fallback link generation failed (code: ${fallbackErr.code}, message: ${fallbackErr.message})`);
        throw fallbackErr;
      }
    }

    console.log(`✅ Password reset link generated for ${cleanEmail}. Dispatching custom HTML email...`);
    await sendPasswordResetEmail(cleanEmail, userName, resetLink);
    console.log(`✉️ Custom password reset email successfully dispatched to ${cleanEmail}!`);

    return res.status(200).json({
      message: 'If an account exists for that email, a password reset link has been dispatched.'
    });
  } catch (error: any) {
    console.error('❌ Error in forgotPassword:', error.code || error.message || error);
    return res.status(200).json({
      message: 'If an account exists for that email, a password reset link has been dispatched.'
    });
  }
};

