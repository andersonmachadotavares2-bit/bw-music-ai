# BW Music AI

Sistema completo para geração de músicas com IA (mock inicial), com arquitetura separada em frontend e backend.

## Estrutura do projeto

```bash
bw-music-ai/
├── backend/
│   ├── db/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
└── frontend/
    ├── app/
    ├── components/
    └── lib/
```

## Funcionalidades implementadas

- Geração de música por prompt (simulação mock)
- Endpoint `POST /generate-music`
- Endpoint `GET /musics`
- Persistência de músicas no PostgreSQL
- Interface Next.js com:
  - input de prompt
  - botão **Gerar Música**
  - listagem de músicas geradas
  - player HTML5 para reprodução
- Estrutura pronta para integração futura com APIs reais de geração musical

## Como rodar localmente

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend disponível em: `http://localhost:4000`

### 2) Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend disponível em: `http://localhost:3000`

## Banco de dados

Modelo `Music`:

- `id` (SERIAL, PK)
- `prompt` (TEXT)
- `url` (TEXT)
- `createdAt` (TIMESTAMP)

A criação da tabela é automática na inicialização do backend.

## Próximos passos sugeridos

- Integrar com provedor real de geração de áudio
- Adicionar autenticação de usuários
- Incluir fila assíncrona para geração demorada
- Fazer upload de arquivos para storage (S3/R2)
