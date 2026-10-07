import { limiteDeEntrada } from "@/lib/checkin/avaliar";
import { festaConcluida } from "@/lib/datas";

export type EstadoConvite = "aberto" | "confirmado" | "recusado" | "presente" | "encerrado";

// O convidado pode responder e mudar de ideia até o dia da festa (inclusive).
// Depois que todos do convite entraram, ou do dia da festa, a página só informa. Família
// que entrou em partes (3 de 4) continua "confirmado": quem chega depois usa o mesmo QR.
export function estadoConvite(
  c: {
    rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
    pessoas: number;
    confirmadas: number | null;
    entraram: number;
    dataHora: Date;
  },
  agora = new Date(),
): EstadoConvite {
  if (c.entraram > 0 && c.entraram >= limiteDeEntrada(c)) return "presente";
  if (festaConcluida(c.dataHora, agora)) return "encerrado";
  if (c.rsvp === "CONFIRMADO") return "confirmado";
  if (c.rsvp === "RECUSADO") return "recusado";
  return "aberto";
}

// Tokens são gerados com 16 bytes em base64url (src/lib/tokens.ts): 22 caracteres.
// Recusar outros formatos evita consulta ao banco para links mal copiados.
export function pareceToken(token: string) {
  return /^[A-Za-z0-9_-]{22}$/.test(token);
}
