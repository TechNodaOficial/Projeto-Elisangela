import { exigirUsuario } from "@/lib/dal";
import { abrirPlanta } from "@/lib/planta/blob";
import { prisma } from "@/lib/prisma";

// Serve a planta do Blob store privado só para quem está logado.
// A página pede /planta?v=<versão>; como a versão muda a cada troca, o cache pode ser longo.
export async function GET(request: Request, ctx: RouteContext<"/painel/festas/[id]/planta">) {
  await exigirUsuario();
  const { id } = await ctx.params;
  const festa = await prisma.festa.findUnique({ where: { id }, select: { plantaUrl: true } });
  if (!festa?.plantaUrl) return new Response("Planta não encontrada", { status: 404 });

  const blob = await abrirPlanta(festa.plantaUrl, request.headers.get("if-none-match"));
  if (!blob) return new Response("Planta não encontrada", { status: 404 });

  const cabecalhos = {
    "Cache-Control": "private, max-age=31536000, immutable",
    ETag: blob.blob.etag,
  };
  if (blob.statusCode === 304) return new Response(null, { status: 304, headers: cabecalhos });
  return new Response(blob.stream, {
    headers: {
      ...cabecalhos,
      "Content-Type": blob.blob.contentType,
      "Content-Length": String(blob.blob.size),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
