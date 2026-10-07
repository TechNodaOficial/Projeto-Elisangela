"use client";

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

function BotaoConfirmar({ rotulo, rotuloEnviando }: { rotulo: string; rotuloEnviando: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/30 text-primary-foreground"
    >
      {pending ? rotuloEnviando : rotulo}
    </Button>
  );
}

// Confirmação de ação destrutiva, numa folha de papel (ver DESIGN.md).
// Use com `gatilho` (abre ao clicar) ou controlado por `aberto`/`aoMudar`.
export function ConfirmarExclusao({
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloEnviando,
  acao,
  gatilho,
  aberto,
  aoMudar,
}: {
  titulo: string;
  descricao: React.ReactNode;
  rotuloConfirmar: string;
  rotuloEnviando: string;
  acao: () => Promise<void>;
  gatilho?: React.ReactNode;
  aberto?: boolean;
  aoMudar?: (aberto: boolean) => void;
}) {
  return (
    <AlertDialog open={aberto} onOpenChange={aoMudar}>
      {gatilho && <AlertDialogTrigger asChild>{gatilho}</AlertDialogTrigger>}
      <AlertDialogContent className="folha folha-lisa gap-5 px-6 py-6 ring-0 data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel className="bg-card">Cancelar</AlertDialogCancel>
          <form action={acao}>
            <BotaoConfirmar rotulo={rotuloConfirmar} rotuloEnviando={rotuloEnviando} />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
