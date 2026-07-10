import { Router } from 'express';
import { applyToJob, getCandidateApplications } from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

// Gated routes for Candidates
router.post('/', authenticate, authorize('candidate'), uploadResume, applyToJob);
router.get('/me', authenticate, authorize('candidate'), getCandidateApplications);

export default router;
