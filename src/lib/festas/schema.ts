import { z } from "zod";

const textoOpcional = (max: number, mensagem: string) =>
  z
    .string()
    .trim()
    .max(max, mensagem)
    .transform((v) => v || null);

export const SchemaFesta = z.object({
  titulo: z.string().trim().min(1, "Dê um nome para a festa.").max(120, "Use até 120 caracteres."),
  data: z.iso.date("Informe a data."),
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe o horário."),
  localNome: z.string().trim().min(1, "Informe o local.").max(120, "Use até 120 caracteres."),
  endereco: z.string().trim().min(1, "Informe o endereço.").max(200, "Use até 200 caracteres."),
  traje: textoOpcional(80, "Use até 80 caracteres."),
  observacoes: textoOpcional(1000, "Use até 1000 caracteres."),
});

export type CamposFesta = z.input<typeof SchemaFesta>;
export type ErrosFesta = Partial<Record<keyof CamposFesta, string>>;

export function lerFormularioFesta(formData: FormData): CamposFesta {
  const texto = (nome: string) => String(formData.get(nome) ?? "");
  return {
    titulo: texto("titulo"),
    data: texto("data"),
    hora: texto("hora"),
    localNome: texto("localNome"),
    endereco: texto("endereco"),
    traje: texto("traje"),
    observacoes: texto("observacoes"),
  };
}
