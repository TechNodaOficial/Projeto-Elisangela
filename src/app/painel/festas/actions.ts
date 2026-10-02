"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { paraInstante } from "@/lib/datas";
import { exigirUsuario } from "@/lib/dal";
import {
  lerFormularioFesta,
  SchemaFesta,
  type CamposFesta,
  type ErrosFesta,
} from "@/lib/festas/schema";
import { apagarPlanta } from "@/lib/planta/blob";
import { prisma } from "@/lib/prisma";

export type EstadoFormFesta = { erros?: ErrosFesta; valores?: CamposFesta; erroGeral?: string };

function validar(formData: FormData) {
  const valores = lerFormularioFesta(formData);
  const resultado = SchemaFesta.safeParse(valores);
  if (!resultado.success) {
    const erros = Object.fromEntries(
      Object.entries(z.flattenError(resultado.error).fieldErrors).map(([campo, msgs]) => [
        campo,
        msgs?.[0],
      ]),
    ) as ErrosFesta;
    return { ok: false as const, estado: { erros, valores } };
  }
  const { data, hora, ...resto } = resultado.data;
  return { ok: true as const, dados: { ...resto, dataHora: paraInstante(data, hora) } };
}

export async function criarFesta(
  _e: EstadoFormFesta,
  formData: FormData,
): Promise<EstadoFormFesta> {
  await exigirUsuario();
  const v = validar(formData);
  if (!v.ok) return v.estado;

  const festa = await prisma.festa.create({ data: v.dados, select: { id: true } });
  revalidatePath("/painel", "layout");
  redirect(`/painel/festas/${festa.id}`);
}

export async function atualizarFesta(
  id: string,
  _e: EstadoFormFesta,
  formData: FormData,
): Promise<EstadoFormFesta> {
  await exigirUsuario();
  const v = validar(formData);
  if (!v.ok) return v.estado;

  const { count } = await prisma.festa.updateMany({ where: { id }, data: v.dados });
  if (count === 0) {
    return { erroGeral: "Esta festa não existe mais.", valores: lerFormularioFesta(formData) };
  }
  revalidatePath("/painel", "layout");
  redirect(`/painel/festas/${id}`);
}

export async function excluirFesta(id: string) {
  await exigirUsuario();
  const festa = await prisma.festa.findUnique({ where: { id }, select: { plantaUrl: true } });
  // deleteMany não falha se outra aba já excluiu; os convidados saem junto (cascade).
  await prisma.festa.deleteMany({ where: { id } });
  await apagarPlanta(festa?.plantaUrl);
  revalidatePath("/painel", "layout");
  redirect("/painel");
}
