import { Router } from 'express';
import { getAdmins } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes for user profiles directories
router.get('/admins', authenticate, authorize('recruiter', 'admin'), getAdmins);

export default router;
