import Queue from 'bull';
import logger from '../config/logger.js';
import { generateMusicFromPrompt } from './musicService.js';

// Configuração da fila (assume Redis rodando localmente ou via variável de ambiente)
const musicQueue = new Queue('music-generation', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

musicQueue.process(async (job) => {
  const { prompt, userId } = job.data;
  logger.info(`Processando job de geração de música: ${job.id}`, { userId, prompt });
  
  try {
    // Aqui seria a chamada para a API de IA Real
    // Por enquanto, usamos o musicService que pode ser facilmente estendido para IA Real
    const result = await generateMusicFromPrompt(prompt, userId);
    logger.info(`Job ${job.id} concluído com sucesso`);
    return result;
  } catch (error) {
    logger.error(`Erro ao processar job ${job.id}:`, error);
    throw error;
  }
});

musicQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} falhou:`, err);
});

export default musicQueue;
