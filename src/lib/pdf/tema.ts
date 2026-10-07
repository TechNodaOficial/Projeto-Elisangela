import "server-only";

import path from "node:path";

import { Font, StyleSheet } from "@react-pdf/renderer";

// Mesmo visual do painel (DESIGN.md), em versão para papel: tinta grafite, pauta azul
// clara e o marca-texto amarelo só no essencial. Cores convertidas de OKLCH para hex.
export const cor = {
  tinta: "#212325",
  suave: "#575b5f",
  pauta: "#bed3ef",
  grifo: "#f7e967",
  borda: "#d3d6da",
  superficie: "#f2f4f5",
};

// Logo da Elisangela Schubert (dourado sobre transparente, 900×412). Também vai na
// função da Vercel pelo next.config.ts.
export const LOGO = path.join(process.cwd(), "src/lib/pdf/logo.png");
export const PROPORCAO_LOGO = 412 / 900;

// Fontes Geist (licença OFL, ver fontes/OFL.txt), as mesmas do painel.
// Ficam em disco; next.config.ts inclui a pasta na função da Vercel.
const pasta = path.join(process.cwd(), "src/lib/pdf/fontes");
Font.register({
  family: "Geist",
  fonts: [
    { src: path.join(pasta, "Geist-Regular.ttf"), fontWeight: 400 },
    { src: path.join(pasta, "Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
});
Font.register({
  family: "GeistMono",
  fonts: [
    { src: path.join(pasta, "GeistMono-Regular.ttf"), fontWeight: 400 },
    { src: path.join(pasta, "GeistMono-Medium.ttf"), fontWeight: 500 },
  ],
});
// Sem hifenização automática: nomes próprios não devem ser quebrados.
Font.registerHyphenationCallback((palavra) => [palavra]);

export const base = StyleSheet.create({
  pagina: {
    fontFamily: "Geist",
    fontSize: 10,
    color: cor.tinta,
    backgroundColor: "#ffffff",
  },
  // O lineHeight fica num View em volta do conteúdo, não na página: herdado da página,
  // ele some com os textos de número de página (render) — bug do react-pdf 4.
  // fontSize junto: sem ele o View calcula o 1.45 sobre o tamanho padrão (18pt).
  conteudo: { fontSize: 10, lineHeight: 1.45 },
  mono: { fontFamily: "GeistMono" },
  suave: { color: cor.suave },
  rotulo: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: cor.suave,
  },
  forte: { fontWeight: 600 },
});
