import { describe, expect, it } from "vitest";

import { nomeDoContrato, tipoDoContrato } from "./arquivo";

const bytes = (...b: number[]) => new Uint8Array(b);

describe("tipoDoContrato", () => {
  it("reconhece PDF, PNG e JPG pelos bytes", () => {
    expect(tipoDoContrato(new TextEncoder().encode("%PDF-1.7\n..."))).toBe("pdf");
    expect(tipoDoContrato(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("png");
    expect(tipoDoContrato(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
  });

  it("recusa o resto, mesmo com nome de PDF", () => {
    expect(tipoDoContrato(new TextEncoder().encode("PK\u0003\u0004 docx"))).toBeNull();
    expect(tipoDoContrato(bytes())).toBeNull();
  });
});

describe("nomeDoContrato", () => {
  it("tira caminho e caracteres estranhos", () => {
    expect(nomeDoContrato('C:\\fakepath\\Contrato "Buffet".pdf', "pdf")).toBe(
      "Contrato Buffet.pdf",
    );
  });

  it("sem nome, usa um padrão com a extensão certa", () => {
    expect(nomeDoContrato("", "jpeg")).toBe("contrato.jpg");
  });
});
