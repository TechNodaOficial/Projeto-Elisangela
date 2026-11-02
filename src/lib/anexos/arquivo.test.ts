import { describe, expect, it } from "vitest";

import { ehHeic, nomeDoAnexo, tamanhoLegivel, tipoDoAnexo } from "./arquivo";

const bytes = (...b: number[]) => new Uint8Array(b);
const texto = (t: string) => new TextEncoder().encode(t);
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0];

describe("tipoDoAnexo", () => {
  it("reconhece PDF, PNG e JPG pelos bytes", () => {
    expect(tipoDoAnexo(texto("%PDF-1.7\n..."), "x.pdf")).toBe("pdf");
    expect(tipoDoAnexo(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0), "x")).toBe("png");
    expect(tipoDoAnexo(bytes(0xff, 0xd8, 0xff, 0xe0), "foto.jpeg")).toBe("jpeg");
  });

  it("diferencia Word e Excel pelo conteúdo do zip, não pelo nome", () => {
    expect(tipoDoAnexo(texto("PK\u0003\u0004...word/document.xml..."), "a.xlsx")).toBe("docx");
    expect(tipoDoAnexo(texto("PK\u0003\u0004...xl/workbook.xml..."), "a.docx")).toBe("xlsx");
  });

  it("recusa outros zips", () => {
    expect(tipoDoAnexo(texto("PK\u0003\u0004...fotos/1.jpg"), "fotos.zip")).toBeNull();
  });

  it("Word e Excel antigos valem pela extensão", () => {
    expect(tipoDoAnexo(bytes(...OLE), "Orçamento.DOC")).toBe("doc");
    expect(tipoDoAnexo(bytes(...OLE), "lista.xls")).toBe("xls");
    expect(tipoDoAnexo(bytes(...OLE), "apresentacao.ppt")).toBeNull();
  });

  it("recusa o resto, mesmo com nome de PDF", () => {
    expect(tipoDoAnexo(texto("<html>"), "contrato.pdf")).toBeNull();
    expect(tipoDoAnexo(bytes(), "vazio.pdf")).toBeNull();
  });
});

describe("ehHeic", () => {
  it("reconhece foto do iPhone", () => {
    expect(ehHeic(texto("\u0000\u0000\u0000\u0018ftypheic...."))).toBe(true);
    expect(ehHeic(texto("\u0000\u0000\u0000\u0018ftypmp42...."))).toBe(false);
    expect(ehHeic(texto("%PDF-1.7"))).toBe(false);
  });
});

describe("nomeDoAnexo", () => {
  it("tira caminho e caracteres estranhos", () => {
    expect(nomeDoAnexo('C:\\fakepath\\Lista "padrinhos".xlsx', "xlsx")).toBe(
      "Lista padrinhos.xlsx",
    );
  });

  it("sem nome, usa um padrão com a extensão certa", () => {
    expect(nomeDoAnexo("", "docx")).toBe("anexo.docx");
  });
});

describe("tamanhoLegivel", () => {
  it("mostra KB abaixo de 1 MB e MB com uma casa", () => {
    expect(tamanhoLegivel(200)).toBe("1 KB");
    expect(tamanhoLegivel(850 * 1024)).toBe("850 KB");
    expect(tamanhoLegivel(2.45 * 1024 * 1024)).toBe("2,5 MB");
  });
});
