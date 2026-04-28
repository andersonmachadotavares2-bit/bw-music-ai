import app from './app.js';
import logger from './config/logger.js';
import { initDatabase } from './config/supabase.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      logger.info(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
