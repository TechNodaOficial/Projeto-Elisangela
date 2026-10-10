import { describe, expect, it } from "vitest";

import { erroDoNome, limparNome } from "./membros";

describe("nome completo", () => {
  it("junta espaços repetidos", () => {
    expect(limparNome("  Ana   Maria  Silva ")).toBe("Ana Maria Silva");
  });

  it("pede nome e sobrenome", () => {
    expect(erroDoNome("Ana")).toMatch(/sobrenome/);
    expect(erroDoNome("   ")).toMatch(/nome de cada pessoa/);
    expect(erroDoNome("Ana Silva")).toBeNull();
  });

  it("limita o tamanho", () => {
    expect(erroDoNome(`Ana ${"x".repeat(130)}`)).toMatch(/longo/);
  });
});
