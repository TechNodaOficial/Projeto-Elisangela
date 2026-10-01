---
name: Painel de Festas · Elisangela Eventos
description: Prancheta da cerimonialista — folhas pautadas sobre uma mesa cinza fria, tinta grafite e marca-texto amarelo.
colors:
  tinta: "oklch(0.255 0.004 250)"
  grifo: "oklch(0.92 0.15 103)"
  pauta: "oklch(0.86 0.045 255)"
  pauta-forte: "oklch(0.7 0.09 258)"
  mesa: "oklch(0.935 0.004 250)"
  papel: "oklch(1 0 0)"
  tinta-suave: "oklch(0.47 0.008 250)"
  superficie: "oklch(0.965 0.003 250)"
  borda: "oklch(0.875 0.006 250)"
  borda-campo: "oklch(0.83 0.008 250)"
  destrutivo: "oklch(0.52 0.19 27)"
typography:
  display:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "2.75rem"
    fontWeight: 500
    lineHeight: "3.5rem"
    letterSpacing: "-0.04em"
    fontFeature: '"tnum"'
  display-detalhe:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "4.25rem"
    fontWeight: 500
    lineHeight: "5.25rem"
    letterSpacing: "-0.04em"
    fontFeature: '"tnum"'
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.75rem"
  body-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.04em"
  dado:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontFeature: '"tnum"'
rounded:
  folha: "3px"
  sm: "0.225rem"
  lg: "0.375rem"
  full: "9999px"
spacing:
  linha: "1.75rem"
  margem: "2.75rem"
  recuo-texto: "3.625rem"
  gutter: "1rem"
  gutter-md: "2rem"
  grade: "1.25rem"
  grade-sm: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "oklch(0.255 0.004 250 / 80%)"
  button-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.superficie}"
  button-ghost-destrutivo:
    textColor: "{colors.destrutivo}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-destrutivo-confirmar:
    backgroundColor: "{colors.destrutivo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    height: "32px"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "40px"
  folha-festa:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.folha}"
    padding: "1.75rem 1.25rem 1.75rem 3.625rem"
  nav-item:
    textColor: "{colors.tinta-suave}"
    height: "44px"
    padding: "0 8px"
  nav-item-ativo:
    textColor: "{colors.tinta}"
---

# Design System: Painel de Festas · Elisangela Eventos

## Overview

**Creative North Star: "A Prancheta da Cerimonialista"**

O painel é o roteiro que a cerimonialista já carrega na prancheta, só que vivo. Cada festa é uma folha de papel branco pautado, com fios azul-claros de 1px e uma linha de margem azul mais forte, apoiada sobre uma mesa cinza fria. O texto é escrito a tinta grafite e assenta nas pautas: a altura de linha das folhas é exatamente a altura de uma pauta. O único gesto de cor é o marca-texto amarelo, que grifa o que importa agora: a seção atual, a festa que está chegando, o que o cursor está para escolher.

A densidade é de caderno de trabalho, não de dashboard: uma família sans (Geist) para tudo, Geist Mono para dados (dia, horário, contagens), números tabulares em todo o documento. O mundo recusa os dois clichês do segmento: o admin SaaS de cards brancos idênticos com sombra e ícone, e o "casamento romântico" rosa com tipografia cursiva. Tema claro apenas; o painel é usado de dia, na mesa ou no celular.

A interação assinatura é o grifo: ao trocar de seção, o marca-texto varre o rótulo da esquerda para a direita em 200ms; ao passar o mouse, varre o rótulo que está para ser escolhido.

**Key Characteristics:**

- Folhas pautadas com linha de margem sobre mesa cinza fria.
- Tinta grafite como cor de ação; marca-texto amarelo reservado para seleção e urgência.
- Texto assentado em pautas de 1.75rem; recuo do texto depois da margem.
- Geist para tudo, Geist Mono só para dados, sempre tabulares.
- Cantos discretos (3px nas folhas, 6px nos controles), sombra de papel sobre mesa.
- Ícones de traço fino (Lucide, stroke 1.75) acompanhando texto, nunca sozinhos como decoração.

## Colors

Uma paleta de material de escritório: cinza-frio de mesa, papel branco, grafite, azul de pauta e um único amarelo de marca-texto.

### Primary

- **Tinta Grafite** (`tinta`): cor do texto e de toda ação primária (botão "Salvar", "Entrar"). Também é o `foreground` e o `primary` do tema shadcn. O botão primário é tinta sobre papel invertido, nunca colorido.

### Secondary

