"use client";

import { Check, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import { paraCampos } from "@/lib/datas";
import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "../colunas/pecas";
import {
  alternarPresencaPadrinho,
  criarPadrinho,
  editarPadrinho,
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

function Linha({ padrinho }: { padrinho: Padrinho }) {
  const [editando, setEditando] = useState(false);
  const presente = padrinho.presenteEm !== null;

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3">
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
      </li>
    );
  }

  return (
    <li className={cn(LINHA_ALTERNADA, "flex items-center gap-1 pr-1")}>
      {/* A linha inteira marca a chegada: no dia ela usa no celular, com pressa. */}
      <form action={alternarPresencaPadrinho.bind(null, padrinho.id)} className="min-w-0 flex-1">
        <button
          type="submit"
          role="checkbox"
          aria-checked={presente}
          className="focus-visible:outline-ring hover:bg-card flex min-h-12 w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left focus-visible:outline-2"
        >
          <span
            aria-hidden
            className={cn(
              "flex size-5.5 shrink-0 items-center justify-center rounded-[4px] border",
              presente
                ? "bg-resolvida-forte border-resolvida-forte text-white"
                : "border-input bg-card",
            )}
          >
            {presente && <Check className="size-4" strokeWidth={2.5} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium break-words">{padrinho.nome}</span>
            <span className="text-tinta-suave block text-sm">
              {presente ? (
                <>
                  Chegou às{" "}
                  <span className="font-mono">{paraCampos(padrinho.presenteEm!).hora}</span>
                </>
              ) : padrinho.telefone ? (
                <span className="font-mono">{formatarTelefone(padrinho.telefone)}</span>
              ) : (
                "Sem WhatsApp"
              )}
            </span>
          </span>
        </button>
      </form>
      {padrinho.telefone && (
        <Button
          asChild
          variant="ghost"
          className="text-tinta-suave hover:text-foreground size-11 sm:size-8"
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
          descricao: <>{padrinho.nome} sai da lista de padrinhos.</>,
          rotulo: "Tirar padrinho",
          acao: removerPadrinho.bind(null, padrinho.id),
        }}
      />
    </li>
  );
}

// Lista de presença dos padrinhos: no dia, ela marca cada um conforme chega.
export function ColunaPadrinhos({
  festaId,
  padrinhos,
}: {
  festaId: string;
  padrinhos: Padrinho[];
}) {
  const presentes = padrinhos.filter((p) => p.presenteEm !== null).length;

  return (
    <Coluna
      id="padrinhos"
      titulo="Padrinhos"
      resumo={
        padrinhos.length > 0 && (
          <>
            <N>{presentes}</N> de <N>{padrinhos.length}</N>{" "}
            {padrinhos.length === 1 ? "padrinho chegou" : "padrinhos chegaram"}
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
          Cadastre os padrinhos (ou casais de padrinhos). No dia da festa, toque em cada um quando
          chegar: a lista guarda a hora. Ela também sai no PDF do roteiro, para marcar no papel.
        </Vazio>
      ) : (
        <ul className={cn(BANDEJA, COR_RAIA.cerimonia, "mt-2")} aria-label="Lista de padrinhos">
          {padrinhos.map((p) => (
            <Linha key={p.id} padrinho={p} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
