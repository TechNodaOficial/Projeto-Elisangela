import { Download, MapPin, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconeInstagram, IconeWhatsApp } from "@/components/icones-marca";
import { contatoElisangela } from "@/lib/contato";
import { nomeDaSaudacao } from "@/lib/convidados/saudacao";
import { linkWhatsApp } from "@/lib/convidados/telefone";
import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { faseDoConvite, prazoDoConvite } from "@/lib/convites/prazo";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { qrSvg } from "@/lib/convites/qr";
import { FUSO, partesData } from "@/lib/datas";
import { obterIp } from "@/lib/ip";

import { Aviso, Moldura } from "@/components/moldura-publica";
import { RegistrarAbertura } from "./registrar-abertura";
import { Resposta } from "./resposta";

// Link pessoal: não indexar e não vazar o token para outros sites pelo Referer.
export const metadata: Metadata = {
  title: "Convite",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PaginaConvite(props: PageProps<"/c/[token]">) {
  const { token } = await props.params;

  const ip = await obterIp();
  if (await conviteBloqueado(ip))
    return (
      <Aviso titulo="Muitas tentativas" texto="Espere alguns minutos e abra o link de novo." />
    );

  const convite = await buscarConvite(token);
  if (!convite) {
    await registrarErroConvite(ip);
    notFound();
  }

  const { festa } = convite;
  const contato = contatoElisangela();
  // Abre o app de mapas no celular (ou o Google Maps no computador) já no endereço da festa.
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${festa.localNome}, ${festa.endereco}`,
  )}`;
  const estado = estadoConvite({ ...convite, dataHora: festa.dataHora });
  const data = partesData(festa.dataHora);
  const semana = data.extenso.split(",")[0];
  const familia = convite.pessoas > 1;
  // "Olá, Ana" / "Olá, Tia Cida" para uma pessoa; "Olá, Família Silva" para um grupo.
  const saudacao = nomeDaSaudacao(convite.nome, convite.pessoas);
  const confirmadas = Math.min(convite.confirmadas ?? convite.pessoas, convite.pessoas);
  const comQr = estado === "confirmado";
  const svg = comQr ? await qrSvg(convite.codigoCheckin) : null;
  const horaEntrada =
    convite.presenteEm &&
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(
      convite.presenteEm,
    );

  const status = {
    aberto: null,
    confirmado:
      convite.entraram > 0
        ? `${convite.entraram} de ${confirmadas} já entraram`
        : familia
          ? `${confirmadas} ${confirmadas === 1 ? "pessoa confirmada" : "pessoas confirmadas"}`
          : "Presença confirmada",
    recusado: "Você avisou que não vai",
    presente: `Entrada registrada às ${horaEntrada}`,
    encerrado: "Esta festa já aconteceu",
  }[estado];

  return (
    <Moldura>
      <RegistrarAbertura token={token} />
      <article
        aria-labelledby="titulo-festa"
        className="folha overflow-hidden pt-0 pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
      >
        {/* Faixa de festa no topo da folha: tons pastel com confete. Só enfeite. */}
        <div
          aria-hidden
          className="convite-faixa relative -mr-5 mb-(--linha) -ml-[calc(var(--margem)+0.875rem)] flex h-24 items-center justify-center"
        >
          <PartyPopper className="text-foreground/80 size-9" strokeWidth={1.5} />
        </div>
        <p className="text-lg">
          Olá, <span className="font-semibold">{saudacao}</span>
        </p>
        {familia && (
          <p className="text-tinta-suave text-sm leading-(--linha)">
            Convite para {convite.pessoas} pessoas
          </p>
        )}
        {status && (
          <p role="status" className="text-lg font-semibold">
            <span key={estado} className={estado === "encerrado" ? "text-tinta-suave" : "grifo"}>
              {status}
            </span>
          </p>
        )}

        {svg && (
          // Canhoto destacável: picote em cima e embaixo, papel liso por trás do QR, tudo centralizado.
          <section
            aria-label="QR Code de entrada"
            className="bg-card border-pauta-forte/70 relative mt-(--linha) -mr-5 -ml-[calc(var(--margem)+0.875rem)] flex flex-col items-center border-y-2 border-dashed px-5 py-[calc(var(--linha)-2px)] text-center"
          >
            <p className="text-tinta-suave max-w-xs text-sm leading-(--linha) text-balance">
              {familia
                ? `Um código só para as ${confirmadas} pessoas. Quem chegar depois mostra o mesmo código.`
                : "Apresente este código na entrada."}
            </p>
            <div
              className="mt-(--linha) size-[calc(var(--linha)*8)] max-w-full [&>svg]:size-full"
              role="img"
              aria-label={`QR Code de entrada de ${convite.nome}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-(--linha) font-semibold">{convite.nome}</p>
            <a
              href={`/c/${token}/qr`}
              download
              className="bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:outline-ring mt-[calc(var(--linha)+4px)] mb-1 inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Download aria-hidden className="size-4" strokeWidth={1.75} />
              Salvar imagem
            </a>
          </section>
        )}

        <header className="mt-(--linha) flex items-start gap-3">
          <span className="font-mono text-[4.25rem] leading-[calc(var(--linha)*3)] font-medium tracking-[-0.04em]">
            {data.dia}
          </span>
          <span className="flex flex-col text-sm leading-(--linha)">
            <span className="font-semibold tracking-[0.04em] uppercase">
              {data.mes} {data.ano}
            </span>
            <span className="text-tinta-suave first-letter:uppercase">{semana}</span>
            <span className="font-mono">{data.hora}</span>
          </span>
        </header>

        <h1
          id="titulo-festa"
          className="text-2xl leading-(--linha) font-semibold tracking-[-0.02em] text-balance"
        >
          {festa.titulo}
        </h1>

        <dl className="mt-(--linha)">
          {[
            { rotulo: "Local", valor: festa.localNome },
            { rotulo: "Endereço", valor: festa.endereco },
            ...(festa.traje ? [{ rotulo: "Traje", valor: festa.traje }] : []),
          ].map((linha) => (
            <div key={linha.rotulo} className="grid grid-cols-[5.5rem_1fr]">
              <dt className="text-tinta-suave text-sm leading-(--linha)">{linha.rotulo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>

        <a
          href={mapa}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-pastel-menta focus-visible:outline-ring mt-(--linha) flex h-12 items-center justify-center gap-2 rounded-lg text-[0.9375rem] font-semibold transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
          Como chegar
        </a>

        {estado !== "presente" && estado !== "encerrado" && (
          <Resposta
            token={token}
            estado={estado}
            pessoas={convite.pessoas}
            confirmadas={confirmadas}
            fase={faseDoConvite(festa.dataHora)}
            prazo={prazoDoConvite(festa.dataHora)}
          />
        )}
      </article>

      {(contato.instagram || contato.whatsapp) && (
        <section aria-labelledby="titulo-organizacao" className="folha mt-4 px-5 py-4 text-center">
          <p className="text-tinta-suave text-sm">Organização</p>
          <h2 id="titulo-organizacao" className="text-lg font-semibold">
            Elisangela Schubert
          </h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {contato.instagram && (
              <a
                href={`https://www.instagram.com/${contato.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pastel-rosa focus-visible:outline-ring inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <IconeInstagram className="size-5" />
                Instagram
              </a>
            )}
            {contato.whatsapp && (
              <a
                href={linkWhatsApp(
                  contato.whatsapp,
                  `Olá, Elisangela! Sou ${convite.nome}, convidado(a) de ${festa.titulo}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pastel-menta focus-visible:outline-ring inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <IconeWhatsApp className="size-5" />
                WhatsApp
              </a>
            )}
          </div>
        </section>
      )}

      <p className="mt-4 px-1 text-sm">
        <Link
          href="/privacidade"
          className="text-tinta-suave hover:text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-2"
        >
          Como seus dados são usados
        </Link>
      </p>
    </Moldura>
  );
}
