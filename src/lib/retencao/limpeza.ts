import "server-only";

import { prisma } from "@/lib/prisma";

import { limiteRetencao } from "./prazo";

// Rodada diária (cron da Vercel, /api/cron/limpeza):
// 1. Festas com mais de 90 dias: guarda as contagens e apaga os convidados.
//    Fornecedores, mesas, cronograma e planta continuam (não são dados de convidados).
// 2. Sessões vencidas e tentativas de login antigas.
export async function limparDadosAntigos(agora = new Date()) {
  const festas = await prisma.festa.findMany({
    where: { dataHora: { lt: limiteRetencao(agora) }, convidadosApagadosEm: null },
    select: { id: true },
  });

  let convidadosApagados = 0;
  for (const { id } of festas) {
    const [total, confirmados, presentes] = await Promise.all([
      prisma.convidado.count({ where: { festaId: id } }),
      prisma.convidado.count({ where: { festaId: id, rsvp: "CONFIRMADO" } }),
      prisma.convidado.count({ where: { festaId: id, presenteEm: { not: null } } }),
    ]);
    const [, apagados] = await prisma.$transaction([
      prisma.festa.update({
        where: { id },
        data: {
          convidadosApagadosEm: agora,
          resumoConvidados: total,
          resumoConfirmados: confirmados,
          resumoPresentes: presentes,
        },
      }),
      prisma.convidado.deleteMany({ where: { festaId: id } }),
    ]);
    convidadosApagados += apagados.count;
  }

  const [sessoes, tentativas] = await Promise.all([
    prisma.sessao.deleteMany({ where: { expiraEm: { lt: agora } } }),
    prisma.tentativaLogin.deleteMany({
      where: { criadoEm: { lt: new Date(agora.getTime() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    festas: festas.length,
    convidadosApagados,
    sessoesVencidas: sessoes.count,
    tentativasAntigas: tentativas.count,
  };
}
