import { z } from "zod";

import { normalizarTelefone } from "./telefone";

export const SchemaConvidado = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(120, "Use até 120 caracteres."),
  telefone: z
    .string()
    .trim()
    .transform((valor, ctx) => {
      if (!valor) return null;
      const normalizado = normalizarTelefone(valor);
      if (!normalizado) {
        ctx.addIssue({ code: "custom", message: "Use DDD + número, ex.: (19) 99876-5432." });
        return z.NEVER;
      }
      return normalizado;
    }),
});

export type CamposConvidado = z.input<typeof SchemaConvidado>;
export type ErrosConvidado = Partial<Record<keyof CamposConvidado, string>>;

export function lerFormularioConvidado(formData: FormData): CamposConvidado {
  return {
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
  };
}
