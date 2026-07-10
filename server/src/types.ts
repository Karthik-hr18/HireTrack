import { UserRoleType } from '@hiretrack/shared';

export interface UserSession {
  id: string;
  email: string;
  role: UserRoleType;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}
