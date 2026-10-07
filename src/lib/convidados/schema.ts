import { z } from "zod";

import { normalizarTelefone } from "./telefone";

export const PESSOAS_MAXIMO = 30;

export const SchemaConvidado = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(120, "Use até 120 caracteres."),
  // Um convite pode ser de uma família ou grupo ("Família Silva", 4 pessoas).
  pessoas: z.string().transform((valor, ctx) => {
    if (!valor.trim()) return 1;
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 1 || n > PESSOAS_MAXIMO) {
      ctx.addIssue({ code: "custom", message: `De 1 a ${PESSOAS_MAXIMO} pessoas.` });
      return z.NEVER;
    }
    return n;
  }),
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
    pessoas: String(formData.get("pessoas") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
  };
}
