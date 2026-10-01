"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { excluirFesta } from "../actions";

function BotaoConfirmar() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/30 text-primary-foreground"
    >
      {pending ? "Excluindo…" : "Excluir festa"}
    </Button>
  );
}

export function ExcluirFesta({ id, titulo }: { id: string; titulo: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-destructive hover:text-destructive h-9">
          <Trash2 aria-hidden strokeWidth={1.75} />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="folha folha-lisa gap-5 py-6 pr-6 pl-[calc(var(--margem)+0.875rem)] ring-0 data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">Excluir esta festa?</AlertDialogTitle>
          <AlertDialogDescription>
            “{titulo}” e todos os convidados dela serão apagados. Isso não pode ser desfeito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel className="bg-card">Cancelar</AlertDialogCancel>
          <form action={excluirFesta.bind(null, id)}>
            <BotaoConfirmar />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
