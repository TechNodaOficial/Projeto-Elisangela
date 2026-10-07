"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { FaseConvite } from "@/lib/convites/prazo";
import { cn } from "@/lib/utils";

import { responderConvite } from "./actions";

type Estado = "aberto" | "confirmado" | "recusado";

// Botões grandes, para o polegar: o convidado quase sempre está no celular.
// 48px + 4px acima e abaixo = duas pautas, para a folha seguir alinhada.
const grande = "my-1 h-12 rounded-lg text-[0.9375rem]";

const linkTexto =
  "text-tinta-suave hover:text-foreground focus-visible:outline-ring relative -mx-1 rounded-sm px-1 text-sm underline underline-offset-4 after:absolute after:inset-x-0 after:-inset-y-3 focus-visible:outline-2";

function Nota({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-suave text-sm leading-(--linha)">{children}</p>;
}

// Família: quantas pessoas vão, de 1 até `pessoas` (o tamanho do convite, ou o já
// confirmado quando só dá para diminuir). Botões grandes, um por número.
function Quantas({
  pessoas,
  valor,
  aoMudar,
}: {
  pessoas: number;
  valor: number;
  aoMudar: (n: number) => void;
}) {
  return (
    <div role="group" aria-labelledby="quantas" className="mt-1">
      <p id="quantas" className="text-sm leading-(--linha)">
        Quantas pessoas vão?
      </p>
      <div className="flex flex-wrap gap-2 py-1">
        {Array.from({ length: pessoas }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === valor}
            onClick={() => aoMudar(n)}
            className={cn(
              "focus-visible:outline-ring size-12 rounded-lg border font-mono text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2",
              n === valor ? "bg-primary text-primary-foreground border-primary" : "bg-card",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Resposta({
  token,
  estado,
  pessoas,
  confirmadas,
  fase,
  prazo,
}: {
  token: string;
  estado: Estado;
  pessoas: number;
  confirmadas: number;
  // Ver src/lib/convites/prazo.ts. "encerrado" não chega aqui (a página não mostra a resposta).
  fase: FaseConvite;
  // Último dia para responder ou mudar, como "10/12".
  prazo: string;
}) {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  const [confirmandoRecusa, setConfirmandoRecusa] = useState(false);
  const familia = pessoas > 1;
  const [quantas, setQuantas] = useState(estado === "confirmado" ? confirmadas : pessoas);
  const [mudandoQuantas, setMudandoQuantas] = useState(false);
  // Últimos 10 dias: quem confirmou só pode desistir ou diminuir.
  const travado = fase === "travado";

  function responder(resposta: "CONFIRMADO" | "RECUSADO") {
    setErro(undefined);
    iniciar(async () => {
      const r = await responderConvite(token, resposta, resposta === "CONFIRMADO" ? quantas : 1);
      if (r.erro) setErro(r.erro);
      else {
        setConfirmandoRecusa(false);
        setMudandoQuantas(false);
      }
    });
  }

  const mensagemErro = erro && (
    <p role="alert" className="text-destructive text-sm leading-(--linha)">
      {erro}
    </p>
  );

  if (estado === "aberto" && fase !== "aberto") {
    return (
      <section aria-labelledby="prazo-encerrado" className="mt-(--linha)">
        <h2 id="prazo-encerrado" className="text-lg font-semibold">
          Prazo para responder encerrado
        </h2>
        <Nota>A confirmação ia até {prazo}. Se ainda quiser ir, fale com a Elisangela.</Nota>
      </section>
    );
  }

  if (estado === "aberto") {
    return (
      <section aria-labelledby="pergunta" className="mt-(--linha)">
        <h2 id="pergunta" className="text-lg font-semibold">
          {familia ? "Vocês vão?" : "Você vai?"}
        </h2>
        <Nota>Responda até {prazo}.</Nota>
        {familia && <Quantas pessoas={pessoas} valor={quantas} aoMudar={setQuantas} />}
        <div className="grid grid-cols-2 gap-3">
          <Button className={grande} disabled={enviando} onClick={() => responder("CONFIRMADO")}>
            {familia ? `Vamos (${quantas})` : "Vou"}
          </Button>
          <Button
            variant="outline"
            className={cn(grande, "bg-card")}
            disabled={enviando}
            onClick={() => responder("RECUSADO")}
          >
            {familia ? "Não poderemos ir" : "Não poderei ir"}
          </Button>
        </div>
        {enviando && (
          <p role="status" className="text-tinta-suave text-sm leading-(--linha)">
            Enviando resposta…
          </p>
        )}
        {mensagemErro}
      </section>
    );
  }

  if (estado === "recusado" && travado) {
    return (
      <section aria-label="Mudar resposta" className="mt-(--linha)">
        <Nota>
          O prazo para mudar a resposta terminou em {prazo}. Se precisar, fale com a Elisangela.
        </Nota>
      </section>
    );
  }

  if (estado === "recusado") {
    return (
      <section aria-label="Mudar resposta" className="mt-(--linha)">
        <Nota>Mudou de ideia? Dá para confirmar até {prazo}.</Nota>
        {familia && <Quantas pessoas={pessoas} valor={quantas} aoMudar={setQuantas} />}
        <Button
          className={cn(grande, "w-full")}
          disabled={enviando}
          onClick={() => responder("CONFIRMADO")}
        >
          {enviando ? "Enviando…" : familia ? `Vamos à festa (${quantas})` : "Vou à festa"}
        </Button>
        {mensagemErro}
      </section>
    );
  }

  // Confirmado: desistir apaga o QR, então pede uma segunda confirmação na própria folha.
  return (
    <section aria-label="Mudar resposta" className="mt-(--linha)">
      {familia && mudandoQuantas ? (
        <div>
          <Quantas pessoas={travado ? confirmadas : pessoas} valor={quantas} aoMudar={setQuantas} />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(grande, "bg-card")}
              disabled={enviando}
              onClick={() => {
                setQuantas(confirmadas);
                setMudandoQuantas(false);
              }}
            >
              Voltar
            </Button>
            <Button className={grande} disabled={enviando} onClick={() => responder("CONFIRMADO")}>
              {enviando ? "Enviando…" : "Salvar"}
            </Button>
          </div>
        </div>
      ) : confirmandoRecusa ? (
        <div role="group" aria-labelledby="aviso-recusa">
          <p id="aviso-recusa" className="text-sm leading-(--linha)">
            Seu QR Code de entrada deixa de valer. Confirma que não vai?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className={cn(grande, "bg-card")}
              disabled={enviando}
              onClick={() => setConfirmandoRecusa(false)}
            >
              Voltar
            </Button>
            <Button
              className={cn(
                grande,
                "bg-destructive hover:bg-destructive/90 text-primary-foreground",
              )}
              disabled={enviando}
              onClick={() => responder("RECUSADO")}
            >
              {enviando ? "Enviando…" : "Não vou"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start">
          <Nota>
            {travado
              ? "Faltam menos de 10 dias: dá só para avisar que não vai ou diminuir o número de pessoas."
              : `Dá para mudar a resposta até ${prazo}.`}
          </Nota>
          {familia && (!travado || confirmadas > 1) && (
            <button type="button" onClick={() => setMudandoQuantas(true)} className={linkTexto}>
              {travado
                ? "Vai menos gente? Ajuste aqui."
                : "Mudou o número de pessoas? Ajuste aqui."}
            </button>
          )}
          <button type="button" onClick={() => setConfirmandoRecusa(true)} className={linkTexto}>
            {familia ? "Não vão mais poder ir? Avise aqui." : "Não vai mais poder ir? Avise aqui."}
          </button>
        </div>
      )}
      {mensagemErro}
    </section>
  );
}
