import {
  generateMusicFromPrompt,
  getGeneratedMusics,
} from '../services/musicService.js';

export async function generateMusic(req, res) {
  try {
    const { prompt } = req.body;
    const result = await generateMusicFromPrompt(prompt ?? '');
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Erro ao gerar música.',
    });
  }
}

export async function getMusics(req, res) {
  try {
    const musics = await getGeneratedMusics();
    return res.status(200).json(musics);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar músicas geradas.',
    });
  }
}
