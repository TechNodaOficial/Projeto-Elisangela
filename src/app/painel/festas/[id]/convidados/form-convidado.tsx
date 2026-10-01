"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { EstadoFormConvidado } from "./actions";

type Props = {
  acao: (estado: EstadoFormConvidado, formData: FormData) => Promise<EstadoFormConvidado>;
  inicial?: { nome: string; telefone: string };
  rotuloEnviar: string;
  rotuloEnviando: string;
  // Prefixo dos ids, para não repetir ids quando há vários formulários na tela.
  prefixo: string;
  // Depois de salvar: o de adicionar se limpa; o de editar fecha.
  aoSalvar?: () => void;
  aoCancelar?: () => void;
  className?: string;
};

export function FormConvidado({
  acao,
  inicial,
  rotuloEnviar,
  rotuloEnviando,
  prefixo,
  aoSalvar,
  aoCancelar,
  className,
}: Props) {
  const [estado, enviar, enviando] = useActionState(acao, {});
  const nomeRef = useRef<HTMLInputElement>(null);
  const erros = estado.erros ?? {};
  const valores = estado.valores ?? inicial ?? { nome: "", telefone: "" };

  // O React 19 limpa o formulário após uma ação bem-sucedida; aqui só devolvemos o foco.
  useEffect(() => {
    if (!estado.sucesso) return;
    nomeRef.current?.focus();
    aoSalvar?.();
    // aoSalvar muda a cada render do pai; só o sucesso importa aqui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.sucesso]);

  const id = (campo: string) => `${prefixo}-${campo}`;

  return (
    <form
      action={enviar}
      noValidate
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-start", className)}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor={id("nome")}>Nome</Label>
        <Input
          ref={nomeRef}
          id={id("nome")}
          name="nome"
          placeholder="Nome do convidado"
          defaultValue={valores.nome}
          maxLength={120}
          autoComplete="off"
          aria-invalid={erros.nome ? true : undefined}
          aria-describedby={erros.nome ? id("erro-nome") : undefined}
          className="bg-card h-10"
        />
        {erros.nome && (
          <p id={id("erro-nome")} className="text-destructive text-sm">
            {erros.nome}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:w-52">
        <Label htmlFor={id("telefone")}>
          WhatsApp <span className="text-tinta-suave font-normal">(opcional)</span>
        </Label>
        <Input
          id={id("telefone")}
          name="telefone"
          type="tel"
          inputMode="tel"
          placeholder="(19) 99876-5432"
          defaultValue={valores.telefone ?? ""}
          autoComplete="off"
          aria-invalid={erros.telefone ? true : undefined}
          aria-describedby={erros.telefone ? id("erro-telefone") : undefined}
          className="bg-card h-10 font-mono"
        />
        {erros.telefone && (
          <p id={id("erro-telefone")} className="text-destructive text-sm">
            {erros.telefone}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label aria-hidden className="invisible hidden sm:flex">
          &nbsp;
        </Label>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={enviando} className="h-10 px-4">
            {enviando ? rotuloEnviando : rotuloEnviar}
          </Button>
          {aoCancelar && (
            <Button type="button" variant="ghost" onClick={aoCancelar} className="h-10">
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {estado.erroGeral && (
        <p role="alert" className="text-destructive text-sm sm:basis-full">
          {estado.erroGeral}
        </p>
      )}
    </form>
  );
}
