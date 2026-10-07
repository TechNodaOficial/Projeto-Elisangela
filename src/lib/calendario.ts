import { paraCampos } from "./datas";

export type Mes = { ano: number; mes: number }; // mes: 1 a 12
export type DiaGrade = { data: string; dia: number; doMes: boolean }; // data: "2026-10-31"

const doisDigitos = (n: number) => String(n).padStart(2, "0");
const chave = ({ ano, mes }: Mes) => `${ano}-${doisDigitos(mes)}`;

// "?mes=2026-11" → { ano: 2026, mes: 11 }; sem mês ou inválido, o mês atual em São Paulo.
export function lerMes(valor: string | undefined, agora = new Date()): Mes {
  const m = valor?.match(/^(\d{4})-(\d{2})$/);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return { ano: Number(m[1]), mes: Number(m[2]) };
  const [ano, mes] = paraCampos(agora).data.split("-").map(Number);
  return { ano, mes };
}

// "?ano=2027" → 2027; sem ano ou inválido, o ano atual em São Paulo.
export function lerAno(valor: string | undefined, agora = new Date()): number {
  const n = Number(valor);
  if (valor && /^\d{4}$/.test(valor) && n >= 2000 && n <= 2100) return n;
  return Number(paraCampos(agora).data.slice(0, 4));
}

// Mês anterior (-1) ou seguinte (+1), no formato do endereço.
export function mesVizinho({ ano, mes }: Mes, delta: number): string {
  const d = new Date(Date.UTC(ano, mes - 1 + delta, 1));
  return chave({ ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 });
}

// Semanas do mês, de domingo a sábado, completadas com os dias dos meses vizinhos.
// Conta em UTC só como calendário (sem horário), então não sofre com fuso.
export function gradeDoMes({ ano, mes }: Mes): DiaGrade[][] {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1));
  const ultimo = new Date(Date.UTC(ano, mes, 0));
  const inicio = Date.UTC(ano, mes - 1, 1 - primeiro.getUTCDay());
  const totalDias = primeiro.getUTCDay() + ultimo.getUTCDate() + (6 - ultimo.getUTCDay());

  const semanas: DiaGrade[][] = [];
  for (let i = 0; i < totalDias; i++) {
    const d = new Date(inicio + i * 86_400_000);
    const dia: DiaGrade = {
      data: `${d.getUTCFullYear()}-${doisDigitos(d.getUTCMonth() + 1)}-${doisDigitos(d.getUTCDate())}`,
      dia: d.getUTCDate(),
      doMes: d.getUTCMonth() === mes - 1,
    };
    if (i % 7 === 0) semanas.push([]);
    semanas[semanas.length - 1].push(dia);
  }
  return semanas;
}
