"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "@/lib/formulario";
import { cn } from "@/lib/utils";

// ── Coluna ───────────────────────────────────────────────────────────────────

// Uma coluna da festa: folha lisa com título, resumo e o conteúdo (listas pautadas).
// É um container: o conteúdo se adapta à largura da coluna, não da tela.
export function Coluna({
  id,
  titulo,
  resumo,
  children,
  className,
}: {
  id: string;
  titulo: string;
  resumo?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`titulo-${id}`}
      className={cn(
        "folha folha-lisa @container pt-(--linha) pr-5 pb-(--linha) pl-[calc(var(--margem)+0.875rem)] leading-(--linha)",
        className,
      )}
    >
      <h2 id={`titulo-${id}`} className="text-lg font-semibold">
        {titulo}
      </h2>
      {resumo && <div className="text-tinta-suave text-sm leading-(--linha)">{resumo}</div>}
      {children}
    </section>
  );
}

// Número em destaque dentro de uma frase de resumo.
export function N({ children }: { children: React.ReactNode }) {
  return <strong className="text-foreground font-semibold">{children}</strong>;
}

// ── Formulário genérico ──────────────────────────────────────────────────────

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "text" | "tel" | "time" | "number" | "select";
  placeholder?: string;
  opcional?: boolean;
  mono?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  max?: number;
  opcoes?: { valor: string; rotulo: string }[];
  // Mostra o campo só quando a função, com os valores dos selects, devolver true.
  mostrarSe?: (selecionados: Record<string, string>) => boolean;
};

type Acao = (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;

export function FormCampos({
  acao,
  campos,
  inicial = {},
  rotuloEnviar,
  rotuloEnviando,
  prefixo,
  aoSalvar,
  aoCancelar,
}: {
  acao: Acao;
  campos: Campo[];
  inicial?: Record<string, string>;
  rotuloEnviar: string;
  rotuloEnviando: string;
  prefixo: string;
  aoSalvar?: () => void;
  aoCancelar?: () => void;
}) {
  const [estado, enviar, enviando] = useActionState(acao, {});
  const primeiroRef = useRef<HTMLInputElement>(null);
  const erros = estado.erros ?? {};
  const valores = estado.valores ?? inicial;

  // Selects são controlados para que campos condicionais (mostrarSe) reajam.
  const [selecionados, setSelecionados] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      campos.filter((c) => c.tipo === "select").map((c) => [c.nome, inicial[c.nome] ?? ""]),
    ),
  );

  useEffect(() => {
    if (!estado.sucesso) return;
    primeiroRef.current?.focus();
    aoSalvar?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.sucesso]);

  const id = (campo: string) => `${prefixo}-${campo}`;

  return (
    <form action={enviar} noValidate className="flex flex-col gap-3 pt-2 pb-(--linha)">
      {campos.map((campo, i) => {
        if (campo.mostrarSe && !campo.mostrarSe(selecionados)) return null;
        const erro = erros[campo.nome];
        const comum = {
          id: id(campo.nome),
          name: campo.nome,
          "aria-invalid": erro ? true : undefined,
          "aria-describedby": erro ? id(`erro-${campo.nome}`) : undefined,
        };
        return (
          <div key={campo.nome} className="flex flex-col gap-1.5">
            <Label htmlFor={comum.id}>
              {campo.rotulo}
              {campo.opcional && <span className="text-tinta-suave font-normal">(opcional)</span>}
            </Label>
            {campo.tipo === "select" ? (
              <select
                {...comum}
                value={selecionados[campo.nome]}
                onChange={(e) => setSelecionados((s) => ({ ...s, [campo.nome]: e.target.value }))}
                className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full min-w-0 rounded-md border px-2.5 text-base outline-none focus-visible:ring-3 md:text-sm"
              >
                {campo.opcoes?.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                {...comum}
                ref={i === 0 ? primeiroRef : undefined}
                type={campo.tipo ?? "text"}
                inputMode={campo.inputMode}
                placeholder={campo.placeholder}
                maxLength={campo.max}
                defaultValue={valores[campo.nome] ?? ""}
                autoComplete="off"
                className={cn("bg-card h-10", campo.mono && "font-mono")}
              />
            )}
            {erro && (
              <p id={id(`erro-${campo.nome}`)} className="text-destructive text-sm leading-5">
                {erro}
              </p>
            )}
          </div>
        );
      })}

      {estado.erroGeral && (
        <p role="alert" className="text-destructive text-sm leading-5">
          {estado.erroGeral}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={enviando} className="h-10 px-4">
          {enviando ? rotuloEnviando : rotuloEnviar}
        </Button>
        {aoCancelar && (
          <Button type="button" variant="ghost" onClick={aoCancelar} className="h-10">
            {aoSalvar ? "Cancelar" : "Fechar"}
          </Button>
        )}
      </div>
    </form>
  );
}

// ── Adicionar (abre o formulário sob demanda) ────────────────────────────────

// O formulário de adicionar fica fechado para a coluna caber na tela; ao abrir,
// continua aberto entre um item e outro (para cadastrar vários em sequência).
export function Adicionar({
  rotulo,
  children,
}: {
  rotulo: string;
  children: (fechar: () => void) => React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  if (aberto) return <div className="mt-2">{children(() => setAberto(false))}</div>;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => setAberto(true)}
      className="group -my-2 -ml-2.5 h-11 px-2.5 font-medium sm:my-0 sm:h-(--linha)"
    >
      <Plus aria-hidden strokeWidth={2} />
      <span className="grifo-ao-passar">{rotulo}</span>
    </Button>
  );
}

// ── Menu de cada linha ───────────────────────────────────────────────────────

export function MenuLinha({
  nome,
  aoEditar,
  remocao,
}: {
  nome: string;
  aoEditar: () => void;
  remocao: {
    titulo: string;
    descricao: React.ReactNode;
    rotulo: string;
    acao: () => Promise<void>;
  };
}) {
  const [removendo, setRemovendo] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Mais ações para ${nome}`}
            className="text-tinta-suave hover:text-foreground size-11 sm:size-7"
          >
            <MoreHorizontal aria-hidden strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="papel-solto w-44 rounded-[3px] ring-0">
          <DropdownMenuItem onSelect={aoEditar}>
            <Pencil aria-hidden strokeWidth={1.75} />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setRemovendo(true)}>
            <Trash2 aria-hidden strokeWidth={1.75} />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmarExclusao
        aberto={removendo}
        aoMudar={setRemovendo}
        titulo={remocao.titulo}
        descricao={remocao.descricao}
        rotuloConfirmar={remocao.rotulo}
        rotuloEnviando="Removendo…"
        acao={remocao.acao}
      />
    </>
  );
}

// Lista vazia de uma coluna: explica o que entra ali.
export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-suave mt-1 text-sm leading-(--linha)">{children}</p>;
}
