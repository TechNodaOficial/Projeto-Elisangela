// Regras do check-in na porta, em ordem: um QR desconhecido ou de outra festa nunca
// entra; quem já entrou é barrado (QR repassado ou print); quem não confirmou presença
// fica para a Elisangela decidir; o resto entra.

type Rsvp = "PENDENTE" | "CONFIRMADO" | "RECUSADO";

export type ConvidadoLido = {
  id: string;
  nome: string;
  festaId: string;
  festaTitulo: string;
  rsvp: Rsvp;
  presenteEm: Date | null;
  mesa: string | null;
};

export type ResultadoLeitura =
  | { tipo: "liberado"; id: string; nome: string; mesa: string | null }
  | { tipo: "ja-entrou"; id: string; nome: string; mesa: string | null; hora: Date }
  | { tipo: "nao-confirmou"; id: string; nome: string; mesa: string | null; rsvp: Rsvp }
  | { tipo: "outra-festa"; nome: string; festaTitulo: string }
  | { tipo: "desconhecido" };

export function avaliarLeitura(
  convidado: ConvidadoLido | null,
  festaId: string,
  { deixarEntrar = false } = {},
): ResultadoLeitura {
  if (!convidado) return { tipo: "desconhecido" };
  const { id, nome, mesa } = convidado;
  if (convidado.festaId !== festaId) {
    return { tipo: "outra-festa", nome, festaTitulo: convidado.festaTitulo };
  }
  if (convidado.presenteEm)
    return { tipo: "ja-entrou", id, nome, mesa, hora: convidado.presenteEm };
  if (convidado.rsvp !== "CONFIRMADO" && !deixarEntrar) {
    return { tipo: "nao-confirmou", id, nome, mesa, rsvp: convidado.rsvp };
  }
  return { tipo: "liberado", id, nome, mesa };
}
