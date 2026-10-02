import { describe, expect, it } from "vitest";

import { estadoConvite, pareceToken } from "./estado";

// 20:00 de 12/12/2026 em São Paulo.
const festa = new Date("2026-12-12T23:00:00Z");
const antes = new Date("2026-12-01T15:00:00Z");
const noDia = new Date("2026-12-12T13:00:00Z");
const depois = new Date("2026-12-13T15:00:00Z");

describe("estadoConvite", () => {
  it("antes da festa segue a resposta", () => {
    expect(estadoConvite({ rsvp: "PENDENTE", presenteEm: null, dataHora: festa }, antes)).toBe(
      "aberto",
    );
    expect(estadoConvite({ rsvp: "CONFIRMADO", presenteEm: null, dataHora: festa }, antes)).toBe(
      "confirmado",
    );
    expect(estadoConvite({ rsvp: "RECUSADO", presenteEm: null, dataHora: festa }, antes)).toBe(
      "recusado",
    );
  });

  it("no dia da festa ainda dá para responder", () => {
    expect(estadoConvite({ rsvp: "PENDENTE", presenteEm: null, dataHora: festa }, noDia)).toBe(
      "aberto",
    );
  });

  it("depois da entrada registrada, só informa", () => {
    expect(estadoConvite({ rsvp: "CONFIRMADO", presenteEm: noDia, dataHora: festa }, noDia)).toBe(
      "presente",
    );
  });

  it("depois do dia da festa, encerrado", () => {
    expect(estadoConvite({ rsvp: "CONFIRMADO", presenteEm: null, dataHora: festa }, depois)).toBe(
      "encerrado",
    );
    expect(estadoConvite({ rsvp: "PENDENTE", presenteEm: null, dataHora: festa }, depois)).toBe(
      "encerrado",
    );
  });
});

describe("pareceToken", () => {
  it("aceita só o formato gerado (22 caracteres base64url)", () => {
    expect(pareceToken("AbCdEfGhIjKlMnOpQrSt_-")).toBe(true);
    expect(pareceToken("curto")).toBe(false);
    expect(pareceToken("AbCdEfGhIjKlMnOpQrSt/=")).toBe(false);
    expect(pareceToken("AbCdEfGhIjKlMnOpQrSt_-x")).toBe(false);
  });
});
