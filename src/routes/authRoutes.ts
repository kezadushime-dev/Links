import { Router } from 'express';
import { register, login, getProfile, changePassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Izi routes zisaba ko uba winjiye (Logged in)
router.get('/profile', protect, getProfile);

router.put('/change-password', protect, changePassword);

export default router;