import { prazoDoConvite } from "@/lib/convites/prazo";
import { partesData } from "@/lib/datas";

// Texto que vai junto do link no WhatsApp.
export function mensagemConvite(dados: {
  nomeConvidado: string;
  // Convite de família: cumprimenta pelo nome todo ("Olá, Família Silva!").
  pessoas?: number;
  tituloFesta: string;
  dataHora: Date;
  localNome: string;
  link: string;
}): string {
  const familia = (dados.pessoas ?? 1) > 1;
  const nome = familia ? dados.nomeConvidado.trim() : dados.nomeConvidado.trim().split(/\s+/)[0];
  const data = partesData(dados.dataHora);
  const [semana, diaMes] = data.extenso.split(", ");
  const diaSemAno = diaMes.replace(/ de \d{4}$/, "");

  return [
    `Olá, ${nome}!`,
    `${familia ? "Vocês estão" : "Você está"} na lista de convidados de ${dados.tituloFesta}: ${semana}, ${diaSemAno}, às ${data.hora}, em ${dados.localNome}.`,
    `Confirme ${familia ? "a presença" : "sua presença"} até ${prazoDoConvite(dados.dataHora)} por este link: ${dados.link}`,
  ].join("\n\n");
}
