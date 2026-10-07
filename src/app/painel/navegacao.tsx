"use client";

import { Archive, CalendarClock, Handshake, LogOut, ScanLine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { sair } from "./actions";

type Item = {
  href: string;
  rotulo: string;
  curto: string;
  icone: LucideIcon;
  contagem?: number;
  ativo: (caminho: string) => boolean;
};

function itens(contagens: { pendentes: number; concluidas: number }): Item[] {
  return [
    {
      href: "/painel",
      rotulo: "Festas pendentes",
      curto: "Pendentes",
      icone: CalendarClock,
      contagem: contagens.pendentes,
      ativo: (c) => c === "/painel" || c.startsWith("/painel/festas"),
    },
    {
      href: "/painel/concluidas",
      rotulo: "Festas concluídas",
      curto: "Concluídas",
      icone: Archive,
      contagem: contagens.concluidas,
      ativo: (c) => c.startsWith("/painel/concluidas"),
    },
    {
      href: "/painel/fornecedores",
      rotulo: "Fornecedores",
      curto: "Fornecedores",
      icone: Handshake,
      ativo: (c) => c.startsWith("/painel/fornecedores"),
    },
    {
      href: "/painel/checkin",
      rotulo: "Leitor QR Code",
      curto: "Leitor QR",
      icone: ScanLine,
      ativo: (c) => c.startsWith("/painel/checkin"),
    },
  ];
}

// Índice pautado na lateral (computador).
export function NavegacaoLateral({
  contagens,
  nome,
}: {
  contagens: { pendentes: number; concluidas: number };
  nome: string;
}) {
  const caminho = usePathname();

  return (
    <nav aria-label="Seções" className="flex h-full flex-col">
      <ul className="border-pauta border-t">
        {itens(contagens).map((item) => {
          const ativo = item.ativo(caminho);
          const Icone = item.icone;
          return (
            <li key={item.href} className="border-pauta border-b">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "group focus-visible:outline-ring flex h-11 items-center gap-3 px-2 text-[0.9375rem] focus-visible:outline-2 focus-visible:-outline-offset-2",
                  ativo ? "font-semibold" : "text-tinta-suave hover:text-foreground",
                )}
              >
                <Icone aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
                <span className={ativo ? "grifo" : "grifo-ao-passar"}>{item.rotulo}</span>
                {item.contagem !== undefined && (
                  <span className="ml-auto font-mono text-[0.8125rem] font-normal">
                    {item.contagem}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <form action={sair} className="mt-auto flex items-center justify-between gap-2 px-2 pt-6">
        <span className="text-tinta-suave truncate text-sm">{nome}</span>
        <button
          type="submit"
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring flex items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
          Sair
        </button>
      </form>
    </nav>
  );
}

// Barra inferior com as quatro seções (celular).
export function NavegacaoInferior({
  contagens,
}: {
  contagens: { pendentes: number; concluidas: number };
}) {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Seções"
      className="bg-card border-border fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {itens(contagens).map((item) => {
          const ativo = item.ativo(caminho);
          const Icone = item.icone;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "focus-visible:outline-ring flex h-16 flex-col items-center justify-center gap-1 text-xs focus-visible:outline-2 focus-visible:-outline-offset-4",
                  ativo ? "font-semibold" : "text-tinta-suave",
                )}
              >
                <Icone aria-hidden className="size-5" strokeWidth={1.75} />
                <span className={ativo ? "grifo" : undefined}>{item.curto}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// No celular, sair fica no fim da página, longe dos toques frequentes.
export function BotaoSairRodape({ nome }: { nome: string }) {
  return (
    <form
      action={sair}
      className="border-pauta mt-12 flex items-center justify-between gap-2 border-t pt-4 md:hidden"
    >
      <span className="text-tinta-suave truncate text-sm">{nome}</span>
      <button
        type="submit"
        className="text-tinta-suave hover:text-foreground focus-visible:outline-ring flex h-10 items-center gap-1.5 rounded-sm px-2 text-sm focus-visible:outline-2"
      >
        <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
        Sair
      </button>
    </form>
  );
}
