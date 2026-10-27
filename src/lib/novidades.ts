// Notas de atualização do painel, para a Elisangela (botão "Novidades" no topo).
// A mais nova fica em primeiro. O `id` muda a cada nota: é o que acende o pontinho
// do botão até ela abrir a página.

export type Novidade = {
  id: string;
  data: string; // "2026-10-07"
  titulo: string;
  secoes: { titulo: string; itens: string[] }[];
};

export const NOVIDADES: Novidade[] = [
  {
    id: "2026-10-27-agenda-do-dia",
    data: "2026-10-27",
    titulo: "Agenda do dia",
    secoes: [
      {
        titulo: "Reuniões e compromissos",
        itens: [
          "No menu da esquerda (e na barra de baixo, no celular) entrou a “Agenda do dia”: as festas daquele dia e os compromissos que você marcar, na ordem do horário.",
          "Em “Marcar compromisso”, diga o que é, o dia e o horário. Fim, local e observação são opcionais. Os três pontinhos da linha editam ou removem.",
          "As setas passam de um dia para outro, e “Hoje” volta para o dia de hoje.",
        ],
      },
      {
        titulo: "No calendário",
        itens: [
          "A chave do calendário ganhou “Dia”, ao lado de Mês e Ano, que abre a agenda.",
          "Clicando no número de um dia, abre a agenda daquele dia.",
          "Os compromissos aparecem em cinza no mês, junto com as festas.",
        ],
      },
    ],
  },
  {
    id: "2026-10-15-planilhas-convidados",
    data: "2026-10-15",
    titulo: "Duas planilhas para a lista de convidados",
    secoes: [
      {
        titulo: "Planilhas para a noiva",
        itens: [
          "Na lista de convidados, os botões “Adicionar vários de uma vez” e das planilhas ficaram mais fáceis de ver.",
          "“Planilha demarcação” baixa o modelo de croqui, para quando as mesas são demarcadas.",
          "“Planilha modelo lista de convidados” baixa uma planilha simples, para quando não tem demarcação: nome do convidado, quantidade de pessoas e WhatsApp. Depois é só copiar as linhas e colar em “Adicionar vários de uma vez”.",
        ],
      },
      {
        titulo: "Fornecedores no jantar",
        itens: [
          "A planilha aberta no Google Planilhas ganhou, embaixo do total, um bloco para os fornecedores (Fornecedores jantar, DJ, Banda, Assessoria, Seguranças/monitora, Brinquedos e Barman): preencha a quantidade de cada um na coluna B e o total soma sozinho.",
        ],
      },
      {
        titulo: "Links nas observações",
        itens: [
          "Nas folhas de Observações (e no texto do cerimonial) dá para colocar links: selecione o texto, clique no botão de link da barra (ou Ctrl+K) e cole o endereço.",
          "Site colado ou digitado já vira link sozinho. Clicando num link aparece um balão para abrir, editar ou remover; Ctrl+clique abre direto.",
          "No PDF, o link sai azul e dá para clicar.",
        ],
      },
      {
        titulo: "Checklist dos fornecedores",
        itens: [
          "O checklist de cada serviço não rola mais dentro do cartão, então a página rola normalmente com o mouse em cima dele.",
          "Aparecem só os itens em aberto (até 6, com “Ver mais”); os feitos ficam recolhidos em “✓ 5 feitos”, que abre ao clicar.",
          "O mesmo vale para as abas Fornecedores e Serviços e checklists: listas longas mostram os primeiros e um “Ver mais”, sem rolagem dentro do cartão.",
        ],
      },
    ],
  },
  {
    id: "2026-10-14-croqui-planilha",
    data: "2026-10-14",
    titulo: "Croqui pela planilha da noiva",
    secoes: [
      {
        titulo: "Nomes trocados",
        itens: ["A planta do salão agora se chama Layout, e a parte das mesas se chama Croqui."],
      },
      {
        titulo: "Planilha do croqui",
        itens: [
          "Na lista de convidados, o botão “Planilha demarcação” baixa o modelo de croqui para mandar à noiva. As somas de cada mesa foram corrigidas.",
          "A aba Plan2 da planilha se preenche sozinha com o que a noiva escreveu nas mesas: é só copiar e colar em “Adicionar vários de uma vez”.",
          "A lista colada agora aceita a mesa (“Mesa 3”): o convidado já entra sentado. Quem já está na lista só muda de mesa, e mesa que ainda não existe é criada.",
          "Dica para a noiva: uma linha por família (“Família Silva”, com adultos e crianças), para sair um convite só com um QR Code.",
        ],
      },
    ],
  },
  {
    id: "2026-10-08-pendencias",
    data: "2026-10-08",
    titulo: "Pendências mais claras e atalhos",
    secoes: [
      {
        titulo: "O que falta, à vista",
        itens: [
          "O cartão da festa e o botão Fornecedores do quadro agora listam cada pendência: sem fornecedor, sem contrato, valor a definir, a pagar e itens do checklist em aberto.",
          "Contrato que ainda não foi enviado passa a contar como pendência (a festa fica amarela até enviar).",
          "No cartão de cada serviço, as linhas “Valor” e “Contrato” ficam em amarelo quando falta preencher, com os botões “Definir valor” e “Enviar PDF ou foto”.",
        ],
      },
      {
        titulo: "Envio dos convites",
        itens: [
          "Na lista de convidados, o botão “Enviar convites em sequência” mostra um convidado por vez com a mensagem pronta: você abre o WhatsApp, envia, volta e já aparece o próximo.",
          "A cada 20 envios ele sugere uma pausa de 5 minutos, para o WhatsApp não limitar a sua conta.",
          "Cada convidado tem uma etiqueta colorida: Não enviado (amarelo), Enviado, Abriu o convite (lilás), Confirmou (verde) ou Não vai.",
          "Filtros na lista de convidados: Não enviados, Enviados sem resposta, Confirmaram, Não vão e Sem WhatsApp, cada um com a quantidade.",
          "Se muitos convites enviados há mais de um dia não forem abertos, aparece um aviso: as mensagens podem não estar chegando.",
        ],
      },
      {
        titulo: "Mais rápido",
        itens: [
          "Ao adicionar um serviço, você já escolhe o fornecedor: depois de escolher o serviço, a lista mostra só os fornecedores dele.",
          "Dentro de cada parte da festa, uma faixa no topo leva direto para as outras (Fornecedores, Convidados, Croqui…), sem voltar ao quadro.",
          "Os botões de adicionar (serviço, mesa, convidado, padrinho…) ficaram com contorno, mais fáceis de achar.",
        ],
      },
      {
        titulo: "Calendário e foto",
        itens: [
          "No calendário, as festas que já passaram aparecem esmaecidas: elas ficam em Festas concluídas.",
          "A foto de fundo da festa aparece mais, com um véu bege mais leve.",
        ],
      },
    ],
  },
  {
    id: "2026-10-07-reuniao",
    data: "2026-10-07",
    titulo: "Versão 2.0",
    secoes: [
      {
        titulo: "Visual",
        itens: [
          "Saíram as linhas de caderno: as folhas agora são lisas, em creme pêssego, sobre um fundo bege.",
          "Cores pastel em todo o painel. Cada parte da festa tem a sua cor: pêssego para fornecedores e cronograma, rosa para a recepção, lilás para a cerimônia.",
          "A sua logo aparece no topo do painel, no login, no convite e nos PDFs. O ícone da aba do navegador agora são as alianças.",
        ],
      },
      {
        titulo: "Página da festa",
        itens: [
          "Os dados da festa ficam numa faixa compacta no topo.",
          "Embaixo, o quadro como o seu kanban: três raias (Fornecedores e cronograma, Recepção, Cerimônia) com um botão para cada parte.",
          "Cada botão fica verde quando está tudo resolvido e amarelo quando tem pendência, com um resumo do que falta.",
          "Dá para subir uma foto dos noivos ou do aniversariante, que fica no fundo da página (botão “Foto”).",
          "Em cada parte tem um botão “Observações”, uma folha em branco para escrever à vontade, com negrito, listas e tarefas. Salva sozinha.",
        ],
      },
      {
        titulo: "Fornecedores",
        itens: [
          "Nova base geral de fornecedores (menu “Fornecedores”): você cadastra uma vez e escolhe em cada festa.",
          "Cada serviço (Buffet, DJ, Decoração…) tem um checklist que já vem pronto na festa, e dá para ajustar.",
          "Valor parcelado: informe em quantas vezes e marque cada parcela paga.",
          "Dá para enviar o arquivo do contrato (PDF ou foto) em cada serviço.",
        ],
      },
      {
        titulo: "Calendário e festas",
        itens: [
          "Calendário no painel: verde se a festa está com tudo resolvido, amarelo se tem pendência.",
          "Botões “Mês” e “Ano”: no ano você vê de uma vez todos os dias já comprometidos.",
          "Os cartões das festas também ficam verdes ou amarelos.",
        ],
      },
      {
        titulo: "Convites",
        itens: [
          "Um convite pode ser de uma família inteira, com um QR Code só. A família escolhe quantas pessoas vão.",
          "Prazo: o convidado pode responder e mudar de ideia até 10 dias antes da festa.",
          "O convite ganhou enfeite, o botão “Como chegar” (abre o mapa) e o seu Instagram e WhatsApp.",
        ],
      },
      {
        titulo: "Recepção e cerimônia",
        itens: [
          "Cronograma e menu ficam juntos. Layout (planta do salão) e Croqui (mesas) ficaram separados.",
          "Novas páginas: Cerimonial, Entradas da cerimônia (ordem do cortejo com música) e Checklist dos padrinhos.",
        ],
      },
      {
        titulo: "Na porta da festa",
        itens: [
          "A família pode entrar em partes: 3 agora e 1 depois, com o mesmo QR.",
          "Quem chega sem mesa pode ser sentado ali mesmo, vendo as mesas com vaga.",
          "Botão “Portaria” na festa: gera um link e um PIN para quem vai ajudar na entrada. Eles só veem o leitor de QR daquela festa, só no dia.",
        ],
      },
      {
        titulo: "Depois da festa",
        itens: [
          "Nas festas concluídas, o botão “PDF completo” gera um arquivo com absolutamente tudo da festa.",
          "Depois de baixar o PDF, os dados são apagados do painel 30 dias após a festa (sem o PDF, em 90 dias). Fica só o nome, a data, o local e os números. Lembre de baixar os contratos antes.",
        ],
      },
    ],
  },
];

export const ULTIMA_NOVIDADE = NOVIDADES[0].id;
