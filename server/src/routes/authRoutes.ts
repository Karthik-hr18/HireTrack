import { Router } from 'express';
import { checkEmail, syncUser, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/check-email', checkEmail);
router.post('/sync', syncUser);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
