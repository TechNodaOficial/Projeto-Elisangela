import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { exigirUsuario } from "@/lib/dal";
import { buscarFesta, listarColunas } from "@/lib/festas/consultas";
import { gerarPdfConvite } from "@/lib/pdf/convite";
import { gerarPdfRoteiro } from "@/lib/pdf/roteiro";
import { lerBytesPlanta } from "@/lib/planta/blob";
import { lerImagem } from "@/lib/planta/imagem";

// /painel/festas/[id]/pdf/convite  → convite para os convidados (só dados da festa)
// /painel/festas/[id]/pdf/roteiro  → roteiro completo para a Elisangela e a equipe
export async function GET(_request: Request, ctx: RouteContext<"/painel/festas/[id]/pdf/[tipo]">) {
  await exigirUsuario();
  const { id, tipo } = await ctx.params;
  if (tipo !== "convite" && tipo !== "roteiro")
    return new Response("Não encontrado", { status: 404 });

  const festa = await buscarFesta(id);
  if (!festa) return new Response("Festa não encontrada", { status: 404 });

  let pdf: Buffer;
  if (tipo === "convite") {
    pdf = await gerarPdfConvite(festa);
  } else {
    const [colunas, convidados, bytesPlanta] = await Promise.all([
      listarColunas(festa.id),
      listarConvidados(festa.id),
      festa.plantaUrl ? lerBytesPlanta(festa.plantaUrl) : null,
    ]);
    const info = bytesPlanta && lerImagem(bytesPlanta);
    pdf = await gerarPdfRoteiro({
      festa,
      colunas,
      // Festa antiga sem convidados (LGPD): valem os números guardados na festa.
      contagem: festa.convidadosApagadosEm
        ? {
            total: festa.resumoConvidados ?? 0,
            confirmados: festa.resumoConfirmados ?? 0,
            recusados: 0,
            aguardando: 0,
          }
        : contarPorStatus(convidados),
      semMesa: convidados.filter((c) => !c.mesaId).length,
      planta: bytesPlanta && info ? { bytes: bytesPlanta, info } : null,
    });
  }

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // inline: abre no visualizador do navegador, de onde dá para imprimir ou baixar.
      "Content-Disposition": `inline; filename="${tipo}-${nomeDeArquivo(festa.titulo)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

// "Casamento Ana & João" → "casamento-ana-joao"
function nomeDeArquivo(titulo: string) {
  return (
    titulo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "festa"
  );
}