- **Marca-texto** (`grifo`): exclusivamente o fundo irregular do grifo atrás de texto em tinta, e o `::selection` do navegador. Marca a seção ativa da navegação, o rótulo de proximidade de festas a até 7 dias ("Hoje", "Amanhã", "Em 3 dias") e o hover dos itens grifáveis. Nunca é cor de texto, de borda ou de fundo de superfície.

### Tertiary

- **Pauta** (`pauta`): os fios horizontais de 1px das folhas e os divisores do índice lateral de navegação.
- **Pauta Forte** (`pauta-forte`): a linha vertical de margem das folhas e o anel de foco (`ring`) de todo o sistema. Foco e margem são a mesma tinta azul de caderno.

### Neutral

- **Mesa** (`mesa`): fundo da página e do topo fixo; a superfície sobre a qual as folhas estão apoiadas.
- **Papel** (`papel`): fundo das folhas, dos campos, da barra inferior do celular e dos diálogos (`card`, `popover`).
- **Tinta Suave** (`tinta-suave`): texto secundário (descrições, datas no topo, rótulos de definição, itens de navegação inativos, "(opcional)").
- **Superfície** (`superficie`): hover dos botões outline/ghost (`secondary`, `muted`, `accent`).
- **Borda** (`borda`): bordas gerais e o topo da barra inferior; também a cor dos esqueletos de carregamento.
- **Borda de Campo** (`borda-campo`): contorno dos inputs e textareas, um passo mais escuro que a borda geral para o campo ser reconhecível.
- **Destrutivo** (`destrutivo`): mensagens de erro de formulário, borda de campo inválido, ação "Excluir".

### Named Rules

**The Marca-texto Rule.** O amarelo só existe como grifo atrás de texto grafite e só marca uma de três coisas: onde ela está, o que está chegando (≤ 7 dias) ou o que está prestes a escolher. Se não responde a uma dessas, não é grifo.

**The Tinta Rule.** Ação primária é grafite sobre papel. Não há cor de marca para botões; a hierarquia vem do contraste tinta/papel.

**The Mesa e Papel Rule.** Conteúdo vive em papel (`papel`); o fundo é sempre mesa (`mesa`). Campos sobre folha também recebem fundo papel explícito para não herdar transparência.

## Typography

