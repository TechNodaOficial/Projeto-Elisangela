import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import { estaBloqueado, limparFalhas, registrarFalha } from "./limite-login";
import { criarSessao } from "./sessao";

// Hash de um segredo aleatório descartado. Quando o e-mail não existe, comparamos
// com ele para a resposta demorar o mesmo tempo e não revelar quais e-mails existem.
const HASH_FICTICIO = "$2b$12$RHVjNMssB8Ej5eWm8T7iu.V2n/SK.gpuMidBA4nN1ubVNJKFJjf6S";

export type ResultadoAutenticacao =
  { ok: true; token: string; expiraEm: Date } | { ok: false; motivo: "credenciais" | "bloqueado" };

export async function autenticar(dados: {
  email: string;
  senha: string;
  ip: string;
}): Promise<ResultadoAutenticacao> {
  const email = dados.email.trim().toLowerCase();

  if (await estaBloqueado(email, dados.ip)) {
    return { ok: false, motivo: "bloqueado" };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, senhaHash: true },
  });
  const senhaConfere = await bcrypt.compare(dados.senha, usuario?.senhaHash ?? HASH_FICTICIO);

  if (!usuario || !senhaConfere) {
    await registrarFalha(email, dados.ip);
    return { ok: false, motivo: "credenciais" };
  }

  await limparFalhas(email);
  const { token, expiraEm } = await criarSessao(usuario.id);
  return { ok: true, token, expiraEm };
}
