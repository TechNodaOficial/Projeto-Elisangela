"use client";

import {
  Check,
  CircleDashed,
  Copy,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

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
import { paraCampos } from "@/lib/datas";

import { editarConvidado, removerConvidado } from "./actions";
import { FormConvidado } from "./form-convidado";

export type DadosFesta = { titulo: string; dataHora: Date; localNome: string };

const STATUS = {
  CONFIRMADO: { rotulo: "Confirmou", icone: Check, classe: "text-foreground font-medium" },
  RECUSADO: { rotulo: "Não vai", icone: X, classe: "text-tinta-suave" },
  PENDENTE: { rotulo: "Aguardando", icone: CircleDashed, classe: "text-tinta-suave" },
} as const;

function Status({ convidado }: { convidado: ConvidadoResumo }) {
  if (convidado.presenteEm) {
    return (
      <span className="grifo text-sm leading-(--linha) font-semibold">
        Chegou <span className="font-mono">{paraCampos(convidado.presenteEm).hora}</span>
      </span>
    );
  }
  const s = STATUS[convidado.rsvp];
  const Icone = s.icone;
  return (
    <span className={`flex items-center gap-1 text-sm leading-(--linha) ${s.classe}`}>
      <Icone aria-hidden className="size-3.5" strokeWidth={2} />
      {s.rotulo}
    </span>
  );
}

export function LinhaConvidado({
  convidado,
  festa,
  origem,
}: {
  convidado: ConvidadoResumo;
  festa: DadosFesta;
  origem: string;
}) {
  const [editando, setEditando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const link = `${origem}/c/${convidado.tokenConvite}`;
  const whatsapp = linkWhatsApp(
    convidado.telefone,
    mensagemConvite({
      nomeConvidado: convidado.nome,
      tituloFesta: festa.titulo,
      dataHora: festa.dataHora,
      localNome: festa.localNome,
      link,
    }),
  );

  async function copiar() {
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (editando) {
    return (
      <li className="bg-card py-3">
        <FormConvidado
          acao={editarConvidado.bind(null, convidado.id)}
          inicial={{ nome: convidado.nome, telefone: convidado.telefone ?? "" }}
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
    <li className="group/linha grid grid-cols-[minmax(0,1fr)_auto] gap-x-3">
      <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-3">
        <span className="font-semibold break-words hyphens-auto">{convidado.nome}</span>
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
      </p>

      <div className="text-tinta-suave group-focus-within/linha:text-foreground group-hover/linha:text-foreground col-start-2 flex h-(--linha) items-center gap-0.5 transition-colors duration-150">
        <Button asChild variant="ghost" className="h-11 min-w-11 px-2.5 sm:h-9 sm:min-w-0">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enviar convite para ${convidado.nome} pelo WhatsApp`}
          >
            <MessageCircle aria-hidden strokeWidth={1.75} />
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
          <DropdownMenuContent align="end" className="papel-solto w-48 rounded-[3px] ring-0">
            <DropdownMenuItem onSelect={copiar}>
              <Copy aria-hidden strokeWidth={1.75} />
              Copiar link do convite
            </DropdownMenuItem>
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
