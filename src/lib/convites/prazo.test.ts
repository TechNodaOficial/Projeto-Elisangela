import { describe, expect, it } from "vitest";

import { erroDePrazo, faseDoConvite, prazoDoConvite } from "./prazo";

// Festa às 20:00 de 20/12/2026 em São Paulo.
const festa = new Date("2026-12-20T23:00:00Z");
// Meio-dia em São Paulo do dia informado.
const dia = (d: string) => new Date(`${d}T15:00:00Z`);

describe("faseDoConvite", () => {
  it("aberto até 10 dias antes (inclusive), travado até a festa, encerrado depois", () => {
    expect(faseDoConvite(festa, dia("2026-10-01"))).toBe("aberto");
    expect(faseDoConvite(festa, dia("2026-12-10"))).toBe("aberto");
    expect(faseDoConvite(festa, dia("2026-12-11"))).toBe("travado");
    expect(faseDoConvite(festa, dia("2026-12-20"))).toBe("travado");
    expect(faseDoConvite(festa, dia("2026-12-21"))).toBe("encerrado");
  });
});

describe("prazoDoConvite", () => {
  it("dá o último dia do prazo", () => {
    expect(prazoDoConvite(festa)).toBe("10/12");
  });

  it("festa depois das 21h não pula de dia (fuso de São Paulo)", () => {
    expect(prazoDoConvite(new Date("2026-12-21T01:30:00Z"))).toBe("10/12");
  });
});

describe("erroDePrazo", () => {
  const pendente = { rsvp: "PENDENTE" as const, pessoas: 4, confirmadas: null };
  const confirmado = { rsvp: "CONFIRMADO" as const, pessoas: 4, confirmadas: 3 };
  const recusado = { rsvp: "RECUSADO" as const, pessoas: 4, confirmadas: null };

  it("dentro do prazo, tudo pode", () => {
    expect(erroDePrazo(pendente, "CONFIRMADO", 4, "aberto")).toBeNull();
    expect(erroDePrazo(recusado, "CONFIRMADO", 2, "aberto")).toBeNull();
    expect(erroDePrazo(confirmado, "CONFIRMADO", 4, "aberto")).toBeNull();
  });

  it("depois do prazo: quem não respondeu não responde mais", () => {
    expect(erroDePrazo(pendente, "CONFIRMADO", 4, "travado")).toMatch(/prazo para responder/);
    expect(erroDePrazo(pendente, "RECUSADO", 1, "travado")).toMatch(/prazo para responder/);
  });

  it("depois do prazo: quem respondeu só pode desistir ou diminuir", () => {
    expect(erroDePrazo(confirmado, "RECUSADO", 1, "travado")).toBeNull();
    expect(erroDePrazo(confirmado, "CONFIRMADO", 2, "travado")).toBeNull();
    expect(erroDePrazo(confirmado, "CONFIRMADO", 4, "travado")).toMatch(/menos de 10 dias/);
    expect(erroDePrazo(recusado, "CONFIRMADO", 1, "travado")).toMatch(/menos de 10 dias/);
  });
});
