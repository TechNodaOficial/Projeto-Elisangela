// Recado do convidado: texto livre, curto o bastante para ler de uma vez.
export const TAMANHO_MAXIMO_MENSAGEM = 1000;

// Tira espaços nas pontas e linhas em branco repetidas. Vazio = apagar o recado.
export function limparMensagem(texto: string): string {
  return texto
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
