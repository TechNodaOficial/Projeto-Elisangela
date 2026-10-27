import { z } from "zod";

import { paraInstante } from "@/lib/datas";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use até ${max} caracteres.`)
    .transform((v) => v || null);

// Compromisso da agenda: dia, horário de início e, se quiser, de fim (no mesmo dia).
export const SchemaCompromisso = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(1, "Diga o que é (ex.: Reunião com a noiva).")
      .max(120, "Use até 120 caracteres."),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe o dia."),
    hora: z.string().regex(HORA, "Informe o horário."),
    horaFim: z.union([z.literal(""), z.string().regex(HORA, "Use o formato 15:30.")]),
    local: textoOpcional(120),
    observacao: textoOpcional(500),
  })
  .refine((v) => !v.horaFim || v.horaFim > v.hora, {
    path: ["horaFim"],
    message: "O fim tem de ser depois do início.",
  })
  .transform(({ data, hora, horaFim, ...resto }) => ({
    ...resto,
    inicio: paraInstante(data, hora),
    fim: horaFim ? paraInstante(data, horaFim) : null,
  }));
export const CAMPOS_COMPROMISSO = [
  "titulo",
  "data",
  "hora",
  "horaFim",
  "local",
  "observacao",
] as const;
