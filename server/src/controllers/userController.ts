import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    // Retrieve all active admin users (excluding hashed passwords)
    const admins = await User.find({
      role: 'admin',
      isActive: true
    }).select('_id name email role');

    return res.status(200).json(admins);
  } catch (error) {
    return next(error);
  }
};
