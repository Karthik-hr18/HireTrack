import { Router } from 'express';
import { scheduleInterview, getAdminInterviews } from '../controllers/interviewController';
import { submitScorecard } from '../controllers/scorecardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes for managing interviews (Recruiters & Admins)
router.post('/', authenticate, authorize('recruiter', 'admin'), scheduleInterview);
router.get('/mine', authenticate, authorize('recruiter', 'admin'), getAdminInterviews);

// Scorecard submission (Admins only)
router.post('/:id/scorecard', authenticate, authorize('admin'), submitScorecard);

export default router;
