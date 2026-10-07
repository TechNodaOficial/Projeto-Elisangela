import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas, listarServicos } from "@/lib/festas/consultas";

import { ColunaFornecedores } from "../colunas/coluna-fornecedores";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/fornecedores">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Fornecedores · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaFornecedores(
  props: PageProps<"/painel/festas/[id]/fornecedores">,
) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const [colunas, servicos] = await Promise.all([listarColunas(festa.id), listarServicos()]);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="fornecedores" />
      <ColunaFornecedores
        festaId={festa.id}
        contratacoes={colunas.contratacoes}
        servicos={servicos}
      />
    </div>
  );
}
