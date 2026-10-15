// Observações gerais de cada parte da festa: uma folha livre por página do quadro.

export const SECOES_OBSERVACAO = {
  fornecedores: { titulo: "Fornecedores", pagina: "fornecedores" },
  cronograma: { titulo: "Cronograma e menu", pagina: "cronograma" },
  convidados: { titulo: "Lista de convidados", pagina: "convidados" },
  croqui: { titulo: "Layout", pagina: "croqui" },
  layout: { titulo: "Croqui", pagina: "mesas" },
  cerimonial: { titulo: "Cerimonial", pagina: "cerimonial" },
  entradas: { titulo: "Entradas da cerimônia", pagina: "entradas" },
  padrinhos: { titulo: "Padrinhos", pagina: "padrinhos" },
} as const;

export type SecaoObservacao = keyof typeof SECOES_OBSERVACAO;

// Texto do cerimonial (a fala), escrito na própria aba Cerimonial com o mesmo editor das
// observações. Guardado como uma folha à parte: não aparece no botão "Observações".
export const SECAO_FALA = "fala-cerimonial";

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
  return JSON.stringify(valor).length <= TAMANHO_MAXIMO_DOCUMENTO && linksPermitidos(valor);
}

// Links da folha: só páginas (http/https), e-mail e telefone. Nada de "javascript:".
const PROTOCOLOS_LINK = new Set(["http:", "https:", "mailto:", "tel:"]);
const LINK_MAXIMO = 2000;

export function linkPermitido(href: unknown): href is string {
  if (typeof href !== "string" || !href || href.length > LINK_MAXIMO) return false;
  try {
    return PROTOCOLOS_LINK.has(new URL(href).protocol);
  } catch {
    return false;
  }
}

// O que ela digita no campo do link vira endereço: "site.com.br" → "https://site.com.br",
// "fulana@email.com" → "mailto:fulana@email.com". Endereço que não serve vira null.
export function normalizarLink(texto: string): string | null {
  const t = texto.trim();
  if (!t || /\s/.test(t)) return null;
  let url = t;
  if (!/^[a-z][a-z\d+.-]*:(?!\d)/i.test(t)) {
    if (!t.includes(".")) return null;
    url = /^[^/@]+@[^/@]+$/.test(t) ? `mailto:${t}` : `https://${t}`;
  }
  return linkPermitido(url) ? url : null;
}

// Toda marca de link no documento aponta para um endereço permitido.
function linksPermitidos(no: unknown): boolean {
  if (typeof no !== "object" || no === null) return true;
  const { marks, content } = no as { marks?: unknown; content?: unknown };
  if (Array.isArray(marks)) {
    for (const m of marks) {
      const marca = m as { type?: unknown; attrs?: { href?: unknown } } | null;
      if (marca?.type === "link" && !linkPermitido(marca.attrs?.href)) return false;
    }
  }
  return !Array.isArray(content) || content.every(linksPermitidos);
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
