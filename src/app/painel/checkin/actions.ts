"use server";

import { revalidatePath } from "next/cache";

import { avaliarLeitura, type ResultadoLeitura } from "@/lib/checkin/avaliar";
import { convidadoPorCodigo, convidadoPorId } from "@/lib/checkin/consultas";
import { pareceToken } from "@/lib/convites/estado";
import { exigirAcessoLeitor } from "@/lib/portaria/sessao";
import { prisma } from "@/lib/prisma";

function atualizar(festaId: string) {
  revalidatePath("/painel/checkin");
  revalidatePath(`/painel/festas/${festaId}`);
  // O leitor dos ajudantes, no link da portaria.
  revalidatePath("/portaria/[token]", "page");
}

// Registra a entrada de todos os que faltam do grupo, se a regra liberar (na tela dá para
// ajustar, se entraram menos). O update só vale se ninguém registrou entre a leitura e
// agora: com dois celulares na porta, o segundo a ler o mesmo QR vê o número atualizado.
async function registrar(
  festaId: string,
  buscar: () => ReturnType<typeof convidadoPorId>,
  opcoes?: { deixarEntrar?: boolean },
): Promise<ResultadoLeitura> {
  const resultado = avaliarLeitura(await buscar(), festaId, opcoes);
  if (resultado.tipo !== "liberado") return resultado;

  const { count } = await prisma.convidado.updateMany({
    where: { id: resultado.id, festaId, entraram: resultado.antes },
    data: { entraram: resultado.antes + resultado.entrando, presenteEm: new Date() },
  });
  if (count === 0) return avaliarLeitura(await buscar(), festaId, opcoes);
  atualizar(festaId);
  return resultado;
}

// O QR leva só o código de check-in (src/lib/convites/qr.ts).
// Todas as ações do leitor: a Elisangela ou um ajudante da portaria DESTA festa.
export async function lerQr(festaId: string, codigo: string): Promise<ResultadoLeitura> {
  await exigirAcessoLeitor(festaId);
  const limpo = codigo.trim();
  if (!pareceToken(limpo)) return { tipo: "desconhecido" };
  return registrar(festaId, () => convidadoPorCodigo(limpo));
}

// Busca pelo nome, ou "Deixar entrar" na tela de atenção.
export async function registrarConvidado(
  festaId: string,
  convidadoId: string,
  deixarEntrar: boolean,
): Promise<ResultadoLeitura> {
  await exigirAcessoLeitor(festaId);
  return registrar(festaId, () => convidadoPorId(convidadoId), { deixarEntrar });
}

// Corrige quantas pessoas do grupo entraram ao todo: "entraram só 3", "desfazer" (volta
// ao número de antes) ou "apagar entradas" (0).
export async function ajustarEntrada(festaId: string, convidadoId: string, entraram: number) {
  await exigirAcessoLeitor(festaId);
  const convidado = await prisma.convidado.findUnique({
    where: { id: convidadoId },
    select: { festaId: true, pessoas: true, entraram: true, presenteEm: true },
  });
  if (!convidado || convidado.festaId !== festaId || !Number.isInteger(entraram)) return;
  const total = Math.max(0, Math.min(entraram, convidado.pessoas));
  await prisma.convidado.update({
    where: { id: convidadoId },
    data: {
      entraram: total,
      presenteEm: total === 0 ? null : (convidado.presenteEm ?? new Date()),
    },
  });
  atualizar(festaId);
}

// Senta o convidado que está entrando numa mesa (ou troca), pela tela da porta.
// Mesa e convidado precisam ser desta festa.
export async function sentarNaPorta(festaId: string, convidadoId: string, mesaId: string) {
  await exigirAcessoLeitor(festaId);
  const [convidado, mesa] = await Promise.all([
    prisma.convidado.findUnique({ where: { id: convidadoId }, select: { festaId: true } }),
    prisma.mesa.findUnique({ where: { id: mesaId }, select: { festaId: true } }),
  ]);
  if (convidado?.festaId !== festaId || mesa?.festaId !== festaId) return;
  await prisma.convidado.update({ where: { id: convidadoId }, data: { mesaId } });
  revalidatePath("/painel", "layout");
  revalidatePath("/portaria/[token]", "page");
}
