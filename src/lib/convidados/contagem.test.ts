import { describe, expect, it } from "vitest";

import {
  contarPorStatus,
  criancasPorIdade,
  descreverFaixas,
  faixasDe,
  somarFaixas,
} from "./contagem";

describe("contarPorStatus", () => {
  it("conta pessoas, não convites", () => {
    expect(
      contarPorStatus([
        { rsvp: "CONFIRMADO", pessoas: 4, confirmadas: 3, entraram: 3 },
        { rsvp: "CONFIRMADO", pessoas: 1, confirmadas: 1, entraram: 0 },
        { rsvp: "RECUSADO", pessoas: 2, confirmadas: null, entraram: 0 },
        { rsvp: "PENDENTE", pessoas: 5, confirmadas: null, entraram: 0 },
      ]),
    ).toEqual({ total: 12, confirmados: 4, recusados: 3, aguardando: 5, presentes: 3 });
  });

  it("lista vazia", () => {
    expect(contarPorStatus([])).toEqual({
      total: 0,
      confirmados: 0,
      recusados: 0,
      aguardando: 0,
      presentes: 0,
    });
  });
});

describe("faixasDe", () => {
  const base = { rsvp: "CONFIRMADO" as const, pessoas: 4, confirmadas: 4 };

  it("separa adultos e crianças", () => {
    expect(faixasDe({ ...base, criancas4a11: 1, criancas0a3: 1 })).toEqual({
      adultos: 2,
      criancas4a11: 1,
      criancas0a3: 1,
      semIdade: 0,
    });
  });

  it("família sem idades informadas", () => {
    expect(faixasDe({ ...base, criancas4a11: null, criancas0a3: null }).semIdade).toBe(4);
  });

  it("convite de uma pessoa conta como adulto", () => {
    const f = faixasDe({
      ...base,
      pessoas: 1,
      confirmadas: 1,
      criancas4a11: null,
      criancas0a3: null,
    });
    expect(f).toEqual({ adultos: 1, criancas4a11: 0, criancas0a3: 0, semIdade: 0 });
  });

  it("quem não vai não entra", () => {
    const f = faixasDe({ ...base, rsvp: "RECUSADO", criancas4a11: 2, criancas0a3: 0 });
    expect(f).toEqual({ adultos: 0, criancas4a11: 0, criancas0a3: 0, semIdade: 0 });
  });

  it("crianças nunca passam de quem vai", () => {
    const f = faixasDe({ ...base, confirmadas: 2, criancas4a11: 2, criancas0a3: 1 });
    expect(f).toEqual({ adultos: 0, criancas4a11: 1, criancas0a3: 1, semIdade: 0 });
  });

  it("soma e descreve", () => {
    const f = somarFaixas([
      { ...base, criancas4a11: 1, criancas0a3: 1 },
      { ...base, pessoas: 1, confirmadas: 1, criancas4a11: null, criancas0a3: null },
    ]);
    expect(descreverFaixas(f)).toBe("3 adultos · 1 de 4 a 11 · 1 de 0 a 3");
  });
});

describe("criancasPorIdade", () => {
  const f = { adultos: 2, criancas4a11: 0, criancas0a3: 0, semIdade: 0 };

  it("uma entrada por faixa que tem criança", () => {
    expect(criancasPorIdade({ ...f, criancas4a11: 2, criancas0a3: 1 })).toEqual([
      { n: 2, idade: "4 a 11 anos" },
      { n: 1, idade: "0 a 3 anos" },
    ]);
    expect(criancasPorIdade({ ...f, criancas0a3: 1 })).toEqual([{ n: 1, idade: "0 a 3 anos" }]);
  });

  it("vazio sem crianças", () => {
    expect(criancasPorIdade(f)).toEqual([]);
  });
});
