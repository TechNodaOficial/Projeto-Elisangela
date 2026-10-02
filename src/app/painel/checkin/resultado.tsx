"use client";

import { CircleAlert, CircleCheck, CircleX, WifiOff, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ResultadoLeitura } from "@/lib/checkin/avaliar";
import { FUSO } from "@/lib/datas";
import { cn } from "@/lib/utils";

import type { Sinal } from "./sinais";

export type ResultadoTela = ResultadoLeitura | { tipo: "falha" };

const hora = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(d);

const comMesa = (mesa: string | null, texto?: string) =>
  [texto, mesa ?? "Sem mesa definida"].filter(Boolean).join(" · ");

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
        detalhe: comMesa(r.mesa),
        icone: CircleCheck,
      };
    case "ja-entrou":
      return {
        veredito: "Já entrou",
        nome: r.nome,
        detalhe: comMesa(r.mesa, `Entrada registrada às ${hora(r.hora)}`),
        icone: CircleX,
      };
    case "nao-confirmou":
      return {
        veredito: "Não confirmou presença",
        nome: r.nome,
        detalhe: comMesa(
          r.mesa,
          r.rsvp === "RECUSADO" ? "Respondeu que não iria" : "Não respondeu o convite",
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

const FECHAR_SOZINHO_MS = 3000;

// Veredito em tela cheia, de borda a borda (cobre a navegação): legível de longe e com
// pouca luz. "Pode entrar" some sozinho em 3s (a barra no topo mostra o tempo);
// barrado e atenção esperam um toque.
export function Resultado({
  resultado,
  ocupado,
  aoFechar,
  aoDeixarEntrar,
  aoDesfazer,
}: {
  resultado: ResultadoTela;
  ocupado: boolean;
  aoFechar: () => void;
  aoDeixarEntrar: (id: string) => void;
  aoDesfazer: (id: string) => void;
}) {
  const principalRef = useRef<HTMLButtonElement>(null);
  const { veredito, nome, detalhe, icone: Icone } = conteudo(resultado);
  const sinal = sinalDe(resultado);
  const fechaSozinho = resultado.tipo === "liberado";

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
      ? "bg-white text-foreground focus-visible:outline-white"
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
          className="esvaziar absolute inset-x-0 top-0 h-1.5 origin-left bg-white/75"
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
              onClick={() => aoDesfazer(resultado.id)}
            >
              Desfazer
            </button>
            <button ref={principalRef} type="button" className={botaoPrincipal} onClick={aoFechar}>
              Próximo
            </button>
          </>
        ) : resultado.tipo === "ja-entrou" ? (
          // Aqui nada foi feito nesta leitura: o botão diz exatamente o que apaga.
          <>
            <button
              type="button"
              className={cn(botaoSecundario, "col-span-2")}
              disabled={ocupado}
              onClick={() => aoDesfazer(resultado.id)}
            >
              Apagar entrada das {horaEntrada}
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
