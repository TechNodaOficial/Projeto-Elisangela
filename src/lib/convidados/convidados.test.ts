import { describe, expect, it } from "vitest";

import { paraInstante } from "@/lib/datas";

import { mensagemConvite } from "./mensagem";
import { formatarTelefone, linkWhatsApp, normalizarTelefone } from "./telefone";

describe("normalizarTelefone", () => {
  it.each([
    ["(19) 99876-5432", "19998765432"],
    ["19 3234-5678", "1932345678"],
    ["+55 19 99876-5432", "19998765432"],
    ["5519998765432", "19998765432"],
    ["019998765432", "19998765432"],
  ])("%s → %s", (entrada, esperado) => {
    expect(normalizarTelefone(entrada)).toBe(esperado);
  });

  it.each(["", "   ", "123", "9876-5432", "199987654321234"])("recusa %j", (entrada) => {
    expect(normalizarTelefone(entrada)).toBeNull();
  });
});

describe("formatarTelefone", () => {
  it("celular e fixo", () => {
    expect(formatarTelefone("19998765432")).toBe("(19) 99876-5432");
    expect(formatarTelefone("1932345678")).toBe("(19) 3234-5678");
  });
});

describe("linkWhatsApp", () => {
  it("com telefone vai direto para a conversa, com o 55 do Brasil", () => {
    expect(linkWhatsApp("19998765432", "Oi & tchau")).toBe(
      "https://wa.me/5519998765432?text=Oi%20%26%20tchau",
    );
  });

  it("sem telefone deixa escolher o contato", () => {
    expect(linkWhatsApp(null, "Oi")).toBe("https://wa.me/?text=Oi");
  });
});

describe("mensagemConvite", () => {
  it("usa o primeiro nome, a data no fuso de São Paulo e o link", () => {
    const texto = mensagemConvite({
      nomeConvidado: "  Maria  Souza ",
      tituloFesta: "Casamento Ana e João",
      dataHora: paraInstante("2026-10-03", "19:30"),
      localNome: "Espaço Jardim das Flores",
      link: "https://exemplo.com/c/abc",
    });

    expect(texto).toBe(
      "Olá, Maria!\n\n" +
        "Você está na lista de convidados de Casamento Ana e João: sábado, 3 de outubro, às 19:30, em Espaço Jardim das Flores.\n\n" +
        "Confirme sua presença até 23/09 por este link: https://exemplo.com/c/abc",
    );
  });

  it("convite de família usa o nome todo e fala no plural", () => {
    const texto = mensagemConvite({
      nomeConvidado: "Família Silva",
      pessoas: 4,
      tituloFesta: "Casamento Ana e João",
      dataHora: paraInstante("2026-10-03", "19:30"),
      localNome: "Espaço Jardim das Flores",
      link: "https://exemplo.com/c/abc",
    });

    expect(texto).toBe(
      "Olá, Família Silva!\n\n" +
        "Vocês estão na lista de convidados de Casamento Ana e João: sábado, 3 de outubro, às 19:30, em Espaço Jardim das Flores.\n\n" +
        "Confirme a presença até 23/09 por este link: https://exemplo.com/c/abc",
    );
  });
});
