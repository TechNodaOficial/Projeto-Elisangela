"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import type { Colunas } from "@/lib/festas/consultas";
import { criancasPorIdade, faixasDe, lugaresDe, somarFaixas } from "@/lib/convidados/contagem";
import { compararNomes } from "@/lib/festas/formatos";
import { COR_RAIA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { criarMesa, definirMesa, editarMesa, removerMesa, sentarConvidado } from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "./pecas";

type Mesa = Colunas["mesas"][number];
type ConvidadoSemMesa = { id: string; nome: string; lugares: number };

const CAMPOS: Campo[] = [
  { nome: "nome", rotulo: "Nome da mesa", placeholder: "Ex.: Mesa 1, Mesa dos noivos", max: 60 },
  { nome: "lugares", rotulo: "Lugares", tipo: "number", inputMode: "numeric", mono: true },
];

const plural = (n: number) => (n === 1 ? "criança" : "crianças");

// Idade das crianças em marca-texto: é o que ela procura ao montar a mesa (cadeirão,
// prato infantil). `curta` é a da linha do convite, só com o número e a idade.
function Idade({ n, idade, curta }: { n: number; idade: string; curta?: boolean }) {
  return (
    <span
      className={cn(
        "bg-grifo shrink-0 rounded-sm font-semibold whitespace-nowrap text-(--tinta)",
        curta ? "px-1 text-xs leading-5" : "px-1.5 py-0.5 text-[0.8125rem] leading-snug",
      )}
    >
      <span className="tabular-nums">{n}</span> {curta ? `de ${idade}` : `${plural(n)} de ${idade}`}
    </span>
  );
}

function BlocoMesa({ mesa, semMesa }: { mesa: Mesa; semMesa: ConvidadoSemMesa[] }) {
  const [editando, setEditando] = useState(false);
  // Em pessoas: a Família Silva confirmada com 4 ocupa 4 lugares.
  const ocupados = mesa.convidados.reduce((s, c) => s + lugaresDe(c), 0);
  const lotada = ocupados >= mesa.lugares;
  const livres = mesa.lugares - ocupados;
  const faixas = somarFaixas(mesa.convidados);
  const criancas = criancasPorIdade(faixas);

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3">
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
    <li className="bg-card/80 h-full rounded-md px-2 py-1">
      {/* Cabeçalho da mesa: a capacidade em destaque (selo com os lugares, como no PDF),
          o nome e, embaixo, como está a ocupação. */}
      <div className="flex items-start gap-2.5 pt-1 pb-1.5">
        <span
          className={cn(
            "flex w-14 shrink-0 flex-col items-center rounded-md border px-1 py-1 leading-none",
            livres < 0 ? "border-destructive text-destructive" : "border-foreground/70",
          )}
          title={`${mesa.lugares} lugares`}
        >
          <span className="text-xl font-semibold tabular-nums">{mesa.lugares}</span>
          <span className="mt-0.5 text-[0.625rem] font-medium tracking-[0.06em] uppercase">
            lugares
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-snug font-semibold break-words hyphens-auto">
            {mesa.nome}
          </span>
          <span
            className={cn(
              "block text-[0.8125rem] leading-snug",
              livres < 0
                ? "text-destructive font-semibold"
                : livres === 0
                  ? "text-foreground font-medium"
                  : "text-tinta-suave",
            )}
          >
            {livres < 0
              ? `${-livres} a mais que os lugares`
              : livres === 0
                ? "Completa"
                : `${ocupados} ${ocupados === 1 ? "sentado" : "sentados"} · ${livres} ${livres === 1 ? "livre" : "livres"}`}
          </span>
          {/* Crianças da mesa (cadeirão, prato infantil): só de quem já disse as idades. */}
          {criancas.length > 0 && (
            <span className="mt-1 flex flex-wrap gap-1">
              {criancas.map((c) => (
                <Idade key={c.idade} {...c} />
              ))}
            </span>
          )}
          {faixas.semIdade > 0 && (
            <span className="text-tinta-suave block text-[0.8125rem] leading-snug">
              {faixas.semIdade} sem idade informada
            </span>
          )}
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
        {mesa.convidados.map((c) => {
          const idades = criancasPorIdade(faixasDe(c));
          return (
            <li key={c.id} className="group/c flex h-(--linha) items-center gap-1 pl-3 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {c.nome}
                {lugaresDe(c) > 1 && <span className="text-tinta-suave"> ({lugaresDe(c)})</span>}
              </span>
              {idades.map((i) => (
                <Idade key={i.idade} {...i} curta />
              ))}
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
          );
        })}
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
                {c.lugares > 1 ? `${c.nome} (${c.lugares})` : c.nome}
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
  convidados: { id: string; nome: string; mesaId: string | null; lugares: number }[];
}) {
  const semMesa = convidados.filter((c) => !c.mesaId).sort((a, b) => compararNomes(a.nome, b.nome));
  const lugares = mesas.reduce((s, m) => s + m.lugares, 0);
  // Em pessoas, não em convites.
  const pessoas = convidados.reduce((s, c) => s + c.lugares, 0);
  const sentados = pessoas - semMesa.reduce((s, c) => s + c.lugares, 0);
  const faixas = somarFaixas(mesas.flatMap((m) => m.convidados));
  const criancas = criancasPorIdade(faixas);

  return (
    <Coluna
      id="mesas"
      titulo="Layout das mesas"
      resumo={
        mesas.length > 0 && (
          <>
            <span className="whitespace-nowrap">
              <N>{mesas.length}</N> {mesas.length === 1 ? "mesa" : "mesas"} · <N>{lugares}</N>{" "}
              lugares ·
            </span>{" "}
            <span className="whitespace-nowrap">
              <N>{sentados}</N> de <N>{pessoas}</N> pessoas com mesa
            </span>
            {criancas.map((c) => (
              <span key={c.idade} className="whitespace-nowrap">
                {" "}
                · <N>{c.n}</N> {plural(c.n)} de {c.idade}
              </span>
            ))}
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
        // Mesas em colunas quando a folha é larga (uma no celular): cada mesa é um cartão
        // curto, e o "×" de tirar alguém fica perto do nome.
        <ul
          className={cn(
            COR_RAIA.recepcao,
            "mt-2 grid grid-cols-1 items-start gap-1 rounded-lg p-1 @2xl:grid-cols-2 @6xl:grid-cols-3",
          )}
          aria-label="Lista de mesas"
        >
          {mesas.map((m) => (
            <BlocoMesa key={m.id} mesa={m} semMesa={semMesa} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
