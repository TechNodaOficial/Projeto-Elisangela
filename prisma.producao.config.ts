// Configuração para comandos contra o banco de PRODUÇÃO (Neon).
// Usada só pelos scripts *:prod do package.json. Lê apenas o .env.producao.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

const { error } = config({ path: ".env.producao", override: true, quiet: true });
if (error) {
  throw new Error("Não encontrei o arquivo .env.producao com as credenciais do Neon.");
}

const urlDireta = process.env.DATABASE_URL_UNPOOLED;
if (!urlDireta || !process.env.DATABASE_URL) {
  throw new Error("Defina DATABASE_URL e DATABASE_URL_UNPOOLED no .env.producao.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: urlDireta,
  },
});
