import { describe, expect, it } from "vitest";

import { gerarToken, gerarTokensConvidado } from "./tokens";

describe("gerarToken", () => {
  it("gera 22 caracteres seguros para URL (128 bits em base64url)", () => {
    const token = gerarToken();

    expect(token).toHaveLength(22);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("não repete tokens", () => {
    const tokens = new Set(Array.from({ length: 10_000 }, gerarToken));

    expect(tokens.size).toBe(10_000);
  });
});

describe("gerarTokensConvidado", () => {
  it("gera token do convite e código de check-in diferentes", () => {
    const { tokenConvite, codigoCheckin } = gerarTokensConvidado();

    expect(tokenConvite).not.toBe(codigoCheckin);
  });
});
