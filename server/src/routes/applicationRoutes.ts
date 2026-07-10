import { Router } from 'express';
import {
  applyToJob,
  getCandidateApplications,
  getManageApplications,
  getApplicationById,
  advanceApplication,
  rejectApplication,
  addApplicationNote
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

// 1. Candidate specific routes
router.post('/', authenticate, authorize('candidate'), uploadResume, applyToJob);
router.get('/me', authenticate, authorize('candidate'), getCandidateApplications);

// 2. Recruiter & Admin management routes
router.get('/', authenticate, authorize('recruiter', 'admin'), getManageApplications);
router.get('/:id', authenticate, authorize('recruiter', 'admin'), getApplicationById);
router.post('/:id/advance', authenticate, authorize('recruiter', 'admin'), advanceApplication);
router.post('/:id/reject', authenticate, authorize('recruiter', 'admin'), rejectApplication);
router.post('/:id/notes', authenticate, authorize('recruiter', 'admin'), addApplicationNote);

export default router;
