"use client";

import { CircleAlert, Coffee, Send } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import {
  ENVIOS_POR_LOTE,
  filaDeEnvio,
  PAUSA_ENTRE_LOTES_MS,
  resumoDoEnvio,
} from "@/lib/convidados/envio";
import { mensagemConvite } from "@/lib/convidados/mensagem";
import { formatarTelefone } from "@/lib/convidados/telefone";

import { marcarEnvio } from "./actions";
import { linksDoConvite, type DadosFesta } from "./linha-convidado";

const n = (q: number, um: string, varios: string) => `${q} ${q === 1 ? um : varios}`;

// "4:59"
const relogio = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// Acompanhamento: quantos convites foram enviados, abertos e respondidos, e o alerta
// quando muitos envios antigos não foram abertos (as mensagens podem não estar chegando).
function Acompanhamento({ convidados }: { convidados: ConvidadoResumo[] }) {
  const r = resumoDoEnvio(convidados);
  if (r.enviados === 0 && r.semWhatsApp === 0) return null;
  return (
    <div className="mt-2 flex flex-col gap-1 text-sm leading-snug">
      {r.enviados > 0 && (
        <p className="text-tinta-suave">
          Envio: <strong className="text-foreground font-semibold">{r.enviados}</strong>{" "}
          {r.enviados === 1 ? "convite enviado" : "convites enviados"} ·{" "}
          <strong className="text-foreground font-semibold">{r.abriram}</strong> abriram o link ·{" "}
          <strong className="text-foreground font-semibold">{r.responderam}</strong> responderam
        </p>
      )}
      {r.semWhatsApp > 0 && (
        <p className="text-tinta-suave">
          {n(r.semWhatsApp, "convite sem WhatsApp", "convites sem WhatsApp")}: copie o link no menu
          ⋯ de cada um e mande por onde preferir.
        </p>
      )}
      {r.alerta && (
        <p
          role="alert"
          className="bg-pendente border-pendente-forte mt-1 flex items-start gap-2 rounded-lg border px-3 py-2"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>
            <strong className="font-semibold">Poucos convidados abriram o link.</strong> As
            mensagens podem não estar chegando (WhatsApp limitando a sua conta ou números errados).
            Pause os envios e pergunte a alguém da lista se recebeu.
          </span>
        </p>
      )}
    </div>
  );
}

