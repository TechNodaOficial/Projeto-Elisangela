import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { contarPorStatus, listarConvidados } from "@/lib/convidados/consultas";
import { festaConcluida, FUSO } from "@/lib/datas";
import { buscarFesta } from "@/lib/festas/consultas";
import { origemDoSite } from "@/lib/origem";
import { apagamentoPrevisto } from "@/lib/retencao/prazo";

import { VoltarFesta } from "../voltar-festa";
import { SecaoConvidados } from "./secao-convidados";

// "2 de janeiro de 2027", no fuso de São Paulo.
const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, dateStyle: "long" }).format(d);

// Quando a exportação para o Google Planilhas não chega à planilha.
const AVISOS_PLANILHA = {
  negado: "A planilha não foi criada: a autorização do Google foi cancelada. Tente de novo.",
  erro: "Não deu para criar a planilha no Google agora. Tente de novo em instantes.",
  "sem-google":
    "A exportação para o Google Planilhas ainda não foi configurada (falta a chave do Google).",
};

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/convidados">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Convidados · ${festa.titulo}` : "Festa não encontrada" };
}

export default async function PaginaConvidados(props: PageProps<"/painel/festas/[id]/convidados">) {
  const { id } = await props.params;
  const { planilha } = await props.searchParams;
  const festa = await buscarFesta(id);
  if (!festa) notFound();
  const [convidados, origem] = await Promise.all([listarConvidados(festa.id), origemDoSite()]);
  const concluida = festaConcluida(festa.dataHora);

  return (
    <div className="w-full">
      <VoltarFesta festa={festa} observacoes="convidados" />
      {festa.convidadosApagadosEm ? (
        // Festa arquivada: os dados foram apagados (ver src/lib/retencao); ficam os números.
        <section
          id="convidados"
          aria-labelledby="titulo-convidados"
          className="folha pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
        >
          <h2 id="titulo-convidados" className="text-lg font-semibold">
            Convidados
          </h2>
          <p className="text-tinta-suave text-sm leading-(--linha)">
            <strong className="text-foreground font-semibold">{festa.resumoConvidados}</strong>{" "}
            convidados ·{" "}
            <strong className="text-foreground font-semibold">{festa.resumoConfirmados}</strong>{" "}
            confirmaram ·{" "}
            <strong className="text-foreground font-semibold">{festa.resumoPresentes}</strong>{" "}
            chegaram
          </p>
          <p className="text-tinta-suave text-sm leading-(--linha)">
            Lista apagada em {dataCurta(festa.convidadosApagadosEm)}, quando a festa foi arquivada
            (LGPD). Os nomes ficaram no PDF completo da festa.
          </p>
        </section>
      ) : (
        <SecaoConvidados
          festaId={festa.id}
          festa={{ titulo: festa.titulo, dataHora: festa.dataHora, localNome: festa.localNome }}
          mesasDemarcadas={festa.mesasDemarcadas}
          avisoPlanilha={
            typeof planilha === "string" && planilha in AVISOS_PLANILHA
              ? AVISOS_PLANILHA[planilha as keyof typeof AVISOS_PLANILHA]
              : undefined
          }
          convidados={convidados}
          contagem={contarPorStatus(convidados)}
          origem={origem}
          aviso={
            concluida && convidados.length > 0
              ? `Depois que você baixar o PDF completo da festa, nomes e telefones são apagados a partir de ${dataCurta(apagamentoPrevisto(festa.dataHora))} (LGPD).`
              : undefined
          }
        />
      )}
    </div>
  );
}
