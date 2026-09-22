-- ============================================
-- CORRIGIR RLS - Dropar politicas existentes e recriar
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Dropar politicas existentes se existirem
DROP POLICY IF EXISTS "service_all_user" ON "User";
DROP POLICY IF EXISTS "service_all_task" ON "Task";
DROP POLICY IF EXISTS "service_all_routine" ON "RoutineBlock";
DROP POLICY IF EXISTS "service_all_transaction" ON "Transaction";
DROP POLICY IF EXISTS "service_all_workout" ON "Workout";
DROP POLICY IF EXISTS "service_all_exercise" ON "WorkoutExercise";
DROP POLICY IF EXISTS "service_all_studysession" ON "StudySession";
DROP POLICY IF EXISTS "service_all_studygoal" ON "StudyGoal";
DROP POLICY IF EXISTS "service_all_chatsession" ON "ChatSession";
DROP POLICY IF EXISTS "service_all_chatmessage" ON "ChatMessage";

-- Recriar politicas para service role (acesso total)
CREATE POLICY "service_all_user" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_task" ON "Task" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_routine" ON "RoutineBlock" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_transaction" ON "Transaction" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_workout" ON "Workout" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_exercise" ON "WorkoutExercise" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_studysession" ON "StudySession" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_studygoal" ON "StudyGoal" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_chatsession" ON "ChatSession" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_chatmessage" ON "ChatMessage" FOR ALL USING (true) WITH CHECK (true);
