import { describe, expect, it } from "vitest";

import { SchemaCompromisso } from "./schema";

const base = {
  titulo: "Reunião com a noiva",
  data: "2026-11-03",
  hora: "14:00",
  horaFim: "",
  local: "",
  observacao: "",
};

describe("SchemaCompromisso", () => {
  it("junta dia e horário no fuso de São Paulo", () => {
    const r = SchemaCompromisso.parse({ ...base, horaFim: "15:30", local: " Escritório " });
    expect(r.inicio.toISOString()).toBe("2026-11-03T17:00:00.000Z");
    expect(r.fim?.toISOString()).toBe("2026-11-03T18:30:00.000Z");
    expect(r.local).toBe("Escritório");
    expect(r.observacao).toBeNull();
  });

  it("fim é opcional", () => {
    expect(SchemaCompromisso.parse(base).fim).toBeNull();
  });

  it("recusa fim antes do início", () => {
    const r = SchemaCompromisso.safeParse({ ...base, horaFim: "13:00" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["horaFim"]);
  });

  it("exige título e horário", () => {
    expect(SchemaCompromisso.safeParse({ ...base, titulo: "  " }).success).toBe(false);
    expect(SchemaCompromisso.safeParse({ ...base, hora: "" }).success).toBe(false);
  });
});
