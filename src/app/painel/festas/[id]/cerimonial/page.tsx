import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta, listarColunas } from "@/lib/festas/consultas";
import { documentoValido, SECAO_FALA } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

import { ColunaCronograma } from "../colunas/coluna-cronograma";
import { VoltarFesta } from "../voltar-festa";
import { TextoCerimonial } from "./texto-cerimonial";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/cerimonial">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Cerimonial · ${festa.titulo}` : "Festa não encontrada" };
}

// Roteiro da cerimônia: os mesmos horários do cronograma, na seção da cerimônia, e o texto
// do cerimonial (a fala): link do documento dela ou o texto escrito aqui.
export default async function PaginaCerimonial(props: PageProps<"/painel/festas/[id]/cerimonial">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const [colunas, fala] = await Promise.all([
    listarColunas(festa.id),
    prisma.observacao.findUnique({
      where: { festaId_secao: { festaId: festa.id, secao: SECAO_FALA } },
      select: { conteudo: true, atualizadoEm: true },
    }),
  ]);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="cerimonial" />
      <ColunaCronograma
        festaId={festa.id}
        cronograma={colunas.cerimonial}
        contratacoes={colunas.contratacoes}
        secao="CERIMONIA"
      />
      <TextoCerimonial
        festaId={festa.id}
        link={festa.cerimonialLink}
        secao={SECAO_FALA}
        texto={fala && documentoValido(fala.conteudo) ? fala.conteudo : null}
        salvoEm={fala?.atualizadoEm.toISOString() ?? null}
      />
    </div>
  );
}
