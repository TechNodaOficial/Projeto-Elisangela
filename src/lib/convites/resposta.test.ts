import { describe, expect, it } from "vitest";

import { erroDoFormato, montarResposta, type PessoaResposta } from "./resposta";

const familia = { pessoas: 4, entraram: 0, mesasDemarcadas: false };
const adulto = (nome = ""): PessoaResposta => ({ faixa: "adulto", nome });

describe("formato da resposta", () => {
  it("recusa resposta e quantidade inválidas", () => {
    expect(erroDoFormato("TALVEZ", 1, [])).toMatch(/inválida/);
    expect(erroDoFormato("CONFIRMADO", 0, [])).toMatch(/quantas/);
    expect(erroDoFormato("CONFIRMADO", 1, [{ faixa: "bebê" as never, nome: "" }])).toMatch(/idade/);
    expect(erroDoFormato("RECUSADO", 0, [])).toBeNull();
  });
});

describe("montar a resposta", () => {
  it("conta as crianças de uma família", () => {
    const r = montarResposta(familia, "CONFIRMADO", 3, [
      adulto(),
      { faixa: "4a11", nome: "" },
      { faixa: "0a3", nome: "" },
    ]);
    expect(r).toEqual({
      dados: { rsvp: "CONFIRMADO", confirmadas: 3, criancas4a11: 1, criancas0a3: 1 },
      membros: null,
    });
  });

  it("não passa do tamanho do convite nem de quem já entrou", () => {
    expect(montarResposta(familia, "CONFIRMADO", 5, [])).toEqual({
      erro: "Este convite é para até 4 pessoas.",
    });
    expect(montarResposta({ ...familia, entraram: 2 }, "RECUSADO", 1, [])).toEqual({
      erro: "2 pessoas deste convite já entraram na festa.",
    });
  });

  it("com mesas demarcadas, pede e guarda o nome de cada um", () => {
    const demarcadas = { ...familia, mesasDemarcadas: true };
    expect(montarResposta(demarcadas, "CONFIRMADO", 1, [adulto("Ana")])).toEqual({
      erro: expect.stringMatching(/sobrenome/),
    });
    const r = montarResposta(demarcadas, "CONFIRMADO", 1, [adulto(" Ana  Silva ")]);
    expect("membros" in r && r.membros).toEqual([{ ordem: 0, nome: "Ana Silva", faixa: "ADULTO" }]);
  });

  it("recusar apaga os nomes", () => {
    const r = montarResposta(familia, "RECUSADO", 1, []);
    expect(r).toEqual({
      dados: { rsvp: "RECUSADO", confirmadas: null, criancas4a11: null, criancas0a3: null },
      membros: [],
    });
  });
});
