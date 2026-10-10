import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { listarConvidados } from "@/lib/convidados/consultas";
import { linhasDaPlanilha } from "@/lib/convidados/planilha";
import { exigirUsuario } from "@/lib/dal";
import { buscarFesta } from "@/lib/festas/consultas";
import { COOKIE_ESTADO, criarPlanilha, trocarCodigo } from "@/lib/google/planilhas";
import { origemDoSite } from "@/lib/origem";

const iguais = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Volta da autorização do Google: confere o estado, cria a planilha com os convidados
// da festa no Drive dela e abre a planilha. O acesso do Google não é guardado.
export async function GET(request: NextRequest) {
  await exigirUsuario();
  const origem = await origemDoSite();
  const params = request.nextUrl.searchParams;

  const [estadoCookie, festaId] = (request.cookies.get(COOKIE_ESTADO)?.value ?? "").split(".");
  const estado = params.get("state") ?? "";
  const voltar = (aviso: string) => {
    const destino = festaId
      ? `${origem}/painel/festas/${festaId}/convidados?planilha=${aviso}`
      : `${origem}/painel`;
    const resposta = NextResponse.redirect(destino);
    resposta.cookies.delete({ name: COOKIE_ESTADO, path: "/painel/google" });
    return resposta;
  };

  if (!festaId || !estadoCookie || !iguais(estadoCookie, estado)) return voltar("erro");
  if (params.get("error")) return voltar("negado"); // ela cancelou na tela do Google
  const codigo = params.get("code");
  if (!codigo) return voltar("erro");

  const festa = await buscarFesta(festaId);
  if (!festa) return voltar("erro");

  try {
    const acesso = await trocarCodigo(origem, codigo);
    const convidados = await listarConvidados(festa.id);
    const hoje = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
    }).format(new Date());
    const url = await criarPlanilha(
      acesso,
      `Convidados · ${festa.titulo} (${hoje})`,
      linhasDaPlanilha(convidados),
    );
    const resposta = NextResponse.redirect(url);
    resposta.cookies.delete({ name: COOKIE_ESTADO, path: "/painel/google" });
    return resposta;
  } catch (erro) {
    console.error("Exportar para o Google Planilhas:", erro);
    return voltar("erro");
  }
}
