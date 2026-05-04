import app from './app.js';
import { initDatabase } from './config/supabase.js';

// Railway fornece a porta via variável de ambiente PORT
const PORT = process.env.PORT || 4000;

async function startServer() {
  console.log('🔄 Iniciando servidor...');
  
  try {
    // Inicializa o banco de dados mas não bloqueia o início do servidor
    initDatabase().catch(err => console.error('Erro ao inicializar banco:', err));
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend rodando com sucesso na porta ${PORT}`);
      console.log(`🔗 Health check disponível em /health`);
    });
  } catch (error) {
    console.error('❌ Falha crítica ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados para evitar crash silencioso
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

startServer();