// Envia os convites um atrás do outro: mostra o próximo, abre o WhatsApp dele com a mensagem
// pronta e já passa para o seguinte. A cada lote sugere uma pausa, para o WhatsApp não
// estranhar muitas mensagens seguidas.
export function EnvioEmSequencia({
  convidados,
  festa,
  origem,
}: {
  convidados: ConvidadoResumo[];
  festa: DadosFesta;
  origem: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [pulados, setPulados] = useState<string[]>([]);
  // Saem da fila na hora, sem esperar o servidor atualizar a lista.
  const [enviadosAgora, setEnviadosAgora] = useState<string[]>([]);
  const [ultimo, setUltimo] = useState<ConvidadoResumo>();
  const [pausaAte, setPausaAte] = useState<number>();
  const [agora, setAgora] = useState(() => Date.now());

  const fila = filaDeEnvio(
    convidados.filter((c) => !enviadosAgora.includes(c.id)),
    pulados,
  );
  const atual = fila[0];
  const emPausa = pausaAte !== undefined && pausaAte > agora;

  useEffect(() => {
    if (pausaAte === undefined) return;
    const tique = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(tique);
  }, [pausaAte]);

  function enviou(convidado: ConvidadoResumo) {
    const total = enviadosAgora.length + 1;
    setEnviadosAgora((ids) => [...ids, convidado.id]);
    setUltimo(convidado);
    if (total % ENVIOS_POR_LOTE === 0) {
      setAgora(Date.now());
      setPausaAte(Date.now() + PAUSA_ENTRE_LOTES_MS);
    }
    startTransition(() => marcarEnvio(convidado.id, true));
  }

  function desfazer() {
    if (!ultimo) return;
    const id = ultimo.id;
    setEnviadosAgora((ids) => ids.filter((x) => x !== id));
    setUltimo(undefined);
    startTransition(() => marcarEnvio(id, false));
  }

  if (!aberto) {
    return (
      <div className="mt-(--linha)">
        <Button
          type="button"
          variant="outline"
          onClick={() => setAberto(true)}
          disabled={fila.length === 0}
          className="bg-card h-11 px-3.5 font-medium sm:h-10"
        >
          <Send aria-hidden strokeWidth={1.75} />
          {fila.length > 0
            ? `Enviar convites em sequência · ${n(fila.length, "falta", "faltam")}`
            : "Todos os convites com WhatsApp foram enviados"}
        </Button>
        <Acompanhamento convidados={convidados} />
      </div>
    );
  }

  const mensagem =
    atual &&
    mensagemConvite({
      nomeConvidado: atual.nome,
      pessoas: atual.pessoas,
      tituloFesta: festa.titulo,
      dataHora: festa.dataHora,
      localNome: festa.localNome,
      link: linksDoConvite(atual, festa, origem).link,
    });

  return (
    <section
      aria-labelledby="titulo-envio"
      className="bg-card border-border mt-(--linha) flex flex-col gap-3 rounded-xl border p-4 leading-normal"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 id="titulo-envio" className="font-semibold">
          Enviar convites
        </h3>
        <p className="text-tinta-suave text-sm" aria-live="polite">
          {fila.length > 0 ? n(fila.length, "falta", "faltam") : "Nenhum na fila"}
          {enviadosAgora.length > 0 && ` · ${enviadosAgora.length} enviados agora`}
        </p>
      </div>

      <ul className="text-tinta-suave list-disc pl-5 text-[0.8125rem] leading-snug">
        <li>
          Mande em lotes de até {ENVIOS_POR_LOTE}, com {PAUSA_ENTRE_LOTES_MS / 60000} minutos de
          pausa: muitas mensagens seguidas podem fazer o WhatsApp limitar a sua conta.
        </li>
        <li>Comece por quem já tem o seu número salvo (família, amigos próximos).</li>
        <li>Se o WhatsApp avisar de limite ou bloqueio, pare e espere um dia.</li>
      </ul>

      {ultimo && (
        <p className="text-sm">
          Enviado para <strong className="font-semibold">{ultimo.nome}</strong>.{" "}
          <button
            type="button"
            onClick={desfazer}
            className="text-tinta-suave hover:text-foreground focus-visible:outline-ring rounded-sm underline underline-offset-4 focus-visible:outline-2"
          >
            Não cheguei a enviar
          </button>
        </p>
      )}

      {emPausa ? (
        <div className="bg-pendente flex flex-col gap-2 rounded-lg px-3 py-3 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Coffee aria-hidden className="size-4" strokeWidth={1.75} />
            Pausa sugerida: <span className="font-mono">{relogio(pausaAte - agora)}</span>
          </p>
          <p>
            Você mandou {enviadosAgora.length} convites seguidos. Uma pausa curta deixa o envio com
            cara de conversa normal para o WhatsApp.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPausaAte(undefined)}
            className="bg-card h-10 self-start"
          >
            Continuar mesmo assim
          </Button>
        </div>
      ) : atual ? (
        <div className="flex flex-col gap-2">
          <p>
            <span className="text-tinta-suave text-sm">Próximo: </span>
            <strong className="font-semibold">{atual.nome}</strong>
            {atual.pessoas > 1 && (
              <span className="text-tinta-suave"> · {atual.pessoas} pessoas</span>
            )}
            {atual.telefone && (
              <span className="text-tinta-suave font-mono text-sm">
                {" "}
                · {formatarTelefone(atual.telefone)}
              </span>
            )}
          </p>
          <p className="bg-muted text-tinta-suave rounded-lg px-3 py-2 text-[0.8125rem] leading-snug whitespace-pre-line">
            {mensagem}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="h-11 px-4 sm:h-10">
              <a
                href={linksDoConvite(atual, festa, origem).whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => enviou(atual)}
              >
                <Send aria-hidden strokeWidth={1.75} />
                Abrir WhatsApp de {atual.nome}
              </a>
            </Button>
            {fila.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPulados((p) => [...p.filter((id) => id !== atual.id), atual.id])}
                className="h-11 sm:h-10"
              >
                Pular por enquanto
              </Button>
            )}
          </div>
          <p className="text-tinta-suave text-[0.8125rem] leading-snug">
            O WhatsApp abre com a mensagem pronta: é só apertar enviar e voltar para cá.
          </p>
        </div>
      ) : (
        <p className="text-sm font-medium">Todos os convites com WhatsApp foram enviados.</p>
      )}

      <Acompanhamento convidados={convidados} />

      <Button
        type="button"
        variant="ghost"
        onClick={() => setAberto(false)}
        className="h-10 self-start"
      >
        Fechar
      </Button>
    </section>
  );
}
