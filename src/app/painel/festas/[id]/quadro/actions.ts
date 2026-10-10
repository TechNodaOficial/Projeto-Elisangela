"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import {
  CAMPOS_ENTRADA,
  CAMPOS_ITEM,
  CHECKLIST_CERIMONIA_SUGERIDO,
  CAMPOS_MENU,
  CAMPOS_PADRINHO,
  SchemaEntrada,
  SchemaItem,
  SchemaItemMenu,
  SchemaPadrinho,
} from "@/lib/festas/colunas-schema";
import { lerCampos, validarForm, type EstadoForm } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";

// O quadro da festa mostra resumos e verde/amarelo: atualiza tudo sob /painel.
const atualizar = () => revalidatePath("/painel", "layout");
const NAO_EXISTE = "Este item não existe mais. Recarregue a página.";

const festaExiste = async (festaId: string) =>
  (await prisma.festa.count({ where: { id: festaId } })) > 0;

// Próxima posição numa lista ordenada (fim da fila).
const proxima = (max: number | null | undefined) => (max ?? -1) + 1;

// ── Menu ─────────────────────────────────────────────────────────────────────

export async function criarItemMenu(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItemMenu, lerCampos(formData, CAMPOS_MENU));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };
  const ultimo = await prisma.itemMenu.aggregate({ where: { festaId }, _max: { ordem: true } });

  await prisma.itemMenu.create({
    data: { festaId, ...v.dados, ordem: proxima(ultimo._max.ordem) },
  });
  atualizar();
  // Mantém a etapa escolhida para cadastrar vários itens seguidos da mesma etapa.
  return { sucesso: Date.now(), valores: { etapa: v.dados.etapa, texto: "" } };
}

export async function removerItemMenu(id: string) {
  await exigirUsuario();
  await prisma.itemMenu.deleteMany({ where: { id } });
  atualizar();
}

// ── Entradas da cerimônia ────────────────────────────────────────────────────

export async function criarEntrada(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaEntrada, lerCampos(formData, CAMPOS_ENTRADA));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };
  const ultimo = await prisma.entradaCerimonia.aggregate({
    where: { festaId },
    _max: { ordem: true },
  });

  await prisma.entradaCerimonia.create({
    data: { festaId, ...v.dados, ordem: proxima(ultimo._max.ordem) },
  });
  atualizar();
  return { sucesso: Date.now() };
}

export async function editarEntrada(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaEntrada, lerCampos(formData, CAMPOS_ENTRADA));
  if (!v.ok) return v.estado;
  const { count } = await prisma.entradaCerimonia.updateMany({ where: { id }, data: v.dados });
  if (count === 0) return { erroGeral: NAO_EXISTE };
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerEntrada(id: string) {
  await exigirUsuario();
  await prisma.entradaCerimonia.deleteMany({ where: { id } });
  atualizar();
}

// Sobe (-1) ou desce (+1) uma posição no cortejo, trocando de lugar com a vizinha.
export async function moverEntrada(id: string, direcao: -1 | 1) {
  await exigirUsuario();
  const atual = await prisma.entradaCerimonia.findUnique({
    where: { id },
    select: { festaId: true },
  });
  if (!atual || (direcao !== -1 && direcao !== 1)) return;
  const lista = await prisma.entradaCerimonia.findMany({
    where: { festaId: atual.festaId },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
    select: { id: true },
  });
  const i = lista.findIndex((e) => e.id === id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  // Regrava a ordem inteira: corrige também ordens repetidas de cadastros antigos.
  await prisma.$transaction(
    lista.map((e, ordem) =>
      prisma.entradaCerimonia.update({ where: { id: e.id }, data: { ordem } }),
    ),
  );
  atualizar();
}

// ── Checklist da cerimônia ───────────────────────────────────────────────────

export async function adicionarItemCerimonia(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaItem, lerCampos(formData, CAMPOS_ITEM));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };
  const ultimo = await prisma.itemCerimonia.aggregate({
    where: { festaId },
    _max: { ordem: true },
  });
  await prisma.itemCerimonia.create({
    data: { festaId, texto: v.dados.texto, ordem: proxima(ultimo._max.ordem) },
  });
  atualizar();
  return { sucesso: Date.now() };
}

// Lista vazia: começa pelos itens de sempre (lapelas, buquês, porta-alianças…).
export async function usarChecklistCerimoniaSugerido(festaId: string) {
  await exigirUsuario();
  if (!(await festaExiste(festaId))) return;
  if (await prisma.itemCerimonia.count({ where: { festaId } })) return;
  await prisma.itemCerimonia.createMany({
    data: CHECKLIST_CERIMONIA_SUGERIDO.map((texto, ordem) => ({ festaId, texto, ordem })),
  });
  atualizar();
}

export async function alternarItemCerimonia(id: string) {
  await exigirUsuario();
  const atual = await prisma.itemCerimonia.findUnique({ where: { id }, select: { feito: true } });
  if (!atual) return;
  await prisma.itemCerimonia.update({ where: { id }, data: { feito: !atual.feito } });
  atualizar();
}

export async function removerItemCerimonia(id: string) {
  await exigirUsuario();
  await prisma.itemCerimonia.deleteMany({ where: { id } });
  atualizar();
}

// ── Padrinhos ────────────────────────────────────────────────────────────────

export async function criarPadrinho(
  festaId: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaPadrinho, lerCampos(formData, CAMPOS_PADRINHO));
  if (!v.ok) return v.estado;
  if (!(await festaExiste(festaId))) return { erroGeral: NAO_EXISTE };
  const ultimo = await prisma.padrinho.aggregate({ where: { festaId }, _max: { ordem: true } });

  await prisma.padrinho.create({
    data: {
      festaId,
      ...v.dados,
      ordem: proxima(ultimo._max.ordem),
    },
  });
  atualizar();
  return { sucesso: Date.now() };
}

export async function editarPadrinho(
  id: string,
  _e: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirUsuario();
  const v = validarForm(SchemaPadrinho, lerCampos(formData, CAMPOS_PADRINHO));
  if (!v.ok) return v.estado;
  const { count } = await prisma.padrinho.updateMany({ where: { id }, data: v.dados });
  if (count === 0) return { erroGeral: NAO_EXISTE };
  atualizar();
  return { sucesso: Date.now() };
}

export async function removerPadrinho(id: string) {
  await exigirUsuario();
  await prisma.padrinho.deleteMany({ where: { id } });
  atualizar();
}

// Lista de presença do dia: marca (com a hora) ou desmarca a chegada do padrinho.
export async function alternarPresencaPadrinho(id: string) {
  await exigirUsuario();
  const atual = await prisma.padrinho.findUnique({ where: { id }, select: { presenteEm: true } });
  if (!atual) return;
  await prisma.padrinho.update({
    where: { id },
    data: { presenteEm: atual.presenteEm ? null : new Date() },
  });
  atualizar();
}
