import "server-only";

import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { cache } from "react";

import { hashTokenSessao } from "@/lib/auth/sessao";
import { obterUsuarioLogado } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gerarToken } from "@/lib/tokens";

import { janelaPortaria, situacaoPortaria } from "./janela";

// Cookie do ajudante da portaria. Como o da sessão, em produção usa __Host- (Secure, Path=/).
export const NOME_COOKIE_PORTARIA =
  process.env.NODE_ENV === "production" ? "__Host-portaria" : "portaria";

export const gerarPin = () => String(randomInt(0, 10_000)).padStart(4, "0");

export function novoAcessoPortaria() {
  return { portariaToken: gerarToken(), portariaPin: gerarPin() };
}

// Comparação de PIN em tempo constante (não vaza quantos dígitos acertou).
export function pinConfere(certo: string, tentativa: string) {
  const a = Buffer.from(certo);
  const b = Buffer.from(tentativa);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Festa do link da portaria, se o link existe.
export async function festaDaPortaria(token: string) {
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return null;
  return prisma.festa.findUnique({
    where: { portariaToken: token },
    select: { id: true, titulo: true, dataHora: true, portariaPin: true },
  });
}

// Abre a sessão do ajudante até o fim da janela da festa.
export async function criarSessaoPortaria(festaId: string, dataHora: Date) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = janelaPortaria(dataHora).fecha;
  await prisma.sessaoPortaria.create({
    data: { tokenHash: hashTokenSessao(token), festaId, expiraEm },
  });
  (await cookies()).set(NOME_COOKIE_PORTARIA, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

// Festa que o ajudante deste navegador pode usar (ou null). A sessão cai se o link foi
// cancelado/trocado (as sessões são apagadas junto) ou se a janela da festa fechou.
export const festaDoAjudante = cache(async () => {
  const token = (await cookies()).get(NOME_COOKIE_PORTARIA)?.value;
  if (!token) return null;
  const sessao = await prisma.sessaoPortaria.findUnique({
    where: { tokenHash: hashTokenSessao(token) },
    select: { expiraEm: true, festa: { select: { id: true, dataHora: true } } },
  });
  if (!sessao || sessao.expiraEm <= new Date()) return null;
  if (situacaoPortaria(sessao.festa.dataHora) !== "aberta") return null;
  return sessao.festa.id;
});

// Para as ações do leitor: a Elisangela (logada) ou um ajudante da portaria desta festa.
export async function exigirAcessoLeitor(festaId: string) {
  if (await obterUsuarioLogado()) return;
  if ((await festaDoAjudante()) === festaId) return;
  throw new Error("Sem acesso ao leitor desta festa.");
}
