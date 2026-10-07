import "server-only";

import { prisma } from "@/lib/prisma";

import { pareceToken } from "./estado";

// Página pública: o token do link é a única credencial. Devolve só o que o convidado vê,
// mais o código de check-in dele (vai no QR). Observações da festa ficam de fora.
export async function buscarConvite(token: string) {
  if (!pareceToken(token)) return null;
  return prisma.convidado.findUnique({
    where: { tokenConvite: token },
    select: {
      id: true,
      festaId: true,
      nome: true,
      pessoas: true,
      rsvp: true,
      confirmadas: true,
      entraram: true,
      presenteEm: true,
      codigoCheckin: true,
      festa: {
        select: { titulo: true, dataHora: true, localNome: true, endereco: true, traje: true },
      },
    },
  });
}

export type Convite = NonNullable<Awaited<ReturnType<typeof buscarConvite>>>;
