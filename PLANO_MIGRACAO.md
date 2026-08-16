# Plano de Migração: Ritmo para Supabase + Vercel

## Visão Geral

Migrar o sistema **Ritmo** do ambiente local (Docker + PostgreSQL) para:
- **Supabase**: Banco de dados PostgreSQL gerenciado + autenticação + storage
- **Vercel**: Deploy do frontend (React/Vite) + API Routes (serverless)

---

## Arquitetura Atual vs Nova

### Atual
```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  PostgreSQL   │    │   Backend    │                   │
│  │  (port 5433)  │◄───│  Express.js  │                   │
│  └──────────────┘    │  (port 4000) │                   │
│                      └──────┬───────┘                   │
│                             │                           │
│                      ┌──────▼───────┐                   │
│                      │   Frontend   │                   │
│                      │  Vite/React  │                   │
│                      │  (servido    │                   │
│                      │   estático)  │                   │
│                      └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Nova
```
┌─────────────────────────────────────────────────────────┐
│                      Vercel                              │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │   Frontend   │    │  API Routes  │                   │
│  │  React/Vite  │───►│  (Serverless)│                   │
│  │  (CDN Global)│    │  /api/*      │                   │
│  └──────────────┘    └──────┬───────┘                   │
│                             │                           │
└─────────────────────────────┼───────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │  ┌────────────┐  │
                    │  │ PostgreSQL │  │
                    │  │ Gerenciado │  │
                    │  └────────────┘  │
                    │  ┌────────────┐  │
                    │  │    Auth     │  │
                    │  │ (opcional) │  │
                    │  └────────────┘  │
                    └──────────────────┘
```

---

## Fase 1: Configuração do Supabase

### 1.1 Criar Projeto no Supabase
1. Acessar [supabase.com](https://supabase.com)
2. Criar conta e novo projeto
3. Anotar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: chave pública para o frontend
   - **Service Role Key**: chave privada para o backend
   - **Database URL**: `postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres`

### 1.2 Migrar Schema do Banco
```bash
# No diretório do backend
npx prisma db push --schema=./prisma/schema.prisma
```

Ou executar SQL manualmente no Supabase Dashboard > SQL Editor.

### 1.3 Migrar Dados (se necessário)
```bash
# Dump do banco local
pg_dump -h localhost -p 5433 -U admin -d ritmo_db > dump.sql

# Restaurar no Supabase (via psql ou Supabase Dashboard)
psql "postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres" < dump.sql
```

---

## Fase 2: Refatoração do Backend para API Routes

### 2.1 Estrutura de Diretórios (Vercel)
```
/api
├── dashboard.js
├── tasks/
│   ├── index.js          # GET /api/tasks, POST /api/tasks
│   └── [id]/
│       └── index.js      # GET /api/tasks/:id, PUT /api/tasks/:id, DELETE /api/tasks/:id
├── routines/
│   ├── index.js
│   └── [id]/
│       └── index.js
├── transactions/
│   ├── index.js
│   └── [id]/
│       └── index.js
├── workouts/
│   ├── index.js
│   └── [id]/
│       └── index.js
├── studies/
│   ├── index.js
│   └── [id]/
│       └── index.js
├── users/
│   └── index.js
├── ai/
│   └── index.js
└── lib/
    └── prisma.js         # Cliente Prisma singleton
```

### 2.2 Exemplo de API Route (Vercel)
```javascript
// /api/tasks/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // GET - Listar tasks
  if (req.method === 'GET') {
    const { userId } = req.query;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(tasks);
  }

  // POST - Criar task
  if (req.method === 'POST') {
    const task = await prisma.task.create({
      data: req.body
    });
    return res.status(201).json(task);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
```

### 2.3 Cliente Prisma Singleton
```javascript
// /api/lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
```

---

## Fase 3: Configuração do Vercel

### 3.1 Variáveis de Ambiente
No painel do Vercel, configurar:

```env
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
```

### 3.2 Configuração do Vercel (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

### 3.3 Deploy
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## Fase 4: Ajustes no Código

### 4.1 Frontend - URLs da API
Alterar chamadas de API de `http://localhost:4000/api/*` para `/api/*` (relativo).

```javascript
// Antes
const API = 'http://localhost:4000/api';
fetch(`${API}/tasks`);

// Depois
fetch('/api/tasks');
```

### 4.2 Prisma Schema - Adicionar URL do Supabase
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4.3 CORS
No Vercel, CORS não é necessário para same-origin requests (frontend e API no mesmo domínio).

---

## Checklist de Migração

### Pré-requisitos
- [ ] Conta no Supabase criada
- [ ] Conta no Vercel criada
- [ ] Vercel CLI instalado
- [ ] Supabase CLI instalado (opcional)

### Supabase
- [ ] Projeto criado no Supabase
- [ ] Schema migrado (prisma db push)
- [ ] Dados migrados (se necessário)
- [ ] Connection string testada
- [ ] RLS (Row Level Security) configurado (se necessário)

### Backend → API Routes
- [ ] Estrutura de pastas `/api` criada
- [ ] Rotas migradas para formato Vercel Serverless
- [ ] Cliente Prisma singleton configurado
- [ ] Variáveis de ambiente configuradas

### Frontend
- [ ] URLs da API atualizadas para relativo
- [ ] Build funcionando
- [ ] Variáveis de ambiente do frontend configuradas

### Deploy
- [ ] Deploy no Vercel funcionando
- [ ] Health check respondendo
- [ ] Todas as rotas testadas
- [ ] Autenticação funcionando (se aplicável)

---

## Custos Estimados

### Supabase (Free Tier)
- 500MB banco de dados
- 1GB storage
- 50.000 usuários ativos
- **Suficiente para desenvolvimento e MVP**

### Vercel (Free Tier)
- 100GB bandwidth/mês
- Serverless Functions: 100GB-horas/mês
- **Suficiente para desenvolvimento e MVP**

---

## Rollback Plan

Se algo der errado:
1. Manter o Docker Compose funcionando localmente
2. Pode reverter para deploy manual em VPS se necessário
3. Supabase permite exportar dados facilmente

---

## Próximos Passos

1. **Criar conta no Supabase** e obter credenciais
2. **Migrar schema** do banco
3. **Refatorar backend** para API Routes do Vercel
4. **Configurar Vercel** e fazer deploy
5. **Testar** todas as funcionalidades
