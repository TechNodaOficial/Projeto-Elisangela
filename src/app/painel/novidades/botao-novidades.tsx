"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { ULTIMA_NOVIDADE } from "@/lib/novidades";

import { CHAVE_NOVIDADES, EVENTO_NOVIDADES } from "./marcar-vistas";

function lerVista() {
  try {
    return localStorage.getItem(CHAVE_NOVIDADES);
  } catch {
    return null;
  }
}

function assinar(avisar: () => void) {
  window.addEventListener(EVENTO_NOVIDADES, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_NOVIDADES, avisar);
    window.removeEventListener("storage", avisar);
  };
}

// Botão "Novidades" no topo do painel. O pontinho fica aceso até ela abrir a nota mais nova
// (guardado neste navegador; no servidor, sem pontinho, para não piscar).
export function BotaoNovidades() {
  const nova = useSyncExternalStore(
    assinar,
    () => lerVista() !== ULTIMA_NOVIDADE,
    () => false,
  );
  return (
    <Link
      href="/painel/novidades"
      aria-label={nova ? "Novidades (tem novidade)" : "Novidades"}
      className="text-tinta-suave hover:text-foreground hover:bg-muted focus-visible:outline-ring relative inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm focus-visible:outline-2"
    >
      <Sparkles aria-hidden className="size-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">Novidades</span>
      {nova && (
        <span
          aria-hidden
          className="bg-pendente-forte absolute top-1.5 right-1.5 size-2 rounded-full sm:static sm:size-1.5"
        />
      )}
    </Link>
  );
}
