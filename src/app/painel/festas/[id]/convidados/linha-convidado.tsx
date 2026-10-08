"use client";

import {
  Check,
  Copy,
  Eye,
  MailCheck,
  MailX,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { startTransition, useState } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConvidadoResumo } from "@/lib/convidados/consultas";
import { mensagemConvite } from "@/lib/convidados/mensagem";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import { confirmadasDe } from "@/lib/convidados/contagem";
import { etapaDoConvite, type Etapa } from "@/lib/convidados/etapa";
import { paraCampos } from "@/lib/datas";
import { cn } from "@/lib/utils";

import { editarConvidado, marcarEnvio, removerConvidado } from "./actions";
import { FormConvidado } from "./form-convidado";

export type DadosFesta = { titulo: string; dataHora: Date; localNome: string };

// Link do convite e o WhatsApp já com a mensagem (usados na linha e na fila de envio).
export function linksDoConvite(convidado: ConvidadoResumo, festa: DadosFesta, origem: string) {
  const link = `${origem}/c/${convidado.tokenConvite}`;
  const whatsapp = linkWhatsApp(
    convidado.telefone,
    mensagemConvite({
      nomeConvidado: convidado.nome,
      pessoas: convidado.pessoas,
      tituloFesta: festa.titulo,
      dataHora: festa.dataHora,
      localNome: festa.localNome,
      link,
    }),
  );
  return { link, whatsapp };
}

// "08/10" no fuso de São Paulo.
const diaMes = (d: Date) => paraCampos(d).data.split("-").reverse().slice(0, 2).join("/");

// Etiqueta da etapa do convite, com cor: amarelo falta enviar, verde confirmou,
// lilás abriu o link, branco com borda enviado (aguardando) ou não vai. Quem chegou fica grifado.
const ETIQUETA: Record<
  Exclude<Etapa, "chegou">,
  { rotulo: string; icone: typeof Check; classe: string }
> = {
  nao_enviado: { rotulo: "Não enviado", icone: MailX, classe: "bg-pendente text-foreground" },
  enviado: {
    rotulo: "Enviado",
    icone: Send,
    classe: "bg-card border-border border text-tinta-suave",
  },
  abriu: { rotulo: "Abriu o convite", icone: Eye, classe: "bg-pastel-lilas text-foreground" },
  confirmou: { rotulo: "Confirmou", icone: Check, classe: "bg-resolvida text-foreground" },
  nao_vai: { rotulo: "Não vai", icone: X, classe: "bg-card border-border border text-tinta-suave" },
};

function Status({ convidado }: { convidado: ConvidadoResumo }) {
  const { pessoas, entraram, presenteEm } = convidado;
  const etapa = etapaDoConvite(convidado);
  if (etapa === "chegou" && presenteEm) {
    return (
      <span className="grifo text-sm leading-(--linha) font-semibold">
        {pessoas === 1 ? "Chegou" : `Chegaram ${entraram} de ${pessoas}`}{" "}
        <span className="font-mono">{paraCampos(presenteEm).hora}</span>
      </span>
    );
  }
  const e = ETIQUETA[etapa === "chegou" ? "confirmou" : etapa];
  const Icone = e.icone;
  const detalhe =
    etapa === "enviado" && convidado.enviadoEm
      ? ` ${diaMes(convidado.enviadoEm)}`
      : etapa === "confirmou" && pessoas > 1
        ? ` ${confirmadasDe(convidado)} de ${pessoas}`
        : "";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        e.classe,
      )}
    >
      <Icone aria-hidden className="size-3.5" strokeWidth={2} />
      {e.rotulo}
      {detalhe}
    </span>
  );
}

