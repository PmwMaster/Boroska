-- ============================================
-- RITMO - Recriar tabelas com RLS correto
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- Dropar tabelas existentes (ordem correta por causa das foreign keys)
DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "ChatSession" CASCADE;
DROP TABLE IF EXISTS "WorkoutExercise" CASCADE;
DROP TABLE IF EXISTS "StudySession" CASCADE;
DROP TABLE IF EXISTS "StudyGoal" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "RoutineBlock" CASCADE;
DROP TABLE IF EXISTS "Task" CASCADE;
DROP TABLE IF EXISTS "Workout" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- CRIAR TABELAS
-- ============================================

CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Task" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "RoutineBlock" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "dayOfWeek" INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'schedule',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Transaction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'outros',
    amount DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Workout" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    "muscleGroup" TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "WorkoutExercise" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    series INTEGER NOT NULL DEFAULT 4,
    "repsMin" INTEGER NOT NULL DEFAULT 8,
    "repsMax" INTEGER NOT NULL DEFAULT 12,
    weight DOUBLE PRECISION,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "workoutId" UUID NOT NULL REFERENCES "Workout"(id) ON DELETE CASCADE
);

CREATE TABLE "StudySession" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic TEXT,
    duration INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "StudyGoal" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#7C6FF0',
    "weekTarget" INTEGER NOT NULL DEFAULT 24,
    "weekDone" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "ChatSession" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "ChatMessage" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    "sessionId" UUID NOT NULL REFERENCES "ChatSession"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDICES
-- ============================================
CREATE INDEX idx_task_user ON "Task"("userId");
CREATE INDEX idx_task_status ON "Task"(status);
CREATE INDEX idx_routine_user ON "RoutineBlock"("userId");
CREATE INDEX idx_routine_day ON "RoutineBlock"("dayOfWeek");
CREATE INDEX idx_transaction_user ON "Transaction"("userId");
CREATE INDEX idx_transaction_date ON "Transaction"(date);
CREATE INDEX idx_workout_user ON "Workout"("userId");
CREATE INDEX idx_workout_exercise ON "WorkoutExercise"("workoutId");
CREATE INDEX idx_study_session_user ON "StudySession"("userId");
CREATE INDEX idx_study_goal_user ON "StudyGoal"("userId");
CREATE INDEX idx_chat_session_user ON "ChatSession"("userId");
CREATE INDEX idx_chat_message_session ON "ChatMessage"("sessionId");

-- ============================================
-- RLS - Habilitar e criar politicas
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoutineBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutExercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyGoal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

-- Politicas para service role (acesso total via API)
CREATE POLICY "allow_all_user" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_task" ON "Task" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_routine" ON "RoutineBlock" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transaction" ON "Transaction" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_workout" ON "Workout" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_exercise" ON "WorkoutExercise" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_studysession" ON "StudySession" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_studygoal" ON "StudyGoal" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_chatsession" ON "ChatSession" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_chatmessage" ON "ChatMessage" FOR ALL USING (true) WITH CHECK (true);
