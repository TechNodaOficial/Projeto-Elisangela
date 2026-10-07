// Ícones do Instagram e do WhatsApp no mesmo traço dos ícones do lucide (que não tem
// marcas). Sempre acompanhados do nome escrito: o desenho só reforça.

type Props = { className?: string };

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconeInstagram({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...traco}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconeWhatsApp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...traco}>
      {/* Balão com a ponta embaixo à esquerda, como o do WhatsApp. */}
      <path d="M3.5 20.5 4.8 16.4A8.5 8.5 0 1 1 7.7 19.2Z" />
      {/* Telefone dentro do balão. */}
      <path d="M9.2 8.6c.2-.4.6-.4.8-.1l.8 1.4c.1.3 0 .5-.2.7l-.4.4c.4.9 1.1 1.6 2 2l.4-.4c.2-.2.4-.3.7-.2l1.4.8c.3.2.3.6-.1.8-.6.5-1.4.7-2.1.4a6.3 6.3 0 0 1-3.7-3.7c-.3-.7-.1-1.5.4-2.1Z" />
    </svg>
  );
}
