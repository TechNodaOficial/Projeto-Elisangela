"use client";

import {
  Armchair,
  Check,
  Copy,
  Eye,
  HeartHandshake,
  MailCheck,
  MailX,
  MessageCircle,
  MessageSquareHeart,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Send,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useOptimistic, useState, useTransition } from "react";

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
import { confirmadasDe, faixasDe } from "@/lib/convidados/contagem";
import { ROTULO_FAIXA_BANCO } from "@/lib/convites/membros";
import { etapaDoConvite, type Etapa } from "@/lib/convidados/etapa";
import { paraCampos } from "@/lib/datas";
import { cn } from "@/lib/utils";

import { definirMesa } from "../colunas/actions";
import { editarConvidado, marcarEnvio, marcarPadrinho, removerConvidado } from "./actions";
import { FormConvidado } from "./form-convidado";
import { EditorObservacao } from "./observacao-convite";

export type DadosFesta = {
  titulo: string;
  dataHora: Date;
  localNome: string;
  // Texto do WhatsApp escrito por ela para esta festa (vazio = o padrão).
  mensagemConvite: string | null;
};

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
      modelo: festa.mensagemConvite,
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

// Colunas da lista na folha larga (a linha e o cabeçalho usam a mesma grade).
export const GRADE_LISTA =
  "@3xl:grid-cols-[minmax(0,1.15fr)_10.5rem_minmax(0,1.6fr)_8rem_8.5rem] @3xl:gap-x-4";

function Etiqueta({ children, aviso }: { children: React.ReactNode; aviso?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-full px-2 text-xs leading-tight font-medium",
        aviso ? "bg-pendente text-foreground" : "bg-card text-foreground",
      )}
    >
      {children}
    </span>
  );
}

// Busca de novo a lista no servidor (quem abriu, confirmou ou chegou desde que a página
// carregou) sem recarregar a página: filtro, busca e rolagem ficam como estavam.
export function BotaoAtualizar({ className }: { className?: string }) {
  const router = useRouter();
  const [atualizando, iniciar] = useTransition();
  return (
    <button
      type="button"
      onClick={() => iniciar(() => router.refresh())}
      disabled={atualizando}
      className={cn(
        "text-tinta-suave hover:text-foreground hover:bg-card focus-visible:outline-ring inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap focus-visible:outline-2",
        className,
      )}
    >
      <RefreshCw
        aria-hidden
        className={cn("size-3.5", atualizando && "motion-safe:animate-spin")}
        strokeWidth={2}
      />
      Atualizar situação
    </button>
  );
}

// Títulos das colunas, só na folha larga (no celular cada convidado é um cartão).
export function CabecalhoLista() {
  return (
    <div
      className={cn(
        "text-tinta-suave hidden items-center px-3 pb-1 text-xs font-medium tracking-[0.04em] uppercase @3xl:grid",
        GRADE_LISTA,
      )}
    >
      <span aria-hidden>Convite</span>
      {/* O título da coluna é o próprio botão. */}
      <span>
        <BotaoAtualizar className="-ml-1.5 h-6 px-1.5 text-xs tracking-[0.04em] uppercase" />
      </span>
      <span aria-hidden>Quem vai</span>
      <span aria-hidden>Mesa</span>
      <span aria-hidden />
    </div>
  );
}

export type OpcaoMesa = { id: string; nome: string; livres: number };

