import { describe, expect, it } from "vitest";

import { contarPorStatus } from "./contagem";

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
