import { describe, expect, it } from "vitest";

import { apagamentoPrevisto, limiteRetencao } from "./prazo";

describe("retenção dos convidados", () => {
  it("o limite fica 90 dias antes de agora", () => {
    expect(limiteRetencao(new Date("2026-12-31T12:00:00Z"))).toEqual(
      new Date("2026-10-02T12:00:00Z"),
    );
  });

  it("uma festa entra na limpeza exatamente quando chega o apagamento previsto", () => {
    const festa = new Date("2026-10-03T22:30:00Z");
    const previsto = apagamentoPrevisto(festa);
    expect(festa < limiteRetencao(new Date(previsto.getTime() - 1))).toBe(false);
    expect(festa < limiteRetencao(new Date(previsto.getTime() + 1))).toBe(true);
  });
});
