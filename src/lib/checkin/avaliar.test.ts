import { describe, expect, it } from "vitest";

import { avaliarLeitura } from "./avaliar";

const base = {
  id: "c1",
  nome: "Ana Souza",
  festaId: "f1",
  festaTitulo: "Casamento Ana e João",
  rsvp: "CONFIRMADO" as const,
  presenteEm: null,
  mesa: "Mesa 3",
};

describe("avaliarLeitura", () => {
  it("QR que não é de nenhum convidado", () => {
    expect(avaliarLeitura(null, "f1")).toEqual({ tipo: "desconhecido" });
  });

  it("convidado de outra festa", () => {
    expect(avaliarLeitura({ ...base, festaId: "f2", festaTitulo: "Bodas" }, "f1")).toEqual({
      tipo: "outra-festa",
      nome: "Ana Souza",
      festaTitulo: "Bodas",
    });
  });

  it("já entrou vem antes de qualquer outra regra", () => {
    const hora = new Date("2026-12-12T23:10:00Z");
    expect(avaliarLeitura({ ...base, rsvp: "RECUSADO", presenteEm: hora }, "f1")).toEqual({
      tipo: "ja-entrou",
      id: "c1",
      nome: "Ana Souza",
      mesa: "Mesa 3",
      hora,
    });
  });

  it("não confirmou (pendente ou recusou) pede decisão", () => {
    for (const rsvp of ["PENDENTE", "RECUSADO"] as const) {
      expect(avaliarLeitura({ ...base, rsvp }, "f1")).toEqual({
        tipo: "nao-confirmou",
        id: "c1",
        nome: "Ana Souza",
        mesa: "Mesa 3",
        rsvp,
      });
    }
  });

  it("deixar entrar mesmo sem confirmar libera", () => {
    expect(avaliarLeitura({ ...base, rsvp: "PENDENTE" }, "f1", { deixarEntrar: true })).toEqual({
      tipo: "liberado",
      id: "c1",
      nome: "Ana Souza",
      mesa: "Mesa 3",
    });
  });

  it("confirmado e ainda não entrou: libera", () => {
    expect(avaliarLeitura(base, "f1")).toEqual({
      tipo: "liberado",
      id: "c1",
      nome: "Ana Souza",
      mesa: "Mesa 3",
    });
  });
});
