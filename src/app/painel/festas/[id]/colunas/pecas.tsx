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

type Opcao = { valor: string; rotulo: string };

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "text" | "tel" | "time" | "number" | "select";
  placeholder?: string;
  opcional?: boolean;
  mono?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  max?: number;
  // Opções fixas, ou calculadas a partir dos outros selects (ex.: fornecedores do serviço).
  opcoes?: Opcao[] | ((selecionados: Record<string, string>) => Opcao[]);
  // Select travado enquanto a função devolver true (ex.: até escolher o serviço).
  travadoSe?: (selecionados: Record<string, string>) => boolean;
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
  const opcoesDe = (campo: Campo) =>
    typeof campo.opcoes === "function" ? campo.opcoes(selecionados) : (campo.opcoes ?? []);
  // Se as opções mudaram (outro serviço) e o valor escolhido sumiu, volta para a primeira.
  const valorDoSelect = (campo: Campo) => {
    const valor = selecionados[campo.nome];
    return opcoesDe(campo).some((o) => o.valor === valor) ? valor : "";
  };

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
                value={valorDoSelect(campo)}
                disabled={campo.travadoSe?.(selecionados)}
                onChange={(e) => setSelecionados((s) => ({ ...s, [campo.nome]: e.target.value }))}
                className="border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full min-w-0 rounded-md border px-2.5 text-base outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                {opcoesDe(campo).map((o) => (
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
    // Botão com contorno, para não passar despercebido como um texto solto.
    <Button
      type="button"
      variant="outline"
      onClick={() => setAberto(true)}
      className="bg-card h-11 self-start px-3.5 font-medium sm:h-10"
    >
      <Plus aria-hidden strokeWidth={2} />
      {rotulo}
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
  // Sem remoção (ex.: item em uso), o menu só oferece Editar.
  remocao?: {
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
          {remocao && (
            <DropdownMenuItem variant="destructive" onSelect={() => setRemovendo(true)}>
              <Trash2 aria-hidden strokeWidth={1.75} />
              Remover
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {remocao && (
        <ConfirmarExclusao
          aberto={removendo}
          aoMudar={setRemovendo}
          titulo={remocao.titulo}
          descricao={remocao.descricao}
          rotuloConfirmar={remocao.rotulo}
          rotuloEnviando="Removendo…"
          acao={remocao.acao}
        />
      )}
    </>
  );
}

// ── Novo item (checklist) ────────────────────────────────────────────────────

// Campo de uma linha para acrescentar um item a uma lista (ex.: checklist). Limpa ao salvar.
export function NovoItem({ acao, rotulo }: { acao: Acao; rotulo: string }) {
  const [estado, enviar, enviando] = useActionState(acao, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.sucesso) formRef.current?.reset();
  }, [estado.sucesso]);
  const erro = estado.erros?.texto ?? estado.erroGeral;

  return (
    <form ref={formRef} action={enviar} noValidate className="mt-1">
      <div className="flex items-center gap-2">
        <Input
          name="texto"
          maxLength={120}
          autoComplete="off"
          placeholder="Novo item"
          aria-label={rotulo}
          aria-invalid={erro ? true : undefined}
          className="bg-card h-9"
        />
        <Button type="submit" variant="outline" disabled={enviando} className="bg-card h-9">
          {enviando ? "…" : "Adicionar"}
        </Button>
      </div>
      {erro && <p className="text-destructive mt-1 text-sm leading-5">{erro}</p>}
    </form>
  );
}

// Lista vazia de uma coluna: explica o que entra ali.
export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="text-tinta-suave mt-1 text-sm leading-(--linha)">{children}</p>;
}
