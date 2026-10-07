import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { buscarConvite } from "@/lib/convites/consultas";
import { estadoConvite } from "@/lib/convites/estado";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { qrPngDataUrl } from "@/lib/convites/qr";
import { partesData } from "@/lib/datas";
import { obterIp } from "@/lib/ip";

// Imagem para guardar na galeria do celular: a mesma folha da página, em escala 2×
// (pauta de 56px), com o canhoto picotado do QR e o nome do convidado.
const P = 56; // pauta: 2× a da tela (1.75rem)
const L = 1080;
const A = P * 27;
const MARGEM = 104; // linha de margem
const ESQ = 150; // início do texto
const DIR = 80;
const cor = {
  tinta: "#212325",
  suave: "#575b5f",
  pauta: "#bed3ef",
  margem: "#7ba0d6",
};

const pasta = path.join(process.cwd(), "src/lib/pdf/fontes");
const fontes = Promise.all([
  readFile(path.join(pasta, "Geist-Regular.ttf")),
  readFile(path.join(pasta, "Geist-SemiBold.ttf")),
  readFile(path.join(pasta, "GeistMono-Medium.ttf")),
]);

// Uma linha da folha: altura de uma pauta, texto assentado sobre o fio.
function Linha({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: P,
        paddingBottom: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Picote: traços na cor da linha de margem, de borda a borda.
function Picote() {
  return (
    <div style={{ display: "flex", width: L, height: 4, justifyContent: "space-between" }}>
      {Array.from({ length: 54 }, (_, i) => (
        <div key={i} style={{ width: 12, height: 4, backgroundColor: cor.margem, opacity: 0.7 }} />
      ))}
    </div>
  );
}

export async function GET(_request: Request, ctx: RouteContext<"/c/[token]/qr">) {
  const { token } = await ctx.params;
  const ip = await obterIp();
  if (await conviteBloqueado(ip)) return new Response("Muitas tentativas", { status: 429 });

  const convite = await buscarConvite(token);
  if (!convite) {
    await registrarErroConvite(ip);
    return new Response("Convite não encontrado", { status: 404 });
  }
  if (estadoConvite({ ...convite, dataHora: convite.festa.dataHora }) !== "confirmado") {
    return new Response("Este convite não tem QR Code ativo", { status: 404 });
  }

  const [regular, semibold, mono] = await fontes;
  const LADO_QR = P * 10;
  const qr = await qrPngDataUrl(convite.codigoCheckin, LADO_QR);
  const data = partesData(convite.festa.dataHora);
  const semana = data.extenso.split(",")[0];
  const primeiroNome = convite.nome.trim().split(/\s+/)[0];
  const arquivo = `convite-${primeiroNome}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  return new ImageResponse(
    <div
      style={{
        width: L,
        height: A,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#ffede1",
        color: cor.tinta,
        fontFamily: "Geist",
        fontSize: 32,
      }}
    >
      {/* Pautas e linha de margem, por baixo de tudo. */}
      {Array.from({ length: A / P }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (i + 1) * P - 2,
            height: 2,
            backgroundColor: cor.pauta,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: MARGEM,
          width: 2,
          backgroundColor: cor.margem,
        }}
      />

      <div
        style={{ display: "flex", flexDirection: "column", padding: `${P}px ${DIR}px 0 ${ESQ}px` }}
      >
        <Linha style={{ gap: 12 }}>
          <span style={{ fontWeight: 600 }}>Elisangela</span>
          <span style={{ color: cor.suave }}>Schubert</span>
        </Linha>

        {/* Data como na folha: dia em mono ocupando três pautas, mês, semana e hora ao lado. */}
        <div style={{ display: "flex", marginTop: P, height: P * 3 }}>
          <div
            style={{
              fontFamily: "GeistMono",
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -6,
              paddingTop: 14,
            }}
          >
            {data.dia}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 24 }}>
            <Linha
              style={{
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                fontSize: 28,
              }}
            >
              {data.mes} {data.ano}
            </Linha>
            <Linha style={{ color: cor.suave, fontSize: 28 }}>
              {semana.charAt(0).toUpperCase() + semana.slice(1)}
            </Linha>
            <Linha style={{ fontFamily: "GeistMono", fontSize: 28 }}>{data.hora}</Linha>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: -1,
            lineHeight: `${P}px`,
            paddingTop: 4,
            paddingBottom: 8,
          }}
        >
          {convite.festa.titulo}
        </div>
        <Linha style={{ color: cor.suave }}>{convite.festa.localNome}</Linha>
      </div>

      {/* Canhoto: papel liso entre dois picotes, como na página. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: P - 2,
          backgroundColor: "#ffede1",
        }}
      >
        <Picote />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: P - 4,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={qr} width={LADO_QR} height={LADO_QR} />
          <Linha style={{ marginTop: P / 2, fontSize: 40, fontWeight: 600 }}>{convite.nome}</Linha>
          <Linha style={{ color: cor.suave, fontSize: 28 }}>
            Apresente este código na entrada.
          </Linha>
        </div>
        <div style={{ display: "flex", height: P / 2 }} />
        <Picote />
      </div>
    </div>,
    {
      width: L,
      height: A,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "GeistMono", data: mono, weight: 500, style: "normal" },
      ],
      headers: {
        "Content-Disposition": `attachment; filename="${arquivo}.png"`,
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
