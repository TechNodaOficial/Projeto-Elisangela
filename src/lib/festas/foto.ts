import "server-only";

import { del, get, put } from "@vercel/blob";

import type { InfoImagem } from "@/lib/planta/imagem";

// Foto da festa (noivos, aniversariante) no mesmo Blob store privado da planta.
// O painel serve por /painel/festas/[id]/foto, que exige login.

export async function guardarFoto(festaId: string, bytes: Uint8Array, info: InfoImagem) {
  const png = info.tipo === "png";
  // O sufixo aleatório dá uma URL nova a cada troca, o que permite cache longo no navegador.
  const blob = await put(`fotos/${festaId}.${png ? "png" : "jpg"}`, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: true,
    contentType: png ? "image/png" : "image/jpeg",
  });
  return blob.url;
}

// Falha ao apagar não deve travar a ação: na pior hipótese sobra um arquivo órfão no store.
export async function apagarFoto(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch (erro) {
    console.error("Não foi possível apagar a foto do Blob:", url, erro);
  }
}

export async function abrirFoto(url: string, etag?: string | null) {
  return get(url, { access: "private", ifNoneMatch: etag ?? undefined });
}
