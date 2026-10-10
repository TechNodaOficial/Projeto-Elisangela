"use server";

import { revalidatePath } from "next/cache";

import type { Prisma } from "@/generated/prisma/client";
import { exigirUsuario } from "@/lib/dal";
import { documentoValido, ehSecaoObservacao, SECAO_FALA } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

export type ResultadoSalvar = { ok: true; salvoEm: string } | { ok: false; erro: string };

// Salva a folha inteira (o editor manda o documento todo a cada pausa na digitação).
export async function salvarObservacao(
  festaId: string,
  secao: string,
  conteudo: unknown,
): Promise<ResultadoSalvar> {
  await exigirUsuario();
  if (!ehSecaoObservacao(secao) && secao !== SECAO_FALA) {
    return { ok: false, erro: "Seção desconhecida." };
  }
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

// Link do documento com a fala do cerimonial (Word no OneDrive, Google Docs...).
// Só http(s); vazio apaga o link.
export async function salvarLinkCerimonial(
  festaId: string,
  link: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await exigirUsuario();
  const texto = typeof link === "string" ? link.trim() : "";
  let url: string | null = null;
  if (texto) {
    try {
      const u = new URL(texto);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      url = u.toString();
    } catch {
      return { ok: false, erro: "Cole o link completo do documento (começando com https://)." };
    }
    if (url.length > 2000) return { ok: false, erro: "Link longo demais." };
  }
  const { count } = await prisma.festa.updateMany({
    where: { id: festaId },
    data: { cerimonialLink: url },
  });
  if (count === 0) return { ok: false, erro: "Esta festa não existe mais." };
  revalidatePath("/painel/festas/[id]", "layout");
  return { ok: true };
}
