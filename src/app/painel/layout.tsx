import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { exigirUsuario } from "@/lib/dal";

import { sair } from "./actions";

export const metadata: Metadata = {
  title: "Painel de Festas",
  robots: { index: false, follow: false },
};

export default async function LayoutPainel({ children }: LayoutProps<"/painel">) {
  const usuario = await exigirUsuario();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-semibold">Painel de Festas</span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">{usuario.nome}</span>
            <form action={sair}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
