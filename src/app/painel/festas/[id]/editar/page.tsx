import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { paraCampos } from "@/lib/datas";
import { buscarFesta } from "@/lib/festas/consultas";

import { atualizarFesta } from "../../actions";
import { FolhaFormulario } from "../../folha-formulario";
import { FormularioFesta } from "../../formulario-festa";

export const metadata: Metadata = { title: "Editar festa · Painel de Festas" };

export default async function PaginaEditarFesta(props: PageProps<"/painel/festas/[id]/editar">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  const { data, hora } = paraCampos(festa.dataHora);
  const voltarPara = `/painel/festas/${festa.id}`;

  return (
    <FolhaFormulario titulo="Editar festa" voltarPara={voltarPara} rotuloVoltar={festa.titulo}>
      <FormularioFesta
        acao={atualizarFesta.bind(null, festa.id)}
        inicial={{
          titulo: festa.titulo,
          data,
          hora,
          localNome: festa.localNome,
          endereco: festa.endereco,
          traje: festa.traje ?? "",
          observacoes: festa.observacoes ?? "",
        }}
        rotuloEnviar="Salvar alterações"
        voltarPara={voltarPara}
      />
    </FolhaFormulario>
  );
}
