import { diasAte, festaConcluida, paraCampos } from "@/lib/datas";

// Prazo do convite, contado em dias de calendário de São Paulo até a festa:
// - até 10 dias antes (inclusive): responder (vou / não vou) e mudar à vontade;
// - depois: travado; quem não respondeu não responde mais, quem recusou não confirma,
//   e quem confirmou só pode desistir ou diminuir o número de pessoas.
export const DIAS_PRAZO = 10;

export type FaseConvite = "aberto" | "travado" | "encerrado";

export function faseDoConvite(dataHora: Date, agora = new Date()): FaseConvite {
  if (festaConcluida(dataHora, agora)) return "encerrado";
  return diasAte(dataHora, agora) >= DIAS_PRAZO ? "aberto" : "travado";
}

// Último dia do prazo, como "10/12".
export function prazoDoConvite(dataHora: Date): string {
  const [a, m, d] = paraCampos(dataHora).data.split("-").map(Number);
  const dia = new Date(Date.UTC(a, m - 1, d - DIAS_PRAZO));
  return `${String(dia.getUTCDate()).padStart(2, "0")}/${String(dia.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Se a resposta pedida cabe no prazo. Devolve a mensagem de erro, ou null se pode.
export function erroDePrazo(
  convite: {
    rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
    pessoas: number;
    confirmadas: number | null;
  },
  resposta: "CONFIRMADO" | "RECUSADO",
  quantas: number,
  fase: FaseConvite,
): string | null {
  if (fase === "encerrado") return "Esta festa já aconteceu.";
  if (fase === "aberto") return null;
  if (convite.rsvp === "PENDENTE") {
    return "O prazo para responder terminou. Se ainda quiser ir, fale com a Elisangela.";
  }
  // Depois do prazo: só desistir ou diminuir.
  if (resposta === "RECUSADO") return null;
  if (convite.rsvp === "CONFIRMADO" && quantas <= (convite.confirmadas ?? convite.pessoas)) {
    return null;
  }
  return "Faltam menos de 10 dias para a festa: não dá mais para confirmar nem aumentar o número de pessoas. Fale com a Elisangela.";
}
