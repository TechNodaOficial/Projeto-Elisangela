"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import type { Colunas } from "@/lib/festas/consultas";
import { compararNomes } from "@/lib/festas/formatos";
import { cn } from "@/lib/utils";

import { criarMesa, definirMesa, editarMesa, removerMesa, sentarConvidado } from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "./pecas";

type Mesa = Colunas["mesas"][number];
type ConvidadoSemMesa = { id: string; nome: string };

const CAMPOS: Campo[] = [
  { nome: "nome", rotulo: "Nome da mesa", placeholder: "Ex.: Mesa 1, Mesa dos noivos", max: 60 },
  { nome: "lugares", rotulo: "Lugares", tipo: "number", inputMode: "numeric", mono: true },
];

function BlocoMesa({ mesa, semMesa }: { mesa: Mesa; semMesa: ConvidadoSemMesa[] }) {
  const [editando, setEditando] = useState(false);
  const ocupados = mesa.convidados.length;
  const lotada = ocupados >= mesa.lugares;

  if (editando) {
    return (
      <li className="bg-card">
        <FormCampos
          acao={editarMesa.bind(null, mesa.id)}
          campos={CAMPOS}
          inicial={{ nome: mesa.nome, lugares: String(mesa.lugares) }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`mesa-${mesa.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  const idSelect = `sentar-${mesa.id}`;

  return (
    <li>
      {/* Cabeçalho da mesa: uma pauta. */}
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 font-semibold break-words hyphens-auto">{mesa.nome}</span>
        <span
          className={cn(
            "font-mono text-[0.8125rem] leading-(--linha)",
            ocupados > mesa.lugares ? "text-destructive font-semibold" : "text-tinta-suave",
          )}
          title={`${ocupados} de ${mesa.lugares} lugares ocupados`}
        >
          {ocupados}/{mesa.lugares}
        </span>
        <div className="flex h-(--linha) items-center">
          <MenuLinha
            nome={mesa.nome}
            aoEditar={() => setEditando(true)}
            remocao={{
              titulo: "Remover esta mesa?",
              descricao: <>{mesa.nome} sai da festa e os convidados dela ficam sem mesa.</>,
              rotulo: "Remover mesa",
              acao: removerMesa.bind(null, mesa.id),
            }}
          />
        </div>
      </div>

      {/* Um convidado por pauta. */}
      <ul aria-label={`Convidados da ${mesa.nome}`}>
        {mesa.convidados.map((c) => (
          <li key={c.id} className="group/c flex h-(--linha) items-center gap-1 pl-3 text-sm">
            <span className="min-w-0 flex-1 truncate">{c.nome}</span>
            <form action={definirMesa.bind(null, c.id, null)}>
              <button
                type="submit"
                aria-label={`Tirar ${c.nome} da ${mesa.nome}`}
                className="text-tinta-suave hover:text-foreground focus-visible:outline-ring -my-2 -mr-2.5 flex size-11 items-center justify-center rounded-sm focus-visible:outline-2 sm:my-0 sm:mr-0 sm:size-7"
              >
                <X aria-hidden className="size-3.5" strokeWidth={2} />
              </button>
            </form>
          </li>
        ))}
      </ul>

      {/* Sentar alguém: escolher na lista já envia. */}
      {semMesa.length > 0 && !lotada && (
        <form
          action={sentarConvidado.bind(null, mesa.id)}
          className="text-tinta-suave flex h-(--linha) items-center gap-1 pl-3"
        >
          <Plus aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
          <Label htmlFor={idSelect} className="sr-only">
            Sentar convidado na {mesa.nome}
          </Label>
          <select
            id={idSelect}
            name="convidadoId"
            defaultValue=""
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="hover:text-foreground focus-visible:outline-ring -my-2 h-11 max-w-full min-w-0 cursor-pointer rounded-sm bg-transparent text-sm focus-visible:outline-2 sm:my-0 sm:h-7"
          >
            <option value="" disabled>
              Sentar convidado…
            </option>
            {semMesa.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </form>
      )}
    </li>
  );
}

export function ColunaMesas({
  festaId,
  mesas,
  convidados,
}: {
  festaId: string;
  mesas: Mesa[];
  convidados: { id: string; nome: string; mesaId: string | null }[];
}) {
  const semMesa = convidados.filter((c) => !c.mesaId).sort((a, b) => compararNomes(a.nome, b.nome));
  const lugares = mesas.reduce((s, m) => s + m.lugares, 0);
  const sentados = convidados.length - semMesa.length;

  return (
    <Coluna
      id="mesas"
      titulo="Mesas"
      resumo={
        mesas.length > 0 && (
          <>
            <span className="whitespace-nowrap">
              <N>{mesas.length}</N> {mesas.length === 1 ? "mesa" : "mesas"} · <N>{lugares}</N>{" "}
              lugares ·
            </span>{" "}
            <span className="whitespace-nowrap">
              <N>{sentados}</N> de <N>{convidados.length}</N> com mesa
            </span>
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo="Adicionar mesa">
          {(fechar) => (
            <FormCampos
              acao={criarMesa.bind(null, festaId)}
              campos={CAMPOS}
              inicial={{ nome: `Mesa ${mesas.length + 1}`, lugares: "8" }}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="nova-mesa"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {mesas.length === 0 ? (
        <Vazio>
          Crie as mesas e distribua os convidados. No check-in, o leitor mostra a mesa de cada um.
        </Vazio>
      ) : (
        <ul className="pautado flex flex-col gap-(--linha)" aria-label="Lista de mesas">
          {mesas.map((m) => (
            <BlocoMesa key={m.id} mesa={m} semMesa={semMesa} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
