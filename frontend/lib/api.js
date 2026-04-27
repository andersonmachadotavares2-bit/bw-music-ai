const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://bw-music-ai-production.up.railway.app';

function getAuthHeaders(accessToken) {
  if (!accessToken) {
    throw new Error('Você precisa estar autenticado para usar esta funcionalidade.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchMusics(accessToken) {
  const headers = getAuthHeaders(accessToken);

  const response = await fetch(`${API_URL}/musics`, {
    cache: 'no-store',
    headers,
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as músicas.');
  }

  return response.json();
}

export async function generateMusic(prompt, accessToken) {
  const headers = getAuthHeaders(accessToken);

  const response = await fetch(`${API_URL}/generate-music`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Falha ao gerar música.');
  }

  return response.json();
}
