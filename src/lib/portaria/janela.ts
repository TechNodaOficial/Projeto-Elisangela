// O link da portaria (ajudantes que leem os QR na entrada) só funciona perto da festa:
// de 6 horas antes até 12 horas depois do horário marcado.
export const HORAS_ANTES = 6;
export const HORAS_DEPOIS = 12;

const HORA_MS = 60 * 60 * 1000;

export function janelaPortaria(dataHora: Date) {
  return {
    abre: new Date(dataHora.getTime() - HORAS_ANTES * HORA_MS),
    fecha: new Date(dataHora.getTime() + HORAS_DEPOIS * HORA_MS),
  };
}

export type SituacaoPortaria = "antes" | "aberta" | "encerrada";

export function situacaoPortaria(dataHora: Date, agora = new Date()): SituacaoPortaria {
  const { abre, fecha } = janelaPortaria(dataHora);
  if (agora < abre) return "antes";
  if (agora >= fecha) return "encerrada";
  return "aberta";
}

// PIN de 4 dígitos, sempre com os zeros à esquerda ("0427").
export const pinValido = (pin: string) => /^\d{4}$/.test(pin);
