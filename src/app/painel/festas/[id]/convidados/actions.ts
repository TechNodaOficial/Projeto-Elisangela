"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  lerFormularioConvidado,
  SchemaConvidado,
  type CamposConvidado,
  type ErrosConvidado,
} from "@/lib/convidados/schema";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gerarTokensConvidado } from "@/lib/tokens";
import { lerLista, MAXIMO_LINHAS } from "@/lib/convidados/importar";

export type EstadoFormConvidado = {
  erros?: ErrosConvidado;
  valores?: CamposConvidado;
  erroGeral?: string;
  // Muda a cada sucesso, para o formulário de adicionar se limpar e voltar o foco.
  sucesso?: number;
};

function validar(formData: FormData) {
  const valores = lerFormularioConvidado(formData);
  const resultado = SchemaConvidado.safeParse(valores);
  if (!resultado.success) {
    const erros = Object.fromEntries(
      Object.entries(z.flattenError(resultado.error).fieldErrors).map(([campo, msgs]) => [
        campo,
        msgs?.[0],
      ]),
    ) as ErrosConvidado;
    return { ok: false as const, estado: { erros, valores } };
  }
  return { ok: true as const, dados: resultado.data, valores };
}

function atualizarTelas(festaId: string) {
  // O layout mostra contagens e as listas mostram "x de y confirmados".
  revalidatePath("/painel", "layout");
  revalidatePath(`/painel/festas/${festaId}`);
}

export async function adicionarConvidado(
  festaId: string,
  _e: EstadoFormConvidado,
  formData: FormData,
): Promise<EstadoFormConvidado> {
  await exigirUsuario();
  const v = validar(formData);
  if (!v.ok) return v.estado;

  const festa = await prisma.festa.findUnique({ where: { id: festaId }, select: { id: true } });
  if (!festa) return { erroGeral: "Esta festa não existe mais.", valores: v.valores };

  await prisma.convidado.create({ data: { ...v.dados, festaId, ...gerarTokensConvidado() } });
  atualizarTelas(festaId);
  return { sucesso: Date.now() };
}

export async function editarConvidado(
  id: string,
  _e: EstadoFormConvidado,
  formData: FormData,
): Promise<EstadoFormConvidado> {
  await exigirUsuario();
  const v = validar(formData);
  if (!v.ok) return v.estado;

  const convidado = await prisma.convidado.findUnique({
    where: { id },
    select: { festaId: true, confirmadas: true, entraram: true },
  });
  if (!convidado) return { erroGeral: "Este convidado não existe mais.", valores: v.valores };

  // Grupo menor que antes: confirmadas e entradas não passam do novo tamanho.
  const caber = (n: number | null) => (n === null ? null : Math.min(n, v.dados.pessoas));
  await prisma.convidado.update({
    where: { id },
    data: {
      ...v.dados,
      confirmadas: caber(convidado.confirmadas),
      entraram: caber(convidado.entraram) ?? 0,
    },
  });
  atualizarTelas(convidado.festaId);
  return { sucesso: Date.now() };
}

export async function removerConvidado(id: string) {
  await exigirUsuario();
  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return;

  // deleteMany não falha se outra aba já removeu.
  await prisma.convidado.deleteMany({ where: { id } });
  atualizarTelas(convidado.festaId);
}

export type ResultadoImportacao = { adicionados: number; ignorados: number } | { erro: string };

// Vários convidados de uma vez, a partir da lista colada. O texto é lido de novo aqui
// (não confia na prévia do navegador): só entram as linhas sem problema.
export async function importarConvidados(
  festaId: string,
  texto: string,
): Promise<ResultadoImportacao> {
  await exigirUsuario();
  if (typeof texto !== "string" || texto.length > 200_000) {
    return { erro: "Lista grande demais. Cole em partes menores." };
  }
  const festa = await prisma.festa.findUnique({ where: { id: festaId }, select: { id: true } });
  if (!festa) return { erro: "Esta festa não existe mais." };

  const existentes = await prisma.convidado.findMany({
    where: { festaId },
    select: { nome: true, telefone: true },
  });
  const linhas = lerLista(texto, existentes);
  if (linhas.length > MAXIMO_LINHAS) {
    return { erro: `No máximo ${MAXIMO_LINHAS} convites por vez.` };
  }
  const validas = linhas.filter((l) => !l.problema);
  if (validas.length > 0) {
    await prisma.convidado.createMany({
      data: validas.map((l) => ({
        festaId,
        nome: l.nome,
        pessoas: l.pessoas,
        telefone: l.telefone,
        ...gerarTokensConvidado(),
      })),
    });
    atualizarTelas(festaId);
  }
  return { adicionados: validas.length, ignorados: linhas.length - validas.length };
}

// Ela abriu o WhatsApp com o convite: conta como enviado (sai da fila de envio).
// `enviado: false` desfaz, para quando ela abriu mas não chegou a mandar.
export async function marcarEnvio(id: string, enviado: boolean) {
  await exigirUsuario();
  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return;
  await prisma.convidado.updateMany({
    where: { id },
    data: { enviadoEm: enviado ? new Date() : null },
  });
  atualizarTelas(convidado.festaId);
}
