import { describe, expect, it } from "vitest";

import {
  CABECALHO,
  COR_SITUACAO,
  corDaLinha,
  larguraDasColunas,
  linhasDaPlanilha,
} from "./planilha";

const base = {
  telefone: null,
  confirmadas: null,
  criancas4a11: null,
  criancas0a3: null,
  enviadoEm: null,
  abertoEm: null,
  respondidoEm: null,
  entraram: 0,
  presenteEm: null,
  mesa: null,
  membros: [],
  mensagem: null,
};

describe("linhasDaPlanilha", () => {
  const linhas = linhasDaPlanilha([
    {
      ...base,
      nome: "Família Silva",
      telefone: "43999541076",
      pessoas: 4,
      rsvp: "CONFIRMADO",
      confirmadas: 4,
      criancas4a11: 1,
      criancas0a3: 1,
      respondidoEm: new Date("2026-09-21T22:30:00Z"),
      mesa: { nome: "Mesa 3" },
      membros: [
        { nome: "Ana Silva" },
        { nome: "João Silva" },
        { nome: "Lia Silva" },
        { nome: "Bia Silva" },
      ],
      mensagem: "=Felicidades!",
    },
    { ...base, nome: "Tia Cida", pessoas: 1, rsvp: "RECUSADO" },
  ]);

  it("cabeçalho, uma linha por convite e totais", () => {
    expect(linhas).toHaveLength(4);
    expect(linhas[0]).toEqual([...CABECALHO]);
    expect(linhas.every((l) => l.length === CABECALHO.length)).toBe(true);
  });

  it("convite confirmado com idades, nomes, mesa e recado", () => {
    expect(linhas[1]).toEqual([
      "Família Silva",
      "(43) 99954-1076",
      4,
      "Confirmou",
      4,
      2,
      1,
      1,
      "",
      "Ana Silva, João Silva, Lia Silva, Bia Silva",
      "Mesa 3",
      "",
      "",
      "21/09/2026 19:30",
      "=Felicidades!",
    ]);
  });

  it("quem não vai fica sem contagens", () => {
    expect(linhas[2].slice(3, 9)).toEqual(["Não vai", "", "", "", "", ""]);
  });

  it("totais somam pessoas e faixas", () => {
    expect(linhas[3].slice(0, 9)).toEqual(["Total", "", 5, "", 4, 2, 1, 1, 0]);
  });
});

describe("larguraDasColunas", () => {
  it("cabeçalho cabe, texto longo para no teto e o recado é largo", () => {
    const larguras = larguraDasColunas([
      ["Convite", "Pessoas no convite", "Nomes de quem vai", "Recado"],
      ["Família Silva", 4, "x".repeat(200), "Felicidades!"],
    ]);
    expect(larguras[0]).toBeGreaterThanOrEqual(Math.round("Família Silva".length * 7.5));
    expect(larguras[1]).toBeGreaterThanOrEqual(Math.round("Pessoas no convite".length * 8.5));
    expect(larguras[2]).toBe(280);
    expect(larguras[3]).toBe(360);
  });
});

describe("corDaLinha", () => {
  const com = (situacao: string) => CABECALHO.map((c) => (c === "Situação" ? situacao : ""));
  it("verde para quem confirmou ou chegou, vermelho para quem não vai, amarelo para o resto", () => {
    expect(corDaLinha(com("Confirmou"))).toEqual(COR_SITUACAO.confirmou);
    expect(corDaLinha(com("Chegou"))).toEqual(COR_SITUACAO.confirmou);
    expect(corDaLinha(com("Não vai"))).toEqual(COR_SITUACAO.naoVai);
    for (const s of ["Não enviado", "Enviado", "Abriu o convite"]) {
      expect(corDaLinha(com(s))).toEqual(COR_SITUACAO.pendente);
    }
  });
});
