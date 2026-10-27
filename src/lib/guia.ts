// Guia de primeiro acesso do painel, para a equipe da Elisangela: balões que apontam
// onde fica cada coisa, um guia por página. O alvo é um id ("#convidados") ou o valor
// de data-guia ("menu"); sem alvo (ou se ele não estiver na tela), o balão aparece no meio.

export type PassoGuia = {
  alvo?: string;
  titulo: string;
  texto: string;
};

export type Guia = {
  id: string;
  rota: RegExp;
  passos: PassoGuia[];
  // Abre sozinho na primeira visita. O leitor de QR não: no dia, ninguém pode travar a fila.
  abreSozinho: boolean;
  // Páginas de uma parte da festa: começam pela barra de partes e pelas observações,
  // que só aparecem sozinhas na primeira dessas páginas que a pessoa abrir.
  partesDaFesta?: boolean;
};

export const ID_PASSOS_PARTES = "partes-da-festa";

export const PASSOS_PARTES: PassoGuia[] = [
  {
    alvo: "abas",
    titulo: "Partes da festa",
    texto:
      "Esta barra passa de uma parte da festa para outra sem voltar ao quadro. A parte aberta fica destacada.",
  },
  {
    alvo: "observacoes",
    titulo: "Observações",
    texto:
      "Uma folha livre para anotar o que não cabe nos campos desta parte. Salva sozinha enquanto você escreve, e o pontinho mostra que já tem anotação.",
  },
];

const FESTA = String.raw`^/painel/festas/(?!nova(?:/|$))[^/]+`;

