import "server-only";

import { exigirUsuario } from "@/lib/dal";
import { compararNomes } from "@/lib/festas/formatos";
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
      criancas4a11: true,
      criancas0a3: true,
      mensagem: true,
      mensagemEm: true,
      respondidoEm: true,
      respondidoNoPainel: true,
      enviadoEm: true,
      abertoEm: true,
      entraram: true,
      presenteEm: true,
      padrinho: true,
      observacaoConvite: true,
      mesaId: true,
      mesa: { select: { nome: true } },
      membros: { orderBy: { ordem: "asc" }, select: { nome: true, faixa: true } },
    },
  });
  // Ordem alfabética do português (acentos junto da letra base).
  return convidados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export type ConvidadoResumo = Awaited<ReturnType<typeof listarConvidados>>[number];

// Mesas da festa, para escolher a de cada convidado direto na lista.
export async function listarMesas(festaId: string) {
  await exigirUsuario();
  const mesas = await prisma.mesa.findMany({
    where: { festaId },
    select: { id: true, nome: true, lugares: true },
  });
  return mesas.sort((a, b) => compararNomes(a.nome, b.nome));
}

export { contarPorStatus } from "./contagem";
