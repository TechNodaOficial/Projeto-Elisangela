"use client";

import { X } from "lucide-react";

import type { Colunas } from "@/lib/festas/consultas";
import { ETAPAS_MENU } from "@/lib/festas/colunas-schema";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Adicionar, Coluna, FormCampos, N, Vazio } from "../colunas/pecas";
import { criarItemMenu, removerItemMenu } from "./actions";

type ItemMenu = Colunas["menu"][number];

// Cardápio da festa, agrupado por etapa, na ordem em que o jantar acontece.
export function ColunaMenu({ festaId, menu }: { festaId: string; menu: ItemMenu[] }) {
  const etapas = ETAPAS_MENU.map((etapa) => ({
    etapa,
    itens: menu.filter((i) => i.etapa === etapa),
  })).filter((g) => g.itens.length > 0);

  return (
    <Coluna
      id="menu"
      titulo="Menu"
      resumo={
        menu.length > 0 && (
          <>
            <N>{menu.length}</N> {menu.length === 1 ? "item" : "itens"} em <N>{etapas.length}</N>{" "}
            {etapas.length === 1 ? "etapa" : "etapas"}
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo="Adicionar ao menu">
          {(fechar) => (
            <FormCampos
              acao={criarItemMenu.bind(null, festaId)}
              campos={[
                {
                  nome: "etapa",
                  rotulo: "Etapa",
                  tipo: "select",
                  opcoes: ETAPAS_MENU.map((e) => ({ valor: e, rotulo: e })),
                },
                {
                  nome: "texto",
                  rotulo: "Item",
                  placeholder: "Ex.: Risoto de cogumelos",
                  max: 160,
                },
              ]}
              inicial={{ etapa: "Entrada" }}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="novo-menu"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {menu.length === 0 ? (
        <Vazio>Entradas, pratos, sobremesas e bebidas que o buffet vai servir.</Vazio>
      ) : (
        <div className="mt-2 flex flex-col gap-4">
          {etapas.map(({ etapa, itens }) => (
            <section key={etapa} aria-label={etapa}>
              <h3 className="text-tinta-suave text-sm font-semibold tracking-[0.04em] uppercase">
                {etapa}
              </h3>
              <ul className={cn(BANDEJA, COR_RAIA.fornecedores, "mt-1")}>
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className={cn(LINHA_ALTERNADA, "group/item flex items-center gap-2 pl-2")}
                  >
                    <span className="min-w-0 flex-1 py-1.5 text-sm break-words">{item.texto}</span>
                    <form action={removerItemMenu.bind(null, item.id)}>
                      <button
                        type="submit"
                        aria-label={`Tirar "${item.texto}" do menu`}
                        className="text-tinta-suave hover:text-foreground focus-visible:outline-ring hover:bg-card flex size-9 items-center justify-center rounded-sm focus-visible:outline-2 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
                      >
                        <X aria-hidden className="size-4" strokeWidth={1.75} />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Coluna>
  );
}
