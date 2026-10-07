"use client";

import { useEffect } from "react";

import { ULTIMA_NOVIDADE } from "@/lib/novidades";

export const CHAVE_NOVIDADES = "novidades-vistas";
export const EVENTO_NOVIDADES = "novidades-vistas";

// Abriu a página: guarda a nota mais nova como vista e apaga o pontinho do botão.
export function MarcarVistas() {
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_NOVIDADES, ULTIMA_NOVIDADE);
    } catch {
      // Navegação privada ou armazenamento bloqueado: o pontinho só continua aceso.
    }
    window.dispatchEvent(new Event(EVENTO_NOVIDADES));
  }, []);
  return null;
}
