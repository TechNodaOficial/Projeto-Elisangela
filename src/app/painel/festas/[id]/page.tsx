import type { Metadata } from "next";
import { ArrowLeft, Pencil } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { diasAte, festaConcluida, partesData, rotuloProximidade } from "@/lib/datas";
import { buscarFesta } from "@/lib/festas/consultas";

import { SecaoConvidados } from "./convidados/secao-convidados";
import { ExcluirFesta } from "./excluir-festa";

// Endereço público do site (para montar os links dos convites), igual ao do request.
async function origemDoSite() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

export async function generateMetadata(props: PageProps<"/painel/festas/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `${festa.titulo} · Painel de Festas` : "Festa não encontrada" };
}

export default async function PaginaFesta(props: PageProps<"/painel/festas/[id]">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  const [convidados, origem] = await Promise.all([listarConvidados(festa.id), origemDoSite()]);
  const data = partesData(festa.dataHora);
  const concluida = festaConcluida(festa.dataHora);
  const dias = diasAte(festa.dataHora);
  const voltar = concluida
    ? { href: "/painel/concluidas", rotulo: "Festas concluídas" }
    : { href: "/painel", rotulo: "Festas pendentes" };

  // Linhas do roteiro: rótulo à esquerda, valor na pauta.
  const linhas = [
    { rotulo: "Local", valor: festa.localNome },
    { rotulo: "Endereço", valor: festa.endereco },
    { rotulo: "Traje", valor: festa.traje },
    { rotulo: "Observações", valor: festa.observacoes },
  ];

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={voltar.href}
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring inline-flex items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          {voltar.rotulo}
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" className="bg-card h-9">
            <Link href={`/painel/festas/${festa.id}/editar`}>
              <Pencil aria-hidden strokeWidth={1.75} />
              Editar
            </Link>
          </Button>
          <ExcluirFesta id={festa.id} titulo={festa.titulo} />
        </div>
      </div>

      <article className="folha pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha) sm:pr-8">
        <header className="flex flex-wrap items-start justify-between gap-x-6">
          <div className="flex items-start gap-3">
            <span className="font-mono text-[4.25rem] leading-[calc(var(--linha)*3)] font-medium tracking-[-0.04em]">
              {data.dia}
            </span>
            <span className="flex flex-col text-sm leading-(--linha)">
              <span className="font-semibold tracking-[0.04em] uppercase">
                {data.mes} {data.ano}
              </span>
              <span className="text-tinta-suave first-letter:uppercase">
                {data.extenso.split(",")[0]}
              </span>
              <span className="font-mono">{data.hora}</span>
            </span>
          </div>
          <span
            className={
              !concluida && dias <= 7 ? "grifo text-sm font-semibold" : "text-tinta-suave text-sm"
            }
          >
            {concluida
              ? `Concluída · ${rotuloProximidade(dias).toLowerCase()}`
              : rotuloProximidade(dias)}
          </span>
        </header>

        <h1 className="min-h-[calc(var(--linha)*2)] pt-[calc(var(--linha)*0.25)] text-2xl leading-(--linha) font-semibold tracking-[-0.02em] text-balance sm:text-[1.75rem]">
          {festa.titulo}
        </h1>

        <dl className="mt-(--linha)">
          {linhas.map((linha) => (
            <div key={linha.rotulo} className="grid grid-cols-1 sm:grid-cols-[8.5rem_1fr]">
              <dt className="text-tinta-suave text-sm leading-(--linha)">{linha.rotulo}</dt>
              <dd className={linha.valor ? "whitespace-pre-line" : "text-tinta-suave"}>
                {linha.valor ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
      </article>

      <SecaoConvidados
        festaId={festa.id}
        festa={{ titulo: festa.titulo, dataHora: festa.dataHora, localNome: festa.localNome }}
        convidados={convidados}
        contagem={contarPorStatus(convidados)}
        origem={origem}
      />
    </div>
  );
}