// Mesa do convidado, escolhida na própria linha: trocar já salva. As mesas cheias ficam
// apagadas na lista (menos a dele), como na aba de mesas.
function SeletorMesa({
  convidado,
  mesas,
  aviso,
}: {
  convidado: ConvidadoResumo;
  mesas: OpcaoMesa[];
  aviso: boolean;
}) {
  const [mesaId, setMesaId] = useOptimistic(convidado.mesaId);
  return (
    <span
      className={cn(
        "focus-within:outline-ring inline-flex h-8 max-w-full items-center gap-1 rounded-full pl-2 text-xs font-medium focus-within:outline-2 @3xl:h-6",
        !mesaId && aviso ? "bg-pendente text-foreground" : "bg-card text-foreground",
      )}
    >
      <Armchair aria-hidden className="size-3.5 shrink-0" strokeWidth={1.75} />
      <select
        aria-label={`Mesa de ${convidado.nome}`}
        value={mesaId ?? ""}
        onChange={(e) => {
          const nova = e.target.value || null;
          startTransition(async () => {
            setMesaId(nova);
            await definirMesa(convidado.id, nova);
          });
        }}
        className="h-full max-w-full min-w-0 cursor-pointer truncate rounded-full bg-transparent pr-1 outline-none"
      >
        <option value="">Sem mesa</option>
        {mesas.map((m) => (
          <option key={m.id} value={m.id} disabled={m.livres <= 0 && m.id !== mesaId}>
            {m.nome}
            {m.id !== mesaId &&
              (m.livres <= 0
                ? " · cheia"
                : ` · ${m.livres} ${m.livres === 1 ? "livre" : "livres"}`)}
          </option>
        ))}
      </select>
    </span>
  );
}

