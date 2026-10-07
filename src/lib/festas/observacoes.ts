// Observações gerais de cada parte da festa: uma folha livre por página do quadro.

export const SECOES_OBSERVACAO = {
  fornecedores: { titulo: "Fornecedores", pagina: "fornecedores" },
  cronograma: { titulo: "Cronograma e menu", pagina: "cronograma" },
  convidados: { titulo: "Lista de convidados", pagina: "convidados" },
  croqui: { titulo: "Croqui", pagina: "croqui" },
  layout: { titulo: "Layout", pagina: "mesas" },
  cerimonial: { titulo: "Cerimonial", pagina: "cerimonial" },
  entradas: { titulo: "Entradas da cerimônia", pagina: "entradas" },
  padrinhos: { titulo: "Checklist dos padrinhos", pagina: "padrinhos" },
} as const;

export type SecaoObservacao = keyof typeof SECOES_OBSERVACAO;

export const ehSecaoObservacao = (s: string): s is SecaoObservacao =>
  Object.hasOwn(SECOES_OBSERVACAO, s);

// Documento do editor (Tiptap/ProseMirror) em JSON. O editor só mostra o que o próprio
// esquema conhece, então aqui basta conferir a forma geral e o tamanho.
export type Documento = { type: "doc"; content?: unknown[] };

// ~500 KB de texto: dezenas de páginas, longe de qualquer uso real.
export const TAMANHO_MAXIMO_DOCUMENTO = 500_000;

export function documentoValido(valor: unknown): valor is Documento {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return false;
  const doc = valor as { type?: unknown; content?: unknown };
  if (doc.type !== "doc") return false;
  if (doc.content !== undefined && !Array.isArray(doc.content)) return false;
  return JSON.stringify(valor).length <= TAMANHO_MAXIMO_DOCUMENTO;
}

// Folha em branco: nenhum texto em lugar nenhum do documento.
export function documentoVazio(valor: unknown): boolean {
  const temTexto = (no: unknown): boolean => {
    if (typeof no !== "object" || no === null) return false;
    const { text, content } = no as { text?: unknown; content?: unknown };
    if (typeof text === "string" && text.trim()) return true;
    return Array.isArray(content) && content.some(temTexto);
  };
  return !temTexto(valor);
}
