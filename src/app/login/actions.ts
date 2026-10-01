"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { autenticar } from "@/lib/auth/autenticar";
import { NOME_COOKIE_SESSAO } from "@/lib/auth/constantes";
import { destinoSeguro } from "@/lib/auth/destino";

export type EstadoLogin = { erro?: string; email?: string };

const SchemaLogin = z.object({
  email: z.email().max(254),
  senha: z.string().min(1).max(200),
});

async function obterIp() {
  // Na Vercel, o primeiro item do x-forwarded-for é o IP real do cliente.
  const lista = (await headers()).get("x-forwarded-for");
  return lista?.split(",")[0]?.trim() || "desconhecido";
}

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "");
  const dados = SchemaLogin.safeParse({ email, senha: formData.get("senha") });
  if (!dados.success) {
    return { erro: "Informe um e-mail válido e a senha.", email };
  }

  const resultado = await autenticar({ ...dados.data, ip: await obterIp() });
  if (!resultado.ok) {
    return {
      erro:
        resultado.motivo === "bloqueado"
          ? "Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo."
          : "E-mail ou senha incorretos.",
      email,
    };
  }

  (await cookies()).set(NOME_COOKIE_SESSAO, resultado.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: resultado.expiraEm,
  });

  redirect(destinoSeguro(formData.get("de")));
}
