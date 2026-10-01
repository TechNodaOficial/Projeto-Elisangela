import "server-only";

import { inicioDeHoje } from "@/lib/datas";
import { exigirUsuario } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type StatusLista = "pendentes" | "concluidas";

// Pendentes: da mais próxima para a mais distante. Concluídas: da mais recente para a mais antiga.
export async function listarFestas(status: StatusLista) {
  await exigirUsuario();
  const hoje = inicioDeHoje();

  const festas = await prisma.festa.findMany({
    where: status === "pendentes" ? { dataHora: { gte: hoje } } : { dataHora: { lt: hoje } },
    orderBy: { dataHora: status === "pendentes" ? "asc" : "desc" },
    select: {
      id: true,
      titulo: true,
      dataHora: true,
      localNome: true,
      _count: { select: { convidados: true } },
    },
  });

  const ids = festas.map((f) => f.id);
  const [confirmados, presentes] = await Promise.all([
    prisma.convidado.groupBy({
      by: ["festaId"],
      where: { festaId: { in: ids }, rsvp: "CONFIRMADO" },
      _count: { _all: true },
    }),
    prisma.convidado.groupBy({
      by: ["festaId"],
      where: { festaId: { in: ids }, presenteEm: { not: null } },
      _count: { _all: true },
    }),
  ]);
  const porFesta = (linhas: { festaId: string; _count: { _all: number } }[]) =>
    new Map(linhas.map((l) => [l.festaId, l._count._all]));
  const confirmadosPorFesta = porFesta(confirmados);
  const presentesPorFesta = porFesta(presentes);

  return festas.map(({ _count, ...festa }) => ({
    ...festa,
    totalConvidados: _count.convidados,
    confirmados: confirmadosPorFesta.get(festa.id) ?? 0,
    presentes: presentesPorFesta.get(festa.id) ?? 0,
  }));
}

export type FestaResumo = Awaited<ReturnType<typeof listarFestas>>[number];

export async function contarFestas() {
  await exigirUsuario();
  const hoje = inicioDeHoje();
  const [pendentes, concluidas] = await Promise.all([
    prisma.festa.count({ where: { dataHora: { gte: hoje } } }),
    prisma.festa.count({ where: { dataHora: { lt: hoje } } }),
  ]);
  return { pendentes, concluidas };
}

export async function buscarFesta(id: string) {
  await exigirUsuario();
  return prisma.festa.findUnique({ where: { id } });
}
