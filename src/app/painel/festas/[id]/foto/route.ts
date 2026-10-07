import { exigirUsuario } from "@/lib/dal";
import { abrirFoto } from "@/lib/festas/foto";
import { prisma } from "@/lib/prisma";

// Serve a foto da festa do Blob store privado só para quem está logado.
// A página pede /foto?v=<versão>; como a versão muda a cada troca, o cache pode ser longo.
export async function GET(request: Request, ctx: RouteContext<"/painel/festas/[id]/foto">) {
  await exigirUsuario();
  const { id } = await ctx.params;
  const festa = await prisma.festa.findUnique({ where: { id }, select: { fotoUrl: true } });
  if (!festa?.fotoUrl) return new Response("Foto não encontrada", { status: 404 });

  const blob = await abrirFoto(festa.fotoUrl, request.headers.get("if-none-match"));
  if (!blob) return new Response("Foto não encontrada", { status: 404 });

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
