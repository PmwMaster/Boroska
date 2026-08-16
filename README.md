# Boroska

App de produtividade pessoal para organizar o dia a dia.

## Funcionalidades

- **Tarefas** - Crie e gerencie tarefas com prioridades e categorias
- **Rotina** - Organize blocos de horário por dia da semana
- **Finanças** - Controle receitas e despesas com gráficos
- **Treinos** - Registre treinos com exercícios e séries
- **Estudos** - Acompanhe metas e sessões de estudo
- **IA Assistente** - Chat com sugestões personalizadas

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite |
| Backend | Vercel Serverless Functions |
| Banco de dados | Supabase (PostgreSQL) |
| Deploy | Vercel |

## Estrutura

```
boroska/
├── api/                    # API Routes (Vercel)
│   ├── core.js             # Dashboard + usuários
│   ├── tasks.js            # Tarefas CRUD
│   ├── routines.js         # Rotinas CRUD
│   ├── transactions.js     # Finanças CRUD
│   ├── workouts.js         # Treinos CRUD
│   ├── studies.js          # Estudos CRUD
│   ├── ai.js               # Chat IA
│   └── lib/
│       ├── auth.js         # Autenticação
│       └── supabase.js     # Cliente Supabase
├── frontend/               # React + Vite
│   └── src/
│       ├── pages/          # Páginas
│       ├── components/     # Componentes UI
│       └── lib/            # Utilitários
├── vercel.json             # Config Vercel
└── supabase-schema.sql     # Schema banco
```

## Setup Local

```bash
# Instalar dependências
npm install
cd api && npm install
cd ../frontend && npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Rodar frontend
cd frontend && npm run dev
```

## Deploy

```bash
# Via Vercel CLI
vercel --prod

# Ou conecte o repositório ao Vercel para deploy automático
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL do Supabase |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada do Supabase |
| `VITE_SUPABASE_URL` | URL do Supabase (frontend) |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (frontend) |

## Banco de Dados

O schema está em `supabase-schema.sql`. Execute no Supabase Dashboard > SQL Editor para criar as tabelas.

### Tabelas

- `User` - Usuários
- `Task` - Tarefas
- `RoutineBlock` - Blocos de rotina
- `Transaction` - Transações financeiras
- `Workout` - Treinos
- `WorkoutExercise` - Exercícios
- `StudySession` - Sessões de estudo
- `StudyGoal` - Metas de estudo
- `ChatSession` - Sessões de chat
- `ChatMessage` - Mensagens

## Licença

Privado
