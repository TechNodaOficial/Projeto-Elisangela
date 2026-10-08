import { pendenciasDaFesta } from "./pendencias";

// Situação de cada botão do quadro da festa: verde (resolvido), amarelo (pendência) ou
// neutro (parte sem pendência definida, ou ainda vazia), com uma linha de resumo.

export type Situacao = "ok" | "pendente" | "neutro";
// detalhes: o que falta, item por item (só quando há pendência e vale detalhar).
export type Botao = { situacao: Situacao; resumo: string; detalhes?: string[] };

const n = (q: number, um: string, varios: string) => `${q} ${q === 1 ? um : varios}`;

export function situacoesDoQuadro(d: {
  contratacoes: Parameters<typeof pendenciasDaFesta>[0]["contratacoes"];
  convidados: { total: number; aguardando: number; confirmados: number } | null; // null: apagados (LGPD)
  temCroqui: boolean;
  mesas: number;
  pessoasSemMesa: number; // confirmados (em pessoas) ainda sem mesa
  cronograma: number;
  menu: number;
  cerimonial: number;
  entradas: number;
  padrinhos: { itens: number; feitos: number }[];
}): Record<
  | "fornecedores"
  | "cronograma"
  | "convidados"
  | "croqui"
  | "layout"
  | "cerimonial"
  | "entradas"
  | "padrinhos",
  Botao
> {
  const pendencias = pendenciasDaFesta({ contratacoes: d.contratacoes });
  const padrinhosProntos = d.padrinhos.filter((p) => p.itens > 0 && p.feitos === p.itens).length;
  const c = d.convidados;

  return {
    fornecedores:
      d.contratacoes.length === 0
        ? { situacao: "neutro", resumo: "Nenhum serviço ainda" }
        : pendencias.length > 0
          ? {
              situacao: "pendente",
              resumo: n(pendencias.length, "pendência", "pendências"),
              detalhes: pendencias,
            }
          : {
              situacao: "ok",
              resumo: `${n(d.contratacoes.length, "serviço", "serviços")} resolvidos`,
            },

    cronograma: {
      situacao: "neutro",
      resumo:
        d.cronograma + d.menu === 0
          ? "Nada programado ainda"
          : `${n(d.cronograma, "horário", "horários")} · ${n(d.menu, "item", "itens")} no menu`,
    },

    convidados: !c
      ? { situacao: "neutro", resumo: "Lista apagada (LGPD)" }
      : c.total === 0
        ? { situacao: "neutro", resumo: "Nenhum convidado ainda" }
        : c.aguardando > 0
          ? {
              situacao: "pendente",
              resumo: `${c.aguardando} sem resposta · ${c.confirmados} confirmados`,
            }
          : { situacao: "ok", resumo: `Todos responderam · ${c.confirmados} confirmados` },

    croqui: d.temCroqui
      ? { situacao: "ok", resumo: "Planta do salão enviada" }
      : { situacao: "pendente", resumo: "Falta a planta do salão" },

    layout:
      d.mesas === 0 && d.pessoasSemMesa === 0
        ? { situacao: "neutro", resumo: "Nenhuma mesa ainda" }
        : d.pessoasSemMesa > 0
          ? {
              situacao: "pendente",
              resumo: `${n(d.pessoasSemMesa, "pessoa", "pessoas")} sem mesa · ${n(d.mesas, "mesa", "mesas")}`,
            }
          : { situacao: "ok", resumo: `Todos com mesa · ${n(d.mesas, "mesa", "mesas")}` },

    cerimonial: {
      situacao: "neutro",
      resumo: d.cerimonial === 0 ? "Roteiro ainda vazio" : n(d.cerimonial, "momento", "momentos"),
    },

    entradas: {
      situacao: "neutro",
      resumo:
        d.entradas === 0
          ? "Cortejo ainda vazio"
          : `${n(d.entradas, "entrada", "entradas")} no cortejo`,
    },

    padrinhos:
      d.padrinhos.length === 0
        ? { situacao: "neutro", resumo: "Nenhum padrinho ainda" }
        : padrinhosProntos < d.padrinhos.length
          ? {
              situacao: "pendente",
              resumo: `${padrinhosProntos} de ${d.padrinhos.length} com tudo marcado`,
            }
          : {
              situacao: "ok",
              resumo: `${n(d.padrinhos.length, "padrinho", "padrinhos")}, tudo marcado`,
            },
  };
}
