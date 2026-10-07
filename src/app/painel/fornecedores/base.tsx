"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import type { Servicos } from "@/lib/festas/consultas";
import { AREA_ROLAVEL, CARTAO, corDoServico, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import {
  Adicionar,
  FormCampos,
  MenuLinha,
  NovoItem,
  Vazio,
  type Campo,
} from "../festas/[id]/colunas/pecas";
import {
  adicionarItemModelo,
  criarFornecedor,
  criarServico,
  editarFornecedor,
  removerFornecedor,
  removerItemModelo,
  removerServico,
  renomearServico,
} from "./actions";

type Servico = Servicos[number];
type Fornecedor = Servico["fornecedores"][number];

const emFestas = (n: number) => (n === 1 ? "em 1 festa" : `em ${n} festas`);

function camposFornecedor(servicos: Servicos): Campo[] {
  return [
    { nome: "nome", rotulo: "Nome ou empresa", max: 120 },
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
      nome: "telefone",
      rotulo: "WhatsApp",
      tipo: "tel",
      inputMode: "tel",
      mono: true,
      opcional: true,
      placeholder: "(19) 99876-5432",
    },
  ];
}

// ── Fornecedores ─────────────────────────────────────────────────────────────

function LinhaFornecedor({
  fornecedor,
  servico,
  servicos,
}: {
  fornecedor: Fornecedor;
  servico: Servico;
  servicos: Servicos;
}) {
  const [editando, setEditando] = useState(false);
  const usos = fornecedor._count.contratacoes;

  if (editando) {
    return (
      <li className="bg-card rounded-lg px-3">
        <FormCampos
          acao={editarFornecedor.bind(null, fornecedor.id)}
          campos={camposFornecedor(servicos)}
          inicial={{
            nome: fornecedor.nome,
            servicoId: servico.id,
            telefone: fornecedor.telefone ?? "",
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
    <li className={cn(LINHA_ALTERNADA, "flex items-center justify-between gap-2 px-1.5 py-1.5")}>
      <div className="min-w-0">
        <p className="break-words">{fornecedor.nome}</p>
        <p className="text-tinta-suave text-sm">
          {fornecedor.telefone ? (
            <span className="font-mono whitespace-nowrap">
              {formatarTelefone(fornecedor.telefone)}
            </span>
          ) : (
            "Sem WhatsApp"
          )}
          {usos > 0 && <> · {emFestas(usos)}</>}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
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
          remocao={
            usos > 0
              ? undefined
              : {
                  titulo: "Remover este fornecedor?",
                  descricao: <>{fornecedor.nome} sai da base de fornecedores.</>,
                  rotulo: "Remover fornecedor",
                  acao: removerFornecedor.bind(null, fornecedor.id),
                }
          }
        />
      </div>
    </li>
  );
}

export function BaseFornecedores({ servicos }: { servicos: Servicos }) {
  const total = servicos.reduce((s, x) => s + x.fornecedores.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <Adicionar rotulo="Cadastrar fornecedor">
        {(fechar) => (
          <div className="folha max-w-xl px-5 py-2">
            <FormCampos
              acao={criarFornecedor}
              campos={camposFornecedor(servicos)}
              rotuloEnviar="Cadastrar"
              rotuloEnviando="Cadastrando…"
              prefixo="novo-fornecedor"
              aoCancelar={fechar}
            />
          </div>
        )}
      </Adicionar>

      {total === 0 && <Vazio>Nenhum fornecedor cadastrado ainda.</Vazio>}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {servicos
          .filter((s) => s.fornecedores.length > 0)
          .map((servico) => (
            // Altura fixa: com muitos fornecedores, a lista rola dentro do cartão.
            <section
              key={servico.id}
              aria-labelledby={`servico-${servico.id}`}
              className={cn(CARTAO, corDoServico(servico.id), "max-h-80")}
            >
              <h2 id={`servico-${servico.id}`} className="shrink-0 text-lg font-semibold">
                {servico.nome}{" "}
                <span className="text-tinta-suave font-mono text-sm font-normal">
                  {servico.fornecedores.length}
                </span>
              </h2>
              <ul className={cn(AREA_ROLAVEL, "mt-2")}>
                {servico.fornecedores.map((f) => (
                  <LinhaFornecedor
                    key={f.id}
                    fornecedor={f}
                    servico={servico}
                    servicos={servicos}
                  />
                ))}
              </ul>
            </section>
          ))}
      </div>
    </div>
  );
}

// ── Serviços e modelos de checklist ──────────────────────────────────────────

function CartaoServico({ servico }: { servico: Servico }) {
  const [editando, setEditando] = useState(false);
  const emUso = servico.fornecedores.length > 0 || servico._count.contratacoes > 0;

  return (
    // Altura fixa: o checklist rola dentro do cartão. Renomeando, o cartão cresce.
    <section
      aria-label={servico.nome}
      className={cn(CARTAO, corDoServico(servico.id), !editando && "h-96")}
    >
      {editando ? (
        <div className="bg-card -mx-1 shrink-0 rounded-lg px-3">
          <FormCampos
            acao={renomearServico.bind(null, servico.id)}
            campos={[{ nome: "nome", rotulo: "Nome do serviço", max: 60 }]}
            inicial={{ nome: servico.nome }}
            rotuloEnviar="Salvar"
            rotuloEnviando="Salvando…"
            prefixo={`servico-${servico.id}`}
            aoSalvar={() => setEditando(false)}
            aoCancelar={() => setEditando(false)}
          />
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{servico.nome}</h2>
          <MenuLinha
            nome={servico.nome}
            aoEditar={() => setEditando(true)}
            remocao={
              emUso
                ? undefined
                : {
                    titulo: `Remover ${servico.nome}?`,
                    descricao: <>O serviço e o modelo de checklist dele saem do painel.</>,
                    rotulo: "Remover serviço",
                    acao: removerServico.bind(null, servico.id),
                  }
            }
          />
        </div>
      )}

      <p className="text-tinta-suave shrink-0 text-[0.8125rem]">
        Checklist que vem pronto nas festas
      </p>
      {servico.itensModelo.length === 0 ? (
        <p className="text-tinta-suave mt-1 flex-1 text-sm">
          Sem itens. A festa começa com o checklist vazio.
        </p>
      ) : (
        <ul className={cn(AREA_ROLAVEL, "mt-1 flex flex-col")}>
          {servico.itensModelo.map((item) => (
            <li
              key={item.id}
              className={cn(
                LINHA_ALTERNADA,
                "group/item flex min-h-9 items-center justify-between gap-2 pl-1.5",
              )}
            >
              <span className="min-w-0 text-sm break-words">{item.texto}</span>
              <form action={removerItemModelo.bind(null, item.id)}>
                <button
                  type="submit"
                  aria-label={`Tirar "${item.texto}" do modelo`}
                  className="text-tinta-suave hover:text-foreground focus-visible:outline-ring hover:bg-card flex size-9 items-center justify-center rounded-sm focus-visible:outline-2 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X aria-hidden className="size-4" strokeWidth={1.75} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <div className="shrink-0">
        <NovoItem
          acao={adicionarItemModelo.bind(null, servico.id)}
          rotulo={`Novo item do checklist de ${servico.nome}`}
        />
      </div>
    </section>
  );
}

export function ServicosEChecklists({ servicos }: { servicos: Servicos }) {
  return (
    <div className="flex flex-col gap-6">
      <Adicionar rotulo="Novo serviço">
        {(fechar) => (
          <div className="folha max-w-xl px-5 py-2">
            <FormCampos
              acao={criarServico}
              campos={[
                {
                  nome: "nome",
                  rotulo: "Nome do serviço",
                  placeholder: "Ex.: Cerimonial",
                  max: 60,
                },
              ]}
              rotuloEnviar="Criar"
              rotuloEnviando="Criando…"
              prefixo="novo-servico"
              aoCancelar={fechar}
            />
          </div>
        )}
      </Adicionar>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {servicos.map((s) => (
          <CartaoServico key={s.id} servico={s} />
        ))}
      </div>
    </div>
  );
}
