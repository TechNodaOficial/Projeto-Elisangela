// Formato e dimensões de uma imagem lidos dos próprios bytes, sem confiar no tipo
// que o navegador informa. Só PNG e JPEG: são os formatos que o PDF consegue embutir.

export type InfoImagem = { tipo: "png" | "jpeg"; largura: number; altura: number };

const LADO_MAXIMO = 10_000;

export function lerImagem(bytes: Uint8Array): InfoImagem | null {
  const info = lerPng(bytes) ?? lerJpeg(bytes);
  if (!info) return null;
  const valido = (n: number) => n > 0 && n <= LADO_MAXIMO;
  return valido(info.largura) && valido(info.altura) ? info : null;
}

const ASSINATURA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function lerPng(b: Uint8Array): InfoImagem | null {
  if (b.length < 24 || ASSINATURA_PNG.some((byte, i) => b[i] !== byte)) return null;
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { tipo: "png", largura: v.getUint32(16), altura: v.getUint32(20) };
}

// Percorre os segmentos até o SOF (Start of Frame), que guarda altura e largura.
function lerJpeg(b: Uint8Array): InfoImagem | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marcador = b[i + 1];
    const tamanho = (b[i + 2] << 8) | b[i + 3];
    // SOF0 a SOF15, exceto DHT (C4), JPG (C8) e DAC (CC).
    if (marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador)) {
      return {
        tipo: "jpeg",
        altura: (b[i + 5] << 8) | b[i + 6],
        largura: (b[i + 7] << 8) | b[i + 8],
      };
    }
    i += 2 + tamanho;
  }
  return null;
}
