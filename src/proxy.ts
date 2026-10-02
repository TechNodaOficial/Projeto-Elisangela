import { NextResponse, type NextRequest } from "next/server";

import { NOME_COOKIE_SESSAO } from "@/lib/auth/constantes";

// Content Security Policy com nonce: só os scripts que o próprio Next renderiza nesta
// requisição rodam (o nonce muda a cada página). Estilos ficam com 'unsafe-inline'
// porque React e Radix usam style="" nos elementos. 'wasm-unsafe-eval' é para o
// leitor de QR (ZXing em WebAssembly). Em dev, o React precisa de 'unsafe-eval'.
function politica(nonce: string, https: boolean) {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob: mediastream:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  // Painel: checagem otimista, só confere se o cookie existe, sem ir ao banco.
  // A validação real da sessão fica em exigirUsuario() (src/lib/dal.ts).
  if (request.nextUrl.pathname.startsWith("/painel") && !request.cookies.has(NOME_COOKIE_SESSAO)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("de", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = politica(nonce, request.nextUrl.protocol === "https:");
  // O Next lê o nonce do cabeçalho da requisição e o aplica nos próprios scripts.
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: cabecalhos } });
  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  matcher: [
    {
      // Tudo menos arquivos estáticos; prefetches do <Link> não precisam de CSP.
      source: "/((?!_next/static|_next/image|favicon.ico|zxing/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
