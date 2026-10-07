import { describe, expect, it } from "vitest";

import { janelaPortaria, pinValido, situacaoPortaria } from "./janela";

// Festa às 20:00 de 12/12/2026 em São Paulo (23:00 UTC).
const festa = new Date("2026-12-12T23:00:00Z");

describe("janela da portaria", () => {
  it("abre 6h antes e fecha 12h depois da festa", () => {
    expect(janelaPortaria(festa)).toEqual({
      abre: new Date("2026-12-12T17:00:00Z"),
      fecha: new Date("2026-12-13T11:00:00Z"),
    });
  });

  it("situação ao longo do dia", () => {
    expect(situacaoPortaria(festa, new Date("2026-12-12T16:59:59Z"))).toBe("antes");
    expect(situacaoPortaria(festa, new Date("2026-12-12T17:00:00Z"))).toBe("aberta");
    expect(situacaoPortaria(festa, new Date("2026-12-13T03:00:00Z"))).toBe("aberta");
    expect(situacaoPortaria(festa, new Date("2026-12-13T11:00:00Z"))).toBe("encerrada");
  });
});

describe("pinValido", () => {
  it("só 4 dígitos", () => {
    expect(pinValido("0427")).toBe(true);
    expect(pinValido("427")).toBe(false);
    expect(pinValido("04a7")).toBe(false);
    expect(pinValido("04271")).toBe(false);
  });
});
