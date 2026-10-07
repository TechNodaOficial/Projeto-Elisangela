import "server-only";

import { prisma } from "@/lib/prisma";

// O PIN tem 4 dígitos (10 mil combinações): sem limite, daria para adivinhar.
// Conta os erros por aparelho (IP) e por link, na mesma tabela do limite de login.
const JANELA_MS = 15 * 60 * 1000;
const MAX_POR_IP = 8;
const MAX_POR_LINK = 25;

const porIp = (ip: string) => `portaria:${ip}`;
const porLink = (token: string) => `portaria-link:${token}`;

export async function pinBloqueado(ip: string, token: string) {
  const desde = new Date(Date.now() - JANELA_MS);
  const [ip_, link] = await Promise.all([
    prisma.tentativaLogin.count({ where: { chave: porIp(ip), criadoEm: { gte: desde } } }),
    prisma.tentativaLogin.count({ where: { chave: porLink(token), criadoEm: { gte: desde } } }),
  ]);
  return ip_ >= MAX_POR_IP || link >= MAX_POR_LINK;
}

export async function registrarErroPin(ip: string, token: string) {
  await prisma.tentativaLogin.createMany({
    data: [{ chave: porIp(ip) }, { chave: porLink(token) }],
  });
}
