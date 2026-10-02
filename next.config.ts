import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Envio da planta do salão: até 4 MB de imagem + folga do multipart.
      // Abaixo do teto de 4,5 MB por requisição da Vercel (ver src/lib/planta/limites.ts).
      bodySizeLimit: "4.25mb",
    },
  },
  // As fontes do PDF são lidas do disco; sem isso elas não vão junto para a função na Vercel.
  outputFileTracingIncludes: {
    "/painel/festas/\\[id\\]/pdf/\\[tipo\\]": ["./src/lib/pdf/fontes/*.ttf"],
    // A imagem do QR do convidado usa as mesmas fontes.
    "/c/\\[token\\]/qr": ["./src/lib/pdf/fontes/*.ttf"],
  },
};

export default nextConfig;
