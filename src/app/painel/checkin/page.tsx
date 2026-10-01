import type { Metadata } from "next";
import { ScanLine } from "lucide-react";

import { CabecalhoSecao } from "../folhas";

export const metadata: Metadata = { title: "Leitor QR Code · Painel de Festas" };

export default function PaginaCheckin() {
  return (
    <>
      <CabecalhoSecao
        titulo="Leitor QR Code"
        descricao="Registre a chegada dos convidados no dia da festa."
      />
      <div className="folha folha-lisa flex max-w-xl items-start gap-3 py-6 pr-6 pl-[calc(var(--margem)+0.875rem)]">
        <ScanLine aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">O leitor ainda está sendo preparado.</p>
          <p className="text-tinta-suave text-sm">
            Em breve, aqui você abre a câmera do celular, aponta para o QR Code do convidado e a
            presença dele é registrada na hora.
          </p>
        </div>
      </div>
    </>
  );
}
