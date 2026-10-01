"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { NOME_COOKIE_SESSAO } from "@/lib/auth/constantes";
import { encerrarSessao } from "@/lib/auth/sessao";

export async function sair() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_COOKIE_SESSAO)?.value;

  if (token) {
    await encerrarSessao(token);
  }
  cookieStore.delete(NOME_COOKIE_SESSAO);

  redirect("/login");
}
