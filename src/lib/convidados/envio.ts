// Envio dos convites pelo WhatsApp, um por um, no ritmo que não chama a atenção do
// WhatsApp, e o acompanhamento de se as mensagens estão chegando.

// Depois de tantos envios seguidos, a fila sugere uma pausa.
export const ENVIOS_POR_LOTE = 20;
export const PAUSA_ENTRE_LOTES_MS = 5 * 60 * 1000;

// Alerta de "não está chegando": olha só envios com mais de um dia (tempo para a pessoa ver)
// e só quando já são vários, para um convidado distraído não disparar o aviso.
const ESPERA_PARA_AVALIAR_MS = 24 * 60 * 60 * 1000;
const MINIMO_PARA_AVALIAR = 10;
const TAXA_MINIMA_DE_ABERTURA = 0.2;

type Envio = {
  id: string;
  telefone: string | null;
  rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
  enviadoEm: Date | null;
  abertoEm: Date | null;
  respondidoEm: Date | null;
};

// Quem respondeu, abriu o link (mesmo que não lembre de ter aberto).
const abriu = (c: Envio) => !!c.abertoEm || !!c.respondidoEm || c.rsvp !== "PENDENTE";

// Fila: quem tem WhatsApp, ainda não recebeu e não respondeu, na ordem da lista;
// os que ela pulou nesta rodada vão para o fim.
export function filaDeEnvio<T extends Envio>(convidados: T[], pulados: string[] = []): T[] {
  const faltam = convidados.filter((c) => c.telefone && !c.enviadoEm && c.rsvp === "PENDENTE");
  const pulou = new Set(pulados);
  return [
    ...faltam.filter((c) => !pulou.has(c.id)),
    ...pulados.flatMap((id) => faltam.filter((c) => c.id === id)),
  ];
}

export function resumoDoEnvio(convidados: Envio[], agora = new Date()) {
  const enviados = convidados.filter((c) => c.enviadoEm);
  const antigos = enviados.filter(
    (c) => agora.getTime() - c.enviadoEm!.getTime() >= ESPERA_PARA_AVALIAR_MS,
  );
  const antigosQueAbriram = antigos.filter(abriu).length;
  return {
    enviados: enviados.length,
    abriram: enviados.filter(abriu).length,
    responderam: enviados.filter((c) => c.rsvp !== "PENDENTE").length,
    semWhatsApp: convidados.filter((c) => !c.telefone && !c.enviadoEm).length,
    // Muitos envios antigos e quase ninguém abriu: as mensagens podem não estar chegando.
    alerta:
      antigos.length >= MINIMO_PARA_AVALIAR &&
      antigosQueAbriram / antigos.length < TAXA_MINIMA_DE_ABERTURA,
  };
}
