"use client";

import { useEffect } from "react";

import { registrarAbertura } from "./actions";

// Avisa o painel que o convidado abriu o link. Roda só no navegador: a prévia que o
// WhatsApp monta ao enviar a mensagem não executa JavaScript e não conta como abertura.
export function RegistrarAbertura({ token }: { token: string }) {
  useEffect(() => {
    void registrarAbertura(token);
  }, [token]);
  return null;
}
