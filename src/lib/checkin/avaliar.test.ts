import { describe, expect, it } from "vitest";

import { avaliarLeitura, limiteDeEntrada } from "./avaliar";

const base = {
  id: "c1",
  nome: "Família Silva",
  festaId: "f1",
  festaTitulo: "Casamento Ana e João",
  rsvp: "CONFIRMADO" as const,
  pessoas: 4,
  confirmadas: 4,
  entraram: 0,
  presenteEm: null,
  mesa: "Mesa 3",
};
const grupo = { id: "c1", nome: "Família Silva", mesa: "Mesa 3", pessoas: 4 };
const hora = new Date("2026-12-12T23:10:00Z");

describe("avaliarLeitura", () => {
  it("QR que não é de nenhum convidado", () => {
    expect(avaliarLeitura(null, "f1")).toEqual({ tipo: "desconhecido" });
  });

  it("convidado de outra festa", () => {
    expect(avaliarLeitura({ ...base, festaId: "f2", festaTitulo: "Bodas" }, "f1")).toEqual({
      tipo: "outra-festa",
      nome: "Família Silva",
      festaTitulo: "Bodas",
    });
  });

  it("família confirmada chegando junta: entram todos os confirmados", () => {
    expect(avaliarLeitura({ ...base, confirmadas: 3 }, "f1")).toEqual({
      ...grupo,
      tipo: "liberado",
      entrando: 3,
      antes: 0,
      limite: 3,
    });
  });

  it("família chegando em partes: na segunda leitura entram os que faltam", () => {
    expect(avaliarLeitura({ ...base, entraram: 3, presenteEm: hora }, "f1")).toEqual({
      ...grupo,
      tipo: "liberado",
      entrando: 1,
      antes: 3,
      limite: 4,
    });
  });

  it("todos os confirmados já entraram: barra", () => {
    expect(avaliarLeitura({ ...base, entraram: 4, presenteEm: hora }, "f1")).toEqual({
      ...grupo,
      tipo: "ja-entrou",
      hora,
      entraram: 4,
      limite: 4,
    });
  });

  it("confirmou 3 de 4 e os 3 entraram: barra, mas deixar entrar libera o 4º", () => {
    const c = { ...base, confirmadas: 3, entraram: 3, presenteEm: hora };
    expect(avaliarLeitura(c, "f1").tipo).toBe("ja-entrou");
    expect(avaliarLeitura(c, "f1", { deixarEntrar: true })).toEqual({
      ...grupo,
      tipo: "liberado",
      entrando: 1,
      antes: 3,
      limite: 4,
    });
  });

  it("não confirmou (pendente ou recusou) pede decisão", () => {
    for (const rsvp of ["PENDENTE", "RECUSADO"] as const) {
      expect(avaliarLeitura({ ...base, rsvp, confirmadas: null }, "f1")).toEqual({
        ...grupo,
        tipo: "nao-confirmou",
        rsvp,
      });
    }
  });

  it("deixar entrar sem confirmar libera o grupo todo", () => {
    const c = { ...base, rsvp: "PENDENTE" as const, confirmadas: null };
    expect(avaliarLeitura(c, "f1", { deixarEntrar: true })).toMatchObject({
      tipo: "liberado",
      entrando: 4,
    });
  });

  it("sem confirmar mas já deixaram entrar parte: o resto entra sem perguntar de novo", () => {
    const c = {
      ...base,
      rsvp: "PENDENTE" as const,
      confirmadas: null,
      entraram: 2,
      presenteEm: hora,
    };
    expect(avaliarLeitura(c, "f1")).toMatchObject({ tipo: "liberado", entrando: 2, antes: 2 });
  });
});

describe("limiteDeEntrada", () => {
  it("confirmadas nunca passam do tamanho do grupo", () => {
    expect(limiteDeEntrada({ rsvp: "CONFIRMADO", pessoas: 2, confirmadas: 5 })).toBe(2);
    expect(limiteDeEntrada({ rsvp: "CONFIRMADO", pessoas: 4, confirmadas: null })).toBe(4);
  });
});
