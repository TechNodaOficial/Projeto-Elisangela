import "server-only";

import { del, get, put } from "@vercel/blob";

import { TIPOS_CONTRATO, type TipoContrato } from "./arquivo";

// Mesmo Blob store privado da planta: o painel serve o contrato por
// /painel/festas/[id]/contratos/[contratacaoId], que exige login.

export async function guardarContrato(
  contratacaoId: string,
  bytes: Uint8Array,
  tipo: TipoContrato,
) {
  const { extensao, contentType } = TIPOS_CONTRATO[tipo];
  const blob = await put(`contratos/${contratacaoId}.${extensao}`, Buffer.from(bytes), {
    access: "private",
    addRandomSuffix: true,
    contentType,
  });
  return blob.url;
}

// Falha ao apagar não deve travar a ação: na pior hipótese sobra um arquivo órfão no store.
export async function apagarContratos(urls: (string | null | undefined)[]) {
  const validas = urls.filter((u): u is string => !!u);
  if (validas.length === 0) return;
  try {
    await del(validas);
  } catch (erro) {
    console.error("Não foi possível apagar contratos do Blob:", validas, erro);
  }
}

export async function abrirContrato(url: string) {
  return get(url, { access: "private" });
}
