"use client";

import { Check, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import type { Colunas } from "@/lib/festas/consultas";
import { centavosParaCampo, formatarReais } from "@/lib/festas/formatos";
import { cn } from "@/lib/utils";

import { alternarPagamento, criarFornecedor, editarFornecedor, removerFornecedor } from "./actions";
import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "./pecas";

type Fornecedor = Colunas["fornecedores"][number];

const CAMPOS: Campo[] = [
  { nome: "servico", rotulo: "Serviço", placeholder: "Ex.: Buffet, DJ, Fotógrafo", max: 80 },
  { nome: "nome", rotulo: "Nome ou empresa", max: 120 },
  {
    nome: "telefone",
    rotulo: "WhatsApp",
    tipo: "tel",
    inputMode: "tel",
    mono: true,
    opcional: true,
    placeholder: "(19) 99876-5432",
  },
  {
    nome: "valor",
    rotulo: "Valor contratado (R$)",
    inputMode: "decimal",
    mono: true,
    opcional: true,
    placeholder: "1.500,00",
  },
];

function Linha({ fornecedor }: { fornecedor: Fornecedor }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <li className="bg-card">
        <FormCampos
          acao={editarFornecedor.bind(null, fornecedor.id)}
          campos={CAMPOS}
          inicial={{
            servico: fornecedor.servico,
            nome: fornecedor.nome,
            telefone: fornecedor.telefone ?? "",
            valor: centavosParaCampo(fornecedor.valorCentavos),
          }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`fornecedor-${fornecedor.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    // Pautas inteiras: serviço e nome (largura toda, quebram se precisar); contato e ações;
    // valor e pagamento.
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
      <p className="col-span-2 break-words hyphens-auto">
        <span className="font-semibold">{fornecedor.servico}</span>{" "}
        <span className="text-tinta-suave">· {fornecedor.nome}</span>
      </p>
      <p className="text-tinta-suave text-sm leading-(--linha)">
        {fornecedor.telefone ? (
          <span className="font-mono whitespace-nowrap">
            {formatarTelefone(fornecedor.telefone)}
          </span>
        ) : (
          "Sem WhatsApp"
        )}
      </p>
      <div className="flex h-(--linha) items-center">
        {fornecedor.telefone && (
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
          nome={fornecedor.nome}
          aoEditar={() => setEditando(true)}
          remocao={{
            titulo: "Remover este fornecedor?",
            descricao: (
              <>
                {fornecedor.servico} · {fornecedor.nome} sai da festa. Itens do cronograma ligados a
                ele ficam sem responsável.
              </>
            ),
            rotulo: "Remover fornecedor",
            acao: removerFornecedor.bind(null, fornecedor.id),
          }}
        />
      </div>
      <div className="col-span-2 flex min-w-0 items-center gap-2 text-sm leading-(--linha)">
        {fornecedor.valorCentavos === null ? (
          <span className="text-tinta-suave">Valor a definir</span>
        ) : (
          <>
            <span className="font-mono">{formatarReais(fornecedor.valorCentavos)}</span>
            <form action={alternarPagamento.bind(null, fornecedor.id)}>
              <button
                type="submit"
                aria-pressed={fornecedor.pago}
                title={fornecedor.pago ? "Marcar como pendente" : "Marcar como pago"}
                className={cn(
                  "focus-visible:outline-ring hover:bg-muted flex items-center gap-1 rounded-sm px-1 text-[0.8125rem] leading-(--linha) focus-visible:outline-2",
                  fornecedor.pago ? "text-tinta-suave" : "text-foreground font-semibold",
                )}
              >
                {fornecedor.pago && <Check aria-hidden className="size-3.5" strokeWidth={2} />}
                {fornecedor.pago ? "Pago" : "Pendente"}
              </button>
            </form>
          </>
        )}
      </div>
    </li>
  );
}

export function ColunaFornecedores({
  festaId,
  fornecedores,
}: {
  festaId: string;
  fornecedores: Fornecedor[];
}) {
  const comValor = fornecedores.filter((f) => f.valorCentavos !== null);
  const total = comValor.reduce((s, f) => s + (f.valorCentavos ?? 0), 0);
  const pago = comValor.filter((f) => f.pago).reduce((s, f) => s + (f.valorCentavos ?? 0), 0);

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
        <Adicionar rotulo="Adicionar fornecedor">
          {(fechar) => (
            <FormCampos
              acao={criarFornecedor.bind(null, festaId)}
              campos={CAMPOS}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo="novo-fornecedor"
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {fornecedores.length === 0 ? (
        <Vazio>Buffet, decoração, DJ, fotógrafo… com o valor de cada um e o que já foi pago.</Vazio>
      ) : (
        <ul className="pautado" aria-label="Lista de fornecedores">
          {fornecedores.map((f) => (
            <Linha key={f.id} fornecedor={f} />
          ))}
        </ul>
      )}
    </Coluna>
  );
}
