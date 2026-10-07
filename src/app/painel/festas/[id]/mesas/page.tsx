import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listarConvidados } from "@/lib/convidados/consultas";
import { lugaresDe } from "@/lib/convidados/contagem";
import { buscarFesta, listarColunas } from "@/lib/festas/consultas";

import { ColunaMesas } from "../colunas/coluna-mesas";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/mesas">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Layout das mesas · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaMesas(props: PageProps<"/painel/festas/[id]/mesas">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const [colunas, convidados] = await Promise.all([
    listarColunas(festa.id),
    listarConvidados(festa.id),
  ]);

  return (
    <div className="w-full max-w-3xl">
      <VoltarFesta festa={festa} observacoes="layout" />
      <ColunaMesas
        festaId={festa.id}
        mesas={colunas.mesas}
        convidados={convidados.map((c) => ({
          id: c.id,
          nome: c.nome,
          mesaId: c.mesaId,
          lugares: lugaresDe(c),
        }))}
      />
    </div>
  );
}
