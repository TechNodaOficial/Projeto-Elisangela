"use server";

import { revalidatePath } from "next/cache";

import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { gravarResposta } from "@/lib/convites/gravar-resposta";
import { limparMensagem, TAMANHO_MAXIMO_MENSAGEM } from "@/lib/convites/mensagem";
import { erroDePrazo, faseDoConvite } from "@/lib/convites/prazo";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { erroDoFormato, montarResposta, type PessoaResposta } from "@/lib/convites/resposta";
import { obterUsuarioLogado } from "@/lib/dal";
import { obterIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";

export type EstadoResposta = { erro?: string };

// Ação pública (sem login): o token do link é a credencial, então ela passa pelo
// mesmo limite de tentativas da página. As regras da resposta estão em resposta.ts.
export async function responderConvite(
  token: string,
  resposta: "CONFIRMADO" | "RECUSADO",
  quantas = 1,
  pessoas: PessoaResposta[] = [],
): Promise<EstadoResposta> {
  const erroFormato = erroDoFormato(resposta, quantas, pessoas);
  if (erroFormato) return { erro: erroFormato };

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

  const montada = montarResposta(
    { ...convite, mesasDemarcadas: convite.festa.mesasDemarcadas },
    resposta,
    quantas,
    pessoas,
  );
  if ("erro" in montada) return montada;
  const { dados } = montada;
  if (
    !!montada.membros?.length ||
    // Ela tinha registrado a resposta no painel: agora vale a do próprio convidado.
    convite.respondidoNoPainel ||
    convite.rsvp !== dados.rsvp ||
    convite.confirmadas !== dados.confirmadas ||
    convite.criancas4a11 !== dados.criancas4a11 ||
    convite.criancas0a3 !== dados.criancas0a3
  ) {
    await gravarResposta(convite.id, montada, false);
  }
  revalidatePath(`/c/${token}`);
  revalidatePath(`/painel/festas/${convite.festaId}`);
  return {};
}

// Recado do convidado para quem faz a festa. Texto vazio apaga o recado.
// Vale até o dia da festa (depois, o convite fica só de lembrança).
export async function salvarMensagem(token: string, texto: string): Promise<EstadoResposta> {
  if (typeof texto !== "string") return { erro: "Recado inválido." };
  const mensagem = limparMensagem(texto);
  if (mensagem.length > TAMANHO_MAXIMO_MENSAGEM) {
    return { erro: `Use até ${TAMANHO_MAXIMO_MENSAGEM} caracteres.` };
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
  if (faseDoConvite(convite.festa.dataHora) === "encerrado") {
    return { erro: "Esta festa já aconteceu." };
  }

  await prisma.convidado.update({
    where: { id: convite.id },
    data: { mensagem: mensagem || null, mensagemEm: mensagem ? new Date() : null },
  });
  revalidatePath(`/c/${token}`);
  revalidatePath(`/painel/festas/${convite.festaId}`);
  return {};
}

// O convidado abriu o link no navegador (chamado pela página, depois de carregar: a prévia
// que o WhatsApp monta ao enviar não roda JavaScript e não conta). Só a primeira vez vale,
// e a própria Elisangela conferindo o convite logada no painel não conta.
export async function registrarAbertura(token: string) {
  if (await obterUsuarioLogado()) return;
  const ip = await obterIp();
  if (await conviteBloqueado(ip)) return;
  const convite = await buscarConvite(token);
  if (!convite) {
    await registrarErroConvite(ip);
    return;
  }
  await prisma.convidado.updateMany({
    where: { id: convite.id, abertoEm: null },
    data: { abertoEm: new Date() },
  });
}
