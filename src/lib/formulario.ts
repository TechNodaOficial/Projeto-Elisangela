import { z } from "zod";

// Estado devolvido pelas server actions de formulário.
// `sucesso` muda a cada salvamento, para o formulário reagir (fechar, limpar, focar).
export type EstadoForm = {
  erros?: Record<string, string | undefined>;
  valores?: Record<string, string>;
  erroGeral?: string;
  sucesso?: number;
};

export function lerCampos(formData: FormData, nomes: readonly string[]): Record<string, string> {
  return Object.fromEntries(nomes.map((n) => [n, String(formData.get(n) ?? "")]));
}

// Valida e, se falhar, devolve o estado com a primeira mensagem de cada campo.
export function validarForm<S extends z.ZodType>(
  schema: S,
  valores: Record<string, string>,
): { ok: true; dados: z.output<S> } | { ok: false; estado: EstadoForm } {
  const resultado = schema.safeParse(valores);
  if (resultado.success) return { ok: true, dados: resultado.data };
  const erros = Object.fromEntries(
    Object.entries(z.flattenError(resultado.error).fieldErrors).map(([campo, msgs]) => [
      campo,
      (msgs as string[] | undefined)?.[0],
    ]),
  );
  return { ok: false, estado: { erros, valores } };
}
