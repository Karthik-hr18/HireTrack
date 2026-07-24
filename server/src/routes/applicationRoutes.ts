import { Router } from 'express';
import {
  applyToJob,
  getCandidateApplications,
  getManageApplications,
  getApplicationById,
  streamApplicationResume,
  advanceApplication,
  rejectApplication,
  addApplicationNote,
  recruiterAddCandidate
} from '../controllers/applicationController';
import { authenticate, authorize, requireVerifiedEmail } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

// Public / Token stream endpoint
// Removed insecure public resume-stream endpoint

// 1. Candidate specific routes
router.post('/', authenticate, requireVerifiedEmail, authorize('candidate'), uploadResume, applyToJob);
router.get('/me', authenticate, authorize('candidate'), getCandidateApplications);

// 2. Recruiter & Admin management routes
router.post('/manual', authenticate, requireVerifiedEmail, authorize('recruiter', 'admin'), uploadResume, recruiterAddCandidate);
router.get('/', authenticate, authorize('recruiter', 'admin'), getManageApplications);
router.get('/:id/resume', authenticate, authorize('candidate', 'recruiter', 'admin'), streamApplicationResume);
router.get('/:id', authenticate, authorize('recruiter', 'admin'), getApplicationById);
router.post('/:id/advance', authenticate, requireVerifiedEmail, authorize('recruiter', 'admin'), advanceApplication);
router.post('/:id/reject', authenticate, requireVerifiedEmail, authorize('recruiter', 'admin'), rejectApplication);
router.post('/:id/notes', authenticate, requireVerifiedEmail, authorize('recruiter', 'admin'), addApplicationNote);

export default router;
