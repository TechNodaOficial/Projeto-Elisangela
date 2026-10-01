import { MapPin, Plus } from "lucide-react";
import Link from "next/link";

import { diasAte, partesData, rotuloProximidade } from "@/lib/datas";
import type { FestaResumo } from "@/lib/festas/consultas";

// Classes comuns: o texto assenta nas pautas (line-height = altura da pauta)
// e começa depois da linha de margem.
const FOLHA =
  "folha group focus-visible:outline-ring block pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha) transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_1px_1px_oklch(0.2_0.01_250/6%),0_14px_28px_-12px_oklch(0.2_0.01_250/30%)] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const URGENTE_ATE_DIAS = 7;

// "31 de 48 confirmados", com os números em destaque.
function Fracao({ parte, total, rotulo }: { parte: number; total: number; rotulo: string }) {
  return (
    <>
      <strong className="text-foreground font-semibold">{parte}</strong> de{" "}
      <strong className="text-foreground font-semibold">{total}</strong> {rotulo}
    </>
  );
}

function contagem(festa: FestaResumo, concluida: boolean) {
  if (concluida) {
    return festa.confirmados === 0
      ? { conteudo: "Sem confirmações" }
      : {
          conteudo: <Fracao parte={festa.presentes} total={festa.confirmados} rotulo="presentes" />,
        };
  }
  return festa.totalConvidados === 0
    ? { conteudo: "Nenhum convidado ainda" }
    : {
        conteudo: (
          <Fracao parte={festa.confirmados} total={festa.totalConvidados} rotulo="confirmados" />
        ),
      };
}

export function FolhaFesta({ festa, concluida }: { festa: FestaResumo; concluida: boolean }) {
  const data = partesData(festa.dataHora);
  const dias = diasAte(festa.dataHora);
  const urgente = !concluida && dias <= URGENTE_ATE_DIAS;
  const linhaFinal = contagem(festa, concluida);

  return (
    <Link href={`/painel/festas/${festa.id}`} className={FOLHA}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="font-mono text-[2.75rem] leading-[calc(var(--linha)*2)] font-medium tracking-[-0.04em]">
            {data.dia}
          </span>
          <span className="flex flex-col text-[0.8125rem] uppercase">
            <span className="font-semibold tracking-[0.04em]">{data.mes}</span>
            <span className="text-tinta-suave tracking-[0.04em]">{data.semana}</span>
          </span>
        </div>
        <div className="flex flex-col items-end text-[0.8125rem]">
          <span className="font-mono">{data.hora}</span>
          <span className={urgente ? "grifo font-semibold" : "text-tinta-suave"}>
            {rotuloProximidade(dias)}
          </span>
        </div>
      </div>

      <h2 className="line-clamp-2 min-h-[calc(var(--linha)*2)] text-[1.0625rem] font-semibold tracking-[-0.01em] text-balance">
        {festa.titulo}
      </h2>
      <p className="text-tinta-suave flex items-center gap-1.5 text-sm leading-(--linha)">
        <MapPin aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{festa.localNome}</span>
      </p>
      <p className="text-tinta-suave text-sm leading-(--linha)">{linhaFinal.conteudo}</p>
    </Link>
  );
}

// A folha em branco do topo da pilha: é o botão de nova festa.
export function FolhaNovaFesta() {
  return (
    <Link
      href="/painel/festas/nova"
      className={`${FOLHA} flex min-h-[calc(var(--linha)*4)] flex-col justify-center sm:min-h-[calc(var(--linha)*8)]`}
    >
      <span className="flex items-center gap-3">
        <span className="border-foreground flex size-8 shrink-0 items-center justify-center rounded-full border">
          <Plus aria-hidden className="size-4" strokeWidth={2} />
        </span>
        <span className="flex flex-col">
          <span className="text-[1.0625rem] font-semibold">
            <span className="grifo-ao-passar">Nova festa</span>
          </span>
          <span className="text-tinta-suave text-sm leading-(--linha)">
            Folha em branco para cadastrar
          </span>
        </span>
      </span>
    </Link>
  );
}

export function GradeFolhas({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(17.5rem,1fr))] sm:gap-6">
      {children}
    </div>
  );
}

export function CabecalhoSecao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1 md:mb-8">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{titulo}</h1>
      <p className="text-tinta-suave text-sm">{descricao}</p>
    </div>
  );
}
