// Em que ponto está cada convite, do envio até a porta. Uma etapa só por convite,
// a mais adiantada: quem respondeu já recebeu; quem chegou já respondeu.

export type Etapa = "nao_enviado" | "enviado" | "abriu" | "confirmou" | "nao_vai" | "chegou";

type Convite = {
  rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
  enviadoEm: Date | null;
  abertoEm: Date | null;
  entraram: number;
};

export function etapaDoConvite(c: Convite): Etapa {
  if (c.entraram > 0) return "chegou";
  if (c.rsvp === "CONFIRMADO") return "confirmou";
  if (c.rsvp === "RECUSADO") return "nao_vai";
  if (c.abertoEm) return "abriu";
  if (c.enviadoEm) return "enviado";
  return "nao_enviado";
}

// Filtros da lista de convidados, na ordem do trabalho dela: mandar, cobrar, conferir.
export const FILTROS = [
  { id: "todos", rotulo: "Todos" },
  { id: "nao_enviado", rotulo: "Não enviados" },
  { id: "sem_resposta", rotulo: "Enviados, sem resposta" },
  { id: "confirmou", rotulo: "Confirmaram" },
  { id: "nao_vai", rotulo: "Não vão" },
  { id: "sem_whatsapp", rotulo: "Sem WhatsApp" },
] as const;

export type Filtro = (typeof FILTROS)[number]["id"];

export function passaNoFiltro(c: Convite & { telefone: string | null }, filtro: Filtro) {
  const etapa = etapaDoConvite(c);
  switch (filtro) {
    case "todos":
      return true;
    case "sem_resposta":
      return etapa === "enviado" || etapa === "abriu";
    case "confirmou":
      return etapa === "confirmou" || etapa === "chegou";
    case "sem_whatsapp":
      return !c.telefone;
    default:
      return etapa === filtro;
  }
}
