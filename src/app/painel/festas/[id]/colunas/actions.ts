"use server";

import { revalidatePath } from "next/cache";

import { nomeDoContrato, TAMANHO_MAXIMO_CONTRATO, tipoDoContrato } from "@/lib/contratos/arquivo";
import { apagarContratos, guardarContrato } from "@/lib/contratos/blob";
import { exigirUsuario } from "@/lib/dal";
import {
  CAMPOS_CONTRATACAO,
  CAMPOS_CRONOGRAMA,
  CAMPOS_ITEM,
  CAMPOS_MESA,
  CAMPOS_NOVA_CONTRATACAO,
  ETAPAS_MENU,
  SchemaContratacao,
  SchemaItem,
  SchemaItemCronograma,
  SchemaMesa,
  SchemaNovaContratacao,
} from "@/lib/festas/colunas-schema";
import { lerCampos, validarForm, type EstadoForm } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";

// O calendário do painel mostra se os fornecedores estão pagos: atualiza tudo sob /painel.
const atualizar = () => revalidatePath("/painel", "layout");
const NAO_EXISTE = "Este item não existe mais. Recarregue a página.";

async function festaExiste(festaId: string) {
  return (await prisma.festa.count({ where: { id: festaId } })) > 0;
}

// ── Serviços contratados (fornecedores da festa) ─────────────────────────────

// Contrata um serviço na festa, já com o checklist do modelo daquele serviço.
export async function contratarServico(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaNovaContratacao, lerCampos(formData, CAMPOS_NOVA_CONTRATACAO));
  if (!v.ok) return v.estado;
  const servico = await prisma.servico.findUnique({
    where: { id: v.dados.servicoId },
    select: { itensModelo: { select: { texto: true, ordem: true } } },
  });
  if (!servico || !(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };
  if (v.dados.fornecedorId) {
    const f = await prisma.fornecedor.findUnique({
      where: { id: v.dados.fornecedorId },
      select: { servicoId: true },
    });
    if (f?.servicoId !== v.dados.servicoId) return { erroGeral: NAO_EXISTE };
  }

  await prisma.contratacao.create({
    data: {
      festaId,
      servicoId: v.dados.servicoId,
      fornecedorId: v.dados.fornecedorId,
      checklist: { create: servico.itensModelo.map(({ texto, ordem }) => ({ texto, ordem })) },
    },
  });
  atualizar();
  return { sucesso: Date.now() };
}

// Escolhe o fornecedor (da base, do mesmo serviço) e o valor.
export async function editarContratacao(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaContratacao, lerCampos(formData, CAMPOS_CONTRATACAO));
  if (!v.ok) return v.estado;
  const atual = await prisma.contratacao.findUnique({
    where: { id },
    select: { servicoId: true, parcelasPagas: true },
  });
  if (!atual) return { erroGeral: NAO_EXISTE };
  if (v.dados.fornecedorId) {
    const f = await prisma.fornecedor.findUnique({
      where: { id: v.dados.fornecedorId },
      select: { servicoId: true },
    });
    if (f?.servicoId !== atual.servicoId) return { erroGeral: NAO_EXISTE };
  }

  await prisma.contratacao.update({
    where: { id },
    data: {
      fornecedorId: v.dados.fornecedorId,
      valorCentavos: v.dados.valor,
      parcelas: v.dados.parcelas,
      // Menos parcelas que as já pagas: fica tudo pago.
      parcelasPagas: Math.min(atual.parcelasPagas, v.dados.parcelas),
    },
  });
  atualizar();
  return { sucesso: Date.now() };
}

// Quantas parcelas já foram pagas (0 a parcelas).
export async function definirParcelasPagas(id: string, pagas: number) {
  await exigirUsuario();
  const atual = await prisma.contratacao.findUnique({ where: { id }, select: { parcelas: true } });
  if (!atual || !Number.isInteger(pagas)) return;
  await prisma.contratacao.update({
    where: { id },
    data: { parcelasPagas: Math.max(0, Math.min(pagas, atual.parcelas)) },
  });
  atualizar();
}

export async function removerContratacao(id: string) {
  await exigirUsuario();
  const atual = await prisma.contratacao.findUnique({
    where: { id },
    select: { contratoUrl: true },
  });
  // O checklist vai junto; itens do cronograma ligados a ele ficam sem responsável.
  await prisma.contratacao.deleteMany({ where: { id } });
  await apagarContratos([atual?.contratoUrl]);
  atualizar();
}

// ── Contrato ─────────────────────────────────────────────────────────────────

export type EstadoContrato = { erro?: string; sucesso?: number };

