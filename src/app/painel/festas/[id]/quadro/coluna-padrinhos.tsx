"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, MessageCircle } from "lucide-react";
import { startTransition, useOptimistic, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatarTelefone, linkWhatsApp } from "@/lib/convidados/telefone";
import { paraCampos } from "@/lib/datas";
import type { Colunas } from "@/lib/festas/consultas";
import { BANDEJA, COR_RAIA, LINHA_ALTERNADA } from "@/lib/pasteis";
import { cn } from "@/lib/utils";

import { Adicionar, Coluna, FormCampos, MenuLinha, N, Vazio, type Campo } from "../colunas/pecas";
import {
  alternarPresencaPadrinho,
  criarPadrinho,
  definirLadoPadrinho,
  editarPadrinho,
  moverPadrinho,
  removerPadrinho,
} from "./actions";

type Padrinho = Colunas["padrinhos"][number];

type Papel = Padrinho["papel"];

// As duas listas de presença da página: mesma peça, textos de cada uma.
const TEXTOS: Record<
  Papel,
  {
    id: string;
    titulo: string;
    chegou: [um: string, varios: string];
    adicionar: string;
    exemplo: string;
    rotuloTelefone: string;
    vazio: string;
    lista: string;
    remocao: { titulo: string; saiDe: string; rotulo: string };
  }
> = {
  PADRINHO: {
    id: "padrinhos",
    titulo: "Padrinhos",
    chegou: ["padrinho chegou", "padrinhos chegaram"],
    adicionar: "Adicionar padrinho",
    exemplo: "Ex.: Carla e Rafael",
    rotuloTelefone: "WhatsApp",
    vazio:
      "Cadastre os padrinhos (ou casais de padrinhos). No dia da festa, toque em cada um quando chegar: a lista guarda a hora. Ela também sai no PDF do roteiro, para marcar no papel.",
    lista: "Lista de padrinhos",
    remocao: {
      titulo: "Tirar este padrinho?",
      saiDe: "sai da lista de padrinhos.",
      rotulo: "Tirar padrinho",
    },
  },
  PAJEM_DAMINHA: {
    id: "pajens",
    titulo: "Pajens e daminhas",
    chegou: ["chegou", "chegaram"],
    adicionar: "Adicionar pajem ou daminha",
    exemplo: "Ex.: Helena (daminha)",
    rotuloTelefone: "WhatsApp do responsável",
    vazio:
      "Cadastre os pajens e as daminhas. No dia da festa, toque em cada um quando chegar: a lista guarda a hora. Ela também sai no PDF do roteiro, para marcar no papel.",
    lista: "Lista de pajens e daminhas",
    remocao: {
      titulo: "Tirar da lista?",
      saiDe: "sai da lista de pajens e daminhas.",
      rotulo: "Tirar da lista",
    },
  },
};

const campos = (papel: Papel): Campo[] => [
  { nome: "nome", rotulo: "Nome", placeholder: TEXTOS[papel].exemplo, max: 120 },
  {
    nome: "telefone",
    rotulo: TEXTOS[papel].rotuloTelefone,
    tipo: "tel",
    inputMode: "tel",
    mono: true,
    opcional: true,
    placeholder: "(19) 99876-5432",
  },
];

// De quem o padrinho é (opcional): escolher já salva.
function SeletorLado({ padrinho }: { padrinho: Padrinho }) {
  const [lado, setLado] = useOptimistic(padrinho.lado);
  return (
    // A etiqueta mostra a escolha e tem a largura do próprio texto; o select fica invisível
    // por cima dela (um select sozinho teria sempre a largura da opção mais comprida).
    <span
      className={cn(
        "focus-within:outline-ring relative inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap focus-within:outline-2",
        // Azul do noivo, rosa da noiva; sem cor enquanto ela não disse.
        lado === "NOIVO"
          ? "bg-pastel-azul text-foreground"
          : lado === "NOIVA"
            ? "bg-pastel-rosa text-foreground"
            : "bg-card text-tinta-suave",
      )}
    >
      <span aria-hidden>
        {lado === "NOIVO" ? "Do noivo" : lado === "NOIVA" ? "Da noiva" : "De quem? (opcional)"}
      </span>
      <ChevronDown aria-hidden className="size-3.5" strokeWidth={2} />
      <select
        aria-label={`${padrinho.nome}: do noivo ou da noiva`}
        value={lado ?? ""}
        onChange={(e) => {
          const novo = (e.target.value || null) as Padrinho["lado"];
          startTransition(async () => {
            setLado(novo);
            await definirLadoPadrinho(padrinho.id, novo);
          });
        }}
        className="text-foreground absolute inset-0 size-full cursor-pointer opacity-0"
      >
        <option value="">Sem definir</option>
        <option value="NOIVO">Do noivo</option>
        <option value="NOIVA">Da noiva</option>
      </select>
    </span>
  );
}

