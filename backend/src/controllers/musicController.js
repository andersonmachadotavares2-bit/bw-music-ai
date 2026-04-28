import {
  generateMusicFromPrompt,
  getGeneratedMusics,
} from '../services/musicService.js';

export async function generateMusic(req, res) {
  try {
    const { prompt } = req.body;
    
    // Validação básica do prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        message: 'O prompt é obrigatório para gerar música.',
      });
    }

    // O userId vem do middleware requireAuth (req.user.id)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Usuário não autenticado.',
      });
    }

    // Geração síncrona (MVP)
    const result = await generateMusicFromPrompt(prompt, userId);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Erro em generateMusic:', error);
    return res.status(500).json({
      message: error.message || 'Erro ao gerar música.',
    });
  }
}

export async function getMusics(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Usuário não autenticado.',
      });
    }

    const musics = await getGeneratedMusics(userId);
    return res.status(200).json(musics);
  } catch (error) {
    console.error('Erro em getMusics:', error);
    return res.status(500).json({
      message: 'Erro ao listar músicas geradas.',
    });
  }
}
