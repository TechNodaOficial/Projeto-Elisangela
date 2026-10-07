import { Archive, CircleAlert, CircleCheck, FileDown } from "lucide-react";

import { FUSO } from "@/lib/datas";
import { apagamentoMaximo, apagamentoPrevisto } from "@/lib/retencao/prazo";
import { cn } from "@/lib/utils";

const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, dateStyle: "long" }).format(d);

// Aviso das festas concluídas sobre o arquivo: baixar o PDF completo antes da limpeza
// apagar os dados (ver src/lib/retencao/prazo.ts).
export function AvisoArquivo({
  festa,
  agora = new Date(),
}: {
  festa: {
    id: string;
    dataHora: Date;
    pdfCompletoEm: Date | null;
    convidadosApagadosEm: Date | null;
    resumoConvidados: number | null;
    resumoConfirmados: number | null;
    resumoPresentes: number | null;
  };
  agora?: Date;
}) {
  if (festa.convidadosApagadosEm) {
    return (
      <section className="bg-card mt-6 flex items-start gap-3 rounded-2xl p-5">
        <Archive
          aria-hidden
          className="text-tinta-suave mt-0.5 size-5 shrink-0"
          strokeWidth={1.75}
        />
        <div>
          <h2 className="font-semibold">Festa arquivada</h2>
          <p className="text-tinta-suave text-sm">
            Os dados foram apagados em {dataCurta(festa.convidadosApagadosEm)}. Ficaram os números:{" "}
            <strong className="text-foreground">{festa.resumoConvidados ?? 0}</strong> convidados,{" "}
            <strong className="text-foreground">{festa.resumoConfirmados ?? 0}</strong> confirmados,{" "}
            <strong className="text-foreground">{festa.resumoPresentes ?? 0}</strong> entraram.
            {festa.pdfCompletoEm &&
              ` O PDF completo foi baixado em ${dataCurta(festa.pdfCompletoEm)}.`}
          </p>
        </div>
      </section>
    );
  }

  const baixado = festa.pdfCompletoEm !== null;
  const apagaEm = baixado ? apagamentoPrevisto(festa.dataHora) : apagamentoMaximo(festa.dataHora);
  const quando =
    apagaEm <= agora ? "na próxima limpeza (de madrugada)" : `a partir de ${dataCurta(apagaEm)}`;

  return (
    <section
      className={cn(
        "mt-6 flex flex-wrap items-start gap-3 rounded-2xl p-5",
        baixado ? "bg-resolvida" : "bg-pendente",
      )}
    >
      {baixado ? (
        <CircleCheck
          aria-hidden
          className="text-resolvida-forte mt-0.5 size-5 shrink-0"
          strokeWidth={2}
        />
      ) : (
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
      )}
      <div className="min-w-0 flex-1 basis-64">
        <h2 className="font-semibold">
          {baixado
            ? `PDF completo baixado em ${dataCurta(festa.pdfCompletoEm!)}`
            : "Guarde a festa: baixe o PDF completo"}
        </h2>
        <p className="text-tinta-suave text-sm">
          {baixado
            ? `Os dados desta festa serão apagados ${quando}. Ficam só o nome, a data, o local e os números.`
            : `O PDF traz tudo: fornecedores, checklists, convidados, mesas, cerimônia, padrinhos e observações. Depois de baixado, os dados são apagados 30 dias após a festa; sem ele, ${quando}.`}{" "}
          Os arquivos de contrato não entram no PDF: baixe cada um em Fornecedores antes.
        </p>
      </div>
      <a
        href={`/painel/festas/${festa.id}/pdf/completo`}
        target="_blank"
        rel="noopener"
        className="bg-card focus-visible:outline-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <FileDown aria-hidden className="size-4" strokeWidth={1.75} />
        {baixado ? "Baixar de novo" : "Baixar PDF completo"}
      </a>
    </section>
  );
}
