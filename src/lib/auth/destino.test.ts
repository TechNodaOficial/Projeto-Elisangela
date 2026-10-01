import { describe, expect, it } from "vitest";

import { destinoSeguro } from "./destino";

describe("destinoSeguro", () => {
  it.each(["/painel", "/painel/festas/abc", "/painel?aba=concluidas", "/painel#topo"])(
    "aceita o caminho interno %s",
    (caminho) => {
      expect(destinoSeguro(caminho)).toBe(caminho);
    },
  );

  it.each([
    "https://site-falso.com/painel",
    "//site-falso.com/painel",
    "/\\site-falso.com",
    "/painel\\@site-falso.com",
    "/painelfalso",
    "/login",
    "",
    null,
    undefined,
  ])("recusa %s e volta para /painel", (caminho) => {
    expect(destinoSeguro(caminho)).toBe("/painel");
  });
});
