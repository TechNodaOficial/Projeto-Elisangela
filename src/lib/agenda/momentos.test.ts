import { describe, expect, it } from "vitest";

import { momentosDoDia } from "./momentos";

const c = (id: string, hora: string, horaFim = "") => ({ id, hora, horaFim });

describe("momentosDoDia", () => {
  it("fora de hoje (sem hora atual), nenhum compromisso ganha situação", () => {
    expect(momentosDoDia([c("a", "09:00")]).size).toBe(0);
  });

  it("separa o que passou, o que está acontecendo e o próximo", () => {
    const m = momentosDoDia(
      [
        c("depois", "16:00"),
        c("cedo", "09:00", "10:00"),
        c("agora", "14:00", "15:00"),
        c("tarde", "15:30"),
      ],
      "14:30",
    );
    expect(m.get("cedo")).toBe("passou");
    expect(m.get("agora")).toBe("agora");
    expect(m.get("tarde")).toBe("proximo");
    expect(m.get("depois")).toBeUndefined();
  });

  it("sem horário de fim, conta 1 hora de duração", () => {
    const m = momentosDoDia([c("a", "13:00"), c("b", "13:45")], "14:00");
    expect(m.get("a")).toBe("passou");
    expect(m.get("b")).toBe("agora");
  });
});
