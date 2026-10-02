import "server-only";

import { prisma } from "@/lib/prisma";

// Rate limit dos links de convite: só links inválidos contam. Quem tem o link certo
// nunca é barrado; quem tenta adivinhar tokens é, depois de algumas falhas.
// Usa a mesma tabela do limite de login, com chave própria.
const JANELA_MS = 15 * 60 * 1000;
const MAX_ERROS_POR_IP = 20;
const GUARDAR_REGISTROS_MS = 24 * 60 * 60 * 1000;

const chave = (ip: string) => `convite:${ip}`;

export async function conviteBloqueado(ip: string) {
  const desde = new Date(Date.now() - JANELA_MS);
  const erros = await prisma.tentativaLogin.count({
    where: { chave: chave(ip), criadoEm: { gte: desde } },
  });
  return erros >= MAX_ERROS_POR_IP;
}

export async function registrarErroConvite(ip: string) {
  await prisma.$transaction([
    prisma.tentativaLogin.create({ data: { chave: chave(ip) } }),
    prisma.tentativaLogin.deleteMany({
      where: { criadoEm: { lt: new Date(Date.now() - GUARDAR_REGISTROS_MS) } },
    }),
  ]);
}
