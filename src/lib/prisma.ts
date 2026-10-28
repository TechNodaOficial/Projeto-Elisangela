import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Reaproveita a mesma instância entre hot reloads no dev, para não esgotar conexões.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// A URL do Neon vem da integração com a Vercel (não dá para editar) com sslmode=require.
// O pg atual já trata require/prefer/verify-ca como verify-full, mas avisa a cada início
// que o pg 9 vai afrouxar esses modos. Pedir verify-full explicitamente mantém a
// verificação do certificado como está hoje, e o aviso some.
const comSslVerificado = (url?: string) =>
  url?.replace(/([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/, "$1verify-full");

function createPrismaClient() {
  const connectionString = comSslVerificado(process.env.DATABASE_URL);
  // O banco local do `prisma dev` (PGlite) aceita uma conexão por vez: com várias
  // consultas em paralelo ele derruba as extras ("Server has closed the connection").
  // Local, o pool usa uma conexão só (as consultas entram em fila); o Neon, em
  // produção, segue com o pool normal.
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString ?? "");
  const adapter = new PrismaPg({ connectionString, ...(local ? { max: 1 } : {}) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
