import { describe, expect, it } from "vitest";

import { gradeDoMes, lerAno, lerMes, mesVizinho } from "./calendario";

describe("lerMes", () => {
  it("lê o mês do endereço", () => {
    expect(lerMes("2026-11")).toEqual({ ano: 2026, mes: 11 });
  });

  it("sem mês ou com mês inválido, usa o mês atual em São Paulo", () => {
    // 1º de novembro, 1h em UTC = ainda 31 de outubro em São Paulo.
    const agora = new Date("2026-11-01T01:00:00Z");
    expect(lerMes(undefined, agora)).toEqual({ ano: 2026, mes: 10 });
    expect(lerMes("2026-13", agora)).toEqual({ ano: 2026, mes: 10 });
    expect(lerMes("lixo", agora)).toEqual({ ano: 2026, mes: 10 });
  });
});

describe("mesVizinho", () => {
  it("vira o ano nos dois sentidos", () => {
    expect(mesVizinho({ ano: 2026, mes: 12 }, 1)).toBe("2027-01");
    expect(mesVizinho({ ano: 2026, mes: 1 }, -1)).toBe("2025-12");
    expect(mesVizinho({ ano: 2026, mes: 10 }, 1)).toBe("2026-11");
  });
});

describe("gradeDoMes", () => {
  it("começa no domingo e termina no sábado, completando com dias vizinhos", () => {
    // Outubro de 2026: dia 1 é quinta; dia 31 é sábado.
    const semanas = gradeDoMes({ ano: 2026, mes: 10 });
    expect(semanas).toHaveLength(5);
    expect(semanas.every((s) => s.length === 7)).toBe(true);
    expect(semanas[0][0]).toEqual({ data: "2026-09-27", dia: 27, doMes: false });
    expect(semanas[0][4]).toEqual({ data: "2026-10-01", dia: 1, doMes: true });
    expect(semanas[4][6]).toEqual({ data: "2026-10-31", dia: 31, doMes: true });
  });

  it("mês que começa no domingo não ganha semana vazia antes", () => {
    // Fevereiro de 2026: dia 1 é domingo, 28 dias, termina no sábado.
    const semanas = gradeDoMes({ ano: 2026, mes: 2 });
    expect(semanas).toHaveLength(4);
    expect(semanas[0][0].data).toBe("2026-02-01");
  });
});

describe("lerAno", () => {
  it("lê o ano do endereço", () => {
    expect(lerAno("2027")).toBe(2027);
  });

  it("sem ano ou inválido, usa o ano atual em São Paulo", () => {
    // 1º de janeiro, 1h em UTC = ainda 31 de dezembro em São Paulo.
    const agora = new Date("2027-01-01T01:00:00Z");
    expect(lerAno(undefined, agora)).toBe(2026);
    expect(lerAno("27", agora)).toBe(2026);
    expect(lerAno("9999", agora)).toBe(2026);
  });
});