export function LinhaConvidado({
  convidado,
  festa,
  origem,
  className,
}: {
  className?: string;
  convidado: ConvidadoResumo;
  festa: DadosFesta;
  origem: string;
}) {
  const [editando, setEditando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const { link, whatsapp } = linksDoConvite(convidado, festa, origem);
  const marcar = (enviado: boolean) => startTransition(() => marcarEnvio(convidado.id, enviado));

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3 py-3">
        <FormConvidado
          acao={editarConvidado.bind(null, convidado.id)}
          inicial={{
            nome: convidado.nome,
            pessoas: String(convidado.pessoas),
            telefone: convidado.telefone ?? "",
          }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`editar-${convidado.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    // Pautas inteiras: nome e status (quebram em mais pautas se a coluna for estreita),
    // depois telefone e mesa com as ações. Todo texto usa a altura da pauta (alinhado ao centro,
    // não pela linha de base, que somaria pixels); os botões ficam numa faixa da altura da
    // pauta e transbordam sem empurrar a linha.
    <li className={cn("group/linha grid grid-cols-[minmax(0,1fr)_auto] gap-x-3", className)}>
      <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-3">
        <span className="font-semibold break-words hyphens-auto">
          {convidado.nome}
          {convidado.pessoas > 1 && (
            <span className="text-tinta-suave font-normal"> · {convidado.pessoas} pessoas</span>
          )}
        </span>
        <Status convidado={convidado} />
      </div>
      {/* Telefone e mesa na mesma pauta; a mesa desce para a pauta seguinte se não couber. */}
      <p className="text-tinta-suave col-start-1 flex flex-wrap gap-x-1.5 text-sm leading-(--linha)">
        {copiado ? (
          <span className="text-foreground font-medium">Link copiado</span>
        ) : convidado.telefone ? (
          <span className="font-mono whitespace-nowrap">
            {formatarTelefone(convidado.telefone)}
          </span>
        ) : (
          "Sem WhatsApp"
        )}
        {convidado.mesa && !copiado && (
          <span className="whitespace-nowrap">· {convidado.mesa.nome}</span>
        )}
        {!convidado.mesa && !copiado && convidado.rsvp === "CONFIRMADO" && (
          <span className="whitespace-nowrap">· sem mesa</span>
        )}
      </p>

      <div className="text-tinta-suave group-focus-within/linha:text-foreground group-hover/linha:text-foreground col-start-2 flex h-(--linha) items-center gap-0.5 transition-colors duration-150">
        {/* Com espaço, o botão diz o que faz: "Enviar" (ainda não foi) ou "Reenviar". */}
        <Button asChild variant="ghost" className="h-11 min-w-11 px-2.5 sm:h-9 sm:min-w-0">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => marcar(true)}
            aria-label={`Enviar convite para ${convidado.nome} pelo WhatsApp`}
          >
            <MessageCircle aria-hidden strokeWidth={1.75} />
            <span className="hidden text-sm @xl:inline">
              {convidado.enviadoEm ? "Reenviar" : "Enviar"}
            </span>
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label={`Mais ações para ${convidado.nome}`}
              className="size-11 sm:size-9"
            >
              <MoreHorizontal aria-hidden strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="papel-solto w-56 rounded-[3px] ring-0">
            <DropdownMenuItem onSelect={copiar}>
              <Copy aria-hidden strokeWidth={1.75} />
              Copiar link do convite
            </DropdownMenuItem>
            {convidado.enviadoEm ? (
              <DropdownMenuItem onSelect={() => marcar(false)}>
                <MailX aria-hidden strokeWidth={1.75} />
                Marcar como não enviado
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => marcar(true)}>
                <MailCheck aria-hidden strokeWidth={1.75} />
                Marcar como enviado
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setEditando(true)}>
              <Pencil aria-hidden strokeWidth={1.75} />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setRemovendo(true)}>
              <Trash2 aria-hidden strokeWidth={1.75} />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <span aria-live="polite" className="sr-only">
        {copiado ? `Link de ${convidado.nome} copiado` : ""}
      </span>

      <ConfirmarExclusao
        aberto={removendo}
        aoMudar={setRemovendo}
        titulo="Remover este convidado?"
        descricao={
          <>
            {convidado.nome} sai da lista e o link dele para de funcionar. Isso não pode ser
            desfeito.
          </>
        }
        rotuloConfirmar="Remover convidado"
        rotuloEnviando="Removendo…"
        acao={removerConvidado.bind(null, convidado.id)}
      />
    </li>
  );
}
