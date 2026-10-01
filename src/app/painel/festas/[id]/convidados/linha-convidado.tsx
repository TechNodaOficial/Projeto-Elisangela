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
      <span className="grifo text-sm font-semibold">
        Chegou <span className="font-mono">{paraCampos(convidado.presenteEm).hora}</span>
      </span>
    );
  }
  const s = STATUS[convidado.rsvp];
  const Icone = s.icone;
  return (
    <span className={`flex items-center gap-1 text-sm ${s.classe}`}>
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
    // Grade de duas pautas exatas: nome e status na primeira, telefone e ações na segunda.
    // As faixas têm altura fixa; botões maiores que a pauta transbordam sem empurrar a linha.
    <li className="group/linha grid h-[calc(var(--linha)*2)] grid-cols-[minmax(0,1fr)_auto] grid-rows-[var(--linha)_var(--linha)] gap-x-3">
      <div className="col-span-2 flex min-w-0 items-baseline gap-x-3">
        <span className="truncate font-semibold">{convidado.nome}</span>
        <span className="shrink-0">
          <Status convidado={convidado} />
        </span>
      </div>
      <p className="text-tinta-suave col-start-1 row-start-2 truncate text-sm leading-(--linha)">
        {convidado.telefone ? (
          <span className="font-mono">{formatarTelefone(convidado.telefone)}</span>
        ) : (
          "Sem WhatsApp"
        )}
      </p>

      <div className="text-tinta-suave group-focus-within/linha:text-foreground group-hover/linha:text-foreground col-start-2 row-start-2 flex items-center gap-0.5 self-center transition-colors duration-150">
        <Button
          type="button"
          variant="ghost"
          onClick={copiar}
          aria-label={copiado ? "Link copiado" : `Copiar link de ${convidado.nome}`}
          className="h-11 min-w-11 px-2.5 sm:h-9 sm:min-w-0"
        >
          {copiado ? (
            <Check aria-hidden strokeWidth={2} />
          ) : (
            <Copy aria-hidden strokeWidth={1.75} />
          )}
          <span className="hidden sm:inline">{copiado ? "Copiado" : "Copiar link"}</span>
        </Button>
        <Button asChild variant="ghost" className="h-11 min-w-11 px-2.5 sm:h-9 sm:min-w-0">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enviar convite para ${convidado.nome} pelo WhatsApp`}
          >
            <MessageCircle aria-hidden strokeWidth={1.75} />
            <span className="hidden sm:inline">WhatsApp</span>
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
          <DropdownMenuContent align="end" className="papel-solto w-44 rounded-[3px] ring-0">
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