**Display Font:** Geist Mono (com ui-monospace)
**Body Font:** Geist (com ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono, apenas para dados

**Character:** Uma sans neutra e precisa para escrever o roteiro, e uma mono de numerais tabulares para tudo que é contado ou agendado. O dia grande em mono é a âncora visual de cada folha: ela reconhece a festa pelo dia antes do nome.

### Hierarchy

- **Display** (Geist Mono 500, 2.75rem, altura de 2 pautas, -0.04em): o dia do mês no topo de cada folha de festa. Na folha de detalhe, **Display Detalhe** (4.25rem, altura de 3 pautas).
- **Headline** (600, 1.5rem, -0.02em): título da seção (h1) e título de formulário/login. No detalhe da festa sobe para 1.75rem a partir de `sm`.
- **Title** (600, 1.0625rem, -0.01em, altura de pauta): nome da festa na folha (até 2 linhas, `text-balance`), "Nova festa", a palavra "Elisangela" da logo.
- **Body** (400, 1rem, altura de pauta 1.75rem): valores do roteiro na folha de detalhe. **Body Small** (0.875rem) para descrições, local, contagens, rótulos de campo e texto de apoio.
- **Label** (600, 0.8125rem, maiúsculas, +0.04em): mês e dia da semana ao lado do numeral; o mês em semibold, a semana em tinta suave.
- **Dado** (Geist Mono 400, 0.8125rem, tabular): horário, contagens da navegação, campos de data e hora.

### Named Rules

**The Mono-Só-Para-Dados Rule.** Geist Mono aparece apenas em dia, horário, contagens e campos de data/hora. Nunca em títulos ou rótulos de texto.

**The Pauta Rule.** Dentro de uma folha pautada, todo texto usa `line-height` igual a `--linha` (ou múltiplos dela); o texto assenta nas pautas. Um elemento que quebra o ritmo da pauta quebra o papel.

## Layout

Estrutura de prancheta: topo fino fixo (56px) sobre a mesa, com a data de hoje à esquerda (por extenso no computador, curta no celular) e a logo em texto à direita. No computador (`md`, 768px), uma coluna lateral de 240px traz as três seções como linhas de um índice pautado (itens de 44px separados por fios de pauta, contagens em mono alinhadas à direita), com o nome da usuária e "Sair" no pé. O centro tem gutter de 1rem no celular e 2rem no computador.

As folhas de festa ficam numa grade `auto-fill` com mínimo de 17.5rem (280px) por folha e espaço de 1.25rem (1.5rem a partir de `sm`, 640px); no celular, uma coluna. A primeira folha da grade de pendentes é sempre a folha em branco "Nova festa". Detalhe da festa até 48rem de largura, formulários até 42rem, login até 24rem, avisos até 36rem.

No celular as seções viram uma barra inferior fixa de três itens (64px de altura, fundo papel, respeitando `safe-area-inset-bottom`) e "Sair" desce para o fim da página, longe dos toques frequentes; o conteúdo reserva 7rem de respiro inferior para a barra.

Ritmo vertical dentro das folhas: a pauta (`linha`, 1.75rem / 28px). Dentro de toda folha, o texto começa no recuo `recuo-texto` (margem 2.75rem + 0.875rem), à direita da linha de margem; a padding direita é 1.25rem (2rem em telas maiores nos formulários e detalhe).

**The Recuo de Margem Rule.** Todo conteúdo de folha, pautada ou lisa, começa depois da linha de margem: `padding-left: calc(var(--margem) + 0.875rem)`. Nada cruza a margem.

## Elevation & Depth

Profundidade de papel sobre mesa: uma sombra curta de contato mais uma sombra difusa curta, as duas em grafite-azulado de baixa opacidade. Não há camadas tonais além de mesa → papel. A folha clicável levanta 2px no hover, e a sombra se alonga, como uma folha tirada da pilha.

### Shadow Vocabulary

- **Folha em repouso** (`box-shadow: 0 1px 1px oklch(0.2 0.01 250 / 6%), 0 6px 16px -8px oklch(0.2 0.01 250 / 22%)`): toda `.folha`.
- **Folha levantada** (`box-shadow: 0 1px 1px oklch(0.2 0.01 250 / 6%), 0 14px 28px -12px oklch(0.2 0.01 250 / 30%)` + `translateY(-2px)`, 200ms ease-out): hover das folhas clicáveis; desligado com `prefers-reduced-motion`.
- **Véu do diálogo** (`background: oklch(0.2 0.01 250 / 35%)`): overlay atrás do diálogo de confirmação.

### Named Rules

**The Papel-Sobre-Mesa Rule.** Só folhas têm sombra. Controles (botões, campos, navegação) são planos; a profundidade pertence ao papel.

## Shapes

Forma de material de papelaria: folhas com cantos quase retos (3px), controles com canto discreto de 6px (`--radius: 0.375rem`), links de texto e anéis de foco com 3.6px. O único círculo do sistema é o disco de contorno 1px com o "+" na folha "Nova festa". O grifo do marca-texto é a única forma irregular: cantos assimétricos (0.25em 0.55em 0.3em 0.5em), girado -0.8°, transbordando 0.3em para os lados do texto — como um traço de caneta, não um retângulo.

As pautas e a linha de margem são desenhadas com `linear-gradient` no fundo da folha (fios de 1px), deslocadas `--folha-topo` (-0.375rem) para o texto assentar nelas. Formulários e avisos usam a **folha lisa**: só a linha de margem, sem pautas, porque campos precisam de caixa própria para serem reconhecíveis.

## Components

### Buttons

Grafite e discretos; a ação primária é tinta invertida, o resto é texto.

- **Shape:** canto discreto (6px, `rounded.lg`).
- **Primary:** fundo tinta, texto papel, 40px de altura, 20px laterais nos formulários; hover a 80% de opacidade; `translateY(1px)` ao pressionar.
- **Hover / Focus:** foco com borda `pauta-forte` e anel de 3px em `pauta-forte` a 50%.
- **Outline:** fundo papel, borda `borda`, 36px; hover em `superficie`. Usado em "Editar" e "Cancelar" do diálogo.
- **Ghost destrutivo:** só texto `destrutivo` com ícone Trash; abre a confirmação. A confirmação final é o único botão de fundo `destrutivo`.
- **Links de texto:** voltar, cancelar e sair são texto `tinta-suave` com ícone de 16px, que escurece para tinta no hover; "Cancelar" ganha sublinhado com offset de 4px.

### Cards / Containers (Folha)

- **Corner Style:** 3px (`rounded.folha`).
- **Background:** papel com pautas `pauta` a cada 1.75rem e linha de margem `pauta-forte` a 2.75rem.
- **Shadow Strategy:** ver Elevation & Depth.
- **Border:** nenhuma; a borda é a sombra de contato.
- **Internal Padding:** uma pauta em cima e embaixo, 1.25rem à direita, `recuo-texto` à esquerda.

### Inputs / Fields

- **Style:** contorno 1px `borda-campo`, fundo papel explícito, 6px de canto, 40px de altura, 10px laterais; 1rem no celular, 0.875rem a partir de `md`. Data e horário em Geist Mono.
- **Focus:** borda `pauta-forte` + anel de 3px `pauta-forte` a 50%.
- **Error / Disabled:** borda `destrutivo`; mensagem em `destrutivo` 0.875rem logo abaixo, ligada por `aria-describedby`. Desabilitado a 50% de opacidade.
- **Labels:** 0.875rem, peso 500, acima do campo com 8px de espaço; "(opcional)" em tinta suave peso 400. Campos empilhados com 20px entre si.

### Navigation

- **Lateral (computador):** índice pautado: lista entre fios `pauta`, itens de 44px com ícone de 16px, rótulo 0.9375rem e contagem mono 0.8125rem à direita. Inativo em `tinta-suave`; hover escurece para tinta e varre o grifo; ativo em semibold com o grifo fixo (`aria-current="page"`). Foco: contorno 2px `pauta-forte` para dentro.
- **Barra inferior (celular):** três colunas iguais de 64px, ícone de 20px sobre rótulo curto de 0.75rem; ativo em semibold com grifo.
- **Topo:** data de hoje em tinta suave à esquerda; logo em texto à direita ("Elisangela" title semibold + "Eventos" em tinta suave), que leva às pendentes.

### Folha de Festa (assinatura)

Cada festa é uma folha pautada clicável, lida de cima para baixo como uma ficha: na primeira faixa, o dia em numeral mono grande com mês (semibold) e dia da semana (tinta suave) em label maiúsculo; à direita, o horário em mono e a proximidade ("Hoje", "Amanhã", "Em 5 dias"), grifada quando faltam até 7 dias. Abaixo, o nome da festa em duas pautas, o local com ícone de alfinete, e na última pauta "**31** de **48** confirmados" (ou "presentes", nas concluídas), com os números em tinta semibold.

A **folha em branco "Nova festa"** é a primeira da pilha: mesma folha pautada, com o disco "+" e "Nova festa" que se grifa no hover. Criar é pegar a folha do topo da pilha.

### Grifo (assinatura)

O marca-texto atrás do texto: `grifo` com cantos irregulares, girado -0.8°. Fixo (seção ativa, urgência) ele varre da esquerda para a direita ao aparecer; no hover de um `.group` varre o rótulo que está para ser escolhido. 200ms, `cubic-bezier(0.16, 1, 0.3, 1)`, desligado com `prefers-reduced-motion`.

### Diálogo de confirmação

Folha lisa centralizada (até 28rem) sobre o véu grafite; título 1.125rem semibold, descrição em tinta suave, ações "Cancelar" (outline) e "Excluir festa" (destrutivo) alinhadas à direita. Abre com fade + zoom de 100ms.

### Estados vazios e carregamento

Avisos são folhas lisas com ícone de 20px e duas linhas (título semibold + explicação em tinta suave), até 36rem de largura. O carregamento mostra folhas pautadas vazias pulsando a 70% de opacidade e barras `borda` no lugar do cabeçalho.

## Do's and Don'ts

### Do:

- **Do** colocar todo conteúdo novo numa folha (`.folha`, ou `.folha .folha-lisa` quando houver campos) sobre a mesa, com `padding-left: calc(var(--margem) + 0.875rem)`.
- **Do** usar `line-height: var(--linha)` (1.75rem) ou múltiplos dela para todo texto dentro de folha pautada.
- **Do** reservar o grifo para a seção atual, festas a até 7 dias e o hover do que está para ser escolhido.
- **Do** escrever dia, horário e contagens em Geist Mono tabular; todo o resto em Geist.
- **Do** usar `pauta-forte` como cor de foco: contorno de 2px nos links e anel de 3px a 50% nos controles.
- **Do** desligar varredura do grifo e levantamento das folhas com `prefers-reduced-motion`.
- **Do** dar fundo papel explícito a campos e botões outline que ficam sobre folha.

### Don't:

- **Don't** usar o amarelo `grifo` como cor de texto, borda, fundo de botão ou fundo de superfície.
- **Don't** usar gradientes decorativos; os únicos gradientes do sistema são os fios da pauta e a linha de margem desenhados no fundo da folha.
- **Don't** usar vidro (backdrop-blur), cantos acima de 6px em contêineres, ou rosa e tipografia cursiva de "casamento romântico".
- **Don't** montar grades de cards brancos idênticos com sombra e ícone no topo; a festa é uma folha com o dia como âncora.
- **Don't** dar sombra a controles; só folhas têm sombra.
- **Don't** pôr texto ou controles sobre a linha de margem.
- **Don't** usar ícones sozinhos como decoração; ícones de traço 1.75 acompanham um rótulo.
