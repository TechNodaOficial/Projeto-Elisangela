const minutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
// Sem horário de fim, conta 1 hora de duração para saber se já passou.
const DURACAO_PADRAO = 60;

export type Momento = "passou" | "agora" | "proximo" | undefined;

// Situação de cada compromisso de hoje em relação à hora atual: já passou (esmaece),
// acontecendo agora, ou o próximo da fila. Em outros dias, nenhuma.
export function momentosDoDia(
  compromissos: { id: string; hora: string; horaFim: string }[],
  agora?: string,
): Map<string, Momento> {
  const mapa = new Map<string, Momento>();
  if (agora === undefined) return mapa;
  const atual = minutos(agora);
  let achouProximo = false;
  for (const c of [...compromissos].sort((a, b) => a.hora.localeCompare(b.hora))) {
    const inicio = minutos(c.hora);
    const fim = c.horaFim ? minutos(c.horaFim) : inicio + DURACAO_PADRAO;
    if (fim <= atual) mapa.set(c.id, "passou");
    else if (inicio <= atual) mapa.set(c.id, "agora");
    else if (!achouProximo) {
      mapa.set(c.id, "proximo");
      achouProximo = true;
    }
  }
  return mapa;
}
