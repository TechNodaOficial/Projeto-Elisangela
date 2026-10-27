import "server-only";

import { diaVizinho } from "@/lib/calendario";
import { exigirUsuario } from "@/lib/dal";
import { paraCampos, paraInstante } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

// Compromissos que começam entre dois instantes (início incluso, fim não), por horário.
export async function listarCompromissosNoPeriodo(inicio: Date, fim: Date) {
  await exigirUsuario();
  return prisma.compromisso.findMany({
    where: { inicio: { gte: inicio, lt: fim } },
    orderBy: { inicio: "asc" },
  });
}

export type Compromisso = Awaited<ReturnType<typeof listarCompromissosNoPeriodo>>[number];

// Quantos compromissos estão marcados para hoje (em São Paulo), para o menu.
export async function contarCompromissosDeHoje(agora = new Date()) {
  await exigirUsuario();
  const hoje = paraCampos(agora).data;
  return prisma.compromisso.count({
    where: {
      inicio: { gte: paraInstante(hoje, "00:00"), lt: paraInstante(diaVizinho(hoje, 1), "00:00") },
    },
  });
}
