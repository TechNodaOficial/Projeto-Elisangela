"use client";

import { useState } from "react";

import { NOME_COOKIE_TEMA, type Tema } from "@/lib/tema";

const OPCOES: { tema: Tema; nome: string; amostra: string }[] = [
  { tema: "caqui", nome: "Caqui", amostra: "bg-[oklch(0.78_0.038_70)]" },
  { tema: "cinza", nome: "Cinza", amostra: "bg-[oklch(0.74_0.004_95)]" },
];

function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  document.cookie = `${NOME_COOKIE_TEMA}=${tema}; path=/; max-age=31536000; samesite=lax`;
}

// Alterna a cor da mesa do painel. Troca na hora no <html> e guarda no cookie por 1 ano.
export function BotaoTema({ inicial }: { inicial: Tema }) {
  const [tema, setTema] = useState(inicial);

  function escolher(novo: Tema) {
    setTema(novo);
    aplicarTema(novo);
  }

  return (
    <div role="radiogroup" aria-label="Cor do painel" className="flex items-center gap-1">
      {OPCOES.map((opcao) => (
        <button
          key={opcao.tema}
          type="button"
          role="radio"
          aria-checked={tema === opcao.tema}
          aria-label={opcao.nome}
          title={opcao.nome}
          onClick={() => escolher(opcao.tema)}
          className="focus-visible:outline-ring inline-flex size-9 items-center justify-center rounded-md focus-visible:outline-2"
        >
          <span
            aria-hidden
            className={`${opcao.amostra} size-5 rounded-full border border-[oklch(0.255_0.004_250/25%)] transition-shadow ${
              tema === opcao.tema ? "ring-foreground ring-offset-card ring-2 ring-offset-2" : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}
