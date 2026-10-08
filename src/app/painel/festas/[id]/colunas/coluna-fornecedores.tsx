"use client";

import { Check, FileText, MessageCircle, Plus, Upload, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import type { Colunas, Servicos } from "@/lib/festas/consultas";
import { centavosParaCampo, formatarReais } from "@/lib/festas/formatos";
import { dividirEmParcelas, valorPago } from "@/lib/festas/parcelas";
import { AREA_ROLAVEL, CARTAO, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import {
  adicionarItemChecklist,
  alternarItemChecklist,
  contratarServico,
  definirParcelasPagas,
  editarContratacao,
  enviarContrato,
  removerContratacao,
  removerContrato,
  removerItemChecklist,
} from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, NovoItem, Vazio, type Campo } from "./pecas";

type Contratacao = Colunas["contratacoes"][number];

// Linhas "Valor" e "Contrato" do cartão: rótulo à esquerda, conteúdo à direita.
const ROTULO_LINHA = "text-tinta-suave flex h-8 w-16 shrink-0 items-center text-[0.8125rem]";
// O que falta preencher: botão tracejado em amarelo, para saltar aos olhos.
const FALTA =
  "border-pendente-forte bg-pendente hover:bg-card focus-visible:outline-ring inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed px-2.5 text-[0.8125rem] font-medium focus-visible:outline-2 disabled:opacity-60";

// Escolher o fornecedor (só os da base com o mesmo serviço), o valor e em quantas vezes.
function camposContratacao(fornecedores: Servicos[number]["fornecedores"]): Campo[] {
  return [
    {
      nome: "fornecedorId",
      rotulo: "Fornecedor",
      tipo: "select",
      opcoes: [
        { valor: "", rotulo: "Ainda não escolhido" },
        ...fornecedores.map((f) => ({ valor: f.id, rotulo: f.nome })),
      ],
    },
    {
      nome: "valor",
      rotulo: "Valor contratado (R$)",
      inputMode: "decimal",
      mono: true,
      opcional: true,
      placeholder: "1.500,00",
    },
    {
      nome: "parcelas",
      rotulo: "Em quantas vezes",
      tipo: "number",
      inputMode: "numeric",
      mono: true,
      opcional: true,
      placeholder: "1",
    },
  ];
}

// Valor e pagamento. À vista: um botão Pago/Pendente. Parcelado: uma caixinha por parcela;
// clicar marca até ela como paga (ou desmarca, se ela for a última paga).
function Pagamento({ contratacao }: { contratacao: Contratacao }) {
  const { id, valorCentavos, parcelas, parcelasPagas } = contratacao;
  if (valorCentavos === null) return null;
  const valores = dividirEmParcelas(valorCentavos, parcelas);
  const quitado = parcelasPagas >= parcelas;
  const botao = "focus-visible:outline-ring rounded-sm hover:bg-card focus-visible:outline-2";

  if (parcelas === 1) {
    return (
      <form action={definirParcelasPagas.bind(null, id, quitado ? 0 : 1)}>
        <button
          type="submit"
          aria-pressed={quitado}
          title={quitado ? "Marcar como pendente" : "Marcar como pago"}
          className={cn(
            botao,
            "flex items-center gap-1 px-1 text-[0.8125rem] leading-(--linha)",
            quitado ? "text-tinta-suave" : "text-foreground font-semibold",
          )}
        >
          {quitado && <Check aria-hidden className="size-3.5" strokeWidth={2} />}
          {quitado ? "Pago" : "Pendente"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-1">
      <p className="text-[0.8125rem]">
        <span className="font-mono">
          {parcelas}x de {formatarReais(valores[parcelas - 1])}
        </span>
        <span className={quitado ? "text-tinta-suave" : "font-semibold"}>
          {" "}
          · {quitado ? "tudo pago" : `${parcelasPagas} de ${parcelas} pagas`}
        </span>
      </p>
      <p className="text-tinta-suave text-xs">Toque na parcela para marcar como paga.</p>
      <ul className="flex flex-wrap gap-1" aria-label="Parcelas">
        {valores.map((valor, i) => {
          const n = i + 1;
          const paga = n <= parcelasPagas;
          return (
            <li key={n}>
              <form
                action={definirParcelasPagas.bind(
                  null,
                  id,
                  paga && n === parcelasPagas ? n - 1 : n,
                )}
              >
                <button
                  type="submit"
                  aria-pressed={paga}
                  aria-label={`Parcela ${n} de ${formatarReais(valor)}: ${paga ? "paga" : "a pagar"}`}
                  title={`${n}ª parcela · ${formatarReais(valor)}`}
                  className={cn(
                    botao,
                    "flex size-7 items-center justify-center border font-mono text-xs",
                    paga
                      ? "bg-resolvida-forte border-resolvida-forte hover:text-foreground text-white"
                      : "border-input bg-card/60",
                  )}
                >
                  {paga ? <Check aria-hidden className="size-3.5" strokeWidth={2.5} /> : n}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Contrato assinado: enviar (PDF ou foto), abrir, trocar ou tirar.
function Contrato({ festaId, contratacao }: { festaId: string; contratacao: Contratacao }) {
  const [estado, enviar, enviando] = useActionState(enviarContrato.bind(null, contratacao.id), {});
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nome = contratacao.contratoNome;
  const link =
    "focus-visible:outline-ring flex items-center gap-1.5 rounded-sm px-1 hover:bg-card focus-visible:outline-2";

  return (
    <div className="min-w-0 flex-1 text-[0.8125rem]">
      <form ref={formRef} action={enviar} className="flex min-w-0 items-center gap-1">
        <input
          ref={inputRef}
          type="file"
          name="contrato"
          accept="application/pdf,image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={() => formRef.current?.requestSubmit()}
        />
        {nome ? (
          <>
            <a
              href={`/painel/festas/${festaId}/contratos/${contratacao.id}`}
              target="_blank"
              rel="noopener"
              className={cn(link, "min-w-0 font-medium")}
            >
              <FileText aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{nome}</span>
            </a>
            <button
              type="button"
              disabled={enviando}
              onClick={() => inputRef.current?.click()}
              className={cn(link, "text-tinta-suave hover:text-foreground shrink-0")}
            >
              {enviando ? "Enviando…" : "Trocar"}
            </button>
            <ConfirmarExclusao
              titulo="Tirar o contrato?"
              descricao={<>O arquivo {nome} é apagado do painel. Dá para enviar outro depois.</>}
              rotuloConfirmar="Tirar contrato"
              rotuloEnviando="Tirando…"
              acao={removerContrato.bind(null, contratacao.id)}
              gatilho={
                <button
                  type="button"
                  aria-label="Tirar o contrato"
                  className={cn(
                    link,
                    "text-tinta-suave hover:text-foreground size-7 shrink-0 justify-center",
                  )}
                >
                  <X aria-hidden className="size-4" strokeWidth={1.75} />
                </button>
              }
            />
          </>
        ) : (
          <button
            type="button"
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
            className={FALTA}
          >
            <Upload aria-hidden className="size-4" strokeWidth={1.75} />
            {enviando ? "Enviando…" : "Enviar PDF ou foto"}
          </button>
        )}
      </form>
      {estado.erro && (
        <p role="alert" className="text-destructive mt-1 leading-5">
          {estado.erro}
        </p>
      )}
    </div>
  );
}

function Checklist({ contratacao }: { contratacao: Contratacao }) {
  const itens = contratacao.checklist;
  const feitos = itens.filter((i) => i.feito).length;
  const abertos = itens.length - feitos;

  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col">
      <p className="text-tinta-suave shrink-0 text-[0.8125rem]">
        Checklist{" "}
        {itens.length > 0 && (
          <span className={cn("font-mono", abertos === 0 && "text-foreground")}>
            {feitos}/{itens.length}
          </span>
        )}
        {abertos > 0 && (
          <span className="text-foreground font-semibold"> · {abertos} em aberto</span>
        )}
      </p>
      <ul className={cn(AREA_ROLAVEL, "mt-1 flex flex-col")}>
        {itens.map((item) => (
          <li key={item.id} className={cn(LINHA_ALTERNADA, "group/item flex items-center gap-1")}>
            <form action={alternarItemChecklist.bind(null, item.id)} className="min-w-0 flex-1">
              <button
                type="submit"
                role="checkbox"
                aria-checked={item.feito}
                className="focus-visible:outline-ring hover:bg-card flex min-h-9 w-full items-center gap-2.5 rounded-sm px-1.5 text-left text-sm focus-visible:outline-2"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4.5 shrink-0 items-center justify-center rounded-[3px] border",
                    item.feito
                      ? "bg-resolvida-forte border-resolvida-forte text-white"
                      : "border-input bg-card",
                  )}
                >
                  {item.feito && <Check className="size-3.5" strokeWidth={2.5} />}
                </span>
                <span
                  className={cn(
                    "min-w-0 break-words",
                    item.feito && "text-tinta-suave line-through",
                  )}
                >
                  {item.texto}
                </span>
              </button>
            </form>
            <form action={removerItemChecklist.bind(null, item.id)}>
              <button
                type="submit"
                aria-label={`Tirar "${item.texto}" do checklist`}
                className="text-tinta-suave hover:text-foreground focus-visible:outline-ring hover:bg-card flex size-9 items-center justify-center rounded-sm focus-visible:outline-2 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
              >
                <X aria-hidden className="size-4" strokeWidth={1.75} />
              </button>
            </form>
          </li>
        ))}
      </ul>
      <div className="shrink-0">
        <NovoItem
          acao={adicionarItemChecklist.bind(null, contratacao.id)}
          rotulo={`Novo item do checklist de ${contratacao.servico.nome}`}
        />
      </div>
    </div>
  );
}

function Linha({
  festaId,
  contratacao,
  fornecedoresDoServico,
}: {
  festaId: string;
  contratacao: Contratacao;
  fornecedoresDoServico: Servicos[number]["fornecedores"];
}) {
  const [editando, setEditando] = useState(false);
  const { fornecedor, servico } = contratacao;

  return (
    // Altura fixa: o checklist rola dentro do cartão. Editando, o cartão cresce para caber o formulário.
    <li className={cn(CARTAO, COR_RAIA.fornecedores, !editando && "h-[31rem]")}>
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold break-words">{servico.nome}</p>
          {fornecedor ? (
            <p className="text-sm break-words">
              {fornecedor.nome}
              {fornecedor.telefone && (
                <span className="text-tinta-suave font-mono whitespace-nowrap">
                  {" "}
                  · {formatarTelefone(fornecedor.telefone)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm">
              <span className="grifo font-medium">Fornecedor ainda não escolhido</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          {fornecedor?.telefone && (
            <Button
              asChild
              variant="ghost"
              className="text-tinta-suave hover:text-foreground size-11 sm:size-7"
            >
              <a
                href={linkWhatsApp(fornecedor.telefone, "")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Conversar com ${fornecedor.nome} no WhatsApp`}
              >
                <MessageCircle aria-hidden strokeWidth={1.75} />
              </a>
            </Button>
          )}
          <MenuLinha
            nome={servico.nome}
            aoEditar={() => setEditando(true)}
            remocao={{
              titulo: `Tirar ${servico.nome} da festa?`,
              descricao: (
                <>
                  O serviço sai desta festa junto com o checklist. Itens do cronograma ligados a ele
                  ficam sem responsável. O fornecedor continua na base.
                </>
              ),
              rotulo: "Tirar da festa",
              acao: removerContratacao.bind(null, contratacao.id),
            }}
          />
        </div>
      </div>

      {editando ? (
        <div className="bg-card -mx-1 mt-2 shrink-0 rounded-lg px-3">
          <FormCampos
            acao={editarContratacao.bind(null, contratacao.id)}
            campos={camposContratacao(fornecedoresDoServico)}
            inicial={{
              fornecedorId: fornecedor?.id ?? "",
              valor: centavosParaCampo(contratacao.valorCentavos),
              parcelas: String(contratacao.parcelas),
            }}
            rotuloEnviar="Salvar"
            rotuloEnviando="Salvando…"
            prefixo={`contratacao-${contratacao.id}`}
            aoSalvar={() => setEditando(false)}
            aoCancelar={() => setEditando(false)}
          />
          {fornecedoresDoServico.length === 0 && (
            <p className="text-tinta-suave -mt-4 pb-4 text-sm">
              Nenhum fornecedor de {servico.nome} na base.{" "}
              <Link href="/painel/fornecedores" className="text-foreground underline">
                Cadastrar
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 flex min-w-0 shrink-0 items-start gap-2">
          <p className={ROTULO_LINHA}>Valor</p>
          <div className="flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-x-2 text-sm">
            {contratacao.valorCentavos === null ? (
              <button type="button" onClick={() => setEditando(true)} className={FALTA}>
                <Plus aria-hidden className="size-4" strokeWidth={1.75} />
                Definir valor
              </button>
            ) : (
              <>
                <span className="font-mono">{formatarReais(contratacao.valorCentavos)}</span>
                {contratacao.parcelas > 1 ? (
                  <div className="basis-full">
                    <Pagamento contratacao={contratacao} />
                  </div>
                ) : (
                  <Pagamento contratacao={contratacao} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-2 flex min-w-0 shrink-0 items-start gap-2">
        <p className={ROTULO_LINHA}>Contrato</p>
        <Contrato festaId={festaId} contratacao={contratacao} />
      </div>
      <Checklist contratacao={contratacao} />
    </li>
  );
}

export function ColunaFornecedores({
  festaId,
  contratacoes,
  servicos,
}: {
  festaId: string;
  contratacoes: Contratacao[];
  servicos: Servicos;
}) {
  const comValor = contratacoes.filter((c) => c.valorCentavos !== null);
  const total = comValor.reduce((s, c) => s + (c.valorCentavos ?? 0), 0);
  const pago = comValor.reduce(
    (s, c) => s + valorPago(c.valorCentavos ?? 0, c.parcelas, c.parcelasPagas),
    0,
  );
  const fornecedoresPorServico = new Map(servicos.map((s) => [s.id, s.fornecedores]));

  return (
    <Coluna
      id="fornecedores"
      titulo="Fornecedores"
      resumo={
        comValor.length > 0 && (
          <>
            <span className="whitespace-nowrap">
              Total <N>{formatarReais(total)}</N> ·
            </span>{" "}
            <span className="whitespace-nowrap">
              falta pagar <N>{formatarReais(total - pago)}</N>
            </span>
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo="Adicionar serviço">
          {(fechar) => (
            <FormCampos
              acao={contratarServico.bind(null, festaId)}
              campos={[
                {
                  nome: "servicoId",
                  rotulo: "Serviço",
                  tipo: "select",
                  opcoes: [
                    { valor: "", rotulo: "Escolha…" },
                    ...servicos.map((s) => ({ valor: s.id, rotulo: s.nome })),
                  ],
                },
                {
                  nome: "fornecedorId",
                  rotulo: "Fornecedor",
                  tipo: "select",
                  opcional: true,
                  travadoSe: (s) => !s.servicoId,
                  opcoes: (s) => {
                    if (!s.servicoId) return [{ valor: "", rotulo: "Escolha o serviço primeiro" }];
                    const doServico = fornecedoresPorServico.get(s.servicoId) ?? [];
                    return [
                      {
                        valor: "",
                        rotulo:
                          doServico.length === 0
                            ? "Nenhum fornecedor deste serviço na base"
                            : "Ainda não escolhido",
                      },
                      ...doServico.map((f) => ({ valor: f.id, rotulo: f.nome })),
                    ];
                  },
                },
              ]}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="nova-contratacao"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
        <p className="text-tinta-suave text-[0.8125rem]">
          Os serviços e fornecedores vêm da{" "}
          <Link
            href="/painel/fornecedores"
            className="text-foreground underline underline-offset-2"
          >
            base de fornecedores
          </Link>
          .
        </p>
      </div>

      {contratacoes.length === 0 ? (
        <Vazio>Nenhum serviço ainda. Adicione o buffet, a decoração, o DJ…</Vazio>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {contratacoes.map((c) => (
            <Linha
              key={c.id}
              festaId={festaId}
              contratacao={c}
              fornecedoresDoServico={fornecedoresPorServico.get(c.servico.id) ?? []}
            />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
