"use client";

import { BarcodeDetector, prepareZXingModule, ZXING_WASM_VERSION } from "barcode-detector/ponyfill";
import { Camera as IconeCamera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { destravarSom } from "./sinais";

// O leitor (ZXing em WebAssembly) é servido pelo próprio site: ver scripts/copiar-zxing.mjs.
prepareZXingModule({
  overrides: {
    locateFile: (caminho: string, prefixo: string) =>
      caminho.endsWith(".wasm")
        ? `/zxing/zxing_reader-${ZXING_WASM_VERSION}.wasm`
        : prefixo + caminho,
  },
});

type Estado = "fechada" | "abrindo" | "lendo" | "erro";

const INTERVALO_MS = 120;

// Câmera traseira lendo QR Codes em sequência. Enquanto `pausada` (resultado na tela),
// continua aberta mas ignora o que vê, para a próxima leitura ser imediata.
export function Camera({ pausada, aoLer }: { pausada: boolean; aoLer: (codigo: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pausadaRef = useRef(pausada);
  const aoLerRef = useRef(aoLer);
  const [estado, setEstado] = useState<Estado>("fechada");
  const [erro, setErro] = useState<string>();

  useEffect(() => {
    pausadaRef.current = pausada;
    aoLerRef.current = aoLer;
  });

  // Desliga a câmera ao sair da página.
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  useEffect(() => {
    if (estado !== "lendo") return;
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;

    async function ler() {
      const video = videoRef.current;
      if (ativo && video && video.readyState >= 2 && !pausadaRef.current) {
        try {
          const [codigo] = await detector.detect(video);
          if (ativo && codigo?.rawValue && !pausadaRef.current) aoLerRef.current(codigo.rawValue);
        } catch {
          // Quadro ilegível: segue para o próximo.
        }
      }
      if (ativo) timer = setTimeout(ler, INTERVALO_MS);
    }
    void ler();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [estado]);

  async function abrir() {
    destravarSom();
    setErro(undefined);
    setEstado("abrindo");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setEstado("lendo");
    } catch (e) {
      const negado = e instanceof DOMException && e.name === "NotAllowedError";
      setErro(
        negado
          ? "O navegador não deu acesso à câmera. Libere a câmera para este site nas configurações do navegador, ou use a busca pelo nome."
          : "Não foi possível abrir a câmera. Use a busca pelo nome.",
      );
      setEstado("erro");
    }
  }

  const aberta = estado === "lendo";

  return (
    <div className="bg-foreground relative aspect-square w-full overflow-hidden rounded-[3px] shadow-[0_1px_1px_oklch(0.2_0.01_250/6%),0_6px_16px_-8px_oklch(0.2_0.01_250/22%)]">
      <video
        ref={videoRef}
        playsInline
        muted
        aria-hidden
        className={cn("size-full object-cover", !aberta && "invisible")}
      />

      {aberta && (
        // Mira: quatro cantos no centro, onde o QR deve ficar.
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="relative size-[62%] max-w-80">
            {[
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-md",
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-md",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-md",
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-md",
            ].map((canto) => (
              <span key={canto} className={cn("absolute size-10 border-white", canto)} />
            ))}
          </div>
        </div>
      )}

      {aberta ? (
        <p className="absolute inset-x-0 bottom-3 text-center text-sm text-white/85">
          Aponte para o QR Code do convidado
        </p>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center text-white">
          {estado === "erro" ? (
            <CameraOff aria-hidden className="size-8 text-white/80" strokeWidth={1.75} />
          ) : (
            <IconeCamera aria-hidden className="size-8 text-white/80" strokeWidth={1.75} />
          )}
          {erro && (
            <p role="alert" className="max-w-xs text-sm text-white/90">
              {erro}
            </p>
          )}
          <button
            type="button"
            onClick={abrir}
            disabled={estado === "abrindo"}
            className="text-foreground bg-card h-12 rounded-lg px-6 text-[0.9375rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70"
          >
            {estado === "abrindo"
              ? "Abrindo…"
              : estado === "erro"
                ? "Tentar de novo"
                : "Abrir câmera"}
          </button>
        </div>
      )}
    </div>
  );
}
