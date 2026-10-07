"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import {
  CAMPOS_FORNECEDOR,
  CAMPOS_ITEM,
  CAMPOS_SERVICO,
  SchemaFornecedor,
  SchemaItem,
  SchemaServico,
} from "@/lib/festas/colunas-schema";
import { lerCampos, validarForm, type EstadoForm } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";

// Nomes de fornecedores e serviços aparecem nas festas e no calendário.
const atualizar = () => revalidatePath("/painel", "layout");
const NAO_EXISTE = "Este item não existe mais. Recarregue a página.";
const SERVICO_REPETIDO = "Já existe um serviço com esse nome.";

const servicoExiste = async (id: string) => (await prisma.servico.count({ where: { id } })) > 0;
const nomeEmUso = async (nome: string, foraDe?: string) =>
  (await prisma.servico.count({
    where: {
      nome: { equals: nome, mode: "insensitive" },
      id: foraDe ? { not: foraDe } : undefined,
    },
  })) > 0;

// ── Fornecedores (base geral) ────────────────────────────────────────────────

export async function criarFornecedor(_e: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaFornecedor, lerCampos(formData, CAMPOS_FORNECEDOR));
  if (!v.ok) return v.estado;
  if (!(await servicoExiste(v.dados.servicoId))) return { erroGeral: NAO_EXISTE };

  await prisma.fornecedor.create({ data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

export async function editarFornecedor(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaFornecedor, lerCampos(formData, CAMPOS_FORNECEDOR));
  if (!v.ok) return v.estado;
  const atual = await prisma.fornecedor.findUnique({
    where: { id },
    select: { servicoId: true, _count: { select: { contratacoes: true } } },
  });
  if (!atual || !(await servicoExiste(v.dados.servicoId))) return { erroGeral: NAO_EXISTE };
  // Nas festas ele está ligado ao serviço atual: trocar quebraria essas festas.
  if (atual._count.contratacoes > 0 && atual.servicoId !== v.dados.servicoId) {
    return {
      erroGeral:
        "Este fornecedor já está em festas com o serviço atual; não dá para trocar o serviço.",
      valores: Object.fromEntries(CAMPOS_FORNECEDOR.map((c) => [c, String(formData.get(c) ?? "")])),
    };
  }

  await prisma.fornecedor.update({ where: { id }, data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerFornecedor(id: string) {
  await exigirUsuario();
  // Fornecedor usado em alguma festa não sai (o painel nem oferece a opção).
  await prisma.fornecedor.deleteMany({ where: { id, contratacoes: { none: {} } } });
  atualizar();
}

// ── Serviços e modelos de checklist ──────────────────────────────────────────

export async function criarServico(_e: EstadoForm, formData: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaServico, lerCampos(formData, CAMPOS_SERVICO));
  if (!v.ok) return v.estado;
  if (await nomeEmUso(v.dados.nome)) {
    return { erros: { nome: SERVICO_REPETIDO }, valores: { nome: v.dados.nome } };
  }

  await prisma.servico.create({ data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

export async function renomearServico(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaServico, lerCampos(formData, CAMPOS_SERVICO));
  if (!v.ok) return v.estado;
  if (!(await servicoExiste(id))) return { erroGeral: NAO_EXISTE };
  if (await nomeEmUso(v.dados.nome, id)) {
    return { erros: { nome: SERVICO_REPETIDO }, valores: { nome: v.dados.nome } };
  }

  await prisma.servico.update({ where: { id }, data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerServico(id: string) {
  await exigirUsuario();
  // Só sai se nenhum fornecedor ou festa usar (o painel nem oferece a opção).
  await prisma.servico.deleteMany({
    where: { id, fornecedores: { none: {} }, contratacoes: { none: {} } },
  });
  atualizar();
}

export async function adicionarItemModelo(
  servicoId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItem, lerCampos(formData, CAMPOS_ITEM));
  if (!v.ok) return v.estado;
  if (!(await servicoExiste(servicoId))) return { erroGeral: NAO_EXISTE };
  const ultimo = await prisma.itemModelo.aggregate({
    where: { servicoId },
    _max: { ordem: true },
  });

  await prisma.itemModelo.create({
    data: { servicoId, texto: v.dados.texto, ordem: (ultimo._max.ordem ?? -1) + 1 },
  });
  atualizar();
  return { sucesso: Date.now() };
}

// Mudar o modelo não mexe nas festas que já contrataram o serviço.
export async function removerItemModelo(id: string) {
  await exigirUsuario();
  await prisma.itemModelo.deleteMany({ where: { id } });
  atualizar();
}
