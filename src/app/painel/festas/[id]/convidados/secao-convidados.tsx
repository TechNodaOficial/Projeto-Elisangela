"use client";

import { Search, Users } from "lucide-react";
import { Fragment, useDeferredValue, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import { FILTROS, passaNoFiltro, type Filtro } from "@/lib/convidados/etapa";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { semAcento } from "@/lib/texto";
import { cn } from "@/lib/utils";

import { adicionarConvidado } from "./actions";
import { EnvioEmSequencia } from "./envio-em-sequencia";
import { FormConvidado } from "./form-convidado";
import { ImportarConvidados } from "./importar-convidados";
import { LinhaConvidado, type DadosFesta } from "./linha-convidado";

// A partir daqui vale mostrar a busca.
const MOSTRAR_BUSCA_A_PARTIR_DE = 8;

type Contagem = {
  total: number;
  confirmados: number;
  recusados: number;
  aguardando: number;
  presentes: number;
};

function ResumoContagem({ c }: { c: Contagem }) {
  if (c.total === 0) return null;
  const itens: [number, string][] = [
    [c.total, c.total === 1 ? "convidado" : "convidados"],
    [c.confirmados, "confirmaram"],
    [c.recusados, "não vão"],
    [c.aguardando, "aguardando"],
    ...(c.presentes > 0 ? [[c.presentes, "chegaram"] as [number, string]] : []),
  ];
  // Cada item fica inteiro, com o "·" no fim; a linha quebra no espaço depois dele.
  return (
    <p className="text-tinta-suave text-sm leading-(--linha)">
      {itens.map(([valor, rotulo], i) => (
        <Fragment key={rotulo}>
          <span className="whitespace-nowrap">
            <strong className="text-foreground font-semibold">{valor}</strong> {rotulo}
            {i < itens.length - 1 && " ·"}
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}

// Filtros por etapa ("Não enviados", "Confirmaram"…), com quantos convites há em cada um.
// Os vazios somem, menos "Todos" e o que estiver escolhido.
function Filtros({
  convidados,
  filtro,
  aoEscolher,
}: {
  convidados: ConvidadoResumo[];
  filtro: Filtro;
  aoEscolher: (f: Filtro) => void;
}) {
  const opcoes = FILTROS.map((f) => ({
    ...f,
    quantos: convidados.filter((c) => passaNoFiltro(c, f.id)).length,
  })).filter((f) => f.id === "todos" || f.id === filtro || f.quantos > 0);
  return (
    <div
      role="group"
      aria-label="Mostrar convidados"
      className="-mx-1 mt-(--linha) overflow-x-auto px-1 pb-1"
    >
      <div className="bg-muted flex w-max gap-0.5 rounded-lg p-0.5">
        {opcoes.map((f) => {
          const ativo = f.id === filtro;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoEscolher(f.id)}
              className={cn(
                "focus-visible:outline-ring flex h-9 items-center gap-1.5 rounded-md px-3 text-sm whitespace-nowrap focus-visible:outline-2",
                ativo
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-tinta-suave hover:text-foreground hover:bg-card/60",
              )}
            >
              {f.rotulo}
              <span className="font-mono text-xs">{f.quantos}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SecaoConvidados({
  festaId,
  festa,
  convidados,
  contagem,
  origem,
  aviso,
}: {
  festaId: string;
  festa: DadosFesta;
  convidados: ConvidadoResumo[];
  contagem: Contagem;
  origem: string;
  // Ex.: quando os dados serão apagados (LGPD), em festas concluídas.
  aviso?: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  // Para a lista colada avisar quem já está cadastrado.
  const cadastrados = useMemo(
    () => convidados.map((c) => ({ nome: c.nome, telefone: c.telefone })),
    [convidados],
  );
  const termo = semAcento(useDeferredValue(busca).trim());
  const visiveis = convidados.filter(
    (c) =>
      passaNoFiltro(c, filtro) &&
      (!termo || semAcento(c.nome).includes(termo) || c.telefone?.includes(termo)),
  );

  return (
    <section
      id="convidados"
      aria-labelledby="titulo-convidados"
      className="folha @container pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
    >
      <h2 id="titulo-convidados" className="text-lg font-semibold">
        Convidados
      </h2>
      <ResumoContagem c={contagem} />
      {aviso && <p className="text-tinta-suave text-sm leading-(--linha)">{aviso}</p>}

      <FormConvidado
        acao={adicionarConvidado.bind(null, festaId)}
        rotuloEnviar="Adicionar"
        rotuloEnviando="Adicionando…"
        prefixo="novo"
        className="mt-(--linha)"
      />
      <ImportarConvidados festaId={festaId} jaCadastrados={cadastrados} />
      {convidados.length > 0 && (
        <EnvioEmSequencia convidados={convidados} festa={festa} origem={origem} />
      )}

      {convidados.length === 0 ? (
        <div className="text-tinta-suave mt-(--linha) flex items-start gap-3 text-sm">
          <Users aria-hidden className="mt-1.5 size-4 shrink-0" strokeWidth={1.75} />
          <p className="leading-(--linha)">
            Nenhum convidado ainda. Cada convite (uma pessoa ou uma família inteira) recebe um link
            próprio para confirmar a presença e um QR Code só; envie pelo botão de WhatsApp ou copie
            o link.
          </p>
        </div>
      ) : (
        <>
          <Filtros convidados={convidados} filtro={filtro} aoEscolher={setFiltro} />
          {convidados.length >= MOSTRAR_BUSCA_A_PARTIR_DE && (
            <div className="relative mt-2 @md:max-w-xs">
              <Search
                aria-hidden
                className="text-tinta-suave pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                strokeWidth={1.75}
              />
              <Input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou telefone"
                aria-label="Buscar convidado"
                className="bg-card h-9 pl-9"
              />
            </div>
          )}

          <ul className={cn(BANDEJA, COR_RAIA.recepcao, "mt-3")} aria-label="Lista de convidados">
            {visiveis.map((convidado) => (
              <LinhaConvidado
                className={cn(LINHA_ALTERNADA, "px-2 py-1")}
                key={convidado.id}
                convidado={convidado}
                festa={festa}
                origem={origem}
              />
            ))}
          </ul>
          {visiveis.length === 0 && (
            <p className="text-tinta-suave text-sm">
              {termo
                ? `Nenhum convidado com “${busca.trim()}”${filtro !== "todos" ? " neste filtro" : ""}.`
                : "Nenhum convidado neste filtro."}{" "}
              {filtro !== "todos" && (
                <button
                  type="button"
                  onClick={() => setFiltro("todos")}
                  className="text-foreground focus-visible:outline-ring rounded-sm underline underline-offset-4 focus-visible:outline-2"
                >
                  Ver todos
                </button>
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
