import "server-only";

import { prisma } from "@/lib/prisma";

import type { RespostaMontada } from "./resposta";

// Grava a resposta montada (resposta.ts) e os nomes de quem vai, de uma vez.
// `noPainel`: foi ela quem registrou, não o convidado pelo link.
export async function gravarResposta(
  convidadoId: string,
  { dados, membros }: RespostaMontada,
  noPainel: boolean,
) {
  await prisma.$transaction([
    prisma.convidado.update({
      where: { id: convidadoId },
      data: { ...dados, respondidoEm: new Date(), respondidoNoPainel: noPainel },
    }),
    ...(membros ? [prisma.membroConvite.deleteMany({ where: { convidadoId } })] : []),
    ...(membros && membros.length > 0
      ? [prisma.membroConvite.createMany({ data: membros.map((m) => ({ ...m, convidadoId })) })]
      : []),
  ]);
}
