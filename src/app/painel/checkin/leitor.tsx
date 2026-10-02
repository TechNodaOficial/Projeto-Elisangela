"use client";

import { Search } from "lucide-react";
import { useCallback, useDeferredValue, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { DadosCheckin } from "@/lib/checkin/consultas";
import { FUSO } from "@/lib/datas";
import { semAcento } from "@/lib/texto";
import { cn } from "@/lib/utils";

import { desfazerEntrada, lerQr, registrarConvidado } from "./actions";
import { Camera } from "./camera";
import { Resultado, sinalDe, type ResultadoTela } from "./resultado";
import { sinalizar } from "./sinais";

// O mesmo QR continua na frente da câmera logo depois do resultado: ignora por um tempo.
const IGNORAR_REPETIDO_MS = 3000;

const hora = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(d);

export function Leitor({ festa }: { festa: DadosCheckin }) {
  const [resultado, setResultado] = useState<ResultadoTela | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaEmFoco, setBuscaEmFoco] = useState(false);
  const ultimo = useRef({ codigo: "", ate: 0 });

  // O contador compara confirmados com confirmados; quem entrou sem confirmar
  // ("Deixar entrar") aparece à parte, para a conta nunca passar de 100%.
  const confirmados = festa.convidados.filter((c) => c.rsvp === "CONFIRMADO");
  const chegaram = confirmados.filter((c) => c.presenteEm).length;
  const extras = festa.convidados.filter((c) => c.presenteEm && c.rsvp !== "CONFIRMADO").length;
  const buscaRef = useRef<HTMLElement>(null);

  // No celular, a câmera ocupa a primeira tela: ao buscar, a folha da busca sobe
  // para o topo, para os resultados não ficarem embaixo do teclado.
  function levarBuscaAoTopo() {
    buscaRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  async function executar(acao: () => Promise<ResultadoTela>) {
    setOcupado(true);
    let r: ResultadoTela;
    try {
      r = await acao();
    } catch {
      r = { tipo: "falha" };
    }
    setOcupado(false);
    setResultado(r);
    sinalizar(sinalDe(r));
  }

  function aoLer(codigo: string) {
    if (ocupado || resultado) return;
    if (codigo === ultimo.current.codigo && Date.now() < ultimo.current.ate) return;
    ultimo.current = { codigo, ate: Date.now() + IGNORAR_REPETIDO_MS };
    void executar(() => lerQr(festa.id, codigo));
  }

  const fechar = useCallback(() => {
    setResultado(null);
    // A janela de "repetido" conta a partir de quando o resultado sai da tela.
    ultimo.current = { ...ultimo.current, ate: Date.now() + IGNORAR_REPETIDO_MS };
  }, []);

  async function desfazer(id: string) {
    setOcupado(true);
    try {
      await desfazerEntrada(festa.id, id);
    } finally {
      setOcupado(false);
      fechar();
    }
  }

  const termo = semAcento(useDeferredValue(busca).trim());
  const visiveis = termo
    ? festa.convidados.filter((c) => semAcento(c.nome).includes(termo))
    : festa.convidados;

  return (
    <div className="mx-auto w-full max-w-xl">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance">{festa.titulo}</h1>
        <p
          className="text-tinta-suave mt-1 flex flex-wrap items-baseline gap-x-2"
          aria-live="polite"
        >
          <span className="text-foreground text-[1.75rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">
            {chegaram}
            <span className="text-tinta-suave text-lg"> de {confirmados.length}</span>
          </span>
          <span className="text-sm">confirmados chegaram</span>
          {extras > 0 && (
            <span className="text-sm">
              <strong className="text-foreground font-semibold">+{extras}</strong> sem confirmação
            </span>
          )}
        </p>
      </header>

      <div className="relative">
        <Camera pausada={ocupado || resultado !== null} aoLer={aoLer} />
        {ocupado && !resultado && (
          <p
            role="status"
            className="bg-foreground/70 absolute inset-0 grid place-items-center rounded-[3px] text-lg font-medium text-white"
          >
            Conferindo…
          </p>
        )}
      </div>

      <section
        ref={buscaRef}
        aria-labelledby="titulo-busca"
        className={cn(
          "folha folha-lisa mt-6 scroll-mt-16 pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)",
          // Enquanto busca, a folha tem pelo menos a altura da tela: filtrar não encurta
          // a página e a folha não escorrega para baixo do teclado.
          (buscaEmFoco || busca) && "min-h-[calc(100dvh-4rem)]",
        )}
      >
        <h2 id="titulo-busca" className="text-lg font-semibold">
          Buscar pelo nome
        </h2>
        <p className="text-tinta-suave text-sm leading-(--linha)">
          Para quem está sem o QR. Toque no nome para registrar a entrada.
        </p>
        <div className="relative mt-(--linha)">
          <Search
            aria-hidden
            className="text-tinta-suave pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => {
              setBuscaEmFoco(true);
              // Espera a folha crescer antes de rolar.
              requestAnimationFrame(levarBuscaAoTopo);
            }}
            onBlur={() => setBuscaEmFoco(false)}
            placeholder="Nome do convidado"
            aria-label="Nome do convidado"
            autoComplete="off"
            className="bg-card h-11 pl-9 text-base"
          />
        </div>

        <ul className="pautado mt-(--linha)" aria-label="Convidados">
          {visiveis.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => executar(() => registrarConvidado(festa.id, c.id, false))}
                className="group focus-visible:outline-ring flex w-full flex-col items-start rounded-sm text-left focus-visible:outline-2"
              >
                <span className="w-full leading-(--linha) font-medium">{c.nome}</span>
                <span className="text-tinta-suave w-full text-sm leading-(--linha)">
                  {c.presenteEm ? (
                    <span className="grifo text-foreground font-semibold">
                      Chegou <span className="font-mono">{hora(c.presenteEm)}</span>
                    </span>
                  ) : (
                    { CONFIRMADO: "Confirmou", PENDENTE: "Não respondeu", RECUSADO: "Recusou" }[
                      c.rsvp
                    ]
                  )}
                  <span className={cn(c.mesa ? "" : "text-tinta-suave")}>
                    {" · "}
                    {c.mesa ?? "sem mesa"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {visiveis.length === 0 && (
          <p className="text-tinta-suave text-sm leading-(--linha)">
            {festa.convidados.length === 0
              ? "Esta festa ainda não tem convidados."
              : `Nenhum convidado com “${busca.trim()}”.`}
          </p>
        )}
      </section>

      {resultado && (
        <Resultado
          resultado={resultado}
          ocupado={ocupado}
          aoFechar={fechar}
          aoDeixarEntrar={(id) => executar(() => registrarConvidado(festa.id, id, true))}
          aoDesfazer={desfazer}
        />
      )}
    </div>
  );
}
