import { describe, expect, it } from "vitest";

import { nomeDaSaudacao } from "./saudacao";

describe("nomeDaSaudacao", () => {
  it("uma pessoa: o primeiro nome", () => {
    expect(nomeDaSaudacao("  Maria  Souza ")).toBe("Maria");
    expect(nomeDaSaudacao("Lucas")).toBe("Lucas");
  });

  it("tratamento e parentesco vêm com o nome seguinte", () => {
    expect(nomeDaSaudacao("Tia Cida")).toBe("Tia Cida");
    expect(nomeDaSaudacao("Vô Antônio")).toBe("Vô Antônio");
    expect(nomeDaSaudacao("Dona Maria Souza")).toBe("Dona Maria");
    expect(nomeDaSaudacao("Dr. Paulo Reis")).toBe("Dr. Paulo");
    expect(nomeDaSaudacao("tio")).toBe("tio");
  });

  it("família ou casal: o nome todo", () => {
    expect(nomeDaSaudacao("Família Silva", 4)).toBe("Família Silva");
    expect(nomeDaSaudacao("Camila e Rafael Souza")).toBe("Camila e Rafael Souza");
  });
});
