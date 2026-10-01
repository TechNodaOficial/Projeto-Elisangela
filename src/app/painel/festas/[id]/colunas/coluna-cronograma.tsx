"use client";

import { useState } from "react";

import type { Colunas } from "@/lib/festas/consultas";

import { criarItemCronograma, editarItemCronograma, removerItemCronograma } from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "./pecas";

type Item = Colunas["cronograma"][number];
type Fornecedor = Colunas["fornecedores"][number];

function campos(fornecedores: Fornecedor[]): Campo[] {
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
        ...fornecedores.map((f) => ({ valor: `f:${f.id}`, rotulo: `${f.servico} · ${f.nome}` })),
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
  if (item.fornecedor) return `${item.fornecedor.servico} · ${item.fornecedor.nome}`;
  return item.responsavelTexto;
}

function Linha({ item, fornecedores }: { item: Item; fornecedores: Fornecedor[] }) {
  const [editando, setEditando] = useState(false);
  const responsavel = responsavelDe(item);

  if (editando) {
    return (
      <li className="bg-card">
        <FormCampos
          acao={editarItemCronograma.bind(null, item.id)}
          campos={campos(fornecedores)}
          inicial={{
            hora: item.hora,
            atividade: item.atividade,
            responsavel: item.fornecedor
              ? `f:${item.fornecedor.id}`
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
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2">
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

export function ColunaCronograma({
  festaId,
  cronograma,
  fornecedores,
}: {
  festaId: string;
  cronograma: Item[];
  fornecedores: Fornecedor[];
}) {
  const primeiro = cronograma[0]?.hora;
  const ultimo = cronograma.at(-1)?.hora;

  return (
    <Coluna
      id="cronograma"
      titulo="Cronograma"
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
        <Adicionar rotulo="Adicionar ao cronograma">
          {(fechar) => (
            <FormCampos
              acao={criarItemCronograma.bind(null, festaId)}
              campos={campos(fornecedores)}
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
          Do horário da equipe ao encerramento. Horários depois da meia-noite aparecem no fim.
        </Vazio>
      ) : (
        <ul className="pautado" aria-label="Itens do cronograma">
          {cronograma.map((item) => (
            <Linha key={item.id} item={item} fornecedores={fornecedores} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
