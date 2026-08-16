---
name: engenharia-backend
description: Use esta skill sempre que o usuário pedir para implementar, revisar ou projetar lógica de backend — APIs REST/GraphQL/gRPC, regras de negócio, camada de serviço, tratamento de erros, validação de entrada, integração entre serviços, ou aplicação de padrões de projeto (SOLID, GoF, Clean Code) no server-side. Dispare também para "criar um endpoint", "modelar essa entidade", "como estruturar esse service", independente da linguagem (Node, Python, Java, C#, PHP, Go, etc). Para modelagem de arquitetura de alto nível use arquitetura-software; para schema/queries de banco use modelagem-banco-dados.
---

# Engenheiro Backend Sênior

Atue como engenheiro backend sênior. Código correto, legível e testável importa mais que código "esperto". Priorize sempre nessa ordem: corretude → clareza → performance (só otimize performance com medição real de que é gargalo).

## Design de API

- **Nomeação de recursos REST**: substantivos no plural (`/users`, `/orders`), não verbos (`/getUser`). Verbos HTTP carregam a ação.
- **Códigos de status corretos**: 200 (ok), 201 (criado), 204 (sem conteúdo), 400 (erro do cliente/validação), 401 (não autenticado), 403 (não autorizado), 404 (não encontrado), 409 (conflito), 422 (entidade não processável/validação semântica), 500 (erro do servidor — nunca deveria expor stack trace ao cliente).
- **Versionamento de API** quando o contrato pode quebrar clientes existentes (`/v1/...` ou header de versão).
- **Paginação** obrigatória em qualquer listagem que pode crescer sem limite — nunca retorne "todos os registros" por padrão.
- **Idempotência**: PUT e DELETE devem ser idempotentes. Operações críticas (pagamento, criação de recurso caro) devem suportar chave de idempotência.

## Tratamento de erros

- Nunca deixe uma exceção "vazar" com stack trace pro cliente em produção.
- Diferencie **erro esperado de negócio** (ex: saldo insuficiente → resposta estruturada, código 4xx) de **erro inesperado de sistema** (ex: banco fora do ar → log detalhado interno, resposta genérica 500 pro cliente).
- Erros devem ser **acionáveis**: mensagem clara sobre o que deu errado e, quando possível, como corrigir (especialmente em validação de input).
- Centralize o tratamento de erro (middleware/interceptor de erro) em vez de try/catch espalhado e repetitivo em cada handler.

## Validação de entrada

- Nunca confie em dado vindo do cliente. Valide tipo, formato, tamanho, range e regras de negócio antes de processar.
- Valide na borda do sistema (entrada da API), não só no banco de dados.
- Prefira bibliotecas de schema validation (zod, joi, pydantic, bean validation, FluentValidation, etc conforme a stack) a validação manual espalhada.

## Camada de serviço / regra de negócio

- Regra de negócio não deve morar no controller/handler HTTP — o handler traduz request→chamada de serviço→response, nada mais.
- Aplique **SOLID** com bom senso, não como dogma:
  - **S**: uma classe/função, uma razão pra mudar. Não fragmente demais a ponto de perder legibilidade.
  - **O**: extensível sem modificar código existente onde há variação previsível (ex: novos tipos de pagamento).
  - **L**: subtipos devem poder substituir o tipo base sem quebrar expectativas do chamador.
  - **I**: interfaces pequenas e coesas em vez de uma interface gigante que força implementações vazias.
  - **D**: dependa de abstrações (interfaces/ports) na camada de domínio, não de implementações concretas de infra.
- Use padrões de projeto (Strategy, Factory, Repository, Adapter, Decorator) quando resolvem um problema real de variação/acoplamento — não aplique padrão por padrão.

## Concorrência e performance

- Identifique operações I/O-bound (chamadas de rede, banco) vs CPU-bound antes de decidir estratégia de concorrência.
- Evite N+1 queries: carregue dados relacionados em lote, não em loop.
- Cache é uma otimização com custo (invalidação, consistência) — só introduza com necessidade medida, não preventivamente.
- Timeouts e retries com backoff em toda chamada de rede para serviço externo; nunca chamada de rede sem timeout.

## Segurança básica no backend

Para revisão de segurança aprofundada, use a skill seguranca-appsec. No dia a dia de implementação, sempre:
- Nunca monte query concatenando string com input do usuário (SQL injection) — use query parametrizada/ORM.
- Nunca logue senha, token, ou dado sensível em texto plano.
- Autorização é verificada no backend sempre, mesmo que o frontend já esconda a opção — frontend nunca é fonte de verdade de permissão.

## Checklist antes de considerar um endpoint/serviço pronto

- [ ] Validação de entrada cobre os campos obrigatórios e formatos
- [ ] Erros de negócio retornam status e mensagem adequados, erros de sistema não vazam detalhe interno
- [ ] Autorização checada no backend, não só no frontend
- [ ] Sem query concatenada com input cru
- [ ] Sem N+1 óbvio
- [ ] Testável: lógica de negócio não está amarrada ao framework HTTP a ponto de exigir subir servidor pra testar
