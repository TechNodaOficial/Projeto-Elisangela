import type { Metadata } from "next";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { diasAte, festaConcluida, FUSO, partesData, rotuloProximidade } from "@/lib/datas";
import { buscarFesta, listarColunas } from "@/lib/festas/consultas";
import { apagamentoPrevisto } from "@/lib/retencao/prazo";
import { versaoPlanta } from "@/lib/planta/blob";

import { ColunaCronograma } from "./colunas/coluna-cronograma";
import { ColunaFornecedores } from "./colunas/coluna-fornecedores";
import { ColunaMesas } from "./colunas/coluna-mesas";
import { SecaoConvidados } from "./convidados/secao-convidados";
import { ExcluirFesta } from "./excluir-festa";
import { CampoPlanta } from "./planta/campo-planta";

// Endereço público do site (para montar os links dos convites), igual ao do request.
async function origemDoSite() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

// "2 de janeiro de 2027", no fuso de São Paulo.
const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, dateStyle: "long" }).format(d);

export async function generateMetadata(props: PageProps<"/painel/festas/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `${festa.titulo} · Painel de Festas` : "Festa não encontrada" };
}

export default async function PaginaFesta(props: PageProps<"/painel/festas/[id]">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  const [convidados, colunas, origem] = await Promise.all([
    listarConvidados(festa.id),
    listarColunas(festa.id),
    origemDoSite(),
  ]);
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
    <div className="w-full">
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

      {/* Quatro colunas lado a lado em telas largas; 2×2 em telas médias; uma no celular. */}
      {/* Nas colunas estreitas a linha de margem fica mais perto da borda. */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_1fr] xl:[--margem:1.75rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <article className="folha @container pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)">
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
                  !concluida && dias <= 7
                    ? "grifo text-sm font-semibold"
                    : "text-tinta-suave text-sm"
                }
              >
                {concluida
                  ? `Concluída · ${rotuloProximidade(dias).toLowerCase()}`
                  : rotuloProximidade(dias)}
              </span>
            </header>

            <h1 className="min-h-[calc(var(--linha)*2)] pt-[calc(var(--linha)*0.25)] text-2xl leading-(--linha) font-semibold tracking-[-0.02em] text-balance @md:text-[1.75rem]">
              {festa.titulo}
            </h1>

            <dl className="mt-(--linha)">
              {linhas.map((linha) => (
                <div key={linha.rotulo} className="grid grid-cols-1 @md:grid-cols-[8.5rem_1fr]">
                  <dt className="text-tinta-suave text-sm leading-(--linha)">{linha.rotulo}</dt>
                  <dd className={linha.valor ? "whitespace-pre-line" : "text-tinta-suave"}>
                    {linha.valor ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          {/* No celular as colunas ficam uma embaixo da outra: o índice leva direto a cada uma. */}
          <nav
            aria-label="Seções da festa"
            className="folha folha-lisa py-(--linha) pr-5 pl-[calc(var(--margem)+0.875rem)] leading-(--linha) md:hidden"
          >
            <ul className="pautado">
              {[
                ["#convidados", "Convidados", `${convidados.length}`],
                ["#fornecedores", "Fornecedores", `${colunas.fornecedores.length}`],
                ["#mesas", "Mesas", `${colunas.mesas.length}`],
                ["#cronograma", "Cronograma", `${colunas.cronograma.length}`],
                ["#planta", "Planta do salão", festa.plantaUrl ? "1" : ""],
                ["#pdfs", "PDFs", "2"],
              ].map(([href, rotulo, n]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group focus-visible:outline-ring flex h-[calc(var(--linha)*2)] items-end justify-between rounded-sm focus-visible:outline-2"
                  >
                    <span className="grifo-ao-passar">{rotulo}</span>
                    <span className="text-tinta-suave font-mono text-[0.8125rem]">{n}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {festa.convidadosApagadosEm ? (
            // LGPD: 90 dias depois da festa os convidados foram apagados; ficam os números.
            <section
              id="convidados"
              aria-labelledby="titulo-convidados"
              className="folha folha-lisa pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
            >
              <h2 id="titulo-convidados" className="text-lg font-semibold">
                Convidados
              </h2>
              <p className="text-tinta-suave text-sm leading-(--linha)">
                <strong className="text-foreground font-semibold">{festa.resumoConvidados}</strong>{" "}
                convidados ·{" "}
                <strong className="text-foreground font-semibold">{festa.resumoConfirmados}</strong>{" "}
                confirmaram ·{" "}
                <strong className="text-foreground font-semibold">{festa.resumoPresentes}</strong>{" "}
                chegaram
              </p>
              <p className="text-tinta-suave text-sm leading-(--linha)">
                Nomes e telefones apagados em {dataCurta(festa.convidadosApagadosEm)}, 90 dias
                depois da festa, como manda a LGPD.
              </p>
            </section>
          ) : (
            <SecaoConvidados
              festaId={festa.id}
              festa={{ titulo: festa.titulo, dataHora: festa.dataHora, localNome: festa.localNome }}
              convidados={convidados}
              contagem={contarPorStatus(convidados)}
              origem={origem}
              aviso={
                concluida && convidados.length > 0
                  ? `Nomes e telefones serão apagados em ${dataCurta(apagamentoPrevisto(festa.dataHora))}, 90 dias depois da festa (LGPD).`
                  : undefined
              }
            />
          )}
        </div>
        {/* Em telas médias, as três colunas empilham à direita; em telas largas viram colunas. */}
        <div className="flex min-w-0 flex-col gap-6 xl:contents">
          <ColunaFornecedores festaId={festa.id} fornecedores={colunas.fornecedores} />
          <ColunaMesas
            festaId={festa.id}
            mesas={colunas.mesas}
            convidados={convidados.map((c) => ({ id: c.id, nome: c.nome, mesaId: c.mesaId }))}
          />
          <ColunaCronograma
            festaId={festa.id}
            cronograma={colunas.cronograma}
            fornecedores={colunas.fornecedores}
          />
        </div>
      </div>

      <section
        id="planta"
        aria-labelledby="titulo-planta"
        className="folha folha-lisa mt-6 pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
      >
        <h2 id="titulo-planta" className="text-lg font-semibold">
          Planta do salão
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

      <section
        id="pdfs"
        aria-labelledby="titulo-pdfs"
        className="folha folha-lisa mt-6 pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
      >
        <h2 id="titulo-pdfs" className="text-lg font-semibold">
          PDFs
        </h2>
        <ul className="pautado mt-(--linha) max-w-3xl">
          {[
            {
              tipo: "convite",
              titulo: "Convite",
              detalhe:
                "Para os convidados: data, horário, local e traje (sem as observações). Dá para imprimir ou mandar no WhatsApp.",
            },
            {
              tipo: "roteiro",
              titulo: "Roteiro completo",
              detalhe:
                "Dados, fornecedores com valores, mesas, cronograma e planta. Para você e a equipe.",
            },
          ].map((pdf) => (
            // Tudo na altura da pauta: título e ação numa linha, descrição embaixo.
            <li key={pdf.tipo}>
              <div className="flex items-end justify-between gap-4">
                <span className="min-w-0 truncate font-medium">{pdf.titulo}</span>
                <a
                  href={`/painel/festas/${festa.id}/pdf/${pdf.tipo}`}
                  target="_blank"
                  rel="noopener"
                  aria-label={`Abrir PDF: ${pdf.titulo}`}
                  className="group focus-visible:outline-ring inline-flex h-(--linha) shrink-0 items-center gap-1.5 rounded-sm text-sm font-medium focus-visible:outline-2"
                >
                  <FileText aria-hidden className="size-4" strokeWidth={1.75} />
                  <span className="grifo-ao-passar">Abrir PDF</span>
                </a>
              </div>
              <p className="text-tinta-suave text-sm leading-(--linha)">{pdf.detalhe}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
