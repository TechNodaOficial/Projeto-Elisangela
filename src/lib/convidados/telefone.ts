// Telefones brasileiros: guardamos só os dígitos com DDD (10 ou 11), sem o 55.

export function normalizarTelefone(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.length === 0) return null;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    digitos = digitos.slice(2);
  }
  if ((digitos.length === 11 || digitos.length === 12) && digitos.startsWith("0")) {
    digitos = digitos.slice(1); // "0 19 ..." com o zero de discagem interurbana
  }
  return digitos.length === 10 || digitos.length === 11 ? digitos : null;
}

// "19998765432" → "(19) 99876-5432"
export function formatarTelefone(digitos: string): string {
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const corte = numero.length === 9 ? 5 : 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

// Sem telefone, o WhatsApp abre e deixa escolher o contato.
export function linkWhatsApp(telefone: string | null, texto: string): string {
  const destino = telefone ? `55${telefone}` : "";
  return `https://wa.me/${destino}?text=${encodeURIComponent(texto)}`;
}
