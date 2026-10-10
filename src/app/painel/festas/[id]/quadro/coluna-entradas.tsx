"use client";

import { Check, ChevronDown, ChevronUp, ListChecks, Music, X } from "lucide-react";
import { useState } from "react";

import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { CHECKLIST_CERIMONIA_SUGERIDO } from "@/lib/festas/colunas-schema";

import {
  Adicionar,
  Coluna,
  FormCampos,
  MenuLinha,
  N,
  NovoItem,
  Vazio,
  type Campo,
} from "../colunas/pecas";
import {
  adicionarItemCerimonia,
  alternarItemCerimonia,
  criarEntrada,
  editarEntrada,
  moverEntrada,
  removerEntrada,
  removerItemCerimonia,
  usarChecklistCerimoniaSugerido,
} from "./actions";

type Entrada = Colunas["entradas"][number];
type ItemCerimonia = Colunas["checklistCerimonia"][number];

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

// Checklist da cerimônia, no fim do cortejo: o que precisa estar à mão (lapelas, buquês,
// porta-alianças…). Ela define os itens; sai também no PDF do roteiro, para marcar à caneta.
function ChecklistCerimonia({ festaId, itens }: { festaId: string; itens: ItemCerimonia[] }) {
  const feitos = itens.filter((i) => i.feito).length;
  return (
    <section aria-labelledby="titulo-checklist-cerimonia" className="mt-(--linha)">
      <h3 id="titulo-checklist-cerimonia" className="flex items-center gap-2 font-semibold">
        <ListChecks aria-hidden className="size-4.5" strokeWidth={1.75} />
        Checklist da cerimônia
        {itens.length > 0 && (
          <span className="text-tinta-suave font-mono text-sm font-normal">
            {feitos}/{itens.length}
          </span>
        )}
      </h3>
      {itens.length === 0 ? (
        <div className="text-tinta-suave text-sm leading-snug">
          <p>
            O que precisa estar à mão no cortejo. Comece pela lista de sempre (
            {CHECKLIST_CERIMONIA_SUGERIDO.join(", ").toLowerCase()}) ou escreva os seus itens.
          </p>
          <form action={usarChecklistCerimoniaSugerido.bind(null, festaId)} className="mt-2">
            <Button type="submit" variant="outline" className="bg-card h-9">
              Usar a lista de sempre
            </Button>
          </form>
        </div>
      ) : (
        <ul className={cn(BANDEJA, COR_RAIA.cerimonia, "mt-2 @2xl:grid @2xl:grid-cols-2")}>
          {itens.map((item) => (
            <li key={item.id} className={cn(LINHA_ALTERNADA, "group/item flex items-center gap-1")}>
              <form action={alternarItemCerimonia.bind(null, item.id)} className="min-w-0 flex-1">
                <button
                  type="submit"
                  role="checkbox"
                  aria-checked={item.feito}
                  className="focus-visible:outline-ring hover:bg-card flex min-h-9 w-full items-center gap-2.5 rounded-sm px-1.5 text-left text-sm focus-visible:outline-2"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4.5 shrink-0 items-center justify-center rounded-[3px] border",
                      item.feito
                        ? "bg-resolvida-forte border-resolvida-forte text-white"
                        : "border-input bg-card",
                    )}
                  >
                    {item.feito && <Check className="size-3.5" strokeWidth={2.5} />}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 break-words",
                      item.feito && "text-tinta-suave line-through",
                    )}
                  >
                    {item.texto}
                  </span>
                </button>
              </form>
              <form action={removerItemCerimonia.bind(null, item.id)}>
                <button
                  type="submit"
                  aria-label={`Tirar "${item.texto}" do checklist`}
                  className="text-tinta-suave hover:text-foreground focus-visible:outline-ring hover:bg-card flex size-9 items-center justify-center rounded-sm focus-visible:outline-2 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X aria-hidden className="size-4" strokeWidth={1.75} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <div className="@md:max-w-sm">
        <NovoItem
          acao={adicionarItemCerimonia.bind(null, festaId)}
          rotulo="Novo item do checklist da cerimônia"
        />
      </div>
    </section>
  );
}

// Ordem do cortejo: quem entra, em que ordem, com qual música. As setas trocam a posição.
// No fim, o checklist da cerimônia.
export function ColunaEntradas({
  festaId,
  entradas,
  checklist,
}: {
  festaId: string;
  entradas: Entrada[];
  checklist: ItemCerimonia[];
}) {
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

      <ChecklistCerimonia festaId={festaId} itens={checklist} />
    </Coluna>
  );
}
