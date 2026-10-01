import Link from "next/link";

// Logo provisória em texto. Quando existir o arquivo da logo, troque o conteúdo
// do Link por um <Image> e mantenha o aria-label.
export function Logo() {
  return (
    <Link
      href="/painel"
      aria-label="Elisangela Eventos, ir para as festas pendentes"
      className="focus-visible:outline-ring flex items-baseline gap-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">Elisangela</span>
      <span className="text-tinta-suave text-sm">Eventos</span>
    </Link>
  );
}
