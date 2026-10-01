import type { Metadata } from "next";
import { Archive } from "lucide-react";

import { listarFestas } from "@/lib/festas/consultas";

import { CabecalhoSecao, FolhaFesta, GradeFolhas } from "../folhas";

export const metadata: Metadata = { title: "Festas concluídas · Painel de Festas" };

export default async function PaginaConcluidas() {
  const festas = await listarFestas("concluidas");

  if (festas.length === 0) {
    return (
      <>
        <CabecalhoSecao titulo="Festas concluídas" descricao="Nenhuma festa concluída ainda." />
        <div className="folha folha-lisa text-tinta-suave flex max-w-xl items-start gap-3 py-6 pr-6 pl-[calc(var(--margem)+0.875rem)] text-sm">
          <Archive aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          <p>
            Cada festa passa para cá automaticamente no dia seguinte à data dela, com quantos
            convidados compareceram.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <CabecalhoSecao
        titulo="Festas concluídas"
        descricao={`${festas.length} ${festas.length === 1 ? "festa" : "festas"}, da mais recente para a mais antiga.`}
      />
      <GradeFolhas>
        {festas.map((festa) => (
          <FolhaFesta key={festa.id} festa={festa} concluida />
        ))}
      </GradeFolhas>
    </>
  );
}
