"use client";

import {
  Armchair,
  CircleAlert,
  CircleCheck,
  CircleX,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ResultadoLeitura } from "@/lib/checkin/avaliar";
import type { VagaMesa } from "@/lib/checkin/mesas";
import { FUSO } from "@/lib/datas";
import { cn } from "@/lib/utils";

import type { Sinal } from "./sinais";

export type ResultadoTela = ResultadoLeitura | { tipo: "falha" };

const hora = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(d);

const comMesa = (mesa: string | null, texto?: string) =>
  [texto, mesa ?? "Sem mesa definida"].filter(Boolean).join(" · ");

const pessoas = (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`;

export function sinalDe(r: ResultadoTela): Sinal {
  if (r.tipo === "liberado") return "ok";
  if (r.tipo === "nao-confirmou") return "atencao";
  // Falha de rede não é recusa: não pode parecer "barrado" de longe.
  if (r.tipo === "falha") return "falha";
  return "barrado";
}

function conteudo(r: ResultadoTela): {
  veredito: string;
  nome?: string;
  detalhe: string;
  icone: LucideIcon;
} {
  switch (r.tipo) {
    case "liberado":
      return {
        veredito: "Pode entrar",
        nome: r.nome,
        detalhe: comMesa(
          r.mesa,
          r.pessoas === 1
            ? undefined
            : r.antes > 0
              ? `${r.antes} já tinham entrado`
              : `Convite para ${pessoas(r.pessoas)}`,
        ),
        icone: CircleCheck,
      };
    case "ja-entrou":
      return {
        veredito: r.pessoas === 1 ? "Já entrou" : "Todos já entraram",
        nome: r.nome,
        detalhe: comMesa(
          r.mesa,
          r.pessoas === 1
            ? `Entrada registrada às ${hora(r.hora)}`
            : `${r.entraram} de ${r.limite} ${r.limite < r.pessoas ? "confirmados " : ""}entraram · última às ${hora(r.hora)}`,
        ),
        icone: CircleX,
      };
    case "nao-confirmou":
      return {
        veredito: "Não confirmou presença",
        nome: r.nome,
        detalhe: comMesa(
          r.mesa,
          [
            r.pessoas > 1 ? `Convite para ${pessoas(r.pessoas)}` : "",
            r.rsvp === "RECUSADO" ? "Respondeu que não iria" : "Não respondeu o convite",
          ]
            .filter(Boolean)
            .join(" · "),
        ),
        icone: CircleAlert,
      };
    case "outra-festa":
      return {
        veredito: "Convite de outra festa",
        nome: r.nome,
        detalhe: `Este QR é de ${r.festaTitulo}.`,
        icone: CircleX,
      };
    case "desconhecido":
      return {
        veredito: "QR não reconhecido",
        detalhe: "Não é um convite desta lista. Procure o nome na busca.",
        icone: CircleX,
      };
    case "falha":
      return {
        veredito: "Não deu para conferir",
        detalhe: "Verifique a internet e leia o QR de novo.",
        icone: WifiOff,
      };
  }
}

// Lista de mesas para sentar o grupo na hora. Primeiro as que cabem sem usar cadeira de
// ninguém que confirmou; depois as que só cabem com as cadeiras de quem ainda não chegou.
function EscolherMesa({
  mesas,
  precisa,
  ocupado,
  aoEscolher,
  aoCancelar,
}: {
  mesas: VagaMesa[];
  precisa: number;
  ocupado: boolean;
  aoEscolher: (mesa: VagaMesa) => void;
  aoCancelar: () => void;
}) {
  const vagas = (n: number) => (n === 1 ? "1 vaga" : `${Math.max(n, 0)} vagas`);
  return (
    <div role="group" aria-labelledby="titulo-mesas" className="mt-2 flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <p id="titulo-mesas" className="text-lg font-semibold">
          Escolher mesa · {pessoas(precisa)}
        </p>
        <button
          type="button"
          onClick={aoCancelar}
          className="rounded-sm text-sm text-white/85 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-white"
        >
          Cancelar
        </button>
      </div>
      <ul className="mt-2 flex max-h-[45dvh] flex-col gap-2 overflow-y-auto overscroll-contain">
        {mesas.map((mesa) => (
          <li key={mesa.id}>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => aoEscolher(mesa)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60",
                mesa.cabe
                  ? "text-foreground bg-card"
                  : mesa.cabeAgora
                    ? "border-2 border-white/80 text-white"
                    : "border border-white/40 text-white/70",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-lg font-semibold">{mesa.nome}</span>
                {mesa.aguardando > 0 && (
                  <span className="block text-sm opacity-85">
                    {mesa.livresAgora} livres agora · {mesa.aguardando} ainda não chegaram
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right text-base font-semibold tabular-nums">
                {mesa.vagas > 0 ? vagas(mesa.vagas) : "lotada"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FECHAR_SOZINHO_MS = 3000;

// Veredito em tela cheia, de borda a borda (cobre a navegação): legível de longe e com
// pouca luz. "Pode entrar" de uma pessoa some sozinho em 3s (a barra no topo mostra o
// tempo); grupo, barrado e atenção esperam um toque, para dar tempo de ajustar.
export function Resultado({
  resultado,
  ocupado,
  mesas,
  aoFechar,
  aoDeixarEntrar,
  aoAjustar,
  aoEscolherMesa,
}: {
  resultado: ResultadoTela;
  ocupado: boolean;
  // Mesas com as vagas para este grupo (só quando liberado), da mais livre para a mais cheia.
  mesas: VagaMesa[];
  aoFechar: () => void;
  aoDeixarEntrar: (id: string) => void;
  // Total de pessoas do grupo que entraram; `fechar` fecha a tela depois.
  aoAjustar: (id: string, entraram: number, fechar: boolean) => void;
  aoEscolherMesa: (id: string, mesaId: string) => Promise<void>;
}) {
  const principalRef = useRef<HTMLButtonElement>(null);
  // Mesa escolhida aqui na porta (chegou sem mesa ou trocou).
  const [mesaAtual, setMesaAtual] = useState(resultado.tipo === "liberado" ? resultado.mesa : null);
  const [escolhendo, setEscolhendo] = useState(false);
  const [mexeuNaMesa, setMexeuNaMesa] = useState(false);
  const {
    veredito,
    nome,
    detalhe,
    icone: Icone,
  } = conteudo(resultado.tipo === "liberado" ? { ...resultado, mesa: mesaAtual } : resultado);
  const sinal = sinalDe(resultado);
  // Mexendo na mesa, a tela espera o "Próximo".
  const fechaSozinho =
    resultado.tipo === "liberado" && resultado.entrando === 1 && !escolhendo && !mexeuNaMesa;
  // Grupo liberado: quantos estão entrando agora (começa em todos os que faltam).
  const [entrandoAgora, setEntrandoAgora] = useState(
    resultado.tipo === "liberado" ? resultado.entrando : 0,
  );

  useEffect(() => {
    principalRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", esc);
    const timer = fechaSozinho ? setTimeout(aoFechar, FECHAR_SOZINHO_MS) : undefined;
    return () => {
      window.removeEventListener("keydown", esc);
      clearTimeout(timer);
    };
  }, [aoFechar, fechaSozinho]);

  const claro = sinal !== "atencao";
  const horaEntrada = resultado.tipo === "ja-entrou" ? hora(resultado.hora) : "";
  const botao =
    "h-14 rounded-lg px-5 text-base font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-60";
  const botaoPrincipal = cn(
    botao,
    claro
      ? "bg-card text-foreground focus-visible:outline-white"
      : "bg-foreground text-white focus-visible:outline-foreground",
  );
  const botaoSecundario = cn(
    botao,
    "border-2",
    claro
      ? "border-white/70 text-white focus-visible:outline-white"
      : "border-foreground/60 text-foreground focus-visible:outline-foreground",
  );

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="veredito"
      aria-describedby="detalhe-veredito"
      className={cn(
        "animate-in fade-in-0 fixed inset-0 z-50 flex flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] duration-150",
        sinal === "ok" && "bg-porta-ok text-white",
        sinal === "barrado" && "bg-porta-barrado text-white",
        sinal === "atencao" && "bg-porta-atencao text-foreground",
        sinal === "falha" && "bg-foreground text-white",
      )}
    >
      {fechaSozinho && (
        <div
          aria-hidden
          className="esvaziar bg-card/75 absolute inset-x-0 top-0 h-1.5 origin-left"
          style={{ animationDuration: `${FECHAR_SOZINHO_MS}ms` }}
        />
      )}

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3">
        <Icone aria-hidden className="size-16" strokeWidth={1.75} />
        <p
          id="veredito"
          className="text-[clamp(2.75rem,12vw,4rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
        >
          {veredito}
        </p>
        {nome && (
          <p className="mt-2 text-[clamp(1.75rem,7.5vw,2.25rem)] leading-tight font-semibold tracking-[-0.015em] text-balance">
            {nome}
          </p>
        )}
        <p
          id="detalhe-veredito"
          className={cn("text-lg", claro ? "text-white/90" : "text-foreground/85")}
        >
          {detalhe}
        </p>

        {resultado.tipo === "liberado" && escolhendo && (
          <EscolherMesa
            mesas={mesas}
            precisa={resultado.limite}
            ocupado={ocupado}
            aoEscolher={async (mesa) => {
              await aoEscolherMesa(resultado.id, mesa.id);
              setMesaAtual(mesa.nome);
              setEscolhendo(false);
            }}
            aoCancelar={() => setEscolhendo(false)}
          />
        )}

        {resultado.tipo === "liberado" && !escolhendo && mesas.length > 0 && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => {
              setEscolhendo(true);
              setMexeuNaMesa(true);
            }}
            className={cn(
              "mt-2 inline-flex h-12 items-center gap-2 self-start rounded-lg px-4 text-base font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60",
              // Sem mesa: chama mais atenção (é o que ela precisa resolver agora).
              mesaAtual ? "border-2 border-white/70 text-white" : "text-foreground bg-card",
            )}
          >
            <Armchair aria-hidden className="size-5" strokeWidth={1.75} />
            {mesaAtual ? "Trocar mesa" : "Escolher mesa"}
          </button>
        )}

        {resultado.tipo === "liberado" && !escolhendo && resultado.entrando > 1 && (
          // Registrou todos os que faltam; se entraram menos, toca no número certo.
          <div role="group" aria-labelledby="entrando-agora" className="mt-4">
            <p id="entrando-agora" className="text-lg font-semibold">
              Entrando agora: {pessoas(entrandoAgora)}
            </p>
            <p className="text-sm text-white/85">Entraram menos? Toque no número.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: resultado.entrando }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={ocupado}
                  aria-pressed={n === entrandoAgora}
                  onClick={() => {
                    setEntrandoAgora(n);
                    aoAjustar(resultado.id, resultado.antes + n, false);
                  }}
                  className={cn(
                    "size-14 rounded-lg border-2 text-xl font-semibold tabular-nums focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60",
                    n === entrandoAgora
                      ? "text-foreground bg-card border-white"
                      : "border-white/70 text-white",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-3">
        {resultado.tipo === "nao-confirmou" ? (
          <>
            <button type="button" className={botaoSecundario} disabled={ocupado} onClick={aoFechar}>
              Não deixar
            </button>
            <button
              ref={principalRef}
              type="button"
              className={botaoPrincipal}
              disabled={ocupado}
              onClick={() => aoDeixarEntrar(resultado.id)}
            >
              {ocupado ? "Registrando…" : "Deixar entrar"}
            </button>
          </>
        ) : resultado.tipo === "liberado" ? (
          <>
            <button
              type="button"
              className={botaoSecundario}
              disabled={ocupado}
              onClick={() => aoAjustar(resultado.id, resultado.antes, true)}
            >
              Desfazer
            </button>
            <button ref={principalRef} type="button" className={botaoPrincipal} onClick={aoFechar}>
              Próximo
            </button>
          </>
        ) : resultado.tipo === "ja-entrou" ? (
          // Aqui nada foi feito nesta leitura: os botões dizem exatamente o que fazem.
          <>
            {resultado.entraram < resultado.pessoas && (
              // Confirmou menos do que o convite (3 de 4) e o 4º apareceu: ela decide.
              <button
                type="button"
                className={cn(botaoSecundario, "col-span-2")}
                disabled={ocupado}
                onClick={() => aoDeixarEntrar(resultado.id)}
              >
                {ocupado ? "Registrando…" : "Deixar entrar mais"}
              </button>
            )}
            <button
              type="button"
              className={cn(botaoSecundario, "col-span-2")}
              disabled={ocupado}
              onClick={() => aoAjustar(resultado.id, 0, true)}
            >
              {resultado.pessoas === 1
                ? `Apagar entrada das ${horaEntrada}`
                : "Apagar as entradas deste convite"}
            </button>
            <button
              ref={principalRef}
              type="button"
              className={cn(botaoPrincipal, "col-span-2")}
              onClick={aoFechar}
            >
              Próximo
            </button>
          </>
        ) : (
          <button
            ref={principalRef}
            type="button"
            className={cn(botaoPrincipal, "col-span-2")}
            onClick={aoFechar}
          >
            Próximo
          </button>
        )}
      </div>
    </div>
  );
}
