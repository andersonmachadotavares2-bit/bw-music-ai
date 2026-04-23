import { createMusic, listMusics } from '../models/musicModel.js';

const MOCK_TRACKS = [
  'https://cdn.pixabay.com/download/audio/2022/10/25/audio_94669f95f8.mp3?filename=upbeat-funk-pop-113892.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a2eb2cb7.mp3?filename=technology-future-bass-10321.mp3',
  'https://cdn.pixabay.com/download/audio/2022/11/22/audio_1d07f6d268.mp3?filename=chill-abstract-intention-12099.mp3',
];

function getMockUrlFromPrompt(prompt) {
  const hash = [...prompt].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return MOCK_TRACKS[hash % MOCK_TRACKS.length];
}

export async function generateMusicFromPrompt(prompt, userId) {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error('O prompt é obrigatório para gerar música.');
  }

  const generatedUrl = getMockUrlFromPrompt(normalizedPrompt);

  const savedMusic = await createMusic({
    prompt: normalizedPrompt,
    url: generatedUrl,
    userId,
  });

  return {
    ...savedMusic,
    provider: 'mock-engine-v1',
    status: 'generated',
  };
}

export async function getGeneratedMusics(userId) {
  return listMusics(userId);
}
