import { listarFestas } from "@/lib/festas/consultas";

import { CabecalhoSecao, FolhaFesta, FolhaNovaFesta, GradeFolhas } from "./folhas";

export default async function PaginaPendentes() {
  const festas = await listarFestas("pendentes");

  const descricao =
    festas.length === 0
      ? "Nenhuma festa marcada. Comece pela folha em branco."
      : `${festas.length} ${festas.length === 1 ? "festa" : "festas"}, da mais próxima para a mais distante.`;

  return (
    <>
      <CabecalhoSecao titulo="Festas pendentes" descricao={descricao} />
      <GradeFolhas>
        <FolhaNovaFesta />
        {festas.map((festa) => (
          <FolhaFesta key={festa.id} festa={festa} concluida={false} />
        ))}
      </GradeFolhas>
    </>
  );
}
