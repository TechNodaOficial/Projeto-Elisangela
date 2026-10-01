import { NextResponse, type NextRequest } from "next/server";

import { NOME_COOKIE_SESSAO } from "@/lib/auth/constantes";

// Checagem otimista: só confere se o cookie existe, sem ir ao banco.
// A validação real da sessão fica em exigirUsuario() (src/lib/dal.ts).
export function proxy(request: NextRequest) {
  if (request.cookies.has(NOME_COOKIE_SESSAO)) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("de", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/painel/:path*"],
};
