import { describe, expect, it } from "vitest";

import { vagasDasMesas } from "./mesas";

const mesas = [
  { id: "m1", nome: "Mesa 1", lugares: 8 },
  { id: "m2", nome: "Mesa 2", lugares: 8 },
  { id: "m3", nome: "Mesa 3", lugares: 4 },
];
const conv = (id: string, mesaId: string | null, extra: object = {}) => ({
  id,
  mesaId,
  rsvp: "CONFIRMADO" as const,
  pessoas: 4,
  confirmadas: 4,
  entraram: 0,
  ...extra,
});

describe("vagasDasMesas", () => {
  it("conta vagas reservadas e livres agora; quem não chegou libera cadeira só no 'agora'", () => {
    const convidados = [
      conv("a", "m1", { entraram: 4 }), // chegaram os 4
      conv("b", "m1"), // confirmados, ainda não chegaram
      conv("c", "m2", { pessoas: 2, confirmadas: 2, entraram: 2 }),
    ];
    const vagas = vagasDasMesas(mesas, convidados, { sentando: "x", precisa: 2 });
    const mesa = (id: string) => vagas.find((m) => m.id === id)!;
    const [m1, m2, m3] = [mesa("m1"), mesa("m2"), mesa("m3")];
    expect(m2).toMatchObject({ id: "m2", vagas: 6, livresAgora: 6, aguardando: 0, cabe: true });
    expect(m1).toMatchObject({ id: "m1", vagas: 0, livresAgora: 4, aguardando: 4, cabe: false });
    expect(m1.cabeAgora).toBe(true);
    expect(m3).toMatchObject({ id: "m3", vagas: 4, livresAgora: 4 });
  });

  it("ordena: cabe primeiro (mais vagas antes), depois só-agora, depois o resto", () => {
    const convidados = [conv("a", "m1"), conv("b", "m1", { entraram: 2 })];
    const ordem = vagasDasMesas(mesas, convidados, { sentando: "x", precisa: 4 }).map((m) => m.id);
    expect(ordem).toEqual(["m2", "m3", "m1"]);
  });

  it("quem entrou além do confirmado ocupa cadeira; recusado não", () => {
    const convidados = [
      conv("a", "m3", { confirmadas: 2, entraram: 3 }),
      conv("b", "m3", { rsvp: "RECUSADO", confirmadas: null, pessoas: 2 }),
    ];
    const m3 = vagasDasMesas(mesas, convidados, { sentando: "x", precisa: 1 }).find(
      (m) => m.id === "m3",
    );
    expect(m3).toMatchObject({ vagas: 1, livresAgora: 1 });
  });

  it("trocar de mesa: o próprio convidado não conta na mesa atual", () => {
    const convidados = [conv("a", "m3")];
    const m3 = vagasDasMesas(mesas, convidados, { sentando: "a", precisa: 4 }).find(
      (m) => m.id === "m3",
    );
    expect(m3).toMatchObject({ vagas: 4, cabe: true });
  });
});
