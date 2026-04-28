import { supabase } from '../config/supabaseClient.js';
import fetch from 'node-fetch';

const SUNO_API_KEY = process.env.SUNO_API_KEY;
const SUNO_API_BASE_URL = process.env.SUNO_API_BASE_URL || 'https://crazyrouter.com'; // Exemplo de agregador

async function submitMusicGenerationTask(prompt) {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY não configurada.');
  }

  try {
    const response = await fetch(`${SUNO_API_BASE_URL}/suno/submit/music`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'BW-Music-AI-Backend',
      },
      body: JSON.stringify({
        gpt_description_prompt: prompt,
        make_instrumental: false, // Ou true, dependendo da necessidade
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao submeter tarefa para Suno AI.');
    }

    return result.data; // O agregador retorna o task_id em 'data'
  } catch (error) {
    console.error('Erro ao submeter tarefa para Suno AI:', error);
    throw error;
  }
}

async function pollMusicGenerationStatus(taskId) {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY não configurada.');
  }

  try {
    const response = await fetch(`${SUNO_API_BASE_URL}/suno/fetch/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'User-Agent': 'BW-Music-AI-Backend',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao verificar status da tarefa no Suno AI.');
    }

    // O agregador retorna o status e a URL da música
    if (result.status === 'completed' && result.url) {
      return { status: 'completed', url: result.url };
    } else if (result.status === 'failed') {
      return { status: 'failed', message: result.message || 'Geração de música falhou.' };
    } else {
      return { status: 'pending' };
    }
  } catch (error) {
    console.error('Erro ao verificar status da tarefa no Suno AI:', error);
    throw error;
  }
}

export async function generateMusicFromPrompt(prompt, userId) {
  try {
    const taskId = await submitMusicGenerationTask(prompt);

    const { data, error } = await supabase
      .from('musics')
      .insert({
        prompt: prompt,
        user_id: userId,
        url: null,
        status: 'pending',
        task_id: taskId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro ao iniciar a geração de música:', error);
    throw error;
  }
}

export async function getGeneratedMusics(userId) {
  try {
    const { data, error } = await supabase
      .from('musics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const musicsWithUpdatedStatus = await Promise.all(data.map(async (music) => {
      if (music.status === 'pending' && music.task_id) {
        const result = await pollMusicGenerationStatus(music.task_id);
        if (result.status === 'completed') {
          const { data: updatedMusic, error: updateError } = await supabase
            .from('musics')
            .update({ url: result.url, status: 'completed' })
            .eq('id', music.id)
            .select()
            .single();

          if (updateError) console.error('Erro ao atualizar status da música:', updateError);
          return updatedMusic || music;
        } else if (result.status === 'failed') {
          // Marcar como falha no banco de dados
          const { data: failedMusic, error: failError } = await supabase
            .from('musics')
            .update({ status: 'failed', error_message: result.message || 'Geração falhou.' })
            .eq('id', music.id)
            .select()
            .single();
          if (failError) console.error('Erro ao marcar música como falha:', failError);
          return failedMusic || music;
        }
      }
      return music;
    }));

    return musicsWithUpdatedStatus;
  } catch (error) {
    console.error('Erro ao buscar músicas geradas:', error);
    throw error;
  }
}

export async function getMusicById(musicId) {
  try {
    const { data, error } = await supabase
      .from('musics')
      .select('*')
      .eq('id', musicId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar música por ID:', error);
    throw error;
  }
}
