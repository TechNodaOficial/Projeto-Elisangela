import Image from "next/image";
import Link from "next/link";

// Logo da Elisangela Schubert (dourado sobre transparente, recortado de logo.jpeg).
// logo-160.png tem 160px de altura: nítida até 80px na tela (telas 2x).
export function MarcaLogo({ className, prioridade }: { className?: string; prioridade?: boolean }) {
  return (
    <Image
      src="/logo-160.png"
      alt="Elisangela Schubert · Assessoria e produção em eventos"
      width={350}
      height={160}
      priority={prioridade}
      className={className}
    />
  );
}

// Faixa creme no topo das páginas públicas (convite, portaria): o dourado da logo some
// sobre a mesa caqui ou cinza, então ela fica sempre sobre o papel, como no logo original.
export function FaixaLogo({ className }: { className?: string }) {
  return (
    <div className="bg-card border-border flex justify-center border-b px-4 py-3">
      <MarcaLogo prioridade className={className} />
    </div>
  );
}

// Logo no topo do painel: leva às festas pendentes.
export function Logo() {
  return (
    <Link
      href="/painel"
      aria-label="Elisangela Schubert, ir para as festas pendentes"
      className="focus-visible:outline-ring flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <MarcaLogo prioridade className="h-10 w-auto" />
    </Link>
  );
}
