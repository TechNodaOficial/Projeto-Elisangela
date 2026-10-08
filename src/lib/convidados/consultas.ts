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
      pessoas: true,
      rsvp: true,
      confirmadas: true,
      respondidoEm: true,
      enviadoEm: true,
      abertoEm: true,
      entraram: true,
      presenteEm: true,
      mesaId: true,
      mesa: { select: { nome: true } },
    },
  });
  // Ordem alfabética do português (acentos junto da letra base).
  return convidados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export type ConvidadoResumo = Awaited<ReturnType<typeof listarConvidados>>[number];

export { contarPorStatus } from "./contagem";
