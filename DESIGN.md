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
  porta-ok: "oklch(0.45 0.12 152)"
  porta-barrado: "oklch(0.48 0.18 27)"
  porta-atencao: "oklch(0.84 0.15 80)"
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
  headline-detalhe:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
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
  nav:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
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
  veredito:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 12vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  veredito-nome:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 7.5vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  contador-porta:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: '"tnum"'
rounded:
  folha: "3px"
  sm: "0.225rem"
  lg: "0.375rem"
  full: "9999px"
  grifo: "0.25em 0.55em 0.3em 0.5em"
spacing:
  linha: "1.75rem"
  margem: "2.75rem"
  recuo-texto: "3.625rem"
  gutter: "1rem"
  gutter-md: "2rem"
  grade: "1.25rem"
  grade-sm: "1.5rem"
  margem-coluna: "1.75rem"
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
  coluna:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.folha}"
    padding: "1.75rem 1.25rem 1.75rem 3.625rem"
  linha-convidado:
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
  adicionar:
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "1.75rem"
  select:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "40px"
  acao-linha:
    textColor: "{colors.tinta-suave}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "44px"
  acao-linha-sm:
    height: "36px"
  acao-coluna-sm:
    height: "28px"
    width: "28px"
  acao-linha-ativa:
    textColor: "{colors.tinta}"
  papel-solto:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.folha}"
    padding: "4px"
    width: "11rem"
  papel-solto-rol:
    width: "12rem"
  dialogo-confirmacao:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.folha}"
    padding: "1.5rem 1.5rem 1.5rem 3.625rem"
    width: "28rem"
  busca:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "4px 10px 4px 36px"
    height: "36px"
  nav-item:
    textColor: "{colors.tinta-suave}"
    typography: "{typography.nav}"
    height: "44px"
    padding: "0 8px"
  nav-item-ativo:
    textColor: "{colors.tinta}"
  botao-resposta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  botao-resposta-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    height: "48px"
  botao-resposta-destrutivo:
    backgroundColor: "{colors.destrutivo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    height: "48px"
  folha-convite:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.folha}"
    padding: "1.75rem 1.25rem 1.75rem 3.625rem"
    width: "28rem"
  canhoto:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    padding: "calc(1.75rem - 2px) 1.25rem calc(1.75rem - 2px) 3.625rem"
  veredito-ok:
    backgroundColor: "{colors.porta-ok}"
    textColor: "{colors.papel}"
    typography: "{typography.veredito}"
    padding: "max(2rem, env(safe-area-inset-top)) 1.5rem max(1.5rem, env(safe-area-inset-bottom))"
    width: "100vw"
  veredito-barrado:
    backgroundColor: "{colors.porta-barrado}"
    textColor: "{colors.papel}"
    typography: "{typography.veredito}"
  veredito-atencao:
    backgroundColor: "{colors.porta-atencao}"
    textColor: "{colors.tinta}"
    typography: "{typography.veredito}"
  veredito-falha:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    typography: "{typography.veredito}"
  botao-veredito:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "56px"
  botao-veredito-atencao:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    height: "56px"
  botao-veredito-secundario:
    textColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "56px"
  visor-camera:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.folha}"
    width: "100%"
  botao-camera:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "48px"
  busca-porta:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "4px 10px 4px 36px"
    height: "44px"
---

# Design System: Painel de Festas · Elisangela Eventos

## Overview

**Creative North Star: "A Prancheta da Cerimonialista"**

O painel é o roteiro que a cerimonialista já carrega na prancheta, só que vivo. Cada festa é uma folha de papel branco pautado, com fios azul-claros de 1px e uma linha de margem azul mais forte, apoiada sobre uma mesa cinza fria. O texto é escrito a tinta grafite e assenta nas pautas: a altura de linha das folhas é exatamente a altura de uma pauta. O único gesto de cor é o marca-texto amarelo, que grifa o que importa agora: a seção atual, a festa que está chegando, o que o cursor está para escolher.

A densidade é de caderno de trabalho, não de dashboard: uma família sans (Geist) para tudo, Geist Mono para dados (dia, horário, telefone, valores em reais, contagens), números tabulares em todo o documento. O mundo recusa os dois clichês do segmento: o admin SaaS de cards brancos idênticos com sombra e ícone, e o "casamento romântico" rosa com tipografia cursiva. Tema claro apenas; o painel é usado de dia, na mesa ou no celular.

A interação assinatura é o grifo: ao trocar de seção, o marca-texto varre o rótulo da esquerda para a direita em 200ms; ao passar o mouse, varre o rótulo que está para ser escolhido.

Na porta, a prancheta sai de cena. O leitor de QR Code é o único lugar fora do papel: o veredito de cada leitura toma a tela inteira num campo de cor (verde, vermelho, âmbar ou grafite), legível de longe e com pouca luz, e a folha só volta para a busca pelo nome.

**Key Characteristics:**

- Folhas pautadas com linha de margem sobre mesa cinza fria.
- Tinta grafite como cor de ação; marca-texto amarelo reservado para seleção e urgência.
- Texto assentado em pautas de 1.75rem; recuo do texto depois da margem.
- Geist para tudo, Geist Mono só para dados, sempre tabulares.
- Cantos discretos (3px nas folhas e no papel solto, 6px nos controles), sombra de papel sobre mesa.
- Ícones de traço fino (Lucide, stroke 1.75) acompanhando texto, nunca sozinhos como decoração; só-ícone apenas em ações compactas com `aria-label`.
- Cores de porta (verde, vermelho, âmbar) só no veredito em tela cheia do leitor de QR, nunca no papel.

