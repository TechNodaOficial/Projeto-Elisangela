"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OBSERVACAO_MAXIMO } from "@/lib/convidados/schema";

import { salvarObservacaoConvite } from "./actions";

// Observação que ela escreve para um convidado e que aparece no convite dele
// ("Vocês entram com os padrinhos, cheguem às 16h"). Salvar vazio apaga.
export function EditorObservacao({
  convidadoId,
  nome,
  inicial,
  aoFechar,
}: {
  convidadoId: string;
  nome: string;
  inicial: string;
  aoFechar: () => void;
}) {
  const [texto, setTexto] = useState(inicial);
  const [erro, setErro] = useState<string>();
  const [salvando, iniciar] = useTransition();
  const id = `observacao-${convidadoId}`;

  const salvar = () =>
    iniciar(async () => {
      const r = await salvarObservacaoConvite(convidadoId, texto);
      if (r.erro) setErro(r.erro);
      else aoFechar();
    });

  return (
    <div className="bg-card col-span-full flex flex-col gap-2 rounded-lg px-3 py-3">
      <Label htmlFor={id}>Observação no convite de {nome}</Label>
      <Textarea
        id={id}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={OBSERVACAO_MAXIMO}
        autoFocus
        placeholder="Ex.: Vocês entram com os padrinhos, cheguem às 16h."
        aria-describedby={`${id}-dica`}
        aria-invalid={erro ? true : undefined}
      />
      <p id={`${id}-dica`} className="text-tinta-suave text-sm leading-snug">
        {erro ? (
          <span role="alert" className="text-destructive">
            {erro}
          </span>
        ) : (
          "Só esta pessoa vê, ao abrir o link do convite. Deixe vazio para tirar."
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={salvar} disabled={salvando} className="h-10 px-4">
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={aoFechar} className="h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
