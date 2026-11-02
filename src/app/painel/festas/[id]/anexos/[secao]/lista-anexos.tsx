"use client";

import { Download, FileImage, FileSpreadsheet, FileText, Paperclip, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { ACEITA_ANEXO, TAMANHO_MAXIMO_ANEXO, tamanhoLegivel } from "@/lib/anexos/arquivo";
import { FUSO } from "@/lib/datas";

import { enviarAnexo, removerAnexo } from "../actions";

type Anexo = { id: string; nome: string; tipo: string; tamanho: number; criadoEm: Date };

const ICONE: Record<string, typeof FileText> = {
  png: FileImage,
  jpeg: FileImage,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
};

const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "numeric", month: "short" }).format(d);

const LINK =
  "focus-visible:outline-ring text-tinta-suave hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-md focus-visible:outline-2";

export function ListaAnexos({
  festaId,
  secao,
  anexos,
}: {
  festaId: string;
  secao: string;
  anexos: Anexo[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erros, setErros] = useState<string[]>([]);

  // Um arquivo por vez (ver enviarAnexo); os grandes demais nem saem do celular.
  function enviar(arquivos: File[]) {
    setErros([]);
    iniciar(async () => {
      const falhas: string[] = [];
      for (const [i, arquivo] of arquivos.entries()) {
        if (arquivo.size > TAMANHO_MAXIMO_ANEXO) {
          falhas.push(`${arquivo.name}: grande demais (máximo 4 MB).`);
          continue;
        }
        setProgresso(
          arquivos.length > 1 ? `Enviando ${i + 1} de ${arquivos.length}…` : "Enviando…",
        );
        const dados = new FormData();
        dados.set("arquivo", arquivo);
        try {
          const { erro } = await enviarAnexo(festaId, secao, dados);
          if (erro) falhas.push(erro);
        } catch {
          falhas.push(`${arquivo.name}: não foi possível enviar. Tente de novo.`);
        }
      }
      setProgresso(null);
      setErros(falhas);
      router.refresh();
    });
  }

  return (
    <section className="bg-card rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-tinta-suave text-sm">PDF, fotos, Word ou Excel, até 4 MB cada.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACEITA_ANEXO}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const arquivos = [...(e.target.files ?? [])];
            e.target.value = "";
            if (arquivos.length) enviar(arquivos);
          }}
        />
        <Button type="button" disabled={enviando} onClick={() => inputRef.current?.click()}>
          <Paperclip aria-hidden strokeWidth={1.75} />
          {progresso ?? "Anexar arquivo"}
        </Button>
      </div>

      {erros.length > 0 && (
        <ul role="alert" className="text-destructive mt-3 space-y-1 text-sm">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {anexos.length === 0 ? (
        <p className="text-tinta-suave mt-4 text-sm leading-(--linha)">
          Nenhum arquivo ainda. Orçamentos, fotos de referência e listas desta parte da festa ficam
          aqui.
        </p>
      ) : (
        <ul className="mt-4 divide-y">
          {anexos.map((a) => {
            const Icone = ICONE[a.tipo] ?? FileText;
            const href = `/painel/festas/${festaId}/anexos/${secao}/${a.id}`;
            return (
              <li key={a.id} className="flex items-center gap-2 py-2">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener"
                  className="focus-visible:outline-ring hover:bg-muted -mx-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-1 py-1 focus-visible:outline-2"
                >
                  <Icone
                    aria-hidden
                    className="text-tinta-suave size-5 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{a.nome}</span>
                    <span className="text-tinta-suave block text-xs">
                      {tamanhoLegivel(a.tamanho)} · {dataCurta(a.criadoEm)}
                    </span>
                  </span>
                </a>
                <a href={`${href}?baixar=1`} aria-label={`Baixar ${a.nome}`} className={LINK}>
                  <Download aria-hidden className="size-4" strokeWidth={1.75} />
                </a>
                <ConfirmarExclusao
                  titulo="Apagar o anexo?"
                  descricao={<>O arquivo {a.nome} é apagado do painel.</>}
                  rotuloConfirmar="Apagar anexo"
                  rotuloEnviando="Apagando…"
                  acao={removerAnexo.bind(null, a.id)}
                  gatilho={
                    <button type="button" aria-label={`Apagar ${a.nome}`} className={LINK}>
                      <X aria-hidden className="size-4" strokeWidth={1.75} />
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
