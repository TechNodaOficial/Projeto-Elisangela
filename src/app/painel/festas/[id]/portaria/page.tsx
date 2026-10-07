import { KeyRound, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { linkWhatsApp } from "@/lib/convidados/telefone";
import { FUSO } from "@/lib/datas";
import { buscarFesta } from "@/lib/festas/consultas";
import { origemDoSite } from "@/lib/origem";
import { janelaPortaria, situacaoPortaria } from "@/lib/portaria/janela";
import { prisma } from "@/lib/prisma";

import { VoltarFesta } from "../voltar-festa";
import { cancelarPortaria, gerarPortaria } from "./actions";
import { BotaoCopiar } from "./copiar";

export async function generateMetadata(
  props: PageProps<"/painel/festas/[id]/portaria">,
): Promise<Metadata> {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  return { title: festa ? `Portaria · ${festa.titulo}` : "Festa não encontrada" };
}

const quando = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

// Link da portaria: os ajudantes da entrada usam só o leitor de QR desta festa, no dia.
export default async function PaginaPortaria(props: PageProps<"/painel/festas/[id]/portaria">) {
  const { id } = await props.params;
  const festa = await buscarFesta(id);
  if (!festa) notFound();

  const { abre, fecha } = janelaPortaria(festa.dataHora);
  const situacao = situacaoPortaria(festa.dataHora);
  const link = festa.portariaToken
    ? `${await origemDoSite()}/portaria/${festa.portariaToken}`
    : null;
  const conectados = link
    ? await prisma.sessaoPortaria.count({
        where: { festaId: festa.id, expiraEm: { gt: new Date() } },
      })
    : 0;

  return (
    <div className="w-full max-w-2xl">
      <VoltarFesta festa={festa} />
      <section className="folha px-5 py-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <KeyRound aria-hidden className="size-5" strokeWidth={1.75} />
          Portaria
        </h1>
        <p className="text-tinta-suave mt-1 text-sm">
          Para quem vai ajudar na entrada: o link abre <strong>só o leitor de QR Code</strong> desta
          festa (ler QR, buscar nome, deixar entrar, escolher mesa), sem acesso ao resto do painel.
          Funciona de {quando(abre)} até {quando(fecha)}.
        </p>

        {!link ? (
          <form action={gerarPortaria.bind(null, festa.id)} className="mt-5">
            <Button type="submit" className="h-11">
              <KeyRound aria-hidden strokeWidth={1.75} />
              Gerar link da portaria
            </Button>
          </form>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <div className="bg-pastel-rosa rounded-xl p-4">
              <p className="text-tinta-suave text-sm">
                PIN (fale pessoalmente, não mande junto do link)
              </p>
              <p className="font-mono text-4xl font-semibold tracking-[0.3em]">
                {festa.portariaPin}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-tinta-suave text-sm">Link para os ajudantes</p>
              <p className="bg-muted rounded-lg px-3 py-2 font-mono text-sm break-all">{link}</p>
              <div className="flex flex-wrap gap-2">
                <BotaoCopiar texto={link} />
                <Button asChild variant="outline" className="bg-card h-10">
                  <a
                    href={linkWhatsApp(
                      null,
                      `Olá! Este é o link da portaria de ${festa.titulo}: ${link}\nO PIN eu te passo pessoalmente.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden strokeWidth={1.75} />
                    Mandar no WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <p className="text-tinta-suave text-sm">
              {situacao === "aberta"
                ? `Portaria aberta agora · ${conectados} ${conectados === 1 ? "aparelho conectado" : "aparelhos conectados"}.`
                : situacao === "antes"
                  ? `O link só funciona a partir de ${quando(abre)}.`
                  : "A portaria desta festa já foi encerrada."}
            </p>

            <div className="border-border flex flex-wrap gap-2 border-t pt-4">
              <ConfirmarExclusao
                titulo="Gerar link e PIN novos?"
                descricao="O link antigo para de funcionar e quem estiver no leitor sai. Mande o link novo para os ajudantes."
                rotuloConfirmar="Gerar novos"
                rotuloEnviando="Gerando…"
                acao={gerarPortaria.bind(null, festa.id)}
                gatilho={
                  <Button type="button" variant="outline" className="bg-card h-10">
                    <RefreshCw aria-hidden strokeWidth={1.75} />
                    Gerar novo link e PIN
                  </Button>
                }
              />
              <ConfirmarExclusao
                titulo="Cancelar o link da portaria?"
                descricao="Ninguém mais entra pelo link, e quem estiver no leitor perde o acesso."
                rotuloConfirmar="Cancelar link"
                rotuloEnviando="Cancelando…"
                acao={cancelarPortaria.bind(null, festa.id)}
                gatilho={
                  <Button type="button" variant="outline" className="bg-card text-destructive h-10">
                    <Trash2 aria-hidden strokeWidth={1.75} />
                    Cancelar link
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
