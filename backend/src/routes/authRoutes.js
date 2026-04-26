import { Router } from 'express';
import {
  getMe,
  recoverPassword,
  signIn,
  signOut,
  signUp,
  syncProfile,
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// 🔥 ROTAS SEM /auth AQUI
router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/recover-password', recoverPassword);
router.post('/logout', requireAuth, signOut);
router.post('/sync-profile', requireAuth, syncProfile);
router.get('/me', requireAuth, getMe);

export default router;
