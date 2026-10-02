import type { Metadata } from "next";

import { Aviso } from "@/components/moldura-publica";

export const metadata: Metadata = {
  title: "Convite não encontrado",
  robots: { index: false, follow: false },
};

export default function ConviteNaoEncontrado() {
  return (
    <Aviso
      titulo="Convite não encontrado"
      texto="Confira se o link foi copiado inteiro. Se continuar assim, fale com quem enviou o convite."
    />
  );
}
