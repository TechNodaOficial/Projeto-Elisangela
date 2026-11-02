import "server-only";

import { del, get, put } from "@vercel/blob";

import { TIPOS_ANEXO, type TipoAnexo } from "./arquivo";

// Mesmo Blob store privado dos contratos: o painel serve o anexo por
// /painel/festas/[id]/anexos/[secao]/[anexoId], que exige login.

export async function guardarAnexo(festaId: string, bytes: Uint8Array, tipo: TipoAnexo) {
  const { extensao, contentType } = TIPOS_ANEXO[tipo];
  const blob = await put(`anexos/${festaId}.${extensao}`, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: true,
    contentType,
  });
  return blob.url;
}

// Falha ao apagar não deve travar a ação: na pior hipótese sobra um arquivo órfão no store.
export async function apagarAnexos(urls: (string | null | undefined)[]) {
  const validas = urls.filter((u): u is string => !!u);
  if (validas.length === 0) return;
  try {
    await del(validas);
  } catch (erro) {
    console.error("Não foi possível apagar anexos do Blob:", validas, erro);
  }
}

export async function abrirAnexo(url: string) {
  return get(url, { access: "private" });
}
