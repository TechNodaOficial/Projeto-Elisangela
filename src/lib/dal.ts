import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { NOME_COOKIE_SESSAO } from "@/lib/auth/constantes";
import { buscarSessaoValida } from "@/lib/auth/sessao";

// Camada de acesso a dados: a verificação de sessão de verdade (no banco) acontece aqui.
// O proxy só faz uma checagem rápida pela presença do cookie.
// cache() evita repetir a consulta quando layout e página verificam no mesmo request.

export const obterUsuarioLogado = cache(async () => {
  const token = (await cookies()).get(NOME_COOKIE_SESSAO)?.value;
  return token ? buscarSessaoValida(token) : null;
});

// Use em toda página, server action e route handler do painel.
export async function exigirUsuario() {
  const usuario = await obterUsuarioLogado();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}
