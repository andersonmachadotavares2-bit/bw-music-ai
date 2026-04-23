# BW Music AI

Sistema full-stack para geração de músicas (mock) com autenticação via Supabase, associação por usuário e rotas protegidas no backend.

## Estrutura do projeto

```bash
bw-music-ai/
├── backend/
│   ├── db/init.sql
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
└── .env.example
```

## O que foi integrado

- Supabase Auth para:
  - cadastro
  - login
  - logout
  - recuperação de senha
- Tabela `profiles` vinculada ao `auth.users`.
- Tabela `musics` com `user_id` para vincular música ao usuário autenticado.
- Rotas de música protegidas por JWT (`Bearer token`).
- Frontend exige login antes de gerar/listar músicas.

## 1) Criar projeto no Supabase

1. Crie um projeto em https://supabase.com.
2. Em **Project Settings > API**, copie:
   - `Project URL`
   - `anon public`
   - `service_role`
3. Em **Authentication > URL Configuration**, configure `Site URL` como:
   - `http://localhost:3000`
4. No SQL Editor do Supabase, execute o script:
   - `backend/db/init.sql`

## 2) Configurar variáveis de ambiente

### Opção rápida (raiz)

Use `.env.example` como referência para todas as variáveis do projeto.

### Backend

```bash
cd backend
cp .env.example .env
```

Preencha com seus valores reais do Supabase.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Preencha com seus valores reais do Supabase.

## 3) Rodar o projeto localmente

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend em `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend em `http://localhost:3000`.

## Endpoints principais (backend)

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/recover-password`
- `POST /auth/logout` (protegido)
- `POST /auth/sync-profile` (protegido)
- `GET /auth/me` (protegido)

### Música

- `POST /generate-music` (protegido)
- `GET /musics` (protegido)

## Fluxo esperado no frontend

1. Usuário cria conta ou faz login.
2. Sessão Supabase é armazenada no cliente.
3. Frontend envia `Authorization: Bearer <access_token>` para o backend.
4. Backend valida token no Supabase e limita dados por usuário.
5. Usuário só vê e cria as próprias músicas.
