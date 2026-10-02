import "server-only";

import { headers } from "next/headers";

// Na Vercel, o primeiro item do x-forwarded-for é o IP real do cliente.
export async function obterIp() {
  const lista = (await headers()).get("x-forwarded-for");
  return lista?.split(",")[0]?.trim() || "desconhecido";
}
