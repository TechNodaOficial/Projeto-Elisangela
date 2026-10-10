import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { NOME_COOKIE_TEMA, temaValido } from "@/lib/tema";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel de Festas",
  description: "Gestão de festas, convidados e check-in",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Toda página renderiza a cada requisição: o nonce da CSP (src/proxy.ts) muda sempre,
  // e uma página estática sairia sem ele, com os scripts bloqueados.
  await connection();
  const tema = temaValido((await cookies()).get(NOME_COOKIE_TEMA)?.value);
  return (
    <html
      lang="pt-BR"
      data-tema={tema}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
