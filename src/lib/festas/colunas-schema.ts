import { z } from "zod";

import { normalizarTelefone } from "@/lib/convidados/telefone";

import { lerValorEmCentavos } from "./formatos";
import { PARCELAS_MAXIMO } from "./parcelas";

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

// Base geral de fornecedores.
export const SchemaFornecedor = z.object({
  nome: textoObrigatorio("Informe o nome."),
  servicoId: z.string().min(1, "Escolha o serviço."),
  telefone: telefoneOpcional,
});
export const CAMPOS_FORNECEDOR = ["nome", "servicoId", "telefone"] as const;

export const SchemaServico = z.object({
  nome: textoObrigatorio("Dê um nome ao serviço (ex.: Buffet).", 60),
});
export const CAMPOS_SERVICO = ["nome"] as const;

// Item de checklist (do modelo de um serviço ou de uma festa).
export const SchemaItem = z.object({
  texto: textoObrigatorio("Escreva o item.", 120),
});
export const CAMPOS_ITEM = ["texto"] as const;

// Serviço numa festa: qual serviço contratar.
export const SchemaNovaContratacao = z.object({
  servicoId: z.string().min(1, "Escolha o serviço."),
});
export const CAMPOS_NOVA_CONTRATACAO = ["servicoId"] as const;

// Serviço numa festa: fornecedor escolhido (vazio = ainda não escolheu), valor e em quantas vezes.
export const SchemaContratacao = z.object({
  fornecedorId: z.string().transform((v) => v || null),
  valor: z.string().transform((valor, ctx) => {
    const centavos = lerValorEmCentavos(valor);
    if (centavos === undefined) {
      ctx.addIssue({ code: "custom", message: "Use só números, ex.: 1.500,00." });
      return z.NEVER;
    }
    return centavos;
  }),
  parcelas: z.string().transform((valor, ctx) => {
    if (!valor.trim()) return 1;
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 1 || n > PARCELAS_MAXIMO) {
      ctx.addIssue({ code: "custom", message: `De 1 a ${PARCELAS_MAXIMO} vezes.` });
      return z.NEVER;
    }
    return n;
  }),
});
export const CAMPOS_CONTRATACAO = ["fornecedorId", "valor", "parcelas"] as const;

export const SchemaMesa = z.object({
  nome: textoObrigatorio("Dê um nome para a mesa (ex.: Mesa 1).", 60),
  lugares: z.coerce
    .number({ error: "Informe quantos lugares." })
    .int("Use um número inteiro.")
    .min(1, "Pelo menos 1 lugar.")
    .max(500, "No máximo 500 lugares."),
});
export const CAMPOS_MESA = ["nome", "lugares"] as const;

// Responsável: "c:<id>" = serviço contratado na festa, "outro" = texto livre, "" = ninguém.
export const SchemaItemCronograma = z
  .object({
    hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe o horário."),
    atividade: textoObrigatorio("Descreva a atividade.", 160),
    responsavel: z.string(),
    responsavelTexto: z.string().trim().max(80, "Use até 80 caracteres."),
  })
  .transform(({ responsavel, responsavelTexto, ...resto }) => ({
    ...resto,
    contratacaoId: responsavel.startsWith("c:") ? responsavel.slice(2) : null,
    responsavelTexto: responsavel === "outro" && responsavelTexto ? responsavelTexto : null,
  }));
export const CAMPOS_CRONOGRAMA = ["hora", "atividade", "responsavel", "responsavelTexto"] as const;

// ── Menu, entradas da cerimônia e padrinhos ─────────────────────────────────

export const ETAPAS_MENU = [
  "Entrada",
  "Prato principal",
  "Acompanhamentos",
  "Sobremesa",
  "Bebidas",
  "Outros",
] as const;

export const SchemaItemMenu = z.object({
  etapa: z.enum(ETAPAS_MENU, { error: "Escolha a etapa." }),
  texto: textoObrigatorio("Escreva o item do menu.", 160),
});
export const CAMPOS_MENU = ["etapa", "texto"] as const;

export const SchemaEntrada = z.object({
  quem: textoObrigatorio("Quem entra? Ex.: Pais da noiva.", 120),
  musica: z
    .string()
    .trim()
    .max(160, "Use até 160 caracteres.")
    .transform((v) => v || null),
});
export const CAMPOS_ENTRADA = ["quem", "musica"] as const;

export const SchemaPadrinho = z.object({
  nome: textoObrigatorio("Informe o nome."),
  telefone: telefoneOpcional,
});
export const CAMPOS_PADRINHO = ["nome", "telefone"] as const;

// Checklist com que cada padrinho começa (dá para tirar e acrescentar itens).
export const CHECKLIST_PADRINHO = [
  "Confirmou presença",
  "Traje definido",
  "Foi ao ensaio",
  "Chegou no dia",
] as const;
