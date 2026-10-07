import Link from "next/link";

import { cn } from "@/lib/utils";

// Duas abas da base: os fornecedores e os serviços (com o modelo de checklist).
export function AbasFornecedores({ atual }: { atual: "fornecedores" | "servicos" }) {
  const abas = [
    { id: "fornecedores", href: "/painel/fornecedores", rotulo: "Fornecedores" },
    { id: "servicos", href: "/painel/fornecedores/servicos", rotulo: "Serviços e checklists" },
  ] as const;

  return (
    <nav aria-label="Base de fornecedores" className="border-border mb-6 flex gap-1 border-b">
      {abas.map((aba) => (
        <Link
          key={aba.id}
          href={aba.href}
          aria-current={aba.id === atual ? "page" : undefined}
          className={cn(
            "focus-visible:outline-ring -mb-px rounded-t-sm border-b-2 px-3 py-2 text-sm focus-visible:outline-2",
            aba.id === atual
              ? "border-foreground font-semibold"
              : "text-tinta-suave hover:text-foreground border-transparent",
          )}
        >
          {aba.rotulo}
        </Link>
      ))}
    </nav>
  );
}
