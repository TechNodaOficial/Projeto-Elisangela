import { timingSafeEqual } from "node:crypto";

import { limparDadosAntigos } from "@/lib/retencao/limpeza";

// Chamado uma vez por dia pelo cron da Vercel (vercel.json). A Vercel manda
// "Authorization: Bearer <CRON_SECRET>"; sem o segredo certo, nada acontece.
function autorizado(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

export async function GET(request: Request) {
  if (!autorizado(request)) return new Response("Não autorizado", { status: 401 });
  const resultado = await limparDadosAntigos();
  console.log("Limpeza diária:", resultado);
  return Response.json(resultado);
}
