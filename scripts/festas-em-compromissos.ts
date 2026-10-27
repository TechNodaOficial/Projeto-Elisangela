// Antes da Agenda do dia, a Elisangela marcava reuniões e afazeres como festas ("Buscar
// Clarinha", "Reunião Lu e Antônio"). Este script passa essas festas para compromissos.
//
// Só entra como candidata a festa "vazia": sem convidados, fornecedores, mesas, cronograma,
// menu, cerimônia, padrinhos, observações, planta, foto, link do cerimonial ou mensagem do
// convite, e não arquivada. Tudo o que ela tem (nome, data, hora, local, endereço, traje,
// link do mapa e observações) cabe no compromisso.
//
// 1. Listar as candidatas (não muda nada):
//      npx tsx scripts/festas-em-compromissos.ts              (banco local, .env)
//      npx tsx scripts/festas-em-compromissos.ts --producao   (Neon, .env.producao)
//
// 2. Converter só as conferidas, pelo id (cria o compromisso e apaga a festa, juntos):
//      npx tsx scripts/festas-em-compromissos.ts --producao --converter <id> <id> ...
//
// Festa que ficou de fora por ter algum dado: ver o que ela tem (não muda nada):
//      npx tsx scripts/festas-em-compromissos.ts --producao --ver "reunião"
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { paraCampos, partesData } from "../src/lib/datas";

const PRODUCAO = process.argv.includes("--producao");
const posicaoVer = process.argv.indexOf("--ver");
const BUSCA = posicaoVer === -1 ? undefined : process.argv[posicaoVer + 1];
const posicao = process.argv.indexOf("--converter");
const IDS =
  posicao === -1 ? [] : process.argv.slice(posicao + 1).filter((a) => !a.startsWith("--"));

const { error } = config({
  path: PRODUCAO ? ".env.producao" : ".env",
  override: true,
  quiet: true,
});
if (error) throw new Error(`Não encontrei o ${PRODUCAO ? ".env.producao" : ".env"}.`);

