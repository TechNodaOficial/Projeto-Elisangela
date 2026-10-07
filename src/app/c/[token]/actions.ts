"use server";

import { revalidatePath } from "next/cache";

import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { erroDePrazo, faseDoConvite } from "@/lib/convites/prazo";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { obterIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";

export type EstadoResposta = { erro?: string };

// Ação pública (sem login): o token do link é a credencial, então ela passa pelo
// mesmo limite de tentativas da página.
// Ao confirmar, a família diz quantas pessoas vão (1 a `pessoas` do convite).
export async function responderConvite(
  token: string,
  resposta: "CONFIRMADO" | "RECUSADO",
  quantas = 1,
): Promise<EstadoResposta> {
  if (resposta !== "CONFIRMADO" && resposta !== "RECUSADO") return { erro: "Resposta inválida." };
  if (resposta === "CONFIRMADO" && (!Number.isInteger(quantas) || quantas < 1)) {
    return { erro: "Diga quantas pessoas vão." };
  }

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

  // Prazos: responder até 30 dias antes; mudar até 10 dias antes; depois, só desistir/diminuir.
  const foraDoPrazo = erroDePrazo(
    convite,
    resposta,
    quantas,
    faseDoConvite(convite.festa.dataHora),
  );
  if (foraDoPrazo) return { erro: foraDoPrazo };
  if (resposta === "CONFIRMADO" && quantas > convite.pessoas) {
    return { erro: `Este convite é para até ${convite.pessoas} pessoas.` };
  }
  // Parte da família já entrou: não dá para desistir nem confirmar menos que isso.
  if (convite.entraram > 0 && (resposta === "RECUSADO" || quantas < convite.entraram)) {
    return { erro: `${convite.entraram} pessoas deste convite já entraram na festa.` };
  }
  const confirmadas = resposta === "CONFIRMADO" ? quantas : null;
  if (convite.rsvp !== resposta || convite.confirmadas !== confirmadas) {
    await prisma.convidado.update({
      where: { id: convite.id },
      data: { rsvp: resposta, confirmadas, respondidoEm: new Date() },
    });
  }
  revalidatePath(`/c/${token}`);
  revalidatePath(`/painel/festas/${convite.festaId}`);
  return {};
}
