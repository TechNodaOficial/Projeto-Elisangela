import { festaConcluida } from "@/lib/datas";

export type EstadoConvite = "aberto" | "confirmado" | "recusado" | "presente" | "encerrado";

// O convidado pode responder e mudar de ideia até o dia da festa (inclusive).
// Depois da entrada registrada ou do dia da festa, a página só informa.
export function estadoConvite(
  c: { rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO"; presenteEm: Date | null; dataHora: Date },
  agora = new Date(),
): EstadoConvite {
  if (c.presenteEm) return "presente";
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
