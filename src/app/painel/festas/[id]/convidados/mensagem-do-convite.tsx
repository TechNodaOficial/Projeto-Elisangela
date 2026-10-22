"use client";

import { MessageSquareText } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import {
  CAMPOS_MENSAGEM,
  MENSAGEM_MAXIMO,
  mensagemConvite,
  MODELO_PADRAO,
} from "@/lib/convidados/mensagem";
import { cn } from "@/lib/utils";

import { salvarMensagemConvite } from "./actions";
import type { DadosFesta } from "./linha-convidado";

// "Mensagem do convite": ela escreve o texto que o WhatsApp abre para cada convidado desta
// festa. Os campos entre chaves ({nome}, {link}…) são preenchidos pelo painel.
export function MensagemDoConvite({
  festaId,
  festa,
  exemplo,
  origem,
}: {
  festaId: string;
  festa: DadosFesta;
  // Convidado usado na prévia (o primeiro da lista); sem lista, um nome de exemplo.
  exemplo?: ConvidadoResumo;
  origem: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string }>();
  const [salvando, iniciar] = useTransition();
  const campo = useRef<HTMLTextAreaElement>(null);

  const personalizada = festa.mensagemConvite !== null;

  if (!aberto) {
    return (
      <div data-guia="mensagem-convite" className="mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setTexto(festa.mensagemConvite ?? MODELO_PADRAO);
            setMensagem(undefined);
            setAberto(true);
          }}
          className="bg-pastel-azul hover:bg-pastel-azul h-11 px-3.5 font-medium transition-[filter] hover:brightness-95 sm:h-10"
        >
          <MessageSquareText aria-hidden strokeWidth={1.75} />
          Editar mensagem do convite
          <span className="font-normal">· {personalizada ? "texto seu" : "texto padrão"}</span>
        </Button>
        {mensagem?.tipo === "ok" && (
          <p role="status" className="text-sm">
            {mensagem.texto}
          </p>
        )}
      </div>
    );
  }

  const longo = texto.trim().length > MENSAGEM_MAXIMO;
  const previa = mensagemConvite({
    nomeConvidado: exemplo?.nome ?? "Maria Souza",
    pessoas: exemplo?.pessoas,
    tituloFesta: festa.titulo,
    dataHora: festa.dataHora,
    localNome: festa.localNome,
    link: `${origem}/c/${exemplo?.tokenConvite ?? "exemplo"}`,
    modelo: texto,
  });

  // Põe o campo onde está o cursor (ou no lugar do trecho selecionado).
  function inserir(chave: string) {
    const area = campo.current;
    if (!area) return;
    area.focus();
    area.setRangeText(`{${chave}}`, area.selectionStart, area.selectionEnd, "end");
    setTexto(area.value);
  }

  function salvar() {
    setMensagem(undefined);
    iniciar(async () => {
      const r = await salvarMensagemConvite(festaId, texto);
      if (r.erro) {
        setMensagem({ tipo: "erro", texto: r.erro });
        return;
      }
      setAberto(false);
      setMensagem({ tipo: "ok", texto: "Mensagem salva. Vale para os próximos envios." });
    });
  }

  return (
    <div className="bg-card border-border mt-3 flex flex-col gap-3 rounded-xl border p-4 leading-normal">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mensagem-convite">Mensagem do convite no WhatsApp</Label>
        <p id="ajuda-mensagem" className="text-tinta-suave text-sm leading-snug">
          Vale para todos os convidados desta festa. Os campos entre chaves são preenchidos sozinhos
          para cada convidado. O texto é o mesmo para uma pessoa ou uma família.
        </p>
        <Textarea
          ref={campo}
          id="mensagem-convite"
          aria-describedby="ajuda-mensagem"
          aria-invalid={longo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={7}
          className="bg-card"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-tinta-suave text-[0.8125rem]">Inserir:</span>
          {CAMPOS_MENSAGEM.map((c) => (
            <button
              key={c.chave}
              type="button"
              onClick={() => inserir(c.chave)}
              className="bg-muted hover:bg-muted/70 focus-visible:outline-ring h-8 rounded-md px-2 text-[0.8125rem] focus-visible:outline-2"
            >
              {c.rotulo}
            </button>
          ))}
          <span
            className={cn(
              "text-tinta-suave ml-auto font-mono text-xs",
              longo && "text-destructive font-semibold",
            )}
          >
            {texto.trim().length}/{MENSAGEM_MAXIMO}
          </span>
        </div>
      </div>

      <div>
        <p className="text-tinta-suave text-sm">
          Como {exemplo ? exemplo.nome : "um convidado"} vai receber:
        </p>
        <p
          aria-live="polite"
          className="bg-muted text-tinta-suave mt-1 rounded-lg px-3 py-2 text-[0.8125rem] leading-snug break-words whitespace-pre-line"
        >
          {previa}
        </p>
        {texto.trim() && !texto.includes("{link}") && (
          <p className="text-tinta-suave mt-1 text-[0.8125rem] leading-snug">
            O texto não tem o link do convite: ele vai no fim da mensagem.
          </p>
        )}
      </div>

      {mensagem?.tipo === "erro" && (
        <p role="alert" className="text-destructive text-sm">
          {mensagem.texto}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={salvar} disabled={salvando || longo} className="h-10 px-4">
          {salvando ? "Salvando…" : "Salvar mensagem"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setAberto(false)}
          disabled={salvando}
          className="h-10"
        >
          Cancelar
        </Button>
        {texto.trim() !== MODELO_PADRAO && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setTexto(MODELO_PADRAO)}
            disabled={salvando}
            className="text-tinta-suave h-10 sm:ml-auto"
          >
            Voltar ao texto padrão
          </Button>
        )}
      </div>
    </div>
  );
}
