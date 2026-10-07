// Parcelamento do valor de um serviço. Tudo em centavos.

export const PARCELAS_MAXIMO = 24;

// Valor de cada parcela. Os centavos que sobram da divisão vão nas primeiras,
// para a soma sempre bater com o total.
export function dividirEmParcelas(totalCentavos: number, parcelas: number): number[] {
  const base = Math.floor(totalCentavos / parcelas);
  const sobra = totalCentavos - base * parcelas;
  return Array.from({ length: parcelas }, (_, i) => base + (i < sobra ? 1 : 0));
}

// Quanto já foi pago, somando as primeiras `pagas` parcelas.
export function valorPago(totalCentavos: number, parcelas: number, pagas: number): number {
  return dividirEmParcelas(totalCentavos, parcelas)
    .slice(0, pagas)
    .reduce((soma, v) => soma + v, 0);
}
