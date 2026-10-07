import type { Metadata } from "next";

import { listarServicos } from "@/lib/festas/consultas";

import { CabecalhoSecao } from "../../folhas";
import { AbasFornecedores } from "../abas";
import { ServicosEChecklists } from "../base";

export const metadata: Metadata = { title: "Serviços e checklists · Painel de Festas" };

export default async function PaginaServicos() {
  const servicos = await listarServicos();
  return (
    <>
      <CabecalhoSecao
        titulo="Fornecedores"
        descricao="Cada serviço tem um checklist que já vem pronto quando você o adiciona numa festa. Mudar aqui não altera festas que já têm o serviço."
      />
      <AbasFornecedores atual="servicos" />
      <ServicosEChecklists servicos={servicos} />
    </>
  );
}
