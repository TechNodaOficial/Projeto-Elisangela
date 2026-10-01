import { z } from "zod";

import { normalizarTelefone } from "@/lib/convidados/telefone";

import { lerValorEmCentavos } from "./formatos";

const textoObrigatorio = (mensagem: string, max = 120) =>
  z.string().trim().min(1, mensagem).max(max, `Use até ${max} caracteres.`);

const telefoneOpcional = z
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
  });

export const SchemaFornecedor = z.object({
  nome: textoObrigatorio("Informe o nome."),
  servico: textoObrigatorio("Informe o serviço (ex.: Buffet, DJ).", 80),
  telefone: telefoneOpcional,
  valor: z.string().transform((valor, ctx) => {
    const centavos = lerValorEmCentavos(valor);
    if (centavos === undefined) {
      ctx.addIssue({ code: "custom", message: "Use só números, ex.: 1.500,00." });
      return z.NEVER;
    }
    return centavos;
  }),
});
export const CAMPOS_FORNECEDOR = ["nome", "servico", "telefone", "valor"] as const;

export const SchemaMesa = z.object({
  nome: textoObrigatorio("Dê um nome para a mesa (ex.: Mesa 1).", 60),
  lugares: z.coerce
    .number({ error: "Informe quantos lugares." })
    .int("Use um número inteiro.")
    .min(1, "Pelo menos 1 lugar.")
    .max(500, "No máximo 500 lugares."),
});
export const CAMPOS_MESA = ["nome", "lugares"] as const;

// Responsável: "f:<id>" = fornecedor cadastrado, "outro" = texto livre, "" = ninguém.
export const SchemaItemCronograma = z
  .object({
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe o horário."),
    atividade: textoObrigatorio("Descreva a atividade.", 160),
    responsavel: z.string(),
    responsavelTexto: z.string().trim().max(80, "Use até 80 caracteres."),
  })
  .transform(({ responsavel, responsavelTexto, ...resto }) => ({
    ...resto,
    fornecedorId: responsavel.startsWith("f:") ? responsavel.slice(2) : null,
    responsavelTexto: responsavel === "outro" && responsavelTexto ? responsavelTexto : null,
  }));
export const CAMPOS_CRONOGRAMA = ["hora", "atividade", "responsavel", "responsavelTexto"] as const;