## Colors

Uma paleta de material de escritório: cinza-frio de mesa, papel branco, grafite, azul de pauta e um único amarelo de marca-texto.

### Primary

- **Tinta Grafite** (`tinta`): cor do texto e de toda ação primária (botão "Salvar", "Entrar"). Também é o `foreground` e o `primary` do tema shadcn. O botão primário é tinta sobre papel invertido, nunca colorido. Também marca o status "Confirmou" (peso 500), o pagamento "Pendente" de um fornecedor (semibold) e as ações de uma linha do rol quando ela está sob o cursor ou com foco dentro.

### Secondary

- **Marca-texto** (`grifo`): exclusivamente o fundo irregular do grifo atrás de texto em tinta, e o `::selection` do navegador. Marca a seção ativa da navegação, o rótulo de proximidade de festas a até 7 dias ("Hoje", "Amanhã", "Em 3 dias"), o status "Chegou HH:MM" de um convidado que já fez check-in, a linha da resposta registrada no convite do convidado ("Presença confirmada", "Você avisou que não vai", "Entrada registrada às HH:MM") e o hover dos itens grifáveis (índices, "+ Adicionar…"). Nunca é cor de texto, de borda ou de fundo de superfície, e nunca marca estado de pagamento.

### Tertiary

- **Pauta** (`pauta`): os fios horizontais de 1px das folhas, do trecho pautado do rol de convidados e os divisores do índice lateral de navegação.
- **Pauta Forte** (`pauta-forte`): a linha vertical de margem das folhas e o anel de foco (`ring`) de todo o sistema. Foco e margem são a mesma tinta azul de caderno. Também o contorno tracejado (a 60%) da área de envio da planta do salão e o picote tracejado (2px, a 70%) do canhoto do convite.

### Neutral

- **Mesa** (`mesa`): fundo da página e do topo fixo; a superfície sobre a qual as folhas estão apoiadas.
- **Papel** (`papel`): fundo das folhas, dos campos, da barra inferior do celular, dos diálogos e do menu de papel solto (`card`, `popover`).
- **Tinta Suave** (`tinta-suave`): texto secundário (descrições, datas no topo, rótulos de definição, itens de navegação inativos, "(opcional)", telefone e "Sem WhatsApp" no rol, os status "Não vai" e "Aguardando", as ações da linha em repouso, o resumo das colunas, o "Pago" de fornecedor, o responsável do cronograma, a ocupação "n/n" da mesa, "+ Sentar convidado…" e as frases de lista vazia).
- **Superfície** (`superficie`): hover dos botões outline/ghost e do botão de pagamento, foco dos itens do menu (`secondary`, `muted`, `accent`).
- **Borda** (`borda`): bordas gerais e o topo da barra inferior; também a cor dos esqueletos de carregamento.
- **Borda de Campo** (`borda-campo`): contorno dos inputs e textareas, um passo mais escuro que a borda geral para o campo ser reconhecível.
- **Destrutivo** (`destrutivo`): mensagens de erro de formulário, borda de campo inválido, ações "Excluir" e "Remover" (no menu: texto destrutivo, foco em `destrutivo` a 10%) e a ocupação de mesa acima da capacidade (semibold).

### Porta (só no leitor de QR)

- **Verde de Porta** (`porta-ok`): fundo do veredito "Pode entrar", com texto papel (contraste 7.0:1).
- **Vermelho de Porta** (`porta-barrado`): fundo dos vereditos que barram ("Já entrou", "Convite de outra festa", "QR não reconhecido"), com texto papel (7.2:1). É um vermelho próprio, um passo mais escuro que `destrutivo`, e não o substitui no painel.
- **Âmbar de Porta** (`porta-atencao`): fundo do veredito "Não confirmou presença", em que ela decide, com texto em tinta (9.5:1).
- A falha de rede ("Não deu para conferir") usa `tinta` com texto papel: não é recusa e não pode parecer vermelho de longe.

### Named Rules

**The Marca-texto Rule.** O amarelo só existe como grifo atrás de texto grafite e só marca uma de cinco coisas: onde ela está, o que está chegando (≤ 7 dias), quem já chegou (check-in do convidado), o que está prestes a escolher ou a resposta que o convidado registrou no próprio convite ("Presença confirmada", "Você avisou que não vai", "Entrada registrada às HH:MM"; a varredura repete a cada mudança de resposta). Se não responde a uma dessas, não é grifo. "Esta festa já aconteceu" não é resposta: fica em tinta suave, sem grifo. Pago/Pendente é estado de dado, não de atenção: fala por peso e tinta, nunca pelo amarelo.

**The Tinta Rule.** Ação primária é grafite sobre papel. Não há cor de marca para botões; a hierarquia vem do contraste tinta/papel.

**The Mesa e Papel Rule.** Conteúdo vive em papel (`papel`); o fundo é sempre mesa (`mesa`). Campos sobre folha também recebem fundo papel explícito para não herdar transparência.

**The Porta Rule.** Verde, vermelho e âmbar de porta existem só no veredito em tela cheia do leitor de QR; nunca em texto, borda, selo ou fundo de outra tela, nem no rol de convidados. Vermelho significa só "barrado"; falha de rede é grafite. O veredito é a única tela do painel fora da folha, e nele a hierarquia continua sendo de contraste: a ação principal é papel sobre o campo (tinta sobre o âmbar), nunca outra cor.

## Typography

