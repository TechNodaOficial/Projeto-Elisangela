"use server";

import { revalidatePath } from "next/cache";

import { avaliarLeitura, type ResultadoLeitura } from "@/lib/checkin/avaliar";
import { convidadoPorCodigo, convidadoPorId } from "@/lib/checkin/consultas";
import { pareceToken } from "@/lib/convites/estado";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

function atualizar(festaId: string) {
  revalidatePath("/painel/checkin");
  revalidatePath(`/painel/festas/${festaId}`);
}

// Registra a entrada se a regra liberar. O update só acontece se o convidado ainda não
// entrou: com dois celulares na porta, o segundo a ler o mesmo QR vê "Já entrou".
async function registrar(
  festaId: string,
  buscar: () => ReturnType<typeof convidadoPorId>,
  opcoes?: { deixarEntrar?: boolean },
): Promise<ResultadoLeitura> {
  const resultado = avaliarLeitura(await buscar(), festaId, opcoes);
  if (resultado.tipo !== "liberado") return resultado;

  const { count } = await prisma.convidado.updateMany({
    where: { id: resultado.id, festaId, presenteEm: null },
    data: { presenteEm: new Date() },
  });
  if (count === 0) return avaliarLeitura(await buscar(), festaId, opcoes);
  atualizar(festaId);
  return resultado;
}

// O QR leva só o código de check-in (src/lib/convites/qr.ts).
export async function lerQr(festaId: string, codigo: string): Promise<ResultadoLeitura> {
  await exigirUsuario();
  const limpo = codigo.trim();
  if (!pareceToken(limpo)) return { tipo: "desconhecido" };
  return registrar(festaId, () => convidadoPorCodigo(limpo));
}

// Busca pelo nome, ou "Deixar entrar" na tela de atenção.
export async function registrarConvidado(
  festaId: string,
  convidadoId: string,
  deixarEntrar: boolean,
): Promise<ResultadoLeitura> {
  await exigirUsuario();
  return registrar(festaId, () => convidadoPorId(convidadoId), { deixarEntrar });
}

// Para corrigir uma entrada registrada por engano.
export async function desfazerEntrada(festaId: string, convidadoId: string) {
  await exigirUsuario();
  await prisma.convidado.updateMany({
    where: { id: convidadoId, festaId },
    data: { presenteEm: null },
  });
  atualizar(festaId);
}
