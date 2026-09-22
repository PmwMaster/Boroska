-- ============================================
-- MIGRAR DADOS DO DOCKER PARA SUPABASE
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================

-- Inserir usuário
INSERT INTO "User" (id, name, email, "createdAt") VALUES 
('cms2o06mc0000b8uevrpzba66', 'Cristiano Xavier', 'cristiano@ritmo.app', '2026-07-27T03:26:07.236Z')
ON CONFLICT (id) DO NOTHING;

-- Inserir meta de estudo
INSERT INTO "StudyGoal" (id, name, progress, color, "weekTarget", "weekDone", "userId") VALUES 
('cmsdukewm00092gue6htubp98', 'aprender java', 0, '#6366f1', 5, 0, 'cms2o06mc0000b8uevrpzba66')
ON CONFLICT (id) DO NOTHING;

-- Inserir treino
INSERT INTO "Workout" (id, date, "muscleGroup", notes, status, "userId") VALUES 
('cmsqpbowt00042wuerle54g73', '2026-08-12T23:09:31.997Z', 'Peito & Abdômen', NULL, 'NOT_STARTED', 'cms2o06mc0000b8uevrpzba66')
ON CONFLICT (id) DO NOTHING;

-- Inserir exercícios
INSERT INTO "WorkoutExercise" (id, name, series, "repsMin", "repsMax", weight, "isDone", "workoutId") VALUES 
('cmsqpbox000052wuekshlh5xi', 'Supino Reto Barra', 4, 8, 12, NULL, false, 'cmsqpbowt00042wuerle54g73'),
('cmsqpbox000062wuew144tdr9', 'Supino Inclinado Halter', 3, 10, 12, NULL, false, 'cmsqpbowt00042wuerle54g73'),
('cmsqpbox000072wuec3qlik4n', 'Crucifixo Máquina', 3, 12, 15, NULL, false, 'cmsqpbowt00042wuerle54g73')
ON CONFLICT (id) DO NOTHING;
