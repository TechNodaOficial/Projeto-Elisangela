import { ArrowLeft, NotebookPen } from "lucide-react";
import Link from "next/link";

import { partesData } from "@/lib/datas";
import { documentoVazio, type SecaoObservacao } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

import { SecoesFesta } from "./secoes-festa";

// Topo das páginas de seção (fornecedores, convidados...): volta para a festa e, à direita,
// abre a folha de observações gerais daquela seção (com um ponto se já tem texto).
// Embaixo, o atalho para as outras partes da festa.
export async function VoltarFesta({
  festa,
  observacoes,
}: {
  festa: { id: string; titulo: string; dataHora: Date };
  observacoes?: SecaoObservacao;
}) {
  const data = partesData(festa.dataHora);
  const salvo =
    observacoes &&
    (await prisma.observacao.findUnique({
      where: { festaId_secao: { festaId: festa.id, secao: observacoes } },
      select: { conteudo: true },
    }));
  const temTexto = !!salvo && !documentoVazio(salvo.conteudo);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/painel/festas/${festa.id}`}
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring inline-flex max-w-full items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2"
        >
          <ArrowLeft aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {festa.titulo} · {Number(data.dia)} {data.mes}
          </span>
        </Link>
        {observacoes && (
          <Link
            href={`/painel/festas/${festa.id}/observacoes/${observacoes}`}
            className="bg-pastel-lilas focus-visible:outline-ring inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <NotebookPen aria-hidden className="size-4" strokeWidth={1.75} />
            Observações
            {temTexto && (
              <span className="bg-foreground size-1.5 rounded-full" aria-label="(com anotações)" />
            )}
          </Link>
        )}
      </div>
      <SecoesFesta festaId={festa.id} />
    </>
  );
}
