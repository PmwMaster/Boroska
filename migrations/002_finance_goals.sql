-- Rode no Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS "FinanceGoal" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    color TEXT NOT NULL DEFAULT '#7EB356',
    "userId" UUID NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_finance_goal_user ON "FinanceGoal"("userId");
ALTER TABLE "FinanceGoal" DISABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
