import { describe, expect, it } from "vitest";

import {
  documentoValido,
  documentoVazio,
  ehSecaoObservacao,
  TAMANHO_MAXIMO_DOCUMENTO,
} from "./observacoes";

const paragrafo = (text?: string) => ({
  type: "paragraph",
  ...(text ? { content: [{ type: "text", text }] } : {}),
});

describe("documentoValido", () => {
  it("aceita o documento do editor", () => {
    expect(documentoValido({ type: "doc", content: [paragrafo("Oi")] })).toBe(true);
    expect(documentoValido({ type: "doc" })).toBe(true);
  });

  it("recusa o que não é documento", () => {
    for (const v of [null, "texto", [], { type: "paragraph" }, { type: "doc", content: "x" }]) {
      expect(documentoValido(v)).toBe(false);
    }
  });

  it("recusa documento grande demais", () => {
    const grande = { type: "doc", content: [paragrafo("x".repeat(TAMANHO_MAXIMO_DOCUMENTO))] };
    expect(documentoValido(grande)).toBe(false);
  });
});

describe("documentoVazio", () => {
  it("folha só com parágrafos vazios ou espaços é vazia", () => {
    expect(documentoVazio({ type: "doc", content: [paragrafo(), paragrafo("   ")] })).toBe(true);
  });

  it("qualquer texto, mesmo dentro de lista, conta", () => {
    const lista = {
      type: "bulletList",
      content: [{ type: "listItem", content: [paragrafo("Levar toalhas")] }],
    };
    expect(documentoVazio({ type: "doc", content: [lista] })).toBe(false);
  });
});

describe("ehSecaoObservacao", () => {
  it("só as seções do quadro", () => {
    expect(ehSecaoObservacao("croqui")).toBe(true);
    expect(ehSecaoObservacao("toString")).toBe(false);
    expect(ehSecaoObservacao("qualquer")).toBe(false);
  });
});
