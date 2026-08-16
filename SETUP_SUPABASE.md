# Guia de Setup: Supabase + Vercel

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - **Name**: ritmo
   - **Database Password**: (gere uma senha forte e anote)
   - **Region**: South America (São Paulo)
4. Aguarde o projeto ser criado (~2 minutos)

### Obter Credenciais

Após criar o projeto, vá em **Settings > API**:

```
Project URL: https://abcdefghij.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

E em **Settings > Database**:

```
Connection string: postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghij.supabase.co:5432/postgres
```

---

## Passo 2: Migrar o Schema

### Opção A: Via Prisma (Recomendado)

```bash
# No diretório do projeto
cd backend

# Atualize o .env com a URL do Supabase
echo 'DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"' > .env

# Gere o Prisma Client
npx prisma generate

# Push do schema para o Supabase
npx prisma db push
```

### Opção B: Via SQL Manual

1. Acesse o **SQL Editor** no painel do Supabase
2. Execute o SQL abaixo:

```sql
-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tasks
CREATE TABLE "Task" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'TODO',
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Rotinas
CREATE TABLE "RoutineBlock" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dayOfWeek" INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    icon TEXT DEFAULT 'schedule',
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE "Transaction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'outros',
    amount DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Treinos
CREATE TABLE "Workout" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "muscleGroup" TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'NOT_STARTED',
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

-- Tabela de Exercícios do Treino
CREATE TABLE "WorkoutExercise" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    series INTEGER DEFAULT 4,
    "repsMin" INTEGER DEFAULT 8,
    "repsMax" INTEGER DEFAULT 12,
    weight DOUBLE PRECISION,
    "isDone" BOOLEAN DEFAULT FALSE,
    "workoutId" TEXT NOT NULL REFERENCES "Workout"(id) ON DELETE CASCADE
);

-- Tabela de Sessões de Estudo
CREATE TABLE "StudySession" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subject TEXT NOT NULL,
    topic TEXT,
    duration INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas de Estudo
CREATE TABLE "StudyGoal" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    color TEXT DEFAULT '#7C6FF0',
    "weekTarget" INTEGER DEFAULT 24,
    "weekDone" INTEGER DEFAULT 0,
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

-- Tabela de Sessões de Chat
CREATE TABLE "ChatSession" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens do Chat
CREATE TABLE "ChatMessage" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    "sessionId" TEXT NOT NULL REFERENCES "ChatSession"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_task_user ON "Task"("userId");
CREATE INDEX idx_routine_user ON "RoutineBlock"("userId");
CREATE INDEX idx_transaction_user ON "Transaction"("userId");
CREATE INDEX idx_workout_user ON "Workout"("userId");
CREATE INDEX idx_workout_exercise ON "WorkoutExercise"("workoutId");
CREATE INDEX idx_study_session_user ON "StudySession"("userId");
CREATE INDEX idx_study_goal_user ON "StudyGoal"("userId");
CREATE INDEX idx_chat_session_user ON "ChatSession"("userId");
CREATE INDEX idx_chat_message_session ON "ChatMessage"("sessionId");
```

---

## Passo 3: Migrar Dados (Opcional)

Se você tem dados no banco local que deseja preservar:

```bash
# Exportar dados do banco local
pg_dump -h localhost -p 5433 -U admin -d ritmo_db -F c -f ritmo_backup.dump

# Importar para o Supabase
pg_restore "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" -c ritmo_backup.dump
```

---

## Passo 4: Configurar Vercel

### 4.1 Criar conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab/Bitbucket

### 4.2 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4.3 Login

```bash
vercel login
```

### 4.4 Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
DATABASE_URL = postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL = https://[ref].supabase.co
SUPABASE_ANON_KEY = eyJ...
```

### 4.5 Deploy

```bash
# No diretório do projeto
vercel

# Ou para deploy em produção
vercel --prod
```

---

## Passo 5: Atualizar Frontend

Atualize o arquivo `frontend/src/config.js` (ou onde a URL da API estiver configurada):

```javascript
// Configuração da API
export const API_URL = import.meta.env.VITE_API_URL || '';
```

E no `frontend/.env`:
```
VITE_API_URL=
```

(Vazio = mesma origem, funciona no Vercel)

---

## Passo 6: Testar

1. Acesse a URL fornecida pelo Vercel (ex: `ritmo.vercel.app`)
2. Teste o login/criação de usuário
3. Teste todas as funcionalidades:
   - Criar/editar tasks
   - Gerenciar rotinas
   - Registrar transações
   - Criar treinos
   - Registrar estudos

---

## Troubleshooting

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- Supabase usa SSL por padrão, adicione `?sslmode=require` se necessário

### Erro de CORS
- No Vercel, não há problema de CORS (same-origin)
- Se testar localmente, configure CORS no backend

### Prisma Client não gerado
```bash
cd backend
npx prisma generate
```

### Schema não sincronizado
```bash
cd backend
npx prisma db push
```

---

## Custos

### Supabase (Free Tier)
- 500MB banco de dados
- 1GB file storage
- 50.000 usuários mensais
- **Suficiente para desenvolvimento e MVP**

### Vercel (Free Tier)
- 100GB bandwidth/mês
- 1000 GB-horas de serverless
- **Suficiente para desenvolvimento e MVP**

---

## Próximos Passos (Opcional)

1. **Configurar autenticação**: Usar Supabase Auth em vez de autenticação custom
2. **Configurar storage**: Usar Supabase Storage para uploads de imagens
3. **Configurar Edge Functions**: Para tarefas em background
4. **Configurar monitoramento**: Sentry, LogRocket, etc.
