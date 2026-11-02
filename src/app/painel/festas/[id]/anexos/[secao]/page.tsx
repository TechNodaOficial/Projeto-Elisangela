import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { exigirUsuario } from "@/lib/dal";
import { buscarFesta } from "@/lib/festas/consultas";
import { ehSecaoObservacao, SECOES_OBSERVACAO } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

import { ListaAnexos } from "./lista-anexos";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/anexos/[secao]">,
): Promise<Metadata> {
  const { id, secao } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa || !ehSecaoObservacao(secao)) return { title: "Não encontrado" };
  return { title: `Anexos · ${SECOES_OBSERVACAO[secao].titulo} · ${festa.titulo}` };
}

// Arquivos de uma parte da festa (orçamentos, fotos de referência, listas...).
export default async function PaginaAnexos(props: PageProps<"/painel/festas/[id]/anexos/[secao]">) {
  const { id, secao } = await props.params;
  if (!ehSecaoObservacao(secao)) notFound();
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  await exigirUsuario();
  const anexos = await prisma.anexo.findMany({
    where: { festaId: festa.id, secao },
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, tipo: true, tamanho: true, criadoEm: true },
  });
  const { titulo, pagina } = SECOES_OBSERVACAO[secao];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href={`/painel/festas/${festa.id}/${pagina}`}
        className="text-tinta-suave hover:text-foreground focus-visible:outline-ring mb-4 inline-flex max-w-full items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2"
      >
        <ArrowLeft aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">
          {titulo} · {festa.titulo}
        </span>
      </Link>
      <h1 className="mb-4 text-2xl font-semibold tracking-[-0.02em]">Anexos · {titulo}</h1>
      <ListaAnexos festaId={festa.id} secao={secao} anexos={anexos} />
    </div>
  );
}
