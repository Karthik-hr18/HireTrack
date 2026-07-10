import { Router } from 'express';
import {
  createJob,
  getPublicJobs,
  getManageJobs,
  getJobById,
  updateJob,
  deleteJob
} from '../controllers/jobController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getPublicJobs);
router.get('/:id', optionalAuthenticate, getJobById);

// Protected routes (Recruiters & Admins only)
router.post('/', authenticate, authorize('recruiter', 'admin'), createJob);
router.get('/manage', authenticate, authorize('recruiter', 'admin'), getManageJobs);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), deleteJob);

export default router;
