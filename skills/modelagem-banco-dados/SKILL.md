---
name: modelagem-banco-dados
description: Use esta skill sempre que o usuário pedir para modelar, revisar ou otimizar banco de dados — desenho de schema/tabelas, normalização, escolha de chaves/índices, escrita de migrations, otimização de query lenta, ou escolha entre SQL e NoSQL. Dispare para "como modelar essas entidades", "essa query está lenta", "cria as migrations", "normaliza esse schema", independente do SGBD (PostgreSQL, MySQL, MongoDB, etc). Para o design de API que expõe esses dados, use engenharia-backend.
---

# Especialista em Modelagem de Banco de Dados

Atue como DBA/engenheiro de dados sênior. Modele pensando em como os dados serão lidos e escritos de verdade, não só na forma "teoricamente correta".

## Modelagem relacional

- **Normalize até a 3ª forma normal por padrão** (elimina dependência transitiva e redundância) — é o ponto de equilíbrio pra maioria dos sistemas transacionais (OLTP).
- **Desnormalize deliberadamente e com justificativa** quando: leitura é muito mais frequente que escrita e o join custa caro, ou é dado histórico/imutável (ex: snapshot de preço no momento da venda, que não deve mudar retroativamente).
- Toda tabela deve ter uma chave primária clara. Prefira chave substituta (`id` auto-incremento ou UUID) a chave natural composta, exceto quando a chave natural for genuinamente estável e simples (ex: sigla de país).
- Modele relacionamentos com as constraints corretas: `FOREIGN KEY`, `NOT NULL` onde o dado é obrigatório, `UNIQUE` onde há restrição de unicidade — não deixe a aplicação ser a única linha de defesa contra dado inconsistente.

## Índices

- Crie índice em toda coluna usada frequentemente em `WHERE`, `JOIN` ou `ORDER BY` de queries reais do sistema — não em toda coluna preventivamente (índice tem custo de escrita e espaço).
- Índice composto: ordem das colunas importa — coloque primeiro a coluna mais seletiva/mais usada isoladamente em filtros.
- Cuidado com excesso de índice em tabelas com escrita muito frequente — cada índice adiciona custo em INSERT/UPDATE/DELETE.
- Use `EXPLAIN`/`EXPLAIN ANALYZE` (ou equivalente do SGBD) para confirmar que o índice está sendo usado antes de assumir que resolveu o problema.

## Migrations

- Toda mudança de schema em produção via migration versionada, nunca alteração manual direta no banco.
- Migrations devem ser (idealmente) reversíveis — escreva o `down`/rollback junto com o `up`.
- Mudanças que quebram compatibilidade (remover/renomear coluna usada pela aplicação em produção) precisam de estratégia em etapas (ex: adicionar coluna nova → migrar dado → parar de escrever na antiga → remover a antiga em deploy separado), não uma migration única que quebra o deploy anterior.
- Migrations grandes em tabela com muitos dados/tráfego alto: avalie lock da tabela e prefira abordagens que evitem lock longo (ex: adicionar coluna nullable primeiro, popular em batch, só depois tornar NOT NULL).

## Otimização de query lenta

Ao diagnosticar uma query lenta, siga essa ordem:
1. Rode `EXPLAIN ANALYZE` (ou equivalente) para ver o plano de execução real, não suposição.
2. Verifique se há **table scan** onde deveria haver uso de índice — geralmente índice ausente ou função aplicada na coluna do filtro (`WHERE UPPER(nome) = ...` ignora índice simples em `nome`).
3. Verifique **N+1**: a "query lenta" às vezes é, na verdade, centenas de queries pequenas disparadas em loop pela aplicação — resolve-se com `JOIN`/eager loading, não com índice.
4. Só depois disso considere desnormalização, cache, ou réplica de leitura — são soluções mais caras/complexas, últimos recursos.

## SQL vs NoSQL

- **SQL/relacional**: default para dados com relacionamento importante entre entidades e necessidade de consistência forte/transações (a maioria dos sistemas de negócio).
- **NoSQL documento** (Mongo etc): quando o dado é naturalmente hierárquico/schema variável e é lido majoritariamente como um documento inteiro, sem necessidade forte de join entre entidades.
- **NoSQL chave-valor** (Redis etc): cache, sessão, dado efêmero de acesso muito rápido — não como banco primário de dado de negócio duradouro.
- Não escolha NoSQL só por "escalar mais" — SQL moderno escala muito bem para a esmagadora maioria dos sistemas; a escolha certa depende do formato/padrão de acesso do dado, não de hype.

## Checklist antes de considerar um schema pronto

- [ ] Toda tabela tem chave primária e as foreign keys/constraints necessárias declaradas no banco, não só na aplicação
- [ ] Colunas usadas em filtro/join frequente têm índice
- [ ] Migration tem rollback e não trava tabela grande sem necessidade
- [ ] Nenhuma query crítica do sistema faz table scan não intencional
- [ ] Dado obrigatório é `NOT NULL` no schema, não só validado na aplicação
