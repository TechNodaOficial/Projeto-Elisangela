type Contratacao = {
  servico: { nome: string };
  fornecedorId: string | null;
  valorCentavos: number | null;
  parcelas: number;
  parcelasPagas: number;
  checklist: { feito: boolean }[];
};

// O que ainda falta resolver numa festa. Lista vazia = tudo resolvido (verde no calendário).
// Para considerar mais coisas como pendência, acrescente aqui.
export function pendenciasDaFesta(festa: { contratacoes: Contratacao[] }): string[] {
  const n = (quantos: number, um: string, varios: string) =>
    `${quantos} ${quantos === 1 ? um : varios}`;
  const c = festa.contratacoes;

  const semFornecedor = c.filter((x) => !x.fornecedorId).map((x) => x.servico.nome);
  const semValor = c.filter((x) => x.valorCentavos === null).length;
  const aPagar = c.filter((x) => x.valorCentavos !== null && x.parcelasPagas < x.parcelas).length;
  const itensAbertos = c.reduce((soma, x) => soma + x.checklist.filter((i) => !i.feito).length, 0);

  const pendencias: string[] = [];
  if (semFornecedor.length > 0) pendencias.push(`sem fornecedor: ${semFornecedor.join(", ")}`);
  if (aPagar > 0) pendencias.push(`${n(aPagar, "serviço", "serviços")} a pagar`);
  if (semValor > 0) pendencias.push(`${n(semValor, "serviço", "serviços")} com valor a definir`);
  if (itensAbertos > 0) {
    pendencias.push(`${n(itensAbertos, "item", "itens")} do checklist em aberto`);
  }
  return pendencias;
}
