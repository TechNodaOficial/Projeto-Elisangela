// Como chamar o convidado no "Olá, …" do convite e da mensagem do WhatsApp.
// - Família ou grupo (mais de uma pessoa, ou "Ana e João"): o nome todo.
// - Uma pessoa: o primeiro nome ("Maria Souza" → "Maria"), mas tratamento e parentesco
//   vêm com o nome seguinte ("Tia Cida" → "Tia Cida", "Dona Maria Souza" → "Dona Maria").

const TRATAMENTOS = new Set([
  "tia",
  "tio",
  "titia",
  "titio",
  "vo",
  "vó",
  "vô",
  "vovo",
  "vovó",
  "vovô",
  "avo",
  "avó",
  "avô",
  "dona",
  "dna",
  "seu",
  "sr",
  "sra",
  "srta",
  "senhor",
  "senhora",
  "dr",
  "dra",
  "doutor",
  "doutora",
  "prof",
  "profa",
  "professor",
  "professora",
  "padre",
  "pastor",
  "pastora",
  "irmã",
  "irmão",
  "prima",
  "primo",
  "madrinha",
  "padrinho",
  "comadre",
  "compadre",
]);

export function nomeDaSaudacao(nome: string, pessoas = 1): string {
  const limpo = nome.trim().replace(/\s+/g, " ");
  const palavras = limpo.split(" ");
  if (pessoas > 1 || /\s(e|&)\s/i.test(limpo)) return limpo;
  const primeira = palavras[0].toLowerCase().replace(/\.$/, "");
  if (TRATAMENTOS.has(primeira) && palavras.length > 1) return palavras.slice(0, 2).join(" ");
  return palavras[0];
}
