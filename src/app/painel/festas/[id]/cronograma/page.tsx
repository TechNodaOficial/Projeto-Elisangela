import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas } from "@/lib/festas/consultas";

import { ColunaCronograma } from "../colunas/coluna-cronograma";
import { ColunaMenu } from "../quadro/coluna-menu";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/cronograma">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Cronograma e menu · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaCronograma(props: PageProps<"/painel/festas/[id]/cronograma">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const colunas = await listarColunas(festa.id);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="cronograma" />
      {/* Lado a lado em telas largas; um embaixo do outro no celular. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <ColunaCronograma
          festaId={festa.id}
          cronograma={colunas.cronograma}
          contratacoes={colunas.contratacoes}
          menu={colunas.menu}
        />
        <ColunaMenu festaId={festa.id} menu={colunas.menu} />
      </div>
    </div>
  );
}
