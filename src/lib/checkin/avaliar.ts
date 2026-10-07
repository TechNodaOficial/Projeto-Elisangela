// Regras do check-in na porta. Um convite pode ser de uma família (um QR para 4 pessoas),
// que pode chegar em partes: 3 agora, 1 depois. Em ordem: um QR desconhecido ou de outra
// festa nunca entra; se todos os esperados já entraram, barra (QR repassado ou print);
// quem não confirmou presença fica para a Elisangela decidir; o resto entra.

type Rsvp = "PENDENTE" | "CONFIRMADO" | "RECUSADO";

export type ConvidadoLido = {
  id: string;
  nome: string;
  festaId: string;
  festaTitulo: string;
  rsvp: Rsvp;
  pessoas: number;
  confirmadas: number | null;
  entraram: number;
  presenteEm: Date | null;
  mesa: string | null;
};

type Grupo = { id: string; nome: string; mesa: string | null; pessoas: number };

export type ResultadoLeitura =
  // entrando: quantos entram agora (os que faltam); antes: quantos já tinham entrado.
  | (Grupo & { tipo: "liberado"; entrando: number; antes: number; limite: number })
  | (Grupo & { tipo: "ja-entrou"; hora: Date; entraram: number; limite: number })
  | (Grupo & { tipo: "nao-confirmou"; rsvp: Rsvp })
  | { tipo: "outra-festa"; nome: string; festaTitulo: string }
  | { tipo: "desconhecido" };

// Quantas pessoas do grupo podem entrar. Confirmou: as que confirmou. "Deixar entrar"
// (ou já entrou alguém sem confirmar): o grupo todo.
export function limiteDeEntrada(
  c: Pick<ConvidadoLido, "rsvp" | "pessoas" | "confirmadas">,
  deixarEntrar = false,
) {
  if (deixarEntrar || c.rsvp !== "CONFIRMADO") return c.pessoas;
  return Math.min(c.confirmadas ?? c.pessoas, c.pessoas);
}

export function avaliarLeitura(
  convidado: ConvidadoLido | null,
  festaId: string,
  { deixarEntrar = false } = {},
): ResultadoLeitura {
  if (!convidado) return { tipo: "desconhecido" };
  const { id, nome, mesa, pessoas, entraram } = convidado;
  if (convidado.festaId !== festaId) {
    return { tipo: "outra-festa", nome, festaTitulo: convidado.festaTitulo };
  }
  const grupo = { id, nome, mesa, pessoas };

  const autorizado = convidado.rsvp === "CONFIRMADO" || deixarEntrar || entraram > 0;
  const limite = limiteDeEntrada(convidado, deixarEntrar);
  if (entraram > 0 && entraram >= limite) {
    return {
      ...grupo,
      tipo: "ja-entrou",
      hora: convidado.presenteEm ?? new Date(0),
      entraram,
      limite,
    };
  }
  if (!autorizado) return { ...grupo, tipo: "nao-confirmou", rsvp: convidado.rsvp };
  return { ...grupo, tipo: "liberado", entrando: limite - entraram, antes: entraram, limite };
}
