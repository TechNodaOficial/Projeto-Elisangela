import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { exigirUsuario } from "@/lib/dal";
import { buscarFesta } from "@/lib/festas/consultas";
import { COOKIE_ESTADO, googleConfigurado, urlDeAutorizacao } from "@/lib/google/planilhas";
import { origemDoSite } from "@/lib/origem";

// Botão "Abrir no Google Planilhas": manda para a autorização do Google. O estado
// (aleatório + festa) volta no retorno e é conferido contra o cookie, para ninguém
// conseguir disparar uma exportação em nome dela.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/painel/festas/[id]/convidados/planilha">,
) {
  await exigirUsuario();
  const { id } = await ctx.params;
  const origem = await origemDoSite();
  const voltar = (aviso: string) =>
    NextResponse.redirect(`${origem}/painel/festas/${id}/convidados?planilha=${aviso}`);

  if (!(await buscarFesta(id))) return voltar("erro");
  if (!googleConfigurado()) return voltar("sem-google");

  const estado = randomBytes(24).toString("base64url");
  const resposta = NextResponse.redirect(urlDeAutorizacao(origem, estado));
  resposta.cookies.set(COOKIE_ESTADO, `${estado}.${id}`, {
    httpOnly: true,
    secure: origem.startsWith("https"),
    sameSite: "lax",
    path: "/painel/google",
    maxAge: 10 * 60,
  });
  return resposta;
}
