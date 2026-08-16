#!/bin/bash

# Script de Migração para Supabase
# Este script ajuda a migrar o banco de dados local para o Supabase

echo "=== Migração do Ritmo para Supabase ==="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Erro: SUPABASE_DB_URL não configurada${NC}"
    echo "Configure com: export SUPABASE_DB_URL='postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres'"
    exit 1
fi

LOCAL_DB_URL="postgresql://admin:adminpassword@localhost:5433/ritmo_db"

echo -e "${YELLOW}1. Testando conexão com banco local...${NC}"
psql "$LOCAL_DB_URL" -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Conexão local OK${NC}"
else
    echo -e "${RED}✗ Erro ao conectar no banco local${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Testando conexão com Supabase...${NC}"
psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Conexão Supabase OK${NC}"
else
    echo -e "${RED}✗ Erro ao conectar no Supabase${NC}"
    exit 1
fi

echo -e "${YELLOW}3. Gerando dump do banco local...${NC}"
pg_dump "$LOCAL_DB_URL" -F c -f ritmo_backup.dump
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dump criado: ritmo_backup.dump${NC}"
else
    echo -e "${RED}✗ Erro ao criar dump${NC}"
    exit 1
fi

echo -e "${YELLOW}4. Restaurando dump no Supabase...${NC}"
pg_restore "$SUPABASE_DB_URL" -c -C ritmo_backup.dump
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dados migrados com sucesso!${NC}"
else
    echo -e "${RED}✗ Erro ao restaurar dump${NC}"
    exit 1
fi

echo -e "${YELLOW}5. Verificando tabelas migradas...${NC}"
psql "$SUPABASE_DB_URL" -c "\dt"

echo ""
echo -e "${GREEN}=== Migração concluída! ===${NC}"
echo ""
echo "Próximos passos:"
echo "1. Atualize a DATABASE_URL no Vercel com a URL do Supabase"
echo "2. Faça o deploy do frontend no Vercel"
echo "3. Teste todas as funcionalidades"
