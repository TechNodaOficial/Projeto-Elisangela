import { describe, expect, it } from "vitest";

import { filaDeEnvio, resumoDoEnvio } from "./envio";

const DIA = 24 * 60 * 60 * 1000;
const agora = new Date("2026-10-08T15:00:00Z");
const antes = (ms: number) => new Date(agora.getTime() - ms);

const convidado = (
  id: string,
  extra: Partial<Parameters<typeof resumoDoEnvio>[0][number]> = {},
) => ({
  id,
  telefone: "19998765432",
  rsvp: "PENDENTE" as const,
  enviadoEm: null,
  abertoEm: null,
  respondidoEm: null,
  ...extra,
});

describe("filaDeEnvio", () => {
  it("só quem tem WhatsApp, ainda não recebeu e não respondeu; pulados no fim", () => {
    const lista = [
      convidado("a"),
      convidado("b", { telefone: null }),
      convidado("c", { enviadoEm: antes(1000) }),
      convidado("d", { rsvp: "CONFIRMADO" }),
      convidado("e"),
      convidado("f"),
    ];
    expect(filaDeEnvio(lista).map((c) => c.id)).toEqual(["a", "e", "f"]);
    expect(filaDeEnvio(lista, ["a"]).map((c) => c.id)).toEqual(["e", "f", "a"]);
  });
});

describe("resumoDoEnvio", () => {
  it("conta enviados, quem abriu (ou respondeu) e quem não tem WhatsApp", () => {
    const r = resumoDoEnvio(
      [
        convidado("a", { enviadoEm: antes(1000), abertoEm: antes(500) }),
        convidado("b", { enviadoEm: antes(1000), rsvp: "CONFIRMADO", respondidoEm: antes(100) }),
        convidado("c", { enviadoEm: antes(1000) }),
        convidado("d", { telefone: null }),
        convidado("e"),
      ],
      agora,
    );
    expect(r).toEqual({ enviados: 3, abriram: 2, responderam: 1, semWhatsApp: 1, alerta: false });
  });

  it("alerta quando muitos envios de mais de um dia quase não foram abertos", () => {
    const naoAbertos = Array.from({ length: 10 }, (_, i) =>
      convidado(`n${i}`, { enviadoEm: antes(2 * DIA) }),
    );
    expect(resumoDoEnvio(naoAbertos, agora).alerta).toBe(true);
    // Envios de hoje ainda não contam: a pessoa pode não ter visto.
    const deHoje = naoAbertos.map((c) => ({ ...c, enviadoEm: antes(1000) }));
    expect(resumoDoEnvio(deHoje, agora).alerta).toBe(false);
    // Com 2 de 10 abertos (20%), está chegando.
    const algunsAbertos = naoAbertos.map((c, i) => (i < 2 ? { ...c, abertoEm: antes(DIA) } : c));
    expect(resumoDoEnvio(algunsAbertos, agora).alerta).toBe(false);
  });
});
