import type { Metadata } from "next";

import { listarCompromissosNoPeriodo } from "@/lib/agenda/consultas";
import { diaVizinho, lerDia } from "@/lib/calendario";
import { diasAte, paraCampos, paraInstante, partesData, rotuloProximidade } from "@/lib/datas";
import { listarFestasNoPeriodo } from "@/lib/festas/consultas";
import { pendenciasDaFesta } from "@/lib/festas/pendencias";

import { linkDoDia, Topo } from "../calendario";
import { CabecalhoSecao } from "../folhas";
import { AgendaDoDia } from "./agenda-do-dia";

export const metadata: Metadata = { title: "Agenda · Painel de Festas" };

// Agenda de um dia: as festas daquele dia e os compromissos que ela marca (reuniões, visitas...).
export default async function PaginaAgenda(props: PageProps<"/painel/agenda">) {
  const { dia: valor } = await props.searchParams;
  const dia = lerDia(typeof valor === "string" ? valor : undefined);
  const inicio = paraInstante(dia, "00:00");
  const fim = paraInstante(diaVizinho(dia, 1), "00:00");
  const [festas, compromissos] = await Promise.all([
    listarFestasNoPeriodo(inicio, fim),
    listarCompromissosNoPeriodo(inicio, fim),
  ]);

  const { data: hoje, hora: agora } = paraCampos(new Date());
  const meioDia = paraInstante(dia, "12:00");
  const { extenso } = partesData(meioDia);
  const distancia = diasAte(meioDia);
  const [ano, mes] = dia.split("-");

  return (
    <>
      <CabecalhoSecao
        titulo="Agenda do dia"
        descricao="Reuniões e compromissos que você marcar, junto com as festas do dia."
      />
      <section aria-labelledby="titulo-calendario" className="folha mb-8 p-4 md:p-5">
        <Topo
          titulo={
            <>
              {extenso}
              {Math.abs(distancia) <= 1 && (
                <span className="text-tinta-suave text-sm font-normal">
                  {" "}
                  · {rotuloProximidade(distancia)}
                </span>
              )}
            </>
          }
          vista="dia"
          hrefDia={linkDoDia(dia)}
          hrefMes={`/painel?mes=${ano}-${mes}`}
          hrefAno={`/painel?vista=ano&ano=${ano}`}
          hoje={linkDoDia()}
          anterior={{ href: linkDoDia(diaVizinho(dia, -1)), rotulo: "Dia anterior" }}
          proximo={{ href: linkDoDia(diaVizinho(dia, 1)), rotulo: "Próximo dia" }}
        />
        <AgendaDoDia
          // Ao trocar de dia, o formulário aberto fecha e volta com o dia novo.
          key={dia}
          dia={dia}
          passou={dia < hoje}
          agora={dia === hoje ? agora : undefined}
          festas={festas.map(({ contratacoes, ...festa }) => ({
            id: festa.id,
            titulo: festa.titulo,
            hora: paraCampos(festa.dataHora).hora,
            pendencias: pendenciasDaFesta({ contratacoes }),
          }))}
          compromissos={compromissos.map((c) => ({
            id: c.id,
            titulo: c.titulo,
            hora: paraCampos(c.inicio).hora,
            horaFim: c.fim ? paraCampos(c.fim).hora : "",
            local: c.local,
            observacao: c.observacao,
          }))}
        />
      </section>
    </>
  );
}
