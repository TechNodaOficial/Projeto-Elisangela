"use client";

import { ImageUp, Maximize2, Trash2 } from "lucide-react";
import { startTransition, useActionState, useRef, useState } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { LADO_MAXIMO_PLANTA, TAMANHO_MAXIMO_PLANTA } from "@/lib/planta/limites";
import { cn } from "@/lib/utils";

import { enviarPlanta, removerPlanta, type EstadoPlanta } from "./actions";

type Planta = { src: string; largura: number; altura: number } | null;

// Reduz a imagem no navegador antes de enviar: fotos de celular passam fácil de 4 MB,
// e a imagem reduzida carrega rápido no painel e no PDF. Também desfaz a rotação EXIF
// e converte formatos que o PDF não aceita (WebP, HEIC no iPhone) para JPEG.
async function prepararImagem(arquivo: File): Promise<File> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LADO_MAXIMO_PLANTA / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d")!;
  // Fundo branco: áreas transparentes de um PNG ficariam pretas no JPEG.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const gerar = (tipo: string, qualidade?: number) =>
    new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, qualidade));

  // Desenhos (PNG) ficam mais nítidos em PNG; se pesar demais, vai em JPEG.
  if (arquivo.type === "image/png") {
    const png = await gerar("image/png");
    if (png && png.size <= TAMANHO_MAXIMO_PLANTA) {
      return new File([png], "planta.png", { type: "image/png" });
    }
  }
  for (const qualidade of [0.9, 0.8, 0.65]) {
    const jpeg = await gerar("image/jpeg", qualidade);
    if (jpeg && jpeg.size <= TAMANHO_MAXIMO_PLANTA) {
      return new File([jpeg], "planta.jpg", { type: "image/jpeg" });
    }
  }
  throw new Error("grande demais");
}

export function CampoPlanta({ festaId, planta }: { festaId: string; planta: Planta }) {
  const [estado, enviar, enviando] = useActionState<EstadoPlanta, FormData>(
    enviarPlanta.bind(null, festaId),
    {},
  );
  const [preparando, setPreparando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string>();
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ocupado = preparando || enviando;
  const erro = erroLocal ?? estado.erro;

  async function escolher(arquivo: File | undefined) {
    if (!arquivo || ocupado) return;
    setErroLocal(undefined);
    if (!arquivo.type.startsWith("image/")) {
      setErroLocal("Este arquivo não é uma imagem. Envie em JPG ou PNG.");
      return;
    }
    setPreparando(true);
    try {
      const pronta = await prepararImagem(arquivo);
      const formData = new FormData();
      formData.set("planta", pronta);
      startTransition(() => enviar(formData));
    } catch {
      setErroLocal("Não consegui abrir esta imagem. Envie em JPG ou PNG.");
    } finally {
      setPreparando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const input = (
    <input
      ref={inputRef}
      id="arquivo-planta"
      type="file"
      accept="image/*"
      className="sr-only"
      disabled={ocupado}
      aria-describedby={erro ? "erro-planta" : undefined}
      onChange={(e) => escolher(e.target.files?.[0])}
    />
  );

  const status = ocupado && (
    <span role="status" className="text-tinta-suave text-sm">
      {preparando ? "Preparando a imagem…" : "Enviando…"}
    </span>
  );

  const mensagemErro = erro && (
    <p id="erro-planta" role="alert" className="text-destructive text-sm leading-(--linha)">
      {erro}
    </p>
  );

  if (!planta) {
    return (
      <div className="mt-(--linha)">
        {input}
        <label
          htmlFor="arquivo-planta"
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            escolher(e.dataTransfer.files[0]);
          }}
          className={cn(
            "border-pauta-forte/60 hover:bg-superficie flex h-48 w-full max-w-3xl cursor-pointer flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed px-6 text-center transition-colors",
            "[input:focus-visible+&]:outline-ring [input:focus-visible+&]:outline-2",
            arrastando && "bg-superficie border-pauta-forte",
            ocupado && "pointer-events-none opacity-70",
          )}
        >
          <ImageUp aria-hidden className="text-tinta-suave mb-1 size-6" strokeWidth={1.5} />
          <span className="font-medium">{ocupado ? status : "Enviar a imagem da planta"}</span>
          {!ocupado && (
            <span className="text-tinta-suave text-sm leading-5">
              Clique ou arraste o arquivo para cá. JPG ou PNG.
            </span>
          )}
        </label>
        {mensagemErro}
      </div>
    );
  }

  return (
    <div className="mt-(--linha)">
      <a
        href={planta.src}
        target="_blank"
        rel="noopener"
        className="group focus-visible:outline-ring relative block w-full max-w-5xl rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {/* Imagem privada servida pelo próprio painel (com login): o otimizador do next/image não teria a sessão. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={planta.src}
          width={planta.largura}
          height={planta.altura}
          alt="Planta do salão vista de cima"
          className={cn(
            "border-borda h-auto max-h-[80vh] w-auto max-w-full rounded-[3px] border bg-white object-contain",
            enviando && "opacity-50",
          )}
        />
        <span className="bg-card/95 text-tinta-suave absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 aria-hidden className="size-3.5" strokeWidth={1.75} />
          Abrir em tamanho real
        </span>
      </a>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {input}
        <Button
          asChild
          variant="outline"
          className={cn(
            "bg-card [input:focus-visible+&]:outline-ring h-9 cursor-pointer [input:focus-visible+&]:outline-2",
            ocupado && "pointer-events-none opacity-50",
          )}
        >
          <label htmlFor="arquivo-planta">
            <ImageUp aria-hidden strokeWidth={1.75} />
            Trocar imagem
          </label>
        </Button>
        <ConfirmarExclusao
          titulo="Remover a planta?"
          descricao="A imagem sai da página e do roteiro em PDF. Você pode enviar outra depois."
          rotuloConfirmar="Remover planta"
          rotuloEnviando="Removendo…"
          acao={removerPlanta.bind(null, festaId)}
          gatilho={
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive h-9"
              disabled={ocupado}
            >
              <Trash2 aria-hidden strokeWidth={1.75} />
              Remover
            </Button>
          }
        />
        {status}
      </div>
      {mensagemErro}
    </div>
  );
}