export function LinhaConvidado({
  convidado,
  festa,
  mesas,
  origem,
  className,
}: {
  className?: string;
  convidado: ConvidadoResumo;
  festa: DadosFesta;
  mesas: OpcaoMesa[];
  origem: string;
}) {
  const [editando, setEditando] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [observando, setObservando] = useState(false);
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

  const confirmou = convidado.rsvp === "CONFIRMADO";
  const vai = confirmadasDe(convidado);
  const faixas = faixasDe(convidado);
  const nomes = confirmou ? convidado.membros.slice(0, vai) : [];

  return (
    // No celular, um cartão: nome e ações em cima; situação, mesa e quem vai em etiquetas
    // embaixo. Com a folha larga, as mesmas peças viram colunas de uma tabela, alinhadas
    // ao cabeçalho da lista (CabecalhoLista): Convite | Situação | Quem vai | Mesa | ações.
    <li
      className={cn(
        "group/linha grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 py-2",
        GRADE_LISTA,
        className,
      )}
    >
      <div className="col-start-1 row-start-1 min-w-0">
        <p className="leading-snug font-semibold break-words hyphens-auto">
          {convidado.nome}
          {convidado.padrinho && (
            <span className="bg-pastel-lilas ml-1.5 inline-flex h-5 items-center gap-1 rounded-full px-1.5 align-middle text-xs font-medium whitespace-nowrap">
              <HeartHandshake aria-hidden className="size-3" strokeWidth={1.75} />
              Padrinho
            </span>
          )}
        </p>
        <p className="text-tinta-suave text-[0.8125rem] leading-snug">
          {copiado ? (
            <span className="text-foreground font-medium">Link copiado</span>
          ) : (
            <>
              {convidado.pessoas > 1 && `${convidado.pessoas} pessoas · `}
              {convidado.telefone ? (
                <span className="font-mono whitespace-nowrap">
                  {formatarTelefone(convidado.telefone)}
                </span>
              ) : (
                "Sem WhatsApp"
              )}
            </>
          )}
        </p>
      </div>

      {/* Situação, quem vai e mesa: etiquetas numa linha no celular; colunas na folha larga. */}
      <div className="col-span-2 col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-1.5 @3xl:contents">
        <div className="@3xl:col-start-2 @3xl:row-start-1 @3xl:pt-0.5">
          <Status convidado={convidado} />
        </div>

        <div className="flex min-w-0 flex-wrap gap-1 @3xl:col-start-3 @3xl:row-start-1 @3xl:pt-0.5">
          {confirmou && nomes.length > 0
            ? nomes.map((m, i) => (
                <Etiqueta key={i}>
                  {m.nome}
                  {m.faixa !== "ADULTO" && (
                    <span className="text-tinta-suave"> · {ROTULO_FAIXA_BANCO[m.faixa]}</span>
                  )}
                </Etiqueta>
              ))
            : confirmou &&
              convidado.pessoas > 1 && (
                <>
                  {faixas.adultos > 0 && (
                    <Etiqueta>
                      {faixas.adultos} {faixas.adultos === 1 ? "adulto" : "adultos"}
                    </Etiqueta>
                  )}
                  {faixas.criancas4a11 > 0 && <Etiqueta>{faixas.criancas4a11} de 4 a 11</Etiqueta>}
                  {faixas.criancas0a3 > 0 && <Etiqueta>{faixas.criancas0a3} de 0 a 3</Etiqueta>}
                  {faixas.semIdade > 0 && <Etiqueta aviso>{faixas.semIdade} sem idade</Etiqueta>}
                </>
              )}
        </div>

        <div className="@3xl:col-start-4 @3xl:row-start-1 @3xl:pt-0.5">
          {/* Quem não vai não ocupa lugar: só mostra a mesa se já tinha uma (para tirar). */}
          {mesas.length > 0 && (convidado.rsvp !== "RECUSADO" || convidado.mesaId) ? (
            <SeletorMesa convidado={convidado} mesas={mesas} aviso={confirmou} />
          ) : (
            confirmou && <Etiqueta aviso>Sem mesa</Etiqueta>
          )}
        </div>
      </div>

      <div className="text-tinta-suave group-focus-within/linha:text-foreground group-hover/linha:text-foreground col-start-2 row-start-1 -my-1 flex items-center gap-0.5 transition-colors duration-150 @3xl:col-start-5 @3xl:justify-end">
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
            <DropdownMenuItem
              onSelect={() =>
                startTransition(() => marcarPadrinho(convidado.id, !convidado.padrinho))
              }
            >
              <HeartHandshake aria-hidden strokeWidth={1.75} />
              {convidado.padrinho ? "Tirar marca de padrinho" : "Marcar como padrinho"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setObservando(true)}>
              <StickyNote aria-hidden strokeWidth={1.75} />
              {convidado.observacaoConvite ? "Editar observação" : "Observação no convite"}
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

      {/* Observação dela para este convidado: é o que ele lê no convite. */}
      {observando ? (
        <EditorObservacao
          convidadoId={convidado.id}
          nome={convidado.nome}
          inicial={convidado.observacaoConvite ?? ""}
          aoFechar={() => setObservando(false)}
        />
      ) : (
        convidado.observacaoConvite && (
          <button
            type="button"
            onClick={() => setObservando(true)}
            aria-label={`Editar a observação no convite de ${convidado.nome}`}
            className="bg-pastel-areia/60 focus-visible:outline-ring col-span-full flex gap-2 rounded-md px-2.5 py-1.5 text-left text-sm leading-snug transition-[filter] hover:brightness-95 focus-visible:outline-2"
          >
            <StickyNote
              aria-hidden
              className="text-tinta-suave mt-0.5 size-4 shrink-0"
              strokeWidth={1.75}
            />
            <span className="min-w-0 break-words whitespace-pre-line">
              <span className="text-tinta-suave">No convite: </span>
              {convidado.observacaoConvite}
            </span>
          </button>
        )
      )}

      {/* Recado do convidado para quem faz a festa (ou o motivo de não ir). */}
      {convidado.mensagem && (
        <blockquote className="bg-pastel-lilas/45 col-span-full flex gap-2 rounded-md px-2.5 py-1.5 text-sm leading-snug">
          <MessageSquareHeart
            aria-hidden
            className="text-tinta-suave mt-0.5 size-4 shrink-0"
            strokeWidth={1.75}
          />
          <span className="min-w-0 break-words whitespace-pre-line">
            {convidado.mensagem}
            {convidado.mensagemEm && (
              <span className="text-tinta-suave whitespace-nowrap">
                {" "}
                · {diaMes(convidado.mensagemEm)}
              </span>
            )}
          </span>
        </blockquote>
      )}

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
