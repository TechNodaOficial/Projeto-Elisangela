import { lugaresDe } from "@/lib/convidados/contagem";

// Vagas das mesas na hora da festa, para sentar quem chega sem mesa (ou trocar de mesa).
// Duas contas por mesa:
// - vagas: lugares menos o reservado (quem confirmou; se entrou mais gente, quem entrou);
// - livresAgora: lugares menos quem já entrou, contando as cadeiras de quem não chegou.

type Mesa = { id: string; nome: string; lugares: number };
type Convidado = {
  id: string;
  mesaId: string | null;
  rsvp: "PENDENTE" | "CONFIRMADO" | "RECUSADO";
  pessoas: number;
  confirmadas: number | null;
  entraram: number;
};

export type VagaMesa = Mesa & {
  vagas: number;
  livresAgora: number;
  // Confirmados da mesa que ainda não chegaram (as cadeiras que só estão "livres agora").
  aguardando: number;
  // Cabe o grupo sem usar a cadeira de ninguém que confirmou.
  cabe: boolean;
  // Cabe só usando cadeiras de quem confirmou e ainda não chegou.
  cabeAgora: boolean;
};

export function vagasDasMesas(
  mesas: Mesa[],
  convidados: Convidado[],
  { sentando, precisa }: { sentando: string; precisa: number },
): VagaMesa[] {
  return mesas
    .map((mesa) => {
      const daMesa = convidados.filter((c) => c.mesaId === mesa.id && c.id !== sentando);
      const reservadas = daMesa.reduce((s, c) => s + Math.max(lugaresDe(c), c.entraram), 0);
      const presentes = daMesa.reduce((s, c) => s + c.entraram, 0);
      const vagas = mesa.lugares - reservadas;
      const livresAgora = mesa.lugares - presentes;
      return {
        ...mesa,
        vagas,
        livresAgora,
        aguardando: reservadas - presentes,
        cabe: vagas >= precisa,
        cabeAgora: livresAgora >= precisa,
      };
    })
    .sort(
      (a, b) =>
        Number(b.cabe) - Number(a.cabe) ||
        Number(b.cabeAgora) - Number(a.cabeAgora) ||
        b.vagas - a.vagas ||
        b.livresAgora - a.livresAgora ||
        a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }),
    );
}
