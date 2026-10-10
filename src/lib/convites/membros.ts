import type { FaixaIdade } from "@/lib/convidados/contagem";

// Pessoas de um convite confirmado, quando as mesas são demarcadas: nome completo (vai na
// plaquinha da mesa) e faixa de idade. A faixa do banco é um enum em maiúsculas.

export type FaixaBanco = "ADULTO" | "C4A11" | "C0A3";

export const PARA_BANCO: Record<FaixaIdade, FaixaBanco> = {
  adulto: "ADULTO",
  "4a11": "C4A11",
  "0a3": "C0A3",
};

export const DO_BANCO: Record<FaixaBanco, FaixaIdade> = {
  ADULTO: "adulto",
  C4A11: "4a11",
  C0A3: "0a3",
};

export const TAMANHO_MAXIMO_NOME = 120;

// "  ana   maria silva " → "ana maria silva". Nome completo = pelo menos nome e sobrenome.
export function limparNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

export function erroDoNome(nome: string): string | null {
  const limpo = limparNome(nome);
  if (!limpo) return "Escreva o nome de cada pessoa.";
  if (limpo.length > TAMANHO_MAXIMO_NOME) return "Nome muito longo.";
  if (limpo.split(" ").length < 2) return "Escreva o nome completo (nome e sobrenome).";
  return null;
}

// Rótulo curto da criança ao lado do nome: "Pedro Silva (4 a 11)".
export const ROTULO_FAIXA_BANCO: Record<FaixaBanco, string> = {
  ADULTO: "adulto",
  C4A11: "4 a 11",
  C0A3: "0 a 3",
};
