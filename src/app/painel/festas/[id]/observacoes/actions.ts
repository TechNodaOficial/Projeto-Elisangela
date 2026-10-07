"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { exigirUsuario } from "@/lib/dal";
import { documentoValido, ehSecaoObservacao } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

export type ResultadoSalvar = { ok: true; salvoEm: string } | { ok: false; erro: string };

// Salva a folha inteira (o editor manda o documento todo a cada pausa na digitação).
export async function salvarObservacao(
  festaId: string,
  secao: string,
  conteudo: unknown,
): Promise<ResultadoSalvar> {
  await exigirUsuario();
  if (!ehSecaoObservacao(secao)) return { ok: false, erro: "Seção desconhecida." };
  if (!documentoValido(conteudo)) {
    return { ok: false, erro: "Texto grande demais ou inválido para salvar." };
  }
  if (!(await prisma.festa.count({ where: { id: festaId } }))) {
    return { ok: false, erro: "Esta festa não existe mais." };
  }

  // Já validado acima: um documento do editor, só com valores de JSON.
  const json = conteudo as Prisma.InputJsonValue;
  const salvo = await prisma.observacao.upsert({
    where: { festaId_secao: { festaId, secao } },
    create: { festaId, secao, conteudo: json },
    update: { conteudo: json },
    select: { atualizadoEm: true },
  });
  // O botão "Observações" da página da seção mostra se a folha tem texto.
  revalidatePath("/painel/festas/[id]", "layout");
  return { ok: true, salvoEm: salvo.atualizadoEm.toISOString() };
}
