import type { Metadata } from "next";
import { cookies } from "next/headers";

import { Logo } from "@/components/logo";
import { exigirUsuario } from "@/lib/dal";
import { partesData } from "@/lib/datas";
import { contarFestas } from "@/lib/festas/consultas";
import { NOME_COOKIE_TEMA, temaValido } from "@/lib/tema";

import { BotaoTema } from "./botao-tema";
import { BotaoSairRodape, NavegacaoInferior, NavegacaoLateral } from "./navegacao";
import { BotaoNovidades } from "./novidades/botao-novidades";

export const metadata: Metadata = {
  title: "Painel de Festas",
  robots: { index: false, follow: false },
};

export default async function LayoutPainel({ children }: LayoutProps<"/painel">) {
  const [usuario, contagens] = await Promise.all([exigirUsuario(), contarFestas()]);
  const hoje = partesData(new Date());
  const tema = temaValido((await cookies()).get(NOME_COOKIE_TEMA)?.value);

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-card border-border sticky top-0 z-20 border-b">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:pr-8 md:pl-6">
          <Logo />
          <div className="flex items-center gap-3">
            <p className="text-tinta-suave text-sm first-letter:uppercase">
              <span className="hidden md:inline">{hoje.extenso}</span>
              <span className="md:hidden">
                {hoje.semana}, {Number(hoje.dia)} {hoje.mes}
              </span>
            </p>
            <BotaoTema inicial={tema} />
            <BotaoNovidades />
          </div>
        </div>
      </header>

      <div className="flex flex-1 md:pl-4">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] pt-6 pb-6">
            <NavegacaoLateral contagens={contagens} nome={usuario.nome} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 pt-4 pb-28 md:px-8 md:pt-6 md:pb-12">
          {children}
          <BotaoSairRodape nome={usuario.nome} />
        </main>
      </div>

      <NavegacaoInferior contagens={contagens} />
    </div>
  );
}
