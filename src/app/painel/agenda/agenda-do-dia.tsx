"use client";

import { MapPin, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";

import { momentosDoDia, type Momento } from "@/lib/agenda/momentos";
import { BANDEJA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Adicionar, FormCampos, MenuLinha, Vazio, type Campo } from "../festas/[id]/colunas/pecas";
import { criarCompromisso, editarCompromisso, removerCompromisso } from "./actions";

type FestaDoDia = { id: string; titulo: string; hora: string; pendencias: string[] };
type CompromissoDoDia = {
  id: string;
  titulo: string;
  hora: string;
  horaFim: string;
  local: string | null;
  observacao: string | null;
};

// No computador: o título numa linha, dia e horários lado a lado, local e observação embaixo.
const GRADE = "grid grid-cols-1 gap-3 sm:grid-cols-3";
const CAMPOS: Campo[] = [
  {
    nome: "titulo",
    rotulo: "O que é",
    placeholder: "Ex.: Reunião com a noiva",
    max: 120,
    classe: "sm:col-span-3",
  },
  { nome: "data", rotulo: "Dia", tipo: "date", mono: true },
  { nome: "hora", rotulo: "Começa", tipo: "time", mono: true },
  { nome: "horaFim", rotulo: "Termina", tipo: "time", mono: true, opcional: true },
  {
    nome: "local",
    rotulo: "Local",
    placeholder: "Ex.: Escritório, online",
    max: 120,
    opcional: true,
  },
  { nome: "observacao", rotulo: "Observação", max: 500, opcional: true, classe: "sm:col-span-2" },
];

const HORARIO = "w-24 shrink-0 pt-px font-mono text-sm";

function LinhaFesta({ festa }: { festa: FestaDoDia }) {
  const pendente = festa.pendencias.length > 0;
  return (
    // Festa na cor do calendário: verde se está tudo resolvido, amarelo se falta algo.
    <li
      className={cn("flex gap-3 rounded-sm px-2 py-2", pendente ? "bg-pendente" : "bg-resolvida")}
    >
      <span className={HORARIO}>{festa.hora}</span>
      <Link
        href={`/painel/festas/${festa.id}`}
        className={cn(
          "hover:bg-muted focus-visible:outline-ring -my-1 min-w-0 flex-1 rounded-sm border-l-[3px] px-2 py-1 focus-visible:outline-2",
          pendente ? "border-pendente-forte" : "border-resolvida-forte",
        )}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <PartyPopper aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="break-words">{festa.titulo}</span>
        </span>
        <span className="text-tinta-suave block text-sm">
          {pendente ? `Pendente: ${festa.pendencias.join(", ")}` : "Tudo resolvido"}
        </span>
      </Link>
    </li>
  );
}

function LinhaCompromisso({
  compromisso,
  dia,
  momento,
}: {
  compromisso: CompromissoDoDia;
  dia: string;
  momento: Momento;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="bg-card rounded-lg px-3">
        <FormCampos
          acao={editarCompromisso.bind(null, compromisso.id)}
          campos={CAMPOS}
          grade={GRADE}
          inicial={{
            titulo: compromisso.titulo,
            data: dia,
            hora: compromisso.hora,
            horaFim: compromisso.horaFim,
            local: compromisso.local ?? "",
            observacao: compromisso.observacao ?? "",
          }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`compromisso-${compromisso.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        LINHA_ALTERNADA,
        "flex items-start gap-3 px-2 py-2",
        momento === "passou" && "opacity-55",
      )}
    >
      <span className={HORARIO}>
        {compromisso.hora}
        {compromisso.horaFim && <span className="text-tinta-suave">–{compromisso.horaFim}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">
          {compromisso.titulo}
          {(momento === "agora" || momento === "proximo") && (
            <span className="grifo ml-2 text-xs font-semibold tracking-[0.04em] uppercase">
              {momento === "agora" ? "Agora" : "Próximo"}
            </span>
          )}
          {momento === "passou" && <span className="sr-only"> (já passou)</span>}
        </p>
        {compromisso.local && (
          <p className="text-tinta-suave flex items-center gap-1 text-sm">
            <MapPin aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="break-words">{compromisso.local}</span>
          </p>
        )}
        {compromisso.observacao && (
          <p className="text-tinta-suave text-sm break-words">{compromisso.observacao}</p>
        )}
      </div>
      <MenuLinha
        nome={compromisso.titulo}
        aoEditar={() => setEditando(true)}
        remocao={{
          titulo: "Remover este compromisso?",
          descricao: <>{compromisso.titulo} sai da agenda.</>,
          rotulo: "Remover compromisso",
          acao: removerCompromisso.bind(null, compromisso.id),
        }}
      />
    </li>
  );
}

// Festas e compromissos do dia, na ordem do horário, e o botão de marcar um compromisso.
export function AgendaDoDia({
  dia,
  passou,
  agora,
  festas,
  compromissos,
}: {
  dia: string;
  passou: boolean;
  // Hora atual ("14:35"), só quando o dia mostrado é hoje.
  agora?: string;
  festas: FestaDoDia[];
  compromissos: CompromissoDoDia[];
}) {
  const situacao = momentosDoDia(compromissos, agora);
  const linhas = [
    ...festas.map((f) => ({ hora: f.hora, chave: `f-${f.id}`, el: <LinhaFesta festa={f} /> })),
    ...compromissos.map((c) => ({
      hora: c.hora,
      chave: `c-${c.id}`,
      el: <LinhaCompromisso compromisso={c} dia={dia} momento={situacao.get(c.id)} />,
    })),
  ].sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="flex flex-col gap-4">
      {linhas.length === 0 ? (
        <Vazio>{passou ? "Nada marcado neste dia." : "Nada marcado ainda neste dia."}</Vazio>
      ) : (
        // Bandeja azul com listras, como as listas das festas (ver pasteis.ts).
        <ul className={cn(BANDEJA, "bg-pastel-azul gap-px")}>
          {linhas.map((l) => (
            <Fragment key={l.chave}>{l.el}</Fragment>
          ))}
        </ul>
      )}

      <Adicionar rotulo="Marcar compromisso">
        {(fechar) => (
          <div className="bg-muted/50 rounded-lg px-4 py-1">
            <FormCampos
              acao={criarCompromisso}
              campos={CAMPOS}
              grade={GRADE}
              inicial={{ data: dia }}
              rotuloEnviar="Marcar"
              rotuloEnviando="Marcando…"
              prefixo="novo-compromisso"
              aoCancelar={fechar}
            />
          </div>
        )}
      </Adicionar>
    </div>
  );
}
