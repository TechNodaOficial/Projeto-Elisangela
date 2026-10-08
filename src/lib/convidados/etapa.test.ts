import { describe, expect, it } from "vitest";

import { etapaDoConvite, passaNoFiltro } from "./etapa";

const base = {
  rsvp: "PENDENTE" as const,
  enviadoEm: null,
  abertoEm: null,
  entraram: 0,
  telefone: "19998765432",
};
const dia = new Date("2026-10-08T12:00:00Z");

describe("etapaDoConvite", () => {
  it("vai do envio até a porta, sempre a etapa mais adiantada", () => {
    expect(etapaDoConvite(base)).toBe("nao_enviado");
    expect(etapaDoConvite({ ...base, enviadoEm: dia })).toBe("enviado");
    expect(etapaDoConvite({ ...base, enviadoEm: dia, abertoEm: dia })).toBe("abriu");
    // Respondeu sem estar marcado como enviado (link mandado por fora): conta a resposta.
    expect(etapaDoConvite({ ...base, rsvp: "CONFIRMADO" })).toBe("confirmou");
    expect(etapaDoConvite({ ...base, rsvp: "RECUSADO" })).toBe("nao_vai");
    expect(etapaDoConvite({ ...base, rsvp: "CONFIRMADO", entraram: 2 })).toBe("chegou");
  });
});

describe("passaNoFiltro", () => {
  it("agrupa enviados e abertos em 'sem resposta', e quem chegou em 'confirmaram'", () => {
    expect(passaNoFiltro({ ...base, enviadoEm: dia }, "sem_resposta")).toBe(true);
    expect(passaNoFiltro({ ...base, enviadoEm: dia, abertoEm: dia }, "sem_resposta")).toBe(true);
    expect(passaNoFiltro(base, "sem_resposta")).toBe(false);
    expect(passaNoFiltro({ ...base, rsvp: "CONFIRMADO", entraram: 1 }, "confirmou")).toBe(true);
    expect(passaNoFiltro({ ...base, telefone: null }, "sem_whatsapp")).toBe(true);
    expect(passaNoFiltro(base, "nao_enviado")).toBe(true);
  });
});
