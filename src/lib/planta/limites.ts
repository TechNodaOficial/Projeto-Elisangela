// Compartilhado entre o navegador (que reduz a imagem) e o servidor (que confere).
// A Vercel aceita no máximo 4,5 MB por requisição; o limite das server actions
// em next.config.ts acompanha este valor.
export const TAMANHO_MAXIMO_PLANTA = 4 * 1024 * 1024;

// Lado maior da imagem depois de reduzida: nítido para imprimir em A4 e leve para o PDF.
export const LADO_MAXIMO_PLANTA = 3000;
