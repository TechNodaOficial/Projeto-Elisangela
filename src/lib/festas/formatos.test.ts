import { describe, expect, it } from "vitest";

import {
  centavosParaCampo,
  chaveHorario,
  compararNomes,
  formatarReais,
  lerValorEmCentavos,
} from "./formatos";

describe("lerValorEmCentavos", () => {
  it.each([
    ["1500", 150000],
    ["1.500", 150000],
    ["1.500,00", 150000],
    ["R$ 1.500,5", 150050],
    ["2.350.000,99", 235000099],
    ["0,90", 90],
  ])("%s → %i centavos", (entrada, centavos) => {
    expect(lerValorEmCentavos(entrada)).toBe(centavos);
  });

  it("vazio é null (valor ainda não definido)", () => {
    expect(lerValorEmCentavos("  ")).toBeNull();
  });

  it.each(["abc", "1,500.00", "1.50", "10,123", "-5"])("recusa %s", (entrada) => {
    expect(lerValorEmCentavos(entrada)).toBeUndefined();
  });
});

describe("formatarReais / centavosParaCampo", () => {
  it("formata no padrão brasileiro", () => {
    expect(formatarReais(150050)).toBe("R$ 1.500,50");
    expect(centavosParaCampo(150000)).toBe("1.500,00");
    expect(centavosParaCampo(null)).toBe("");
  });
});

describe("chaveHorario", () => {
  it("madrugada vem depois da noite", () => {
    const horas = ["01:00", "19:30", "23:00", "15:00", "05:59", "06:00"];

    expect(horas.sort((a, b) => chaveHorario(a) - chaveHorario(b))).toEqual([
      "06:00",
      "15:00",
      "19:30",
      "23:00",
      "01:00",
      "05:59",
    ]);
  });
});

describe("compararNomes", () => {
  it("ordem natural e sem diferenciar acentos", () => {
    expect(["Mesa 10", "Mesa 2", "Mesa dos noivos", "Mesa 1"].sort(compararNomes)).toEqual([
      "Mesa 1",
      "Mesa 2",
      "Mesa 10",
      "Mesa dos noivos",
    ]);
  });
});
