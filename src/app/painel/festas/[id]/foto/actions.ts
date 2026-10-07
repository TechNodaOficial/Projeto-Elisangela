"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import { apagarFoto, guardarFoto } from "@/lib/festas/foto";
import { lerImagem } from "@/lib/planta/imagem";
import { TAMANHO_MAXIMO_PLANTA } from "@/lib/planta/limites";
import { prisma } from "@/lib/prisma";

export type EstadoFoto = { erro?: string; sucesso?: number };

// O navegador já reduz a foto antes de enviar (ver botao-foto.tsx); aqui só conferimos.
export async function enviarFoto(
  festaId: string,
  _e: EstadoFoto,
  formData: FormData,
): Promise<EstadoFoto> {
  await exigirUsuario();
  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha uma foto." };
  if (arquivo.size > TAMANHO_MAXIMO_PLANTA) {
    return { erro: "Foto grande demais. Tente uma versão menor." };
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const info = lerImagem(bytes);
  if (!info) return { erro: "Não consegui ler esta foto. Envie em JPG ou PNG." };

  const festa = await prisma.festa.findUnique({
    where: { id: festaId },
    select: { fotoUrl: true },
  });
  if (!festa) return { erro: "Esta festa não existe mais. Recarregue a página." };

  const url = await guardarFoto(festaId, bytes, info);
  await prisma.festa.update({ where: { id: festaId }, data: { fotoUrl: url } });
  await apagarFoto(festa.fotoUrl);
  revalidatePath("/painel/festas/[id]", "layout");
  return { sucesso: Date.now() };
}

export async function removerFoto(festaId: string) {
  await exigirUsuario();
  const festa = await prisma.festa.findUnique({
    where: { id: festaId },
    select: { fotoUrl: true },
  });
  if (!festa?.fotoUrl) return;
  await prisma.festa.update({ where: { id: festaId }, data: { fotoUrl: null } });
  await apagarFoto(festa.fotoUrl);
  revalidatePath("/painel/festas/[id]", "layout");
}
