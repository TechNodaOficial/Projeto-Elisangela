// Tudo que é exibido ou digitado pela Elisangela está no horário de São Paulo;
// o banco guarda instantes (timestamptz). Estas funções fazem a ponte.
export const FUSO = "America/Sao_Paulo";

// Diferença do fuso em relação ao UTC, em minutos, num dado instante (ex.: -180).
function deslocamentoMinutos(instante: Date): number {
  const nome = new Intl.DateTimeFormat("en-US", { timeZone: FUSO, timeZoneName: "longOffset" })
    .formatToParts(instante)
    .find((parte) => parte.type === "timeZoneName")?.value;
  const m = nome?.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0; // "GMT" puro = UTC
  const minutos = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === "-" ? -minutos : minutos;
}

// "2026-12-12" + "19:30" no horário de São Paulo → instante.
export function paraInstante(data: string, hora: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  const comoUtc = Date.UTC(ano, mes - 1, dia, h, min);
  return new Date(comoUtc - deslocamentoMinutos(new Date(comoUtc)) * 60_000);
}

// Instante → { data: "2026-12-12", hora: "19:30" } no horário de São Paulo (para formulários).
export function paraCampos(instante: Date): { data: string; hora: string } {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: FUSO,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instante)
      .map((p) => [p.type, p.value]),
  );
  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

// Meia-noite de hoje em São Paulo. Festas a partir daqui são pendentes; antes, concluídas.
export function inicioDeHoje(agora = new Date()): Date {
  return paraInstante(paraCampos(agora).data, "00:00");
}

export function festaConcluida(dataHora: Date, agora = new Date()): boolean {
  return dataHora < inicioDeHoje(agora);
}

// Partes para exibir uma data: { dia: "12", mes: "dez", semana: "sáb", ano: "2026", hora: "19:30" }.
export function partesData(instante: Date) {
  const formatar = (opcoes: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...opcoes }).format(instante);
  return {
    dia: formatar({ day: "2-digit" }),
    mes: formatar({ month: "short" }).replace(".", ""),
    semana: formatar({ weekday: "short" }).replace(".", ""),
    ano: formatar({ year: "numeric" }),
    hora: paraCampos(instante).hora,
    extenso: formatar({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  };
}

// Dias de calendário (em São Paulo) entre hoje e a data: 0 = hoje, 1 = amanhã, -1 = ontem.
export function diasAte(instante: Date, agora = new Date()): number {
  const diaUtc = (d: Date) => {
    const [a, m, dd] = paraCampos(d).data.split("-").map(Number);
    return Date.UTC(a, m - 1, dd);
  };
  return Math.round((diaUtc(instante) - diaUtc(agora)) / 86_400_000);
}

export function rotuloProximidade(dias: number): string {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  if (dias > 1) return `Em ${dias} dias`;
  if (dias === -1) return "Ontem";
  return `Há ${-dias} dias`;
}
