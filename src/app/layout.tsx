import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";
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
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
