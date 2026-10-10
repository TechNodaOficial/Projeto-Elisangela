import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas } from "@/lib/festas/consultas";

import { ColunaEntradas } from "../quadro/coluna-entradas";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/entradas">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Entradas da cerimônia · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaEntradas(props: PageProps<"/painel/festas/[id]/entradas">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const colunas = await listarColunas(festa.id);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="entradas" />
      <ColunaEntradas
        festaId={festa.id}
        entradas={colunas.entradas}
        checklist={colunas.checklistCerimonia}
      />
    </div>
  );
}
