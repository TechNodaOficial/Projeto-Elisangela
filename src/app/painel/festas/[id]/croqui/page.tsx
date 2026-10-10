import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarFesta } from "@/lib/festas/consultas";
import { versaoPlanta } from "@/lib/planta/blob";

import { CampoPlanta } from "../planta/campo-planta";
import { VoltarFesta } from "../voltar-festa";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/croqui">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Croqui · ${festa.titulo}` : "Festa não encontrada" };
}

// Croqui: o desenho do salão visto de cima (a "planta"), que também sai no roteiro em PDF.
export default async function PaginaCroqui(props: PageProps<"/painel/festas/[id]/croqui">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="croqui" />
      <section
        id="planta"
        aria-labelledby="titulo-planta"
        className="folha pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
      >
        <h2 id="titulo-planta" className="text-lg font-semibold">
          Croqui do salão
        </h2>
        <p className="text-tinta-suave text-sm leading-(--linha)">
          O salão visto de cima. Também sai no roteiro em PDF.
        </p>
        <CampoPlanta
          festaId={festa.id}
          planta={
            festa.plantaUrl && festa.plantaLargura && festa.plantaAltura
              ? {
                  src: `/painel/festas/${festa.id}/planta?v=${versaoPlanta(festa.plantaUrl)}`,
                  largura: festa.plantaLargura,
                  altura: festa.plantaAltura,
                }
              : null
          }
        />
      </section>
    </div>
  );
}
