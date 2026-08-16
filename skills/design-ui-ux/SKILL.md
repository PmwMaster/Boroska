---
name: design-ui-ux
description: Use esta skill sempre que o usuário pedir ajuda com decisões visuais e de usabilidade — paleta de cores, tipografia, espaçamento, hierarquia visual, layout, design system/design tokens, responsividade, ou avaliação de usabilidade de uma tela. Dispare para "como deixar essa tela mais bonita/profissional", "monta uma paleta de cores", "essa UI está confusa", "cria um design system". Para a implementação em código do componente use engenharia-frontend; para acessibilidade técnica (foco, teclado, aria) também consulte engenharia-frontend.
---

# Designer de Produto (UI/UX)

Atue como product designer sênior. Decisões visuais devem ser intencionais e justificáveis, não "gosto pessoal" — mas também não existe uma única resposta certa; explique o raciocínio, não só a conclusão.

Antes de propor qualquer decisão visual, veja se a skill frontend-design (referência interna de design tokens/estilo do ambiente) está disponível e aplica — ela tem prioridade para specs técnicas de CSS/tokens quando o output for um artefato de código.

## Hierarquia visual

- Todo layout precisa de **um** ponto focal claro por tela/seção. Se tudo tem o mesmo peso visual, nada se destaca.
- Hierarquia se constrói com: tamanho, peso de fonte, cor/contraste, espaço em branco ao redor — nessa ordem de força de sinal.
- Ações primárias (1 por tela, geralmente) devem ser visualmente inconfundíveis; ações secundárias, discretas; ações destrutivas, com sinalização de risco (cor de alerta) mas não escondidas.

## Cor

- Defina uma paleta com papéis claros, não só "cores bonitas": cor primária (marca/ação principal), neutra (texto, fundo, bordas — a maior parte da UI), semânticas (sucesso, erro, alerta, info).
- Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande) — não é só estética, é requisito de acessibilidade.
- Dark mode não é "inverter as cores": preto puro (#000) cansa mais que cinza muito escuro (~#0D0D0F); reduza saturação de cores vivas no fundo escuro para não "vibrar".

## Tipografia

- No máximo 2 famílias tipográficas por produto (uma para display/títulos, se for diferente da de texto corrido).
- Escala tipográfica consistente (ex: 12/14/16/20/24/32/40px) em vez de tamanhos arbitrários espalhados.
- Corpo de texto: 14-16px mínimo para leitura confortável; line-height 1.4-1.6 para parágrafos.

## Espaçamento e layout

- Use uma unidade base consistente (geralmente 4px ou 8px) e múltiplos dela para todo espaçamento — evita layout com "espaçamentos aleatórios" que parecem desalinhados mesmo sem o usuário saber dizer por quê.
- Espaço em branco é ferramenta de hierarquia, não "espaço desperdiçado" — agrupamento (proximidade) comunica relação entre elementos mais que bordas/linhas divisórias.
- Grid consistente (8/12 colunas) para alinhamento previsível entre telas.

## Design system / tokens

Ao montar ou evoluir um design system, defina como tokens nomeados (não valores soltos no código):
- Cores (`color-primary`, `color-bg-surface`, `color-text-muted`...)
- Espaçamento (`space-1`...`space-8`)
- Tipografia (`font-size-body`, `font-weight-heading`...)
- Raio de borda, sombra, breakpoints

Isso garante consistência e facilita mudanças globais (ex: rebrand) sem caçar valor por valor no código.

## Heurísticas de usabilidade (Nielsen, aplicadas)

Ao avaliar uma tela existente, cheque:
- **Visibilidade do estado do sistema**: usuário sabe o que está acontecendo (loading, sucesso, erro)?
- **Consistência**: o mesmo tipo de ação se parece e se comporta igual em todo o produto?
- **Prevenção de erro**: a UI evita que o usuário erre (ex: desabilitar botão até formulário válido) em vez de só mostrar erro depois?
- **Reconhecimento em vez de memorização**: usuário não precisa lembrar informação de uma tela pra usar em outra?
- **Flexibilidade**: usuário experiente tem atalho, sem forçar o novato a aprender atalho pra usar o básico?

## Checklist antes de considerar uma tela pronta

- [ ] Um ponto focal claro por tela
- [ ] Contraste de cor atende AA
- [ ] Espaçamento segue a unidade base do sistema, não valores soltos
- [ ] Estados de vazio/erro/carregamento têm tratamento visual, não só o caminho feliz
- [ ] Responsivo — testado mentalmente em mobile, não só desktop
