# Implementação de Sistema de Filas e Processamento Assíncrono

## Visão Geral

O projeto BW Music AI foi atualizado com um sistema de filas baseado em **Bull** e **Redis** para processar requisições de geração de música de forma assíncrona. Isso melhora significativamente a experiência do usuário, evitando timeouts e permitindo processamento em background.

## Arquitetura

### Componentes

1. **Bull Queue**: Gerencia a fila de jobs
2. **Redis**: Armazena o estado dos jobs
3. **musicQueue.js**: Processador de jobs
4. **musicController.js**: Adiciona jobs à fila

### Fluxo de Dados

```
Usuário (Frontend)
    ↓
POST /generate-music (com prompt)
    ↓
musicController.generateMusic()
    ↓
musicQueue.add({ prompt, userId })
    ↓
Resposta 202 (Accepted) com jobId
    ↓
Frontend exibe "Processando..."
    ↓
musicQueue.process() (em background)
    ↓
Música gerada e salva no banco
    ↓
Frontend pode fazer polling para verificar status
```

## Instalação e Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install bull ioredis
```

### 2. Configurar Redis

#### Opção A: Redis Local (Desenvolvimento)

```bash
# Instalar Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Iniciar Redis
redis-server
```

#### Opção B: Redis em Docker

```bash
docker run -d -p 6379:6379 redis:latest
```

#### Opção C: Redis em Produção (AWS ElastiCache, Heroku Redis)

Configurar variável de ambiente:

```bash
REDIS_URL=redis://user:password@host:port
```

### 3. Configurar Variáveis de Ambiente

```bash
# .env
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

## Uso

### Frontend

O frontend foi atualizado para lidar com respostas assíncronas:

```javascript
// Antes: Resposta síncrona
const newMusic = await generateMusic(prompt, token);

// Depois: Resposta assíncrona com jobId
const response = await generateMusic(prompt, token);
// response = { jobId: "123", status: "processing", message: "..." }
```

### Backend

A geração de música agora é assíncrona:

```javascript
// musicController.js
export async function generateMusic(req, res) {
  const { prompt } = req.body;
  
  // Adiciona à fila
  const job = await musicQueue.add({ prompt, userId: req.user.id });
  
  // Retorna imediatamente com 202 (Accepted)
  return res.status(202).json({ 
    jobId: job.id,
    status: 'processing'
  });
}
```

## Monitoramento de Jobs

### Verificar Status de um Job

```javascript
// Adicionar endpoint para verificar status
app.get('/jobs/:jobId', async (req, res) => {
  const job = await musicQueue.getJob(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({ message: 'Job não encontrado' });
  }
  
  const state = await job.getState();
  const progress = job.progress();
  
  return res.json({ 
    jobId: job.id, 
    state, 
    progress 
  });
});
```

### Listar Todos os Jobs

```javascript
app.get('/jobs', async (req, res) => {
  const jobs = await musicQueue.getJobs();
  return res.json(jobs);
});
```

## Tratamento de Erros

### Retry Automático

```javascript
// musicQueue.js
musicQueue.process(
  { 
    attempts: 3,  // Tentar 3 vezes
    backoff: {
      type: 'exponential',
      delay: 2000  // Começar com 2s, aumentar exponencialmente
    }
  },
  async (job) => {
    // Processamento
  }
);
```

### Dead Letter Queue

```javascript
// Jobs que falharam permanentemente vão para DLQ
musicQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} falhou permanentemente:`, err);
  // Notificar usuário, enviar email, etc.
});
```

## Escalabilidade

### Múltiplos Processadores

Para escalar, execute múltiplas instâncias do processador:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run process-queue

# Terminal 3
npm run process-queue
```

### Concorrência

Configurar quantos jobs processar simultaneamente:

```javascript
musicQueue.process(
  { concurrency: 5 },  // Processar 5 jobs em paralelo
  async (job) => { ... }
);
```

## Monitoramento e Logging

### Logs de Jobs

```javascript
musicQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} concluído`);
});

musicQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} falhou:`, err);
});

musicQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} travou`);
});
```

### Métricas com Prometheus

```javascript
import prometheus from 'prom-client';

const jobsProcessed = new prometheus.Counter({
  name: 'music_jobs_processed_total',
  help: 'Total de jobs processados',
});

musicQueue.on('completed', () => {
  jobsProcessed.inc();
});
```

## Troubleshooting

### Redis não conecta

```bash
# Verificar se Redis está rodando
redis-cli ping
# Resposta esperada: PONG

# Verificar conexão
redis-cli -h 127.0.0.1 -p 6379
```

### Jobs não são processados

```bash
# Verificar jobs na fila
redis-cli
> KEYS *
> HGETALL bull:music-generation:*
```

### Memory leak

```javascript
// Limpar jobs antigos
musicQueue.clean(3600000, 'completed');  // Remover jobs completados há mais de 1h
musicQueue.clean(3600000, 'failed');     // Remover jobs falhados há mais de 1h
```

## Próximos Passos

1. Implementar polling no frontend para verificar status
2. Adicionar WebSockets para notificações em tempo real
3. Configurar alertas para jobs falhados
4. Implementar dashboard de monitoramento com Bull Board

## Referências

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Redis Documentation](https://redis.io/documentation)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)
