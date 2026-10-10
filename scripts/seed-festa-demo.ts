// Festa fictícia completa para testar e demonstrar o painel: fornecedores com valores e
// parcelas, convidados em todos os estados do convite, mesas, cronograma, cerimônia,
// padrinhos e observações. Só roda no banco local (.env); rodar de novo recria a festa.
//
//   npx tsx scripts/seed-festa-demo.ts
import "dotenv/config";

import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type StatusRsvp } from "../src/generated/prisma/client";

const TITULO = "Casamento Beatriz e Rafael";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  throw new Error("Este seed só roda no banco local (DATABASE_URL em localhost).");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const token = () => randomBytes(16).toString("base64url");

// Gerador fixo: a mesma festa sai igual a cada execução.
let semente = 42;
const sorte = () => (semente = (semente * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const telefone = (i: number) => `4399${String(7000000 + i * 7919).slice(0, 7)}`;

// Instante a partir de "AAAA-MM-DD HH:MM" no horário de São Paulo (UTC-3, sem horário de verão).
const sp = (s: string) => new Date(s.replace(" ", "T") + ":00-03:00");

type Fornecido = {
  servico: string;
  fornecedor: string;
  telefone: string;
  valor: number;
  parcelas: number;
  pagas: number;
  feitos: number; // quantos itens do checklist já estão resolvidos
};

const FORNECEDORES: Fornecido[] = [
  {
    servico: "Local",
    fornecedor: "Espaço Villa Toscana",
    telefone: "4333251180",
    valor: 18_500,
    parcelas: 5,
    pagas: 5,
    feitos: 3,
  },
  {
    servico: "Buffet",
    fornecedor: "Sabor & Arte Buffet",
    telefone: "43999120455",
    valor: 32_400,
    parcelas: 6,
    pagas: 4,
    feitos: 5,
  },
  {
    servico: "Decoração",
    fornecedor: "Flor de Lis Decorações",
    telefone: "43998437721",
    valor: 14_800,
    parcelas: 4,
    pagas: 3,
    feitos: 2,
  },
  {
    servico: "Fotografia e vídeo",
    fornecedor: "Lumière Fotografia",
    telefone: "43996610934",
    valor: 9_600,
    parcelas: 3,
    pagas: 2,
    feitos: 2,
  },
  {
    servico: "DJ e som",
    fornecedor: "DJ Léo Martins",
    telefone: "43991578812",
    valor: 4_200,
    parcelas: 2,
    pagas: 1,
    feitos: 1,
  },
  {
    servico: "Bolo e doces",
    fornecedor: "Doce Encanto Confeitaria",
    telefone: "43999802217",
    valor: 3_850,
    parcelas: 1,
    pagas: 0,
    feitos: 2,
  },
  {
    servico: "Celebrante",
    fornecedor: "Pe. Antônio Ferreira",
    telefone: "43998125566",
    valor: 1_200,
    parcelas: 1,
    pagas: 1,
    feitos: 1,
  },
  {
    servico: "Bar e drinks",
    fornecedor: "Mixology Bar Móvel",
    telefone: "43991204478",
    valor: 5_400,
    parcelas: 2,
    pagas: 1,
    feitos: 0,
  },
];

// Itens de checklist para serviços que ainda não existem no banco.
const MODELOS_NOVOS: Record<string, string[]> = {
  Celebrante: ["Confirmar roteiro da cerimônia", "Enviar nomes dos padrinhos", "Ensaio na véspera"],
  "Bar e drinks": [
    "Cardápio de drinks aprovado",
    "Quantidade de gelo",
    "Horário de abertura do bar",
    "Copos e taças",
  ],
};

const SOBRENOMES = [
  "Almeida",
  "Barbosa",
  "Cardoso",
  "Carvalho",
  "Costa",
  "Dias",
  "Fernandes",
  "Gomes",
  "Lima",
  "Martins",
  "Mendes",
  "Moreira",
  "Nogueira",
  "Oliveira",
  "Pereira",
  "Ribeiro",
  "Rocha",
  "Santos",
  "Silva",
  "Souza",
  "Teixeira",
  "Vieira",
  "Yamamoto",
  "Schubert",
  "Tanaka",
  "Moraes",
  "Pinto",
];
const NOMES = [
  "Ana Clara",
  "Bruno",
  "Carolina",
  "Daniel",
  "Eduarda",
  "Felipe",
  "Gabriela",
  "Henrique",
  "Isabela",
  "João Pedro",
  "Juliana",
  "Lucas",
  "Mariana",
  "Matheus",
  "Natália",
  "Otávio",
  "Paula",
  "Rafaela",
  "Renato",
  "Sofia",
  "Tiago",
  "Vanessa",
  "Vinícius",
  "Larissa",
  "Gustavo",
  "Helena",
  "Camila",
  "Diego",
  "Fernanda",
  "Leonardo",
  "Letícia",
  "Marcelo",
  "Patrícia",
  "Rodrigo",
  "Simone",
  "Vitor",
];

function montarConvidados() {
  const lista: { nome: string; pessoas: number }[] = [
    { nome: "Pais da noiva — Sérgio e Cláudia Almeida", pessoas: 2 },
    { nome: "Pais do noivo — Roberto e Márcia Nogueira", pessoas: 2 },
    { nome: "Vó Lurdes", pessoas: 1 },
    { nome: "Vô Antônio e Vó Teresa", pessoas: 2 },
  ];
  let n = 0;
  while (lista.length < 72) {
    const sobrenome = SOBRENOMES[n % SOBRENOMES.length];
    const r = sorte();
    if (r < 0.35) {
      lista.push({ nome: `Família ${sobrenome}`, pessoas: 3 + Math.floor(sorte() * 3) });
    } else if (r < 0.7) {
      const a = NOMES[(n * 5) % NOMES.length];
      const b = NOMES[(n * 5 + 7) % NOMES.length];
      lista.push({ nome: `${a} e ${b} ${sobrenome}`, pessoas: 2 });
    } else {
      lista.push({ nome: `${NOMES[(n * 3) % NOMES.length]} ${sobrenome}`, pessoas: 1 });
    }
    n++;
  }
  return lista;
}

function documento(...blocos: ([string, string] | [string, string[]])[]) {
  return {
    type: "doc",
    content: blocos.map(([tipo, texto]) =>
      tipo === "h2"
        ? { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: texto }] }
        : tipo === "lista"
          ? {
              type: "bulletList",
              content: (texto as string[]).map((t) => ({
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: t }] }],
              })),
            }
          : { type: "paragraph", content: [{ type: "text", text: texto }] },
    ),
  };
}

