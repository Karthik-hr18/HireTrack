import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRoleType } from '@hiretrack/shared';
import { UserSession } from '../types';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
if (process.env.NODE_ENV !== "production") {
  console.log('=== AUTH DEBUG ===');
  console.log('Method:', req.method);
  console.log('Path:', req.originalUrl);
  console.log('Authorization:', authHeader);
}
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication token is missing or invalid',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        message: 'Internal server configuration error',
        code: 'INTERNAL_ERROR'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: UserRoleType;
    };

    // Verify user exists and is active in the database
    const user = await User.findById(decoded.id);
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

    // Attach user to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Authentication token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      message: 'Invalid authentication token',
      code: 'UNAUTHORIZED'
    });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: UserRoleType;
    };

    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
    return next();
  } catch (error) {
    // Treat invalid or expired tokens as anonymous public requests
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

