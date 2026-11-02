import { TIPOS_ANEXO, type TipoAnexo } from "@/lib/anexos/arquivo";
import { abrirAnexo } from "@/lib/anexos/blob";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// Serve o anexo do Blob store privado só para quem está logado. PDF e foto abrem no
// navegador; Word e Excel baixam com o nome original (?baixar=1 baixa qualquer um).
export async function GET(
  request: Request,
  ctx: RouteContext<"/painel/festas/[id]/anexos/[secao]/[anexoId]">,
) {
  await exigirUsuario();
  const { id, secao, anexoId } = await ctx.params;
  const anexo = await prisma.anexo.findUnique({
    where: { id: anexoId },
    select: { festaId: true, secao: true, url: true, nome: true, tipo: true },
  });
  if (!anexo || anexo.festaId !== id || anexo.secao !== secao) {
    return new Response("Anexo não encontrado", { status: 404 });
  }

  const blob = await abrirAnexo(anexo.url);
  if (!blob || blob.statusCode !== 200) {
    return new Response("Anexo não encontrado", { status: 404 });
  }

  const baixar =
    new URL(request.url).searchParams.has("baixar") ||
    !TIPOS_ANEXO[anexo.tipo as TipoAnexo]?.abreNoNavegador;
  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Content-Length": String(blob.blob.size),
      "Content-Disposition": `${baixar ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(anexo.nome)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
