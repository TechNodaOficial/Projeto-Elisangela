import { describe, expect, it } from "vitest";

import {
  diasAte,
  festaConcluida,
  inicioDeHoje,
  paraCampos,
  paraInstante,
  partesData,
  rotuloProximidade,
} from "./datas";

describe("paraInstante / paraCampos", () => {
  it("interpreta data e hora no horário de São Paulo (UTC-3)", () => {
    expect(paraInstante("2026-12-12", "19:30").toISOString()).toBe("2026-12-12T22:30:00.000Z");
  });

  it("festa depois das 21h cai no dia seguinte em UTC, mas volta certa para o formulário", () => {
    const instante = paraInstante("2026-12-12", "22:00");

    expect(instante.toISOString()).toBe("2026-12-13T01:00:00.000Z");
    expect(paraCampos(instante)).toEqual({ data: "2026-12-12", hora: "22:00" });
  });
});

describe("festaConcluida", () => {
  // 13/12/2026 às 01:00 em São Paulo = 04:00 UTC
  const agora = new Date("2026-12-13T04:00:00Z");

  it("hoje = 13/12 em São Paulo, mesmo com UTC também em 13/12", () => {
    expect(inicioDeHoje(agora).toISOString()).toBe("2026-12-13T03:00:00.000Z");
  });

  it("festa de ontem à noite já está concluída", () => {
    expect(festaConcluida(paraInstante("2026-12-12", "22:00"), agora)).toBe(true);
  });

  it("festa de hoje continua pendente o dia todo, mesmo depois do horário", () => {
    expect(festaConcluida(paraInstante("2026-12-13", "00:30"), agora)).toBe(false);
  });

  it("às 22h de 12/12 em São Paulo (já 13/12 em UTC), a festa de 12/12 ainda é pendente", () => {
    const noite = new Date("2026-12-13T01:00:00Z");

    expect(festaConcluida(paraInstante("2026-12-12", "20:00"), noite)).toBe(false);
  });
});

describe("partesData / diasAte / rotuloProximidade", () => {
  it("formata em português e no fuso de São Paulo", () => {
    const p = partesData(paraInstante("2026-12-12", "22:00"));

    expect(p).toMatchObject({ dia: "12", mes: "dez", semana: "sáb", ano: "2026", hora: "22:00" });
    expect(p.extenso).toBe("sábado, 12 de dezembro de 2026");
  });

  it("conta dias de calendário, não períodos de 24h", () => {
    const agora = paraInstante("2026-12-12", "23:50");

    expect(diasAte(paraInstante("2026-12-13", "00:10"), agora)).toBe(1);
    expect(diasAte(paraInstante("2026-12-12", "08:00"), agora)).toBe(0);
    expect(diasAte(paraInstante("2026-12-09", "20:00"), agora)).toBe(-3);
  });

  it.each([
    [0, "Hoje"],
    [1, "Amanhã"],
    [5, "Em 5 dias"],
    [-1, "Ontem"],
    [-10, "Há 10 dias"],
  ])("%i dias → %s", (dias, rotulo) => {
    expect(rotuloProximidade(dias)).toBe(rotulo);
  });
});
