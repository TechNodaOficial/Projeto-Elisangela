"use server";

import { revalidatePath } from "next/cache";

import { exigirUsuario } from "@/lib/dal";
import { novoAcessoPortaria } from "@/lib/portaria/sessao";
import { prisma } from "@/lib/prisma";

// Gera (ou troca) o link e o PIN da portaria. Trocar derruba os ajudantes já conectados:
// quem tinha o link antigo precisa do novo.
export async function gerarPortaria(festaId: string) {
  await exigirUsuario();
  await prisma.$transaction([
    prisma.sessaoPortaria.deleteMany({ where: { festaId } }),
    prisma.festa.updateMany({ where: { id: festaId }, data: novoAcessoPortaria() }),
  ]);
  revalidatePath("/painel/festas/[id]", "layout");
}

// Cancela o link: ninguém mais entra, e quem estava no leitor perde o acesso.
export async function cancelarPortaria(festaId: string) {
  await exigirUsuario();
  await prisma.$transaction([
    prisma.sessaoPortaria.deleteMany({ where: { festaId } }),
    prisma.festa.updateMany({
      where: { id: festaId },
      data: { portariaToken: null, portariaPin: null },
    }),
  ]);
  revalidatePath("/painel/festas/[id]", "layout");
}