function Linha({ padrinho }: { padrinho: Padrinho }) {
  const t = TEXTOS[padrinho.papel];
  const [editando, setEditando] = useState(false);
  const presente = padrinho.presenteEm !== null;

  if (editando) {
    return (
      <li className="bg-card my-1 rounded-lg px-3">
        <FormCampos
          acao={editarPadrinho.bind(null, padrinho.id)}
          campos={campos(padrinho.papel)}
          inicial={{ nome: padrinho.nome, telefone: padrinho.telefone ?? "" }}
          rotuloEnviar="Salvar"
          rotuloEnviando="Salvando…"
          prefixo={`padrinho-${padrinho.id}`}
          aoSalvar={() => setEditando(false)}
          aoCancelar={() => setEditando(false)}
        />
      </li>
    );
  }

  return (
    <li className={cn(LINHA_ALTERNADA, "flex items-center gap-1 pr-1")}>
      {/* A linha inteira marca a chegada: no dia ela usa no celular, com pressa. */}
      <form action={alternarPresencaPadrinho.bind(null, padrinho.id)} className="min-w-0 flex-1">
        <button
          type="submit"
          role="checkbox"
          aria-checked={presente}
          className="focus-visible:outline-ring hover:bg-card flex min-h-12 w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left focus-visible:outline-2"
        >
          <span
            aria-hidden
            className={cn(
              "flex size-5.5 shrink-0 items-center justify-center rounded-[4px] border",
              presente
                ? "bg-resolvida-forte border-resolvida-forte text-white"
                : "border-input bg-card",
            )}
          >
            {presente && <Check className="size-4" strokeWidth={2.5} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium break-words">{padrinho.nome}</span>
            <span className="text-tinta-suave block text-sm">
              {presente ? (
                <>
                  Chegou às{" "}
                  <span className="font-mono">{paraCampos(padrinho.presenteEm!).hora}</span>
                </>
              ) : padrinho.telefone ? (
                <span className="font-mono">{formatarTelefone(padrinho.telefone)}</span>
              ) : (
                "Sem WhatsApp"
              )}
            </span>
          </span>
        </button>
      </form>
      {padrinho.papel === "PADRINHO" && <SeletorLado padrinho={padrinho} />}
      {padrinho.telefone && (
        <Button
          asChild
          variant="ghost"
          className="text-tinta-suave hover:text-foreground size-11 sm:size-8"
        >
          <a
            href={linkWhatsApp(padrinho.telefone, "")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Conversar com ${padrinho.nome} no WhatsApp`}
          >
            <MessageCircle aria-hidden strokeWidth={1.75} />
          </a>
        </Button>
      )}
      <MenuLinha
        nome={padrinho.nome}
        aoEditar={() => setEditando(true)}
        remocao={{
          titulo: t.remocao.titulo,
          descricao: (
            <>
              {padrinho.nome} {t.remocao.saiDe}
            </>
          ),
          rotulo: t.remocao.rotulo,
          acao: removerPadrinho.bind(null, padrinho.id),
        }}
      />
    </li>
  );
}

// Linha de quando ela está mudando a ordem: só o nome e as setas de subir e descer.
function LinhaOrdem({
  padrinho,
  posicao,
  total,
  aoMover,
}: {
  padrinho: Padrinho;
  posicao: number;
  total: number;
  aoMover: (direcao: -1 | 1) => void;
}) {
  return (
    <li className={cn(LINHA_ALTERNADA, "flex min-h-12 items-center gap-1 pr-1 pl-2")}>
      <span className="text-tinta-suave w-6 shrink-0 font-mono text-sm">{posicao + 1}</span>
      <span className="min-w-0 flex-1 font-medium break-words">{padrinho.nome}</span>
      <Button
        type="button"
        variant="ghost"
        disabled={posicao === 0}
        onClick={() => aoMover(-1)}
        aria-label={`Subir ${padrinho.nome}`}
        className="size-11 sm:size-9"
      >
        <ArrowUp aria-hidden strokeWidth={1.75} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={posicao === total - 1}
        onClick={() => aoMover(1)}
        aria-label={`Descer ${padrinho.nome}`}
        className="size-11 sm:size-9"
      >
        <ArrowDown aria-hidden strokeWidth={1.75} />
      </Button>
    </li>
  );
}

// Lista de presença dos padrinhos (ou dos pajens e daminhas): no dia, ela marca cada um
// conforme chega.
export function ColunaPadrinhos({
  festaId,
  papel,
  padrinhos,
  className,
}: {
  festaId: string;
  papel: Papel;
  padrinhos: Padrinho[];
  className?: string;
}) {
  const t = TEXTOS[papel];
  const presentes = padrinhos.filter((p) => p.presenteEm !== null).length;
  const [ordenando, setOrdenando] = useState(false);
  // A troca aparece na hora; o servidor confirma em seguida.
  const [lista, trocar] = useOptimistic(
    padrinhos,
    (atual, { id, direcao }: { id: string; direcao: -1 | 1 }) => {
      const de = atual.findIndex((p) => p.id === id);
      const para = de + direcao;
      if (de < 0 || para < 0 || para >= atual.length) return atual;
      const nova = [...atual];
      [nova[de], nova[para]] = [nova[para], nova[de]];
      return nova;
    },
  );
  const mover = (id: string, direcao: -1 | 1) =>
    startTransition(async () => {
      trocar({ id, direcao });
      await moverPadrinho(id, direcao);
    });

  return (
    <Coluna
      id={t.id}
      titulo={t.titulo}
      className={className}
      resumo={
        padrinhos.length > 0 && (
          <>
            <N>{presentes}</N> de <N>{padrinhos.length}</N>{" "}
            {t.chegou[padrinhos.length === 1 ? 0 : 1]}
          </>
        )
      }
    >
      <div className="mt-(--linha)">
        <Adicionar rotulo={t.adicionar}>
          {(fechar) => (
            <FormCampos
              acao={criarPadrinho.bind(null, festaId, papel)}
              campos={campos(papel)}
              rotuloEnviar="Adicionar"
              rotuloEnviando="Adicionando…"
              prefixo={`novo-${t.id}`}
              aoCancelar={fechar}
            />
          )}
        </Adicionar>
      </div>

      {padrinhos.length === 0 ? (
        <Vazio>{t.vazio}</Vazio>
      ) : (
        <>
          {padrinhos.length > 1 && (
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                aria-pressed={ordenando}
                onClick={() => setOrdenando(!ordenando)}
                className={cn("h-9 px-2 text-sm font-medium", !ordenando && "text-tinta-suave")}
              >
                {ordenando ? (
                  <Check aria-hidden strokeWidth={2} />
                ) : (
                  <ArrowUpDown aria-hidden strokeWidth={1.75} />
                )}
                {ordenando ? "Concluir" : "Mudar a ordem"}
              </Button>
            </div>
          )}
          <ul className={cn(BANDEJA, COR_RAIA.cerimonia, "mt-1")} aria-label={t.lista}>
            {lista.map((p, i) =>
              ordenando && padrinhos.length > 1 ? (
                <LinhaOrdem
                  key={p.id}
                  padrinho={p}
                  posicao={i}
                  total={lista.length}
                  aoMover={(direcao) => mover(p.id, direcao)}
                />
              ) : (
                <Linha key={p.id} padrinho={p} />
              ),
            )}
          </ul>
        </>
      )}
    </Coluna>
  );
}
