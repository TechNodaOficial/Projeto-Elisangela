import { randomBytes } from "node:crypto";

// 16 bytes = 128 bits de entropia, impossível de adivinhar por tentativa.
// base64url gera 22 caracteres seguros para URL e QR Code.
const BYTES_TOKEN = 16;

export function gerarToken(): string {
  return randomBytes(BYTES_TOKEN).toString("base64url");
}

export function gerarTokensConvidado() {
  return {
    tokenConvite: gerarToken(),
    codigoCheckin: gerarToken(),
  };
}
