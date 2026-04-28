import { supabase } from '../config/supabaseClient.js';

// Função para simular a chamada à API do Suno AI e retornar um task ID
async function submitMusicGenerationTask(prompt) {
  // Aqui, no futuro, faremos a chamada real à API do Suno AI via agregador.
  // Por enquanto, simulamos um atraso e retornamos um ID de tarefa.
  return new Promise(resolve => {
    setTimeout(() => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Simulando submissão de tarefa para Suno AI. Task ID: ${taskId}`);
      resolve(taskId);
    }, 1000);
  });
}

// Função para simular o polling da API do Suno AI
async function pollMusicGenerationStatus(taskId) {
  // No futuro, faremos a chamada real para verificar o status da tarefa no agregador.
  // Por enquanto, simulamos um status de 'pending' e depois 'completed'.
  return new Promise(resolve => {
    const status = Math.random() > 0.7 ? 'completed' : 'pending'; // 30% chance de completar
    console.log(`Simulando polling para Task ID: ${taskId}, Status: ${status}`);
    if (status === 'completed') {
      // Simula uma URL de música real após a conclusão
      const musicUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`;
      resolve({ status: 'completed', url: musicUrl });
    } else {
      resolve({ status: 'pending' });
    }
  });
}

export async function generateMusicFromPrompt(prompt, userId) {
  try {
    // 1. Submeter a tarefa de geração de música para a "IA"
    const taskId = await submitMusicGenerationTask(prompt);

    // 2. Salvar o prompt e o taskId no banco de dados com status 'pending'
    const { data, error } = await supabase
      .from('musics')
      .insert({
        prompt: prompt,
        user_id: userId,
        url: null, // URL será atualizada após a conclusão
        status: 'pending', // Novo campo de status
        task_id: taskId, // Salvar o ID da tarefa para polling
      })
      .select()
      .single();

    if (error) throw error;

    // Retornar a música com status pendente
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

    // Para cada música pendente, verificar o status real da geração
    const musicsWithUpdatedStatus = await Promise.all(data.map(async (music) => {
      if (music.status === 'pending' && music.task_id) {
        const result = await pollMusicGenerationStatus(music.task_id);
        if (result.status === 'completed') {
          // Atualizar o banco de dados com a URL e o status final
          const { data: updatedMusic, error: updateError } = await supabase
            .from('musics')
            .update({ url: result.url, status: 'completed' })
            .eq('id', music.id)
            .select()
            .single();

          if (updateError) console.error('Erro ao atualizar status da música:', updateError);
          return updatedMusic || music; // Retorna a música atualizada ou a original em caso de erro
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
