"use server";

import { revalidatePath } from "next/cache";

import { ehHeic, nomeDoAnexo, TAMANHO_MAXIMO_ANEXO, tipoDoAnexo } from "@/lib/anexos/arquivo";
import { apagarAnexos, guardarAnexo } from "@/lib/anexos/blob";
import { exigirUsuario } from "@/lib/dal";
import { ehSecaoObservacao } from "@/lib/festas/observacoes";
import { prisma } from "@/lib/prisma";

// Um arquivo por chamada: vários juntos passariam do teto de 4,5 MB por requisição da Vercel.
// A tela manda um de cada vez quando ela escolhe vários.
export async function enviarAnexo(
  festaId: string,
  secao: string,
  formData: FormData,
): Promise<{ erro?: string }> {
  await exigirUsuario();
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha o arquivo." };
  if (arquivo.size > TAMANHO_MAXIMO_ANEXO) {
    return { erro: `${arquivo.name}: grande demais (máximo 4 MB).` };
  }
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const tipo = tipoDoAnexo(bytes, arquivo.name);
  if (!tipo) {
    return {
      erro: ehHeic(bytes)
        ? `${arquivo.name}: foto do iPhone (HEIC). Mande como JPG: no iPhone, Ajustes › Câmera › Formatos › Mais Compatível.`
        : `${arquivo.name}: envie PDF, foto (JPG ou PNG), Word ou Excel.`,
    };
  }
  if (!ehSecaoObservacao(secao) || !(await prisma.festa.count({ where: { id: festaId } }))) {
    return { erro: "Esta festa não existe mais. Recarregue a página." };
  }

  const url = await guardarAnexo(festaId, bytes, tipo);
  await prisma.anexo.create({
    data: {
      festaId,
      secao,
      url,
      nome: nomeDoAnexo(arquivo.name, tipo),
      tipo,
      tamanho: bytes.byteLength,
    },
  });
  revalidatePath(`/painel/festas/${festaId}`, "layout");
  return {};
}

export async function removerAnexo(id: string) {
  await exigirUsuario();
  const atual = await prisma.anexo.findUnique({
    where: { id },
    select: { festaId: true, url: true },
  });
  if (!atual) return;
  await prisma.anexo.deleteMany({ where: { id } });
  await apagarAnexos([atual.url]);
  revalidatePath(`/painel/festas/${atual.festaId}`, "layout");
}
