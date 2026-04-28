const MOCK_TRACKS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
];

function getMockUrlFromPrompt(prompt) {
  const index = prompt.length % MOCK_TRACKS.length;
  return MOCK_TRACKS[index];
}

const prompts = ['rock', 'jazz music', 'electronic beat for coding'];
prompts.forEach(p => {
  console.log(`Prompt: "${p}" -> URL: ${getMockUrlFromPrompt(p)}`);
});