const GUIAS: Guia[] = [
  {
    id: "painel",
    rota: /^\/painel$/,
    abreSozinho: true,
    passos: [
      {
        titulo: "Boas-vindas ao painel",
        texto:
          "Aqui ficam todas as festas da Elisangela. Em poucos passos você vê onde fica cada coisa. Em cada página há um guia como este: para rever, clique em “Como usar”, no topo.",
      },
      {
        alvo: "menu",
        titulo: "O menu",
        texto:
          "Festas pendentes são as que ainda vão acontecer; concluídas, as que já passaram. Na Agenda do dia você marca reuniões e compromissos. Em Fornecedores fica a lista usada em todas as festas. O Leitor QR Code é para o dia da festa: lê o convite dos convidados na entrada.",
      },
      {
        alvo: "calendario",
        titulo: "Calendário",
        texto:
          "Mostra os dias com festa. Verde: está tudo resolvido. Amarelo: ainda falta alguma coisa. Em cinza, os compromissos da agenda. Clique no nome da festa para abri-la, no número do dia para ver a agenda dele, ou troque para ver o ano inteiro.",
      },
      {
        alvo: "nova-festa",
        titulo: "Cadastrar uma festa",
        texto:
          "A folha em branco cria uma festa nova: nome, data, hora e local. O resto se preenche depois, dentro da festa.",
      },
      {
        alvo: "festa",
        titulo: "Cada folha é uma festa",
        texto:
          "A cor segue a regra do calendário, e a lista embaixo mostra o que ainda falta. Clique na folha para abrir o quadro da festa.",
      },
      {
        alvo: "novidades",
        titulo: "Novidades",
        texto: "Quando o painel ganha alguma coisa nova, acende um pontinho aqui com a explicação.",
      },
    ],
  },
  {
    id: "festa",
    rota: new RegExp(`${FESTA}$`),
    abreSozinho: true,
    passos: [
      {
        titulo: "O quadro da festa",
        texto:
          "Tudo o que precisa ser feito para esta festa fica nesta página, dividido em três partes. Cada botão abre uma página.",
      },
      {
        alvo: "topo-festa",
        titulo: "Dados da festa",
        texto: "Data, local, traje e observações. Para mudar alguma coisa, use “Editar”.",
      },
      {
        alvo: "quadro",
        titulo: "Verde e amarelo",
        texto:
          "Botão amarelo: falta alguma coisa, e o que falta aparece escrito nele. Verde: pronto. Os outros ainda não foram começados.",
      },
      {
        alvo: "raia-fornecedores",
        titulo: "Fornecedores e cronograma",
        texto:
          "Quem foi contratado para esta festa (escolhido da lista geral de fornecedores), os horários do dia e o menu.",
      },
      {
        alvo: "raia-recepcao",
        titulo: "Recepção",
        texto:
          "A lista de convidados, com os convites e as confirmações; o Layout, que é o desenho do salão; e o Croqui, com as mesas e quem senta em cada uma.",
      },
      {
        alvo: "raia-cerimonia",
        titulo: "Cerimônia",
        texto: "O texto do cerimonial, a ordem das entradas e os padrinhos.",
      },
      {
        alvo: "acoes-festa",
        titulo: "Botões da festa",
        texto:
          "Portaria gera o link que os ajudantes da entrada usam no dia. “PDF do roteiro” é para imprimir no dia, sem valores; “PDF com valores” é o checklist para conferir com os noivos.",
      },
    ],
  },
  {
    id: "festa-fornecedores",
    rota: new RegExp(`${FESTA}/fornecedores$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#fornecedores",
        titulo: "Fornecedores desta festa",
        texto:
          "Cada cartão é um serviço contratado (buffet, DJ, fotografia…), com o fornecedor, o valor, as parcelas pagas, o contrato assinado e o checklist do que combinar. O que está tracejado em amarelo ainda falta preencher.",
      },
      {
        alvo: "adicionar",
        titulo: "Adicionar serviço",
        texto:
          "Escolha o serviço e depois o fornecedor, que vem da lista geral em Fornecedores (no menu). O checklist padrão daquele serviço já vem junto.",
      },
    ],
  },
  {
    id: "festa-cronograma",
    rota: new RegExp(`${FESTA}/cronograma$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#cronograma",
        titulo: "Cronograma",
        texto:
          "Os horários do dia: hora, atividade e o responsável (um fornecedor da festa ou outra pessoa). Cada horário pode ser ligado às etapas do menu servidas nele.",
      },
      {
        alvo: "#menu",
        titulo: "Menu",
        texto:
          "O cardápio, separado por etapa, na ordem em que é servido. Cronograma e menu saem no PDF do roteiro.",
      },
    ],
  },
  {
    id: "festa-convidados",
    rota: new RegExp(`${FESTA}/convidados$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "ficha-convidados",
        titulo: "Resumo da lista",
        texto:
          "Quantos confirmaram, quantos não vão e quantos ainda não responderam; adultos e crianças para passar ao buffet; e como vai o envio. Ligue “Lugar marcado” se as mesas tiverem plaquinha com o nome.",
      },
      {
        alvo: "mensagem-convite",
        titulo: "Mensagem do convite",
        texto:
          "O texto que abre no WhatsApp para cada convidado. O nome e o link de cada um entram sozinhos.",
      },
      {
        alvo: "importar-convidados",
        titulo: "Adicionar convidados",
        texto:
          "Um por vez no formulário logo acima, ou vários de uma vez colando as linhas da planilha. As planilhas modelo são para mandar à noiva preencher.",
      },
      {
        alvo: "envio-sequencia",
        titulo: "Enviar os convites",
        texto:
          "Abre o WhatsApp de cada convidado, um depois do outro, com a mensagem pronta: é só apertar enviar e voltar para cá.",
      },
      {
        alvo: "lista-convidados",
        titulo: "A lista",
        texto:
          "Cada convite (uma pessoa ou uma família) mostra a situação: falta enviar, enviado, abriu, confirmou ou não vai. A mesa se escolhe na própria linha, e no menu ⋯ dá para copiar o link do convite.",
      },
    ],
  },
  {
    id: "festa-layout",
    rota: new RegExp(`${FESTA}/croqui$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#planta",
        titulo: "Layout do salão",
        texto:
          "Envie a imagem da planta do salão, vista de cima (JPG ou PNG). Ela também sai no PDF do roteiro.",
      },
    ],
  },
  {
    id: "festa-croqui",
    rota: new RegExp(`${FESTA}/mesas$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#mesas",
        titulo: "Croqui das mesas",
        texto:
          "Cada cartão é uma mesa. Em “Sentar convidado…” você escolhe quem senta nela, entre os que confirmaram. A idade das crianças fica em destaque, para cadeirão e prato infantil. No dia, o leitor de QR mostra a mesa de cada convidado.",
      },
      {
        alvo: "adicionar",
        titulo: "Adicionar mesa",
        texto: "Crie uma mesa com o nome (ex.: Mesa 1, Mesa dos noivos) e a quantidade de lugares.",
      },
    ],
  },
  {
    id: "festa-cerimonial",
    rota: new RegExp(`${FESTA}/cerimonial$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#cerimonial",
        titulo: "Roteiro da cerimônia",
        texto: "Os horários da cerimônia, do mesmo jeito que o cronograma da festa.",
      },
      {
        alvo: "texto-cerimonial",
        titulo: "Texto do cerimonial",
        texto:
          "A fala da cerimônia: guarde o link do documento ou escreva o texto aqui. O texto escrito sai no PDF do roteiro.",
      },
    ],
  },
  {
    id: "festa-entradas",
    rota: new RegExp(`${FESTA}/entradas$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#entradas",
        titulo: "Ordem das entradas",
        texto: "Quem entra, em que ordem e com qual música. As setas mudam a posição.",
      },
      {
        alvo: "checklist-cerimonia",
        titulo: "Checklist da cerimônia",
        texto:
          "O que precisa estar à mão no cortejo (lapelas, buquês, porta-alianças…). Sai no PDF do roteiro, para marcar à caneta.",
      },
    ],
  },
  {
    id: "festa-padrinhos",
    rota: new RegExp(`${FESTA}/padrinhos$`),
    abreSozinho: true,
    partesDaFesta: true,
    passos: [
      {
        alvo: "#padrinhos",
        titulo: "Padrinhos",
        texto:
          "Cadastre os padrinhos (ou casais de padrinhos). No dia, toque em cada um quando chegar: a lista guarda a hora.",
      },
      {
        alvo: "#pajens",
        titulo: "Pajens e daminhas",
        texto: "Funciona do mesmo jeito, para as crianças do cortejo.",
      },
    ],
  },
  {
    id: "festa-portaria",
    rota: new RegExp(`${FESTA}/portaria$`),
    abreSozinho: true,
    passos: [
      {
        alvo: "portaria",
        titulo: "Link da portaria",
        texto:
          "Gere um link para os ajudantes da entrada: ele abre só o leitor de QR desta festa. Mande o link pelo WhatsApp e fale o PIN pessoalmente, nunca junto com o link.",
      },
    ],
  },
  {
    id: "festa-observacoes",
    rota: new RegExp(`${FESTA}/observacoes/[^/]+$`),
    abreSozinho: true,
    passos: [
      {
        titulo: "Folha de observações",
        texto:
          "Escreva como num documento: títulos, listas, caixinhas de marcar e links. Salva sozinha enquanto você digita.",
      },
    ],
  },
  {
    id: "nova-festa",
    rota: /^\/painel\/festas\/nova$/,
    abreSozinho: true,
    passos: [
      {
        titulo: "Nova festa",
        texto:
          "Preencha nome, data, hora e local. Fornecedores, convidados e o resto se cadastram depois, dentro da festa.",
      },
    ],
  },
  {
    id: "fornecedores",
    rota: /^\/painel\/fornecedores$/,
    abreSozinho: true,
    passos: [
      {
        alvo: "abas-fornecedores",
        titulo: "Lista geral de fornecedores",
        texto:
          "Em Fornecedores ficam os contatos, separados por serviço. Em “Serviços e checklists” fica o checklist que já vem pronto quando o serviço entra numa festa.",
      },
      {
        alvo: "adicionar",
        titulo: "Cadastrar fornecedor",
        texto: "Cadastre uma vez aqui; depois é só escolher o fornecedor dentro de cada festa.",
      },
    ],
  },
  {
    id: "servicos",
    rota: /^\/painel\/fornecedores\/servicos$/,
    abreSozinho: true,
    passos: [
      {
        alvo: "adicionar",
        titulo: "Serviços e checklists",
        texto:
          "Crie um serviço (ex.: Fotografia) e monte o checklist padrão dele. Mudar aqui não altera as festas que já têm o serviço.",
      },
    ],
  },
  {
    id: "concluidas",
    rota: /^\/painel\/concluidas$/,
    abreSozinho: true,
    passos: [
      {
        titulo: "Festas concluídas",
        texto: "No dia seguinte à data, a festa passa para cá sozinha.",
      },
      {
        alvo: "festa",
        titulo: "Baixe o PDF completo",
        texto:
          "Depois da festa, abra-a e baixe o PDF completo. Feito isso, nomes e telefones dos convidados são apagados a partir de uma data (LGPD); os nomes ficam guardados no PDF.",
      },
    ],
  },
  {
    id: "agenda",
    rota: /^\/painel\/agenda$/,
    abreSozinho: true,
    passos: [
      {
        titulo: "Agenda do dia",
        texto:
          "Aqui ficam as festas do dia e os compromissos que você marcar, como reuniões e visitas, na ordem do horário. As setas passam de um dia para outro.",
      },
      {
        alvo: "adicionar",
        titulo: "Marcar compromisso",
        texto:
          "Diga o que é, o dia e o horário. Fim, local e observação são opcionais. Para mudar ou tirar um compromisso, use os três pontinhos da linha.",
      },
    ],
  },
  {
    id: "checkin",
    rota: /^\/painel\/checkin$/,
    abreSozinho: false,
    passos: [
      {
        titulo: "Leitor QR Code",
        texto:
          "No dia da festa, escolha a festa e aponte a câmera para o QR Code do convite de cada convidado. O leitor mostra se ele confirmou e em qual mesa senta.",
      },
    ],
  },
];

// O guia da página atual. Página sem guia próprio (ex.: editar festa) usa o do painel.
export function guiaDaPagina(caminho: string): Guia {
  return GUIAS.find((g) => g.rota.test(caminho)) ?? GUIAS[0];
}

export const CHAVE_GUIA = (id: string) => `guia-visto:${id}`;
