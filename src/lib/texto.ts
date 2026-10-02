// Para buscas: "José" acha "jose" e vice-versa.
export const semAcento = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
