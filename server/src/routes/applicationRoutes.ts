import { Router } from 'express';
import { applyToJob, getCandidateApplications } from '../controllers/applicationController';
import { authenticate, authorize, requireEmailVerification } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

// Gated routes for Candidates (post application is checked for email verification)
router.post('/', authenticate, authorize('candidate'), requireEmailVerification, uploadResume, applyToJob);
router.get('/me', authenticate, authorize('candidate'), getCandidateApplications);

export default router;
