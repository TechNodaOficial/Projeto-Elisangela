// Regras de formatação e ordem usadas nas colunas da festa.

// "1.500", "1500,5", "R$ 1.500,00" → centavos. Vazio → null. Inválido → undefined.
export function lerValorEmCentavos(entrada: string): number | null | undefined {
  const limpo = entrada.replace(/R\$|\s/g, "");
  if (!limpo) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return undefined;
  const [inteiro, decimal = ""] = limpo.replace(/\./g, "").split(",");
  return Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));
}

const REAIS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// 150000 → "R$ 1.500,00"
export function formatarReais(centavos: number): string {
  return REAIS.format(centavos / 100).replace(/ /g, " ");
}

// 150000 → "1.500,00" (para preencher o campo ao editar)
export function centavosParaCampo(centavos: number | null): string {
  if (centavos === null) return "";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(centavos / 100);
}

// Antes das 06:00 é madrugada: vem depois dos horários da noite.
const INICIO_DO_DIA_MIN = 6 * 60;

export function chaveHorario(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  const minutos = h * 60 + m;
  return minutos < INICIO_DO_DIA_MIN ? minutos + 24 * 60 : minutos;
}

const NOMES = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

// "Mesa 2" antes de "Mesa 10"; acentos junto da letra base.
export function compararNomes(a: string, b: string): number {
  return NOMES.compare(a, b);
}
