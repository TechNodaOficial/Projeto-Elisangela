import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { gradeDoMes, mesVizinho, type Mes } from "@/lib/calendario";
import { paraCampos, paraInstante } from "@/lib/datas";
import { listarFestasNoPeriodo } from "@/lib/festas/consultas";
import { pendenciasDaFesta } from "@/lib/festas/pendencias";
import { cn } from "@/lib/utils";

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const nomeDoMes = ({ ano, mes }: Mes) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(ano, mes - 1, 1)),
  );

// Dia seguinte a "2026-10-31", para fechar o período da busca.
function diaSeguinte(data: string) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
}

const SETA =
  "text-tinta-suave hover:text-foreground hover:bg-muted focus-visible:outline-ring flex size-9 items-center justify-center rounded-md focus-visible:outline-2";

const doisDigitos = (n: number) => String(n).padStart(2, "0");

// Festas entre dois dias ("2026-10-01" incluso, "2026-11-01" não), com as pendências,
// agrupadas por dia (no fuso de São Paulo).
async function festasPorDia(inicio: string, fimExclusivo: string) {
  const festas = (
    await listarFestasNoPeriodo(paraInstante(inicio, "00:00"), paraInstante(fimExclusivo, "00:00"))
  ).map(({ contratacoes, ...festa }) => ({
    ...festa,
    pendencias: pendenciasDaFesta({ contratacoes }),
  }));
  const porDia = new Map<string, typeof festas>();
  for (const festa of festas) {
    const { data } = paraCampos(festa.dataHora);
    porDia.set(data, [...(porDia.get(data) ?? []), festa]);
  }
  return { festas, porDia };
}

// Topo do calendário: título, a chave Mês | Ano e as setas.
function Topo({
  titulo,
  vista,
  hrefMes,
  hrefAno,
  hoje,
  anterior,
  proximo,
}: {
  titulo: React.ReactNode;
  vista: "mes" | "ano";
  hrefMes: string;
  hrefAno: string;
  hoje: string;
  anterior: { href: string; rotulo: string };
  proximo: { href: string; rotulo: string };
}) {
  const aba = (ativa: boolean) =>
    cn(
      "focus-visible:outline-ring rounded-md px-3 py-1 text-sm focus-visible:outline-2",
      ativa
        ? "bg-card text-foreground font-semibold shadow-sm"
        : "text-tinta-suave hover:text-foreground",
    );
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 id="titulo-calendario" className="text-lg font-semibold first-letter:uppercase">
        {titulo}
      </h2>
      <div className="flex items-center gap-2">
        <nav aria-label="Visão do calendário" className="bg-muted flex rounded-lg p-0.5">
          <Link
            href={hrefMes}
            aria-current={vista === "mes" ? "page" : undefined}
            className={aba(vista === "mes")}
          >
            Mês
          </Link>
          <Link
            href={hrefAno}
            aria-current={vista === "ano" ? "page" : undefined}
            className={aba(vista === "ano")}
          >
            Ano
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href={hoje}
            className="text-tinta-suave hover:text-foreground hover:bg-muted focus-visible:outline-ring rounded-md px-2.5 py-1.5 text-sm focus-visible:outline-2"
          >
            Hoje
          </Link>
          <Link href={anterior.href} aria-label={anterior.rotulo} className={SETA}>
            <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
          </Link>
          <Link href={proximo.href} aria-label={proximo.rotulo} className={SETA}>
            <ChevronRight aria-hidden className="size-5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Legenda() {
  return (
    <ul className="text-tinta-suave mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="bg-resolvida border-resolvida-forte size-3 rounded-sm border-l-[3px]"
        />
        Tudo resolvido
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="bg-pendente border-pendente-forte size-3 rounded-sm border-l-[3px]"
        />
        Tem pendência (fornecedor, pagamento ou checklist)
      </li>
    </ul>
  );
}

// Calendário do painel, em duas visões:
// - Mês: os dias com as festas escritas, verde se está tudo resolvido, amarelo se falta
//   algo (ver pendenciasDaFesta). Cada festa leva à sua página.
// - Ano: os 12 meses pequenos, com os dias comprometidos marcados; o dia abre o mês.
export async function Calendario({
  vista,
  mes,
  ano,
}: {
  vista: "mes" | "ano";
  mes: Mes;
  ano: number;
}) {
  return vista === "ano" ? <CalendarioAno ano={ano} /> : <CalendarioMes mes={mes} />;
}