**Display Font:** Geist Mono (com ui-monospace)
**Body Font:** Geist (com ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono, apenas para dados

**Character:** Uma sans neutra e precisa para escrever o roteiro, e uma mono de numerais tabulares para tudo que é contado ou agendado. O dia grande em mono é a âncora visual de cada folha: ela reconhece a festa pelo dia antes do nome.

### Hierarchy

- **Display** (Geist Mono 500, 2.75rem, altura de 2 pautas, -0.04em): o dia do mês no topo de cada folha de festa. Na folha de detalhe, **Display Detalhe** (4.25rem, altura de 3 pautas).
- **Headline** (600, 1.5rem, -0.02em): título da seção (h1) e título de formulário/login.
- **Headline Detalhe** (600, 1.75rem, altura de pauta, -0.02em): nome da festa no h1 da folha de detalhe quando a própria folha tem ao menos 28rem de largura (consulta de contêiner; abaixo disso, Headline), com no mínimo duas pautas.
- **Title Large** (600, 1.125rem, altura de pauta): título de cada coluna da festa ("Convidados", "Fornecedores", "Mesas", "Cronograma"), "Planta do salão", "PDFs" e o título do diálogo de confirmação.
- **Title** (600, 1.0625rem, -0.01em, altura de pauta): nome da festa na folha (até 2 linhas, `text-balance`), "Nova festa", a palavra "Elisangela" da logo.
- **Body** (400, 1rem, altura de pauta 1.75rem): valores do roteiro na folha de detalhe. **Body Small** (0.875rem) para descrições, local, contagens, rótulos de campo e texto de apoio.
- **Label** (600, 0.8125rem, maiúsculas, +0.04em): mês e dia da semana ao lado do numeral; o mês em semibold, a semana em tinta suave.
- **Nav** (400, 0.9375rem; 600 quando ativo): rótulo dos itens do índice lateral.
- **Dado** (Geist Mono 400, 0.8125rem, tabular): horário da festa, contagens dos índices, ocupação "n/n" da mesa, campos de data e hora. Telefone, valor em reais e os campos de WhatsApp, valor e lugares usam Geist Mono no tamanho do texto ao redor (0.875rem). O horário de cada item do cronograma é Geist Mono 500 em 1rem, numa coluna de 3.25rem.
- **Número em frase** (Geist 600 em tinta, tabular): contagens lidas dentro de uma frase em tinta suave, como "**31** de **48** confirmados" na folha, o contador do rol ("**12** convidados · **8** confirmaram · …") e o resumo de cada coluna ("Total **R$ 12.500,00** · falta pagar **R$ 4.000,00**", "**3** mesas · **24** lugares · **18** de **40** com mesa", "**9** momentos, das **17:00** às **02:00**"). Cada item do resumo é inquebrável por dentro.
- **Veredito** (600, clamp(2.75rem, 12vw, 4rem), altura 1.02, -0.035em, `text-balance`): a frase do veredito do leitor ("Pode entrar", "Já entrou", "Não confirmou presença"). **Nome no veredito** (600, clamp(1.75rem, 7.5vw, 2.25rem), -0.015em): o nome do convidado logo abaixo. O detalhe (hora · mesa) em 1.125rem, papel a 90% (tinta a 85% sobre o âmbar). Fora de folha, sem pauta.
- **Contador da porta** (Geist 600, 1.75rem, altura 1, -0.02em, tabular): o N de "N de M confirmados chegaram" no topo do leitor; " de M" em 1.125rem tinta suave, o resto da frase em 0.875rem tinta suave, e "**+K** sem confirmação" quando ela deixou entrar quem não confirmou. É número em frase, por isso Geist e não Mono: no tamanho grande, o zero cortado do Geist Mono atrapalha a leitura.

### Named Rules

**The Mono-Só-Para-Dados Rule.** Geist Mono aparece apenas em dia, horário, telefone, valor em reais, contagens dos índices, ocupação de mesa e nos campos desses dados. Nunca em títulos ou rótulos de texto. Números lidos dentro de uma frase ficam em Geist semibold tinta, tabulares pelo `tabular-nums` global.

**The Pauta Rule.** Dentro de uma folha pautada, todo texto usa `line-height` igual a `--linha` (ou múltiplos dela); o texto assenta nas pautas. Uma linha de lista é feita de pautas inteiras: o conteúdo quebra para a pauta seguinte, nunca para meia pauta; o texto alinha ao centro da pauta (não pela linha de base), e faixas de ação têm a altura de uma pauta, com os botões transbordando sem empurrar a linha. Um elemento que quebra o ritmo da pauta quebra o papel.

## Layout

Estrutura de prancheta: topo fino fixo (56px) sobre a mesa, com a logo em texto à esquerda (alinhada ao índice lateral) e a data de hoje à direita (por extenso no computador, curta no celular). No computador (`md`, 768px), uma coluna lateral de 240px traz as três seções como linhas de um índice pautado (itens de 44px separados por fios de pauta, contagens em mono alinhadas à direita), com o nome da usuária e "Sair" no pé. O centro tem gutter de 1rem no celular e 2rem no computador.

As folhas de festa ficam numa grade `auto-fill` com mínimo de 17.5rem (280px) por folha e espaço de 1.25rem (1.5rem a partir de `sm`, 640px); no celular, uma coluna. A primeira folha da grade de pendentes é sempre a folha em branco "Nova festa". Formulários até 42rem, login até 24rem, avisos até 36rem. O detalhe da festa ocupa a largura toda do centro.

No celular as seções viram uma barra inferior fixa de três itens (64px de altura, fundo papel, respeitando `safe-area-inset-bottom`) e "Sair" desce para o fim da página, longe dos toques frequentes; o conteúdo reserva 7rem de respiro inferior para a barra.

Ritmo vertical dentro das folhas: a pauta (`linha`, 1.75rem / 28px). Dentro de toda folha, o texto começa no recuo `recuo-texto` (margem 2.75rem + 0.875rem), à direita da linha de margem; a padding direita é 1.25rem (2rem em telas maiores nos formulários; 1.25rem sempre no detalhe da festa).

A folha de detalhe é uma mesa de colunas, com 1.5rem entre folhas. No celular, uma coluna: a folha da festa, logo abaixo um **índice da festa** (ver Components) e as seções empilhadas. A partir de `md` (768px), duas colunas: à esquerda a folha da festa e os convidados, à direita Fornecedores, Mesas e Cronograma empilhados. A partir de `xl` (1280px), quatro colunas (`1.25fr 1fr 1fr 1fr`): festa + convidados, Fornecedores, Mesas, Cronograma; nessas colunas estreitas a linha de margem fica localmente em `margem-coluna` (1.75rem). Abaixo das colunas, uma folha lisa de largura toda com "Planta do salão" e "PDFs" (lugar reservado para a próxima etapa: legenda, uma placa 16:9 tracejada até 48rem e duas linhas pautadas "em breve").

Cada coluna é uma folha lisa e um contêiner: o layout de dentro responde à largura da folha, não da tela. O roteiro vira duas colunas (rótulo de 8.5rem + valor) quando a folha tem 28rem; o formulário de convidado vira uma linha (nome flexível, WhatsApp em 13rem, botão) a partir de 36rem. Padding direito de 1.25rem em todas as folhas do detalhe.

Linhas das listas, todas em pautas inteiras:

- **Convidado:** nome e status na primeira pauta (quebram se a coluna for estreita); telefone (ou "Sem WhatsApp") e "· Mesa N" na segunda, e a mesa desce para a pauta seguinte se não couber; WhatsApp e ⋯ à direita da segunda pauta.
- **Fornecedor:** serviço (semibold) · nome (tinta suave) em largura toda; telefone mono sem quebra + WhatsApp + ⋯; valor mono + estado do pagamento.
- **Mesa:** nome (quebra) + ocupação "n/n" + ⋯; um convidado sentado por pauta, recuado 0.75rem, com um X para tirá-lo; por último a pauta "+ Sentar convidado…", que some quando a mesa está cheia ou não há quem sentar. Uma pauta vazia entre mesas.
- **Cronograma:** horário mono (coluna de 3.25rem) + atividade; na pauta de baixo, ⋯ sob o horário e o responsável ao lado. Horários depois da meia-noite vão para o fim.

**Páginas públicas do convite** (`/c/[token]`): sem topo nem navegação. Uma moldura centrada de até 28rem (`max-w-md`) com gutter de 1rem, 1.25rem acima (3rem a partir de `sm`) e 2.5rem abaixo; a marca em texto ("Elisangela" semibold + "Eventos" em tinta suave 0.875rem) fica 1rem acima de uma única folha. Link inválido e excesso de tentativas usam a mesma moldura com um aviso em folha lisa (título Title Large + explicação em tinta suave).

**Leitor de QR** (`/painel/checkin`): uma coluna centrada de até 36rem (`max-w-xl`), dentro do painel com topo e navegação. Sem festa escolhida, a página mostra a lista de festas (ver Components); com exatamente uma festa a até 20h de agora, vai direto ao leitor. No leitor, de cima para baixo: "Trocar festa" (link de texto com seta, só quando há mais de uma festa), o título da festa em Headline e o contador; o visor quadrado em largura toda, em qualquer largura de tela; e a folha lisa "Buscar pelo nome" 1.5rem abaixo. Ao focar a busca, a folha sobe para logo abaixo do topo (4rem de respiro) e passa a ter no mínimo `100dvh - 4rem` de altura, para os resultados não ficarem embaixo do teclado nem a página encolher ao filtrar. O veredito é fixo de borda a borda por cima de tudo, inclusive do topo e da barra inferior, com 1.5rem de padding lateral e respeitando as áreas seguras; o conteúdo fica numa coluna de até 36rem, centrado na vertical, com as ações no pé.

**The Recuo de Margem Rule.** As folhas não têm mais pautas nem linha de margem (papel liso). O recuo esquerdo continua vindo de `padding-left: calc(var(--margem) + 0.875rem)`, com `--margem: 0.375rem`, o que dá 1.25rem, igual ao `pr-5` da direita. Folhas com `pr-6` (login, avisos, diálogo de confirmação) usam `px-6`. Para mudar o recuo de todas as folhas, ajusta-se `--margem`, nunca o recuo à mão.

## Elevation & Depth

Profundidade de papel sobre mesa: uma sombra curta de contato mais uma sombra difusa curta, as duas em grafite-azulado de baixa opacidade. Não há camadas tonais além de mesa → papel. A folha clicável levanta 2px no hover, e a sombra se alonga, como uma folha tirada da pilha.

### Shadow Vocabulary

- **Folha em repouso** (`box-shadow: 0 1px 1px oklch(0.2 0.01 250 / 6%), 0 6px 16px -8px oklch(0.2 0.01 250 / 22%)`): toda `.folha`.
- **Folha levantada** (`box-shadow: 0 1px 1px oklch(0.2 0.01 250 / 6%), 0 14px 28px -12px oklch(0.2 0.01 250 / 30%)` + `translateY(-2px)`, 200ms ease-out): hover das folhas clicáveis; desligado com `prefers-reduced-motion`.
- **Papel solto** (`box-shadow: 0 1px 1px oklch(0.2 0.01 250 / 8%), 0 10px 24px -10px oklch(0.2 0.01 250 / 30%)`): menus flutuantes (o menu ⋯ da linha do convidado); um pedaço de papel um pouco mais alto que a folha.
- **Véu do diálogo** (`background: oklch(0.2 0.01 250 / 35%)`): overlay atrás do diálogo de confirmação.
- **Visor da câmera**: a mesma sombra da folha em repouso; o visor grafite fica apoiado na mesa como uma folha.
- **Veredito**: sem sombra; é um campo de cor que cobre a tela, não um papel.

### Named Rules

**The Papel-Sobre-Mesa Rule.** Só papel tem sombra: folhas, diálogos e o papel solto dos menus (e o visor da câmera, que fica na mesa como uma folha). Controles (botões, campos, navegação) são planos; a profundidade pertence ao papel.

## Shapes

Forma de material de papelaria: folhas com cantos quase retos (3px), controles com canto discreto de 6px (`--radius: 0.375rem`), links de texto e anéis de foco com 3.6px. O único círculo do sistema é o disco de contorno 1px com o "+" na folha "Nova festa". O grifo do marca-texto é a única forma irregular: cantos assimétricos (`rounded.grifo`), girado -0.8°, transbordando 0.3em para os lados do texto — como um traço de caneta, não um retângulo.

As pautas e a linha de margem são desenhadas com `linear-gradient` no fundo da folha (fios de 1px), deslocadas `--folha-topo` (-0.375rem) para o texto assentar nelas. Formulários e avisos usam a **folha lisa**: só a linha de margem, sem pautas, porque campos precisam de caixa própria para serem reconhecíveis. Uma folha lisa pode conter um **trecho pautado**: só os fios de pauta, com o mesmo deslocamento `--folha-topo`, para listas que assentam em pautas (o rol de convidados, as listas das colunas, o índice da festa). O **papel solto** dos menus é papel liso, sem margem, com o canto de 3px das folhas.

No leitor, o visor da câmera tem o canto de 3px das folhas; a mira são quatro cantos brancos de traço 3px e 40px de lado (canto de 0.3rem), num quadrado de 62% do visor (até 20rem). O veredito não tem forma: vai de borda a borda, sem cantos; só os botões dele têm o canto de 6px.

## Components

### Buttons

Grafite e discretos; a ação primária é tinta invertida, o resto é texto.

- **Shape:** canto discreto (6px, `rounded.lg`).
- **Primary:** fundo tinta, texto papel, 40px de altura, 20px laterais nos formulários; hover a 80% de opacidade; `translateY(1px)` ao pressionar.
- **Hover / Focus:** foco com borda `pauta-forte` e anel de 3px em `pauta-forte` a 50%.
- **Outline:** fundo papel, borda `borda`, 36px; hover em `superficie`. Usado em "Editar" e "Cancelar" do diálogo.
- **Ghost destrutivo:** só texto `destrutivo` com ícone Trash; abre a confirmação. A confirmação final é o único botão de fundo `destrutivo`.
- **Ações de linha:** só ícone (WhatsApp, ⋯) com `aria-label`, ghost em `tinta-suave`, numa faixa da altura de uma pauta. No rol, passam a tinta quando a linha está sob o cursor ou tem foco dentro; 44px abaixo de `sm`, 36px a partir de `sm`. Nas colunas, cada botão escurece no próprio hover; 44px abaixo de `sm`, 28px (uma pauta) a partir de `sm`.
- **Adicionar:** ghost "+ Adicionar fornecedor / mesa / ao cronograma", texto tinta peso 500 com o "+" de Lucide, da altura de uma pauta, puxado para a esquerda para o texto alinhar com o recuo; o rótulo varre o grifo no hover. Abre o formulário no lugar, que continua aberto entre um item e outro até "Fechar".
- **Pagamento:** o estado do fornecedor é um botão de texto 0.8125rem (`aria-pressed`) que alterna: "Pago" com check Lucide de 14px em tinta suave, "Pendente" em tinta semibold; hover em `superficie`.
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
- **Labels:** 0.875rem, peso 500, sempre visíveis acima do campo; "(opcional)" em tinta suave peso 400. Campos empilhados com 20px entre si nos formulários de página; 12px nos formulários das colunas e do rol (adicionar e editar no lugar, sobre papel), com "Adicionar"/"Salvar" primário de 40px e "Fechar"/"Cancelar" ghost ao lado.
- **Select:** vestido como o campo (40px, contorno `borda-campo`, fundo papel, mesmo foco). Exceção: o "Sentar convidado…" da mesa é um select nativo sem caixa, texto 0.875rem em tinta suave que escurece no hover, e escolher já envia.
- **Busca:** 36px de altura, fundo papel, lupa de 16px em tinta suave dentro do campo, à esquerda. No leitor, 44px. O X de limpar de todo campo `type=search` é desenhado pelo sistema: um X de traço 2 em tinta suave, 1rem.

### Navigation

- **Lateral (computador):** índice pautado: lista entre fios `pauta`, itens de 44px com ícone de 16px, rótulo 0.9375rem e contagem mono 0.8125rem à direita. Inativo em `tinta-suave`; hover escurece para tinta e varre o grifo; ativo em semibold com o grifo fixo (`aria-current="page"`). Foco: contorno 2px `pauta-forte` para dentro.
- **Barra inferior (celular):** três colunas iguais de 64px, ícone de 20px sobre rótulo curto de 0.75rem; ativo em semibold com grifo.
- **Topo:** logo em texto à esquerda, alinhada ao índice lateral; data de hoje em tinta suave à direita. Logo: ("Elisangela" title semibold + "Eventos" em tinta suave), que leva às pendentes.

### Folha de Festa (assinatura)

Cada festa é uma folha pautada clicável, lida de cima para baixo como uma ficha: na primeira faixa, o dia em numeral mono grande com mês (semibold) e dia da semana (tinta suave) em label maiúsculo; à direita, o horário em mono e a proximidade ("Hoje", "Amanhã", "Em 5 dias"), grifada quando faltam até 7 dias. Abaixo, o nome da festa em duas pautas, o local com ícone de alfinete, e na última pauta "**31** de **48** confirmados" (ou "presentes", nas concluídas), com os números em tinta semibold.

A **folha em branco "Nova festa"** é a primeira da pilha: mesma folha pautada, com o disco "+" e "Nova festa" que se grifa no hover. Criar é pegar a folha do topo da pilha.

### Grifo (assinatura)

O marca-texto atrás do texto: `grifo` com cantos irregulares, girado -0.8°. Fixo (seção ativa, urgência) ele varre da esquerda para a direita ao aparecer; no hover de um `.group` varre o rótulo que está para ser escolhido. 200ms, `cubic-bezier(0.16, 1, 0.3, 1)`, desligado com `prefers-reduced-motion`.

### Rol de convidados (assinatura)

A lista de chamada da festa, escrita na prancheta: um trecho pautado dentro da folha lisa da seção, cada convidado em duas pautas ou mais (ver Layout). O status fala em palavras com um ícone de 14px: **Confirmou** (check, tinta peso 500), **Não vai** (x, tinta suave), **Aguardando** (círculo tracejado, tinta suave), **Chegou HH:MM** (grifado, semibold, hora em mono). Acima do rol, o contador em tinta suave com números em semibold tinta; cada item termina no seu "·" e não quebra por dentro, então a linha só quebra entre itens. Sem convidados, um aviso em tinta suave com ícone de 16px explica o link próprio de cada pessoa. Editar troca a linha pelo formulário em linha, em papel.

### Convite do convidado (página pública)

A folha do convidado, tirada da prancheta: folha pautada única na moldura pública (ver Layout), lida de cima para baixo. Na primeira pauta, "Olá, **Nome**" (1.125rem, primeiro nome semibold). Respondido, a pauta seguinte traz o status em 1.125rem semibold, grifado (ver The Marca-texto Rule); confirmado, o canhoto vem logo abaixo. Depois, a data como na folha de detalhe (dia em Display Detalhe ocupando 3 pautas, ao lado mês e ano semibold em maiúsculas, dia da semana em tinta suave e horário em mono, um por pauta), o título da festa em Headline 1.5rem semibold com altura de pauta e sem padding extra, para que títulos de várias linhas sigam nas pautas, e Local, Endereço e Traje em duas colunas (rótulo de 5.5rem em tinta suave 0.875rem + valor).

- **Resposta em aberto:** "Você vai?" (Title Large) e dois botões lado a lado em grade de 2 colunas com 12px entre eles: "Vou" sólido em tinta e "Não poderei ir" em contorno sobre papel. Botões de resposta têm 48px de altura, texto 0.9375rem e 4px de margem acima e abaixo: ocupam exatamente duas pautas. Enviando, "Enviando resposta…" em tinta suave.
- **Recusado:** "Mudou de ideia? Dá para confirmar até o dia da festa." em tinta suave 0.875rem e "Vou à festa" sólido em largura toda.
- **Confirmado:** abaixo dos dados, o link de texto "Não vai mais poder ir? Avise aqui." (tinta suave, sublinhado com offset de 4px, alvo estendido na vertical).
- **Presente ou encerrado:** sem ações.

### Canhoto (assinatura)

O QR de entrada impresso na própria folha como um canhoto destacável. Picote tracejado de 2px em `pauta-forte` a 70% em cima e embaixo, de borda a borda da folha, cobrindo também a linha de margem. Por trás do QR, papel liso sem pautas (zona de silêncio do código); o conteúdo segue no recuo de margem. A altura do canhoto é sempre um múltiplo inteiro de `--linha` (padding de uma pauta menos os 2px do picote), para a folha voltar às pautas depois dele. Conteúdo, uma pauta de distância entre cada item: "Apresente este código na entrada." em tinta suave 0.875rem; o QR em tinta, quadrado de 8 pautas (14rem, limitado à largura da folha); o nome completo do convidado em semibold; e "Salvar imagem", botão primário de 48px com 4px de margem acima e abaixo (2 pautas) e ícone Download de Lucide (16px, traço 1.75), que baixa a imagem do convite.

### Confirmação de recusa em linha

A única exceção ao diálogo de confirmação compartilhado, do lado do convidado: a página é de tarefa única, então desistir não abre modal. Ao tocar o link de recusa, a própria folha mostra a consequência em tinta 0.875rem ("Seu QR Code de entrada deixa de valer. Confirma que não vai?") e dois botões de resposta (48px) lado a lado: "Voltar" em contorno sobre papel e "Não vou" em fundo destrutivo com texto papel. Enviando, o botão diz "Enviando…".

### Imagem do convite (PNG para a galeria)

O canhoto para guardar no celular: PNG de 1080×1512 desenhado a 2× da tela (pauta de 56px, 27 pautas). Fundo branco com pautas e linha de margem atravessando a folha toda, texto a partir do recuo. De cima para baixo: a marca ("Elisangela" semibold + "Eventos" em tinta suave), a data como no cabeçalho da página (dia em mono ocupando 3 pautas, mês e ano semibold em maiúsculas, dia da semana em tinta suave, horário em mono), o título e o local assentados nas pautas, e então o canhoto entre dois picotes de borda a borda (traços na cor da margem a 70%), com o QR de 560px (10 pautas) centralizado e, centralizados abaixo dele, o nome completo em semibold e "Apresente este código na entrada." em tinta suave. Como os PDFs, a imagem reproduz as cores do sistema em valores fixos de raster.

### Colunas da festa (assinatura)

Fornecedores, Mesas e Cronograma são a mesma peça: folha lisa com título Title Large, uma pauta de resumo em tinta suave com números em semibold tinta (só quando há itens), "+ Adicionar …" e a lista em trecho pautado. Cada linha tem um ⋯ com Editar (troca a linha pelo formulário, em papel) e Remover (diálogo de confirmação). Sem itens, a coluna diz numa frase em tinta suave 0.875rem o que entra ali, sem ícone. A ocupação da mesa fica em tinta suave e vira destrutivo semibold quando passa da capacidade.

### Índice da festa (celular)

Só abaixo de `md`: folha lisa logo abaixo da folha da festa, com trecho pautado e uma âncora por seção (Convidados · Fornecedores · Mesas · Cronograma · Planta do salão · PDFs). Cada item tem duas pautas de altura com o texto assentado na segunda; contagem mono 0.8125rem em tinta suave à direita; o rótulo varre o grifo ao passar.

### Planta do salão e PDFs

Duas folhas lisas de largura total abaixo das colunas. **Planta:** sem imagem, uma área tracejada (`pauta-forte` a 60%, 12rem de altura, até 48rem) com ícone de 24px, "Enviar a imagem da planta" e a dica em tinta suave; aceita clique ou arrastar, e ao arrastar ganha fundo `superficie`. Com imagem, ela aparece inteira (até 80vh, borda `borda`, cantos de 3px); ao passar o mouse surge "Abrir em tamanho real" num papel no canto. Abaixo, "Trocar imagem" (outline em papel) e "Remover" (ghost destrutivo, com o diálogo de confirmação). Enquanto prepara e envia, o texto de status diz "Preparando a imagem…"/"Enviando…". **PDFs:** trecho pautado, cada PDF em duas pautas: título (peso 500) com "Abrir PDF" à direita (ícone de 16px, texto 0.875rem que varre o grifo ao passar, abre em outra aba) e a descrição em tinta suave.

Os PDFs repetem a prancheta em papel: fundo branco, linha de margem `pauta-forte` à esquerda, fios `pauta` entre as linhas, Geist e Geist Mono (dia em 46–64pt, horários e valores em mono), rótulos em caixa alta 7.5pt. O grifo aparece só no horário do convite e na mesa que passou da capacidade. Convite em A5; roteiro em A4 com rodapé "Roteiro · título" e "n de N", e a planta numa página própria, deitada quando a imagem é larga.

### Menu de papel solto

O menu ⋯ da linha: papel solto alinhado à direita do gatilho, cantos de 3px, sem anel; itens de 0.875rem com ícone de 16px. Nas colunas, 11rem: "Editar", "Remover" (destrutivo). No rol, 12rem: "Copiar link do convite", "Editar", "Remover". Copiar troca o telefone da linha por "Link copiado" (tinta, peso 500) por 2s e anuncia por `aria-live`. Abre com fade + zoom de 100ms.

### Diálogo de confirmação

Um só diálogo para toda exclusão no painel (festa, convidado, fornecedor, mesa, item do cronograma; no convite público, ver Confirmação de recusa em linha): folha lisa centralizada (até 28rem, padding 1.5rem e recuo de margem) sobre o véu grafite; título Title Large, descrição em tinta suave dizendo o que se perde, ações "Cancelar" (outline em papel) e a confirmação nomeada ("Excluir festa", "Remover convidado", "Remover mesa") em fundo destrutivo, alinhadas à direita. Enquanto envia, o botão diz "Excluindo…"/"Removendo…". Abre com fade + zoom de 100ms.

### Estados vazios e carregamento

Avisos são folhas lisas com ícone de 20px e duas linhas (título semibold + explicação em tinta suave), até 36rem de largura. O carregamento mostra folhas pautadas vazias pulsando a 70% de opacidade e barras `borda` no lugar do cabeçalho.

### Leitor de QR (porta)

A ferramenta da porta: o visor lê, o veredito responde, a folha só aparece para a busca pelo nome.

- **Visor:** quadrado em largura toda, fundo tinta, cantos de 3px. Fechado, um ícone de câmera de 32px em papel a 80% e o botão "Abrir câmera" em papel com texto tinta (48px, 24px laterais, 0.9375rem peso 500, foco com contorno de 2px em papel); com a câmera negada, o ícone vira câmera cortada, a explicação aparece em papel a 90% 0.875rem e o botão diz "Tentar de novo". Aberto, o vídeo cobre o visor, a mira fica no centro e "Aponte para o QR Code do convidado" em papel a 85% 0.875rem no pé. Conferindo, um véu tinta a 70% com "Conferindo…" em papel 1.125rem.
- **Busca pelo nome:** folha lisa com título Title Large, uma pauta de explicação em tinta suave, o campo de busca e a lista em trecho pautado. Cada convidado é um botão de duas pautas com o texto assentado: nome (peso 500) e, na pauta de baixo, o estado em tinta suave 0.875rem ("Confirmou", "Não respondeu", "Recusou" ou "Chegou HH:MM" grifado) · mesa (ou "sem mesa"). Tocar registra a entrada e abre o veredito.
- **Escolher a festa:** folha lisa com trecho pautado; cada festa ocupa a pauta da data (Geist Mono 0.8125rem em tinta suave: dia da semana, dia e mês · horário, com "Hoje" grifado em semibold ao lado) e o título inteiro na pauta seguinte (peso 500, quebra para as pautas de baixo, nunca cortado), que varre o grifo ao passar.

### Veredito da porta (assinatura)

O resultado de cada leitura em tela cheia, de borda a borda (cobre topo e navegação), com entrada em fade de 150ms e foco na ação principal; Esc fecha. Centrado na vertical: ícone Lucide de 64px (traço 1.75; CircleCheck em "Pode entrar", CircleX nos barrados, CircleAlert na atenção, WifiOff na falha), o veredito, o nome do convidado e o detalhe (hora de entrada · mesa, ou "Sem mesa definida"). No pé, ações de 56px numa grade de duas colunas com 12px entre elas, texto 1rem semibold, canto de 6px:

- **Principal:** papel com texto tinta sobre verde, vermelho e grafite; tinta com texto papel sobre o âmbar. Foco: contorno de 3px na cor do texto, afastado 2px (o anel `pauta-forte` não aparece sobre o campo colorido).
- **Secundária:** contorno de 2px em papel a 70% (tinta a 60% sobre o âmbar), sem fundo.
- **Pode entrar** (`porta-ok`): fecha sozinho em 3s; uma barra de 6px em papel a 75% no topo esvazia nesse tempo (parada com `prefers-reduced-motion`). "Desfazer" e "Próximo".
- **Já entrou** (`porta-barrado`): "Apagar entrada das HH:MM" (secundária, largura toda) acima de "Próximo" (principal, largura toda); o botão diz exatamente o que apaga.
- **Convite de outra festa / QR não reconhecido** (`porta-barrado`): só "Próximo", em largura toda.
- **Não confirmou presença** (`porta-atencao`): "Não deixar" (secundária) e "Deixar entrar" (principal); registrando, "Registrando…".
- **Não deu para conferir** (`tinta`): só "Próximo".

### Sinais da porta

Cada veredito também soa e vibra, para ela saber o resultado sem olhar: bipes senoidais curtos (WebAudio, ataque de 10ms) e um padrão de vibração por veredito. **Pode entrar:** um bipe agudo (1046 Hz, 140ms) e vibração de 70ms. **Barrado:** dois bipes graves (220 Hz, 170ms cada) e vibração 90-70-90-70-90ms. **Atenção:** dois bipes descendentes (660 e 523 Hz) e uma vibração longa de 200ms. **Falha:** um tom médio (392 Hz, 260ms) e vibração 40-60-40ms. O som é destravado no toque em "Abrir câmera"; no iPhone, só o som.

## Do's and Don'ts

### Do:

- **Do** colocar todo conteúdo novo numa folha (`.folha`, ou `.folha .folha-lisa` quando houver campos) sobre a mesa, com `padding-left: calc(var(--margem) + 0.875rem)`.
- **Do** usar `line-height: var(--linha)` (1.75rem) ou múltiplos dela para todo texto dentro de folha pautada.
- **Do** reservar o grifo para a seção atual, festas a até 7 dias, o "Chegou" do check-in, a resposta registrada no convite do convidado e o hover do que está para ser escolhido; pagamento fala por peso e tinta.
- **Do** escrever dia, horário, telefone, valor em reais e contagens em Geist Mono tabular; números dentro de frase em Geist semibold tinta; todo o resto em Geist.
- **Do** usar `pauta-forte` como cor de foco: contorno de 2px nos links e anel de 3px a 50% nos controles.
- **Do** desligar varredura do grifo, levantamento das folhas e a barra que esvazia no veredito com `prefers-reduced-motion`.
- **Do** dar fundo papel explícito a campos e botões outline que ficam sobre folha.
- **Do** dar 44px de alvo às ações abaixo de `sm` (a partir de `sm`, 36px no rol e 28px nas colunas) e manter os rótulos de campo visíveis.
- **Do** montar linhas de lista em pautas inteiras, com texto centrado na pauta e ações numa faixa de uma pauta que transborda sem empurrar.
- **Do** usar o diálogo de confirmação compartilhado para toda ação destrutiva do painel, com o botão nomeado pelo que apaga; no convite público, a confirmação acontece na própria folha.
- **Do** dar 48px aos botões do convite público, com 4px de margem acima e abaixo, para ocuparem duas pautas inteiras.
- **Do** reservar `porta-ok`, `porta-barrado` e `porta-atencao` para o veredito em tela cheia do leitor de QR, cada um com seu som e sua vibração.

### Don't:

- **Don't** usar o amarelo `grifo` como cor de texto, borda, fundo de botão ou fundo de superfície.
- **Don't** usar gradientes decorativos; os únicos gradientes do sistema são os fios da pauta e a linha de margem desenhados no fundo da folha.
- **Don't** usar vidro (backdrop-blur), cantos acima de 6px em contêineres, ou rosa e tipografia cursiva de "casamento romântico".
- **Don't** montar grades de cards brancos idênticos com sombra e ícone no topo; a festa é uma folha com o dia como âncora.
- **Don't** dar sombra a controles; só papel (folhas, diálogos, papel solto) tem sombra.
- **Don't** pôr texto ou controles sobre a linha de margem.
- **Don't** usar ícones sozinhos como decoração; ícones de traço 1.75 acompanham um rótulo. Botão só-ícone apenas em ações compactas, sempre com `aria-label`.
- **Don't** usar as cores de porta fora do veredito do leitor, nem vermelho para falha de rede: vermelho é só "barrado".
