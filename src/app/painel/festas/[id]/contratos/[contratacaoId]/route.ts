import { abrirContrato } from "@/lib/contratos/blob";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// Serve o contrato do Blob store privado só para quem está logado. Abre no navegador
// (PDF ou foto); "salvar como" usa o nome original do arquivo.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/painel/festas/[id]/contratos/[contratacaoId]">,
) {
  await exigirUsuario();
  const { id, contratacaoId } = await ctx.params;
  const contratacao = await prisma.contratacao.findUnique({
    where: { id: contratacaoId },
    select: { festaId: true, contratoUrl: true, contratoNome: true },
  });
  if (!contratacao?.contratoUrl || contratacao.festaId !== id) {
    return new Response("Contrato não encontrado", { status: 404 });
  }

  const blob = await abrirContrato(contratacao.contratoUrl);
  if (!blob || blob.statusCode !== 200) {
    return new Response("Contrato não encontrado", { status: 404 });
  }

  const nome = contratacao.contratoNome ?? "contrato";
  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "Content-Length": String(blob.blob.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(nome)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
