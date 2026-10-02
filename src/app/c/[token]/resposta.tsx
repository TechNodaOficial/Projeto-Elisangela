"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { responderConvite } from "./actions";

type Estado = "aberto" | "confirmado" | "recusado";

// Botões grandes, para o polegar: o convidado quase sempre está no celular.
// 48px + 4px acima e abaixo = duas pautas, para a folha seguir alinhada.
const grande = "my-1 h-12 rounded-lg text-[0.9375rem]";

export function Resposta({ token, estado }: { token: string; estado: Estado }) {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  const [confirmandoRecusa, setConfirmandoRecusa] = useState(false);

  function responder(resposta: "CONFIRMADO" | "RECUSADO") {
    setErro(undefined);
    iniciar(async () => {
      const r = await responderConvite(token, resposta);
      if (r.erro) setErro(r.erro);
      else setConfirmandoRecusa(false);
    });
  }

  const mensagemErro = erro && (
    <p role="alert" className="text-destructive text-sm leading-(--linha)">
      {erro}
    </p>
  );

  if (estado === "aberto") {
    return (
      <section aria-labelledby="pergunta" className="mt-(--linha)">
        <h2 id="pergunta" className="text-lg font-semibold">
          Você vai?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Button className={grande} disabled={enviando} onClick={() => responder("CONFIRMADO")}>
            Vou
          </Button>
          <Button
            variant="outline"
            className={cn(grande, "bg-card")}
            disabled={enviando}
            onClick={() => responder("RECUSADO")}
          >
            Não poderei ir
          </Button>
        </div>
        {enviando && (
          <p role="status" className="text-tinta-suave text-sm leading-(--linha)">
            Enviando resposta…
          </p>
        )}
        {mensagemErro}
      </section>
    );
  }

  if (estado === "recusado") {
    return (
      <section aria-label="Mudar resposta" className="mt-(--linha)">
        <p className="text-tinta-suave text-sm leading-(--linha)">
          Mudou de ideia? Dá para confirmar até o dia da festa.
        </p>
        <Button
          className={cn(grande, "w-full")}
          disabled={enviando}
          onClick={() => responder("CONFIRMADO")}
        >
          {enviando ? "Enviando…" : "Vou à festa"}
        </Button>
        {mensagemErro}
      </section>
    );
  }

  // Confirmado: desistir apaga o QR, então pede uma segunda confirmação na própria folha.
  return (
    <section aria-label="Mudar resposta" className="mt-(--linha)">
      {confirmandoRecusa ? (
        <div role="group" aria-labelledby="aviso-recusa">
          <p id="aviso-recusa" className="text-sm leading-(--linha)">
            Seu QR Code de entrada deixa de valer. Confirma que não vai?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(grande, "bg-card")}
              disabled={enviando}
              onClick={() => setConfirmandoRecusa(false)}
            >
              Voltar
            </Button>
            <Button
              className={cn(
                grande,
                "bg-destructive hover:bg-destructive/90 text-primary-foreground",
              )}
              disabled={enviando}
              onClick={() => responder("RECUSADO")}
            >
              {enviando ? "Enviando…" : "Não vou"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmandoRecusa(true)}
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring relative -mx-1 rounded-sm px-1 text-sm underline underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-3 focus-visible:outline-2"
        >
          Não vai mais poder ir? Avise aqui.
        </button>
      )}
      {mensagemErro}
    </section>
  );
}
