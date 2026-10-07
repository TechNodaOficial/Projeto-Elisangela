"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import { apagarPlanta, guardarPlanta } from "@/lib/planta/blob";
import { lerImagem } from "@/lib/planta/imagem";
import { TAMANHO_MAXIMO_PLANTA } from "@/lib/planta/limites";
import { prisma } from "@/lib/prisma";

export type EstadoPlanta = { erro?: string; sucesso?: number };

// O navegador já reduz a imagem antes de enviar (ver campo-planta.tsx); aqui só conferimos.
export async function enviarPlanta(
  festaId: string,
  _e: EstadoPlanta,
  formData: FormData,
): Promise<EstadoPlanta> {
  await exigirUsuario();
  const arquivo = formData.get("planta");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha uma imagem." };
  if (arquivo.size > TAMANHO_MAXIMO_PLANTA) {
    return { erro: "Imagem grande demais. Tente uma versão menor." };
  }

  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const info = lerImagem(bytes);
  if (!info) return { erro: "Não consegui ler esta imagem. Envie em JPG ou PNG." };

  const festa = await prisma.festa.findUnique({
    where: { id: festaId },
    select: { plantaUrl: true },
  });
  if (!festa) return { erro: "Esta festa não existe mais. Recarregue a página." };

  const url = await guardarPlanta(festaId, bytes, info);
  await prisma.festa.update({
    where: { id: festaId },
    data: { plantaUrl: url, plantaLargura: info.largura, plantaAltura: info.altura },
  });
  await apagarPlanta(festa.plantaUrl);
  revalidatePath("/painel/festas/[id]", "layout");
  return { sucesso: Date.now() };
}

export async function removerPlanta(festaId: string) {
  await exigirUsuario();
  const festa = await prisma.festa.findUnique({
    where: { id: festaId },
    select: { plantaUrl: true },
  });
  if (!festa?.plantaUrl) return;
  await prisma.festa.update({
    where: { id: festaId },
    data: { plantaUrl: null, plantaLargura: null, plantaAltura: null },
  });
  await apagarPlanta(festa.plantaUrl);
  revalidatePath("/painel/festas/[id]", "layout");
}
