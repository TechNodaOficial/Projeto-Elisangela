import { describe, expect, it } from "vitest";

import {
  documentoValido,
  documentoVazio,
  ehSecaoObservacao,
  linkPermitido,
  normalizarLink,
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

const comLink = (href: unknown) => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "site", marks: [{ type: "link", attrs: { href } }] }],
    },
  ],
});

describe("links na folha", () => {
  it("aceita página, e-mail e telefone", () => {
    for (const href of [
      "https://buffet.com.br/cardapio",
      "http://x.com",
      "mailto:a@b.com",
      "tel:+5543999",
    ]) {
      expect(linkPermitido(href)).toBe(true);
      expect(documentoValido(comLink(href))).toBe(true);
    }
  });

  it("recusa link perigoso ou estranho", () => {
    for (const href of ["javascript:alert(1)", "data:text/html,oi", "/painel", "", null, 3]) {
      expect(linkPermitido(href)).toBe(false);
      expect(documentoValido(comLink(href))).toBe(false);
    }
  });

  it("completa o que ela digita", () => {
    expect(normalizarLink(" buffet.com.br/cardapio ")).toBe("https://buffet.com.br/cardapio");
    expect(normalizarLink("www.instagram.com/noiva")).toBe("https://www.instagram.com/noiva");
    expect(normalizarLink("fulana@email.com")).toBe("mailto:fulana@email.com");
    expect(normalizarLink("https://docs.google.com/x")).toBe("https://docs.google.com/x");
    expect(normalizarLink("javascript:alert(1)")).toBeNull();
    expect(normalizarLink("não é link")).toBeNull();
    expect(normalizarLink("oi")).toBeNull();
  });
});
