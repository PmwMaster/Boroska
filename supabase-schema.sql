-- ============================================
-- RITMO - Schema para Supabase (com RLS desabilitado)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Tabela de Usuarios
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Tasks
CREATE TABLE IF NOT EXISTS "Task" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Rotinas
CREATE TABLE IF NOT EXISTS "RoutineBlock" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dayOfWeek" INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'schedule',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Transacoes Financeiras
CREATE TABLE IF NOT EXISTS "Transaction" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'outros',
    amount DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Treinos
CREATE TABLE IF NOT EXISTS "Workout" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    "muscleGroup" TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

-- Tabela de Exercicios do Treino
CREATE TABLE IF NOT EXISTS "WorkoutExercise" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    series INTEGER NOT NULL DEFAULT 4,
    "repsMin" INTEGER NOT NULL DEFAULT 8,
    "repsMax" INTEGER NOT NULL DEFAULT 12,
    weight DOUBLE PRECISION,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "workoutId" TEXT NOT NULL REFERENCES "Workout"(id) ON DELETE CASCADE
);

-- Tabela de Sessoes de Estudo
CREATE TABLE IF NOT EXISTS "StudySession" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subject TEXT NOT NULL,
    topic TEXT,
    duration INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Metas de Estudo
CREATE TABLE IF NOT EXISTS "StudyGoal" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#7C6FF0',
    "weekTarget" INTEGER NOT NULL DEFAULT 24,
    "weekDone" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL REFERENCES "User"(id)
);

-- Tabela de Sessoes de Chat
CREATE TABLE IF NOT EXISTS "ChatSession" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    "sessionId" TEXT NOT NULL REFERENCES "ChatSession"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- DESABILITAR RLS em todas as tabelas
-- (Necessario para a service_role key funcionar)
-- ============================================
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineBlock" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutExercise" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyGoal" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatSession" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" DISABLE ROW LEVEL SECURITY;

-- ============================================
-- INDICES para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_task_user ON "Task"("userId");
CREATE INDEX IF NOT EXISTS idx_task_status ON "Task"(status);
CREATE INDEX IF NOT EXISTS idx_routine_user ON "RoutineBlock"("userId");
CREATE INDEX IF NOT EXISTS idx_routine_day ON "RoutineBlock"("dayOfWeek");
CREATE INDEX IF NOT EXISTS idx_transaction_user ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS idx_transaction_date ON "Transaction"(date);
CREATE INDEX IF NOT EXISTS idx_workout_user ON "Workout"("userId");
CREATE INDEX IF NOT EXISTS idx_workout_exercise ON "WorkoutExercise"("workoutId");
CREATE INDEX IF NOT EXISTS idx_study_session_user ON "StudySession"("userId");
CREATE INDEX IF NOT EXISTS idx_study_goal_user ON "StudyGoal"("userId");
CREATE INDEX IF NOT EXISTS idx_chat_session_user ON "ChatSession"("userId");
CREATE INDEX IF NOT EXISTS idx_chat_message_session ON "ChatMessage"("sessionId");

-- ============================================
-- INSERIR USUARIO PADRAO
-- ============================================
INSERT INTO "User" (id, name, email) VALUES 
    ('8d8292a1-9de7-4955-be3f-a92a2ff03a37', 'Cristiano', 'cristiano@boroska.com')
ON CONFLICT (id) DO NOTHING;
