import type { NextConfig } from "next";

// Cabeçalhos de segurança de todas as respostas. A CSP fica em src/proxy.ts (tem nonce).
const seguranca = [
  // Só HTTPS por 2 anos, inclusive subdomínios.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // A câmera só para o próprio site (leitor de QR); o resto, ninguém.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: seguranca }];
  },
  experimental: {
    serverActions: {
      // Envio da planta do salão: até 4 MB de imagem + folga do multipart.
      // Abaixo do teto de 4,5 MB por requisição da Vercel (ver src/lib/planta/limites.ts).
      bodySizeLimit: "4.25mb",
    },
  },
  // As fontes e a logo do PDF são lidas do disco; sem isso não vão junto para a função na Vercel.
  outputFileTracingIncludes: {
    "/painel/festas/\\[id\\]/pdf/\\[tipo\\]": [
      "./src/lib/pdf/fontes/*.ttf",
      "./src/lib/pdf/logo.png",
    ],
    // A imagem do QR do convidado usa as mesmas fontes.
    "/c/\\[token\\]/qr": ["./src/lib/pdf/fontes/*.ttf"],
  },
};

export default nextConfig;
