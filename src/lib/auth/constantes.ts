// Compartilhado com o proxy, por isso sem "server-only" e sem acesso ao banco.

// Em produção o prefixo __Host- obriga o cookie a ser Secure, sem Domain e com Path=/,
// o que impede que subdomínios o sobrescrevam. Em dev (http://localhost) não dá para usar.
export const NOME_COOKIE_SESSAO =
  process.env.NODE_ENV === "production" ? "__Host-sessao" : "sessao";

export const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
