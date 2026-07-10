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

// 1. Static routes (Must come before dynamic parameters to avoid route collision)
router.get('/', getPublicJobs);
router.get('/manage', authenticate, authorize('recruiter', 'admin'), getManageJobs);

// 2. Dynamic parameter routes
router.get('/:id', optionalAuthenticate, getJobById);

// 3. Protected mutations (Recruiters & Admins only)
router.post('/', authenticate, authorize('recruiter', 'admin'), createJob);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter', 'admin'), deleteJob);

export default router;
