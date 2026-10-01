import { prisma } from "@/lib/prisma";

// Usado para verificar se o app está no ar e conectado ao banco.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok" });
  } catch (error) {
    console.error("Health check falhou ao consultar o banco", error);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