async function CalendarioAno({ ano }: { ano: number }) {
  const { festas, porDia } = await festasPorDia(`${ano}-01-01`, `${ano + 1}-01-01`);
  const hoje = paraCampos(new Date()).data;
  const anoAtual = Number(hoje.slice(0, 4));
  // Voltar para o mês: o atual se for este ano, senão janeiro.
  const mesDeVolta = ano === anoAtual ? hoje.slice(0, 7) : `${ano}-01`;

  return (
    <section aria-labelledby="titulo-calendario" className="folha mb-8 p-4 md:p-5">
      <Topo
        titulo={
          <>
            {ano}{" "}
            <span className="text-tinta-suave text-sm font-normal">
              · {festas.length} {festas.length === 1 ? "festa" : "festas"}
            </span>
          </>
        }
        vista="ano"
        hrefMes={`?mes=${mesDeVolta}`}
        hrefAno={`?vista=ano&ano=${ano}`}
        hoje={`?vista=ano&ano=${anoAtual}`}
        anterior={{ href: `?vista=ano&ano=${ano - 1}`, rotulo: "Ano anterior" }}
        proximo={{ href: `?vista=ano&ano=${ano + 1}`, rotulo: "Próximo ano" }}
      />

      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => {
          const mes = { ano, mes: i + 1 };
          const chave = `${ano}-${doisDigitos(i + 1)}`;
          return (
            <div key={chave} className="min-w-0">
              <Link
                href={`?mes=${chave}`}
                className="hover:text-foreground focus-visible:outline-ring mb-1 block rounded-sm text-sm font-semibold first-letter:uppercase focus-visible:outline-2"
              >
                {nomeDoMes(mes)}
              </Link>
              <table className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr>
                    {SEMANA.map((d) => (
                      <th
                        key={d}
                        scope="col"
                        className="text-tinta-suave text-[0.625rem] font-medium"
                      >
                        <abbr title={d} className="no-underline">
                          {d[0].toUpperCase()}
                        </abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gradeDoMes(mes).map((semana) => (
                    <tr key={semana[0].data}>
                      {semana.map((dia) => {
                        if (!dia.doMes) return <td key={dia.data} />;
                        const doDia = porDia.get(dia.data) ?? [];
                        const numero = (
                          <span
                            className={cn(
                              "mx-auto flex size-6 items-center justify-center rounded-full font-mono text-[0.6875rem]",
                              dia.data === hoje && "ring-foreground ring-1",
                            )}
                          >
                            {dia.dia}
                          </span>
                        );
                        if (doDia.length === 0) return <td key={dia.data}>{numero}</td>;
                        const pendente = doDia.some((f) => f.pendencias.length > 0);
                        const nomes = doDia
                          .map((f) => `${paraCampos(f.dataHora).hora} ${f.titulo}`)
                          .join(" · ");
                        return (
                          <td key={dia.data}>
                            {/* O dia comprometido abre o mês no calendário grande. */}
                            <Link
                              href={`?mes=${chave}`}
                              title={nomes}
                              aria-label={`${dia.dia}: ${nomes}${pendente ? " (com pendência)" : ""}`}
                              className={cn(
                                "focus-visible:outline-ring block rounded-full font-semibold focus-visible:outline-2 [&>span]:ring-2",
                                pendente
                                  ? "bg-pendente [&>span]:ring-pendente-forte"
                                  : "bg-resolvida [&>span]:ring-resolvida-forte",
                              )}
                            >
                              {numero}
                            </Link>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <Legenda />
    </section>
  );
}

async function CalendarioMes({ mes }: { mes: Mes }) {
  const semanas = gradeDoMes(mes);
  const primeiro = semanas[0][0].data;
  const ultimo = semanas[semanas.length - 1][6].data;
  const { porDia } = await festasPorDia(primeiro, diaSeguinte(ultimo));
  const hoje = paraCampos(new Date()).data;

  return (
    <section aria-labelledby="titulo-calendario" className="folha mb-8 p-4 md:p-5">
      <Topo
        titulo={
          <>
            {nomeDoMes(mes)} <span className="text-tinta-suave font-normal">{mes.ano}</span>
          </>
        }
        vista="mes"
        hrefMes={`?mes=${mes.ano}-${doisDigitos(mes.mes)}`}
        hrefAno={`?vista=ano&ano=${mes.ano}`}
        hoje={`?mes=${hoje.slice(0, 7)}`}
        anterior={{ href: `?mes=${mesVizinho(mes, -1)}`, rotulo: "Mês anterior" }}
        proximo={{ href: `?mes=${mesVizinho(mes, 1)}`, rotulo: "Próximo mês" }}
      />

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {SEMANA.map((d) => (
              <th
                key={d}
                scope="col"
                className="text-tinta-suave pb-1.5 text-center text-xs font-medium uppercase"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana) => (
            <tr key={semana[0].data}>
              {semana.map((dia) => {
                const doDia = porDia.get(dia.data) ?? [];
                const comPendencia = doDia.some((f) => f.pendencias.length > 0);
                return (
                  <td
                    key={dia.data}
                    className={cn(
                      "border-border h-14 border p-1 align-top md:h-20",
                      doDia.length > 0 && (comPendencia ? "bg-pendente" : "bg-resolvida"),
                      !dia.doMes && "opacity-45",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full font-mono text-xs",
                        dia.data === hoje && "bg-foreground text-background font-semibold",
                      )}
                    >
                      {dia.dia}
                    </span>
                    <ul className="mt-0.5 flex flex-col gap-0.5">
                      {doDia.map((festa) => {
                        const situacao =
                          festa.pendencias.length > 0
                            ? `Pendente: ${festa.pendencias.join(", ")}`
                            : "Tudo resolvido";
                        return (
                          <li key={festa.id}>
                            <Link
                              href={`/painel/festas/${festa.id}`}
                              title={`${festa.titulo} · ${situacao}`}
                              className={cn(
                                "bg-card hover:bg-muted focus-visible:outline-ring block truncate rounded-sm border-l-[3px] px-1 text-[0.6875rem] leading-5 font-medium focus-visible:outline-2 md:text-xs",
                                festa.pendencias.length > 0
                                  ? "border-pendente-forte"
                                  : "border-resolvida-forte",
                              )}
                            >
                              {/* No celular só cabe a hora ("20h"); o nome fica para leitores de tela. */}
                              <span className="font-mono md:hidden">
                                {paraCampos(festa.dataHora).hora.slice(0, 2)}h
                              </span>
                              <span className="hidden font-mono md:inline">
                                {paraCampos(festa.dataHora).hora}
                              </span>
                              <span className="sr-only md:not-sr-only"> {festa.titulo}</span>
                              <span className="sr-only"> · {situacao}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <Legenda />
    </section>
  );
}
