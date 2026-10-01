const DESTINO_PADRAO = "/painel";

// Para onde mandar depois do login. Só aceita caminhos internos do painel,
// para que um link malicioso (?de=https://site-falso) não redirecione para fora.
export function destinoSeguro(de: unknown): string {
  if (typeof de !== "string" || de.includes("\\")) {
    return DESTINO_PADRAO;
  }
  return /^\/painel(?:[/?#]|$)/.test(de) ? de : DESTINO_PADRAO;
}
