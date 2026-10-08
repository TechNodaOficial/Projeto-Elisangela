import { describe, expect, it } from "vitest";

import { situacoesDoQuadro } from "./quadro";

const vazio = {
  contratacoes: [],
  convidados: { total: 0, aguardando: 0, confirmados: 0 },
  temCroqui: false,
  mesas: 0,
  pessoasSemMesa: 0,
  cronograma: 0,
  menu: 0,
  cerimonial: 0,
  entradas: 0,
  padrinhos: [],
};

describe("situacoesDoQuadro", () => {
  it("festa recém-criada: tudo neutro, menos o croqui que falta", () => {
    const s = situacoesDoQuadro(vazio);
    expect(s.fornecedores.situacao).toBe("neutro");
    expect(s.convidados.situacao).toBe("neutro");
    expect(s.layout.situacao).toBe("neutro");
    expect(s.padrinhos.situacao).toBe("neutro");
    expect(s.croqui).toEqual({ situacao: "pendente", resumo: "Falta a planta do salão" });
  });

  it("amarelo onde falta algo", () => {
    const s = situacoesDoQuadro({
      ...vazio,
      contratacoes: [
        {
          servico: { nome: "Buffet" },
          fornecedorId: null,
          contratoNome: null,
          valorCentavos: null,
          parcelas: 1,
          parcelasPagas: 0,
          checklist: [],
        },
      ],
      convidados: { total: 10, aguardando: 3, confirmados: 6 },
      mesas: 2,
      pessoasSemMesa: 4,
      padrinhos: [
        { itens: 4, feitos: 4 },
        { itens: 4, feitos: 1 },
      ],
    });
    expect(s.fornecedores).toEqual({
      situacao: "pendente",
      resumo: "3 pendências",
      detalhes: [
        "sem fornecedor: Buffet",
        "1 serviço sem contrato",
        "1 serviço com valor a definir",
      ],
    });
    expect(s.convidados).toEqual({
      situacao: "pendente",
      resumo: "3 sem resposta · 6 confirmados",
    });
    expect(s.layout).toEqual({ situacao: "pendente", resumo: "4 pessoas sem mesa · 2 mesas" });
    expect(s.padrinhos).toEqual({ situacao: "pendente", resumo: "1 de 2 com tudo marcado" });
  });

  it("verde quando está resolvido", () => {
    const s = situacoesDoQuadro({
      ...vazio,
      convidados: { total: 10, aguardando: 0, confirmados: 8 },
      temCroqui: true,
      mesas: 2,
      padrinhos: [{ itens: 4, feitos: 4 }],
    });
    expect(s.convidados.situacao).toBe("ok");
    expect(s.croqui.situacao).toBe("ok");
    expect(s.layout).toEqual({ situacao: "ok", resumo: "Todos com mesa · 2 mesas" });
    expect(s.padrinhos.situacao).toBe("ok");
  });

  it("partes sem pendência definida só resumem", () => {
    const s = situacoesDoQuadro({ ...vazio, cronograma: 5, menu: 1, entradas: 7 });
    expect(s.cronograma).toEqual({ situacao: "neutro", resumo: "5 horários · 1 item no menu" });
    expect(s.entradas).toEqual({ situacao: "neutro", resumo: "7 entradas no cortejo" });
  });
});
