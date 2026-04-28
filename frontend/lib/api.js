const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bw-music-ai-production.up.railway.app';

function getAuthHeaders(accessToken) {
  if (!accessToken) {
    throw new Error('Você precisa estar autenticado para usar esta funcionalidade.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

export async function fetchMusics(accessToken) {
  const headers = getAuthHeaders(accessToken);

  try {
    const response = await fetch(`${API_URL}/musics`, {
      method: 'GET',
      headers,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Não foi possível carregar as músicas.');
    }

    return response.json();
  } catch (err) {
    console.error('Erro ao buscar músicas:', err);
    throw new Error(err.message === 'Failed to fetch' ? 'Erro de conexão com o servidor. Verifique se o backend está online.' : err.message);
  }
}

export async function generateMusic(prompt, accessToken) {
  const headers = getAuthHeaders(accessToken);

  try {
    const response = await fetch(`${API_URL}/generate-music`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao gerar música.');
    }

    return response.json();
  } catch (err) {
    console.error('Erro ao gerar música:', err);
    throw new Error(err.message === 'Failed to fetch' ? 'Erro de conexão com o servidor. Verifique se o backend está online.' : err.message);
  }
}
