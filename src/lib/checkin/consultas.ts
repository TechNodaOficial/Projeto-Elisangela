import "server-only";

import { exigirUsuario } from "@/lib/dal";
import { compararNomes } from "@/lib/festas/formatos";
import { prisma } from "@/lib/prisma";

import type { ConvidadoLido } from "./avaliar";

// Festas que fazem sentido no leitor: as de hoje e as próximas. Começa 20h atrás para
// a festa que passa da meia-noite continuar disponível de madrugada.
export async function festasParaCheckin(agora = new Date()) {
  await exigirUsuario();
  return prisma.festa.findMany({
    where: { dataHora: { gte: new Date(agora.getTime() - 20 * 60 * 60 * 1000) } },
    orderBy: { dataHora: "asc" },
    take: 8,
    select: { id: true, titulo: true, dataHora: true, localNome: true },
  });
}

export async function dadosCheckin(festaId: string) {
  await exigirUsuario();
  const festa = await prisma.festa.findUnique({
    where: { id: festaId },
    select: {
      id: true,
      titulo: true,
      dataHora: true,
      convidados: {
        select: {
          id: true,
          nome: true,
          rsvp: true,
          presenteEm: true,
          mesa: { select: { nome: true } },
        },
      },
    },
  });
  if (!festa) return null;
  const convidados = festa.convidados
    .map(({ mesa, ...c }) => ({ ...c, mesa: mesa?.nome ?? null }))
    .sort((a, b) => compararNomes(a.nome, b.nome));
  return { ...festa, convidados };
}

export type DadosCheckin = NonNullable<Awaited<ReturnType<typeof dadosCheckin>>>;

const SELECAO_LEITURA = {
  id: true,
  nome: true,
  festaId: true,
  rsvp: true,
  presenteEm: true,
  festa: { select: { titulo: true } },
  mesa: { select: { nome: true } },
} as const;

type Linha = {
  id: string;
  nome: string;
  festaId: string;
  rsvp: ConvidadoLido["rsvp"];
  presenteEm: Date | null;
  festa: { titulo: string };
  mesa: { nome: string } | null;
};

function paraLido(c: Linha | null): ConvidadoLido | null {
  if (!c) return null;
  const { festa, mesa, ...resto } = c;
  return { ...resto, festaTitulo: festa.titulo, mesa: mesa?.nome ?? null };
}

export async function convidadoPorCodigo(codigo: string) {
  return paraLido(
    await prisma.convidado.findUnique({
      where: { codigoCheckin: codigo },
      select: SELECAO_LEITURA,
    }),
  );
}

export async function convidadoPorId(id: string) {
  return paraLido(await prisma.convidado.findUnique({ where: { id }, select: SELECAO_LEITURA }));
}
