---
version: 1
slug: "src-app-painel"
primary_target: "src/app/painel"
related_targets: ["src/app/login"]
---

# Painel (área logada)

Escopo: layout do painel, listas de festas pendentes/concluídas, detalhe, criar/editar/excluir festa e o lugar do leitor de QR. Modo: Operate.

Tarefa: Elisangela acha a festa certa em segundos, abre os detalhes e cadastra festas novas. Usa no computador (dia, mesa) e no celular (consultas rápidas, check-in).

Estrutura pinada pela dona: logo no canto superior direito; à esquerda "Festas pendentes", "Festas concluídas", "Leitor QR Code"; ao centro, cards clicáveis das festas com detalhes e um botão para nova festa.

## Direction contract

THESIS: o painel é o roteiro que a cerimonialista já carrega na prancheta, vivo. Recusa o admin SaaS de cards brancos idênticos com sombra e ícone e também o "casamento romântico" rosa com cursiva.

OWN-WORLD: folhas de papel branco pautado (fios azul-claros de 1px, linha de margem) apoiadas numa mesa cinza fria; tinta grafite; marca-texto amarelo só para seleção atual, "hoje/próximos dias" e foco de ação. Uma família sans (Geist) para tudo, Geist Mono só para dados (dia, horário, contagens). Sem gradientes, sem vidro, sem cantos muito redondos.

STORY: ela entra, vê a pilha de folhas das próximas festas na ordem do calendário, reconhece pelo dia grande e pelo nome, toca na folha e chega ao roteiro completo; para criar, pega a folha em branco do topo da pilha.

FIRST VIEWPORT: topo fino com o título da seção à esquerda e a logo em texto à direita. Coluna esquerda estreita com as três seções como linhas de um índice pautado, contagens tabulares, a seção ativa grifada de amarelo. Centro: grade de folhas pautadas; a primeira é a folha em branco "Nova festa"; cada folha abre com o dia em numeral mono grande, mês/semana, horário, título, local e "x de y confirmados" na última pauta. Celular: seções viram barra inferior de três itens, logo continua no topo à direita, folhas em uma coluna.

FORM: Prancheta da Cerimonialista, 1º da lista ordenada (escolha do usuário, carta IMPECCABLE'S PICK). Seed 18d92cd4. Interação assinatura: o grifo do marca-texto varre a seção ao trocar de seção (150-200ms, ease-out, desligado com prefers-reduced-motion).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Desvios registrados

- Topo à esquerda mostra a data de hoje, não o título da seção (revisão final, 1ª rodada): o título da seção já é o h1 logo abaixo, repeti-lo seria redundante; a data serve à rotina da cerimonialista ("o que é hoje/amanhã"). No celular, a data curta; "Sair" saiu do topo e foi para o fim da página.
- Formulários usam folha lisa (sem pautas): campos precisam de caixa própria para serem reconhecíveis e acessíveis.
