import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations precisam de conexão direta (sem pooler). A integração Neon + Vercel
// expõe essa URL como DATABASE_URL_UNPOOLED; localmente cai na DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
