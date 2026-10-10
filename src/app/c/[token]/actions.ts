"use server";

import { revalidatePath } from "next/cache";

import type { FaixaIdade } from "@/lib/convidados/contagem";
import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { erroDoNome, limparNome, PARA_BANCO } from "@/lib/convites/membros";
import { limparMensagem, TAMANHO_MAXIMO_MENSAGEM } from "@/lib/convites/mensagem";
import { erroDePrazo, faseDoConvite } from "@/lib/convites/prazo";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { obterUsuarioLogado } from "@/lib/dal";
import { obterIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";

export type EstadoResposta = { erro?: string };

// Uma pessoa da família que vai: a idade (faixa do buffet) e, com mesas demarcadas, o nome.
export type PessoaResposta = { faixa: FaixaIdade; nome: string };

const FAIXAS: FaixaIdade[] = ["adulto", "4a11", "0a3"];

// Ação pública (sem login): o token do link é a credencial, então ela passa pelo
// mesmo limite de tentativas da página.
// Ao confirmar, a família diz quantas pessoas vão (1 a `pessoas` do convite) e, para cada
// uma, a idade (faixa do buffet) e, se as mesas forem demarcadas, o nome completo.
// Convite de uma pessoa só não manda `pessoas` (conta como adulto, com o nome do convite).
export async function responderConvite(
  token: string,
  resposta: "CONFIRMADO" | "RECUSADO",
  quantas = 1,
  pessoas: PessoaResposta[] = [],
): Promise<EstadoResposta> {
  if (resposta !== "CONFIRMADO" && resposta !== "RECUSADO") return { erro: "Resposta inválida." };
  if (resposta === "CONFIRMADO" && (!Number.isInteger(quantas) || quantas < 1)) {
    return { erro: "Diga quantas pessoas vão." };
  }
  if (
    !Array.isArray(pessoas) ||
    pessoas.length > 50 ||
    !pessoas.every((p) => FAIXAS.includes(p?.faixa) && typeof p.nome === "string")
  ) {
    return { erro: "Confira a idade de cada pessoa." };
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
  const confirmou = resposta === "CONFIRMADO";
  const familia = convite.pessoas > 1;
  // Família: uma pessoa por lugar confirmado, cada uma com a idade (e o nome, se pedido).
  const pedirNomes = familia && convite.festa.mesasDemarcadas;
  if (confirmou && familia) {
    if (pessoas.length !== quantas) return { erro: "Confira a idade de cada pessoa." };
    if (pedirNomes) {
      const erroNome = pessoas.map((p) => erroDoNome(p.nome)).find(Boolean);
      if (erroNome) return { erro: erroNome };
    }
  }
  const contar = (faixa: FaixaIdade) =>
    familia ? pessoas.filter((p) => p.faixa === faixa).length : 0;
  const dados = {
    rsvp: resposta,
    confirmadas: confirmou ? quantas : null,
    criancas4a11: confirmou ? contar("4a11") : null,
    criancas0a3: confirmou ? contar("0a3") : null,
  };
  const nomesNovos = pedirNomes && confirmou;
  if (
    nomesNovos ||
    convite.rsvp !== dados.rsvp ||
    convite.confirmadas !== dados.confirmadas ||
    convite.criancas4a11 !== dados.criancas4a11 ||
    convite.criancas0a3 !== dados.criancas0a3
  ) {
    await prisma.$transaction([
      prisma.convidado.update({
        where: { id: convite.id },
        data: { ...dados, respondidoEm: new Date() },
      }),
      // Nomes: trocados a cada resposta com mesas demarcadas; apagados se desistiu.
      // Sem demarcação, ficam como estavam (se ela desligar e ligar de novo, não se perdem).
      ...(nomesNovos || !confirmou
        ? [prisma.membroConvite.deleteMany({ where: { convidadoId: convite.id } })]
        : []),
      ...(nomesNovos
        ? [
            prisma.membroConvite.createMany({
              data: pessoas.map((p, ordem) => ({
                convidadoId: convite.id,
                ordem,
                nome: limparNome(p.nome),
                faixa: PARA_BANCO[p.faixa],
              })),
            }),
          ]
        : []),
    ]);
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
