"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { entrarPortaria, type EstadoPin } from "./actions";

export function FormPin({ token }: { token: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoPin, FormData>(
    entrarPortaria.bind(null, token),
    {},
  );
  return (
    <form action={enviar} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pin">PIN de 4 números</Label>
        <Input
          id="pin"
          name="pin"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{4}"
          maxLength={4}
          required
          autoFocus
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-pin" : undefined}
          className="bg-card h-14 text-center font-mono text-3xl tracking-[0.5em]"
        />
      </div>
      {estado.erro && (
        <p id="erro-pin" role="alert" className="text-destructive text-sm">
          {estado.erro}
        </p>
      )}
      <Button type="submit" disabled={enviando} className="h-12 text-base">
        {enviando ? "Conferindo…" : "Abrir o leitor"}
      </Button>
    </form>
  );
}
