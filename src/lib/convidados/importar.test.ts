import { describe, expect, it } from "vitest";

import { lerLista } from "./importar";

describe("lerLista", () => {
  it("lê o que vem do Excel (tabulação), com cabeçalho e em qualquer ordem", () => {
    const texto = [
      "Nome\tPessoas\tWhatsApp",
      "Família Silva\t4\t(19) 99876-5432",
      "Ana Souza",
      "\t",
      "+55 43 99938-6569\tCarlos Lima\t2",
    ].join("\n");
    expect(lerLista(texto)).toEqual([
      { linha: 2, nome: "Família Silva", pessoas: 4, telefone: "19998765432" },
      { linha: 3, nome: "Ana Souza", pessoas: 1, telefone: null },
      { linha: 5, nome: "Carlos Lima", pessoas: 2, telefone: "43999386569" },
    ]);
  });

  it("aceita ponto e vírgula e vírgula", () => {
    expect(lerLista("Bia; 3\nJoão, 19 3333-4444")).toEqual([
      { linha: 1, nome: "Bia", pessoas: 3, telefone: null },
      { linha: 2, nome: "João", pessoas: 1, telefone: "1933334444" },
    ]);
  });

  it("separa o WhatsApp do nome quando a linha vem só com espaços", () => {
    expect(lerLista("Ana Souza 19 99876-5432\nFamília Silva 4 (19) 99876-5433")).toEqual([
      { linha: 1, nome: "Ana Souza", pessoas: 1, telefone: "19998765432" },
      { linha: 2, nome: "Família Silva", pessoas: 4, telefone: "19998765433" },
    ]);
  });

  it("reconhece o número copiado do WhatsApp (com marcas invisíveis e hífen especial)", () => {
    // O WhatsApp cerca o número com U+202A/U+202C e usa espaço e hífen não separáveis.
    const doWhats = "‪+55 19 99876‑5432‬";
    expect(lerLista(`Ana\t${doWhats}`)).toEqual([
      { linha: 1, nome: "Ana", pessoas: 1, telefone: "19998765432" },
    ]);
  });

  it("aponta problemas sem perder as outras linhas", () => {
    const r = lerLista("Ana\nana\nBruno\t99\nCarla\t123456789\nDudu\nJorge\t3\t12345", [
      { nome: "Dudu", telefone: null },
    ]);
    expect(r.map((l) => l.problema)).toEqual([
      undefined,
      "Repetido na lista colada (mesmo nome e WhatsApp)",
      "De 1 a 30 pessoas",
      "WhatsApp inválido: 123456789",
      "Já está na lista (mesmo nome e WhatsApp)",
      "WhatsApp inválido: 12345",
    ]);
    expect(r[5].nome).toBe("Jorge");
  });

  it("mesmo nome com WhatsApp diferente é outra pessoa", () => {
    const r = lerLista(
      [
        "Mariana Costa\t1\t19 98765-1002",
        "Mariana Costa\t1\t19 98765-1008",
        "mariana costa\t1\t(19) 98765-1002",
        "Paulo Reis\t1\t19 99999-0001",
      ].join("\n"),
      [{ nome: "Paulo Reis", telefone: "19999990002" }],
    );
    expect(r.map((l) => l.problema)).toEqual([
      undefined,
      undefined,
      "Repetido na lista colada (mesmo nome e WhatsApp)",
      undefined,
    ]);
  });
});
