import { describe, expect, it } from "vitest";

import { dividirEmParcelas, valorPago } from "./parcelas";

describe("dividirEmParcelas", () => {
  it("divide igual quando dá", () => {
    expect(dividirEmParcelas(150000, 3)).toEqual([50000, 50000, 50000]);
  });

  it("os centavos que sobram vão nas primeiras parcelas e a soma bate", () => {
    const parcelas = dividirEmParcelas(100000, 3);
    expect(parcelas).toEqual([33334, 33333, 33333]);
    expect(parcelas.reduce((a, b) => a + b, 0)).toBe(100000);
  });

  it("à vista é uma parcela só", () => {
    expect(dividirEmParcelas(9990, 1)).toEqual([9990]);
  });
});

describe("valorPago", () => {
  it("soma as parcelas já pagas", () => {
    expect(valorPago(100000, 3, 0)).toBe(0);
    expect(valorPago(100000, 3, 1)).toBe(33334);
    expect(valorPago(100000, 3, 3)).toBe(100000);
  });
});
