import type { Metadata } from "next";

import { listarServicos } from "@/lib/festas/consultas";

import { CabecalhoSecao } from "../folhas";
import { AbasFornecedores } from "./abas";
import { BaseFornecedores } from "./base";

export const metadata: Metadata = { title: "Fornecedores · Painel de Festas" };

export default async function PaginaBaseFornecedores() {
  const servicos = await listarServicos();
  return (
    <>
      <CabecalhoSecao
        titulo="Fornecedores"
        descricao="Sua base de fornecedores, separada por serviço. Nas festas, você escolhe daqui."
      />
      <AbasFornecedores atual="fornecedores" />
      <BaseFornecedores servicos={servicos} />
    </>
  );
}
