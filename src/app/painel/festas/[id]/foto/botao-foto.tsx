"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { reduzirImagem } from "@/lib/imagem-navegador";
import { TAMANHO_MAXIMO_PLANTA } from "@/lib/planta/limites";

import { enviarFoto, removerFoto, type EstadoFoto } from "./actions";

// Foto no fundo da página: 2400px no lado maior basta para uma tela grande. Sempre JPEG.
const LADO_MAXIMO_FOTO = 2400;

// Botões da foto de fundo da festa (noivos, aniversariante): adicionar, trocar e tirar.
export function BotaoFoto({ festaId, temFoto }: { festaId: string; temFoto: boolean }) {
  const [estado, enviar, enviando] = useActionState<EstadoFoto, FormData>(
    enviarFoto.bind(null, festaId),
    {},
  );
  const [preparando, setPreparando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const ocupado = preparando || enviando;
  const erro = erroLocal ?? estado.erro;

  async function escolher(arquivo: File | undefined) {
    if (!arquivo || ocupado) return;
    setErroLocal(undefined);
    if (!arquivo.type.startsWith("image/")) {
      setErroLocal("Este arquivo não é uma foto. Envie em JPG ou PNG.");
      return;
    }
    setPreparando(true);
    try {
      const pronta = await reduzirImagem(arquivo, {
        ladoMaximo: LADO_MAXIMO_FOTO,
        tamanhoMaximo: TAMANHO_MAXIMO_PLANTA,
        nome: "foto",
      });
      const formData = new FormData();
      formData.set("foto", pronta);
      startTransition(() => enviar(formData));
    } catch {
      setErroLocal("Não consegui abrir esta foto. Envie em JPG ou PNG.");
    } finally {
      setPreparando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => escolher(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        className="bg-card h-9"
        disabled={ocupado}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus aria-hidden strokeWidth={1.75} />
        {preparando
          ? "Preparando…"
          : enviando
            ? "Enviando…"
            : temFoto
              ? "Trocar foto de fundo"
              : "Foto de fundo"}
      </Button>
      {temFoto && (
        <ConfirmarExclusao
          titulo="Tirar a foto da festa?"
          descricao="A foto sai do fundo da página e é apagada do painel."
          rotuloConfirmar="Tirar foto"
          rotuloEnviando="Tirando…"
          acao={removerFoto.bind(null, festaId)}
          gatilho={
            <Button
              type="button"
              variant="outline"
              aria-label="Tirar a foto da festa"
              className="bg-card size-9"
            >
              <Trash2 aria-hidden strokeWidth={1.75} />
            </Button>
          }
        />
      )}
      {erro && (
        <p role="alert" className="text-destructive basis-full text-right text-sm">
          {erro}
        </p>
      )}
    </>
  );
}
