-- Rode no Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS "PushSubscription" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_sub_user ON "PushSubscription"("userId");
ALTER TABLE "PushSubscription" DISABLE ROW LEVEL SECURITY;

-- Forca o PostgREST a recarregar o cache de schema (necessario apos criar tabela via SQL Editor)
NOTIFY pgrst, 'reload schema';
