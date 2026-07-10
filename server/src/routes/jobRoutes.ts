import { Router } from 'express';
import {
  createJob,
  getPublicJobs,
  getManageJobs,
  getJobById,
  updateJob,
  deleteJob
} from '../controllers/jobController';
import { authenticate, authorize, optionalAuthenticate, requireEmailVerification } from '../middleware/auth';

const router = Router();

// 1. Static routes (Must come before dynamic parameters to avoid route collision)
router.get('/', getPublicJobs);
router.get('/manage', authenticate, authorize('recruiter', 'admin'), getManageJobs);

// 2. Dynamic parameter routes
router.get('/:id', optionalAuthenticate, getJobById);

// 3. Protected mutations (Recruiters & Admins only, gated by email verification)
router.post('/', authenticate, authorize('recruiter', 'admin'), requireEmailVerification, createJob);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), requireEmailVerification, updateJob);
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), requireEmailVerification, deleteJob);

export default router;
