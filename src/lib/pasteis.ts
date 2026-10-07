// Regra visual das páginas da festa: a página é uma folha creme; as listas ficam numa
// bandeja pastel com listras, e os cartões também, sempre na cor da raia do quadro:
// fornecedores e cronograma = pêssego, recepção = rosa, cerimônia = lilás.
export const COR_RAIA = {
  fornecedores: "bg-pastel-pessego",
  recepcao: "bg-pastel-rosa",
  cerimonia: "bg-pastel-lilas",
} as const;

// Bandeja de uma lista (ul/ol), com a cor da raia; as linhas usam LINHA_ALTERNADA.
export const BANDEJA = "flex flex-col rounded-lg p-1";

// Cor pastel de um cartão de serviço na base de fornecedores (fora das festas): sempre a
// mesma para o mesmo serviço (pelo id).
const CORES = [
  "bg-pastel-pessego",
  "bg-pastel-rosa",
  "bg-pastel-menta",
  "bg-pastel-lilas",
  "bg-pastel-azul",
  "bg-pastel-areia",
];

export function corDoServico(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return CORES[Math.abs(h) % CORES.length];
}

// Linhas de lista dentro do cartão: dois tons alternados, ambos mais claros que o cartão
// (o creme das folhas por cima do pastel; nada de branco).
export const LINHA_ALTERNADA = "rounded-sm odd:bg-card/80 even:bg-card/40";

// Cartão de altura fixa: o conteúdo que passar rola dentro dele.
export const CARTAO = "flex flex-col rounded-xl p-4";
export const AREA_ROLAVEL = "-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1";
