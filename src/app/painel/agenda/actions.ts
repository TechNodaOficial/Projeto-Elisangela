"use server";

import { revalidatePath } from "next/cache";

import { CAMPOS_COMPROMISSO, SchemaCompromisso } from "@/lib/agenda/schema";
import { exigirUsuario } from "@/lib/dal";
import { lerCampos, validarForm, type EstadoForm } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";

// Compromissos aparecem na agenda do dia e no calendário do mês.
const atualizar = () => revalidatePath("/painel", "layout");

export async function criarCompromisso(_e: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaCompromisso, lerCampos(formData, CAMPOS_COMPROMISSO));
  if (!v.ok) return v.estado;

  await prisma.compromisso.create({ data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

export async function editarCompromisso(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaCompromisso, lerCampos(formData, CAMPOS_COMPROMISSO));
  if (!v.ok) return v.estado;

  const { count } = await prisma.compromisso.updateMany({ where: { id }, data: v.dados });
  if (count === 0) return { erroGeral: "Este compromisso não existe mais. Recarregue a página." };
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerCompromisso(id: string) {
  await exigirUsuario();
  await prisma.compromisso.deleteMany({ where: { id } });
  atualizar();
}
