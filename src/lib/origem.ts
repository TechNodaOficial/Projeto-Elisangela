import "server-only";

import { headers } from "next/headers";

// Endereço público do site (para montar links de convite e da portaria), igual ao do request.
export async function origemDoSite() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}
