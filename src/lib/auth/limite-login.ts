import "server-only";

import { prisma } from "@/lib/prisma";

const JANELA_MS = 15 * 60 * 1000;
// Por e-mail é mais restrito: protege a conta contra adivinhação de senha.
// Por IP é mais folgado: várias pessoas podem compartilhar o mesmo Wi-Fi.
const MAX_FALHAS_POR_EMAIL = 5;
const MAX_FALHAS_POR_IP = 20;
const GUARDAR_REGISTROS_MS = 24 * 60 * 60 * 1000;

const chaveEmail = (email: string) => `email:${email}`;
const chaveIp = (ip: string) => `ip:${ip}`;

export async function estaBloqueado(email: string, ip: string): Promise<boolean> {
  const desde = new Date(Date.now() - JANELA_MS);
  const [falhasEmail, falhasIp] = await Promise.all([
    prisma.tentativaLogin.count({ where: { chave: chaveEmail(email), criadoEm: { gte: desde } } }),
    prisma.tentativaLogin.count({ where: { chave: chaveIp(ip), criadoEm: { gte: desde } } }),
  ]);
  return falhasEmail >= MAX_FALHAS_POR_EMAIL || falhasIp >= MAX_FALHAS_POR_IP;
}

export async function registrarFalha(email: string, ip: string) {
  await prisma.$transaction([
    prisma.tentativaLogin.createMany({
      data: [{ chave: chaveEmail(email) }, { chave: chaveIp(ip) }],
    }),
    // Limpeza oportunista: a tabela nunca cresce além de um dia de registros.
    prisma.tentativaLogin.deleteMany({
      where: { criadoEm: { lt: new Date(Date.now() - GUARDAR_REGISTROS_MS) } },
    }),
  ]);
}

export async function limparFalhas(email: string) {
  await prisma.tentativaLogin.deleteMany({ where: { chave: chaveEmail(email) } });
}
