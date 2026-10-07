import "server-only";

import { inicioDeHoje } from "@/lib/datas";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import { chaveHorario, compararNomes } from "./formatos";
import { pendenciasDaFesta } from "./pendencias";

export type StatusLista = "pendentes" | "concluidas";

// Pendentes: da mais próxima para a mais distante. Concluídas: da mais recente para a mais antiga.
export async function listarFestas(status: StatusLista) {
  await exigirUsuario();
  const hoje = inicioDeHoje();

  const festas = await prisma.festa.findMany({
    where: status === "pendentes" ? { dataHora: { gte: hoje } } : { dataHora: { lt: hoje } },
    orderBy: { dataHora: status === "pendentes" ? "asc" : "desc" },
    select: {
      id: true,
      titulo: true,
      dataHora: true,
      localNome: true,
      convidadosApagadosEm: true,
      pdfCompletoEm: true,
      resumoConvidados: true,
      resumoConfirmados: true,
      resumoPresentes: true,
      // Para o verde/amarelo do cartão (ver pendenciasDaFesta).
      contratacoes: {
        select: {
          fornecedorId: true,
          valorCentavos: true,
          parcelas: true,
          parcelasPagas: true,
          servico: { select: { nome: true } },
          checklist: { select: { feito: true } },
        },
      },
    },
  });

  // Contagens em pessoas (um convite pode ser de uma família inteira).
  const ids = festas.map((f) => f.id);
  const [todos, confirmados] = await Promise.all([
    prisma.convidado.groupBy({
      by: ["festaId"],
      where: { festaId: { in: ids } },
      _sum: { pessoas: true, entraram: true },
    }),
    prisma.convidado.groupBy({
      by: ["festaId"],
      where: { festaId: { in: ids }, rsvp: "CONFIRMADO" },
      _sum: { confirmadas: true },
    }),
  ]);
  const totaisPorFesta = new Map(todos.map((l) => [l.festaId, l._sum]));
  const confirmadosPorFesta = new Map(confirmados.map((l) => [l.festaId, l._sum.confirmadas]));

  // Festas antigas já não têm convidados (LGPD): valem as contagens guardadas na festa.
  return festas.map(
    ({
      contratacoes,
      convidadosApagadosEm,
      resumoConvidados,
      resumoConfirmados,
      resumoPresentes,
      ...festa
    }) =>
      convidadosApagadosEm
        ? {
            ...festa,
            arquivada: true,
            pendencias: pendenciasDaFesta({ contratacoes }),
            totalConvidados: resumoConvidados ?? 0,
            confirmados: resumoConfirmados ?? 0,
            presentes: resumoPresentes ?? 0,
          }
        : {
            ...festa,
            arquivada: false,
            pendencias: pendenciasDaFesta({ contratacoes }),
            totalConvidados: totaisPorFesta.get(festa.id)?.pessoas ?? 0,
            confirmados: confirmadosPorFesta.get(festa.id) ?? 0,
            presentes: totaisPorFesta.get(festa.id)?.entraram ?? 0,
          },
  );
}

export type FestaResumo = Awaited<ReturnType<typeof listarFestas>>[number];

// Festas entre dois instantes (início incluso, fim não), para o calendário.
export async function listarFestasNoPeriodo(inicio: Date, fim: Date) {
  await exigirUsuario();
  return prisma.festa.findMany({
    where: { dataHora: { gte: inicio, lt: fim } },
    orderBy: { dataHora: "asc" },
    select: {
      id: true,
      titulo: true,
      dataHora: true,
      contratacoes: {
        select: {
          fornecedorId: true,
          valorCentavos: true,
          parcelas: true,
          parcelasPagas: true,
          servico: { select: { nome: true } },
          checklist: { select: { feito: true } },
        },
      },
    },
  });
}

