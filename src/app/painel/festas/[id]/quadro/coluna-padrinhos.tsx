"use client";

import { Check, MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import type { Colunas } from "@/lib/festas/consultas";
import { AREA_ROLAVEL, CARTAO, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

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
  adicionarItemPadrinho,
  alternarItemPadrinho,
  criarPadrinho,
  editarPadrinho,
  removerItemPadrinho,
  removerPadrinho,
} from "./actions";

type Padrinho = Colunas["padrinhos"][number];

const CAMPOS: Campo[] = [
  { nome: "nome", rotulo: "Nome", placeholder: "Ex.: Carla e Rafael", max: 120 },
  {
    nome: "telefone",
    rotulo: "WhatsApp",
    tipo: "tel",
    inputMode: "tel",
    mono: true,
    opcional: true,
    placeholder: "(19) 99876-5432",
  },
];

function Cartao({ padrinho }: { padrinho: Padrinho }) {
  const [editando, setEditando] = useState(false);
  const itens = padrinho.checklist;
  const feitos = itens.filter((i) => i.feito).length;
  const completo = itens.length > 0 && feitos === itens.length;

  return (
    // Altura fixa: o checklist rola dentro do cartão. Editando, o cartão cresce.
    <li className={cn(CARTAO, COR_RAIA.cerimonia, !editando && "h-80")}>
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold break-words">{padrinho.nome}</p>
          <p className="text-tinta-suave text-sm">
            {padrinho.telefone ? (
              <span className="font-mono">{formatarTelefone(padrinho.telefone)}</span>
            ) : (
              "Sem WhatsApp"
            )}
            {itens.length > 0 && (
              <span className={cn("font-mono", completo && "text-foreground font-semibold")}>
                {" "}
                · {feitos}/{itens.length}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {padrinho.telefone && (
            <Button
              asChild
              variant="ghost"
              className="text-tinta-suave hover:text-foreground size-11 sm:size-7"
            >
              <a
                href={linkWhatsApp(padrinho.telefone, "")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Conversar com ${padrinho.nome} no WhatsApp`}
              >
                <MessageCircle aria-hidden strokeWidth={1.75} />
              </a>
            </Button>
          )}
          <MenuLinha
            nome={padrinho.nome}
            aoEditar={() => setEditando(true)}
            remocao={{
              titulo: "Tirar este padrinho?",
              descricao: <>{padrinho.nome} sai da lista, junto com o checklist.</>,
              rotulo: "Tirar padrinho",
              acao: removerPadrinho.bind(null, padrinho.id),
            }}
          />
        </div>
      </div>

      {editando && (
        <div className="bg-card -mx-1 mt-2 shrink-0 rounded-lg px-3">
          <FormCampos
            acao={editarPadrinho.bind(null, padrinho.id)}
            campos={CAMPOS}
            inicial={{ nome: padrinho.nome, telefone: padrinho.telefone ?? "" }}
            rotuloEnviar="Salvar"
            rotuloEnviando="Salvando…"
            prefixo={`padrinho-${padrinho.id}`}
            aoSalvar={() => setEditando(false)}
            aoCancelar={() => setEditando(false)}
          />
        </div>
      )}

      <ul className={cn(AREA_ROLAVEL, "mt-2 flex flex-col")}>
        {itens.map((item) => (
          <li key={item.id} className={cn(LINHA_ALTERNADA, "group/item flex items-center gap-1")}>
            <form action={alternarItemPadrinho.bind(null, item.id)} className="min-w-0 flex-1">
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
            <form action={removerItemPadrinho.bind(null, item.id)}>
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
      <div className="shrink-0">
        <NovoItem
          acao={adicionarItemPadrinho.bind(null, padrinho.id)}
          rotulo={`Novo item do checklist de ${padrinho.nome}`}
        />
      </div>
    </li>
  );
}

// Padrinhos da cerimônia, cada um num cartão com o próprio checklist.
export function ColunaPadrinhos({
  festaId,
  padrinhos,
}: {
  festaId: string;
  padrinhos: Padrinho[];
}) {
  const prontos = padrinhos.filter(
    (p) => p.checklist.length > 0 && p.checklist.every((i) => i.feito),
  ).length;

  return (
    <Coluna
      id="padrinhos"
      titulo="Checklist dos padrinhos"
      resumo={
        padrinhos.length > 0 && (
          <>
            <N>{prontos}</N> de <N>{padrinhos.length}</N>{" "}
            {padrinhos.length === 1 ? "padrinho" : "padrinhos"} com tudo marcado
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo="Adicionar padrinho">
          {(fechar) => (
            <FormCampos
              acao={criarPadrinho.bind(null, festaId)}
              campos={CAMPOS}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="novo-padrinho"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {padrinhos.length === 0 ? (
        <Vazio>
          Cada padrinho (ou casal de padrinhos) ganha um checklist: confirmou presença, traje,
          ensaio e chegada no dia. Dá para tirar e acrescentar itens.
        </Vazio>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {padrinhos.map((p) => (
            <Cartao key={p.id} padrinho={p} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
