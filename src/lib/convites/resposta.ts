import type { FaixaIdade } from "@/lib/convidados/contagem";

import { erroDoNome, limparNome, PARA_BANCO, type FaixaBanco } from "./membros";

// Resposta de um convite (vai ou não, quantos, idade e nome de cada um), usada pelo link do
// convidado e pelo painel, quando ela registra a resposta que ouviu por telefone. As regras
// de prazo ficam de fora: valem só para o convidado (ver prazo.ts).

// Uma pessoa da família que vai: a idade (faixa do buffet) e, com mesas demarcadas, o nome.
export type PessoaResposta = { faixa: FaixaIdade; nome: string };

const FAIXAS: FaixaIdade[] = ["adulto", "4a11", "0a3"];

// Confere só o formato do que chegou do navegador, antes de qualquer consulta ao banco.
export function erroDoFormato(
  resposta: string,
  quantas: number,
  pessoas: PessoaResposta[],
): string | null {
  if (resposta !== "CONFIRMADO" && resposta !== "RECUSADO") return "Resposta inválida.";
  if (resposta === "CONFIRMADO" && (!Number.isInteger(quantas) || quantas < 1)) {
    return "Diga quantas pessoas vão.";
  }
  if (
    !Array.isArray(pessoas) ||
    pessoas.length > 50 ||
    !pessoas.every((p) => FAIXAS.includes(p?.faixa) && typeof p.nome === "string")
  ) {
    return "Confira a idade de cada pessoa.";
  }
  return null;
}

export type RespostaMontada = {
  dados: {
    rsvp: "CONFIRMADO" | "RECUSADO";
    confirmadas: number | null;
    criancas4a11: number | null;
    criancas0a3: number | null;
  };
  // Nomes de quem vai, para trocar os guardados; vazio = apagar; null = deixar como estão.
  membros: { ordem: number; nome: string; faixa: FaixaBanco }[] | null;
};

// Ao confirmar, a família diz quantas pessoas vão (1 a `pessoas` do convite) e, para cada
// uma, a idade e, se as mesas forem demarcadas, o nome completo. Convite de uma pessoa só
// não manda `pessoas` (conta como adulto, com o nome do convite).
export function montarResposta(
  convite: { pessoas: number; entraram: number; mesasDemarcadas: boolean },
  resposta: "CONFIRMADO" | "RECUSADO",
  quantas: number,
  pessoas: PessoaResposta[],
): { erro: string } | RespostaMontada {
  const confirmou = resposta === "CONFIRMADO";
  if (confirmou && quantas > convite.pessoas) {
    return { erro: `Este convite é para até ${convite.pessoas} pessoas.` };
  }
  // Parte da família já entrou: não dá para desistir nem confirmar menos que isso.
  if (convite.entraram > 0 && (!confirmou || quantas < convite.entraram)) {
    return { erro: `${convite.entraram} pessoas deste convite já entraram na festa.` };
  }
  const familia = convite.pessoas > 1;
  // Família: uma pessoa por lugar confirmado, cada uma com a idade (e o nome, se pedido).
  const pedirNomes = familia && convite.mesasDemarcadas;
  if (confirmou && familia) {
    if (pessoas.length !== quantas) return { erro: "Confira a idade de cada pessoa." };
    if (pedirNomes) {
      const erroNome = pessoas.map((p) => erroDoNome(p.nome)).find(Boolean);
      if (erroNome) return { erro: erroNome };
    }
  }
  const contar = (faixa: FaixaIdade) =>
    familia ? pessoas.filter((p) => p.faixa === faixa).length : 0;
  return {
    dados: {
      rsvp: resposta,
      confirmadas: confirmou ? quantas : null,
      criancas4a11: confirmou ? contar("4a11") : null,
      criancas0a3: confirmou ? contar("0a3") : null,
    },
    // Nomes: trocados a cada resposta com mesas demarcadas; apagados se desistiu.
    // Sem demarcação, ficam como estavam (se ela desligar e ligar de novo, não se perdem).
    membros:
      pedirNomes && confirmou
        ? pessoas.map((p, ordem) => ({
            ordem,
            nome: limparNome(p.nome),
            faixa: PARA_BANCO[p.faixa],
          }))
        : confirmou
          ? null
          : [],
  };
}

// ── Formulário (convite e painel) ──────────────────────────────────────────

export const pessoaNova = (faixa: FaixaIdade = "adulto"): PessoaResposta => ({ faixa, nome: "" });

// Faixas guardadas (quantas crianças de cada) → uma pessoa por lugar: adultos primeiro.
export function pessoasDasContagens(
  n: number,
  criancas4a11: number | null,
  criancas0a3: number | null,
) {
  const c0a3 = Math.min(criancas0a3 ?? 0, n);
  const c4a11 = Math.min(criancas4a11 ?? 0, n - c0a3);
  return [
    ...Array.from({ length: n - c4a11 - c0a3 }, () => pessoaNova("adulto")),
    ...Array.from({ length: c4a11 }, () => pessoaNova("4a11")),
    ...Array.from({ length: c0a3 }, () => pessoaNova("0a3")),
  ];
}

// Mudou o número de pessoas: mantém quem continua e completa com adultos sem nome.
export const ajustarPessoas = (lista: PessoaResposta[], n: number) =>
  lista.length >= n
    ? lista.slice(0, n)
    : [...lista, ...Array.from({ length: n - lista.length }, () => pessoaNova())];
