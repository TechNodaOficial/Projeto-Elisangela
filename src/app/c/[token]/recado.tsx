"use client";

import { MessageSquareHeart } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TAMANHO_MAXIMO_MENSAGEM } from "@/lib/convites/mensagem";

import { salvarMensagem } from "./actions";

// Recado do convidado para quem faz a festa: uma mensagem carinhosa ou, se não vai,
// o motivo. Fica numa folha própria, abaixo do convite; dá para mudar ou apagar depois.
export function Recado({
  token,
  salva,
  recusou,
}: {
  token: string;
  salva: string | null;
  // Quem avisou que não vai ganha um convite para explicar o motivo.
  recusou: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(salva ?? "");
  const [erro, setErro] = useState<string>();
  const [enviando, iniciar] = useTransition();

  function enviar(novo: string) {
    setErro(undefined);
    iniciar(async () => {
      const r = await salvarMensagem(token, novo);
      if (r.erro) setErro(r.erro);
      else {
        setTexto(novo.trim());
        setEditando(false);
      }
    });
  }

  const aberto = editando || !salva;

  return (
    <section aria-labelledby="titulo-recado" className="folha mt-4 px-5 py-4">
      <h2 id="titulo-recado" className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquareHeart aria-hidden className="size-5" strokeWidth={1.75} />
        {salva && !editando ? "Seu recado" : "Deixe um recado"}
      </h2>

      {aberto ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <label htmlFor="recado" className="text-tinta-suave block text-sm leading-snug">
            {recusou
              ? "Se quiser, conte por que não vai poder ir, ou mande um carinho."
              : "Uma mensagem para quem está fazendo a festa. A Elisangela entrega."}
          </label>
          <Textarea
            id="recado"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={TAMANHO_MAXIMO_MENSAGEM}
            rows={4}
            placeholder={
              recusou
                ? "Ex.: Infelizmente vamos estar viajando. Desejamos muitas felicidades!"
                : "Ex.: Muitas felicidades ao casal! Mal podemos esperar pela festa."
            }
            className="bg-card mt-2 min-h-28 text-base"
          />
          <p className="text-tinta-suave mt-1 text-right text-xs" aria-live="polite">
            {texto.length > TAMANHO_MAXIMO_MENSAGEM * 0.8 &&
              `${texto.length} de ${TAMANHO_MAXIMO_MENSAGEM}`}
          </p>
          <div className="mt-1 flex gap-2">
            {salva && (
              <Button
                type="button"
                variant="outline"
                className="bg-card h-12 flex-1 rounded-lg text-[0.9375rem]"
                disabled={enviando}
                onClick={() => {
                  setTexto(salva);
                  setEditando(false);
                  setErro(undefined);
                }}
              >
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              className="h-12 flex-1 rounded-lg text-[0.9375rem]"
              disabled={enviando || !texto.trim()}
            >
              {enviando ? "Enviando…" : salva ? "Salvar recado" : "Enviar recado"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <blockquote className="bg-pastel-lilas/45 mt-2 rounded-lg px-3.5 py-2.5 leading-snug break-words whitespace-pre-line">
            {salva}
          </blockquote>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-card h-11 flex-1 rounded-lg"
              disabled={enviando}
              onClick={() => setEditando(true)}
            >
              Mudar recado
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-tinta-suave h-11 flex-1 rounded-lg"
              disabled={enviando}
              onClick={() => enviar("")}
            >
              {enviando ? "Apagando…" : "Apagar"}
            </Button>
          </div>
        </>
      )}
      {erro && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {erro}
        </p>
      )}
    </section>
  );
}
