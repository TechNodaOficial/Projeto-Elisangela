import { describe, expect, it } from "vitest";

import { lerImagem } from "./imagem";

// PNG mínimo: assinatura + cabeçalho IHDR com largura e altura.
function png(largura: number, altura: number) {
  const b = new Uint8Array(33);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  const v = new DataView(b.buffer);
  v.setUint32(16, largura);
  v.setUint32(20, altura);
  return b;
}

// JPEG mínimo: SOI, um segmento APP0 qualquer e o SOF0 com altura e largura.
function jpeg(largura: number, altura: number, sof = 0xc0) {
  const app0 = [0xff, 0xe0, 0, 6, 1, 2, 3, 4];
  const sofSeg = [
    0xff,
    sof,
    0,
    11,
    8,
    altura >> 8,
    altura & 255,
    largura >> 8,
    largura & 255,
    1,
    0,
    0,
    0,
  ];
  return new Uint8Array([0xff, 0xd8, ...app0, ...sofSeg]);
}

describe("lerImagem", () => {
  it("lê PNG", () => {
    expect(lerImagem(png(2400, 1600))).toEqual({ tipo: "png", largura: 2400, altura: 1600 });
  });

  it("lê JPEG baseline e progressivo, pulando segmentos", () => {
    expect(lerImagem(jpeg(3000, 2000))).toEqual({ tipo: "jpeg", largura: 3000, altura: 2000 });
    expect(lerImagem(jpeg(800, 600, 0xc2))).toEqual({ tipo: "jpeg", largura: 800, altura: 600 });
  });

  it("recusa outros formatos e arquivos truncados", () => {
    expect(lerImagem(new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(lerImagem(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
    expect(lerImagem(png(10, 10).slice(0, 20))).toBeNull();
    expect(lerImagem(jpeg(10, 10).slice(0, 12))).toBeNull();
  });

  it("recusa dimensões zeradas ou absurdas", () => {
    expect(lerImagem(png(0, 100))).toBeNull();
    expect(lerImagem(png(20000, 100))).toBeNull();
  });
});
