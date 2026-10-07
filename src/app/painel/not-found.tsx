import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="folha folha-lisa flex w-full max-w-xl items-start gap-3 px-6 py-6">
      <FileQuestion aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold">Festa não encontrada</h1>
        <p className="text-tinta-suave text-sm">
          Ela pode ter sido excluída, ou o endereço está incompleto.
        </p>
        <Link
          href="/painel"
          className="focus-visible:outline-ring mt-3 inline-flex items-center gap-1.5 self-start rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
          Voltar para as festas pendentes
        </Link>
      </div>
    </div>
  );
}
