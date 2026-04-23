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

router.post('/auth/signup', signUp);
router.post('/auth/login', signIn);
router.post('/auth/recover-password', recoverPassword);
router.post('/auth/logout', requireAuth, signOut);
router.post('/auth/sync-profile', requireAuth, syncProfile);
router.get('/auth/me', requireAuth, getMe);

export default router;
