import "server-only";

import { normalizarTelefone } from "@/lib/convidados/telefone";

// Contato da Elisangela mostrado no convite. Vem de variáveis de ambiente para dar para
// trocar na Vercel sem mexer no código; o que estiver vazio ou inválido não aparece.
//   CONTATO_INSTAGRAM="elisangelaeventos"  (com ou sem @)
//   CONTATO_WHATSAPP="(19) 99876-5432"
export function contatoElisangela() {
  const instagram = process.env.CONTATO_INSTAGRAM?.trim().replace(/^@/, "") ?? "";
  return {
    instagram: /^[A-Za-z0-9._]{1,30}$/.test(instagram) ? instagram : null,
    whatsapp: normalizarTelefone(process.env.CONTATO_WHATSAPP ?? "") || null,
  };
}
