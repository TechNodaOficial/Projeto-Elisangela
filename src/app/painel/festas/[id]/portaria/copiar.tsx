"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function BotaoCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="bg-card h-10"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
    >
      {copiado ? <Check aria-hidden strokeWidth={2} /> : <Copy aria-hidden strokeWidth={1.75} />}
      <span aria-live="polite">{copiado ? "Copiado" : "Copiar link"}</span>
    </Button>
  );
}