export async function contarFestas() {
  await exigirUsuario();
  const hoje = inicioDeHoje();
  const [pendentes, concluidas] = await Promise.all([
    prisma.festa.count({ where: { dataHora: { gte: hoje } } }),
    prisma.festa.count({ where: { dataHora: { lt: hoje } } }),
  ]);
  return { pendentes, concluidas };
}

export async function buscarFesta(id: string) {
  await exigirUsuario();
  return prisma.festa.findUnique({ where: { id } });
}

// Serviços contratados (com fornecedor e checklist), mesas (com quem senta em cada uma)
// e cronograma de uma festa.
export async function listarColunas(festaId: string) {
  await exigirUsuario();
  const [contratacoes, mesas, cronogramaTodo, menu, entradas, padrinhos] = await Promise.all([
    prisma.contratacao.findMany({
      where: { festaId },
      orderBy: { criadoEm: "asc" },
      select: {
        id: true,
        valorCentavos: true,
        parcelas: true,
        parcelasPagas: true,
        contratoNome: true,
        servico: { select: { id: true, nome: true } },
        fornecedor: { select: { id: true, nome: true, telefone: true } },
        checklist: {
          orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
          select: { id: true, texto: true, feito: true },
        },
      },
    }),
    prisma.mesa.findMany({
      where: { festaId },
      select: {
        id: true,
        nome: true,
        lugares: true,
        convidados: {
          select: { id: true, nome: true, pessoas: true, rsvp: true, confirmadas: true },
        },
      },
    }),
    prisma.itemCronograma.findMany({
      where: { festaId },
      select: {
        id: true,
        secao: true,
        hora: true,
        atividade: true,
        responsavelTexto: true,
        contratacao: {
          select: {
            id: true,
            servico: { select: { nome: true } },
            fornecedor: { select: { nome: true } },
          },
        },
      },
    }),
    prisma.itemMenu.findMany({
      where: { festaId },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      select: { id: true, etapa: true, texto: true },
    }),
    prisma.entradaCerimonia.findMany({
      where: { festaId },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      select: { id: true, quem: true, musica: true },
    }),
    prisma.padrinho.findMany({
      where: { festaId },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      select: {
        id: true,
        nome: true,
        telefone: true,
        checklist: {
          orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
          select: { id: true, texto: true, feito: true },
        },
      },
    }),
  ]);
  const porHorario = (secao: "FESTA" | "CERIMONIA") =>
    cronogramaTodo
      .filter((i) => i.secao === secao)
      .sort((a, b) => chaveHorario(a.hora) - chaveHorario(b.hora));

  return {
    contratacoes: contratacoes.sort((a, b) => compararNomes(a.servico.nome, b.servico.nome)),
    mesas: mesas
      .sort((a, b) => compararNomes(a.nome, b.nome))
      .map((m) => ({
        ...m,
        convidados: m.convidados.sort((a, b) => compararNomes(a.nome, b.nome)),
      })),
    cronograma: porHorario("FESTA"),
    cerimonial: porHorario("CERIMONIA"),
    menu,
    entradas,
    padrinhos,
  };
}

export type Colunas = Awaited<ReturnType<typeof listarColunas>>;

// Serviços com o modelo de checklist e os fornecedores da base geral.
export async function listarServicos() {
  await exigirUsuario();
  const servicos = await prisma.servico.findMany({
    select: {
      id: true,
      nome: true,
      itensModelo: {
        orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
        select: { id: true, texto: true },
      },
      fornecedores: {
        select: {
          id: true,
          nome: true,
          telefone: true,
          _count: { select: { contratacoes: true } },
        },
      },
      _count: { select: { contratacoes: true } },
    },
  });
  return servicos
    .sort((a, b) => compararNomes(a.nome, b.nome))
    .map((s) => ({
      ...s,
      fornecedores: s.fornecedores.sort((a, b) => compararNomes(a.nome, b.nome)),
    }));
}

export type Servicos = Awaited<ReturnType<typeof listarServicos>>;
