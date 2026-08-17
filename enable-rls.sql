-- ============================================
-- HABILITAR RLS COM POLITICAS CORRETAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Habilitar RLS em todas as tabelas
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

-- ============================================
-- POLITICAS PARA SERVICE ROLE (backend/API)
-- Permite acesso total para a service_role key
-- ============================================

-- User
CREATE POLICY "service_all_user" ON "User" FOR ALL USING (true) WITH CHECK (true);

-- Task
CREATE POLICY "service_all_task" ON "Task" FOR ALL USING (true) WITH CHECK (true);

-- RoutineBlock
CREATE POLICY "service_all_routine" ON "RoutineBlock" FOR ALL USING (true) WITH CHECK (true);

-- Transaction
CREATE POLICY "service_all_transaction" ON "Transaction" FOR ALL USING (true) WITH CHECK (true);

-- Workout
CREATE POLICY "service_all_workout" ON "Workout" FOR ALL USING (true) WITH CHECK (true);

-- WorkoutExercise
CREATE POLICY "service_all_exercise" ON "WorkoutExercise" FOR ALL USING (true) WITH CHECK (true);

-- StudySession
CREATE POLICY "service_all_studysession" ON "StudySession" FOR ALL USING (true) WITH CHECK (true);

-- StudyGoal
CREATE POLICY "service_all_studygoal" ON "StudyGoal" FOR ALL USING (true) WITH CHECK (true);

-- ChatSession
CREATE POLICY "service_all_chatsession" ON "ChatSession" FOR ALL USING (true) WITH CHECK (true);

-- ChatMessage
CREATE POLICY "service_all_chatmessage" ON "ChatMessage" FOR ALL USING (true) WITH CHECK (true);
