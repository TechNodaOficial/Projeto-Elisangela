import { describe, expect, it } from "vitest";

import { limparMensagem } from "./mensagem";

describe("limparMensagem", () => {
  it("tira espaços nas pontas e linhas em branco a mais", () => {
    expect(limparMensagem("  Parabéns!  \r\n\r\n\r\n\r\nFelicidades  ")).toBe(
      "Parabéns!\n\nFelicidades",
    );
  });

  it("só espaços vira vazio", () => {
    expect(limparMensagem(" \n\t ")).toBe("");
  });
});
