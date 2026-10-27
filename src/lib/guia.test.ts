import { describe, expect, it } from "vitest";

import { guiaDaPagina } from "./guia";

describe("guiaDaPagina", () => {
  it.each([
    ["/painel", "painel"],
    ["/painel/festas/abc123", "festa"],
    ["/painel/festas/abc123/fornecedores", "festa-fornecedores"],
    ["/painel/festas/abc123/cronograma", "festa-cronograma"],
    ["/painel/festas/abc123/convidados", "festa-convidados"],
    ["/painel/festas/abc123/croqui", "festa-layout"],
    ["/painel/festas/abc123/mesas", "festa-croqui"],
    ["/painel/festas/abc123/cerimonial", "festa-cerimonial"],
    ["/painel/festas/abc123/entradas", "festa-entradas"],
    ["/painel/festas/abc123/padrinhos", "festa-padrinhos"],
    ["/painel/festas/abc123/portaria", "festa-portaria"],
    ["/painel/festas/abc123/observacoes/convidados", "festa-observacoes"],
    ["/painel/festas/nova", "nova-festa"],
    ["/painel/fornecedores", "fornecedores"],
    ["/painel/fornecedores/servicos", "servicos"],
    ["/painel/concluidas", "concluidas"],
    ["/painel/checkin", "checkin"],
    ["/painel/agenda", "agenda"],
  ])("%s usa o guia %s", (caminho, id) => {
    expect(guiaDaPagina(caminho).id).toBe(id);
  });

  it("página sem guia próprio usa o do painel, mas não abre sozinho nela", () => {
    const guia = guiaDaPagina("/painel/festas/abc123/editar");
    expect(guia.id).toBe("painel");
    expect(guia.rota.test("/painel/festas/abc123/editar")).toBe(false);
  });
});
