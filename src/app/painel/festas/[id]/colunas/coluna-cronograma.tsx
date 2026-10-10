"use client";

import { Utensils } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { ETAPAS_MENU } from "@/lib/festas/colunas-schema";
import { cn } from "@/lib/utils";

import {
  criarItemCronograma,
  definirEtapasMenu,
  editarItemCronograma,
  removerItemCronograma,
} from "./actions";
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

// Etapas do menu servidas neste horário: chips com as escolhidas e um botão que abre a
// lista das etapas que existem no menu da festa. No PDF, os itens saem sob o horário.
function EtapasDoHorario({ item, etapasDoMenu }: { item: Item; etapasDoMenu: string[] }) {
  const [etapas, setEtapas] = useOptimistic(item.etapasMenu);
  const [, iniciar] = useTransition();

  function alternar(etapa: string, marcada: boolean) {
    const novas = marcada ? [...etapas, etapa] : etapas.filter((e) => e !== etapa);
    iniciar(async () => {
      setEtapas(novas);
      await definirEtapasMenu(item.id, novas);
    });
  }

  return (
    <div className="col-start-2 flex flex-wrap items-center gap-1 pb-1">
      {etapas.map((e) => (
        <span
          key={e}
          className="bg-card inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium"
        >
          <Utensils aria-hidden className="size-3" strokeWidth={2} />
          {e}
        </span>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="text-tinta-suave hover:text-foreground hover:bg-card focus-visible:outline-ring inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs focus-visible:outline-2"
          aria-label={`Etapas do menu servidas às ${item.hora}`}
        >
          {etapas.length === 0 && <Utensils aria-hidden className="size-3" strokeWidth={2} />}
          {etapas.length === 0 ? "Ligar ao menu" : "Mudar"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="papel-solto w-52 rounded-[3px] ring-0">
          <DropdownMenuLabel className="text-tinta-suave text-xs font-normal">
            Servido às {item.hora}
          </DropdownMenuLabel>
          {etapasDoMenu.map((e) => (
            <DropdownMenuCheckboxItem
              key={e}
              checked={etapas.includes(e)}
              onSelect={(ev) => ev.preventDefault()}
              onCheckedChange={(v) => alternar(e, v === true)}
            >
              {e}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Linha({
  item,
  contratacoes,
  etapasDoMenu,
}: {
  item: Item;
  contratacoes: Contratacao[];
  etapasDoMenu: string[];
}) {
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
      {(etapasDoMenu.length > 0 || item.etapasMenu.length > 0) && (
        <EtapasDoHorario item={item} etapasDoMenu={etapasDoMenu} />
      )}
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
  menu = [],
}: {
  festaId: string;
  cronograma: Item[];
  contratacoes: Contratacao[];
  secao?: "FESTA" | "CERIMONIA";
  // Menu da festa: os horários do cronograma podem ser ligados às etapas dele.
  menu?: Colunas["menu"];
}) {
  const cerimonia = secao === "CERIMONIA";
  // Etapas que existem no menu, na ordem do menu (só no cronograma da festa).
  const etapasDoMenu = cerimonia ? [] : ETAPAS_MENU.filter((e) => menu.some((m) => m.etapa === e));
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
            <Linha
              key={item.id}
              item={item}
              contratacoes={contratacoes}
              etapasDoMenu={etapasDoMenu}
            />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
