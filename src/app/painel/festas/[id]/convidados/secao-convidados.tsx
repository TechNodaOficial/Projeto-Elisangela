"use client";

import { Search, Users } from "lucide-react";
import { Fragment, useDeferredValue, useState } from "react";

import { Input } from "@/components/ui/input";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import { semAcento } from "@/lib/texto";

import { adicionarConvidado } from "./actions";
import { FormConvidado } from "./form-convidado";
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
  const termo = semAcento(useDeferredValue(busca).trim());
  const visiveis = termo
    ? convidados.filter((c) => semAcento(c.nome).includes(termo) || c.telefone?.includes(termo))
    : convidados;

  return (
    <section
      id="convidados"
      aria-labelledby="titulo-convidados"
      className="folha folha-lisa @container pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
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

      {convidados.length === 0 ? (
        <div className="text-tinta-suave mt-(--linha) flex items-start gap-3 text-sm">
          <Users aria-hidden className="mt-1.5 size-4 shrink-0" strokeWidth={1.75} />
          <p className="leading-(--linha)">
            Nenhum convidado ainda. Cada pessoa que você adicionar recebe um link próprio para
            confirmar a presença; envie pelo botão de WhatsApp ou copie o link.
          </p>
        </div>
      ) : (
        <>
          {convidados.length >= MOSTRAR_BUSCA_A_PARTIR_DE && (
            <div className="relative mt-(--linha) @md:max-w-xs">
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

          <ul className="pautado mt-(--linha)" aria-label="Lista de convidados">
            {visiveis.map((convidado) => (
              <LinhaConvidado
                key={convidado.id}
                convidado={convidado}
                festa={festa}
                origem={origem}
              />
            ))}
          </ul>
          {visiveis.length === 0 && (
            <p className="text-tinta-suave text-sm">Nenhum convidado com “{busca.trim()}”.</p>
          )}
        </>
      )}
    </section>
  );
}
