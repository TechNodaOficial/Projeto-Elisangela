// Cor da mesa do painel: caqui (padrão) ou cinza. Fica num cookie deste navegador,
// lido no layout raiz para o <html> já sair com data-tema certo (sem piscar).
export const TEMAS = ["caqui", "cinza"] as const;
export type Tema = (typeof TEMAS)[number];

export const TEMA_PADRAO: Tema = "caqui";
export const NOME_COOKIE_TEMA = "tema";

export function temaValido(valor: string | undefined): Tema {
  return TEMAS.includes(valor as Tema) ? (valor as Tema) : TEMA_PADRAO;
}
