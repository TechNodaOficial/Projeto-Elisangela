import "server-only";

import { del, get, put } from "@vercel/blob";

import type { InfoImagem } from "./imagem";

// O Blob store é privado: as URLs não abrem sozinhas, só com o token (BLOB_READ_WRITE_TOKEN).
// O painel serve a imagem por /painel/festas/[id]/planta, que exige login.

export async function guardarPlanta(festaId: string, bytes: Uint8Array, info: InfoImagem) {
  const extensao = info.tipo === "png" ? "png" : "jpg";
  // O sufixo aleatório dá uma URL nova a cada troca, o que permite cache longo no navegador.
  const blob = await put(`plantas/${festaId}.${extensao}`, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: true,
    contentType: info.tipo === "png" ? "image/png" : "image/jpeg",
  });
  return blob.url;
}

// Falha ao apagar não deve travar a ação: na pior hipótese sobra um arquivo órfão no store.
export async function apagarPlanta(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch (erro) {
    console.error("Não foi possível apagar a planta do Blob:", url, erro);
  }
}

export async function abrirPlanta(url: string, etag?: string | null) {
  return get(url, { access: "private", ifNoneMatch: etag ?? undefined });
}

export async function lerBytesPlanta(url: string) {
  const resultado = await get(url, { access: "private" });
  if (!resultado || resultado.statusCode !== 200) return null;
  return new Uint8Array(await new Response(resultado.stream).arrayBuffer());
}

// Versão curta da URL, para invalidar o cache do navegador quando a planta muda.
export function versaoPlanta(url: string) {
  return url.split("/").pop() ?? "";
}
