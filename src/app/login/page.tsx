import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { destinoSeguro } from "@/lib/auth/destino";
import { obterUsuarioLogado } from "@/lib/dal";

import { FormularioLogin } from "./formulario-login";
import { MarcaLogo } from "@/components/logo";

export const metadata: Metadata = { title: "Entrar · Painel de Festas" };

export default async function PaginaLogin(props: PageProps<"/login">) {
  const { de } = await props.searchParams;
  const destino = destinoSeguro(de);

  if (await obterUsuarioLogado()) {
    redirect(destino);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="folha folha-lisa w-full max-w-sm px-6 py-8">
        <div className="mb-6 flex justify-center">
          <MarcaLogo prioridade className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Entrar</h1>
        <p className="text-tinta-suave mt-1 mb-6 text-sm">Acesse o painel das suas festas.</p>
        <FormularioLogin de={destino} />
      </div>
    </main>
  );
}
