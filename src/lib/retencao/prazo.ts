// LGPD e arquivo da festa. Depois da festa, todos os dados dela (convidados, padrinhos,
// fornecedores, mesas, cronograma, observações, arquivos) são apagados; fica só o cartão
// (nome, data, local e as contagens).
// - A partir de 30 dias: apaga se o PDF completo já foi baixado (ela guarda o arquivo).
// - Aos 90 dias: apaga de qualquer jeito, para o prazo prometido na página de privacidade
//   valer mesmo que o PDF nunca seja baixado.
export const DIAS_ARQUIVO = 30;
export const DIAS_RETENCAO = 90;

const DIA_MS = 24 * 60 * 60 * 1000;

const antes = (agora: Date, dias: number) => new Date(agora.getTime() - dias * DIA_MS);
const depois = (dataHora: Date, dias: number) => new Date(dataHora.getTime() + dias * DIA_MS);

// Festas com data anterior a estes instantes já podem ser apagadas
// (com PDF baixado / de qualquer jeito).
export const limiteArquivo = (agora = new Date()) => antes(agora, DIAS_ARQUIVO);
export const limiteRetencao = (agora = new Date()) => antes(agora, DIAS_RETENCAO);

// A partir de quando os dados da festa podem ser apagados (com o PDF baixado).
export const apagamentoPrevisto = (dataHora: Date) => depois(dataHora, DIAS_ARQUIVO);
// Quando são apagados mesmo sem o PDF.
export const apagamentoMaximo = (dataHora: Date) => depois(dataHora, DIAS_RETENCAO);

// A festa entra na limpeza de hoje?
export function podeApagar(
  festa: { dataHora: Date; pdfCompletoEm: Date | null },
  agora = new Date(),
): boolean {
  if (festa.dataHora < limiteRetencao(agora)) return true;
  return festa.pdfCompletoEm !== null && festa.dataHora < limiteArquivo(agora);
}
