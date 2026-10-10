"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Documento } from "@/lib/festas/observacoes";

import { salvarLinkCerimonial } from "../observacoes/actions";
import { EditorObservacoes } from "../observacoes/editor";

// Texto do cerimonial (a fala da cerimônia), em dois jeitos: o link do documento dela
// (Word, Google Docs...) ou o texto escrito aqui mesmo, que sai no PDF do roteiro.
export function TextoCerimonial({
  festaId,
  link,
  secao,
  texto,
  salvoEm,
}: {
  festaId: string;
  link: string | null;
  secao: string;
  texto: Documento | null;
  salvoEm: string | null;
}) {
  const [valor, setValor] = useState(link ?? "");
  const [erro, setErro] = useState<string>();
  const [salvo, setSalvo] = useState(false);
  const [salvando, iniciar] = useTransition();
  const mudou = valor.trim() !== (link ?? "");

  function salvar(novo: string) {
    setErro(undefined);
    setSalvo(false);
    iniciar(async () => {
      const r = await salvarLinkCerimonial(festaId, novo);
      if (r.ok) {
        setValor(novo.trim());
        setSalvo(true);
      } else setErro(r.erro);
    });
  }

  return (
    <section
      aria-labelledby="titulo-texto-cerimonial"
      className="folha mt-6 pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
    >
      <h2 id="titulo-texto-cerimonial" className="flex items-center gap-2 text-lg font-semibold">
        <FileText aria-hidden className="size-5" strokeWidth={1.75} />
        Texto do cerimonial
      </h2>
      <p className="text-tinta-suave text-sm leading-snug">
        A fala da cerimônia. Guarde o link do seu documento ou escreva o texto aqui embaixo: o texto
        escrito aqui sai no PDF do roteiro, na página da cerimônia.
      </p>

      <form
        noValidate
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          salvar(valor);
        }}
      >
        <label htmlFor="link-cerimonial" className="text-sm font-medium">
          Link do documento{" "}
          <span className="text-tinta-suave font-normal">(Word, Google Docs…)</span>
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <Input
            id="link-cerimonial"
            type="url"
            inputMode="url"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setSalvo(false);
            }}
            placeholder="https://docs.google.com/… ou https://onedrive.live.com/…"
            aria-invalid={erro ? true : undefined}
            className="bg-card h-10 min-w-0 flex-1"
          />
          <div className="flex gap-2">
            {mudou ? (
              <Button type="submit" disabled={salvando} className="h-10">
                {salvando ? "Salvando…" : "Salvar link"}
              </Button>
            ) : (
              link && (
                <>
                  <Button asChild variant="outline" className="bg-card h-10">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden strokeWidth={1.75} />
                      Abrir documento
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-tinta-suave h-10"
                    disabled={salvando}
                    onClick={() => salvar("")}
                  >
                    Tirar link
                  </Button>
                </>
              )
            )}
          </div>
        </div>
        <p aria-live="polite" className="mt-1 text-sm leading-snug">
          {erro ? (
            <span className="text-destructive">{erro}</span>
          ) : salvo ? (
            <span className="text-tinta-suave">{valor ? "Link salvo." : "Link tirado."}</span>
          ) : null}
        </p>
      </form>

      <h3 className="mt-4 text-sm font-medium">Ou escreva o texto aqui</h3>
      <div className="mt-2">
        <EditorObservacoes festaId={festaId} secao={secao} inicial={texto} salvoEm={salvoEm} />
      </div>
    </section>
  );
}
