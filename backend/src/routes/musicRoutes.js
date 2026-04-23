import { Router } from 'express';
import { generateMusic, getMusics } from '../controllers/musicController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/generate-music', requireAuth, generateMusic);
router.get('/musics', requireAuth, getMusics);

export default router;
