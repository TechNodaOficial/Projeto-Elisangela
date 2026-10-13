import { prazoDoConvite } from "@/lib/convites/prazo";
import { partesData } from "@/lib/datas";

import { nomeDaSaudacao } from "./saudacao";

export const MENSAGEM_MAXIMO = 1000;

// Campos que ela pode pôr no modelo da festa: "{nome}" vira o nome do convidado, etc.
export const CAMPOS_MENSAGEM = [
  { chave: "nome", rotulo: "Nome do convidado" },
  { chave: "festa", rotulo: "Nome da festa" },
  { chave: "data", rotulo: "Data" },
  { chave: "hora", rotulo: "Horário" },
  { chave: "local", rotulo: "Local" },
  { chave: "prazo", rotulo: "Prazo para confirmar" },
  { chave: "link", rotulo: "Link do convite" },
] as const;

type Campo = (typeof CAMPOS_MENSAGEM)[number]["chave"];

// O texto padrão escrito como modelo: é de onde ela parte para escrever o dela.
export const MODELO_PADRAO = [
  "Olá, {nome}!",
  "Você está na lista de convidados de {festa}: {data}, às {hora}, em {local}.",
  "Confirme sua presença até {prazo} por este link: {link}",
].join("\n\n");

// Texto que vai junto do link no WhatsApp.
export function mensagemConvite(dados: {
  nomeConvidado: string;
  // Convite de família: cumprimenta pelo nome todo ("Olá, Família Silva!").
  pessoas?: number;
  tituloFesta: string;
  dataHora: Date;
  localNome: string;
  link: string;
  // Texto que ela escreveu para esta festa. Vazio = o padrão abaixo.
  modelo?: string | null;
}): string {
  const familia = (dados.pessoas ?? 1) > 1;
  const nome = nomeDaSaudacao(dados.nomeConvidado, dados.pessoas);
  const data = partesData(dados.dataHora);
  const [semana, diaMes] = data.extenso.split(", ");
  const diaSemAno = diaMes.replace(/ de \d{4}$/, "");
  const prazo = prazoDoConvite(dados.dataHora);

  const modelo = dados.modelo?.trim();
  if (modelo) {
    const valores: Record<Campo, string> = {
      nome,
      festa: dados.tituloFesta,
      data: `${semana}, ${diaSemAno}`,
      hora: data.hora,
      local: dados.localNome,
      prazo,
      link: dados.link,
    };
    // Uma passada só: o que entra no lugar de um campo não é lido de novo como campo.
    const texto = modelo.replace(/\{(\w+)\}/g, (trecho, chave: string) =>
      Object.hasOwn(valores, chave) ? valores[chave as Campo] : trecho,
    );
    // Sem o link o convidado não tem como responder: ele vai no fim.
    return modelo.includes("{link}") ? texto : `${texto}\n\n${dados.link}`;
  }

  return [
    `Olá, ${nome}!`,
    `${familia ? "Vocês estão" : "Você está"} na lista de convidados de ${dados.tituloFesta}: ${semana}, ${diaSemAno}, às ${data.hora}, em ${dados.localNome}.`,
    `Confirme ${familia ? "a presença" : "sua presença"} até ${prazo} por este link: ${dados.link}`,
  ].join("\n\n");
}
