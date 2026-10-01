import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { destinoSeguro } from "@/lib/auth/destino";
import { obterUsuarioLogado } from "@/lib/dal";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Entrar · Painel de Festas" };

export default async function PaginaLogin(props: PageProps<"/login">) {
  const { de } = await props.searchParams;
  const destino = destinoSeguro(de);

  if (await obterUsuarioLogado()) {
    redirect(destino);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Painel de Festas</CardTitle>
          <CardDescription>Entre para gerenciar suas festas e convidados.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioLogin de={destino} />
        </CardContent>
      </Card>
    </main>
  );
}