export async function enviarContrato(
  contratacaoId: string,
  _e: EstadoContrato,
  formData: FormData,
): Promise<EstadoContrato> {
  await exigirUsuario();
  const arquivo = formData.get("contrato");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha o arquivo." };
  if (arquivo.size > TAMANHO_MAXIMO_CONTRATO) {
    return { erro: "Arquivo grande demais (máximo 4 MB). Tente um PDF menor ou uma foto." };
  }
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const tipo = tipoDoContrato(bytes);
  if (!tipo) return { erro: "Envie o contrato em PDF, JPG ou PNG." };

  const atual = await prisma.contratacao.findUnique({
    where: { id: contratacaoId },
    select: { contratoUrl: true },
  });
  if (!atual) return { erro: NAO_EXISTE };

  const url = await guardarContrato(contratacaoId, bytes, tipo);
  await prisma.contratacao.update({
    where: { id: contratacaoId },
    data: { contratoUrl: url, contratoNome: nomeDoContrato(arquivo.name, tipo) },
  });
  await apagarContratos([atual.contratoUrl]);
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerContrato(contratacaoId: string) {
  await exigirUsuario();
  const atual = await prisma.contratacao.findUnique({
    where: { id: contratacaoId },
    select: { contratoUrl: true },
  });
  if (!atual?.contratoUrl) return;
  await prisma.contratacao.update({
    where: { id: contratacaoId },
    data: { contratoUrl: null, contratoNome: null },
  });
  await apagarContratos([atual.contratoUrl]);
  atualizar();
}

// ── Checklist de um serviço contratado ───────────────────────────────────────

export async function adicionarItemChecklist(
  contratacaoId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItem, lerCampos(formData, CAMPOS_ITEM));
  if (!v.ok) return v.estado;
  const ultimo = await prisma.itemChecklist.aggregate({
    where: { contratacaoId },
    _max: { ordem: true },
  });
  if (!(await prisma.contratacao.count({ where: { id: contratacaoId } }))) {
    return { erroGeral: NAO_EXISTE };
  }

  await prisma.itemChecklist.create({
    data: { contratacaoId, texto: v.dados.texto, ordem: (ultimo._max.ordem ?? -1) + 1 },
  });
  atualizar();
  return { sucesso: Date.now() };
}

export async function alternarItemChecklist(id: string) {
  await exigirUsuario();
  const atual = await prisma.itemChecklist.findUnique({ where: { id }, select: { feito: true } });
  if (!atual) return;
  await prisma.itemChecklist.update({ where: { id }, data: { feito: !atual.feito } });
  atualizar();
}

export async function removerItemChecklist(id: string) {
  await exigirUsuario();
  await prisma.itemChecklist.deleteMany({ where: { id } });
  atualizar();
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
  atualizar();
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
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerMesa(id: string) {
  await exigirUsuario();
  const atual = await prisma.mesa.findUnique({ where: { id }, select: { festaId: true } });
  if (!atual) return;
  // Os convidados da mesa ficam sem mesa (onDelete: SetNull).
  await prisma.mesa.deleteMany({ where: { id } });
  atualizar();
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
  atualizar();
}

export async function sentarConvidado(mesaId: string, formData: FormData) {
  const convidadoId = String(formData.get("convidadoId") ?? "");
  if (convidadoId) await definirMesa(convidadoId, mesaId);
}

// ── Cronograma ───────────────────────────────────────────────────────────────

async function contratacaoDaFesta(contratacaoId: string | null, festaId: string) {
  if (!contratacaoId) return true;
  const c = await prisma.contratacao.findUnique({
    where: { id: contratacaoId },
    select: { festaId: true },
  });
  return c?.festaId === festaId;
}

// Cronograma da festa ou roteiro da cerimônia (cerimonial).
export async function criarItemCronograma(
  festaId: string,
  secao: "FESTA" | "CERIMONIA",
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItemCronograma, lerCampos(formData, CAMPOS_CRONOGRAMA));
  if (!v.ok) return v.estado;
  if (
    !(await festaExiste(festaId)) ||
    !(await contratacaoDaFesta(v.dados.contratacaoId, festaId))
  ) {
    return { erroGeral: NAO_EXISTE };
  }

  if (secao !== "FESTA" && secao !== "CERIMONIA") return { erroGeral: NAO_EXISTE };
  await prisma.itemCronograma.create({ data: { festaId, secao, ...v.dados } });
  atualizar();
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
  if (!atual || !(await contratacaoDaFesta(v.dados.contratacaoId, atual.festaId))) {
    return { erroGeral: NAO_EXISTE };
  }

  await prisma.itemCronograma.update({ where: { id }, data: v.dados });
  atualizar();
  return { sucesso: Date.now() };
}

// Etapas do menu servidas num horário do cronograma (ex.: 19:30 → Entrada e Prato
// principal). Guarda na ordem do menu e ignora o que não for etapa conhecida.
export async function definirEtapasMenu(id: string, etapas: string[]) {
  await exigirUsuario();
  if (!Array.isArray(etapas)) return;
  const validas = ETAPAS_MENU.filter((e) => etapas.includes(e));
  await prisma.itemCronograma.updateMany({ where: { id }, data: { etapasMenu: validas } });
  atualizar();
}

export async function removerItemCronograma(id: string) {
  await exigirUsuario();
  const atual = await prisma.itemCronograma.findUnique({
    where: { id },
    select: { festaId: true },
  });
  if (!atual) return;
  await prisma.itemCronograma.deleteMany({ where: { id } });
  atualizar();
}
