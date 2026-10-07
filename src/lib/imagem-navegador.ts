// Reduz uma imagem no navegador antes de enviar: fotos de celular passam fácil de 4 MB
// (o teto da Vercel por requisição), e a imagem reduzida carrega rápido. Também desfaz a
// rotação EXIF e converte formatos que o servidor não aceita (WebP, HEIC no iPhone) para JPEG.
export async function reduzirImagem(
  arquivo: File,
  opcoes: { ladoMaximo: number; tamanhoMaximo: number; nome: string; manterPng?: boolean },
): Promise<File> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, opcoes.ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d")!;
  // Fundo branco: áreas transparentes de um PNG ficariam pretas no JPEG.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const gerar = (tipo: string, qualidade?: number) =>
    new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, qualidade));

  // Desenhos (PNG) ficam mais nítidos em PNG; se pesar demais, vai em JPEG.
  if (opcoes.manterPng && arquivo.type === "image/png") {
    const png = await gerar("image/png");
    if (png && png.size <= opcoes.tamanhoMaximo) {
      return new File([png], `${opcoes.nome}.png`, { type: "image/png" });
    }
  }
  for (const qualidade of [0.9, 0.8, 0.65]) {
    const jpeg = await gerar("image/jpeg", qualidade);
    if (jpeg && jpeg.size <= opcoes.tamanhoMaximo) {
      return new File([jpeg], `${opcoes.nome}.jpg`, { type: "image/jpeg" });
    }
  }
  throw new Error("grande demais");
}
