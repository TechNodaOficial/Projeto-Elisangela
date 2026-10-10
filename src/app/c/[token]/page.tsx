import { Download, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconeInstagram, IconeWhatsApp } from "@/components/icones-marca";
import { contatoElisangela } from "@/lib/contato";
import { nomeDaSaudacao } from "@/lib/convidados/saudacao";
import { linkWhatsApp } from "@/lib/convidados/telefone";
import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { DO_BANCO } from "@/lib/convites/membros";
import { faseDoConvite, prazoDoConvite } from "@/lib/convites/prazo";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { qrSvg } from "@/lib/convites/qr";
import { FUSO, partesData } from "@/lib/datas";
import { obterIp } from "@/lib/ip";

import { Aviso, Moldura } from "@/components/moldura-publica";
import { RegistrarAbertura } from "./registrar-abertura";
import { Recado } from "./recado";
import { Resposta } from "./resposta";

// Link pessoal: não indexar e não vazar o token para outros sites pelo Referer.

// Letra cursiva de convite, só no nome da festa (o resto segue na fonte do painel).
const letraConvite = Great_Vibes({ weight: "400", subsets: ["latin", "latin-ext"] });

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
  // "sábado, 21 de novembro de 2026" → "novembro".
  const mesLongo = data.extenso.split(" de ")[1] ?? data.mes;
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
        className="folha overflow-hidden px-5 pt-(--linha) pb-(--linha) leading-(--linha)"
      >
        {/* Topo como convite impresso: quem é convidado, o nome da festa em letra de convite
            e a faixa da data. Tudo centralizado; a resposta, mais abaixo, é formulário. */}
        <header className="text-center">
          <p className="text-tinta-suave">
            Olá, <span className="text-foreground font-semibold">{saudacao}</span>
          </p>
          {familia && (
            <p className="text-tinta-suave text-sm leading-snug">
              Convite para {convite.pessoas} pessoas
            </p>
          )}
          <h1
            id="titulo-festa"
            className={`${letraConvite.className} mt-3 text-[2.75rem] leading-[1.15] text-balance break-words`}
          >
            {festa.titulo}
          </h1>

          {/* Faixa da data: dia da semana | dia | horário, com mês e ano embaixo. */}
          <div className="mx-auto mt-5 grid max-w-[18rem] grid-cols-[1fr_auto_1fr] items-center">
            <span className="border-foreground/25 border-y py-1.5 text-xs font-medium tracking-[0.16em] uppercase">
              {semana}
            </span>
            <span className="px-4 text-[3.25rem] leading-none font-light tracking-[-0.04em] tabular-nums">
              {Number(data.dia)}
            </span>
            <span className="border-foreground/25 border-y py-1.5 font-mono text-sm">
              {data.hora}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium tracking-[0.16em] uppercase">
            {mesLongo} · {data.ano}
          </p>

          {status && (
            <p role="status" className="mt-5 text-lg font-semibold">
              <span key={estado} className={estado === "encerrado" ? "text-tinta-suave" : "grifo"}>
                {status}
              </span>
            </p>
          )}
        </header>

        {svg && (
          // Canhoto destacável: picote em cima e embaixo, papel liso por trás do QR, tudo centralizado.
          <section
            aria-label="QR Code de entrada"
            className="bg-card border-pauta-forte/70 relative -mx-5 mt-(--linha) flex flex-col items-center border-y-2 border-dashed px-5 py-[calc(var(--linha)-2px)] text-center"
          >
            <p className="text-tinta-suave max-w-xs text-sm leading-snug text-balance">
              {familia
                ? `Um código só para as ${confirmadas} pessoas. Quem chegar depois mostra o mesmo código.`
                : "Apresente este código na entrada."}
            </p>
            <div
              className="mt-4 size-[calc(var(--linha)*8)] max-w-full [&>svg]:size-full"
              role="img"
              aria-label={`QR Code de entrada de ${convite.nome}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-3 font-semibold">{convite.nome}</p>
            <a
              href={`/c/${token}/qr`}
              download
              className="bg-primary text-primary-foreground hover:bg-primary/80 focus-visible:outline-ring mt-4 mb-1 inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Download aria-hidden className="size-4" strokeWidth={1.75} />
              Salvar imagem
            </a>
          </section>
        )}

        {/* Onde: o local em destaque, o endereço e o traje logo abaixo, e o mapa. */}
        <section aria-labelledby="titulo-local" className="mt-(--linha) text-center">
          <h2 id="titulo-local" className="text-lg leading-snug font-semibold text-balance">
            {festa.localNome}
          </h2>
          <p className="text-tinta-suave mt-1 leading-snug text-balance">{festa.endereco}</p>
          {festa.traje && (
            <p className="mt-2 text-sm leading-snug">
              <span className="text-tinta-suave">Traje:</span> {festa.traje}
            </p>
          )}
          <a
            href={mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pastel-menta focus-visible:outline-ring mt-4 flex h-12 items-center justify-center gap-2 rounded-lg text-[0.9375rem] font-semibold transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <MapPin aria-hidden className="size-5" strokeWidth={1.75} />
            Como chegar
          </a>
        </section>

        {estado !== "presente" && estado !== "encerrado" && (
          // A resposta, separada por um fio: daqui para baixo é formulário, alinhado à esquerda.
          <div className="border-pauta mt-(--linha) border-t">
            <Resposta
              token={token}
              estado={estado}
              pessoas={convite.pessoas}
              confirmadas={confirmadas}
              criancas4a11={convite.criancas4a11}
              criancas0a3={convite.criancas0a3}
              membros={convite.membros.map((m) => ({ nome: m.nome, faixa: DO_BANCO[m.faixa] }))}
              pedirNomes={festa.mesasDemarcadas}
              fase={faseDoConvite(festa.dataHora)}
              prazo={prazoDoConvite(festa.dataHora)}
            />
          </div>
        )}
      </article>

      {estado !== "encerrado" && (
        <Recado token={token} salva={convite.mensagem} recusou={estado === "recusado"} />
      )}

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
