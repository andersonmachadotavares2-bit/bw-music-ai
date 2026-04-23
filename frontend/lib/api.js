import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Você precisa estar autenticado para usar esta funcionalidade.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function fetchMusics() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/musics`, {
    cache: 'no-store',
    headers,
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as músicas.');
  }

  return response.json();
}

export async function generateMusic(prompt) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/generate-music`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Falha ao gerar música.');
  }

  return response.json();
}
