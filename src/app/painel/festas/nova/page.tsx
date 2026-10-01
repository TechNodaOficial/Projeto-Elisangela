import type { Metadata } from "next";

import { criarFesta } from "../actions";
import { FolhaFormulario } from "../folha-formulario";
import { FormularioFesta } from "../formulario-festa";

export const metadata: Metadata = { title: "Nova festa · Painel de Festas" };

export default function PaginaNovaFesta() {
  return (
    <FolhaFormulario titulo="Nova festa" voltarPara="/painel" rotuloVoltar="Festas pendentes">
      <FormularioFesta acao={criarFesta} rotuloEnviar="Salvar festa" voltarPara="/painel" />
    </FolhaFormulario>
  );
}
