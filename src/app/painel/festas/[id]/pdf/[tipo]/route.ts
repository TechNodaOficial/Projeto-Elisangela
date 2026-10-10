import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { somarFaixas } from "@/lib/convidados/contagem";
import { exigirUsuario } from "@/lib/dal";
import { buscarFesta, listarColunas } from "@/lib/festas/consultas";
import { SECAO_FALA } from "@/lib/festas/observacoes";
import { festaConcluida } from "@/lib/datas";
import { gerarPdfCompleto } from "@/lib/pdf/completo";
import { gerarPdfRoteiro } from "@/lib/pdf/roteiro";
import { lerBytesPlanta } from "@/lib/planta/blob";
import { lerImagem } from "@/lib/planta/imagem";
import { prisma } from "@/lib/prisma";

// Imagem do Blob privado (planta ou foto), já conferida, pronta para o PDF.
async function imagemDoBlob(url: string | null) {
  const bytes = url ? await lerBytesPlanta(url) : null;
  const info = bytes && lerImagem(bytes);
  return bytes && info ? { bytes, info } : null;
}

// /painel/festas/[id]/pdf/roteiro   → roteiro impresso para o dia da festa, sem valores
// /painel/festas/[id]/pdf/checklist → o mesmo roteiro com valores e pagamentos, para os noivos
// /painel/festas/[id]/pdf/completo → arquivo com TUDO da festa, para guardar antes da limpeza
export async function GET(_request: Request, ctx: RouteContext<"/painel/festas/[id]/pdf/[tipo]">) {
  await exigirUsuario();
  const { id, tipo } = await ctx.params;
  if (tipo !== "roteiro" && tipo !== "checklist" && tipo !== "completo")
    return new Response("Não encontrado", { status: 404 });

  const festa = await buscarFesta(id);
  if (!festa) return new Response("Festa não encontrada", { status: 404 });

  let pdf: Buffer;
  if (tipo === "completo") {
    const [colunas, convidados, observacoes, planta, foto] = await Promise.all([
      listarColunas(festa.id),
      listarConvidados(festa.id),
      prisma.observacao.findMany({
        where: { festaId: festa.id },
        select: { secao: true, conteudo: true },
      }),
      imagemDoBlob(festa.plantaUrl),
      imagemDoBlob(festa.fotoUrl),
    ]);
    const geradoEm = new Date();
    pdf = await gerarPdfCompleto({
      festa,
      colunas,
      convidados,
      contagem: festa.convidadosApagadosEm
        ? {
            total: festa.resumoConvidados ?? 0,
            confirmados: festa.resumoConfirmados ?? 0,
            presentes: festa.resumoPresentes ?? 0,
            recusados: 0,
            aguardando: 0,
          }
        : contarPorStatus(convidados),
      observacoes,
      planta,
      foto,
      geradoEm,
    });
    // Libera a limpeza (ver src/lib/retencao/prazo.ts). Só conta depois da festa: um PDF
    // tirado antes não teria as entradas da porta nem o que mudou no dia.
    if (festaConcluida(festa.dataHora) && !festa.convidadosApagadosEm) {
      await prisma.festa.update({ where: { id: festa.id }, data: { pdfCompletoEm: geradoEm } });
    }
  } else {
    const [colunas, convidados, bytesPlanta, fala] = await Promise.all([
      listarColunas(festa.id),
      listarConvidados(festa.id),
      festa.plantaUrl ? lerBytesPlanta(festa.plantaUrl) : null,
      prisma.observacao.findUnique({
        where: { festaId_secao: { festaId: festa.id, secao: SECAO_FALA } },
        select: { conteudo: true },
      }),
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
      semMesa: convidados.filter((c) => !c.mesaId).reduce((s, c) => s + c.pessoas, 0),
      buffet: festa.convidadosApagadosEm ? null : somarFaixas(convidados),
      fala: { texto: fala?.conteudo ?? null, link: festa.cerimonialLink },
      planta: bytesPlanta && info ? { bytes: bytesPlanta, info } : null,
      comValores: tipo === "checklist",
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
