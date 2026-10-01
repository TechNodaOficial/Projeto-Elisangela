import { partesData } from "@/lib/datas";

// Texto que vai junto do link no WhatsApp.
export function mensagemConvite(dados: {
  nomeConvidado: string;
  tituloFesta: string;
  dataHora: Date;
  localNome: string;
  link: string;
}): string {
  const primeiroNome = dados.nomeConvidado.trim().split(/\s+/)[0];
  const data = partesData(dados.dataHora);
  const [semana, diaMes] = data.extenso.split(", ");
  const diaSemAno = diaMes.replace(/ de \d{4}$/, "");

  return [
    `Olá, ${primeiroNome}!`,
    `Você está na lista de convidados de ${dados.tituloFesta}: ${semana}, ${diaSemAno}, às ${data.hora}, em ${dados.localNome}.`,
    `Confirme sua presença por este link: ${dados.link}`,
  ].join("\n\n");
}
