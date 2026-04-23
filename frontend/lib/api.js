const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchMusics() {
  const response = await fetch(`${API_URL}/musics`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as músicas.');
  }

  return response.json();
}

export async function generateMusic(prompt) {
  const response = await fetch(`${API_URL}/generate-music`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Falha ao gerar música.');
  }

  return response.json();
}
