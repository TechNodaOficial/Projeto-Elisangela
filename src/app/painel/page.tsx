import { lerAno, lerMes } from "@/lib/calendario";
import { listarFestas } from "@/lib/festas/consultas";

import { Calendario } from "./calendario";
import { CabecalhoSecao, FolhaFesta, FolhaNovaFesta, GradeFolhas } from "./folhas";

export default async function PaginaPendentes(props: PageProps<"/painel">) {
  const { mes, vista, ano } = await props.searchParams;
  const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const festas = await listarFestas("pendentes");

  const descricao =
    festas.length === 0
      ? "Nenhuma festa marcada. Comece pela folha em branco."
      : `${festas.length} ${festas.length === 1 ? "festa" : "festas"}, da mais próxima para a mais distante.`;

  return (
    <>
      <CabecalhoSecao titulo="Festas pendentes" descricao={descricao} />
      <Calendario
        vista={vista === "ano" ? "ano" : "mes"}
        mes={lerMes(texto(mes))}
        ano={lerAno(texto(ano))}
      />
      <GradeFolhas>
        <FolhaNovaFesta />
        {festas.map((festa) => (
          <FolhaFesta key={festa.id} festa={festa} concluida={false} />
        ))}
      </GradeFolhas>
    </>
  );
}
