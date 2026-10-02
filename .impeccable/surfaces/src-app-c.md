---
version: 1
slug: "src-app-c"
primary_target: "src/app/c"
related_targets: []
---

# Convite do convidado (público)

Escopo: página pública `/c/[token]` e a imagem do QR para baixar. Modo: Operate (o convidado conclui uma tarefa curta). Sem login; chega pelo link do WhatsApp, quase sempre no celular.

Tarefa: entender em segundos de quem é a festa, quando e onde; responder "Vou" ou "Não poderei ir"; quem confirmou recebe o QR Code de entrada, pode baixá-lo e reabrir o link para vê-lo de novo. Pode mudar a resposta até o dia da festa; depois da entrada registrada ou da festa passada, a página só informa.

Decisões da dona: mesmo visual de prancheta do painel; sem extras (mapa, agenda, PDF) por enquanto; recusa pode ser desfeita até a festa. Observações da festa não aparecem (podem ser internas).

## Direction contract

THESIS: o convite é a folha do convidado tirada da prancheta da Elisangela: o nome dele já escrito na primeira pauta, a data em numeral grande, e a resposta marcada a marca-texto. Recusa o RSVP genérico (cartão centralizado, dois botões pílula, fundo degradê) e o "casamento romântico" de cursiva e rosa.

OWN-WORLD: uma única folha branca pautada com linha de margem azul sobre a mesa cinza fria; tinta grafite; Geist para texto, Geist Mono só para dia e horário; marca-texto amarelo só na resposta registrada. Depois de confirmar, o QR é impresso na própria folha como um canhoto destacável: picote tracejado separando o canhoto do resto da folha, QR em tinta, o nome embaixo.

STORY: abre pelo WhatsApp, lê "Olá, Ana", reconhece data, festa e local; toca "Vou"; a folha grifa "Presença confirmada" e entrega o canhoto com o QR e "Salvar imagem". Ao voltar ao link, o canhoto já está no topo. Quem recusou vê o aviso e pode mudar de ideia.

FIRST VIEWPORT: 390px. Acima da folha, "Elisangela Eventos" pequeno à esquerda. Folha: "Olá, Ana" na primeira pauta; dia em numeral mono grande com mês, semana e horário ao lado; título da festa; local e endereço nas pautas; "Você vai?" e dois botões de largura cheia lado a lado ("Vou" sólido em tinta, "Não poderei ir" em contorno) visíveis sem rolar. Confirmado: status grifado sob o nome e o canhoto com o QR logo abaixo, dados da festa depois.

FORM: folha única de prancheta, extensão do mundo do painel. Rodada de conceitos dispensada (sem seed): a dona escolheu o visual na pergunta 1, "Mesma prancheta (Recomendado)", e a página é uma folha estreita de tarefa única. Interação assinatura: ao responder, o grifo varre a linha do status (200ms, ease-out; desligado com prefers-reduced-motion).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
