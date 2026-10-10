import "server-only";

import { corDaLinha, larguraDasColunas, type Celula } from "@/lib/convidados/planilha";

// Exportar para o Google Planilhas, sem guardar nada do Google: a cada exportação ela
// autoriza (do segundo uso em diante o Google não pergunta de novo), o painel troca o
// código por um acesso de uso único, cria a planilha no Drive dela e descarta o acesso.
//
// Permissão "drive.file": só os arquivos que o próprio painel criar; o resto do Drive
// fica invisível para o painel. Configuração no Google Cloud: ver .env.example.

const ESCOPO = "https://www.googleapis.com/auth/drive.file";
export const CAMINHO_RETORNO = "/painel/google/retorno";
export const COOKIE_ESTADO = "google_estado";

export const googleConfigurado = () =>
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export function urlDeAutorizacao(origem: string, estado: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: origem + CAMINHO_RETORNO,
    response_type: "code",
    scope: ESCOPO,
    state: estado,
    include_granted_scopes: "true",
    access_type: "online",
  }).toString();
  return url.toString();
}

export async function trocarCodigo(origem: string, codigo: string): Promise<string> {
  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: codigo,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: origem + CAMINHO_RETORNO,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  const dados = (await resposta.json()) as { access_token?: string; error?: string };
  if (!resposta.ok || !dados.access_token) {
    throw new Error(`Google recusou o código: ${dados.error ?? resposta.status}`);
  }
  return dados.access_token;
}

// Cria a planilha já preenchida numa chamada só: cabeçalho em negrito e fixo, totais em
// negrito, cada convite pintado pela situação, colunas na largura do texto. Texto vai como texto (stringValue), então nada
// vira fórmula.
export async function criarPlanilha(
  acesso: string,
  titulo: string,
  linhas: Celula[][],
): Promise<string> {
  const ultima = linhas.length - 1;
  const rowData = linhas.map((linha, i) => ({
    values: linha.map((v) => ({
      userEnteredValue: typeof v === "number" ? { numberValue: v } : { stringValue: v },
      ...(i === 0 || i === ultima
        ? { userEnteredFormat: { textFormat: { bold: true } } }
        : {
            userEnteredFormat: {
              wrapStrategy: "WRAP",
              verticalAlignment: "TOP",
              backgroundColor: corDaLinha(linha),
            },
          }),
    })),
  }));

  const resposta = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: { Authorization: `Bearer ${acesso}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: { title: titulo, locale: "pt_BR", timeZone: "America/Sao_Paulo" },
      sheets: [
        {
          properties: {
            title: "Convidados",
            gridProperties: { frozenRowCount: 1, frozenColumnCount: 1 },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData,
              columnMetadata: larguraDasColunas(linhas).map((pixelSize) => ({ pixelSize })),
            },
          ],
        },
      ],
    }),
    cache: "no-store",
  });
  const dados = (await resposta.json()) as { spreadsheetId?: string; spreadsheetUrl?: string };
  if (!resposta.ok || !dados.spreadsheetId || !dados.spreadsheetUrl) {
    throw new Error(`Google não criou a planilha (${resposta.status})`);
  }

  return dados.spreadsheetUrl;
}
