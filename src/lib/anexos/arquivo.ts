// Tipo do anexo lido dos próprios bytes, sem confiar no que o navegador informa.
// Aceita PDF, foto (JPG ou PNG), Word e Excel, que é o que costuma circular numa festa.

// Mesmo teto do contrato: a Vercel aceita no máximo 4,5 MB por requisição (ver next.config.ts).
export const TAMANHO_MAXIMO_ANEXO = 4 * 1024 * 1024;

export const TIPOS_ANEXO = {
  pdf: { extensao: "pdf", contentType: "application/pdf", abreNoNavegador: true },
  png: { extensao: "png", contentType: "image/png", abreNoNavegador: true },
  jpeg: { extensao: "jpg", contentType: "image/jpeg", abreNoNavegador: true },
  docx: {
    extensao: "docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    abreNoNavegador: false,
  },
  xlsx: {
    extensao: "xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    abreNoNavegador: false,
  },
  doc: { extensao: "doc", contentType: "application/msword", abreNoNavegador: false },
  xls: { extensao: "xls", contentType: "application/vnd.ms-excel", abreNoNavegador: false },
} as const;

export type TipoAnexo = keyof typeof TIPOS_ANEXO;

// Para o <input type="file">: só filtra a janela de escolha; quem decide é tipoDoAnexo.
export const ACEITA_ANEXO = [
  ...new Set(Object.values(TIPOS_ANEXO).flatMap((t) => [t.contentType, `.${t.extensao}`])),
].join(",");

const comeca = (b: Uint8Array, assinatura: number[], desde = 0) =>
  b.length >= desde + assinatura.length && assinatura.every((byte, i) => b[desde + i] === byte);

const ascii = (texto: string) => [...texto].map((c) => c.charCodeAt(0));

// Os nomes dos arquivos de dentro do zip ficam em texto puro no próprio zip.
const contem = (b: Uint8Array, texto: string) =>
  new TextDecoder("latin1").decode(b).includes(texto);

const extensaoDe = (nome: string) => nome.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";

// Word e Excel novos são um zip; o que tem dentro diz qual dos dois é. Os antigos (.doc,
// .xls) são o mesmo contêiner da Microsoft para os dois, então ali vale a extensão do nome.
export function tipoDoAnexo(bytes: Uint8Array, nomeOriginal: string): TipoAnexo | null {
  if (comeca(bytes, ascii("%PDF-"))) return "pdf";
  if (comeca(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (comeca(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (comeca(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    if (contem(bytes, "word/document")) return "docx";
    if (contem(bytes, "xl/workbook")) return "xlsx";
    return null;
  }
  if (comeca(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    const ext = extensaoDe(nomeOriginal);
    return ext === "doc" || ext === "xls" ? ext : null;
  }
  return null;
}

// Foto do iPhone (HEIC): não abre no navegador de quase ninguém, então recusa com explicação.
export function ehHeic(bytes: Uint8Array) {
  if (!comeca(bytes, ascii("ftyp"), 4)) return false;
  const marca = String.fromCharCode(...bytes.slice(8, 12));
  return ["heic", "heix", "heim", "heis", "hevc", "hevx", "mif1", "msf1"].includes(marca);
}

// Nome para mostrar e para o download: sem caminho, sem caracteres de controle, curto.
export function nomeDoAnexo(nomeOriginal: string, tipo: TipoAnexo): string {
  const limpo = nomeOriginal
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f"]/g, "")
    .trim()
    .slice(0, 120);
  return limpo || `anexo.${TIPOS_ANEXO[tipo].extensao}`;
}

// "830 KB", "2,4 MB".
export function tamanhoLegivel(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}