async function main() {
  const antigas = await prisma.festa.findMany({ where: { titulo: TITULO }, select: { id: true } });
  if (antigas.length) {
    await prisma.festa.deleteMany({ where: { id: { in: antigas.map((f) => f.id) } } });
    console.log(`Festa anterior apagada (${antigas.length}).`);
  }

  const festa = await prisma.festa.create({
    data: {
      titulo: TITULO,
      dataHora: sp("2026-11-21 17:00"),
      localNome: "Espaço Villa Toscana",
      endereco: "Rod. Mábio Gonçalves Palhano, 4100 — Gleba Palhano, Londrina/PR",
      traje: "Esporte fino",
      observacoes: "Noiva chega 17h15. Cerimônia no jardim; se chover, vai para o salão coberto.",
      portariaToken: token(),
      portariaPin: "2611",
    },
  });

  // Serviços, fornecedores e contratações com checklist copiado do modelo.
  const contratacao: Record<string, string> = {};
  for (const f of FORNECEDORES) {
    const servico = await prisma.servico.upsert({
      where: { nome: f.servico },
      update: {},
      create: { nome: f.servico },
    });
    const modelos = await prisma.itemModelo.findMany({
      where: { servicoId: servico.id },
      orderBy: { ordem: "asc" },
    });
    if (modelos.length === 0 && MODELOS_NOVOS[f.servico]) {
      await prisma.itemModelo.createMany({
        data: MODELOS_NOVOS[f.servico].map((texto, ordem) => ({
          servicoId: servico.id,
          texto,
          ordem,
        })),
      });
      modelos.push(
        ...(await prisma.itemModelo.findMany({
          where: { servicoId: servico.id },
          orderBy: { ordem: "asc" },
        })),
      );
    }
    const fornecedor =
      (await prisma.fornecedor.findFirst({
        where: { nome: f.fornecedor, servicoId: servico.id },
      })) ??
      (await prisma.fornecedor.create({
        data: { nome: f.fornecedor, servicoId: servico.id, telefone: f.telefone },
      }));
    const c = await prisma.contratacao.create({
      data: {
        festaId: festa.id,
        servicoId: servico.id,
        fornecedorId: fornecedor.id,
        valorCentavos: f.valor * 100,
        parcelas: f.parcelas,
        parcelasPagas: f.pagas,
        checklist: {
          create: modelos.map((m, i) => ({ texto: m.texto, ordem: i, feito: i < f.feitos })),
        },
      },
    });
    contratacao[f.servico] = c.id;
  }
  // Um serviço ainda sem fornecedor escolhido, como acontece de verdade.
  const lembranca = await prisma.servico.upsert({
    where: { nome: "Lembrancinhas" },
    update: {},
    create: { nome: "Lembrancinhas" },
  });
  await prisma.contratacao.create({ data: { festaId: festa.id, servicoId: lembranca.id } });

  // Mesas: 2 de honra + 16 redondas.
  const mesas = [
    await prisma.mesa.create({
      data: { festaId: festa.id, nome: "Mesa dos noivos e pais", lugares: 8 },
    }),
    await prisma.mesa.create({ data: { festaId: festa.id, nome: "Mesa dos avós", lugares: 6 } }),
  ];
  for (let i = 1; i <= 16; i++) {
    mesas.push(
      await prisma.mesa.create({
        data: { festaId: festa.id, nome: `Mesa ${i}`, lugares: i <= 4 ? 10 : 8 },
      }),
    );
  }
  const livres = new Map(mesas.map((m) => [m.id, m.lugares]));

  // Convidados: maioria já recebeu o convite; alguns abriram sem responder; poucos recusaram.
  const convidados = montarConvidados();
  for (const [i, c] of convidados.entries()) {
    const r = sorte();
    const enviado = i < 66;
    let rsvp: StatusRsvp = "PENDENTE";
    let confirmadas: number | null = null;
    if (enviado && r < 0.68) {
      rsvp = "CONFIRMADO";
      confirmadas = c.pessoas > 2 && sorte() < 0.25 ? c.pessoas - 1 : c.pessoas;
    } else if (enviado && r < 0.78) {
      rsvp = "RECUSADO";
    }
    const enviadoEm = enviado
      ? sp(`2026-09-${String(10 + (i % 12)).padStart(2, "0")} 19:30`)
      : null;
    const aberto = enviado && (rsvp !== "PENDENTE" || sorte() < 0.5);

    // Família e avós vão para as mesas de honra; os outros confirmados preenchem as demais.
    let mesaId: string | null = null;
    if (rsvp === "CONFIRMADO") {
      const ocupa = confirmadas!;
      const preferida = i < 2 ? mesas[0].id : i < 4 ? mesas[1].id : null;
      const candidata =
        preferida ??
        mesas.slice(2).find((m) => (livres.get(m.id) ?? 0) >= ocupa && sorte() < 0.92)?.id;
      if (candidata && (livres.get(candidata) ?? 0) >= ocupa) {
        mesaId = candidata;
        livres.set(candidata, livres.get(candidata)! - ocupa);
      }
    }

    // Idades: famílias de 3+ costumam ter crianças; duas confirmaram sem dizer as idades.
    let criancas4a11: number | null = null;
    let criancas0a3: number | null = null;
    if (rsvp === "CONFIRMADO") {
      const filhos = c.pessoas >= 3 ? Math.max(0, confirmadas! - 2) : 0;
      criancas0a3 = filhos > 0 && sorte() < 0.35 ? 1 : 0;
      criancas4a11 = filhos - criancas0a3;
      if (c.pessoas > 1 && (i === 20 || i === 41)) criancas4a11 = criancas0a3 = null;
    }

    await prisma.convidado.create({
      data: {
        festaId: festa.id,
        nome: c.nome,
        pessoas: c.pessoas,
        telefone: i % 9 === 8 ? null : telefone(i),
        tokenConvite: token(),
        codigoCheckin: token(),
        rsvp,
        confirmadas,
        criancas4a11,
        criancas0a3,
        respondidoEm:
          rsvp === "PENDENTE"
            ? null
            : sp(`2026-09-${String(14 + (i % 14)).padStart(2, "0")} 21:10`),
        enviadoEm,
        abertoEm: aberto ? sp(`2026-09-${String(11 + (i % 12)).padStart(2, "0")} 08:45`) : null,
        mesaId,
      },
    });
  }

  // Cerimônia e festa.
  const cerimonia: [string, string, string | null, string | null][] = [
    ["16:30", "Chegada dos padrinhos e posicionamento", null, "Cerimonialista"],
    ["16:45", "Recepção dos convidados no jardim", null, "Cerimonialista"],
    ["17:00", "Entrada do noivo", "Celebrante", null],
    ["17:15", "Entrada da noiva", null, "Cerimonialista"],
    ["17:40", "Troca de alianças e votos", "Celebrante", null],
    ["17:55", "Saída dos noivos e chuva de pétalas", "Fotografia e vídeo", null],
  ];
  const programa: [string, string, string | null, string | null][] = [
    ["18:00", "Coquetel de boas-vindas", "Buffet", null],
    ["18:00", "Sessão de fotos dos noivos com a família", "Fotografia e vídeo", null],
    ["19:00", "Entrada dos noivos no salão", "DJ e som", null],
    ["19:10", "Primeira dança", "DJ e som", null],
    ["19:30", "Jantar servido", "Buffet", null],
    ["21:00", "Abertura da pista", "DJ e som", null],
    ["22:30", "Corte do bolo e brinde", "Bolo e doces", null],
    ["23:00", "Abertura do bar de drinks autorais", "Bar e drinks", null],
    ["00:30", "Buquê e gravata", null, "Cerimonialista"],
    ["02:00", "Encerramento", null, "Cerimonialista"],
  ];
  await prisma.itemCronograma.createMany({
    data: [
      ...cerimonia.map(([hora, atividade, servico, texto]) => ({
        festaId: festa.id,
        secao: "CERIMONIA" as const,
        hora,
        atividade,
        contratacaoId: servico ? contratacao[servico] : null,
        responsavelTexto: texto,
      })),
      ...programa.map(([hora, atividade, servico, texto]) => ({
        festaId: festa.id,
        secao: "FESTA" as const,
        hora,
        atividade,
        contratacaoId: servico ? contratacao[servico] : null,
        responsavelTexto: texto,
        // O que o buffet serve em cada horário (Bebidas fica sem horário, de propósito).
        etapasMenu:
          atividade === "Coquetel de boas-vindas"
            ? ["Outros"]
            : atividade === "Jantar servido"
              ? ["Entrada", "Prato principal", "Acompanhamentos"]
              : atividade === "Corte do bolo e brinde"
                ? ["Sobremesa"]
                : [],
      })),
    ],
  });

  const menu: [string, string][] = [
    ["Outros", "Coquetel: mini quiche, bruschetta e dadinho de tapioca"],
    ["Entrada", "Salada de folhas com figo, queijo de cabra e nozes"],
    ["Prato principal", "Filé ao molho de vinho tinto com risoto de cogumelos"],
    ["Prato principal", "Opção vegetariana: nhoque de abóbora com sálvia"],
    ["Sobremesa", "Bolo de nozes com doce de leite"],
    ["Sobremesa", "Mesa de doces finos (brigadeiro belga, camafeu, bem-casado)"],
    ["Acompanhamentos", "Arroz com amêndoas e batatas rústicas"],
    ["Bebidas", "Refrigerantes, sucos, água, cerveja e espumante"],
  ];
  await prisma.itemMenu.createMany({
    data: menu.map(([etapa, texto], ordem) => ({ festaId: festa.id, etapa, texto, ordem })),
  });

  const entradas: [string, string][] = [
    ["Celebrante", "Instrumental — Canon in D"],
    ["Noivo com a mãe", "A Thousand Years (instrumental)"],
    ["Padrinhos do noivo", "Perfect — Ed Sheeran"],
    ["Padrinhos da noiva", "Perfect — Ed Sheeran"],
    ["Daminhas e pajem com as alianças", "Here Comes the Sun"],
    ["Noiva com o pai", "Ave Maria — Schubert"],
  ];
  await prisma.entradaCerimonia.createMany({
    data: entradas.map(([quem, musica], ordem) => ({ festaId: festa.id, ordem, quem, musica })),
  });

  const padrinhos = [
    "Camila e Diego Rocha",
    "Fernanda e Gustavo Lima",
    "Letícia e Rodrigo Mendes",
    "Simone e Marcelo Costa",
    "Juliana e Vitor Tanaka",
    "Paula e Leonardo Vieira",
  ];
  // A festa ainda não aconteceu: ninguém marcado como presente.
  await prisma.padrinho.createMany({
    data: padrinhos.map((nome, ordem) => ({
      festaId: festa.id,
      nome,
      ordem,
      telefone: telefone(200 + ordem),
    })),
  });

  await prisma.observacao.createMany({
    data: [
      {
        festaId: festa.id,
        secao: "fornecedores",
        conteudo: documento(
          ["h2", "Combinados"],
          [
            "lista",
            [
              "Buffet monta a partir das 13h; cozinha liberada às 12h.",
              "Decoração precisa do salão vazio até 14h para o arco do jardim.",
              "Última parcela do buffet vence 10/11 — lembrar os noivos.",
            ],
          ],
          ["p", "Fotógrafo pediu refeição para 2 da equipe."],
        ),
      },
      {
        festaId: festa.id,
        secao: "convidados",
        conteudo: documento(
          ["p", "Vó Lurdes usa cadeira de rodas: mesa perto da saída, sem degrau."],
          ["p", "3 convidados veganos e 1 celíaco — avisar o buffet com os nomes das mesas."],
        ),
      },
      {
        festaId: festa.id,
        secao: "cerimonial",
        conteudo: documento(
          ["h2", "Plano B"],
          ["p", "Se chover até 15h, cerimônia passa para o salão coberto. Decoração já sabe."],
          ["p", "Alianças ficam com a cerimonialista até a entrada do pajem."],
        ),
      },
    ],
  });

  const total = convidados.reduce((s, c) => s + c.pessoas, 0);
  console.log(`Festa criada: ${TITULO} (${festa.id})`);
  console.log(
    `  ${FORNECEDORES.length + 1} serviços, ${mesas.length} mesas, ${convidados.length} convites / ${total} pessoas`,
  );
  console.log(`  Portaria: PIN ${festa.portariaPin}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
