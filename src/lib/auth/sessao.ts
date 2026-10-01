import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

import { DURACAO_SESSAO_MS } from "./constantes";

// O banco guarda só o hash: quem ler a tabela não consegue usar as sessões.
export function hashTokenSessao(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function criarSessao(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);

  await prisma.$transaction([
    prisma.sessao.deleteMany({ where: { usuarioId, expiraEm: { lt: new Date() } } }),
    prisma.sessao.create({ data: { tokenHash: hashTokenSessao(token), usuarioId, expiraEm } }),
  ]);

  return { token, expiraEm };
}

export async function buscarSessaoValida(token: string) {
  const sessao = await prisma.sessao.findUnique({
    where: { tokenHash: hashTokenSessao(token) },
    select: { expiraEm: true, usuario: { select: { id: true, nome: true, email: true } } },
  });

  if (!sessao || sessao.expiraEm <= new Date()) {
    return null;
  }
  return sessao.usuario;
}

export async function encerrarSessao(token: string) {
  await prisma.sessao.deleteMany({ where: { tokenHash: hashTokenSessao(token) } });
}
