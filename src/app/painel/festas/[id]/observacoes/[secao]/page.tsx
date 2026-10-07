import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { exigirUsuario } from "@/lib/dal";
import { buscarFesta } from "@/lib/festas/consultas";
import { documentoValido, ehSecaoObservacao, SECOES_OBSERVACAO } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

import { EditorObservacoes } from "../editor";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/observacoes/[secao]">,
): Promise<Metadata> {
  const { id, secao } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa || !ehSecaoObservacao(secao)) return { title: "Não encontrado" };
  return { title: `Observações · ${SECOES_OBSERVACAO[secao].titulo} · ${festa.titulo}` };
}

// Folha de observações gerais de uma parte da festa, como um documento em branco.
export default async function PaginaObservacoes(
  props: PageProps<"/painel/festas/[id]/observacoes/[secao]">,
) {
  const { id, secao } = await props.params;
  if (!ehSecaoObservacao(secao)) notFound();
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  await exigirUsuario();
  const salvo = await prisma.observacao.findUnique({
    where: { festaId_secao: { festaId: festa.id, secao } },
    select: { conteudo: true, atualizadoEm: true },
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
      <h1 className="mb-4 text-2xl font-semibold tracking-[-0.02em]">Observações · {titulo}</h1>
      <EditorObservacoes
        festaId={festa.id}
        secao={secao}
        inicial={salvo && documentoValido(salvo.conteudo) ? salvo.conteudo : null}
        salvoEm={salvo?.atualizadoEm.toISOString() ?? null}
      />
    </div>
  );
}
