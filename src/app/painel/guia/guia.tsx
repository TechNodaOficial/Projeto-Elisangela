"use client";

import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  CHAVE_GUIA,
  guiaDaPagina,
  ID_PASSOS_PARTES,
  PASSOS_PARTES,
  type Guia,
  type PassoGuia,
} from "@/lib/guia";

// O elemento do passo que está na tela: "#id" ou o valor de data-guia. Menu lateral e
// barra inferior têm o mesmo alvo: vale o que estiver aparecendo.
function acharAlvo(alvo: string | undefined): HTMLElement | null {
  if (!alvo) return null;
  const seletor = alvo.startsWith("#") ? alvo : `[data-guia="${alvo}"]`;
  const todos = document.querySelectorAll<HTMLElement>(seletor);
  return Array.from(todos).find((el) => el.getClientRects().length > 0) ?? null;
}

function marcarVisto(id: string) {
  try {
    localStorage.setItem(CHAVE_GUIA(id), "1");
  } catch {
    // Armazenamento bloqueado: o guia volta a abrir sozinho na próxima visita.
  }
}

function jaViu(id: string) {
  try {
    return localStorage.getItem(CHAVE_GUIA(id)) !== null;
  } catch {
    // Sem como lembrar, melhor não abrir sozinho toda vez.
    return true;
  }
}

// Os passos do guia com o alvo à vista (ex.: sem festas, o passo da folha de festa sai).
// Nas partes da festa, a barra de partes e as observações entram quando a pessoa pede o
// guia, ou sozinhas só na primeira parte que ela abrir.
function montarPassos(guia: Guia, pedido: boolean): PassoGuia[] {
  const comPartes = guia.partesDaFesta && (pedido || !jaViu(ID_PASSOS_PARTES));
  return [...(comPartes ? PASSOS_PARTES : []), ...guia.passos].filter(
    (p) => !p.alvo || acharAlvo(p.alvo),
  );
}

// Botão "Como usar" no topo do painel. Abre o guia da página e, nas páginas com guia
// próprio, abre sozinho na primeira visita deste navegador.
export function BotaoGuia() {
  const caminho = usePathname();
  const guia = guiaDaPagina(caminho);
  const [aberto, setAberto] = useState<{ caminho: string; passos: PassoGuia[] } | null>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  function fechar() {
    marcarVisto(guia.id);
    if (guia.partesDaFesta) marcarVisto(ID_PASSOS_PARTES);
    setAberto(null);
    botaoRef.current?.focus();
  }

  useEffect(() => {
    if (!guia.abreSozinho || !guia.rota.test(caminho) || jaViu(guia.id)) return;
    // Um respiro para a página assentar antes de medir os alvos.
    // Sem nenhum alvo à vista (ex.: lista de convidados apagada), fica para a próxima visita.
    const espera = setTimeout(() => {
      const passos = montarPassos(guia, false);
      if (passos.length > 0) setAberto({ caminho, passos });
    }, 500);
    return () => clearTimeout(espera);
  }, [caminho, guia]);

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto({ caminho, passos: montarPassos(guia, true) })}
        aria-label="Como usar esta página"
        title="Como usar esta página"
        className="bg-pastel-azul text-foreground focus-visible:outline-ring inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-[filter] hover:brightness-95 focus-visible:outline-2"
      >
        <CircleHelp aria-hidden className="size-4" strokeWidth={2} />
        <span className="hidden min-[380px]:inline sm:hidden">Ajuda</span>
        <span className="hidden sm:inline">Como usar</span>
      </button>
      {/* Mudou de página com o guia aberto: ele fecha (era o guia da outra página). */}
      {aberto?.caminho === caminho &&
        createPortal(<Balao passos={aberto.passos} onFechar={fechar} />, document.body)}
    </>
  );
}

const MARGEM = 16;
const ESPACO = 12;
const FOLGA = 6; // o destaque passa um pouco das bordas do alvo

type Caixa = { top: number; left: number; right: number; bottom: number };

