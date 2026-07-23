import { Router } from 'express';
import { syncUser, getMe, logout, resendVerification, forgotPassword } from '../controllers/authController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.post('/sync', syncUser);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/resend-verification', optionalAuthenticate, resendVerification);
router.post('/forgot-password', forgotPassword);

export default router;
