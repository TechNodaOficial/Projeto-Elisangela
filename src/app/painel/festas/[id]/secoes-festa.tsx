"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// As partes do quadro da festa, na mesma ordem das raias.
const SECOES = [
  { href: "fornecedores", titulo: "Fornecedores" },
  { href: "cronograma", titulo: "Cronograma e menu" },
  { href: "convidados", titulo: "Convidados" },
  { href: "croqui", titulo: "Croqui" },
  { href: "mesas", titulo: "Layout" },
  { href: "cerimonial", titulo: "Cerimonial" },
  { href: "entradas", titulo: "Entradas" },
  { href: "padrinhos", titulo: "Padrinhos" },
];

// Atalho entre as partes da festa: pular de Fornecedores para Convidados sem voltar ao quadro.
// No celular rola de lado, com a parte atual à vista.
export function SecoesFesta({ festaId }: { festaId: string }) {
  const atual = usePathname().split("/")[4];
  const ativoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    ativoRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [atual]);

  return (
    <nav aria-label="Partes da festa" className="-mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="bg-muted flex w-max gap-0.5 rounded-lg p-0.5">
        {SECOES.map((s) => {
          const ativo = s.href === atual;
          return (
            <li key={s.href}>
              <Link
                ref={ativo ? ativoRef : undefined}
                href={`/painel/festas/${festaId}/${s.href}`}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "focus-visible:outline-ring flex h-9 items-center rounded-md px-3 text-sm whitespace-nowrap focus-visible:outline-2",
                  ativo
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-tinta-suave hover:text-foreground hover:bg-card/60",
                )}
              >
                {s.titulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
