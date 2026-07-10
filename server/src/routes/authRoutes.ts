import { Router } from 'express';
import { register, login, getMe, verifyEmail } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);
router.get('/me', authenticate, getMe);

export default router;
