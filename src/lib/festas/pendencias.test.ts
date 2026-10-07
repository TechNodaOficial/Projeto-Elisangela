import { describe, expect, it } from "vitest";

import { pendenciasDaFesta } from "./pendencias";

const contratacao = (
  extra: Partial<Parameters<typeof pendenciasDaFesta>[0]["contratacoes"][number]> = {},
) => ({
  servico: { nome: "Buffet" },
  fornecedorId: "f1",
  valorCentavos: 50000,
  parcelas: 1,
  parcelasPagas: 1,
  checklist: [{ feito: true }],
  ...extra,
});

describe("pendenciasDaFesta", () => {
  it("festa sem serviços ou com tudo resolvido não tem pendência", () => {
    expect(pendenciasDaFesta({ contratacoes: [] })).toEqual([]);
    expect(pendenciasDaFesta({ contratacoes: [contratacao()] })).toEqual([]);
  });

  it("aponta fornecedor não escolhido, pagamento, valor e checklist", () => {
    expect(
      pendenciasDaFesta({
        contratacoes: [
          contratacao({ fornecedorId: null, servico: { nome: "DJ e som" } }),
          contratacao({ parcelas: 3, parcelasPagas: 2 }),
          contratacao({ parcelasPagas: 0, servico: { nome: "Decoração" } }),
          contratacao({ valorCentavos: null, parcelasPagas: 0 }),
          contratacao({ checklist: [{ feito: false }, { feito: false }, { feito: true }] }),
        ],
      }),
    ).toEqual([
      "sem fornecedor: DJ e som",
      "2 serviços a pagar",
      "1 serviço com valor a definir",
      "2 itens do checklist em aberto",
    ]);
  });
});
