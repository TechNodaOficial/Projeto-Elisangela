import { describe, expect, it } from "vitest";

import {
  apagamentoMaximo,
  apagamentoPrevisto,
  limiteArquivo,
  limiteRetencao,
  podeApagar,
} from "./prazo";

describe("prazos de apagamento", () => {
  it("os limites ficam 30 e 90 dias antes de agora", () => {
    const agora = new Date("2026-12-31T12:00:00Z");
    expect(limiteArquivo(agora)).toEqual(new Date("2026-12-01T12:00:00Z"));
    expect(limiteRetencao(agora)).toEqual(new Date("2026-10-02T12:00:00Z"));
  });

  it("uma festa entra na limpeza exatamente quando chega o apagamento previsto", () => {
    const festa = new Date("2026-10-03T22:30:00Z");
    const previsto = apagamentoPrevisto(festa);
    expect(festa < limiteArquivo(new Date(previsto.getTime() - 1))).toBe(false);
    expect(festa < limiteArquivo(new Date(previsto.getTime() + 1))).toBe(true);
  });
});

describe("podeApagar", () => {
  const dataHora = new Date("2026-10-03T22:30:00Z");
  const depoisDe = (d: Date, ms = 1) => new Date(d.getTime() + ms);

  it("antes dos 30 dias, nunca", () => {
    const agora = new Date("2026-10-20T12:00:00Z");
    expect(podeApagar({ dataHora, pdfCompletoEm: agora }, agora)).toBe(false);
  });

  it("depois dos 30 dias, só com o PDF completo baixado", () => {
    const agora = depoisDe(apagamentoPrevisto(dataHora));
    expect(podeApagar({ dataHora, pdfCompletoEm: null }, agora)).toBe(false);
    expect(podeApagar({ dataHora, pdfCompletoEm: new Date("2026-10-10") }, agora)).toBe(true);
  });

  it("aos 90 dias, apaga mesmo sem o PDF (prazo da página de privacidade)", () => {
    const agora = depoisDe(apagamentoMaximo(dataHora));
    expect(podeApagar({ dataHora, pdfCompletoEm: null }, agora)).toBe(true);
  });
});
