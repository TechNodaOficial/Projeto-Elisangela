import type { Metadata } from "next";

import { FaixaLogo } from "@/components/logo";
import { Aviso, Moldura } from "@/components/moldura-publica";
import { dadosLeitor } from "@/lib/checkin/consultas";
import { conviteBloqueado, registrarErroConvite } from "@/lib/convites/limite";
import { FUSO } from "@/lib/datas";
import { obterIp } from "@/lib/ip";
import { janelaPortaria, situacaoPortaria } from "@/lib/portaria/janela";
import { festaDaPortaria, festaDoAjudante } from "@/lib/portaria/sessao";

import { Leitor } from "../../painel/checkin/leitor";
import { FormPin } from "./form-pin";

// Link dos ajudantes da entrada: não indexar e não vazar o token pelo Referer.
export const metadata: Metadata = {
  title: "Portaria",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const quando = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

// Ajudante da portaria: com o link e o PIN, só o leitor de QR desta festa, só no dia.
export default async function PaginaPortaria(props: PageProps<"/portaria/[token]">) {
  const { token } = await props.params;

  const ip = await obterIp();
  if (await conviteBloqueado(ip)) {
    return (
      <Aviso titulo="Muitas tentativas" texto="Espere alguns minutos e abra o link de novo." />
    );
  }
  const festa = await festaDaPortaria(token);
  if (!festa?.portariaPin) {
    await registrarErroConvite(ip);
    return (
      <Aviso
        titulo="Link da portaria inválido"
        texto="Este link foi cancelado ou trocado. Peça o link novo para a Elisangela."
      />
    );
  }

  const situacao = situacaoPortaria(festa.dataHora);
  if (situacao !== "aberta") {
    const { abre } = janelaPortaria(festa.dataHora);
    return (
      <Aviso
        titulo={festa.titulo}
        texto={
          situacao === "antes"
            ? `A portaria abre em ${quando(abre)}, perto do horário da festa.`
            : "A portaria desta festa já foi encerrada."
        }
      />
    );
  }

  if ((await festaDoAjudante()) !== festa.id) {
    return (
      <Moldura>
        <div className="folha px-5 py-6">
          <p className="text-tinta-suave text-sm">Portaria</p>
          <h1 className="text-xl font-semibold text-balance">{festa.titulo}</h1>
          <p className="text-tinta-suave mt-1 text-sm">
            Digite o PIN que a Elisangela passou para abrir o leitor de QR Code da entrada.
          </p>
          <FormPin token={token} />
        </div>
      </Moldura>
    );
  }

  const dados = await dadosLeitor(festa.id);
  if (!dados) {
    return <Aviso titulo="Festa não encontrada" texto="Peça um novo link para a Elisangela." />;
  }
  return (
    <>
      <FaixaLogo className="h-10 w-auto" />
      <main className="px-4 pt-4 pb-10">
        <Leitor festa={dados} />
      </main>
    </>
  );
}