// Onde o balão cabe: embaixo do alvo, em cima, à direita; senão preso no rodapé.
function posicao(caixa: Caixa | null, largura: number, altura: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const limitar = (v: number, max: number) => Math.max(MARGEM, Math.min(v, max));
  if (!caixa) return { top: (vh - altura) / 2, left: (vw - largura) / 2 };

  const leftAlinhado = limitar(caixa.left, vw - largura - MARGEM);
  if (caixa.bottom + ESPACO + altura <= vh - MARGEM)
    return { top: caixa.bottom + ESPACO, left: leftAlinhado };
  if (caixa.top - ESPACO - altura >= MARGEM)
    return { top: caixa.top - ESPACO - altura, left: leftAlinhado };
  if (caixa.right + ESPACO + largura <= vw - MARGEM)
    return { top: limitar(caixa.top, vh - altura - MARGEM), left: caixa.right + ESPACO };
  return { top: vh - altura - MARGEM, left: (vw - largura) / 2 };
}

function Balao({ passos, onFechar }: { passos: PassoGuia[]; onFechar: () => void }) {
  const [indice, setIndice] = useState(0);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [tamanho, setTamanho] = useState<{ largura: number; altura: number } | null>(null);
  const balaoRef = useRef<HTMLDivElement>(null);
  const proximoRef = useRef<HTMLButtonElement>(null);

  const passo = passos[indice];
  const ultimo = indice === passos.length - 1;

  // Leva o alvo para o meio da tela e acompanha rolagem e mudança de tamanho.
  useEffect(() => {
    const alvo = acharAlvo(passo.alvo);
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    alvo?.scrollIntoView({ block: "center", behavior: suave ? "smooth" : "auto" });

    let quadro = 0;
    const medir = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = alvo?.getBoundingClientRect();
        setCaixa(r ? { top: r.top, left: r.left, right: r.right, bottom: r.bottom } : null);
        const b = balaoRef.current;
        if (b) setTamanho({ largura: b.offsetWidth, altura: b.offsetHeight });
      });
    };
    medir();
    window.addEventListener("scroll", medir, { capture: true, passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", medir, { capture: true });
      window.removeEventListener("resize", medir);
    };
  }, [passo]);

  useEffect(() => {
    proximoRef.current?.focus();
  }, [indice]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [onFechar]);

  // O foco não sai do balão enquanto ele está aberto.
  function prenderFoco(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const botoes = balaoRef.current?.querySelectorAll<HTMLElement>("button");
    if (!botoes?.length) return;
    const primeiro = botoes[0];
    const fim = botoes[botoes.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      fim.focus();
    } else if (!e.shiftKey && document.activeElement === fim) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  const lugar = tamanho ? posicao(caixa, tamanho.largura, tamanho.altura) : null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Véu: escurece tudo menos o alvo e segura os cliques na página. */}
      {caixa ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-xl shadow-[0_0_0_200vmax_oklch(0.2_0.01_250/45%)] transition-[top,left,width,height] duration-200 ease-out motion-reduce:transition-none"
          style={{
            top: caixa.top - FOLGA,
            left: caixa.left - FOLGA,
            width: caixa.right - caixa.left + FOLGA * 2,
            height: caixa.bottom - caixa.top + FOLGA * 2,
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 bg-[oklch(0.2_0.01_250/45%)]" />
      )}

      <div
        ref={balaoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guia-titulo"
        aria-describedby="guia-texto"
        onKeyDown={prenderFoco}
        className="papel-solto fixed flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3 p-4"
        style={{
          top: lugar?.top ?? 0,
          left: lugar?.left ?? 0,
          visibility: lugar ? "visible" : "hidden",
        }}
      >
        <p className="text-tinta-suave font-mono text-xs">
          {indice + 1} de {passos.length}
        </p>
        <h2 id="guia-titulo" className="-mt-2 text-[1.0625rem] font-semibold">
          {passo.titulo}
        </h2>
        <p id="guia-texto" className="text-sm leading-relaxed">
          {passo.texto}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {!ultimo && (
            <Button variant="ghost" size="lg" onClick={onFechar} className="text-tinta-suave">
              Pular guia
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {indice > 0 && (
              <Button variant="outline" size="lg" onClick={() => setIndice(indice - 1)}>
                Voltar
              </Button>
            )}
            <Button
              ref={proximoRef}
              size="lg"
              onClick={() => (ultimo ? onFechar() : setIndice(indice + 1))}
            >
              {ultimo ? "Entendi" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
