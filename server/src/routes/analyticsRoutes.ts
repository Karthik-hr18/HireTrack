import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes for aggregates and dashboard charts (Recruiters and Admins)
router.get('/dashboard', authenticate, authorize('recruiter', 'admin'), getDashboardMetrics);

export default router;
