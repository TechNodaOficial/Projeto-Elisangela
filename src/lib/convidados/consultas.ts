import "server-only";

import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// O código do QR (codigoCheckin) nunca sai daqui: o painel não precisa dele.
export async function listarConvidados(festaId: string) {
  await exigirUsuario();
  const convidados = await prisma.convidado.findMany({
    where: { festaId },
    select: {
      id: true,
      nome: true,
      telefone: true,
      tokenConvite: true,
      rsvp: true,
      respondidoEm: true,
      presenteEm: true,
    },
  });
  // Ordem alfabética do português (acentos junto da letra base).
  return convidados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export type ConvidadoResumo = Awaited<ReturnType<typeof listarConvidados>>[number];

export function contarPorStatus(convidados: ConvidadoResumo[]) {
  return {
    total: convidados.length,
    confirmados: convidados.filter((c) => c.rsvp === "CONFIRMADO").length,
    recusados: convidados.filter((c) => c.rsvp === "RECUSADO").length,
    aguardando: convidados.filter((c) => c.rsvp === "PENDENTE").length,
    presentes: convidados.filter((c) => c.presenteEm).length,
  };
}
