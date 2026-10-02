"use server";

import { revalidatePath } from "next/cache";

import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { obterIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";

export type EstadoResposta = { erro?: string };

// Ação pública (sem login): o token do link é a credencial, então ela passa pelo
// mesmo limite de tentativas da página.
export async function responderConvite(
  token: string,
  resposta: "CONFIRMADO" | "RECUSADO",
): Promise<EstadoResposta> {
  if (resposta !== "CONFIRMADO" && resposta !== "RECUSADO") return { erro: "Resposta inválida." };

  const ip = await obterIp();
  if (await conviteBloqueado(ip)) {
    return { erro: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }
  const convite = await buscarConvite(token);
  if (!convite) {
    await registrarErroConvite(ip);
    return { erro: "Este convite não existe mais. Fale com quem enviou o link." };
  }

  const estado = estadoConvite({ ...convite, dataHora: convite.festa.dataHora });
  if (estado === "presente" || estado === "encerrado") {
    return { erro: "Não dá mais para mudar a resposta deste convite." };
  }

  if (convite.rsvp !== resposta) {
    await prisma.convidado.update({
      where: { id: convite.id },
      data: { rsvp: resposta, respondidoEm: new Date() },
    });
  }
  revalidatePath(`/c/${token}`);
  revalidatePath(`/painel/festas/${convite.festaId}`);
  return {};
}
