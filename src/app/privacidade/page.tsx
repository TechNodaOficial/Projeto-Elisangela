import type { Metadata } from "next";

import { Moldura } from "@/components/moldura-publica";
import { DIAS_RETENCAO } from "@/lib/retencao/prazo";

export const metadata: Metadata = {
  title: "Privacidade dos convidados",
  description: "Como os dados dos convidados são usados e por quanto tempo ficam guardados.",
};

// Quem cuida dos dados e como falar com essa pessoa vêm de variáveis de ambiente
// (PRIVACIDADE_RESPONSAVEL e PRIVACIDADE_CONTATO), para trocar sem mexer no código.
function responsavel() {
  const nome = process.env.PRIVACIDADE_RESPONSAVEL?.trim();
  const contato = process.env.PRIVACIDADE_CONTATO?.trim();
  return { nome: nome || "a organizadora da festa", contato };
}

export default function PaginaPrivacidade() {
  const { nome, contato } = responsavel();

  const secoes: { titulo: string; texto: React.ReactNode }[] = [
    {
      titulo: "Quem cuida dos seus dados",
      texto: (
        <>
          {nome.charAt(0).toUpperCase() + nome.slice(1)}, que organiza a festa e enviou o seu
          convite.{" "}
          {contato ? (
            <>
              Para qualquer pedido sobre os seus dados, fale com ela em{" "}
              <strong className="font-semibold">{contato}</strong>.
            </>
          ) : (
            "Para qualquer pedido sobre os seus dados, fale com quem enviou o convite."
          )}
        </>
      ),
    },
    {
      titulo: "Quais dados",
      texto:
        "Seu nome e, se você passou para a organizadora, seu telefone. Também guardamos a sua resposta ao convite (se vai ou não), quando você respondeu e o horário em que entrou na festa.",
    },
    {
      titulo: "Para quê",
      texto:
        "Só para organizar a festa: enviar o convite, saber quem vai, montar as mesas e conferir a entrada pelo QR Code. Os dados não são vendidos nem usados para propaganda.",
    },
    {
      titulo: "Por quanto tempo",
      texto: `Até ${DIAS_RETENCAO} dias depois da festa. Depois disso, seu nome, telefone e resposta são apagados automaticamente; fica só a contagem total de convidados, sem identificar ninguém.`,
    },
    {
      titulo: "Onde ficam",
      texto:
        "Num sistema usado só pela organizadora, protegido por senha. Os servidores são de empresas contratadas para hospedar o sistema (Vercel e Neon), que podem ficar fora do Brasil. Sem cookies de rastreamento: a página do convite não guarda nada no seu aparelho.",
    },
    {
      titulo: "Seus direitos",
      texto:
        "Você pode pedir para ver, corrigir ou apagar os seus dados a qualquer momento, como garante a Lei Geral de Proteção de Dados (Lei 13.709/2018). Se pedir para apagar antes da festa, o seu convite e o QR Code deixam de funcionar.",
    },
  ];

  return (
    <Moldura>
      <article className="folha pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance">
          Privacidade dos convidados
        </h1>
        {secoes.map((s) => (
          <section key={s.titulo} className="mt-(--linha)">
            <h2 className="font-semibold">{s.titulo}</h2>
            <p>{s.texto}</p>
          </section>
        ))}
      </article>
    </Moldura>
  );
}
