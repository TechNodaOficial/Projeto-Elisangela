// LGPD: os dados dos convidados (nome, telefone, resposta, entrada) ficam guardados
// até 90 dias depois da festa; depois disso só sobram as contagens na festa.
export const DIAS_RETENCAO = 90;

const DIA_MS = 24 * 60 * 60 * 1000;

// Festas com data anterior a este instante já podem ter os convidados apagados.
export function limiteRetencao(agora = new Date()) {
  return new Date(agora.getTime() - DIAS_RETENCAO * DIA_MS);
}

// Quando os convidados de uma festa serão apagados.
export function apagamentoPrevisto(dataHora: Date) {
  return new Date(dataHora.getTime() + DIAS_RETENCAO * DIA_MS);
}
