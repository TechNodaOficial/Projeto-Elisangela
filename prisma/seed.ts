// Cria (ou atualiza) o usuário da Elisangela, o único com acesso ao painel.
// Rodar de novo com outra SEED_SENHA serve para redefinir a senha e encerra as sessões abertas.
// Não carrega .env sozinho: as variáveis vêm da config do Prisma que chamou o seed
// (npm run db:seed → .env local; npm run db:seed:prod → .env.producao).
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

const CUSTO_BCRYPT = 12;
const TAMANHO_MINIMO_SENHA = 10;

function lerVariavel(nome: string): string {
  const valor = process.env[nome]?.trim();
  if (!valor) {
    throw new Error(`Defina ${nome} antes de rodar o seed (.env ou .env.producao).`);
  }
  return valor;
}

async function main() {
  const email = lerVariavel("SEED_EMAIL").toLowerCase();
  const nome = lerVariavel("SEED_NOME");
  const senha = lerVariavel("SEED_SENHA");

  if (senha.length < TAMANHO_MINIMO_SENHA) {
    throw new Error(`SEED_SENHA precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);
    const usuario = await prisma.usuario.upsert({
      where: { email },
      update: { nome, senhaHash },
      create: { email, nome, senhaHash },
    });
    // Senha nova invalida todos os logins abertos (ex.: celular perdido).
    const { count } = await prisma.sessao.deleteMany({ where: { usuarioId: usuario.id } });
    console.log(`Usuário pronto: ${usuario.nome} <${usuario.email}> (${count} sessões encerradas)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
