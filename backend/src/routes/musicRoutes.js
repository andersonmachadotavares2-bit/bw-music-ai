import { Router } from 'express';
import { generateMusic, getMusics } from '../controllers/musicController.js';

const router = Router();

router.post('/generate-music', generateMusic);
router.get('/musics', getMusics);

export default router;
