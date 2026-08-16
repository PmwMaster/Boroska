# Script de Migração para Supabase (PowerShell)
# Este script ajuda a migrar o banco de dados local para o Supabase

Write-Host "=== Migração do Ritmo para Supabase ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se as variáveis de ambiente estão configuradas
if (-not $env:SUPABASE_DB_URL) {
    Write-Host "Erro: SUPABASE_DB_URL não configurada" -ForegroundColor Red
    Write-Host "Configure com: `$env:SUPABASE_DB_URL = 'postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres'"
    exit 1
}

$LOCAL_DB_URL = "postgresql://admin:adminpassword@localhost:5433/ritmo_db"

Write-Host "1. Testando conexão com banco local..." -ForegroundColor Yellow
$localTest = psql $LOCAL_DB_URL -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Conexão local OK" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao conectar no banco local" -ForegroundColor Red
    exit 1
}

Write-Host "2. Testando conexão com Supabase..." -ForegroundColor Yellow
$supabaseTest = psql $env:SUPABASE_DB_URL -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Conexão Supabase OK" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao conectar no Supabase" -ForegroundColor Red
    exit 1
}

Write-Host "3. Gerando dump do banco local..." -ForegroundColor Yellow
pg_dump $LOCAL_DB_URL -F c -f ritmo_backup.dump
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dump criado: ritmo_backup.dump" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao criar dump" -ForegroundColor Red
    exit 1
}

Write-Host "4. Restaurando dump no Supabase..." -ForegroundColor Yellow
pg_restore $env:SUPABASE_DB_URL -c -C ritmo_backup.dump
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dados migrados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao restaurar dump" -ForegroundColor Red
    exit 1
}

Write-Host "5. Verificando tabelas migradas..." -ForegroundColor Yellow
psql $env:SUPABASE_DB_URL -c "\dt"

Write-Host ""
Write-Host "=== Migração concluída! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "1. Atualize a DATABASE_URL no Vercel com a URL do Supabase"
Write-Host "2. Faça o deploy do frontend no Vercel"
Write-Host "3. Teste todas as funcionalidades"
