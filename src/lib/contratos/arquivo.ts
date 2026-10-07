// Tipo do arquivo do contrato lido dos próprios bytes, sem confiar no que o navegador informa.
// Aceita PDF e foto (JPG ou PNG), que é como contrato costuma chegar.

// Mesmo teto da planta: a Vercel aceita no máximo 4,5 MB por requisição (ver next.config.ts).
export const TAMANHO_MAXIMO_CONTRATO = 4 * 1024 * 1024;

export const TIPOS_CONTRATO = {
  pdf: { extensao: "pdf", contentType: "application/pdf" },
  png: { extensao: "png", contentType: "image/png" },
  jpeg: { extensao: "jpg", contentType: "image/jpeg" },
} as const;

export type TipoContrato = keyof typeof TIPOS_CONTRATO;

const comeca = (b: Uint8Array, assinatura: number[]) =>
  b.length >= assinatura.length && assinatura.every((byte, i) => b[i] === byte);

export function tipoDoContrato(bytes: Uint8Array): TipoContrato | null {
  if (comeca(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf"; // %PDF-
  if (comeca(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (comeca(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  return null;
}

// Nome para mostrar e para o download: sem caminho, sem caracteres de controle, curto.
export function nomeDoContrato(nomeOriginal: string, tipo: TipoContrato): string {
  const limpo = nomeOriginal
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f"]/g, "")
    .trim()
    .slice(0, 120);
  return limpo || `contrato.${TIPOS_CONTRATO[tipo].extensao}`;
}
