import { Router } from 'express';
import { getEmployees, getEmployeeStatsAndTeams, getEmployeeById } from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all employee endpoints: Recruiters and Admins only
router.use(authenticate);
router.use(authorize('recruiter', 'admin'));

router.get('/stats', getEmployeeStatsAndTeams);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

export default router;
