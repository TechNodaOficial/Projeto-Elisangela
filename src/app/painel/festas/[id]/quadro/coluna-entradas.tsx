"use client";

import { ChevronDown, ChevronUp, Music } from "lucide-react";
import { useState } from "react";

import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "../colunas/pecas";
import { criarEntrada, editarEntrada, moverEntrada, removerEntrada } from "./actions";

type Entrada = Colunas["entradas"][number];

const CAMPOS: Campo[] = [
  { nome: "quem", rotulo: "Quem entra", placeholder: "Ex.: Pais da noiva, Daminhas", max: 120 },
  {
    nome: "musica",
    rotulo: "Música",
    placeholder: "Ex.: Canon in D, Pachelbel",
    opcional: true,
    max: 160,
  },
];

const seta =
  "text-tinta-suave hover:text-foreground focus-visible:outline-ring flex size-9 items-center justify-center rounded-sm hover:bg-card focus-visible:outline-2 disabled:opacity-30 sm:size-7";

function Linha({ entrada, posicao, total }: { entrada: Entrada; posicao: number; total: number }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3">
        <FormCampos
          acao={editarEntrada.bind(null, entrada.id)}
          campos={CAMPOS}
          inicial={{ quem: entrada.quem, musica: entrada.musica ?? "" }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`entrada-${entrada.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li className={cn(LINHA_ALTERNADA, "flex items-center gap-2 py-1.5 pl-2")}>
      <span className="text-tinta-suave w-6 shrink-0 text-right font-mono text-sm">
        {posicao + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">{entrada.quem}</p>
        {entrada.musica && (
          <p className="text-tinta-suave flex items-center gap-1 text-sm break-words">
            <Music aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
            {entrada.musica}
          </p>
        )}
      </div>
      <form action={moverEntrada.bind(null, entrada.id, -1)}>
        <button
          type="submit"
          disabled={posicao === 0}
          aria-label={`Subir ${entrada.quem}`}
          className={seta}
        >
          <ChevronUp aria-hidden className="size-4" strokeWidth={2} />
        </button>
      </form>
      <form action={moverEntrada.bind(null, entrada.id, 1)}>
        <button
          type="submit"
          disabled={posicao === total - 1}
          aria-label={`Descer ${entrada.quem}`}
          className={seta}
        >
          <ChevronDown aria-hidden className="size-4" strokeWidth={2} />
        </button>
      </form>
      <MenuLinha
        nome={entrada.quem}
        aoEditar={() => setEditando(true)}
        remocao={{
          titulo: "Tirar do cortejo?",
          descricao: <>{entrada.quem} sai da ordem de entradas.</>,
          rotulo: "Tirar",
          acao: removerEntrada.bind(null, entrada.id),
        }}
      />
    </li>
  );
}

// Ordem do cortejo: quem entra, em que ordem, com qual música. As setas trocam a posição.
export function ColunaEntradas({ festaId, entradas }: { festaId: string; entradas: Entrada[] }) {
  return (
    <Coluna
      id="entradas"
      titulo="Entradas da cerimônia"
      resumo={
        entradas.length > 0 && (
          <>
            <N>{entradas.length}</N> {entradas.length === 1 ? "entrada" : "entradas"} no cortejo
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo="Adicionar entrada">
          {(fechar) => (
            <FormCampos
              acao={criarEntrada.bind(null, festaId)}
              campos={CAMPOS}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="nova-entrada"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {entradas.length === 0 ? (
        <Vazio>
          Na ordem em que entram: celebrante, padrinhos, pais, daminhas, noivo, noiva… Cada nova
          entrada vai para o fim; use as setas para mudar a ordem.
        </Vazio>
      ) : (
        <ol className={cn(BANDEJA, COR_RAIA.cerimonia, "mt-2")} aria-label="Cortejo">
          {entradas.map((e, i) => (
            <Linha key={e.id} entrada={e} posicao={i} total={entradas.length} />
          ))}
        </ol>
      )}
    </Coluna>
  );
}
