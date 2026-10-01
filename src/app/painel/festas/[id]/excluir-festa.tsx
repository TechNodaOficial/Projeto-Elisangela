"use client";

import { Trash2 } from "lucide-react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";

import { excluirFesta } from "../actions";

export function ExcluirFesta({ id, titulo }: { id: string; titulo: string }) {
  return (
    <ConfirmarExclusao
      titulo="Excluir esta festa?"
      descricao={
        <>“{titulo}” e todos os convidados dela serão apagados. Isso não pode ser desfeito.</>
      }
      rotuloConfirmar="Excluir festa"
      rotuloEnviando="Excluindo…"
      acao={excluirFesta.bind(null, id)}
      gatilho={
        <Button variant="ghost" className="text-destructive hover:text-destructive h-9">
          <Trash2 aria-hidden strokeWidth={1.75} />
          Excluir
        </Button>
      }
    />
  );
}
