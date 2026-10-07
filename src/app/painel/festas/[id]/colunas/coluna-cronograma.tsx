"use client";

import { useState } from "react";

import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { criarItemCronograma, editarItemCronograma, removerItemCronograma } from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "./pecas";

type Item = Colunas["cronograma"][number];
type Contratacao = Colunas["contratacoes"][number];

// "Buffet · Sabor & Arte" ou só "Buffet" enquanto não escolheu o fornecedor.
const rotuloContratacao = (c: {
  servico: { nome: string };
  fornecedor: { nome: string } | null;
}) => (c.fornecedor ? `${c.servico.nome} · ${c.fornecedor.nome}` : c.servico.nome);

function campos(contratacoes: Contratacao[]): Campo[] {
  return [
    { nome: "hora", rotulo: "Horário", tipo: "time", mono: true },
    { nome: "atividade", rotulo: "Atividade", placeholder: "Ex.: Entrada dos noivos", max: 160 },
    {
      nome: "responsavel",
      rotulo: "Responsável",
      tipo: "select",
      opcional: true,
      opcoes: [
        { valor: "", rotulo: "Ninguém em específico" },
        ...contratacoes.map((c) => ({ valor: `c:${c.id}`, rotulo: rotuloContratacao(c) })),
        { valor: "outro", rotulo: "Outro (escrever)…" },
      ],
    },
    {
      nome: "responsavelTexto",
      rotulo: "Quem é o responsável",
      placeholder: "Ex.: Cerimonialista, Padrinhos",
      max: 80,
      mostrarSe: (s) => s.responsavel === "outro",
    },
  ];
}

function responsavelDe(item: Item) {
  if (item.contratacao) return rotuloContratacao(item.contratacao);
  return item.responsavelTexto;
}

function Linha({ item, contratacoes }: { item: Item; contratacoes: Contratacao[] }) {
  const [editando, setEditando] = useState(false);
  const responsavel = responsavelDe(item);

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3">
        <FormCampos
          acao={editarItemCronograma.bind(null, item.id)}
          campos={campos(contratacoes)}
          inicial={{
            hora: item.hora,
            atividade: item.atividade,
            responsavel: item.contratacao
              ? `c:${item.contratacao.id}`
              : item.responsavelTexto
                ? "outro"
                : "",
            responsavelTexto: item.responsavelTexto ?? "",
          }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`item-${item.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    // Pautas inteiras: horário e atividade (largura toda, quebra se precisar);
    // na pauta de baixo, o menu fica sob o horário e o responsável ao lado.
    <li
      className={cn(LINHA_ALTERNADA, "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2 px-2 py-0.5")}
    >
      <span className="font-mono font-medium">{item.hora}</span>
      <span className="break-words hyphens-auto">{item.atividade}</span>
      <div className="-ml-1.5 flex h-(--linha) items-center">
        <MenuLinha
          nome={item.atividade}
          aoEditar={() => setEditando(true)}
          remocao={{
            titulo: "Remover do cronograma?",
            descricao: (
              <>
                {item.hora} · {item.atividade} sai do cronograma.
              </>
            ),
            rotulo: "Remover item",
            acao: removerItemCronograma.bind(null, item.id),
          }}
        />
      </div>
      <span className="text-tinta-suave text-sm leading-(--linha) break-words hyphens-auto">
        {responsavel ?? "Sem responsável"}
      </span>
    </li>
  );
}

// Serve ao cronograma da festa e ao roteiro da cerimônia (cerimonial): mesma lista de
// horários, em seções separadas.
export function ColunaCronograma({
  festaId,
  cronograma,
  contratacoes,
  secao = "FESTA",
}: {
  festaId: string;
  cronograma: Item[];
  contratacoes: Contratacao[];
  secao?: "FESTA" | "CERIMONIA";
}) {
  const cerimonia = secao === "CERIMONIA";
  const primeiro = cronograma[0]?.hora;
  const ultimo = cronograma.at(-1)?.hora;

  return (
    <Coluna
      id={cerimonia ? "cerimonial" : "cronograma"}
      titulo={cerimonia ? "Cerimonial" : "Cronograma"}
      resumo={
        cronograma.length > 0 && (
          <>
            <N>{cronograma.length}</N> {cronograma.length === 1 ? "momento" : "momentos"}
            {cronograma.length > 1 && (
              <>
                ,{" "}
                <span className="whitespace-nowrap">
                  das <N>{primeiro}</N> às <N>{ultimo}</N>
                </span>
              </>
            )}
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo={cerimonia ? "Adicionar ao cerimonial" : "Adicionar ao cronograma"}>
          {(fechar) => (
            <FormCampos
              acao={criarItemCronograma.bind(null, festaId, secao)}
              campos={campos(contratacoes)}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="novo-item"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {cronograma.length === 0 ? (
        <Vazio>
          {cerimonia
            ? "O roteiro da cerimônia: chegada do celebrante, entrada dos noivos, votos, alianças…"
            : "Do horário da equipe ao encerramento. Horários depois da meia-noite aparecem no fim."}
        </Vazio>
      ) : (
        <ul
          className={cn(BANDEJA, cerimonia ? COR_RAIA.cerimonia : COR_RAIA.fornecedores, "mt-2")}
          aria-label={cerimonia ? "Itens do cerimonial" : "Itens do cronograma"}
        >
          {cronograma.map((item) => (
            <Linha key={item.id} item={item} contratacoes={contratacoes} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
