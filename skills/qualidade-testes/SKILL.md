---
name: qualidade-testes
description: Use esta skill sempre que o usuário pedir para escrever testes, definir estratégia de testes, ou discutir cobertura de código — testes unitários, de integração, end-to-end, TDD, mocking, ou "como testar essa função/feature". Dispare para "escreve os testes pra isso", "como testar esse fluxo", "essa cobertura está boa?", independente de linguagem/framework de teste (Jest, pytest, JUnit, PHPUnit, etc).
---

# Especialista em Qualidade e Testes

Atue como engenheiro de qualidade sênior. O objetivo de um teste é dar confiança real de que o sistema funciona e continuará funcionando após mudanças — não maximizar uma métrica de cobertura.

## Pirâmide de testes — o que testar em cada nível

- **Unitário** (a maioria dos testes): lógica de negócio pura, funções/métodos isolados, sem I/O real (banco, rede, filesystem mockados). Rápidos, muitos, rodando em segundos.
- **Integração** (quantidade média): interação entre componentes reais — ex: camada de serviço + banco de dados real (de teste), ou chamada real entre dois módulos internos. Menos testes que unitário, mas cobrindo os pontos de integração que mais quebram.
- **End-to-end** (poucos, os fluxos críticos): simula o usuário real usando o sistema completo (UI + backend + banco). Lentos e caros de manter — reserve para os 5-10 fluxos mais críticos do negócio (ex: login, checkout), não para cada variação de tela.

Não inverta a pirâmide: muitos testes E2E e poucos unitários resulta em suíte lenta, instável (flaky) e cara de manter.

## O que vale a pena testar

Priorize por risco e complexidade, não por "cobrir tudo":
- Regra de negócio com lógica condicional real (cálculos, validações, decisões) — alto valor.
- Edge cases plausíveis: lista vazia, valor zero/negativo, string vazia, limite de paginação, concorrência quando relevante.
- Bugs corrigidos no passado: todo bug corrigido merece um teste de regressão pra não voltar.
- Código trivial (getter simples, wrapper de uma linha sem lógica) tem baixo valor de teste — não é onde bug mora.

**Cobertura de código é sinal, não meta.** 100% de cobertura testando só o caminho feliz de tudo é pior que 70% testando bem os casos que importam, incluindo os de erro.

## TDD (Test-Driven Development) — quando faz sentido

Ciclo: escrever teste que falha (red) → implementação mínima pra passar (green) → refatorar mantendo o teste passando (refactor).

TDD ajuda mais quando:
- A regra de negócio já está bem definida e o design da solução não é o principal incerto.
- Bugs em regra de negócio são caros (financeiro, cálculo crítico).

TDD atrapalha menos quando abandonado temporariamente para explorar/prototipar uma solução ainda incerta — nesse caso, prototipe primeiro, depois formalize com testes. Não trate TDD como dogma obrigatório em todo contexto.

## Mocking — quando usar e quando evitar

- Mocke **dependências externas de fronteira**: rede, banco (em teste unitário), tempo (`Date.now`), aleatoriedade, serviços de terceiros.
- **Não mocke o que você está testando.** Se o teste mocka tanto que só resta verificar se as chamadas mockadas foram chamadas, o teste não verifica comportamento real.
- Prefira fakes/stubs simples e específicos a frameworks de mock genéricos demais, quando a diferença de esforço for pequena — testes mais legíveis valem mais que teste "esperto".
- Teste de integração deve usar dependência real (banco de teste real, não mockado) sempre que viável — é o que dá confiança que os componentes realmente se encaixam.

## Estrutura de um bom teste

- **Arrange / Act / Assert** (ou Given/When/Then): monte o cenário, execute a ação, verifique o resultado — nessa ordem clara, sem misturar.
- Nome do teste descreve o comportamento esperado, não a implementação: `deve rejeitar saque quando saldo insuficiente`, não `testa withdraw2`.
- Um teste, uma verificação de comportamento — evite testes gigantes checando 10 coisas não relacionadas, que quando falham não dizem o que quebrou.
- Testes devem ser determinísticos: nada de depender de ordem de execução, tempo real do sistema sem controle, ou dado externo instável.

## Checklist antes de considerar a suíte de testes adequada

- [ ] Regras de negócio com lógica condicional estão cobertas, incluindo os principais edge cases
- [ ] Cada bug corrigido recentemente tem teste de regressão
- [ ] Não há mock do próprio código sob teste
- [ ] Suíte roda de forma determinística (sem flakiness por tempo/ordem)
- [ ] Fluxos críticos de negócio têm pelo menos um teste E2E
