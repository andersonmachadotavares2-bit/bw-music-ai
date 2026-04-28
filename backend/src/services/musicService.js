import { createMusic, listMusics } from '../models/musicModel.js';

// URLs de MP3 reais e públicas do Pixabay para garantir que o player funcione
const MOCK_TRACKS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
];

function getMockUrlFromPrompt(prompt) {
  // Lógica simples de seleção baseada no tamanho do prompt
  const index = prompt.length % MOCK_TRACKS.length;
  return MOCK_TRACKS[index];
}

export async function generateMusicFromPrompt(prompt, userId) {
  const normalizedPrompt = prompt ? prompt.trim() : '';

  if (!normalizedPrompt) {
    throw new Error('O prompt é obrigatório para gerar música.');
  }

  const generatedUrl = getMockUrlFromPrompt(normalizedPrompt);

  // Salva no Supabase através do model
  const savedMusic = await createMusic({
    prompt: normalizedPrompt,
    url: generatedUrl,
    userId,
  });

  return savedMusic;
}

export async function getGeneratedMusics(userId) {
  return listMusics(userId);
}
