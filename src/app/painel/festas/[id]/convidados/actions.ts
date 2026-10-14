"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  lerFormularioConvidado,
  OBSERVACAO_MAXIMO,
  SchemaConvidado,
  type CamposConvidado,
  type ErrosConvidado,
} from "@/lib/convidados/schema";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gerarTokensConvidado } from "@/lib/tokens";
import { chaveMesa, lerLista, MAXIMO_LINHAS } from "@/lib/convidados/importar";
import { MENSAGEM_MAXIMO, MODELO_PADRAO } from "@/lib/convidados/mensagem";

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

// Mesas com lugar marcado: o convite passa a pedir o nome completo de cada pessoa.
// Desligar não apaga os nomes já informados (só deixa de pedir).
export async function definirMesasDemarcadas(festaId: string, demarcadas: boolean) {
  await exigirUsuario();
  await prisma.festa.updateMany({
    where: { id: festaId },
    data: { mesasDemarcadas: demarcadas === true },
  });
  atualizarTelas(festaId);
  revalidatePath("/c/[token]", "page");
}

// Texto do WhatsApp do convite desta festa. Vazio (ou igual ao padrão) volta ao texto padrão.
export async function salvarMensagemConvite(
  festaId: string,
  texto: string,
): Promise<{ erro?: string }> {
  await exigirUsuario();
  if (typeof texto !== "string") return { erro: "Texto inválido." };
  // O Windows manda \r\n; o WhatsApp e a contagem de caracteres usam \n.
  const limpo = texto.replace(/\r\n?/g, "\n").trim();
  if (limpo.length > MENSAGEM_MAXIMO) {
    return { erro: `Use até ${MENSAGEM_MAXIMO} caracteres.` };
  }
  const { count } = await prisma.festa.updateMany({
    where: { id: festaId },
    data: { mensagemConvite: limpo && limpo !== MODELO_PADRAO ? limpo : null },
  });
  if (count === 0) return { erro: "Esta festa não existe mais." };
  atualizarTelas(festaId);
  return {};
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
  await prisma.$transaction([
    prisma.convidado.update({
      where: { id },
      data: {
        ...v.dados,
        confirmadas: caber(convidado.confirmadas),
        entraram: caber(convidado.entraram) ?? 0,
      },
    }),
    // Nomes de quem não cabe mais no grupo saem também.
    prisma.membroConvite.deleteMany({
      where: { convidadoId: id, ordem: { gte: v.dados.pessoas } },
    }),
  ]);
  atualizarTelas(convidado.festaId);
  return { sucesso: Date.now() };
}

// Observação dela para este convidado, mostrada no convite dele. Vazio apaga.
export async function salvarObservacaoConvite(
  id: string,
  texto: string,
): Promise<{ erro?: string }> {
  await exigirUsuario();
  if (typeof texto !== "string") return { erro: "Texto inválido." };
  const limpo = texto.replace(/\r\n?/g, "\n").trim();
  if (limpo.length > OBSERVACAO_MAXIMO) {
    return { erro: `Use até ${OBSERVACAO_MAXIMO} caracteres.` };
  }
  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return { erro: "Este convidado não existe mais." };
  await prisma.convidado.updateMany({
    where: { id },
    data: { observacaoConvite: limpo || null },
  });
  atualizarTelas(convidado.festaId);
  revalidatePath("/c/[token]", "page");
  return {};
}

// Marca (ou desmarca) o convite como de padrinho: só uma etiqueta na lista.
export async function marcarPadrinho(id: string, padrinho: boolean) {
  await exigirUsuario();
  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return;
  await prisma.convidado.updateMany({ where: { id }, data: { padrinho: padrinho === true } });
  atualizarTelas(convidado.festaId);
}

export async function removerConvidado(id: string) {
  await exigirUsuario();
  const convidado = await prisma.convidado.findUnique({ where: { id }, select: { festaId: true } });
  if (!convidado) return;

  // deleteMany não falha se outra aba já removeu.
  await prisma.convidado.deleteMany({ where: { id } });
  atualizarTelas(convidado.festaId);
}

export type ResultadoImportacao =
  | { adicionados: number; mudaramDeMesa: number; mesasCriadas: number; ignorados: number }
  | { erro: string };

// Mesa nova criada pela lista colada: 10 lugares, como no modelo de croqui da Elisangela
// (ou mais, se a lista já põe mais gente nela). Ela ajusta depois na página Croqui.
const LUGARES_MESA_NOVA = 10;

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
    select: { id: true, nome: true, telefone: true },
  });
  const linhas = lerLista(texto, existentes);
  if (linhas.length > MAXIMO_LINHAS) {
    return { erro: `No máximo ${MAXIMO_LINHAS} convites por vez.` };
  }
  const validas = linhas.filter((l) => !l.problema);
  const novas = validas.filter((l) => l.jaCadastrado === undefined);
  const mudam = validas.filter((l) => l.jaCadastrado !== undefined);

  // Pessoas que a lista põe em cada mesa, pela chave do nome ("MESA 01" = "Mesa 1").
  const pessoasPorMesa = new Map<string, { nome: string; pessoas: number }>();
  for (const l of validas) {
    if (!l.mesa) continue;
    const chave = chaveMesa(l.mesa);
    const atual = pessoasPorMesa.get(chave) ?? { nome: l.mesa, pessoas: 0 };
    pessoasPorMesa.set(chave, { ...atual, pessoas: atual.pessoas + l.pessoas });
  }

  let mesasCriadas = 0;
  if (validas.length > 0) {
    await prisma.$transaction(async (tx) => {
      const mesas = await tx.mesa.findMany({
        where: { festaId },
        select: { id: true, nome: true },
      });
      const idDaMesa = new Map(mesas.map((m) => [chaveMesa(m.nome), m.id]));
      for (const [chave, m] of pessoasPorMesa) {
        if (idDaMesa.has(chave)) continue;
        const criada = await tx.mesa.create({
          data: { festaId, nome: m.nome, lugares: Math.max(LUGARES_MESA_NOVA, m.pessoas) },
          select: { id: true },
        });
        idDaMesa.set(chave, criada.id);
        mesasCriadas++;
      }
      const mesaDe = (l: (typeof validas)[number]) =>
        l.mesa ? (idDaMesa.get(chaveMesa(l.mesa)) ?? null) : null;

      await tx.convidado.createMany({
        data: novas.map((l) => ({
          festaId,
          nome: l.nome,
          pessoas: l.pessoas,
          telefone: l.telefone,
          mesaId: mesaDe(l),
          ...gerarTokensConvidado(),
        })),
      });
      for (const l of mudam) {
        await tx.convidado.update({
          where: { id: existentes[l.jaCadastrado!].id },
          data: { mesaId: mesaDe(l) },
        });
      }
    });
    atualizarTelas(festaId);
  }
  return {
    adicionados: novas.length,
    mudaramDeMesa: mudam.length,
    mesasCriadas,
    ignorados: linhas.length - validas.length,
  };
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
