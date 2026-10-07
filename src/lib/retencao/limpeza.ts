import "server-only";

import { apagarContratos } from "@/lib/contratos/blob";
import { apagarFoto } from "@/lib/festas/foto";
import { apagarPlanta } from "@/lib/planta/blob";
import { prisma } from "@/lib/prisma";

import { limiteArquivo, limiteRetencao } from "./prazo";

// Rodada diária (cron da Vercel, /api/cron/limpeza):
// 1. Festas que já podem ser arquivadas (ver prazo.ts: 30 dias com o PDF completo
//    baixado, 90 dias de qualquer jeito): guarda as contagens e apaga todos os dados da
//    festa e os arquivos (contratos, planta, foto). Fica só o cartão: nome, data, local e
//    os números. A base geral de fornecedores não é da festa e continua.
// 2. Sessões vencidas e tentativas de login antigas.
export async function limparDadosAntigos(agora = new Date()) {
  const festas = await prisma.festa.findMany({
    where: {
      convidadosApagadosEm: null,
      OR: [
        { dataHora: { lt: limiteRetencao(agora) } },
        { dataHora: { lt: limiteArquivo(agora) }, pdfCompletoEm: { not: null } },
      ],
    },
    select: {
      id: true,
      plantaUrl: true,
      fotoUrl: true,
      contratacoes: { select: { contratoUrl: true } },
    },
  });

  let convidadosApagados = 0;
  for (const festa of festas) {
    const id = festa.id;
    // Em pessoas: um convite pode ser de uma família inteira.
    const [todos, confirmados] = await Promise.all([
      prisma.convidado.aggregate({
        where: { festaId: id },
        _sum: { pessoas: true, entraram: true },
      }),
      prisma.convidado.aggregate({
        where: { festaId: id, rsvp: "CONFIRMADO" },
        _sum: { confirmadas: true },
      }),
    ]);
    const [, apagados] = await prisma.$transaction([
      prisma.festa.update({
        where: { id },
        data: {
          convidadosApagadosEm: agora,
          resumoConvidados: todos._sum.pessoas ?? 0,
          resumoConfirmados: confirmados._sum.confirmadas ?? 0,
          resumoPresentes: todos._sum.entraram ?? 0,
          // O cartão fica com nome, data, local, endereço e traje; o resto sai.
          observacoes: null,
          plantaUrl: null,
          plantaLargura: null,
          plantaAltura: null,
          fotoUrl: null,
          portariaToken: null,
          portariaPin: null,
        },
      }),
      prisma.sessaoPortaria.deleteMany({ where: { festaId: id } }),
      prisma.convidado.deleteMany({ where: { festaId: id } }),
      prisma.padrinho.deleteMany({ where: { festaId: id } }),
      // Checklists e itens de padrinho saem junto (cascade).
      prisma.contratacao.deleteMany({ where: { festaId: id } }),
      prisma.itemCronograma.deleteMany({ where: { festaId: id } }),
      prisma.mesa.deleteMany({ where: { festaId: id } }),
      prisma.itemMenu.deleteMany({ where: { festaId: id } }),
      prisma.entradaCerimonia.deleteMany({ where: { festaId: id } }),
      prisma.observacao.deleteMany({ where: { festaId: id } }),
    ]);
    convidadosApagados += apagados.count;

    // Arquivos no Blob: depois do banco (se falhar, sobra só um arquivo órfão, sem link).
    await apagarContratos(festa.contratacoes.map((c) => c.contratoUrl));
    await apagarPlanta(festa.plantaUrl);
    await apagarFoto(festa.fotoUrl);
  }

  const [sessoes, tentativas] = await Promise.all([
    prisma.sessao.deleteMany({ where: { expiraEm: { lt: agora } } }),
    prisma.tentativaLogin.deleteMany({
      where: { criadoEm: { lt: new Date(agora.getTime() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  await prisma.sessaoPortaria.deleteMany({ where: { expiraEm: { lt: agora } } });

  return {
    festas: festas.length,
    convidadosApagados,
    sessoesVencidas: sessoes.count,
    tentativasAntigas: tentativas.count,
  };
}
