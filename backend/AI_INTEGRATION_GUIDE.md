# Guia de Integração com IA Real para Geração de Música

## Visão Geral

Este guia descreve como integrar uma API real de geração de música ao projeto BW Music AI. Atualmente, o sistema utiliza um motor de mock, mas a arquitetura foi preparada para suportar APIs reais.

## Arquitetura Preparada

O projeto foi estruturado com as seguintes componentes para facilitar a integração:

1. **Sistema de Filas (Bull + Redis)**: Processa requisições de geração de forma assíncrona
2. **Logging (Winston)**: Registra todas as operações para debugging
3. **Testes Automatizados**: Garantem a estabilidade das mudanças
4. **Separação de Responsabilidades**: `musicService.js` contém a lógica de geração

## Opções de APIs Reais

### 1. OpenAI (se disponível para áudio)

```javascript
// Instalação
npm install openai

// Implementação em musicService.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMusicFromPrompt(prompt, userId) {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error('O prompt é obrigatório para gerar música.');
  }

  try {
    // Chamada à API OpenAI (quando disponível)
    const response = await openai.audio.generations.create({
      prompt: normalizedPrompt,
      model: 'music-generation-model', // Modelo futuro
    });

    const generatedUrl = response.audio.url;

    const savedMusic = await createMusic({
      prompt: normalizedPrompt,
      url: generatedUrl,
      userId,
    });

    return {
      ...savedMusic,
      provider: 'openai',
      status: 'generated',
    };
  } catch (error) {
    logger.error('OpenAI generation error:', error);
    throw error;
  }
}
```

### 2. Suno AI (Recomendado)

Suno oferece uma API dedicada para geração de música com IA.

```javascript
// Instalação
npm install suno-api

// Implementação em musicService.js
import SunoAPI from 'suno-api';

const sunoClient = new SunoAPI({
  apiKey: process.env.SUNO_API_KEY,
});

export async function generateMusicFromPrompt(prompt, userId) {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error('O prompt é obrigatório para gerar música.');
  }

  try {
    // Chamada à API Suno
    const response = await sunoClient.generateMusic({
      prompt: normalizedPrompt,
      duration: 30, // segundos
    });

    const generatedUrl = response.audioUrl;

    const savedMusic = await createMusic({
      prompt: normalizedPrompt,
      url: generatedUrl,
      userId,
    });

    return {
      ...savedMusic,
      provider: 'suno',
      status: 'generated',
    };
  } catch (error) {
    logger.error('Suno generation error:', error);
    throw error;
  }
}
```

### 3. Google Magenta

Google Magenta oferece modelos de IA para geração de música.

```javascript
// Instalação
npm install @tensorflow/tfjs @tensorflow/tfjs-core magenta

// Implementação em musicService.js
import * as tf from '@tensorflow/tfjs';
import * as magenta from 'magenta';

export async function generateMusicFromPrompt(prompt, userId) {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error('O prompt é obrigatório para gerar música.');
  }

  try {
    // Carregar modelo Magenta
    const model = await magenta.MusicVAE.load();

    // Gerar música
    const samples = await model.sample(1);

    // Converter para áudio
    const audioUrl = await convertToAudio(samples);

    const savedMusic = await createMusic({
      prompt: normalizedPrompt,
      url: audioUrl,
      userId,
    });

    return {
      ...savedMusic,
      provider: 'magenta',
      status: 'generated',
    };
  } catch (error) {
    logger.error('Magenta generation error:', error);
    throw error;
  }
}
```

## Passos para Integração

### 1. Escolher a API

Selecione uma das opções acima baseado em:
- **Custo**: Suno é geralmente mais acessível
- **Qualidade**: Suno oferece melhor qualidade de áudio
- **Facilidade de Integração**: OpenAI é mais simples se já usa seus serviços

### 2. Configurar Variáveis de Ambiente

```bash
# .env.example
MUSIC_PROVIDER=suno  # ou openai, magenta
SUNO_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
```

### 3. Atualizar musicService.js

Substitua o código do motor de mock pela implementação da API escolhida.

### 4. Testar a Integração

```bash
npm test
```

### 5. Monitorar com Logging

O sistema de logging (Winston) registrará todas as operações:

```bash
tail -f combined.log  # Ver todos os logs
tail -f error.log     # Ver apenas erros
```

## Tratamento de Erros

O sistema de filas (Bull) trata automaticamente:

- **Tentativas de Retentativa**: Reprocessa jobs que falharam
- **Timeouts**: Define limites de tempo para cada geração
- **Dead Letter Queue**: Armazena jobs que falharam permanentemente

```javascript
// Configuração em musicQueue.js
musicQueue.process(
  { concurrency: 5, timeout: 60000 }, // 5 jobs simultâneos, 60s timeout
  async (job) => {
    // Processamento
  }
);
```

## Monitoramento em Produção

Use as ferramentas sugeridas:

- **Prometheus**: Coleta métricas de performance
- **Grafana**: Visualiza as métricas
- **Winston**: Registra eventos

## Próximos Passos

1. Escolher a API de IA
2. Obter credenciais (API Key)
3. Implementar a integração em `musicService.js`
4. Executar testes
5. Fazer deploy em produção

## Suporte

Para dúvidas sobre integração, consulte a documentação oficial das APIs:
- [Suno API Docs](https://suno.com/api)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Magenta](https://magenta.tensorflow.org/)
