"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CamposFesta } from "@/lib/festas/schema";
import { cn } from "@/lib/utils";

import type { EstadoFormFesta } from "./actions";

type Props = {
  acao: (estado: EstadoFormFesta, formData: FormData) => Promise<EstadoFormFesta>;
  inicial?: Partial<CamposFesta>;
  rotuloEnviar: string;
  voltarPara: string;
};

export function FormularioFesta({ acao, inicial = {}, rotuloEnviar, voltarPara }: Props) {
  const [estado, enviar, enviando] = useActionState(acao, {});
  const valores = { ...inicial, ...estado.valores };
  const erros = estado.erros ?? {};

  // Um campo com rótulo, mensagem de erro ligada por aria-describedby e valor preservado.
  const campo = (
    nome: keyof CamposFesta,
    rotulo: string,
    props: React.ComponentProps<typeof Input> = {},
    opcional = false,
  ) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={nome}>
        {rotulo}
        {opcional && <span className="text-tinta-suave font-normal">(opcional)</span>}
      </Label>
      <Input
        id={nome}
        name={nome}
        defaultValue={valores[nome] ?? ""}
        aria-invalid={erros[nome] ? true : undefined}
        aria-describedby={erros[nome] ? `erro-${nome}` : undefined}
        required={!opcional}
        className="bg-card h-10"
        {...props}
      />
      {erros[nome] && (
        <p id={`erro-${nome}`} className="text-destructive text-sm">
          {erros[nome]}
        </p>
      )}
    </div>
  );

  return (
    <form action={enviar} noValidate className="flex flex-col gap-5">
      {estado.erroGeral && (
        <p role="alert" className="text-destructive text-sm font-medium">
          {estado.erroGeral}
        </p>
      )}

      {campo("titulo", "Nome da festa", {
        placeholder: "Ex.: Casamento Ana e João",
        maxLength: 120,
        autoFocus: true,
      })}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {campo("data", "Data", { type: "date", className: "bg-card h-10 font-mono" })}
        {campo("hora", "Horário", { type: "time", className: "bg-card h-10 font-mono" })}
      </div>

      {campo("localNome", "Local", {
        placeholder: "Ex.: Espaço Jardim das Flores",
        maxLength: 120,
      })}
      {campo("endereco", "Endereço", { maxLength: 200, autoComplete: "street-address" })}
      {campo("traje", "Traje", { placeholder: "Ex.: Esporte fino", maxLength: 80 }, true)}

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoes">
          Observações <span className="text-tinta-suave font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={4}
          maxLength={1000}
          defaultValue={valores.observacoes ?? ""}
          aria-invalid={erros.observacoes ? true : undefined}
          aria-describedby={erros.observacoes ? "erro-observacoes" : undefined}
          className="bg-card"
        />
        {erros.observacoes && (
          <p id="erro-observacoes" className="text-destructive text-sm">
            {erros.observacoes}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={enviando} className="h-10 px-5">
          {enviando ? "Salvando…" : rotuloEnviar}
        </Button>
        <Link
          href={voltarPara}
          className={cn(
            "text-tinta-suave hover:text-foreground focus-visible:outline-ring self-center rounded-sm px-2 text-sm underline-offset-4 hover:underline focus-visible:outline-2",
            enviando && "pointer-events-none opacity-50",
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
