"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import {
  CAMPOS_CRONOGRAMA,
  CAMPOS_FORNECEDOR,
  CAMPOS_MESA,
  SchemaFornecedor,
  SchemaItemCronograma,
  SchemaMesa,
} from "@/lib/festas/colunas-schema";
import { lerCampos, validarForm, type EstadoForm } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";

const atualizar = (festaId: string) => revalidatePath(`/painel/festas/${festaId}`);
const NAO_EXISTE = "Este item não existe mais. Recarregue a página.";

async function festaExiste(festaId: string) {
  return (await prisma.festa.count({ where: { id: festaId } })) > 0;
}

// ── Fornecedores ─────────────────────────────────────────────────────────────

function dadosFornecedor(d: {
  nome: string;
  servico: string;
  telefone: string | null;
  valor: number | null;
}) {
  return { nome: d.nome, servico: d.servico, telefone: d.telefone, valorCentavos: d.valor };
}

export async function criarFornecedor(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaFornecedor, lerCampos(formData, CAMPOS_FORNECEDOR));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };

  await prisma.fornecedor.create({ data: { festaId, ...dadosFornecedor(v.dados) } });
  atualizar(festaId);
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
  const atual = await prisma.fornecedor.findUnique({ where: { id }, select: { festaId: true } });
  if (!atual) return { erroGeral: NAO_EXISTE };

  await prisma.fornecedor.update({ where: { id }, data: dadosFornecedor(v.dados) });
  atualizar(atual.festaId);
  return { sucesso: Date.now() };
}

export async function alternarPagamento(id: string) {
  await exigirUsuario();
  const atual = await prisma.fornecedor.findUnique({
    where: { id },
    select: { festaId: true, pago: true },
  });
  if (!atual) return;
  await prisma.fornecedor.update({ where: { id }, data: { pago: !atual.pago } });
  atualizar(atual.festaId);
}

export async function removerFornecedor(id: string) {
  await exigirUsuario();
  const atual = await prisma.fornecedor.findUnique({ where: { id }, select: { festaId: true } });
  if (!atual) return;
  // Itens do cronograma ligados a ele ficam sem responsável (onDelete: SetNull).
  await prisma.fornecedor.deleteMany({ where: { id } });
  atualizar(atual.festaId);
}

// ── Mesas ────────────────────────────────────────────────────────────────────

export async function criarMesa(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaMesa, lerCampos(formData, CAMPOS_MESA));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };

  await prisma.mesa.create({ data: { festaId, ...v.dados } });
  atualizar(festaId);
  return { sucesso: Date.now() };
}

export async function editarMesa(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaMesa, lerCampos(formData, CAMPOS_MESA));
  if (!v.ok) return v.estado;
  const atual = await prisma.mesa.findUnique({ where: { id }, select: { festaId: true } });
  if (!atual) return { erroGeral: NAO_EXISTE };

  await prisma.mesa.update({ where: { id }, data: v.dados });
  atualizar(atual.festaId);
  return { sucesso: Date.now() };
}

export async function removerMesa(id: string) {
  await exigirUsuario();
  const atual = await prisma.mesa.findUnique({ where: { id }, select: { festaId: true } });
  if (!atual) return;
  // Os convidados da mesa ficam sem mesa (onDelete: SetNull).
  await prisma.mesa.deleteMany({ where: { id } });
  atualizar(atual.festaId);
}

// Põe o convidado na mesa (ou tira, com mesaId vazio). Os dois precisam ser da mesma festa.
export async function definirMesa(convidadoId: string, mesaId: string | null) {
  await exigirUsuario();
  const convidado = await prisma.convidado.findUnique({
    where: { id: convidadoId },
    select: { festaId: true },
  });
  if (!convidado) return;
  if (mesaId) {
    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId }, select: { festaId: true } });
    if (!mesa || mesa.festaId !== convidado.festaId) return;
  }
  await prisma.convidado.update({ where: { id: convidadoId }, data: { mesaId } });
  atualizar(convidado.festaId);
}

export async function sentarConvidado(mesaId: string, formData: FormData) {
  const convidadoId = String(formData.get("convidadoId") ?? "");
  if (convidadoId) await definirMesa(convidadoId, mesaId);
}

// ── Cronograma ───────────────────────────────────────────────────────────────

async function fornecedorDaFesta(fornecedorId: string | null, festaId: string) {
  if (!fornecedorId) return true;
  const f = await prisma.fornecedor.findUnique({
    where: { id: fornecedorId },
    select: { festaId: true },
  });
  return f?.festaId === festaId;
}

export async function criarItemCronograma(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItemCronograma, lerCampos(formData, CAMPOS_CRONOGRAMA));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId)) || !(await fornecedorDaFesta(v.dados.fornecedorId, festaId))) {
    return { erroGeral: NAO_EXISTE };
  }

  await prisma.itemCronograma.create({ data: { festaId, ...v.dados } });
  atualizar(festaId);
  return { sucesso: Date.now() };
}

export async function editarItemCronograma(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItemCronograma, lerCampos(formData, CAMPOS_CRONOGRAMA));
  if (!v.ok) return v.estado;
  const atual = await prisma.itemCronograma.findUnique({
    where: { id },
    select: { festaId: true },
  });
  if (!atual || !(await fornecedorDaFesta(v.dados.fornecedorId, atual.festaId))) {
    return { erroGeral: NAO_EXISTE };
  }

  await prisma.itemCronograma.update({ where: { id }, data: v.dados });
  atualizar(atual.festaId);
  return { sucesso: Date.now() };
}

export async function removerItemCronograma(id: string) {
  await exigirUsuario();
  const atual = await prisma.itemCronograma.findUnique({
    where: { id },
    select: { festaId: true },
  });
  if (!atual) return;
  await prisma.itemCronograma.deleteMany({ where: { id } });
  atualizar(atual.festaId);
}
