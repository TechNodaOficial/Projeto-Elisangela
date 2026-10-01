import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Folha lisa (sem pautas) que envolve os formulários de festa.
export function FolhaFormulario({
  titulo,
  voltarPara,
  rotuloVoltar,
  children,
}: {
  titulo: string;
  voltarPara: string;
  rotuloVoltar: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-2xl">
      <Link
        href={voltarPara}
        className="text-tinta-suave hover:text-foreground focus-visible:outline-ring mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm focus-visible:outline-2"
      >
        <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
        {rotuloVoltar}
      </Link>
      <div className="folha folha-lisa py-8 pr-5 pl-[calc(var(--margem)+0.875rem)] sm:pr-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-[-0.02em]">{titulo}</h1>
        {children}
      </div>
    </div>
  );
}
