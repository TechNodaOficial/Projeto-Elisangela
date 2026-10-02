import { ArrowLeft, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { dadosCheckin, festasParaCheckin } from "@/lib/checkin/consultas";
import { partesData } from "@/lib/datas";

import { CabecalhoSecao } from "../folhas";
import { Leitor } from "./leitor";

export const metadata: Metadata = { title: "Leitor QR Code · Painel de Festas" };

// Festa "de hoje" para o leitor: até 20h antes ou depois de agora (cobre a madrugada).
const PERTO_MS = 20 * 60 * 60 * 1000;

function festasDeHoje<F extends { dataHora: Date }>(festas: F[], agora = new Date()) {
  return festas.filter((f) => Math.abs(f.dataHora.getTime() - agora.getTime()) < PERTO_MS);
}

export default async function PaginaCheckin(props: PageProps<"/painel/checkin">) {
  const { festa: festaId } = await props.searchParams;

  if (typeof festaId === "string") {
    const [dados, festas] = await Promise.all([dadosCheckin(festaId), festasParaCheckin()]);
    if (!dados) notFound();
    return (
      <div className="mx-auto w-full max-w-xl">
        {festas.length > 1 && (
          <Link
            href="/painel/checkin?escolher=1"
            className="text-tinta-suave hover:text-foreground focus-visible:outline-ring mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2"
          >
            <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
            Trocar festa
          </Link>
        )}
        <Leitor festa={dados} />
      </div>
    );
  }

  const festas = await festasParaCheckin();
  const deHoje = festasDeHoje(festas);
  // Uma só festa hoje: vai direto para o leitor (a não ser que ela tenha pedido para escolher).
  const { escolher } = await props.searchParams;
  if (deHoje.length === 1 && !escolher) redirect(`/painel/checkin?festa=${deHoje[0].id}`);

  return (
    <>
      <CabecalhoSecao
        titulo="Leitor QR Code"
        descricao="Escolha a festa para registrar a chegada dos convidados."
      />
      {festas.length === 0 ? (
        <div className="folha folha-lisa flex max-w-xl items-start gap-3 py-6 pr-6 pl-[calc(var(--margem)+0.875rem)]">
          <ScanLine aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Nenhuma festa hoje nem nos próximos dias.</p>
            <p className="text-tinta-suave text-sm">
              O leitor mostra as festas a partir de hoje. Cadastre uma festa em Festas pendentes.
            </p>
          </div>
        </div>
      ) : (
        <ul className="folha folha-lisa max-w-xl py-(--linha) pr-5 pl-[calc(var(--margem)+0.875rem)] leading-(--linha)">
          {festas.map((f) => {
            const data = partesData(f.dataHora);
            const hoje = deHoje.some((h) => h.id === f.id);
            return (
              <li key={f.id} className="pautado">
                {/* Data na primeira pauta, nome inteiro na segunda (e seguintes, se quebrar). */}
                <Link
                  href={`/painel/checkin?festa=${f.id}`}
                  className="group focus-visible:outline-ring flex flex-col rounded-sm focus-visible:outline-2"
                >
                  <span className="flex h-(--linha) items-end gap-3 text-sm">
                    <span className="text-tinta-suave font-mono text-[0.8125rem]">
                      {data.semana}, {data.dia} {data.mes} · {data.hora}
                    </span>
                    {hoje && <span className="grifo font-semibold">Hoje</span>}
                  </span>
                  <span className="font-medium">
                    <span className="grifo-ao-passar">{f.titulo}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
