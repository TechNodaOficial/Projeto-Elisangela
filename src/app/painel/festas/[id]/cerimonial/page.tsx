import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas } from "@/lib/festas/consultas";

import { ColunaCronograma } from "../colunas/coluna-cronograma";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/cerimonial">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Cerimonial · ${festa.titulo}` : "Festa não encontrada" };
}

// Roteiro da cerimônia: os mesmos horários do cronograma, na seção da cerimônia.
export default async function PaginaCerimonial(props: PageProps<"/painel/festas/[id]/cerimonial">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const colunas = await listarColunas(festa.id);

  return (
    <div className="w-full max-w-3xl">
      <VoltarFesta festa={festa} observacoes="cerimonial" />
      <ColunaCronograma
        festaId={festa.id}
        cronograma={colunas.cerimonial}
        contratacoes={colunas.contratacoes}
        secao="CERIMONIA"
      />
    </div>
  );
}
