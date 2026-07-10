import { Router } from 'express';
import { getAdmins, getRecruiters, createRecruiter, updateRecruiter, toggleRecruiterStatus } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes for user profiles directories
router.get('/admins', authenticate, authorize('recruiter', 'admin'), getAdmins);

// Admin-only Recruiter Management CRUDs
router.get('/recruiters', authenticate, authorize('admin'), getRecruiters);
router.post('/recruiters', authenticate, authorize('admin'), createRecruiter);
router.put('/recruiters/:id', authenticate, authorize('admin'), updateRecruiter);
router.patch('/recruiters/:id/toggle', authenticate, authorize('admin'), toggleRecruiterStatus);

export default router;
