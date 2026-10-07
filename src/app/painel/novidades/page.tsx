import type { Metadata } from "next";

import { FUSO } from "@/lib/datas";
import { NOVIDADES } from "@/lib/novidades";

import { CabecalhoSecao } from "../folhas";
import { MarcarVistas } from "./marcar-vistas";

export const metadata: Metadata = { title: "Novidades · Painel de Festas" };

const dataLonga = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, dateStyle: "long" }).format(
    new Date(`${data}T12:00:00-03:00`),
  );

// Notas de atualização do painel, da mais nova para a mais antiga.
export default function PaginaNovidades() {
  return (
    <div className="w-full max-w-3xl">
      <MarcarVistas />
      <CabecalhoSecao
        titulo="Novidades"
        descricao="O que mudou no painel, da mais nova para a mais antiga."
      />
      <div className="flex flex-col gap-6">
        {NOVIDADES.map((n) => (
          <article key={n.id} aria-labelledby={`novidade-${n.id}`} className="folha px-5 py-6">
            <p className="text-tinta-suave text-sm">{dataLonga(n.data)}</p>
            <h2 id={`novidade-${n.id}`} className="text-xl font-semibold tracking-[-0.01em]">
              {n.titulo}
            </h2>
            <div className="mt-4 flex flex-col gap-5">
              {n.secoes.map((s) => (
                <section key={s.titulo}>
                  <h3 className="text-tinta-suave text-xs font-semibold tracking-[0.06em] uppercase">
                    {s.titulo}
                  </h3>
                  <ul className="marker:text-tinta-suave mt-1.5 flex list-disc flex-col gap-1 pl-5">
                    {s.itens.map((item) => (
                      <li key={item} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
