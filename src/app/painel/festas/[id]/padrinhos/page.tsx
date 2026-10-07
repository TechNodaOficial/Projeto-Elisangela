import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas } from "@/lib/festas/consultas";

import { ColunaPadrinhos } from "../quadro/coluna-padrinhos";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/padrinhos">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Padrinhos · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaPadrinhos(props: PageProps<"/painel/festas/[id]/padrinhos">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const colunas = await listarColunas(festa.id);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="padrinhos" />
      <ColunaPadrinhos festaId={festa.id} padrinhos={colunas.padrinhos} />
    </div>
  );
}
