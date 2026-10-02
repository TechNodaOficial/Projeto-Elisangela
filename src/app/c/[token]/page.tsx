import { Download } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { qrSvg } from "@/lib/convites/qr";
import { FUSO, partesData } from "@/lib/datas";
import { obterIp } from "@/lib/ip";

import { Aviso, Moldura } from "./moldura";
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
  const estado = estadoConvite({ ...convite, dataHora: festa.dataHora });
  const data = partesData(festa.dataHora);
  const semana = data.extenso.split(",")[0];
  const primeiroNome = convite.nome.trim().split(/\s+/)[0];
  const comQr = estado === "confirmado";
  const svg = comQr ? await qrSvg(convite.codigoCheckin) : null;
  const horaEntrada =
    convite.presenteEm &&
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, timeStyle: "short" }).format(
      convite.presenteEm,
    );

  const status = {
    aberto: null,
    confirmado: "Presença confirmada",
    recusado: "Você avisou que não vai",
    presente: `Entrada registrada às ${horaEntrada}`,
    encerrado: "Esta festa já aconteceu",
  }[estado];

  return (
    <Moldura>
      <article
        aria-labelledby="titulo-festa"
        className="folha pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)"
      >
        <p className="text-lg">
          Olá, <span className="font-semibold">{primeiroNome}</span>
        </p>
        {status && (
          <p role="status" className="text-lg font-semibold">
            <span key={estado} className={estado === "encerrado" ? "text-tinta-suave" : "grifo"}>
              {status}
            </span>
          </p>
        )}

        {svg && (
          // Canhoto destacável: picote em cima e embaixo, papel liso por trás do QR.
          <section
            aria-label="QR Code de entrada"
            className="bg-card border-pauta-forte/70 relative mt-(--linha) -mr-5 -ml-[calc(var(--margem)+0.875rem)] border-y-2 border-dashed py-[calc(var(--linha)-2px)] pr-5 pl-[calc(var(--margem)+0.875rem)]"
          >
            <p className="text-tinta-suave text-sm leading-(--linha)">
              Apresente este código na entrada.
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

        {estado !== "presente" && estado !== "encerrado" && (
          <Resposta token={token} estado={estado} />
        )}
      </article>
    </Moldura>
  );
}
