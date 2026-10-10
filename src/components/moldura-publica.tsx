// Moldura das páginas públicas do convite: a logo acima de uma folha estreita.

import { FaixaLogo } from "@/components/logo";

export function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FaixaLogo className="h-20 w-auto" />
      <main className="mx-auto w-full max-w-md px-4 pt-5 pb-10 sm:pt-8">{children}</main>
    </>
  );
}

export function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Moldura>
      <div className="folha folha-lisa py-(--linha) pr-5 pl-[calc(var(--margem)+0.875rem)] leading-(--linha)">
        <h1 className="text-lg font-semibold">{titulo}</h1>
        <p className="text-tinta-suave">{texto}</p>
      </div>
    </Moldura>
  );
}
