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

// ── Idades (faixas do buffet) ───────────────────────────────────────────────
// 0 a 3 anos não pagam o buffet; 4 a 11 pagam menos; 12+ conta como adulto.

export type FaixaIdade = "adulto" | "4a11" | "0a3";

export const ROTULO_FAIXA: Record<FaixaIdade, string> = {
  adulto: "Adulto",
  "4a11": "4 a 11 anos",
  "0a3": "0 a 3 anos",
};

type ComIdades = Omit<Grupo, "entraram"> & {
  criancas4a11: number | null;
  criancas0a3: number | null;
};

export type Faixas = {
  adultos: number;
  criancas4a11: number;
  criancas0a3: number;
  semIdade: number;
};

// Quem vai de um convite, por faixa. Convite de uma pessoa só conta como adulto (o convite
// não pergunta a idade). Família que confirmou sem dizer as idades fica em `semIdade`.
export function faixasDe(c: ComIdades): Faixas {
  const n = confirmadasDe(c);
  if (n === 0) return { adultos: 0, criancas4a11: 0, criancas0a3: 0, semIdade: 0 };
  if (c.pessoas === 1) return { adultos: n, criancas4a11: 0, criancas0a3: 0, semIdade: 0 };
  if (c.criancas4a11 === null || c.criancas0a3 === null) {
    return { adultos: 0, criancas4a11: 0, criancas0a3: 0, semIdade: n };
  }
  // Se o grupo diminuiu depois, as crianças nunca passam de quem vai.
  const c0a3 = Math.min(c.criancas0a3, n);
  const c4a11 = Math.min(c.criancas4a11, n - c0a3);
  return { adultos: n - c0a3 - c4a11, criancas4a11: c4a11, criancas0a3: c0a3, semIdade: 0 };
}

export function somarFaixas(convidados: ComIdades[]): Faixas {
  return convidados.map(faixasDe).reduce(
    (s, f) => ({
      adultos: s.adultos + f.adultos,
      criancas4a11: s.criancas4a11 + f.criancas4a11,
      criancas0a3: s.criancas0a3 + f.criancas0a3,
      semIdade: s.semIdade + f.semIdade,
    }),
    { adultos: 0, criancas4a11: 0, criancas0a3: 0, semIdade: 0 },
  );
}

// As crianças, uma entrada por faixa de idade que tem alguém: quantas e de que idade.
export function criancasPorIdade(f: Faixas): { n: number; idade: string }[] {
  return [
    { n: f.criancas4a11, idade: ROTULO_FAIXA["4a11"] },
    { n: f.criancas0a3, idade: ROTULO_FAIXA["0a3"] },
  ].filter((c) => c.n > 0);
}

// "2 adultos · 1 de 4 a 11 · 1 de 0 a 3" (só as faixas que têm alguém).
export function descreverFaixas(f: Faixas): string {
  return [
    f.adultos && `${f.adultos} ${f.adultos === 1 ? "adulto" : "adultos"}`,
    f.criancas4a11 && `${f.criancas4a11} de 4 a 11`,
    f.criancas0a3 && `${f.criancas0a3} de 0 a 3`,
    f.semIdade && `${f.semIdade} sem idade informada`,
  ]
    .filter(Boolean)
    .join(" · ");
}
