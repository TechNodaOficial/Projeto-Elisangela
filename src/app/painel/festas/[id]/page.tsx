import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  CircleAlert,
  CircleCheck,
  Clock,
  FileText,
  Footprints,
  Handshake,
  HeartHandshake,
  KeyRound,
  Map as IconeMapa,
  Pencil,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { lugaresDe } from "@/lib/convidados/contagem";
import { diasAte, festaConcluida, partesData, rotuloProximidade } from "@/lib/datas";
import { buscarFesta, listarColunas } from "@/lib/festas/consultas";
import { situacoesDoQuadro, type Botao } from "@/lib/festas/quadro";
import { versaoPlanta } from "@/lib/planta/blob";
import { cn } from "@/lib/utils";

import { AvisoArquivo } from "./arquivo";
import { ExcluirFesta } from "./excluir-festa";
import { BotaoFoto } from "./foto/botao-foto";

export async function generateMetadata(props: PageProps<"/painel/festas/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `${festa.titulo} · Painel de Festas` : "Festa não encontrada" };
}

export default async function PaginaFesta(props: PageProps<"/painel/festas/[id]">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  const [convidados, colunas] = await Promise.all([
    listarConvidados(festa.id),
    listarColunas(festa.id),
  ]);
  const data = partesData(festa.dataHora);
  const concluida = festaConcluida(festa.dataHora);
  const dias = diasAte(festa.dataHora);
  const voltar = concluida
    ? { href: "/painel/concluidas", rotulo: "Festas concluídas" }
    : { href: "/painel", rotulo: "Festas pendentes" };

  const contagem = contarPorStatus(convidados);
  const situacoes = situacoesDoQuadro({
    contratacoes: colunas.contratacoes.map((c) => ({
      ...c,
      fornecedorId: c.fornecedor?.id ?? null,
    })),
    convidados: festa.convidadosApagadosEm ? null : contagem,
    temCroqui: !!festa.plantaUrl,
    mesas: colunas.mesas.length,
    pessoasSemMesa: convidados
      .filter((c) => !c.mesaId && c.rsvp === "CONFIRMADO")
      .reduce((s, c) => s + lugaresDe(c), 0),
    cronograma: colunas.cronograma.length,
    menu: colunas.menu.length,
    cerimonial: colunas.cerimonial.length,
    entradas: colunas.entradas.length,
    padrinhos: colunas.padrinhos.map((p) => ({
      itens: p.checklist.length,
      feitos: p.checklist.filter((i) => i.feito).length,
    })),
  });

  // O quadro da festa, como o kanban da Elisangela: três raias, cada botão abre uma página.
  // A cor de raia vale para os botões neutros; verde/amarelo mostram a situação.
  const raias: {
    titulo: string;
    cor: string;
    botoes: { href: string; titulo: string; icone: LucideIcon; botao: Botao }[];
  }[] = [
    {
      titulo: "Fornecedores e cronograma",
      cor: "bg-pastel-pessego",
      botoes: [
        {
          href: "fornecedores",
          titulo: "Fornecedores",
          icone: Handshake,
          botao: situacoes.fornecedores,
        },
        {
          href: "cronograma",
          titulo: "Cronograma e menu",
          icone: Clock,
          botao: situacoes.cronograma,
        },
      ],
    },
    {
      titulo: "Recepção",
      cor: "bg-pastel-rosa",
      botoes: [
        {
          href: "convidados",
          titulo: "Lista de convidados",
          icone: Users,
          botao: situacoes.convidados,
        },
        { href: "croqui", titulo: "Croqui", icone: IconeMapa, botao: situacoes.croqui },
        { href: "mesas", titulo: "Layout", icone: Armchair, botao: situacoes.layout },
      ],
    },
    {
      titulo: "Cerimônia",
      cor: "bg-pastel-lilas",
      botoes: [
        {
          href: "cerimonial",
          titulo: "Cerimonial",
          icone: ScrollText,
          botao: situacoes.cerimonial,
        },
        {
          href: "entradas",
          titulo: "Entradas cerimônia",
          icone: Footprints,
          botao: situacoes.entradas,
        },
        {
          href: "padrinhos",
          titulo: "Checklist dos padrinhos",
          icone: HeartHandshake,
          botao: situacoes.padrinhos,
        },
      ],
    },
  ];

  // Dados do roteiro que aparecem no topo.
  const linhas = [
    { rotulo: "Local", valor: festa.localNome },
    { rotulo: "Endereço", valor: festa.endereco },
    { rotulo: "Traje", valor: festa.traje },
    { rotulo: "Observações", valor: festa.observacoes },
  ].filter((linha) => linha.valor);

  return (
    // Com foto, ela ocupa a área toda do conteúdo (desfaz o padding do <main>), por trás.
    <div className="relative isolate -mx-4 -mt-4 min-h-[calc(100dvh-3.5rem)] w-auto px-4 pt-4 md:-mx-8 md:-mt-6 md:px-8 md:pt-6">
      {festa.fotoUrl && (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          {/* Imagem privada servida pelo próprio painel (com login): o otimizador do next/image não teria a sessão. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/painel/festas/${festa.id}/foto?v=${versaoPlanta(festa.fotoUrl)}`}
            alt=""
            className="size-full object-cover"
          />
          {/* Véu bege: a foto aparece, mas texto e cartões continuam legíveis; some no fim. */}
          <div className="from-mesa/35 via-mesa/15 to-mesa absolute inset-0 bg-linear-to-b" />
        </div>
      )}
      {/* Voltar, ações e o topo da festa. No celular as ações vêm depois do topo, numa faixa
          que rola de lado, para o nome da festa aparecer primeiro. */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[auto_1fr] md:items-center md:gap-x-2 md:gap-y-4">
        <Link
          href={voltar.href}
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring bg-mesa/80 inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-sm focus-visible:outline-2 md:self-center"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          {voltar.rotulo}
        </Link>
        <div className="order-last -mx-4 flex items-center gap-1 overflow-x-auto px-4 md:order-none md:mx-0 md:flex-wrap md:justify-end md:overflow-visible md:px-0 [&>*]:shrink-0">
          <Button asChild variant="outline" className="bg-card h-9">
            <Link href={`/painel/festas/${festa.id}/editar`}>
              <Pencil aria-hidden strokeWidth={1.75} />
              Editar
            </Link>
          </Button>
          {!concluida && (
            <Button asChild variant="outline" className="bg-card h-9">
              <Link href={`/painel/festas/${festa.id}/portaria`}>
                <KeyRound aria-hidden strokeWidth={1.75} />
                Portaria
              </Link>
            </Button>
          )}
          <BotaoFoto festaId={festa.id} temFoto={!!festa.fotoUrl} />
          {[
            { tipo: "convite", rotulo: "PDF do convite" },
            { tipo: "roteiro", rotulo: "PDF do roteiro" },
          ].map((pdf) => (
            <Button key={pdf.tipo} asChild variant="outline" className="bg-card h-9">
              <a
                href={`/painel/festas/${festa.id}/pdf/${pdf.tipo}`}
                target="_blank"
                rel="noopener"
                title="Abre em outra aba"
              >
                <FileText aria-hidden strokeWidth={1.75} />
                {pdf.rotulo}
              </a>
            </Button>
          ))}
          <ExcluirFesta id={festa.id} titulo={festa.titulo} />
        </div>

        {/* Topo: data, nome e dados da festa. */}
        <header className="folha px-4 py-3 md:col-span-2 md:px-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[2rem] leading-none font-medium tracking-[-0.04em]">
              {data.dia}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg leading-tight font-semibold tracking-[-0.01em] text-balance">
                {festa.titulo}
              </h1>
              <p className="text-tinta-suave text-[0.8125rem] leading-snug">
                {data.semana.replace(/^./, (c) => c.toUpperCase())}, {data.mes} {data.ano} ·{" "}
                <span className="font-mono">{data.hora}</span> ·{" "}
                <span
                  className={!concluida && dias <= 7 ? "grifo text-foreground font-semibold" : ""}
                >
                  {concluida
                    ? `Concluída · ${rotuloProximidade(dias).toLowerCase()}`
                    : rotuloProximidade(dias)}
                </span>
              </p>
            </div>
          </div>

          {linhas.length > 0 && (
            <dl className="border-border mt-2.5 flex flex-wrap gap-x-5 gap-y-1 border-t pt-2.5 text-[0.8125rem] leading-snug">
              {linhas.map((linha) => (
                <div key={linha.rotulo} className="flex min-w-0 gap-1.5">
                  <dt className="text-tinta-suave shrink-0">{linha.rotulo}:</dt>
                  <dd className="line-clamp-2 min-w-0">{linha.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>
      </div>

      {/* Concluída: baixar o PDF completo antes da limpeza (ou o aviso de arquivada). */}
      {concluida && <AvisoArquivo festa={festa} />}

      {/* Corpo: o quadro, três raias lado a lado (uma embaixo da outra no celular).
          Festa arquivada não tem mais dados: o quadro sai. */}
      {!festa.convidadosApagadosEm && (
        <nav
          aria-label="Quadro da festa"
          className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-3"
        >
          {raias.map((raia) => (
            <section
              key={raia.titulo}
              aria-labelledby={`raia-${raia.titulo}`}
              className="bg-card/75 rounded-2xl p-3 shadow-[0_1px_1px_oklch(0.2_0.01_250/6%),0_6px_16px_-8px_oklch(0.2_0.01_250/22%)] backdrop-blur-sm"
            >
              <h2
                id={`raia-${raia.titulo}`}
                className="text-tinta-suave px-1 pb-2 text-xs font-semibold tracking-[0.06em] uppercase"
              >
                {raia.titulo}
              </h2>
              <ul className="flex flex-col gap-3">
                {raia.botoes.map(({ href, titulo, icone: Icone, botao }) => (
                  <li key={href}>
                    <Link
                      href={`/painel/festas/${festa.id}/${href}`}
                      className={cn(
                        botao.situacao === "ok"
                          ? "bg-resolvida"
                          : botao.situacao === "pendente"
                            ? "bg-pendente"
                            : raia.cor,
                        "group focus-visible:outline-ring flex items-center gap-3 rounded-xl p-4 transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_oklch(0.2_0.01_250/35%)] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      )}
                    >
                      <Icone aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{titulo}</span>
                        <span className="text-tinta-suave flex items-center gap-1 text-sm">
                          {botao.situacao === "ok" && (
                            <CircleCheck
                              aria-hidden
                              className="text-resolvida-forte size-3.5 shrink-0"
                              strokeWidth={2}
                            />
                          )}
                          {botao.situacao === "pendente" && (
                            <CircleAlert
                              aria-hidden
                              className="size-3.5 shrink-0"
                              strokeWidth={2}
                            />
                          )}
                          <span className="truncate">{botao.resumo}</span>
                        </span>
                        {/* O que falta, um por linha (spans: dentro do link não cabe lista). */}
                        {botao.detalhes && (
                          <span className="mt-1.5 flex flex-col gap-0.5 text-[0.8125rem] leading-snug">
                            {botao.detalhes.map((d) => (
                              <span
                                key={d}
                                className="before:bg-pendente-forte relative block pl-3 first-letter:uppercase before:absolute before:top-[0.45em] before:left-0.5 before:size-1.5 before:rounded-full"
                              >
                                {d}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      )}
    </div>
  );
}
