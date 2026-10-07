// Contagens de uma festa em pessoas, não em convites: "Família Silva" vale 4.

type Grupo = {
  rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
  pessoas: number;
  confirmadas: number | null;
  entraram: number;
};

// Pessoas que vão, de um convite confirmado (nunca mais que o tamanho do grupo).
export const confirmadasDe = (c: Omit<Grupo, "entraram">) =>
  c.rsvp === "CONFIRMADO" ? Math.min(c.confirmadas ?? c.pessoas, c.pessoas) : 0;

// Lugares que o convite ocupa na mesa: confirmou, as confirmadas; recusou, nenhum;
// ainda não respondeu, o grupo todo (para não faltar cadeira).
export const lugaresDe = (c: Omit<Grupo, "entraram">) =>
  c.rsvp === "CONFIRMADO" ? confirmadasDe(c) : c.rsvp === "RECUSADO" ? 0 : c.pessoas;

// total = confirmados + recusados + aguardando. Quem ficou de fora de uma família que
// confirmou só parte (confirmou 3 de 4) conta como "não vão".
export function contarPorStatus(convidados: Grupo[]) {
  const soma = (f: (c: Grupo) => number) => convidados.reduce((s, c) => s + f(c), 0);
  return {
    total: soma((c) => c.pessoas),
    confirmados: soma(confirmadasDe),
    recusados: soma((c) =>
      c.rsvp === "RECUSADO"
        ? c.pessoas
        : c.rsvp === "CONFIRMADO"
          ? c.pessoas - confirmadasDe(c)
          : 0,
    ),
    aguardando: soma((c) => (c.rsvp === "PENDENTE" ? c.pessoas : 0)),
    presentes: soma((c) => c.entraram),
  };
}