const url = process.env.DATABASE_URL ?? "";
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!url || local === PRODUCAO) {
  throw new Error(
    PRODUCAO
      ? "Com --producao, o DATABASE_URL do .env.producao não pode ser localhost."
      : "Sem --producao, o script só roda no banco local (DATABASE_URL em localhost).",
  );
}
if (posicao !== -1 && IDS.length === 0) {
  throw new Error("Passe os ids depois de --converter (veja a lista rodando sem --converter).");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Festa sem nada além dos dados do topo.
const VAZIA = {
  convidadosApagadosEm: null,
  plantaUrl: null,
  fotoUrl: null,
  cerimonialLink: null,
  mensagemConvite: null,
  convidados: { none: {} },
  contratacoes: { none: {} },
  mesas: { none: {} },
  cronograma: { none: {} },
  menu: { none: {} },
  entradas: { none: {} },
  checklistCerimonia: { none: {} },
  padrinhos: { none: {} },
  observacoesGerais: { none: {} },
} satisfies Prisma.FestaWhereInput;

const CAMPOS = {
  id: true,
  titulo: true,
  dataHora: true,
  localNome: true,
  endereco: true,
  traje: true,
  linkMapa: true,
  observacoes: true,
} satisfies Prisma.FestaSelect;

type Candidata = Prisma.FestaGetPayload<{ select: typeof CAMPOS }>;

// Mesmos limites do formulário de compromisso (src/lib/agenda/schema.ts).
const cortar = (texto: string, max: number) =>
  texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;

// Local e endereço eram obrigatórios na festa, então ela preenchia qualquer coisa ("mmm",
// "nn", "**"). Texto curto demais, de uma letra repetida ou sem letra nem número é descartado.
function util(texto: string | null): string {
  const t = texto?.trim() ?? "";
  if (t.length < 4 || /^(.)\1*$/i.test(t) || !/[\p{L}\p{N}]/u.test(t)) return "";
  return t;
}

function paraCompromisso(festa: Candidata) {
  const local = util(festa.localNome);
  const endereco = util(festa.endereco);
  const extras = [
    endereco && endereco !== local ? `Endereço: ${endereco}` : "",
    festa.traje ? `Traje: ${festa.traje}` : "",
    festa.linkMapa ? `Mapa: ${festa.linkMapa}` : "",
    festa.observacoes ?? "",
  ].filter(Boolean);
  const observacao = extras.join("\n");
  return {
    dados: {
      titulo: cortar(festa.titulo.trim(), 120),
      inicio: festa.dataHora,
      fim: null,
      local: local ? cortar(local, 120) : null,
      observacao: observacao ? cortar(observacao, 500) : null,
    },
    cortou: festa.titulo.trim().length > 120 || observacao.length > 500,
  };
}

const quando = (d: Date) => {
  const p = partesData(d);
  return `${p.semana} ${p.dia}/${paraCampos(d).data.slice(5, 7)}/${p.ano} ${p.hora}`;
};

async function listar() {
  const festas = await prisma.festa.findMany({
    where: VAZIA,
    orderBy: { dataHora: "asc" },
    select: CAMPOS,
  });
  const banco = PRODUCAO ? "PRODUÇÃO" : "local";
  if (festas.length === 0) {
    console.log(`Nenhuma festa vazia no banco ${banco}.`);
    return;
  }

  console.log(`${festas.length} festas vazias no banco ${banco} (nada foi alterado):\n`);
  for (const f of festas) {
    const { dados: c, cortou } = paraCompromisso(f);
    console.log(`  ${f.id}  ${quando(f.dataHora)}  ${f.titulo}`);
    if (c.local) console.log(`      local: ${c.local}`);
    if (c.observacao) console.log(`      observação: ${c.observacao.replaceAll("\n", " | ")}`);
    if (cortou) console.log("      (passa do limite do compromisso: o texto será encurtado)");
  }
  console.log(
    "\nConfira a lista e tire as festas de verdade. Para converter as que sobrarem:\n" +
      `  npx tsx scripts/festas-em-compromissos.ts${PRODUCAO ? " --producao" : ""} --converter ` +
      festas.map((f) => f.id).join(" "),
  );
}

async function converter() {
  // Tudo ou nada: se alguma festa não existir ou tiver ganhado dados, nada é convertido.
  const convertidas = await prisma.$transaction(async (tx) => {
    const festas = await tx.festa.findMany({
      where: { id: { in: IDS }, ...VAZIA },
      select: CAMPOS,
    });
    const faltando = IDS.filter((id) => !festas.some((f) => f.id === id));
    if (faltando.length > 0) {
      throw new Error(
        `Nada foi convertido. Estas festas não existem ou não estão vazias: ${faltando.join(", ")}`,
      );
    }
    for (const festa of festas) {
      await tx.compromisso.create({ data: paraCompromisso(festa).dados });
      await tx.festa.delete({ where: { id: festa.id } });
    }
    return festas;
  });

  console.log(`${convertidas.length} festas viraram compromissos:`);
  for (const f of convertidas) console.log(`  ${quando(f.dataHora)}  ${f.titulo}`);
}

// Festas com o texto no nome, com a contagem de cada tipo de dado que impede a conversão.
async function ver(busca: string) {
  const festas = await prisma.festa.findMany({
    where: { titulo: { contains: busca, mode: "insensitive" } },
    orderBy: { dataHora: "asc" },
    select: {
      ...CAMPOS,
      plantaUrl: true,
      fotoUrl: true,
      cerimonialLink: true,
      mensagemConvite: true,
      convidadosApagadosEm: true,
      _count: {
        select: {
          convidados: true,
          contratacoes: true,
          mesas: true,
          cronograma: true,
          menu: true,
          entradas: true,
          checklistCerimonia: true,
          padrinhos: true,
          observacoesGerais: true,
        },
      },
    },
  });
  if (festas.length === 0) {
    console.log(`Nenhuma festa com "${busca}" no nome.`);
    return;
  }
  for (const f of festas) {
    const dados = [
      ...Object.entries(f._count)
        .filter(([, n]) => n > 0)
        .map(([tipo, n]) => `${tipo}: ${n}`),
      f.plantaUrl && "planta",
      f.fotoUrl && "foto",
      f.cerimonialLink && "link do cerimonial",
      f.mensagemConvite && "mensagem do convite",
      f.convidadosApagadosEm && "arquivada",
    ].filter(Boolean);
    console.log(`  ${f.id}  ${quando(f.dataHora)}  ${f.titulo}`);
    console.log(`      tem: ${dados.length > 0 ? dados.join(", ") : "nada (está vazia)"}`);
  }
}

(BUSCA !== undefined ? ver(BUSCA) : IDS.length > 0 ? converter() : listar())
  .catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
