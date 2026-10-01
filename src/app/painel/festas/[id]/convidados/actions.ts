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

  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return { erroGeral: "Este convidado não existe mais.", valores: v.valores };

  await prisma.convidado.update({ where: { id }, data: v.dados });
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
