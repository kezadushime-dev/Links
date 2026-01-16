import { register, login, getProfile, changePassword, createTestUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/test-user', createTestUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;