"use server";

import { redirect } from "next/navigation";

import { registrarErroConvite } from "@/lib/convites/limite";
import { obterIp } from "@/lib/ip";
import { pinValido, situacaoPortaria } from "@/lib/portaria/janela";
import { pinBloqueado, registrarErroPin } from "@/lib/portaria/limite";
import { criarSessaoPortaria, festaDaPortaria, pinConfere } from "@/lib/portaria/sessao";

export type EstadoPin = { erro?: string };

// Ação pública: o link é da festa, e o PIN (falado pela Elisangela) confirma o ajudante.
export async function entrarPortaria(
  token: string,
  _e: EstadoPin,
  formData: FormData,
): Promise<EstadoPin> {
  const ip = await obterIp();
  if (await pinBloqueado(ip, token)) {
    return {
      erro: "Muitas tentativas. Espere 15 minutos ou peça o PIN de novo para a Elisangela.",
    };
  }
  const festa = await festaDaPortaria(token);
  if (!festa?.portariaPin) {
    await registrarErroConvite(ip);
    return { erro: "Este link da portaria não vale mais. Peça um novo para a Elisangela." };
  }
  if (situacaoPortaria(festa.dataHora) !== "aberta") {
    return { erro: "A portaria desta festa não está aberta agora." };
  }

  const pin = String(formData.get("pin") ?? "").trim();
  if (!pinValido(pin) || !pinConfere(festa.portariaPin, pin)) {
    await registrarErroPin(ip, token);
    return { erro: "PIN errado. Confira com a Elisangela." };
  }

  await criarSessaoPortaria(festa.id, festa.dataHora);
  redirect(`/portaria/${token}`);
}
